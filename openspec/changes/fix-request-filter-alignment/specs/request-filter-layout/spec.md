## ADDED Requirements

### Requirement: Two-row balanced filter layout

In Admin > Request Management ("Pending Registrations"), the registrations filter toolbar SHALL lay its controls out as two aligned rows using equal-width columns that fill the available container width, and SHALL render exactly two rows at desktop width (no third row). Row 1 SHALL contain the five field controls in order — Status, Course, Year Level, Student Type, Date (field select, default "All Date") — each occupying one equal column. Row 2 SHALL contain the Date preset select (default "All Time"), Sort, Search, Reset Filters, and Export in order, each in one equal column sharing the same left and right boundaries as Row 1.

#### Scenario: Controls distribute evenly across Row 1

- **WHEN** the Request Management page renders its filter toolbar
- **THEN** Row 1 shows Status, Course, Year Level, Student Type, and Date (All Date) side by side as five evenly sized controls spanning the container width
- **AND** Row 2 shows the Date preset (All Time), Sort, Search, Reset Filters, and Export aligned to the same left and right edges as Row 1

#### Scenario: Exactly two rows with both Date controls

- **WHEN** the Request Management toolbar renders at desktop width
- **THEN** Row 1 shows the five field controls (Status, Course, Year Level, Student Type, and the Date field select defaulting to "All Date")
- **AND** Row 2 shows the Date preset select (default "All Time"), Sort, Search, Reset Filters, and Export
- **AND** no third row is ever rendered
- **AND** Reset Filters and Export never wrap beneath another control

#### Scenario: Search matches its peers

- **WHEN** Row 2 renders
- **THEN** the Search field is one equal column like the Date preset, Sort, Reset Filters, and Export
- **AND** Reset Filters and Export remain on the same line and baseline as the other Row 2 controls, without wrapping to a third row

### Requirement: Consistent control dimensions

All filter controls in the registrations toolbar (selects, the Course control, Date control, Search input, and the Reset Filters / Export buttons) SHALL have the same height, sit on the same vertical center line, and use consistent spacing. No single control SHALL appear visibly shorter, taller, smaller, or more empty than its peers in the same row.

#### Scenario: Course control matches its peers

- **WHEN** the Course control renders next to Status, Year Level, Student Type, and Date
- **THEN** it is the same height and width as the other Row 1 controls
- **AND** it no longer appears as an undersized or empty box, while keeping its existing options and behavior

#### Scenario: All controls share a baseline

- **WHEN** the toolbar renders at desktop width
- **THEN** every control and button in a row is vertically centered on the same baseline
- **AND** spacing between adjacent controls is consistent

### Requirement: Layout stability on filter selection

Selecting a value in any filter control (Status → e.g. Pending, Course, Year Level, Student Type, Date, Sort, or typing in Search) SHALL NOT cause the toolbar to jump, disappear, resize, reflow, or move any control. Only the control's displayed value may change; each control's position, width, height, and the row boundaries SHALL remain identical before and after any selection.

#### Scenario: Status selection does not shift layout

- **WHEN** an admin selects "Pending" (or any other value) in the Status filter
- **THEN** the Status control shows "Pending"
- **AND** all other controls remain in the exact same positions and sizes as before the selection

#### Scenario: Any filter change keeps controls stable

- **WHEN** an admin changes Year Level, Student Type, Date, Sort, Search, or Course
- **THEN** no control changes size or position
- **AND** the two rows keep their shared boundaries

### Requirement: No functional or style changes to filters

The alignment fix SHALL NOT change filter options, labels, placeholders, status filtering, reset behavior, export behavior, search behavior, the registration table, or the toolbar container's width, corners, border, background, or padding. All existing filter functionality SHALL behave identically.

#### Scenario: Filters still work after alignment

- **WHEN** an admin uses any filter combination (status, course, year level, student type, date, sort, search), clicks Reset Filters, or clicks Export on the Request Management page
- **THEN** results, reset, and export behave exactly as before the alignment fix
- **AND** the filter section still renders inside the same white rounded container

### Requirement: Responsive two-row layout

At desktop width the registrations toolbar SHALL keep the two-row layout above. As the window narrows, controls SHALL reflow without overlapping and without any control becoming significantly larger or smaller than its peers; the toolbar SHALL never lose its even spacing or allow controls to stack unevenly.

#### Scenario: Desktop keeps two rows

- **WHEN** the Request Management page is viewed at the current desktop width
- **THEN** Row 1 and Row 2 render exactly as two lines of controls with equal column widths

#### Scenario: Narrower windows reflow evenly

- **WHEN** the window narrows below desktop width
- **THEN** the controls adapt their column count while maintaining equal widths
- **AND** controls never overlap and none becomes disproportionately tall or short