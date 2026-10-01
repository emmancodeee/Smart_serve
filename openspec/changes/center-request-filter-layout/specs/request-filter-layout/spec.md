## ADDED Requirements

### Requirement: Horizontally centered filter section

In Admin > Request Management > Pending Registrations, the registrations filter section SHALL render horizontally centered within the main content area, spanning from the same left boundary to the same right boundary as the Pending Registrations content section, with equal visual spacing on either side. It SHALL NOT be pushed toward the left, SHALL NOT touch or overlap the sidebar, and SHALL NOT extend beyond the main content area.

#### Scenario: Filter spans and centers with the content area

- **WHEN** the Request Management page renders
- **THEN** the filter section fills the main content area from its left edge to its right edge, aligned with the Pending Registrations section boundaries
- **AND** the visible spacing to the left of the section is equal to the spacing to the right
- **AND** the filter section never touches or overlaps the sidebar

#### Scenario: Sidebar and header unchanged

- **WHEN** the filter section is centered
- **THEN** the sidebar and header keep their existing position and styling

### Requirement: Two-row balanced filter layout

The registrations filter toolbar SHALL lay its controls out in exactly two rows at desktop width, with both rows sharing the same left and right edges. Row 1 SHALL contain, in order, five equal-width controls: All Status, Year/Category Filter, All Year Level, All Student Type, and All Date. Row 2 SHALL contain, in order: All Time, Sort, Search (wider than a single-column control), Reset Filters, and Export. Export SHALL NOT wrap onto its own line.

#### Scenario: Row 1 shows five equal controls

- **WHEN** the request-management filter toolbar renders at desktop width
- **THEN** Row 1 shows All Status, Year/Category Filter, All Year Level, All Student Type, and All Date as five equally sized controls spanning the toolbar width

#### Scenario: Row 2 shares Row 1's edges and keeps Export on line

- **WHEN** the request-management filter toolbar renders at desktop width
- **THEN** Row 2 shows All Time, Sort, Search, Reset Filters, and Export without overlapping, with the same left and right edges as Row 1
- **AND** Export always stays on Row 2 with Reset Filters, never wrapping onto its own line

### Requirement: Search wider than the dropdown controls

The Search control in Row 2 SHALL be wider than any single dropdown or button on either row, wide enough to display its placeholder "Search registrations by name, email, course, module, books, or..." without unnecessary truncation.

#### Scenario: Search shows its full placeholder

- **WHEN** the request-management filter toolbar renders at desktop width
- **THEN** the Search input is visibly wider than the All Status, All Time, Sort, Reset Filters, and other single-column controls
- **AND** it can display the full search placeholder text without being cut off

### Requirement: Consistent spacing, height, and row alignment

All filter controls SHALL use equal horizontal gaps, equal vertical spacing between Row 1 and Row 2, consistent control height, consistent rounded corners, consistent border styling, and consistent padding. Controls SHALL NOT overlap.

#### Scenario: Uniform dimensions and spacing

- **WHEN** the request-management filter toolbar renders
- **THEN** every control and button has the same height and sits on the same vertical center line as its row peers
- **AND** the horizontal gap between adjacent controls is identical across both rows
- **AND** the spacing between Row 1 and Row 2 is equal to the internal row rhythm of the toolbar

### Requirement: Layout stability on filter selection

Selecting any filter value (Status, Year/Category, Year Level, Student Type, Date, Year/Date preset, Sort, or search text) SHALL NOT cause the filter section or any control to disappear, move, collapse, or become misaligned. Only the selected control's displayed text may change.

#### Scenario: Status selection keeps the section stable

- **WHEN** an admin selects "Pending" in the Status filter
- **THEN** the Status control shows "Pending"
- **AND** the filter section and all other controls remain in their exact previous positions and sizes

### Requirement: Responsive filter layout

At the current desktop width, the filter toolbar SHALL remain in the two-row layout. When the viewport narrows, controls SHALL wrap naturally while keeping centered alignment, consistent spacing, readable controls, and no horizontal overflow.

#### Scenario: Desktop keeps the two-row layout

- **WHEN** the request-management page is viewed at desktop width
- **THEN** the toolbar renders exactly two rows sharing the same left and right edges

#### Scenario: Narrower windows wrap without overflow

- **WHEN** the window narrows below desktop width
- **THEN** the controls wrap into additional rows with centered alignment and consistent spacing
- **AND** no control overflows the viewport horizontally

### Requirement: No changes to filter behavior or surrounding design

The position and alignment fix SHALL NOT change filter options, labels, placeholders, status filtering (limited to All Status, Pending, Approved, Rejected — no "Archived" option), search/reset/export behavior, the registration table, the Pending Registrations title, typography, colors, status badges, or the filter section's existing border/rounded-corner styling. All filtering functionality SHALL keep working exactly as before.

#### Scenario: Option sets and functionality unchanged

- **WHEN** an admin opens the Status filter or uses any filter control, Reset Filters, or Export
- **THEN** the option list, labels, and behavior are identical to before the fix
- **AND** the Status dropdown lists only All Status, Pending, Approved, and Rejected

#### Scenario: Table and page design unchanged

- **WHEN** the fix is applied
- **THEN** the registration table, its columns and colors, the Pending Registrations title, typography, and status badges are unchanged