## ADDED Requirements

### Requirement: No description banners in Inventory, Return Requests, and Feedback Management headers
The Inventory Management, Return Requests, and Feedback Management admin pages SHALL NOT display decorative description text in their section/panel headers beyond the page or section title.

#### Scenario: Admin opens Inventory Management
- **WHEN** an admin views the inventory page
- **THEN** the "Inventory List" heading is not followed by an explanatory subtitle such as "Manage all inventory items, stock levels, and availability."
- **AND** the heading is followed directly by the filter toolbar and table

#### Scenario: Admin opens Return Requests
- **WHEN** an admin views the Return Requests page
- **THEN** the "Return Management" eyebrow and "All Return Requests" title are not followed by the description "View and manage student return requests for modules, uniforms, and books."
- **AND** the filter toolbar, table, and actions remain fully present

#### Scenario: Admin opens Feedback Management
- **WHEN** an admin views the Feedback Management page
- **THEN** the "Feedback Management" eyebrow and "All Feedback" title are not followed by the description "View and manage student feedback submissions."
- **AND** the filter toolbar, table, and actions remain fully present

### Requirement: No leftover gaps or empty boxes after description removal
Removing the header descriptions SHALL NOT leave blank containers, empty styled boxes, or large unused vertical gaps on these pages.

#### Scenario: Page renders after content removal
- **WHEN** an admin views any of the three cleaned pages
- **THEN** the filters, table, and content sit flush with the page heading with normal spacing
- **AND** no empty banner, empty subtitle element, or oversized blank area is visible

### Requirement: Inventory read-only banner stays absent and permission stays intact
The inventory read-only instruction banner SHALL remain absent, and the existing super-admin read-only permission on inventory SHALL remain unchanged.

#### Scenario: Super admin opens Inventory Management
- **WHEN** a super admin views the inventory page
- **THEN** no read-only instruction banner is displayed
- **AND** the super admin remains read-only on inventory as before

#### Scenario: Super admin attempts an inventory mutation
- **WHEN** a super admin tries to add, edit, or delete an inventory item
- **THEN** the action is still blocked by the existing read-only permission
- **AND** the existing view-only warning message is still shown

### Requirement: Functionality and feedback are preserved on the three modules
Removing header descriptions SHALL NOT change any functionality, permission, filter, button, table, error, or empty-state behavior on the Inventory, Return Requests, and Feedback Management pages.

#### Scenario: Filters, export, and search on each module
- **WHEN** an admin uses search, filters, sorting, reset, or export on any of the three pages
- **THEN** the controls work exactly as before the description was removed

#### Scenario: Empty states and errors remain
- **WHEN** a module has no rows to display or an operation fails
- **THEN** the existing empty-state and error messages are still shown as before