## ADDED Requirements

### Requirement: Single student page title header
Every student-side module page SHALL render exactly ONE page title/header section. That section SHALL be a single blue rounded title bar placed directly below the main top header, spanning the full width of the content container. The title bar SHALL NOT overlap the main header, and there SHALL be consistent vertical spacing between the main header and the bar, and between the bar and the content below.

#### Scenario: One title bar per student page
- **WHEN** a student loads Dashboard, User Profile, Request, Announcements, Feedback, or Returns
- **THEN** exactly one blue rounded title bar appears directly below the main header
- **AND** no other page title heading exists anywhere else on the page/view

#### Scenario: No overlap or touching
- **WHEN** a student page is rendered with content (cards, forms, tables, filters) below the title bar
- **THEN** the title bar does not overlap, touch, or clip the main header above it or the content below it

### Requirement: Title bar contains the existing page title
The blue title bar SHALL contain the EXISTING page/module title text and SHALL NOT introduce the sidebar/module label as a new title. The sidebar/module name (Dashboard, User Profile, Request, Announcements, Feedback, Returns) SHALL NOT be rendered as a standalone page title anywhere on the page. No new, renamed, or duplicate titles SHALL be created.

#### Scenario: Returns page title
- **WHEN** a student opens the Returns page
- **THEN** the blue title bar contains "Submit Return Request"
- **AND** a standalone "Returns" heading is not rendered above or beside it

#### Scenario: Feedback page title
- **WHEN** a student opens the Feedback page
- **THEN** the blue title bar contains "Submit Feedback"
- **AND** a standalone "Feedback" heading is not rendered above or beside it

#### Scenario: Announcements page title
- **WHEN** a student opens the Announcements page
- **THEN** the blue title bar contains "Announcements"
- **AND** no duplicate "Announcements" heading is rendered on the page

#### Scenario: User Profile page title
- **WHEN** a student opens the User Profile page
- **THEN** the blue title bar contains "User Profile"
- **AND** no duplicate "User Profile" heading is rendered on the page

#### Scenario: Dashboard title
- **WHEN** a student opens the Dashboard
- **THEN** the blue title bar contains "Dashboard"
- **AND** no separate "Dashboard" heading is rendered above it

#### Scenario: Request section title
- **WHEN** a student opens the Request section (Registration Workflow)
- **THEN** the blue title bar contains the existing section title ("Registration Workflow")
- **AND** a standalone "Request" heading is not rendered, and no duplicate of the section title remains on the page

#### Scenario: Sidebar label not a page title
- **WHEN** any student page/view is rendered
- **THEN** the sidebar/module name is not rendered again as an extra page title

### Requirement: Student title bar visual design
The student title bar SHALL match the existing Admin/Super Admin title bar design language: dark navy background (`#152c69`), rounded top corners, clean bold white text with horizontal and vertical padding, left-aligned text, and vertical centering. The bar SHALL use the existing `.module-title-bar` style defined in `public/css/theme.css`.

#### Scenario: Consistent appearance
- **WHEN** any student module title bar is rendered
- **THEN** it uses the same navy color, white bold text, radius, padding, and typography as the Admin title bars, with no per-module variation

#### Scenario: Comfortable padding
- **WHEN** the student title bar is rendered
- **THEN** title text is padded comfortably from the bar edges and vertically centered
- **AND** the bar spans the full content container width with left/right margins consistent with the page container

### Requirement: UI-only change
The correction SHALL be purely presentational. Existing functionality, data, API calls, routes, sidebar behavior, the main top header layout, forms, fields, tables, filters, buttons, and permissions SHALL NOT change. Admin/Super Admin pages SHALL NOT change. Page titles SHALL NOT be renamed.

#### Scenario: Existing content untouched
- **WHEN** the student title/header correction is applied
- **THEN** all existing form fields, cards, tables, filters, and page content remain exactly as they were, apart from minor spacing needed to fit the corrected title section
- **AND** no data, API call, route, permission, or behavior changes are introduced