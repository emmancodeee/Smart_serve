## ADDED Requirements

### Requirement: Sidebar layout matches admin dashboard
The inventory page SHALL display a fixed left sidebar with the SmartServe logo, brand name, and navigation menu matching the admin dashboard's sidebar structure and styling.

#### Scenario: Sidebar renders with correct structure
- **WHEN** a user loads the inventory page
- **THEN** the sidebar SHALL display the SmartServe logo and "Smart Serve" brand text at the top
- **AND** the sidebar SHALL display navigation links for Dashboard, Announcements, Admin Accounts, Transactions, Request Management, Pickup Confirmations, Feedback Management, Return Requests, and Inventory Management
- **AND** the Inventory Management link SHALL be visually highlighted as the active page
- **AND** the sidebar SHALL use a deep navy/blue gradient background

#### Scenario: Sidebar is responsive
- **WHEN** a user views the inventory page on a screen narrower than 1024px
- **THEN** the sidebar SHALL collapse into an off-canvas drawer triggered by a hamburger menu button

### Requirement: Header layout matches admin dashboard
The inventory page SHALL display a horizontal header above the main content with left-aligned page title/subtitle and right-aligned search, notification, clock, profile, and logout controls.

#### Scenario: Header renders with correct structure
- **WHEN** a user loads the inventory page
- **THEN** the header left section SHALL display "Inventory Management" as the title
- **AND** the header left section SHALL display the subtitle text below the title
- **AND** the header right section SHALL display a search bar, notification bell, date/time clock, admin profile (avatar, name, role), and logout button
- **AND** the header SHALL use a white background with subtle border and shadow

#### Scenario: Header retains functionality
- **WHEN** a user interacts with header controls
- **THEN** the search bar SHALL filter inventory items
- **AND** the clock SHALL display the current date and time
- **AND** the logout button SHALL log the user out
- **AND** the notification bell SHALL be visible

### Requirement: Summary cards display in a 4-column row
The inventory page SHALL display four summary cards (Total Items, Low Stock, Categories, Last Updated) in a single horizontal row on desktop, with responsive wrapping on smaller screens.

#### Scenario: Summary cards render with data
- **WHEN** a user loads the inventory page
- **THEN** the "Total Items" card SHALL display the total inventory count from the API
- **AND** the "Low Stock" card SHALL display the low stock count from the API
- **AND** the "Categories" card SHALL display the number of unique categories
- **AND** the "Last Updated" card SHALL display the most recent update date

#### Scenario: Summary cards are responsive
- **WHEN** a user views the page at tablet width (768-1024px)
- **THEN** the summary cards SHALL display in a 2-column grid
- **AND** at mobile width (<768px) they SHALL display in a 1-column stack

### Requirement: Information banner displays below summary cards
The inventory page SHALL display a full-width read-only information banner below the summary cards with the message about super admin read-only access.

#### Scenario: Banner renders for super admin
- **WHEN** a super admin loads the inventory page
- **THEN** a banner SHALL display with the text "Super admin can review inventory data here, but inventory changes stay read-only."
- **AND** the banner SHALL use a light yellow/cream background with yellow border and information icon

### Requirement: Inventory list section uses clean card container
The inventory list section SHALL be contained inside a white card with the section title, subtitle, and export button.

#### Scenario: Inventory list header renders
- **WHEN** a user loads the inventory page
- **THEN** the inventory list section SHALL display "Inventory List" as the heading
- **AND** the subtitle "Manage all inventory items, stock levels, and availability." SHALL appear below
- **AND** a blue "Export" button SHALL be positioned on the right side
- **AND** the Export button SHALL trigger CSV export of filtered inventory data

### Requirement: Filter controls use horizontal layout
The inventory filter area SHALL display search, category, stock status, date, and time filters in a horizontal layout with consistent styling.

#### Scenario: Filters render with correct controls
- **WHEN** a user loads the inventory page
- **THEN** the filter area SHALL display a search input with placeholder "Search items by name, category, or unit of measure..."
- **AND** dropdown filters for Category, Stock Status, Date Added, and Time SHALL be visible
- **AND** Sort, Reset Filters, and Search buttons SHALL be available

#### Scenario: Filters are responsive
- **WHEN** a user views the page at mobile width (<768px)
- **THEN** the filter controls SHALL stack vertically and use full width

### Requirement: Inventory table uses navy header with white text
The inventory table SHALL display a header row with navy/blue background and white text, with clean spacious rows below.

#### Scenario: Table renders with correct columns
- **WHEN** a user loads the inventory page
- **THEN** the table SHALL display columns: Item Name, Category, Quantity, Status, Last Updated, Actions
- **AND** the table header SHALL use a navy/blue background with white semi-bold text
- **AND** each row SHALL display the item data with proper status badges

#### Scenario: Table status badges render correctly
- **WHEN** an inventory item has quantity 0
- **THEN** the status badge SHALL display "Out of Stock" with red styling
- **AND** when quantity is at or below reorder level, it SHALL display "Low Stock" with orange styling
- **AND** when quantity is above reorder level, it SHALL display "In Stock" with green styling

#### Scenario: Table is responsive
- **WHEN** a user views the table at mobile width (<768px)
- **THEN** the table SHALL be horizontally scrollable within its container

### Requirement: Page spacing and alignment are consistent
The inventory page SHALL use generous, consistent spacing between all major sections (sidebar, header, title, cards, banner, list, filters, table).

#### Scenario: Visual spacing is balanced
- **WHEN** a user views the inventory page at desktop width
- **THEN** all sections SHALL have consistent vertical spacing between them
- **AND** no elements SHALL touch each other or have excessive gaps
- **AND** all content SHALL align to a consistent maximum-width container
