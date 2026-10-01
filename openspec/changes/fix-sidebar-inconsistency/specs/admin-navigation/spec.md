## ADDED Requirements

### Requirement: Admin sidebar SHALL be consistent across all admin pages
All admin-facing pages SHALL display the identical sidebar navigation with the same menu items in the same order: Dashboard, Announcements, Admin Accounts (hidden by default, visible to superadmin), Transactions, Request Management (visible to admin, hidden for superadmin), Pickup Confirmations (visible to admin, hidden for superadmin), Inventory Management.

#### Scenario: Sidebar displays on admin dashboard
- **WHEN** user navigates to `/admin/dashboard`
- **THEN** the sidebar SHALL show all 7 menu items listed in the canonical order

#### Scenario: Sidebar displays on inventory page
- **WHEN** user navigates to `/inventory`
- **THEN** the sidebar SHALL show the same menu items as the admin dashboard page

#### Scenario: Sidebar displays on uniform request management page
- **WHEN** user navigates to `/admin/requests`
- **THEN** the sidebar SHALL show the same menu items as the admin dashboard page

### Requirement: Active menu item SHALL highlight based on current page
The sidebar link corresponding to the current page SHALL have the `active` CSS class applied. All other sidebar links SHALL NOT have the `active` class.

#### Scenario: Dashboard link is active on dashboard page
- **WHEN** user navigates to `/admin/dashboard`
- **THEN** the Dashboard link SHALL have the `active` class

#### Scenario: Inventory link is active on inventory page
- **WHEN** user navigates to `/inventory`
- **THEN** the Inventory Management link SHALL have the `active` class

#### Scenario: No duplicate active links
- **WHEN** user navigates to any admin page
- **THEN** exactly one sidebar link SHALL have the `active` class

### Requirement: All sidebar links SHALL navigate to correct routes
Each sidebar link SHALL have an `href` attribute pointing to the correct route as defined in the Express server: `/admin/dashboard`, `/admin/announcements`, `/admin/accounts`, `/admin/transactions`, `/admin/registrations`, `/admin/pickup-confirmations`, `/inventory`.

#### Scenario: Clicking Dashboard navigates to admin dashboard
- **WHEN** user clicks the Dashboard link in the sidebar
- **THEN** browser navigates to `/admin/dashboard`

#### Scenario: Clicking Inventory navigates to inventory page
- **WHEN** user clicks the Inventory Management link in the sidebar
- **THEN** browser navigates to `/inventory`

### Requirement: Role-based visibility SHALL be preserved
Admin Accounts SHALL be hidden by default and only shown for superadmin users. Request Management and Pickup Confirmations SHALL be hidden for superadmin and shown for regular admin users.

#### Scenario: Admin Accounts hidden for regular admin
- **WHEN** a regular admin user views any admin page
- **THEN** the Admin Accounts link SHALL NOT be visible

#### Scenario: Admin Accounts visible for superadmin
- **WHEN** a superadmin user views any admin page
- **THEN** the Admin Accounts link SHALL be visible
