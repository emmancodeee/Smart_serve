## ADDED Requirements

### Requirement: Profile title bar carries the content title
The student User Profile page SHALL render exactly ONE blue rounded title bar directly below the main header. The title bar SHALL contain "Registration Details". The sidebar/module label "User Profile" SHALL NOT be rendered as a page title anywhere in the main content.

#### Scenario: Title bar content
- **WHEN** a student opens the User Profile page
- **THEN** the single blue title bar directly below the main header contains "Registration Details"
- **AND** no "User Profile" heading is rendered in the main content area

#### Scenario: No duplicate heading
- **WHEN** a student opens the User Profile page
- **THEN** exactly one "Registration Details" heading exists on the page (inside the blue title bar)
- **AND** no second "Registration Details" heading is rendered below it

### Requirement: Registration information preserved
The registration information cards directly below the blue title bar SHALL remain unchanged in content and layout: two-column grid on desktop, single column on small screens, with the existing fields (Status, Course, Module, Uniform Type, Books, Pickup Day) and their values rendered exactly as before. The cards SHALL NOT overlap the title bar and SHALL have consistent spacing between the title bar and the content, and consistent left/right margins matching the page container.

#### Scenario: Registration values untouched
- **WHEN** a student views the registration details on the User Profile page
- **THEN** the Status, Course, Module, Uniform Type, Books, and Pickup Day fields and their values render exactly as they did before this change

#### Scenario: Cards below the bar
- **WHEN** the User Profile page is rendered
- **THEN** the registration information cards start below the blue title bar with consistent spacing and do not overlap or clip the bar

### Requirement: Profile page title bar visual design
The blue title bar SHALL match the existing Admin/Super Admin title bar style: dark navy background (`#152c69`), rounded top-left and top-right corners, white bold vertically-centered left-aligned text, full width of the main content container, comfortable left padding (approx. 24-32px), modest font size, and a small consistent gap below the main header.

#### Scenario: Consistent appearance
- **WHEN** the User Profile title bar is rendered
- **THEN** it uses the same navy color, white bold text, radius, padding, and typography as the Admin/Super Admin title bars

### Requirement: Edit Your Profile section unchanged
The "Edit Your Profile" section SHALL remain below the registration details with its heading, fields (Name, Email, Current Password, New Password, Confirm New Password), password eye toggles, and the Update Profile button unchanged. Only spacing/alignment MAY be adjusted so the page looks clean and consistent.

#### Scenario: Profile editing preserved
- **WHEN** a student uses the "Edit Your Profile" section
- **THEN** all fields, the password visibility toggles, and the Update Profile button behave exactly as before

### Requirement: UI-only change
The change SHALL be purely presentational on the User Profile page. Functionality, data, API calls, routes, authentication, password logic, sidebar navigation (including the "User Profile" active item), and all other pages SHALL NOT change.

#### Scenario: No functional changes
- **WHEN** the User Profile page UI is corrected
- **THEN** no backend, database, API, route, authentication, or password behavior changes
- **AND** the sidebar still shows its existing labels with "User Profile" remaining active