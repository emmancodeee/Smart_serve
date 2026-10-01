## ADDED Requirements

### Requirement: Standard header element order
Every sidebar module page SHALL render its header with exactly two groups: a left group containing the Date & Time, then the Logout button; and a right group containing the Search bar, then the Admin Profile, then the Notification Bell as the last/far-right element.

#### Scenario: Header on Dashboard, Admin Accounts, Transactions, and Announcements pages
- **WHEN** any of the `admin.html` views (Dashboard, Admin Accounts, Transactions, Announcements) is rendered
- **THEN** the header left group shows the Date & Time clock followed by the Logout button
- **AND** the header right group shows the Search bar, then the Admin Profile, then the Notification Bell
- **AND** the Notification Bell is the final element of the header's right group and the rightmost element on the page's header

#### Scenario: Header on Inventory Management page
- **WHEN** the Inventory Management page is rendered
- **THEN** the header shows the same order: left `[Date & Time][Logout]`, right `[Search][Admin Profile][Notification Bell]`
- **AND** the Notification Bell is the rightmost header element

#### Scenario: Header on Return Requests page
- **WHEN** the Return Requests page is rendered
- **THEN** the header shows the same order: left `[Date & Time][Logout]`, right `[Search][Admin Profile][Notification Bell]`
- **AND** the Notification Bell is the rightmost header element

#### Scenario: Header on Feedback Management page
- **WHEN** the Feedback Management page is rendered
- **THEN** the header shows the same order: left `[Date & Time][Logout]`, right `[Search][Admin Profile][Notification Bell]`
- **AND** the Notification Bell is the rightmost header element

### Requirement: Notification Bell is the far-right element
The Notification Bell SHALL always be positioned at the extreme right end of the header and SHALL never appear between the Search bar and the Admin Profile, before the Search bar, or in the middle of the header.

#### Scenario: Bell placement relative to other controls
- **WHEN** inspecting the header on any sidebar module page
- **THEN** the rendered order is: Date & Time, Logout, Search, Admin Profile, Notification Bell
- **AND** the Notification Bell is the last child of its containing right-side group

#### Scenario: Visual separation from the Admin Profile
- **WHEN** the header is rendered
- **THEN** there is adequate horizontal spacing between the Admin Profile and the Notification Bell so that the two never touch or overlap

### Requirement: Date & Time on the left
The header SHALL display the existing dynamic/current date and time clock on the left side of the header, immediately before the Logout button, using the existing size, height, width, border, border radius, font, font weight, alignment, and spacing. The date/time SHALL NOT be hardcoded.

#### Scenario: Dynamic clock shown in the header-left group
- **WHEN** a sidebar module page loads
- **THEN** the header-left group shows the live clock and the Logout button immediately to its right
- **AND** the clock continues to update with the current date and time (example format: "Sat, Sep 05, 2026, 01:41:42 AM")

### Requirement: Logout button beside the Date & Time
The header SHALL place the existing Logout button immediately to the right of the Date & Time clock, keeping its existing yellow rounded styling, its existing sizing, its existing Logout behavior, and its existing authentication flow.

#### Scenario: Logout placement and function
- **WHEN** a sidebar module page loads
- **THEN** the Logout button is the second element of the header-left group
- **AND** clicking the Logout button performs the existing logout behavior unchanged

### Requirement: Search bar on the right before the Admin Profile
The header SHALL place the Search bar in the right group, before the Admin Profile and Notification Bell, keeping its existing search icon, placeholder, styling, and search behavior. The Search bar SHALL NOT overlap the Admin Profile or the Notification Bell.

#### Scenario: Search placement and behavior
- **WHEN** a sidebar module page loads
- **THEN** the Search bar appears as the first element of the header-right group
- **AND** the search input, placeholder text ("Search..."), and search icon are unchanged
- **AND** typing in the search bar preserves the existing search behavior for that page
- **AND** the Search bar does not overlap the Admin Profile or the Notification Bell

### Requirement: Admin Profile beside the Search bar
The header SHALL place the Admin Profile immediately to the right of the Search bar, keeping the existing avatar, admin name, "Administrator" role text, profile functionality, and styling.

#### Scenario: Profile placement and content
- **WHEN** a sidebar module page loads
- **THEN** the Admin Profile appears between the Search bar and the Notification Bell
- **AND** the avatar, profile name, and role text render as before

### Requirement: No module titles or descriptions in the header
The header SHALL contain only the six standard elements (Date & Time, Logout, Search, Admin Profile, Notification Bell). It SHALL NOT contain a "Welcome Admin" heading, an in-header page title, or a long module description such as "View and manage student return requests for modules, uniforms, and books." or "View and manage student feedback submissions."

#### Scenario: Clean compact header
- **WHEN** the Return Requests page loads
- **THEN** the header does not display the description "View and manage student return requests for modules, uniforms, and books."
- **AND** the header does not display a "Welcome Admin" heading or an in-header title

#### Scenario: Clean compact header on Feedback Management
- **WHEN** the Feedback Management page loads
- **THEN** the header does not display the description "View and manage student feedback submissions."
- **AND** the header does not display a "Welcome Admin" heading or an in-header title

### Requirement: No overlapping header elements
The header SHALL lay out all elements with proper flex/grid alignment and spacing so that no text, search box, bell, profile, logout button, or date/time ever overlaps another element or extends outside the header, at any viewport width.

#### Scenario: Desktop header alignment
- **WHEN** the header is rendered at desktop width
- **THEN** the left group (Date & Time, Logout) is aligned with the right group (Search, Admin Profile, Notification Bell) on the same header baseline
- **AND** no header element overlaps another header element or the page sidebar
- **AND** no header element extends outside the header container

### Requirement: Consistent header across all sidebar modules
All sidebar module pages SHALL present the same header structure, spacing, sizing, and styling so the header does not change layout when navigating between modules. No module SHALL have a different header arrangement.

#### Scenario: Navigate across modules
- **WHEN** the user navigates from one sidebar module page to another
- **THEN** the header renders identically (element order, groups, spacing, sizing, styling) on every page
- **AND** the sidebar design, order, icons, labels, and colors remain unchanged

### Requirement: Responsive header without overlap
The header SHALL remain responsive on desktop, tablet, and mobile widths by resizing or wrapping elements as needed, reusing the existing responsive header behavior, and never allowing overlapping elements. The sidebar and navigation SHALL NOT break.

#### Scenario: Tablet width
- **WHEN** the header is rendered at a tablet width
- **THEN** the header groups resize or wrap appropriately
- **AND** no element overlaps another and nothing is clipped

#### Scenario: Mobile width
- **WHEN** the header is rendered at a mobile width
- **THEN** the header elements adjust using the existing responsive behavior without overlapping
- **AND** the sidebar off-canvas navigation still functions as before

### Requirement: Existing functionality preserved
Standardizing the header SHALL NOT change page content, module functionality, the sidebar, the database, APIs, authentication, authorization, routes, search functionality, logout functionality, or notification functionality.

#### Scenario: No functional regressions
- **WHEN** the standard header is applied to a sidebar module page
- **THEN** page content and module functionality remain unchanged
- **AND** the sidebar links, search, logout, and notification badge behave exactly as before
- **AND** no backend, API, route, database, or authentication code was modified