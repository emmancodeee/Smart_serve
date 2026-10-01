## ADDED Requirements

### Requirement: Collapsible hamburger drawer sidebar

The system SHALL provide a consistent collapsible sidebar navigation across all student pages (dashboard, profile, schedule) and admin pages (admin, inventory).

#### Scenario: Hamburger icon visible below 1024px
- **WHEN** the viewport width is less than 1024px
- **THEN** the sidebar SHALL be hidden off-screen and a hamburger menu icon SHALL be visible in the top-left of the topbar

#### Scenario: Drawer opens on hamburger click
- **WHEN** the user taps the hamburger icon
- **THEN** the sidebar SHALL slide in from the left with a semi-transparent overlay behind it, covering at most 280px of the viewport width

#### Scenario: Drawer closes on overlay tap
- **WHEN** the drawer is open and the user taps the overlay area
- **THEN** the drawer SHALL slide back out and the overlay SHALL disappear

#### Scenario: Drawer closes on nav link tap
- **WHEN** the drawer is open and the user taps a navigation link
- **THEN** the drawer SHALL close automatically before navigation occurs

#### Scenario: Sidebar fixed at 1024px and above
- **WHEN** the viewport width is 1024px or greater
- **THEN** the sidebar SHALL be permanently visible in a fixed position on the left, and the hamburger icon SHALL be hidden

#### Scenario: Active nav link is visually distinguished
- **WHEN** a navigation link corresponds to the current page
- **THEN** that link SHALL have a distinct visual style (highlighted background or border) to indicate the active page

#### Scenario: Overlay prevents background interaction
- **WHEN** the drawer overlay is visible
- **THEN** the user SHALL NOT be able to scroll or interact with the main content behind the overlay

### Requirement: Consistent sidebar content across pages

The sidebar SHALL display the same set of navigation links regardless of which student or admin page the user is on, with only the active link changing.

#### Scenario: Student sidebar shows three links
- **WHEN** a student user views any student page (dashboard, profile, schedule)
- **THEN** the sidebar SHALL show links to User Profile, Registration, and Scheduler, in that order, with the current page's link highlighted

#### Scenario: Admin sidebar shows six links
- **WHEN** an admin user views any admin page (admin/dashboard, admin/accounts, admin/transactions, admin/registrations, admin/pickup-confirmations, inventory)
- **THEN** the sidebar SHALL show links to Dashboard, User Management, Transactions, Registration Management, Pickup Confirmations, and Inventory Management, with the current section's link highlighted
