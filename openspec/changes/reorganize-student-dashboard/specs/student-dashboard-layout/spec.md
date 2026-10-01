## ADDED Requirements

### Requirement: Single-column full-width dashboard
The Student Dashboard main area SHALL render as a single full-width column that contains, top to bottom: the Dashboard title bar, the server error alert (only when an error is present), the three summary cards, and the Activity section. The Dashboard SHALL NOT contain a right-hand profile column or a "Your Student Details" profile card, and SHALL leave no empty column. The existing left sidebar, top bar, color scheme, fonts, and branding SHALL remain unchanged.

#### Scenario: No profile column
- **WHEN** a student views the Dashboard
- **THEN** the Dashboard content spans the full available width and no "Your Student Details" card or secondary column is present

#### Scenario: Vertical ordering of dashboard content
- **WHEN** a student views the Dashboard
- **THEN** the content appears in order of Dashboard title bar, server error alert (if present), three summary cards, then the Activity section

### Requirement: Server error alert
The Dashboard SHALL show a full-width error alert directly below the Dashboard title bar when the server or network is unreachable, and SHALL hide it otherwise. The alert SHALL show the message "Cannot reach the server. Check your connection and try again." on the left with a "Retry" button on the right, both vertically centered, with spacing below the alert and no overlap with other content. The alert SHALL only appear on an actual server or network error.

#### Scenario: Error alert appears on failure
- **WHEN** the server or network cannot be reached
- **THEN** a full-width alert with "Cannot reach the server. Check your connection and try again." and a retry button is displayed above the summary cards

#### Scenario: Error alert hidden on success
- **WHEN** the server responds successfully
- **THEN** the error alert is hidden and the summary cards render normally

#### Scenario: Retry reloads data
- **WHEN** the student clicks the Retry button on the error alert
- **THEN** the dashboard retries loading the user data and hides the alert on success

### Requirement: Summary card row
The Dashboard SHALL render three summary cards (Registration, Request Items, Next Pickup) in a single row on desktop with equal width and equal height, tops and bottoms aligned, equal spacing between them, filling the full available width. On mobile the cards SHALL stack vertically. The cards SHALL keep their existing icon style, icon background colors, rounded corners, borders, shadows, and padding, and their content SHALL NOT be clipped or overlap.

#### Scenario: Desktop layout of summary cards
- **WHEN** a student views the Dashboard at desktop width
- **THEN** the three summary cards are displayed in one row, equal in width and height, aligned, and evenly spaced across the full width

#### Scenario: Mobile layout of summary cards
- **WHEN** a student views the Dashboard at mobile width
- **THEN** the three summary cards stack vertically without overlap and without horizontal scroll

#### Scenario: Summary card content
- **WHEN** the student's registration is approved with no pickup date assigned
- **THEN** the Registration card shows "Approved" with "Registration is approved. Pickup scheduling is being finalized.", the Request Items card shows the number of requested items, and the Next Pickup card shows "Awaiting assignment" with "Registration is approved, but no pickup slot is currently assigned."

### Requirement: Activity section layout
The Dashboard SHALL render the Activity section full-width directly below the summary cards, using a blue section-header style consistent with other sections and titled "Activity". Inside the section SHALL be a "Pickup Notifications" card that shows a notification icon on the left, "Pickup Notifications" as the main text, a subtitle such as "No active pickup schedule", and a "Show" control aligned to the far right, in a clean rounded container with consistent padding and vertical alignment.

#### Scenario: Activity section placement and title
- **WHEN** a student views the Dashboard
- **THEN** the Activity section appears directly below the summary cards at full width with a header titled "Activity"

#### Scenario: Pickup Notifications card
- **WHEN** a student views the Dashboard
- **THEN** the Activity section contains a "Pickup Notifications" card with a notification icon, main text, a "No active pickup schedule" subtitle, and a "Show" control on the right, vertically aligned and evenly padded