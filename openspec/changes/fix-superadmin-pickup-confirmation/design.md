## Context

SMARTSERVE is an Express server-rendered static app: the admin panel shells (`public/admin.html`, `public/admin-feedback.html`, `public/admin-returns.html`, `public/inventory.html`) ship the full sidebar in the HTML, and client JS (`public/js/admin.js`, `public/js/inventory.js`) makes the navigation role-aware after an asynchronous `GET /api/auth/me`.

The role model is a boolean on the admin document: `isSuperAdmin: true` = Super Admin, otherwise regular Admin. There are no free-form role strings, so no role normalization is needed.

**Root cause of the flash:** In every served admin shell the `pickupConfirmationsNavItem` `<li>` (and the equally Admin-only `registrationsNavItem`) has **no inline `display:none`**, so it paints visible for every user. Role is only known after `GET /api/auth/me` resolves; on the SPA shell (`admin.html`) `applySuperAdminUI()` additionally waits behind `await refreshData()` (four or more network fetches), so Super Admin sees the item for several seconds until it is hidden. On `/inventory` the item is never hidden for Super Admin at all (`inventory.js` only handles `adminAccountsNavItem`).

Role-aware view normalization already exists on the SPA shell (`normalizeViewForRole` → `getAllowedViews` → `ROLE_VIEW_KEYS`): a Super Admin's manual `/admin/pickup-confirmations` URL is rewritten to `/admin/dashboard`. But the backend `/api/auth/admin/pickup-confirmations*` routes are guarded only by `authenticateAdmin`, which admits either role.

## Goals / Non-Goals

**Goals:**
- Zero exposure of "Pickup Confirmations" to Super Admin — never, not even for one frame.
- Regular Admin keeps the feature, fully functional.
- Fix the root cause: correct role state handling, no timers, no CSS tricks, no default-to-Admin.
- Enforce Admin-only on the backend for the pickup-confirmation endpoints.
- Leave every other module's permissions and all sidebar design/order intact.

**Non-Goals:**
- No redesign of the sidebar, auth system, or role strings.
- No changes to how regular Admins use Pickup Confirmations.
- No changes to Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, or Feedback Management behavior.
- No migration of `admin-requests.html` / `requests-management.js` (legacy dead code, not served by `server.js`).

## Decisions

### D1 — Default Admin-only nav items to hidden in the HTML markup
Add inline `style="display:none;"` to `registrationsNavItem` and `pickupConfirmationsNavItem` in every served shell (`admin.html`, `admin-feedback.html`, `admin-returns.html`, `inventory.html`). `adminAccountsNavItem` already defaults hidden.

- **Why:** The flash is caused by markup that renders Admin-only items visible before JS runs. Defaulting them hidden removes the flash at the source, before any role data loads. Reveal is then an explicit, role-confirmed act.
- **Alternatives considered:**
  - Hiding the whole sidebar until role loads — rejected: blank sidebar on every load degrades UX for both roles and is a visible state change.
  - A `body.auth-ready` class gate with CSS — rejected: equivalent to hiding something after a delay class; also fragile and harder to keep consistent across four files.

### D2 — Reveal Admin-only items only from confirmed-role logic
In `admin.js` `applySuperAdminUI()`: when `isCurrentSuperAdmin()` is false (confirmed regular Admin), set `registrationsNavItem.style.display = ''` and `pickupConfirmationsNavItem.style.display = ''`; when true, keep them `'none'`. In `inventory.js` `applySuperAdminSidebar()`, mirror the same behavior so `/inventory` matches.

- **Why:** This inverts the dependency — visibility is now driven by a known role, never a default. There is no branch that assumes a role while loading.
- **Alternatives considered:**
  - Computing the initial nav from `localStorage` token decode — rejected: tokens are opaque here and the profile is fetched server-side; decoding risks stale/incorrect role data and duplicates the source of truth.

### D3 — Apply role-based nav as soon as role is confirmed
In `admin.js`, move `applySuperAdminUI()` to run right after the `/api/auth/me` admin-access check and profile assignment, **before** the `await refreshData()` preload. This makes the correct navigation appear immediately after role resolution instead of after all dashboard data finishes.

- **Why:** Removes the remaining window between role confirmation and navigation update, and matches the required flow (auth → profile → role → navigation → render).
- **Alternative considered:** Leave the call order as-is — rejected: leaving it after `refreshData()` needlessly delays correct navigation for both roles (Super Admin items appeared late, Admin items would too).

### D4 — Backend Admin-only guard on pickup-confirmation endpoints
Add a small guard applied to `GET /api/auth/admin/pickup-confirmations` and `PUT /api/auth/admin/pickup-confirmations/:id` that responds 403 when `req.admin.isSuperAdmin` is true. Place it in `routes/auth.js` (or a tiny middleware), reusing the existing `authenticateAdmin` result.

- **Why:** Frontend hiding is not security. The existing frontend role model treats pickup confirmations as Admin-only (`ROLE_VIEW_KEYS.admin` only, `refreshData()` never loads pickups for Super Admin), so a 403 is consistent with the system's intended permission model and does not break any Super Admin flow.
- **Alternatives considered:** Relying only on the SPA URL rewrite — rejected: the SPA only guards the shell view; an API client could still call the endpoints directly.
- **Verified non-impact:** No served frontend code fetches `/api/auth/admin/pickup-confirmations*` for a Super Admin (`refreshData()` excludes it; the pickup-completion chart reads the already-empty `allPickupConfirmations` array and is unchanged).

### D5 — Single source of role truth, no normalization
Keep using the existing `me.isSuperAdmin` boolean via `currentAdminProfile`. No role-string mapping is introduced because the system does not use role strings for authorization.

## Risks / Trade-offs

- **[Regular Admin items hidden until role loads]** → Reveal runs immediately after `/api/auth/me` (D3), and `/api/auth/me` is fast (single DB lookup). Net effect: Admin sees the item appear at the same moment the profile renders, with no functional loss.
- **[Backend 403 surprises Super Admin tooling]** → Confirmed nothing in the served app calls these endpoints for Super Admin; 403 only affects direct manual/API access, which is the intended denial.
- **[Hidden-by-default markup could leave item hidden if JS fails]** → If JS fails, the page's auth checks also fail (page redirects to login), so no user is left on a page with broken navigation; acceptable and no worse than today.
- **[admin-requests.html is dead code]** → Deliberately out of scope; it is not served by `server.js` and changing it risks nothing but adds noise.

## Migration Plan

1. Edit the four served HTML shells (D1).
2. Update `applySuperAdminUI()` in `public/js/admin.js` and its call site ordering (D2, D3).
3. Update `applySuperAdminSidebar()` in `public/js/inventory.js` (D2).
4. Add the backend guard in `routes/auth.js` (D4).
5. Verify: log in as Super Admin and Admin across all four pages, check first paint and refresh for the flash, test manual URL and API 403, and confirm other modules unchanged.
6. Rollback: revert the four HTML edits and the two JS/one route edits — changes are small and isolated.

## Open Questions

- None blocking. (If stakeholders prefer Super Admin to keep read-only pickup viewing in the future, only D4's scope would need revisiting; the sidebar behavior per requirements stays.)