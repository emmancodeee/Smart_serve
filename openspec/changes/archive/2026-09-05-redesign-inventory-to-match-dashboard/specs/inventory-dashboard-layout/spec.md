## ADDED Requirements

### Requirement: Inventory page uses admin-page body class
The inventory page SHALL use `admin-page` as its primary body class to inherit the dashboard's shared layout rules from `admin.css`.

#### Scenario: Body class activation
- **WHEN** the inventory page loads
- **THEN** the `<body>` element SHALL have class `admin-page` (not `inventory-page`)
- **AND** the page layout (sidebar, header, content shell) SHALL be identical to the dashboard

### Requirement: Sidebar matches dashboard sidebar exactly
The inventory page sidebar SHALL use the exact same HTML structure, CSS classes, and navigation items as the dashboard sidebar.

#### Scenario: Sidebar structure
- **WHEN** the inventory page renders
- **THEN** the sidebar SHALL be a `<nav id="sidebar" class="sidebar-shell">` element
- **AND** it SHALL contain the same logo section, navigation links with icons, and active state highlighting as the dashboard
- **AND** the Inventory Management nav link SHALL be marked as active

#### Scenario: Admin Accounts visibility
- **WHEN** the current user is a super admin
- **THEN** the Admin Accounts nav item SHALL be visible
- **WHEN** the current user is not a super admin
- **THEN** the Admin Accounts nav item SHALL be hidden

### Requirement: Header matches dashboard header exactly
The inventory page header SHALL use the exact same layout, structure, and component positioning as the dashboard header.

#### Scenario: Header layout
- **WHEN** the inventory page renders
- **THEN** the header SHALL display the page title "Inventory Management" on the left
- **AND** the subtitle "Track and manage inventory items, stock levels, and reorder points." SHALL appear below the title
- **AND** the clock widget, logout button, search input, notification bell, and admin profile SHALL be positioned identically to the dashboard

#### Scenario: Header element IDs preserved
- **WHEN** the inventory page renders
- **THEN** the following element IDs SHALL exist: `headerClock`, `logoutBtn`, `profileAvatar`, `profileName`
- **AND** JavaScript event listeners bound to these IDs SHALL continue to function

### Requirement: Summary cards use dashboard stat card pattern
The inventory summary cards SHALL use the dashboard's `.stat-card` component pattern with white background, consistent border-radius, and proper grid layout.

#### Scenario: Card display
- **WHEN** inventory data loads
- **THEN** four stat cards SHALL display: Total Items, Low Stock, Categories, Last Updated
- **AND** each card SHALL use the dashboard's `.stat-card` styling (white background, 20px border-radius, 24px padding, shadow)
- **AND** the cards SHALL be arranged in the dashboard's grid pattern (responsive: 5 cols desktop, 3 cols tablet, 2 cols mobile)

#### Scenario: Card values update dynamically
- **WHEN** inventory data is fetched from the API
- **THEN** the card values SHALL update with the actual inventory statistics
- **AND** the "Last Updated" card SHALL display the most recent update date

### Requirement: Read-only banner uses dashboard notification pattern
The super admin read-only information banner SHALL use the dashboard's notification/information component styling.

#### Scenario: Banner display for super admin
- **WHEN** the current user is a super admin
- **THEN** a banner SHALL display with the text "Super admin can review inventory data here, but inventory changes stay read-only."
- **AND** the banner SHALL use the dashboard's information component styling (border-radius, spacing, typography)

#### Scenario: Banner hidden for non-super admin
- **WHEN** the current user is not a super admin
- **THEN** the read-only banner SHALL be hidden

### Requirement: Inventory list uses admin-section card pattern
The inventory list section SHALL be wrapped in the dashboard's `.admin-section` card component with a dark navy header strip.

#### Scenario: Section container
- **WHEN** the inventory page renders
- **THEN** the inventory list SHALL be inside a `.admin-section` card
- **AND** the card header SHALL display "Inventory List" with subtitle "Manage all inventory items, stock levels, and availability."
- **AND** the "Add Item" button SHALL be positioned on the right side of the section header
- **AND** the card SHALL have the dashboard's section styling (28px border-radius, navy header strip, white content area)

### Requirement: Filter area uses dashboard input/button styles
The inventory filter controls SHALL use the dashboard's existing input, select, and button styling.

#### Scenario: Filter controls
- **WHEN** the inventory page renders
- **THEN** the filter area SHALL display search input, category dropdown, stock status dropdown, date added dropdown, time dropdown, sort button, reset button, search button, and export button
- **AND** all controls SHALL use the dashboard's input/button visual styles (border-radius, padding, colors, hover states)

#### Scenario: Filter functionality preserved
- **WHEN** a user interacts with any filter control
- **THEN** the existing filter logic SHALL execute without change
- **AND** the inventory table SHALL update to reflect the filtered results

### Requirement: Inventory table uses dashboard table styling
The inventory table SHALL use the dashboard's table container and header styling.

#### Scenario: Table container
- **WHEN** the inventory page renders
- **THEN** the table SHALL be inside a `.admin-table-wrap` container with horizontal scroll on mobile
- **AND** the table header SHALL use the dashboard's navy background with white text
- **AND** table rows SHALL have proper spacing, hover effects, and typography matching the dashboard

#### Scenario: Table columns
- **WHEN** the inventory table renders
- **THEN** it SHALL display columns: Item Name, Category, Quantity, Status, Last Updated, Actions
- **AND** status badges SHALL use the existing color system (green for In Stock, amber for Low Stock, red for Out of Stock)
- **AND** category badges SHALL use the existing category color system

### Requirement: Responsive behavior matches dashboard breakpoints
The inventory page SHALL respond to the same breakpoints as the dashboard for sidebar, header, cards, filters, and table.

#### Scenario: Desktop layout (>=1024px)
- **WHEN** the viewport is 1024px or wider
- **THEN** the sidebar SHALL be fixed at 270px width
- **AND** the content area SHALL have margin-left matching the sidebar width
- **AND** summary cards SHALL display in the dashboard's grid columns

#### Scenario: Tablet layout (<1024px)
- **WHEN** the viewport is less than 1024px
- **THEN** the sidebar SHALL be off-canvas (hidden, toggleable via hamburger)
- **AND** the content area SHALL have margin-left of 0
- **AND** summary cards SHALL reduce to 3 columns

#### Scenario: Mobile layout (<768px)
- **WHEN** the viewport is less than 768px
- **THEN** summary cards SHALL reduce to 2 columns
- **AND** the inventory list header SHALL stack vertically
- **AND** filter controls SHALL wrap appropriately
- **AND** the table SHALL horizontally scroll

### Requirement: All existing JS functionality preserved
All existing JavaScript functionality SHALL continue to work without modification to `inventory.js` or `admin-filters.js`.

#### Scenario: Data loading
- **WHEN** the inventory page loads
- **THEN** inventory data SHALL be fetched from the API and displayed in the table
- **AND** summary card values SHALL be computed from the fetched data

#### Scenario: CRUD operations
- **WHEN** an authorized user clicks "Add Item" or "Edit"
- **THEN** the corresponding modal SHALL open
- **AND** form submission SHALL send the correct API request
- **AND** the table SHALL refresh after successful operation

#### Scenario: Pagination and export
- **WHEN** the inventory data exceeds one page
- **THEN** pagination controls SHALL appear and function correctly
- **AND** the export button SHALL download a CSV of the current filtered data
