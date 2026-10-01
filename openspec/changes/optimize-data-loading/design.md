## Context

SmartServe is a vanilla-JS admin SPA (`public/js/admin.js`, 4378 lines) plus several standalone full-page modules (`inventory.html`, `announcement.html`, `admin-returns.html`, `admin-feedback.html`) sharing `admin.js` + `admin-filters.js`. All admin data is fetched client-side into module-level arrays; filtering/sorting/search/export are client-side only.

Investigation confirmed navigation is genuinely fast: `setAdminView()` (admin.js:410) is a pure DOM toggle and never fetches; sidebar clicks (admin.js:4343) and `popstate` (admin.js:1499) do no network. The slowness is entirely in how each page acquires its data. Root causes found:

- **Boot waterfall (admin SPA, admin.js:1510→1525→1549):** `GET /api/auth/me` resolves, then a fallback probe `GET /api/auth/admin/users` may run (fetching the entire users collection just to test authorization), and only then does `refreshData()` begin its parallel batch. The probe duplicates a full `loadUsers()` fetch (admin.js:1525 vs 1579).
- **Profile-gated inventory (inventory.js:214):** `await checkAuth()` (→ `/api/auth/me`) serializes before `loadInventory()` + `loadSummary()` (220–221). Neither depends on the profile except the final row render.
- **Profile-gated announcements (announcement.js:90–91):** `await loadHeaderUser()` then `await loadAnnouncements()` — a 2-request waterfall; requests are independent.
- **Double render after every load:** `SmartFilter.create()` self-applies (`admin-filters.js:727`), then loaders call `refreshOptions()`+`apply()` again (e.g. admin-returns.js:20–21, admin-feedback.js:19–21, inventory.js:494–496).
- **Superadmin dashboard gap (admin.js:1559–1562):** superadmins load `adminAccounts` but not `users`/`registrations`/`pickupConfirmations`, yet their shared analytics render from those (empty) arrays.
- **Redundant detail fetches:** Returns/Feedback Views re-fetch a full document already present in the loaded list.
- **Post-mutation full refetch storms:** several handlers call `refreshData()` (re-download 4–6 datasets) after a one-record change.
- **Duplicate auth on the backend:** every admin service re-calls `authenticateAdminRequest` (1 extra DB lookup per request) though the middleware already authenticated (`req.admin`).

## Goals / Non-Goals

**Goals:**
- Make each module's complete available data appear as promptly as possible after the page opens.
- Eliminate unnecessary sequential (`waterfall`) requests and duplicate/overlapping fetches.
- Parallelize independent requests (profile, module data, summary, etc.) with `Promise.all` where safe.
- Render each dataset immediately once its data is available; remove double-render patterns.
- Reduce backend per-request duplicate DB work without changing response shapes.

**Non-Goals:**
- No changes to the sidebar, navigation behavior, page UI design, or routing.
- No changes to authentication/authorization, permissions, or the Super Admin read-only rules.
- No database schema changes; no change to API response meaning/shape.
- No removal of legitimate refresh operations (mutation-triggered or polling).
- No hardcoding/faking/placeholder data.
- No artificial delays added, and no hiding of loading states.

## Decisions

### D1 — Remove the duplicate admin-probe; resolve role from `/api/auth/me`

The boot path only needs the fallback probe when `/me` doesn't already convey the role. The `/me` endpoint returns `isAdmin`/account info. Change the boot flow so: (a) when `/me` confirms the role, skip the probe entirely; (b) the probe result, when it must run, is reused as the users dataset instead of a second fetch.

**Why:** Eliminates up to two full-array downloads that serialize ahead of all module data (admin.js:1525 + 1579).
**Alternative rejected:** Firing the probe and `refreshData()` in parallel — unsafe because the probe's authorization outcome decides which parallel branch/sections are valid.

### D2 — Parallelize profile + module data on standalone pages

For `inventory.js` and `announcement.js`, issue `/api/auth/me` together with the module's independent data requests via `Promise.all`, then render after all resolve. Keep final row/header rendering gated on the profile, but stop serializing the network trip.

**Why:** Saves one full RTT of the initial paint on both pages; profile and module data do not depend on each other's payloads.

### D3 — Single initial render for SmartFilter loaders

`SmartFilter.create()` runs `apply()` → `onRender()` internally. Loaders should rely on that one initial render, and only re-apply when data actually changed (e.g., `onRender` handles the table). Remove the unconditional `refreshOptions()`+`apply()` calls that immediately follow creation.

**Why:** Halves table DOM rebuild work on every page open and reload without changing any filtering behavior.

### D4 — Load role's full dataset so shared analytics are complete (admin SPA)

Adjust `refreshData()` so the datasets consumed by the shared analytics section are loaded for the active role. This is a data-completeness fix — a superadmin's dashboard currently renders empty charts because `users`/`registrations`/`pickupConfirmations` are never fetched for them.

**Why:** The user reports "information missing a few seconds after opening" — this is a genuine gap where some data never renders, not just latency.

### D5 — Targeted refetches after mutations (keep legitimate refresh)

Replace `refreshData()` full storms after a one-record mutation with refetch of only the affected dataset(s), matching the existing targeted pattern already used by the announcement/admin-account handlers (Promise.all of the affected pair). Keep refresh semantics; scope the payload.

**Why:** Reduces post-action re-downloads from 4–6 datasets to 1–2.

### D6 — Render View modals from local cache

Returns and Feedback detail modals re-fetch a full document already in the loaded list. Populate the modal from the in-memory array by id. This is a latency win and removes a redundant round-trip; no data-shape change.

### D7 — Backend: use `req.admin` instead of re-authenticating

Admin services currently call `authenticateAdminRequest(req)` again even though `middlewares/authenticateAdmin` already ran it and put `req.admin` on the request. Replace the redundant service-layer authentication with a read of `req.admin`. Keeps authorization identical; removes one DB lookup per admin request.

**Why:** Every admin endpoint pays an extra DB lookup for nothing. This is the single largest backend latency factor affecting all admin page loads.

**Alternative deferred:** pagination/caching of unbounded list endpoints and moving the pickup-confirmation `updateMany` write off the GET path — these are larger, riskier backend changes better handled separately; out of scope here to keep this change focused.

## Risks / Trade-offs

- [Removing the unconditional post-create `refreshOptions()`/`apply()` could skip a needed first render if a loader's filter options depend on data that arrives after creation] → Mitigation: creation happens after the data is already in the array for these pages; verify each loader renders correctly after the change. `refreshOptions()` may be kept where option lists must be rebuilt, but avoid the redundant second `apply()`/table render.
- [Parallelizing profile + data on standalone pages could render tables before role is known, showing edit buttons incorrectly] → Mitigation: keep the final table render (which reads `isCurrentSuperAdmin()`) gated on the profile; only the network dispatch is parallelized.
- [Changing superadmin `refreshData()` may increase initial load data volume for superadmins] → Mitigation: accepts the added load because the dashboard is the landing view and currently shows empty analytics; the trade-off is correctness/completeness.
- [Targeting mutation refetches could leave stale related data if a mutation has hidden side effects] → Mitigation: only scope refetches where the mutation provably touches one logical dataset (the same pair pattern already used elsewhere); keep full `refreshData()` where side effects are broad (e.g., registration status approval).
- [Backend `req.admin` removal assumes the middleware always runs] → Mitigation: verify each edited service function is only reachable via the `authenticateAdmin`-guarded admin router; keep a guard that the middleware ran.

## Migration Plan

1. Frontend file-by-file (announcement.js, inventory.js → admin.js → admin-returns.js/admin-feedback.js → admin-filters.js), verifying each with a browser Network-tab pass.
2. Backend service-by-service removal of redundant `authenticateAdminRequest` after confirming `req.admin` is present.
3. Validate with `node --check`, a manual browser pass on every module, and the existing tests.

## Open Questions

- Whether notification/user-profile header calls should remain serialized on some pages for correctness — resolved in D2 (parallelize network, gate only final role-dependent render).
- Whether the pickup-confirmation GET-side `updateMany` should move off the read path — out of scope; flagged for a follow-up change.
