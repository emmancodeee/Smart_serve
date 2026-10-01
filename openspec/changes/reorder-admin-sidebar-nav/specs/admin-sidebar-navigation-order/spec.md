## ADDED Requirements

### Requirement: Super admin-visible sidebar navigation order
The admin sidebar navigation SHALL display the following items, in order, for a super admin on every admin page: Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management.

#### Scenario: Super admin views the sidebar on the dashboard page
- **WHEN** a super admin is authenticated and views `admin.html`
- **THEN** the visible sidebar items appear in this order: Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management
- **AND** Request Management and Pickup Confirmations remain hidden (their existing visibility logic is unchanged)

#### Scenario: Super admin views the sidebar on the inventory page
- **WHEN** a super admin is authenticated and views `inventory.html`
- **THEN** the visible sidebar items appear in this order: Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management

#### Scenario: Regular admin views the sidebar
- **WHEN** a regular (non-super) admin is authenticated and views any admin page
- **THEN** all sidebar items that were previously visible remain visible (Admin Accounts remains hidden, Request Management and Pickup Confirmations remain visible)
- **AND** the ordering of the items they see matches the new physical ordering (Dashboard, Inventory Management, Return Requests, Request Management, Pickup Confirmations, Transactions, Announcements, Feedback Management)

### Requirement: Request Management and Pickup Confirmations retain their physical position
The Request Management and Pickup Confirmations sidebar items SHALL keep their physical positions (DOM positions 5 and 6) in the sidebar `<ul>` on every admin page that contains them.

#### Scenario: Item order in the sidebar list on a 9-item page
- **WHEN** the sidebar `<ul>` is inspected on `admin.html`, `inventory.html`, `admin-feedback.html`, or `admin-returns.html`
- **THEN** the physical item order is: Dashboard, Admin Accounts, Inventory Management, Return Requests, Request Management, Pickup Confirmations, Transactions, Announcements, Feedback Management

#### Scenario: Item order in the sidebar list on the requests page
- **WHEN** the sidebar `<ul>` is inspected on `admin-requests.html`
- **THEN** the physical item order is: Dashboard, Admin Accounts, Inventory Management, Transactions, Request Management, Pickup Confirmations, Announcements
- **AND** no items are added or removed relative to the current list

### Requirement: Unchanged item identity and behavior
The sidebar navigation reorder SHALL NOT modify any item's markup, identity, or behavior.

#### Scenario: Item markup is preserved exactly
- **WHEN** any sidebar item on any admin page is compared before and after the reorder
- **THEN** the icon SVG, label text, `href`, `data-view`, `li` ID, and `active` class are identical to the pre-reorder markup
- **AND** the only difference is the physical order of the `<li>` elements within the `<ul>`

#### Scenario: Role-based visibility still functions
- **WHEN** `applySuperAdminUI()` in `admin.js` or `applySuperAdminSidebar()` in `inventory.js` toggles an item's visibility by its element ID after the reorder
- **THEN** the item is found and its visibility is toggled correctly (visibility is referenced by ID, not by position)
- **AND** Admin Accounts remains hidden by default via its existing inline `style="display:none;"` regardless of its new position

### Requirement: No changes outside the sidebar lists
The reorder SHALL NOT affect any non-sidebar content, styles, or scripts.

#### Scenario: Only sidebar list order changes
- **WHEN** the five admin HTML files are diffed against their pre-reorder state
- **THEN** the only changed lines are the physical ordering of `<li>` elements inside the sidebar `<ul>` of each file
- **AND** no CSS file, JS file, route, header, page content, or data is modified