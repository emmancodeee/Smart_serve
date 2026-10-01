## ADDED Requirements

### Requirement: Approved and Rejected actions render as a consistent grid

The Approved Registrations and Rejected Registrations Actions columns SHALL render their buttons in the same two-column grid visual system used by Pending Registrations, arranged in the same compact two-by-two shape: View and ORF on the first row, Archive and Set Pending on the second row.

#### Scenario: Approved actions grid
- **WHEN** an approved registration row with an ID document is rendered
- **THEN** the Actions cell shows View and ORF side-by-side in the first row and Archive and Set Pending side-by-side in the second row

#### Scenario: Rejected actions identical to Approved
- **WHEN** a rejected registration row with an ID document is rendered
- **THEN** its Actions cell shows the same two-by-two grid in the same positions as an approved registration row

#### Scenario: Missing ID document
- **WHEN** a registration record has no ID document (no ORF button)
- **THEN** the remaining buttons still render in equal-width cells without gaps in positions

### Requirement: Consistent button sizing, spacing, and alignment

All Actions buttons in the Approved and Rejected sections SHALL have equal width, equal height, uniform horizontal and vertical spacing, flush left/right edges within each button row, be vertically centered in the row, and never overlap, clip, or be cut off.

#### Scenario: Equal buttons
- **WHEN** the Actions grid of an approved or rejected row is measured
- **THEN** View, ORF, Archive, and Set Pending occupy equal-width cells with equal heights and a uniform gap between cells and between rows

#### Scenario: No clipping or overlap
- **WHEN** the Actions grid renders
- **THEN** every button label stays fully inside its button (no truncation, wrapping, or overflow into neighboring buttons or cells)

#### Scenario: Vertical centering
- **WHEN** a registration row renders
- **THEN** its Actions group is vertically centered within the row

### Requirement: Existing button colors and styles matched to Pending

The View, ORF, Archive, and Set Pending buttons SHALL match the Pending Registrations action-button styling: View blue, ORF white/outline, Archive blue (identical to Pending's Archive), Set Pending amber/outline. Pending Registrations SHALL remain exactly as-is, including its blue Archive button and its 2x2 grid.

#### Scenario: Approved/Rejected archive matches Pending
- **WHEN** Approved and Rejected actions render
- **THEN** View uses its blue style, ORF uses its white/outline style, Archive uses Pending's blue style, and Set Pending uses its amber/outline style

#### Scenario: Pending reference untouched
- **WHEN** a pending registration row renders
- **THEN** its Actions grid remains the existing two-by-two arrangement with the existing blue Archive button

### Requirement: Tables align across all three sections

The Pending, Approved, and Rejected tables SHALL share the same seven columns in the same order (Student Number, Full Name, Course, Registration Summary, Last Updated, Status, Actions), the same approximate column proportions, and the same Actions-column width and vertical alignment.

#### Scenario: Column lineup
- **WHEN** the three registration tables render the same record
- **THEN** each column starts at the same horizontal position across all three tables and the columns are equal in count and order

#### Scenario: Actions column sizing
- **WHEN** any of the three registration tables renders
- **THEN** its Actions column width and per-cell vertical alignment match the other two

### Requirement: Row height and spacing normalized

Rows in Approved and Rejected SHALL use the same cell padding and border rhythm as Pending, be tall enough to contain the two-row Actions grid without clipping, and SHALL NOT be excessively tall or contain unnecessary blank areas.

#### Scenario: Normalized row rhythm
- **WHEN** approved and rejected rows render
- **THEN** their cell padding, spacing, and row height match Pending rows

#### Scenario: No excessive height
- **WHEN** a row's Actions grid is the tallest content
- **THEN** the row height fits the grid plus standard vertical padding without extra blank space

### Requirement: Section containers consistent

The Approved and Rejected sections SHALL use the same container styling as Pending (same margins, width, header style, header indicator, table wrapper, border radius, and section-to-section spacing), keep their existing status indicators (green dot for Approved, red dot for Rejected), and provide header-to-table spacing consistent with the Pending reference.

#### Scenario: Section look-and-feel
- **WHEN** the Request Management page renders
- **THEN** the Approved and Rejected sections match the Pending section's width, padding, header, table wrapper, and spacing, differing only in the header dot color and their actions

#### Scenario: Header-to-table spacing
- **WHEN** the Approved or Rejected table renders below its section header
- **THEN** the vertical gap between the header and the table reads consistently with the Pending section's header-to-table gap

### Requirement: Functionality and data unchanged

All existing behavior SHALL be preserved: the View, ORF, Archive, and Set Pending actions keep their existing handlers; the Status column keeps its values and logic; and no record, status, authentication, or data is altered. Approved and Rejected SHALL NOT render differently from each other in button positioning.

#### Scenario: Handlers preserved
- **WHEN** View is clicked SHALL open the user view with registration details; **WHEN** ORF is clicked SHALL open the document; **WHEN** Archive is clicked SHALL archive the registration; **WHEN** Set Pending is clicked SHALL set the registration back to pending — all exactly as before

#### Scenario: Status logic unchanged
- **WHEN** an Approved or Rejected section renders its Status column
- **THEN** the existing status values and badge styling are shown unmodified

#### Scenario: Super-admin view-only retained
- **WHEN** a super admin has view-only access
- **THEN** decision and archive controls are hidden as before and the actions remain view/ORF with the existing read-only indication