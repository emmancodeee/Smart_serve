## 1. Announcements Page (student)

- [x] 1.1 In `public/js/announcement.js` `DOMContentLoaded` (~lines 85–93): replace the sequential `await loadHeaderUser()` then `await loadAnnouncements()` with a `Promise.all` so the `/api/auth/me` and `/api/auth/announcements` requests are dispatched concurrently; keep the existing redirect flows (admin→/admin/announcements, 401→login) intact.
- [x] 1.2 In `public/js/announcement.js`, prevent overlapping/concurrent duplicate requests: add an in-flight guard (or `AbortController` / request token) so the 30s `setInterval` (line ~655) and the `visibilitychange` refresh (line ~670) never fire two overlapping `GET /api/auth/announcements` requests, and a stale response never overwrites a fresher one. Do NOT remove the legit refresh behaviors.

## 2. Inventory Management

- [x] 2.1 In `public/js/inventory.js` `DOMContentLoaded` (~lines 213–223): stop gating inventory+summary on `await checkAuth()`. Dispatch `/api/auth/me`, `GET /api/auth/inventory`, and `GET /api/auth/inventory/analytics/summary` concurrently (e.g., `Promise.all`), and keep role-dependent rendering (Edit/Delete buttons at line ~539) gated on the resolved profile. Preserve the existing 30s summary poll.
- [x] 2.2 In `public/js/inventory.js` `loadInventory()` (~lines 475–505): avoid the double initial render — rely on `SmartFilter.create()`'s internal `apply()` as the single first render, and remove/fold the immediate follow-up `inventoryFilter.apply()` on unchanged data (keep `refreshOptions()` only where option lists must be rebuilt).

## 3. Admin SPA Boot (admin.html / admin.js)

- [ ] 3.1 In `public/js/admin.js` boot (~lines 1507–1543): when `/api/auth/me` already conveys the role, skip the fallback `/api/auth/admin/users` authorization probe entirely; when the probe must run, reuse its response as the users dataset instead of re-fetching in `loadUsers()` (~line 1579).
- [ ] 3.2 In `public/js/admin.js` `refreshData()` (~lines 1558–1566): ensure the datasets consumed by the shared analytics view (`allUsers`, `allRegistrations`, `allPickupConfirmations`) are loaded for the active role so the super admin dashboard no longer renders empty charts; keep the parallel `Promise.all` structure.
- [ ] 3.3 In `public/js/admin.js` boot: avoid the redundant second `loadAnalytics()` render triggered via the analytics filter's `onRender` during `initAdminFilters()` (~line 1554, onRender at ~4324) when the chart cache key is unchanged; verify charts still render once.

## 4. Admin SPA Post-Mutation Refetches

- [ ] 4.1 In `public/js/admin.js`: replace full-dataset `refreshData()` after single-record mutations with targeted refetches of only the affected dataset(s), matching the existing `Promise.all([...])` pair pattern used by the announcement/admin-account handlers. Scope: `deleteUser` (~2620), `updateRegistrationStatus` (~2490 only if the shared analytics data is not broadly affected — otherwise keep full refresh), `applyPickupConfirmationAction` (~2072). Keep legitimate refresh semantics.

## 5. Return Requests + Feedback Management

- [x] 5.1 In `public/js/admin-returns.js` `loadReturnRequests()` (~lines 7–25): remove the double initial render — `SmartFilter.create()` (via `initReturnFilter`) is the single initial render; remove/fold the immediate `returnFilter.apply()` on unchanged data.
- [x] 5.2 In `public/js/admin-returns.js` `viewReturnRequest()` (~line 178): populate the View modal from `allReturnRequests` by id when the full document is already present, instead of `GET /returns/:id`; keep the endpoint for records not in the loaded list.
- [x] 5.3 In `public/js/admin-feedback.js` `loadFeedbacks()` (~lines 7–24): remove the double initial render the same way as 5.1.
- [x] 5.4 In `public/js/admin-feedback.js` `viewFeedback()` (~line 162): populate the View modal from `allFeedbacks` by id instead of `GET /feedback/:id`; keep the endpoint fallback.

## 6. SmartFilter Shared Component

- [x] 6.1 In `public/js/admin-filters.js`: document/support a single-render contract — `SmartFilter.create()` performs the initial `apply()`, and provide a way for loaders to `refreshOptions()` after data replacement without forcing a second full table render on unchanged data. Do not change filter/sort/search/export behavior.

## 7. Backend Duplicate Auth Lookups

- [x] 7.1 In `services/adminService.js`, `services/inventoryService.js`, `announcementService.js`, `services/uniformRequestService.js`, `services/analyticsService.js`: replace the redundant `authenticateAdminRequest(req)` call inside each service function with a read of the `req.admin` already set by the middleware, keeping authorization identical. Only proceed where the middleware is guaranteed to run; otherwise keep the existing call.
- [x] 7.2 Verify no service function relies on the return value of the removed `authenticateAdminRequest` beyond role/admin identity, and that auth errors still return the same status codes.

## 8. Verification (all modules)

- [x] 8.1 Run `node --check` on every changed JS file (`public/js/announcement.js`, `inventory.js`, `admin.js`, `admin-returns.js`, `admin-feedback.js`, `admin-filters.js`, plus any changed backend service files).
- [ ] 8.2 Browser/Network-tab pass on Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management, Pickup Confirmations, and student pages: navigation stays instant; each page shows its complete data promptly; no duplicate requests, no avoidable sequential requests, no artificial delays, no overlapping concurrent loans of the same endpoint.
- [ ] 8.3 Confirm existing functionality unchanged: filtering, searching, sorting, export, CRUD, permissions (Super Admin read-only, Pickup Confirmations Admin-only, student data scoping), and that the sidebar/navigation was not modified.
- [ ] 8.4 Restore `refreshData()` (full) where a targeted refetch was verified to break shared analytics freshness; keep only the refetches that are provably safe.