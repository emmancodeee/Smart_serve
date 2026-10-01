## 1. HTML Body & Root Structure

- [x] 1.1 Change `<body>` class from `inventory-page` to `admin-page` (keep other Tailwind classes)
- [x] 1.2 Verify the root wrapper `<div class="min-h-screen ... lg:flex">` matches dashboard structure
- [x] 1.3 Add `<a href="#main-content" class="sr-only ...">Skip to main content</a>` skip link if not present

## 2. Sidebar

- [x] 2.1 Replace the inventory sidebar `<nav>` HTML with the exact dashboard sidebar structure from `admin.html` (logo section + nav links)
- [x] 2.2 Mark the Inventory Management nav link as active (add `active` class + yellow border/bg)
- [x] 2.3 Verify `adminAccountsNavItem` has `style="display:none;"` for non-super-admin default
- [x] 2.4 Verify mobile menu button (`#mobileMenuBtn`) and overlay (`#sidebarOverlay`) are present

## 3. Header

- [x] 3.1 Replace the inventory header with the dashboard header structure: left side (clock + logout), right side (search + bell + profile)
- [x] 3.2 Preserve element IDs: `headerClock`, `logoutBtn`, `profileAvatar`, `profileName`
- [x] 3.3 Verify the header uses `.admin-header` class (not `.admin-header-white`)
- [x] 3.4 Verify header subtitle text: "Track and manage inventory items, stock levels, and reorder points."

## 4. Main Content Shell

- [x] 4.1 Ensure content is inside `<div id="main-content" class="main-content-shell w-full min-w-0 lg:ml-[270px]">`
- [x] 4.2 Ensure `<main>` uses `.admin-main` class with `max-w-[1280px]` and proper padding
- [x] 4.3 Verify the main content area follows the header correctly

## 5. Summary Cards

- [x] 5.1 Replace `.inventory-summary` grid with the dashboard's grid pattern (use `analytics-grid` or equivalent responsive grid)
- [x] 5.2 Replace `.summary-card` elements with `.stat-card` pattern (white background, 20px border-radius, 24px padding)
- [x] 5.3 Ensure 4 cards display: Total Items, Low Stock, Categories, Last Updated
- [x] 5.4 Preserve element IDs: `totalItems`, `lowStockItems`, `totalCategories`, `lastUpdatedDate`
- [x] 5.5 Verify card values update dynamically from API/client-side computation

## 6. Read-Only Banner

- [x] 6.1 Ensure `#inventoryReadOnlyNotice` uses `.admin-section` or dashboard notification styling
- [x] 6.2 Verify banner text: "Super admin can review inventory data here, but inventory changes stay read-only."
- [x] 6.3 Verify banner is hidden by default and shown only for super admin via `applySuperAdminSidebar()`

## 7. Inventory List Section

- [x] 7.1 Wrap the inventory list in an `.admin-section` card with dark navy header strip
- [x] 7.2 Place "Inventory List" title in the section header strip
- [x] 7.3 Place subtitle "Manage all inventory items, stock levels, and availability." below the title
- [x] 7.4 Position the "Add Item" button on the right side of the section header
- [x] 7.5 Preserve `#openAddModalBtn` element ID

## 8. Filter Area

- [x] 8.1 Ensure `#inventoryFilterContainer` is inside the `.admin-section` content area
- [x] 8.2 Verify filter controls inherit dashboard input/button styles
- [x] 8.3 Verify all filter dropdowns render: Category, Stock Status, Date Added, Time
- [x] 8.4 Verify Sort, Reset Filters, Search, and Export buttons are styled consistently

## 9. Inventory Table

- [x] 9.1 Replace `.inventory-table-wrap` with `.admin-table-wrap` container class
- [x] 9.2 Verify table header uses navy background with white text
- [x] 9.3 Verify table has horizontal scroll on mobile via `.table-scroll`
- [x] 9.4 Preserve `#inventoryTable`, `#inventoryBody` element IDs
- [x] 9.5 Verify status badges (In Stock, Low Stock, Out of Stock) render with correct colors
- [x] 9.6 Verify category badges render with correct styling

## 10. Pagination

- [x] 10.1 Verify `#paginationBar`, `#paginationInfo`, `#itemsShowing`, `#prevPageBtn`, `#nextPageBtn`, `#perPageSelect` are present
- [x] 10.2 Verify pagination styling is consistent with dashboard

## 11. CSS Cleanup

- [x] 11.1 Remove `.inventory-page .admin-header` overrides from inventory.css (no longer needed with `admin-page`)
- [x] 11.2 Remove `.inventory-summary` and `.summary-card` styles from inventory.css (replaced by dashboard stat cards)
- [x] 11.3 Remove `.inventory-table-wrap` styles from inventory.css (replaced by `.admin-table-wrap`)
- [x] 11.4 Remove `.inventory-page .admin-header .admin-profile` overrides from inventory.css
- [x] 11.5 Keep only inventory-specific styles: toast notifications, status badges, category badges, sort arrows, pagination, modals

## 12. Modals

- [x] 12.1 Verify `#addItemModal` and `#editModal` open/close correctly
- [x] 12.2 Verify modal styling is consistent with dashboard modals
- [x] 12.3 Preserve all form element IDs in both modals

## 13. Responsive Verification

- [x] 13.1 Test desktop (1920px): sidebar fixed 270px, content offset, cards in grid, table full width
- [x] 13.2 Test tablet (768px): sidebar off-canvas, cards 2-3 columns, filters wrap, table scrolls
- [x] 13.3 Test mobile (375px): sidebar hidden, cards stack, filters stack, table scrolls horizontally
- [x] 13.4 Verify no horizontal overflow at any breakpoint

## 14. Functionality Verification

- [x] 14.1 Verify auth check works (redirect to login if no token)
- [x] 14.2 Verify inventory data loads and displays in table
- [x] 14.3 Verify summary card values update dynamically
- [x] 14.4 Verify filters (category, stock status, date, time) work
- [x] 14.5 Verify search functionality works
- [x] 14.6 Verify CSV export downloads correctly
- [x] 14.7 Verify pagination (prev/next, per-page) works
- [x] 14.8 Verify Add Item modal opens, submits, and refreshes data
- [x] 14.9 Verify Edit modal opens, pre-fills, submits, and refreshes data
- [x] 14.10 Verify toast notifications appear for actions
- [x] 14.11 Verify clock updates in header
- [x] 14.12 Verify logout button redirects to login
