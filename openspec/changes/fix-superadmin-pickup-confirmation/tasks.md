## 1. Default Admin-only sidebar items to hidden

- [x] 1.1 Add inline `style="display:none;"` to `pickupConfirmationsNavItem` in `public/admin.html`
- [x] 1.2 Add inline `style="display:none;"` to `registrationsNavItem` in `public/admin.html`
- [x] 1.3 Add inline `style="display:none;"` to `pickupConfirmationsNavItem` and `registrationsNavItem` in `public/admin-feedback.html`
- [x] 1.4 Add inline `style="display:none;"` to `pickupConfirmationsNavItem` and `registrationsNavItem` in `public/admin-returns.html`
- [x] 1.5 Add inline `style="display:none;"` to `pickupConfirmationsNavItem` and `registrationsNavItem` in `public/inventory.html`

## 2. Reveal Admin-only items only for confirmed regular Admin

- [x] 2.1 In `public/js/admin.js` `applySuperAdminUI()`, set `registrationsNavItem.style.display = canManageAdmins ? 'none' : ''` and `pickupConfirmationsNavItem.style.display = canManageAdmins ? 'none' : ''`
- [x] 2.2 In `public/js/inventory.js` `applySuperAdminSidebar()`, hide `registrationsNavItem` and `pickupConfirmationsNavItem` for Super Admin and reveal them for regular Admin
- [x] 2.3 Verify no code path defaults an unknown role to Admin (no `user?.role || 'Admin'`-style fallback exists in the sidebar gating)

## 3. Apply role-based navigation immediately after role confirmation

- [x] 3.1 Move the `applySuperAdminUI()` call in `public/js/admin.js` DOMContentLoaded to run right after the `/api/auth/me` admin-access check and `currentAdminProfile` assignment, before `await refreshData()`
- [x] 3.2 Confirm the final init order reads: token check → fetch `/api/auth/me` → role confirmed → `applySuperAdminUI()` → view applied → data preload

## 4. Enforce Admin-only access on the backend

- [x] 4.1 Add a guard (middleware or inline check reusing `req.admin`) that rejects Super Admin with 403 for `GET /api/auth/admin/pickup-confirmations`
- [x] 4.2 Apply the same guard to `PUT /api/auth/admin/pickup-confirmations/:id`
- [x] 4.3 Confirm the guard does not affect any other admin module endpoint

## 5. Verify the fix end to end

- [ ] 5.1 Super Admin login: confirm "Pickup Confirmations" never appears from first paint, and stays absent after 5-10 seconds
- [ ] 5.2 Super Admin refresh and navigation: confirm no flash on refresh or between Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management
- [ ] 5.3 Super Admin manual URL `/admin/pickup-confirmations`: confirm redirect to `/admin/dashboard`
- [ ] 5.4 Super Admin API call to pickup-confirmation endpoints: confirm 403
- [ ] 5.5 Admin login and refresh: confirm "Pickup Confirmations" is visible, clickable, and loads its data
- [ ] 5.6 Check browser Console/Network for any role, auth, or undefined-user errors
- [ ] 5.7 Confirm sidebar design, ordering, and all other module permissions are unchanged; grep `pickupConfirmationsNavItem` and `registrationsNavItem` to confirm each served HTML has exactly one default-hidden item