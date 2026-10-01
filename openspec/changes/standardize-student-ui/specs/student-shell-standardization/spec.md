## ADDED Requirements

### Requirement: Student header matches Admin design system
The student page header SHALL use the same visual system as the Admin/Super Admin header: a `#152c69` navy topbar, a greeting element that renders "Welcome, {First Name}", a date/time clock container styled like the admin clock (`#1d3b86` background, yellow border, rounded, white semibold text), and a far-right profile block showing the student's initial avatar, full name, and "Student" role text, followed by the bell and burger menu with search and logout. No module name or duplicate greeting SHALL appear in the header.

#### Scenario: Header renders student identity and clock
- **WHEN** a student loads any student page and `/api/auth/me` succeeds
- **THEN** the header shows "Welcome, {FirstName}", the live clock in the admin-style container, the student's avatar initial, full name, and "Student" role, and the bell and burger controls
- **AND** the header SHALL NOT contain a module name next to the greeting

#### Scenario: All student pages share the same header
- **WHEN** a student navigates between Dashboard, User Profile, Request, Announcements, Feedback, and Returns
- **THEN** the header structure and styling SHALL be identical on every page except for the greeting text

### Requirement: Student sidebar matches Admin design system
The student sidebar SHALL use the same navy gradient family and link styling as the Admin/Super Admin sidebar. The nav list SHALL contain exactly six items in order: Dashboard, User Profile, Request, Announcements, Feedback, Returns, with no Admin modules. All links SHALL use a single consistent icon size and spacing grid, and the "Smart Serve" title SHALL appear at the top.

#### Scenario: Sidebar renders the student navigation set
- **WHEN** a student views the sidebar on any student page
- **THEN** the six student modules appear in order with uniform icon size and spacing
- **AND** no Admin-only module appears

#### Scenario: Sidebar uses the admin navy gradient
- **WHEN** a student page is in theme-light mode
- **THEN** the sidebar background SHALL render the navy gradient (`#17357f → #2447a8 → #315fda` family) instead of a flattened alternate navy family

### Requirement: One active-nav style across all student pages
The active sidebar item SHALL use the same state on every student page (light/white pill background, dark navy text, rounded corners), matching the Admin active state. Feedback and Returns SHALL show a visible active state, Schedule SHALL use the same style instead of its yellow variant, and Dashboard SHALL visibly mark its current module.

#### Scenario: Active item is visible on every page
- **WHEN** a student is on Feedback, Returns, or Dashboard
- **THEN** the current module's sidebar item SHALL be visibly highlighted with the standard light-pill active style

#### Scenario: Active style is consistent across pages
- **WHEN** a student switches between pages
- **THEN** the active item SHALL use the same background, text color, radius, and padding on every page

### Requirement: Schedule page participates in the shared shell
The schedule page SHALL include `theme-light` and the same header/sidebar/active-state styling as the other student pages. Event data and schedule features SHALL remain unchanged.

#### Scenario: Schedule shows the standard shell
- **WHEN** a student opens the schedule page
- **THEN** the page SHALL use the theme-light background and the standard navy sidebar and header
- **AND** the schedule/event features SHALL render identically to before

### Requirement: Student page background matches Admin content area
Student page backgrounds SHALL use the same `#eef5ff` content background as Admin pages so the product reads consistently.

#### Scenario: Consistent page background
- **WHEN** a student views any student page
- **THEN** the content area SHALL use the `#eef5ff` light background matching the Admin pages