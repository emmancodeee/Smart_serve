## 1. Restructure Sidebar

- [x] 1.1 Replace the current inventory sidebar HTML with the admin dashboard sidebar structure (logo section, nav links with icons, consistent classes)
- [x] 1.2 Ensure the Inventory Management nav item is marked as active
- [x] 1.3 Verify Admin Accounts nav item visibility is controlled by existing JS (`applySuperAdminSidebar`)

## 2. Restructure Header

- [x] 2.1 Replace the current `admin-header-white` with a header matching the admin dashboard layout (left: title + subtitle, right: search + bell + clock + profile + logout)
- [x] 2.2 Keep all existing element IDs (`headerClock`, `logoutBtn`, `profileAvatar`, `profileName`, search input) so JS continues to work
- [x] 2.3 Verify the header clock, logout, and profile functionality remain intact

## 3. Redesign Summary Cards

- [x] 3.1 Restyle the four summary cards (Total Items, Low Stock, Categories, Last Updated) into a clean 4-column grid with white background, rounded corners, subtle shadow, and icons
- [x] 3.2 Ensure cards use equal height and consistent spacing
- [x] 3.3 Add responsive breakpoints: 4 columns on desktop, 2 on tablet, 1 on mobile
- [x] 3.4 Verify card values still update dynamically from API and client-side computation

## 4. Add Information Banner

- [x] 4.1 Create a full-width read-only information banner below the summary cards with yellow/cream background, yellow border, info icon, and dark text
- [x] 4.2 Ensure the banner only appears for super admin users (reuse existing `#inventoryReadOnlyNotice` logic)

## 5. Redesign Inventory List Section

- [x] 5.1 Create a white card container for the inventory list with title, subtitle, and Export button
- [x] 5.2 Position the Export button on the right side of the section header
- [x] 5.3 Verify the Export button retains its existing CSV export functionality

## 6. Redesign Filter Area

- [x] 6.1 Restyle the filter container to use a horizontal layout with consistent input styling (white background, light gray border, rounded corners)
- [x] 6.2 Ensure the search input has the correct placeholder text
- [x] 6.3 Verify all existing filter dropdowns (Category, Stock Status, Date Added, Time) render correctly
- [x] 6.4 Verify Sort, Reset Filters, and Search buttons are styled consistently
- [x] 6.5 Ensure filters stack vertically on mobile

## 7. Redesign Inventory Table

- [x] 7.1 Update the table header to use navy/blue background with white semi-bold text
- [x] 7.2 Ensure table rows are clean and spacious with proper padding
- [x] 7.3 Verify status badges (In Stock, Low Stock, Out of Stock) render with correct colors
- [x] 7.4 Verify category badges render with correct styling
- [x] 7.5 Ensure the table is horizontally scrollable on mobile
- [x] 7.6 Verify the Actions column shows "View only" for super admin

## 8. Responsive Design

- [x] 8.1 Test and fix header layout at desktop (1920px), tablet (768px), and mobile (375px)
- [x] 8.2 Test and fix sidebar collapse/drawer behavior on mobile
- [x] 8.3 Test and fix summary cards grid at all breakpoints
- [x] 8.4 Test and fix filter layout wrapping on tablet/mobile
- [x] 8.5 Test and fix table horizontal scroll on mobile
- [x] 8.6 Verify no horizontal overflow at any breakpoint

## 9. Final Verification

- [x] 9.1 Verify all existing JS functionality works: auth, data loading, filters, search, export, pagination, modals, toasts
- [x] 9.2 Verify the page visually matches the admin dashboard's design language
- [x] 9.3 Verify consistent spacing between all sections
- [x] 9.4 Verify no elements overlap or have excessive gaps
