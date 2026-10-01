## Why

The "Pickup Confirmations" sidebar item is server-rendered **visible-by-default** in the static admin HTML shells, and the role of the signed-in account is only known asynchronously (`GET /api/auth/me` plus, on the SPA shell, a multi-request `refreshData()`). Super Admins therefore see "Pickup Confirmations" from first paint until `applySuperAdminUI()` finally hides it seconds later — the reported flash. The item must be Admin-only, with zero flash, and the route/API must be guarded so a Super Admin can never access it.

## What Changes

- Make `pickupConfirmationsNavItem` (and the other Admin-only `registrationsNavItem`) **hidden by default** in every served admin HTML shell, so no role flashes the item before auth+role resolve.
- Make the role-aware sidebar logic **reveal** those Admin-only items only after the account role is confirmed as a regular Admin (never default to Admin while role is unknown).
- Move role-based sidebar application to run as soon as the role is confirmed (before data preload), so the correct navigation renders immediately and consistently.
- Apply the same role gating to the `/inventory` page, whose standalone `inventory.js` currently never hides Pickup Confirmations from Super Admins (permanent leak, not just a flash).
- Enforce Admin-only access on the backend: return 403 for Super Admin on the `/api/auth/admin/pickup-confirmations*` endpoints, consistent with the existing frontend role model.
- No time-based hacks, no CSS-visibility tricks, no default-to-Admin fallback. Keep all existing sidebar design, ordering, and other module permissions unchanged.

## Capabilities

### New Capabilities
- `pickup-confirmations-role-access`: Pickup Confirmations is Admin-only. The sidebar item SHALL be hidden from Super Admin at all times (initial render, auth loading, role loading, refresh, navigation) and visible to Admin. Manual URL entry and backend API calls by Super Admin SHALL be denied per the existing authorization pattern.

### Modified Capabilities
<!-- No existing merged specs exist (openspec/specs/ is empty), so there are no requirement changes to existing capabilities. -->

## Impact

- `public/admin.html`, `public/admin-feedback.html`, `public/admin-returns.html`, `public/inventory.html` — default `display:none` on Admin-only nav items (`registrationsNavItem`, `pickupConfirmationsNavItem`).
- `public/js/admin.js` — `applySuperAdminUI()` reveals Admin-only items only for confirmed non-super admins; invoked immediately after role confirmation, before data preload.
- `public/js/inventory.js` — `applySuperAdminSidebar()` hides Admin-only items for Super Admin and reveals them for regular Admin on `/inventory`.
- `routes/auth.js` + a small guard (middleware/service helper) — reject Super Admin on pickup-confirmation endpoints with 403.
- Backend role detection is centralized (`req.admin.isSuperAdmin`); no changes to stored role strings, authentication, or other modules.