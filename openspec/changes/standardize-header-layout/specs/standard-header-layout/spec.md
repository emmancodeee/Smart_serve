## ADDED Requirements

### Requirement: Consistent header structure across all modules

Every SmartServe page SHALL render the same header structure in the same left-to-right order, at every supported viewport width:

- Left: dynamic greeting followed by the live date/time clock
- Right (far end): user profile, then notification bell, then the burger menu button as the final element

The header SHALL NOT contain the current page/module name beside the greeting, and SHALL NOT contain a permanently visible search box or logout button.

#### Scenario: Super admin header order

- **WHEN** a super admin opens any admin page (Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management)
- **THEN** the header SHALL display the greeting on the left followed by the date/time, and on the right the profile, the bell, and the burger button as the final element

#### Scenario: Regular admin header order

- **WHEN** a regular admin opens any admin page (including Pickup Confirmations)
- **THEN** the header SHALL follow the same order: greeting, date/time on the left; profile, bell, burger on the right

#### Scenario: Student header order

- **WHEN** a student opens any student page (Dashboard, User Profile, Request, Announcements, Feedback, Returns)
- **THEN** the header SHALL follow the same order: greeting, date/time on the left; profile, bell, burger on the right

#### Scenario: No module name in header

- **WHEN** any page renders
- **THEN** the header SHALL NOT display a module/page name such as "Announcements", "Return Requests", or "Dashboard" beside the greeting; page titles remain only inside the page content

### Requirement: Role-based dynamic greeting without flash

The header greeting SHALL reflect the currently authenticated user and SHALL NOT show an incorrect role while loading. Super admin SHALL see "Welcome Super Admin"; regular admin SHALL see "Welcome Admin"; student SHALL see "Welcome, {FirstName}" using only the student's first name (never the full name).

#### Scenario: Super admin greeting

- **WHEN** a super-admin-authenticated user loads any admin page
- **THEN** the greeting SHALL read "Welcome Super Admin"

#### Scenario: Regular admin greeting

- **WHEN** an admin-authenticated user (not super admin) loads any admin page
- **THEN** the greeting SHALL read "Welcome Admin"

#### Scenario: Student greeting uses first name only

- **WHEN** a student-authenticated user loads any student page
- **THEN** the greeting SHALL read "Welcome, {FirstName}" where FirstName is only the student's first name, and SHALL NOT show the full name

#### Scenario: No incorrect greeting during load

- **WHEN** a page is loading and the authenticated user's role is not yet confirmed
- **THEN** the greeting SHALL NOT display "Welcome Admin" or any role-specific text as the default; it SHALL remain neutral until the confirmed profile arrives

### Requirement: Burger menu exposes Search and Logout

The burger/menu button at the far right of every header SHALL open a clean dropdown containing a functional Search field and a functional Logout action, styled consistently with the existing SmartServe design. The burger SHALL be the final element in the header. Existing search behavior and logout behavior SHALL be preserved.

#### Scenario: Burger opens menu

- **WHEN** the user clicks the burger button
- **THEN** a dropdown menu SHALL open below/beside the button containing "Search" (an input) and "Logout"

#### Scenario: Burger menu Search reuses page search

- **WHEN** the user types into the burger menu Search field on a page that has an existing search mechanism (SmartFilter toolbar search, `#announcementSearch`, or the module's search input)
- **THEN** the input SHALL drive that existing search mechanism so results update the same way, with no duplicate search system
- **WHEN** a page has no existing search mechanism and a visible data table exists
- **THEN** the burger Search SHALL filter that table's rows by matching text across cells

#### Scenario: Burger menu Logout preserves existing behavior

- **WHEN** the user clicks Logout in the burger menu
- **THEN** the existing logout logic runs unchanged: token cleared from localStorage and the user redirected to the login page

#### Scenario: Bell and profile remain visible

- **WHEN** any page renders
- **THEN** the notification bell SHALL remain visible immediately before the burger button, and the user profile/avatar SHALL remain visible before the bell; the burger SHALL NOT be placed before the bell

### Requirement: No header overlaps at any viewport

The header SHALL keep greeting, date/time, profile, bell, and burger from overlapping, clipping, or going outside the header at desktop, laptop, tablet, and mobile widths, using flex/grid layout (wrap and gap) and SHALL NOT use negative margins, z-index trickery, absolute positioning, or fixed heights to force separation.

#### Scenario: Desktop and laptop

- **WHEN** the viewport is desktop or laptop width
- **THEN** greeting, date/time, profile, bell, and burger SHALL be fully visible in order with no overlap or clipping

#### Scenario: Tablet and mobile

- **WHEN** the viewport is tablet or mobile width
- **THEN** the left area (greeting and date/time) SHALL wrap naturally without overlapping, secondary profile text SHALL hide as needed to reduce crowding, and the burger SHALL remain visible and accessible at the far right