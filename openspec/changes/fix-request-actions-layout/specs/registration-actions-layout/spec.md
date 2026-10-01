## ADDED Requirements

### Requirement: Pending registration actions render as a 2x2 button grid

The Pending Registrations (Request Management) administrator Actions column SHALL render each row's action buttons in a `.action-buttons` grid with two equal-width columns and uniform spacing, so View and ORF occupy the first row and Approve and Archive occupy the second row immediately below.

#### Scenario: Four-button action row
- **WHEN** a pending registration with a document path is displayed with decision actions enabled
- **THEN** the Actions cell contains a `.action-buttons` grid in the order View, ORF (first row), Approve, Archive (second row, directly under View/ORF)

#### Scenario: Missing document path
- **WHEN** a pending registration has no associated document path
- **THEN** the grid contains View and Approve in the first row with Archive below View, still using the same grid container

#### Scenario: Rows use identical structure
- **WHEN** multiple pending registrations are displayed
- **THEN** every row uses the same `.action-buttons` grid container and button classes, producing aligned columns across rows

### Requirement: Action buttons fill cells and never wrap or overlap

Each action button inside the grid SHALL fill its grid cell, center its label, and keep its text on a single line so buttons never wrap, overflow, or overlap the cell boundaries or adjacent cells.

#### Scenario: Button sizing and alignment
- **WHEN** the actions grid is rendered
- **THEN** each button spans the full width of its grid cell, centers its label, and does not exceed one line of text

#### Scenario: Row spacing
- **WHEN** rows and columns of the grid are measured
- **THEN** both row gaps and column gaps are an equal 6px with no leading margins offsetting any button

### Requirement: Archive uses existing blue action styling

The Archive button in the Pending Registrations actions SHALL use the existing blue action button style with white text, consistent with the View button, and SHALL retain its archive confirmation prompt and handler.

#### Scenario: Archive styling and behavior
- **WHEN** the Archive button is rendered
- **THEN** it uses the existing blue button class set with white text, and clicking it triggers the existing archive confirmation flow

### Requirement: Actions column sized and vertically centered; other tables unaffected

The Pending Registrations Actions column SHALL have a fixed width that is neither excessively wide nor so narrow that buttons wrap, and the button stack SHALL be vertically centered in each row. Approved/Rejected registration tables and the Inventory Management Actions column SHALL remain unchanged.

#### Scenario: Actions column width
- **WHEN** the `#registrationsTable` is rendered
- **THEN** the Actions column has a fixed 170px width and its cells vertically center the button stack

#### Scenario: Scope isolation
- **WHEN** the Approved/Rejected registrations tables and the Inventory Management tables are rendered
- **THEN** their Actions columns retain their existing layout and button styling

#### Scenario: Empty table state
- **WHEN** no pending registrations match the current filters
- **THEN** the table shows the existing empty-state row spanning all seven columns and no action grid is rendered

### Requirement: No deprecated action buttons in pending registrations

The Pending Registrations Actions column SHALL expose exactly View, ORF, Approve, and Archive, and SHALL NOT render a Reject, Remove, or Delete button.

#### Scenario: Deprecated button absence
- **WHEN** the pending registrations actions markup is inspected
- **THEN** no Reject, Remove, or Delete control is present and exactly the View, ORF, Approve, and Archive actions are available

#### Scenario: Existing handlers retained
- **WHEN** any action button in the grid is activated
- **THEN** the pre-existing handler runs (viewUser for View, document link for ORF, updateRegistrationStatus for Approve, archiveRegistration for Archive) without change