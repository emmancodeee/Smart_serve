## ADDED Requirements

### Requirement: Feedback actions render as a 2x2 button grid

The Feedback Management administrator Actions column SHALL render View, Respond, Status, and Priority in a two-column grid where View and Respond occupy the first row and Status and Priority occupy the second row, beneath them.

#### Scenario: Four-button action grid
- **WHEN** a feedback row is displayed with all four actions
- **THEN** the Actions cell contains the buttons in source order such that View and Respond are in the top row and Status and Priority are directly below them

#### Scenario: Uniform spacing
- **WHEN** the action grid is measured
- **THEN** the horizontal gap between columns and the vertical gap between rows are equal, and the buttons do not touch each other

### Requirement: Consistent button sizing and alignment

Each action button SHALL fill its grid cell so all buttons have equal width, consistent height, aligned left/right edges, and the overall group reads as one organized block rather than scattered buttons.

#### Scenario: Equal widths and aligned edges
- **WHEN** the actions grid is rendered
- **THEN** both buttons in each row have equal width and the two rows share the same left and right edges

#### Scenario: Consistent height
- **WHEN** the buttons in a row are compared
- **THEN** they have the same height, keeping the group visually even

### Requirement: Existing button colors and sizing preserved

The View, Respond, Status, and Priority buttons SHALL keep their existing Bootstrap color classes (`btn-info`, `btn-primary`, `btn-warning`, `btn-secondary`) and the existing `.table-actions .btn` padding, font-size, and line-height rules. No new colors and no grayscale conversion SHALL be introduced.

#### Scenario: Colors unchanged
- **WHEN** the action buttons are rendered
- **THEN** each button uses its existing Smart Serve color (view cyan, respond blue, status gold/yellow, priority neutral/gray) via the unchanged Bootstrap classes

#### Scenario: Sizing rule preserved
- **WHEN** the page CSS is inspected
- **THEN** the `.table-actions .btn` sizing rule (padding 0.45rem 0.7rem, font-size 0.78rem, line-height 1.2) is still present

### Requirement: Actions contained within the column and centered

The action group SHALL fit entirely inside the Actions column with no overflow, clipping, or overlap, SHALL not extend into the Date column or outside the table, and SHALL be vertically centered within each feedback row.

#### Scenario: No overflow into adjacent columns
- **WHEN** an action grid is rendered
- **THEN** all four buttons are fully contained within the Actions column and vertically centered in the row

#### Scenario: Responsive narrow screen
- **WHEN** the viewport narrows
- **THEN** the two-column structure remains intact and the table scrolls horizontally instead of compressing or overlapping the buttons

### Requirement: Existing functionality retained

Each action SHALL continue invoking its existing handler: View → `viewFeedback`, Respond → `openResponseModal`, Status → `openStatusModal`, Priority → `updatePriority`. No handler, state logic, API call, or data flow SHALL change, and buttons SHALL NOT become visual-only elements.

#### Scenario: Handlers preserved
- **WHEN** any of the four buttons is clicked
- **THEN** the pre-existing handler runs with the same behavior as before the layout change

### Requirement: Rest of the page unchanged

The feedback page layout is out of scope: sidebar, header, title, filters, search, reset, export, table columns, feedback data, student info, category, subject, rating, status values, priority values, and date SHALL remain unchanged.

#### Scenario: No page redesign
- **WHEN** the feedback page is rendered
- **THEN** every element other than the Actions column layout and spacing is identical to its previous presentation