## Why

The sidebar navigation changes between admin pages, showing different menu items depending on which page the user is on. This is confusing and breaks the expected admin panel experience where the layout should remain consistent across all pages.

## What Changes

- Update `public/inventory.html` sidebar to match `public/admin.html` sidebar exactly (add missing Announcements item, rename "Registration Management" to "Request Management")
- Update `public/admin-requests.html` sidebar to match `public/admin.html` sidebar exactly (replace 3-item nav with full admin nav)
- Ensure all sidebar links use the same `data-view` attributes, `id` attributes, and `href` values as `admin.html`
- Ensure the active/highlighted menu item reflects the current page correctly on inventory and admin-requests pages
- Fix the sidebar grid layout on inventory.html to use `grid-cols-1` (same as admin.html) instead of `grid-cols-2`

## Capabilities

### New Capabilities
- `admin-navigation`: Consistent sidebar navigation across all admin pages (Dashboard, Announcements, Admin Accounts, Transactions, Request Management, Pickup Confirmations, Inventory Management) with correct active-state highlighting

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `public/inventory.html` - sidebar HTML needs updating
- `public/admin-requests.html` - sidebar HTML needs updating
- `public/js/inventory.js` - may need adjustment to active-link logic
- `public/js/admin.js` - verify existing navigation logic works for inventory page
- `server.js` - no changes expected (routes already serve these pages correctly)
