## 1. Reorder Sidebar Navigation in admin.html

- [x] 1.1 Open `public/admin.html` sidebar `<ul>` (lines ~43-52) and reorder the `<li>` items to: Dashboard, Admin Accounts, Inventory Management, Return Requests, Request Management, Pickup Confirmations, Transactions, Announcements, Feedback Management
- [x] 1.2 Preserve every `<li>` exact markup (icon SVG, label, href, data-view, li ID, active class) — only the order changes
- [x] 1.3 Verify none of the `active` classes were added, removed, or relocated

## 2. Reorder Sidebar Navigation in inventory.html

- [x] 2.1 Open `public/inventory.html` sidebar `<ul>` (lines ~42-52) and reorder the `<li>` items to: Dashboard, Admin Accounts, Inventory Management, Return Requests, Request Management, Pickup Confirmations, Transactions, Announcements, Feedback Management
- [x] 2.2 Preserve every `<li>` exact markup — only the order changes
- [x] 2.3 Verify Inventory Management still carries the `active` class (as before the reorder)

## 3. Reorder Sidebar Navigation in admin-feedback.html

- [x] 3.1 Open `public/admin-feedback.html` sidebar `<ul>` (lines ~211-221) and reorder the `<li>` items to: Dashboard, Admin Accounts, Inventory Management, Return Requests, Request Management, Pickup Confirmations, Transactions, Announcements, Feedback Management
- [x] 3.2 Preserve every `<li>` exact markup — only the order changes
- [x] 3.3 Verify no item's `active` class changed (Feedback Management previously had none; confirm it still has none)

## 4. Reorder Sidebar Navigation in admin-returns.html

- [x] 4.1 Open `public/admin-returns.html` sidebar `<ul>` (lines ~206-216) and reorder the `<li>` items to: Dashboard, Admin Accounts, Inventory Management, Return Requests, Request Management, Pickup Confirmations, Transactions, Announcements, Feedback Management
- [x] 4.2 Preserve every `<li>` exact markup — only the order changes
- [x] 4.3 Verify no item's `active` class changed

## 5. Reorder Sidebar Navigation in admin-requests.html

- [x] 5.1 Open `public/admin-requests.html` sidebar `<ul>` (lines ~55-62) and reorder the existing `<li>` items to: Dashboard, Admin Accounts, Inventory Management, Transactions, Request Management, Pickup Confirmations, Announcements
- [x] 5.2 Do NOT add or remove any items — only the order of the existing items changes
- [x] 5.3 Verify Request Management (the current page) still carries the `active` class

## 6. Verification

- [x] 6.1 Diff each of the five HTML files against git HEAD: confirm the ONLY differences are `<li>` ordering inside the sidebar `<ul>`
- [x] 6.2 Confirm Admin Accounts item still has `style="display:none;"` at its new position in all five files
- [x] 6.3 Grep `announcementsNavItem`, `adminAccountsNavItem`, `transactionsNavItem`, `registrationsNavItem`, `pickupConfirmationsNavItem`, `inventoryNavItem` — each ID appears exactly once per file, unchanged
- [x] 6.4 Confirm no CSS or JS files were changed (`git status`)
- [x] 6.5 Visual spot-check: super admin view of admin.html shows Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management; regular admin view still shows Request Management and Pickup Confirmations