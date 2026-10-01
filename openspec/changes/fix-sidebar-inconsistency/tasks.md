## 1. Fix inventory.html sidebar

- [x] 1.1 Replace inventory.html sidebar `<ul>` contents with the exact 7-item nav from admin.html (Dashboard, Announcements, Admin Accounts, Transactions, Request Management, Pickup Confirmations, Inventory Management)
- [x] 1.2 Add `data-view` attributes to each link in inventory.html matching admin.html
- [x] 1.3 Add the `active` CSS class to the Inventory Management link in inventory.html
- [x] 1.4 Fix the `<ul>` grid to use `grid-cols-1` instead of `grid-cols-2`
- [x] 1.5 Verify Admin Accounts link has correct id (`inventoryUserManagementNavItem` → `adminAccountsNavItem`) and is hidden by default
- [x] 1.6 Remove the duplicate admin accounts nav item (old one with `inventoryUserManagementNavItem` id)

## 2. Fix admin-requests.html sidebar

- [x] 2.1 Replace admin-requests.html sidebar `<ul>` contents with the exact 7-item nav from admin.html
- [x] 2.2 Add `data-view` attributes to each link in admin-requests.html matching admin.html
- [x] 2.3 Add the `active` CSS class to the Request Management link in admin-requests.html
- [x] 2.4 Fix the `<ul>` grid to use `grid-cols-1` instead of `grid-cols-2`
- [x] 2.5 Update inventory.js `applySuperAdminSidebar()` to reference `adminAccountsNavItem` instead of `inventoryUserManagementNavItem`

## 3. Verify and test

- [x] 3.1 Open `/admin/dashboard` and confirm sidebar shows all 7 items (verified: admin.html has all 7 items)
- [x] 3.2 Open `/inventory` and confirm sidebar is identical to admin dashboard with Inventory highlighted (verified: inventory.html nav matches admin.html with `active` class on Inventory link)
- [x] 3.3 Open `/admin/requests` and confirm sidebar is identical to admin dashboard with Request Management highlighted (verified: admin-requests.html nav matches admin.html with `active` class on Request Management link)
- [ ] 3.4 Click each sidebar link and verify correct navigation (manual - run app and test)
- [ ] 3.5 Verify role-based visibility (Admin Accounts hidden for regular admin, visible for superadmin) (manual - run app and test)
