## 1. Profile cache plumbing

- [x] 1.1 In `public/js/app.js` login handler (~line 70, where `localStorage.setItem('token', data.token)` runs), also persist the authenticated admin profile from the login response (`data`) to `localStorage` under `smartserve_admin_profile` when the account has admin access. The stored value SHALL include at least `name`, `accountType`, `isAdmin`, and `isSuperAdmin`.

- [x] 1.2 In `public/js/admin.js`, add a small helper `readCachedAdminProfile()` that synchronously parses `localStorage.smartserve_admin_profile` (falls back to `null` on any parse error), and a `cacheAdminProfile(profile)` helper that writes it. Use `currentAdminProfile || readCachedAdminProfile()` wherever the role is consumed for sidebar visibility.

- [x] 1.3 In `public/js/inventory.js`, mirror the same `readCachedAdminProfile()`/`cacheAdminProfile()` helpers so `applySuperAdminSidebar()` can also use the cached role synchronously.

## 2. Synchronous sidebar application on page load

- [x] 2.1 In `public/js/admin.js` `applySuperAdminUI()` (~line 451): read the cached profile synchronously at the top (before any awaits) and use it (via `isCurrentSuperAdmin()` falling back to the cache) to set `adminAccountsNavItem`, `registrationsNavItem`, `pickupConfirmationsNavItem`, and `inventoryNavItem` display states. The sidebar must be correct on the first synchronous pass, before `/api/auth/me` completes.

- [x] 2.2 In `public/js/inventory.js` `applySuperAdminSidebar()` (~line 113): same change — resolve the role from the cache synchronously and apply the three role-gated nav items (plus `#openAddModalBtn`) immediately.

- [x] 2.3 When the async `/api/auth/me` succeeds in `admin.js` (DOMContentLoaded, after `currentAdminProfile` is assigned) and in `inventory.js` `checkAuth()`, call `cacheAdminProfile(me)` (or equivalent) so the cache stays fresh, then re-run `applySuperAdminUI()`/`applySuperAdminSidebar()` for the authoritative re-sync. Authoritative server value wins over cache.

- [x] 2.4 Update logout/401 flows in `admin.js` (`performLogout` ~line 438 and the 401 catch ~line 1548) and `inventory.js` (`logout` ~line 262 and the `!response.ok` branch ~line 241) to also `localStorage.removeItem('smartserve_admin_profile')`.

## 3. Verification

- [x] 3.1 Confirm `GET /api/auth/me` still runs and remains authoritative on every admin page — the cache only pre-paints; it never skips the server check. Confirm no console errors.

- [x] 3.2 Browser: log in as Super Admin. Visit Dashboard → Admin Accounts → Inventory Management → Return Requests → Transactions → Announcements → Feedback Management → Dashboard. Verify no sidebar item disappears, collapses, jumps, resizes, or reflows during any transition; only the active item changes. Admin Accounts always visible; Pickup Confirmations and Request Management never appear for Super Admin.

- [x] 3.3 Browser: log in as a regular Admin. Visit the same navigation chain. Verify Request Management and Pickup Confirmations always visible, Admin Accounts never appears, and the sidebar stays stable throughout.

- [x] 3.4 Verify responsive behavior is unchanged: the sidebar still opens/closes via the mobile menu toggle (optional side-by-side check on a narrow viewport), and the previous white-header page (admin-requests.html) is unaffected.