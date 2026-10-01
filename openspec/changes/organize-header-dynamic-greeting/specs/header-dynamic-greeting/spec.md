## ADDED Requirements

### Requirement: Role-aware dynamic greeting
The header SHALL display a greeting derived from the currently authenticated user's confirmed role. Super Admin SHALL see `Welcome Super Admin`, Admin SHALL see `Welcome Admin`, and Student SHALL see `Welcome, [First Name]` where `[First Name]` is derived from the authenticated student's existing profile data (e.g. `firstName` or the first token of the stored full name). The greeting SHALL never be hardcoded for all users and SHALL update when a different user logs in.

#### Scenario: Super Admin greeting
- **WHEN** a Super Admin is authenticated and views any admin page
- **THEN** the header greeting reads `Welcome Super Admin`

#### Scenario: Admin greeting
- **WHEN** a regular Admin is authenticated and views any admin page
- **THEN** the header greeting reads `Welcome Admin`

#### Scenario: Student greeting uses first name only
- **WHEN** a Student with full name `Djaninne Marie Santos` is authenticated and views any student page
- **THEN** the header greeting reads `Welcome, Djaninne`
- **AND** the greeting SHALL NOT contain the full name or the literal text `Welcome Student`

#### Scenario: Greeting changes on role change
- **WHEN** the application logs out and a user with a different role signs in
- **THEN** the greeting SHALL reflect the newly authenticated user's role

### Requirement: Greeting renders only after user confirmation
The greeting SHALL remain neutral (empty or non-role placeholder) while authentication and user data are loading, and SHALL render exactly once with the correct role/name after the authenticated user is confirmed. No code path SHALL default to an Admin greeting or an assumed role while the user is unknown.

#### Scenario: No greeting flash during load
- **WHEN** a page loads and the authenticated user's data is still being fetched
- **THEN** the greeting element SHALL not display a role-specific or name-specific greeting
- **AND** once the user data resolves, the correct greeting SHALL appear with no intermediate wrong greeting

#### Scenario: Refresh preserves correct greeting
- **WHEN** a user refreshes any page
- **THEN** no incorrect greeting appears at any point during the refresh

### Requirement: Header left-right organization
The header SHALL divide into two clearly separated groups. The left group SHALL contain the dynamic greeting and the current page/module title as separate elements (plus existing clock/logout arranged without overlap). The right group SHALL contain, in this exact order, the Search bar, the user profile block (avatar + name + role), and the Notification Bell as the far-right element. No element SHALL overlap another.

#### Scenario: Admin header layout
- **WHEN** an Admin or Super Admin views any admin page
- **THEN** the right side order is Search, then avatar/name/role, then the Notification Bell last
- **AND** the left side shows greeting and page title as separate elements

#### Scenario: Student header layout
- **WHEN** a Student views any student page
- **THEN** the right side order is Search, then avatar/name/role, then the Notification Bell last
- **AND** the left side shows the greeting and page title as separate elements

#### Scenario: Bell is always far right
- **WHEN** the header is rendered at any supported width
- **THEN** the Notification Bell is the final element on the right and is never placed between Search and the profile or on the left

### Requirement: Page title in header
The current module/page title SHALL appear in the header as its own element, separate from the greeting. Long descriptive subtitles SHALL NOT be placed beside the page title in the header; existing in-content descriptions remain in their sections.

#### Scenario: Title reflects the module
- **WHEN** a user navigates to Return Requests
- **THEN** the header shows the greeting on the left and the page title `Return Requests` beside it

#### Scenario: Title changes with navigation
- **WHEN** a Super Admin navigates from Dashboard to Inventory Management
- **THEN** the header page title SHALL update to `Inventory Management` while the greeting remains unchanged

### Requirement: Responsive non-overlapping header
The header SHALL render without overlap, clipping, or misalignment on desktop, laptop, tablet, and mobile widths. When space is insufficient, the header groups SHALL wrap or reflow naturally instead of overlapping.

#### Scenario: Narrow viewport reflow
- **WHEN** the viewport narrows so the header cannot fit on one line
- **THEN** header groups wrap to additional lines without text, profile, search, bell, clock, or logout overlap or clipping

### Requirement: Existing header identity preserved
The change SHALL preserve the existing SmartServe visual identity — navy header, yellow/blue accents, existing search bar, avatar, notification bell, typography, spacing, and the sidebar/page layouts. Only header organization, the dynamic greeting, and the added student header elements SHALL change. The sidebar SHALL remain unchanged, including Admin-only Pickup Confirmations.

#### Scenario: Sidebar and modules unchanged
- **WHEN** a user views any page after the header change
- **THEN** the sidebar ordering, role visibility (including Admin-only Pickup Confirmations), and all module functionality remain unchanged

#### Scenario: Search and bell remain functional
- **WHEN** a user uses the Search bar or Notification Bell in the reorganized header
- **THEN** their existing behavior is preserved