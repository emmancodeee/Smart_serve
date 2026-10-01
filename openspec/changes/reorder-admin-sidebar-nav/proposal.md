## Why

The admin sidebar navigation items are in an order that does not reflect the admin team's preferred prioritization. Administrative accounts, inventory management, and return requests should be more prominent, while announcements and feedback should be lower in the menu. The target ordering is defined for the super admin view (the super admin is the primary user of the affected pages for now). This change reorders the existing sidebar items without altering any styling, functionality, or content.

## What Changes

- Redirect the sidebar navigation `<li>` item list across all admin pages so that the **super admin-visible order** becomes:
  1. Dashboard
  2. Admin Accounts
  3. Inventory Management
  4. Return Requests
  5. Transactions
  6. Announcements
  7. Feedback Management
- **Request Management and Pickup Confirmations are kept in their current spots** (DOM positions 5 and 6 in the four main 9-item pages). They are hidden (`display:none`) for super admins, so they do not appear in the super admin-visible order above, but their physical positions in the `<ul>` never change.
- Resulting physical order for the 9-item pages (`admin.html`, `inventory.html`, `admin-feedback.html`, `admin-returns.html`):
  1. Dashboard
  2. Admin Accounts
  3. Inventory Management
  4. Return Requests
  5. Request Management (kept in place)
  6. Pickup Confirmations (kept in place)
  7. Transactions
  8. Announcements
  9. Feedback Management
- The 7-item `admin-requests.html` page (no Return Requests / Feedback Management items) gets the analogous reorder of the items it does contain, again keeping Request Management and Pickup Confirmations at their current DOM positions 5 and 6.
- Every sidebar item's markup (icon SVG, label text, href, data-view, li ID, active class) is preserved **exactly** — only the physical order of the `<li>` elements in the `<ul>` changes
- The `applySuperAdminUI()` visibility logic in `admin.js` and `applySuperAdminSidebar()` in `inventory.js` continue to work because they reference items by ID, not by position
- The hidden-by-default Admin Accounts item (`style="display:none;"`) moves to second position; it will still be shown only for super admins, exactly as before
- **Scope**: the reorder applies to the shared sidebar DOM (visible to both roles). No role-conditional JS reordering is introduced because the core constraint is "reorder only, do not modify functionality."

## Capabilities

### New Capabilities
- `admin-sidebar-navigation-order`: The defined ordering of the admin sidebar navigation items across all admin pages

### Modified Capabilities

## Impact

- **Files affected** (sidebar `<ul>` nav item reorder only, no style/function changes):
  - `public/admin.html` (nav item list, lines ~43-52)
  - `public/inventory.html` (nav item list, lines ~42-52)
  - `public/admin-feedback.html` (nav item list, lines ~211-221)
  - `public/admin-returns.html` (nav item list, lines ~206-216)
  - `public/admin-requests.html` (nav item list, lines ~55-62; contains fewer items — only the items present are reordered)
- **No changes** to CSS, JS visibility logic, routes, page content, or any data
- **No breaking changes**: All hrefs, data-view attributes, li IDs, icons, labels, and active-state classes remain unchanged