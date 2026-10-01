## ADDED Requirements

### Requirement: Two-row balanced filter layout

In Admin > Request Management ("Pending Registrations"), the registrations filter toolbar SHALL lay its controls out as two aligned rows with equal-width columns filling the container. Row 1 SHALL contain the five field controls in order — Status, Year/Category, Year Level, Student Type, Date (field select, default "All Date") — each in one equal column. Row 2 SHALL contain the Date-preset select (default "All Time"), Sort, Search, Reset Filters, and Export, each in one equal column sharing Row 1's left and right boundaries. The toolbar SHALL render exactly two rows at desktop width and SHALL NOT create a third row or wrap any control below another.

#### Scenario: Two clean rows at desktop width

- **WHEN** the Request Management filter toolbar renders at desktop width
- **THEN** Row 1 shows Status, Year/Category, Year Level, Student Type, and Date (All Date) as five evenly sized controls spanning the container width
- **AND** Row 2 shows the Date preset (All Time), Sort, Search, Reset Filters, and Export aligned to the same left and right edges as Row 1
- **AND** no third row is rendered, and Reset Filters / Export never wrap beneath another control

#### Scenario: Two distinct Date controls

- **WHEN** an admin views the filter toolbar
- **THEN** Row 1's fifth control is the Date field select (default "All Date")
- **AND** Row 2's first control is the Date-range preset select (default "All Time")
- **AND** the Date preset options remain exactly the current preset list (e.g. Today, Last 7 Days, Custom Range)

### Requirement: Consistent control dimensions and spacing

All controls in the registrations toolbar (dropdowns, the Year/Category control, Date control, Search input, and Reset Filters / Export buttons) SHALL have the same height, share the same vertical center line, use matching border radius and border styling, and be spaced consistently. No single control SHALL appear visibly shorter, taller, smaller, more empty, or detached from the row.

#### Scenario: Year/Category matches its peers

- **WHEN** the Year/Category control renders beside Status, Year Level, Student Type, and Date
- **THEN** it has the same height and width as the other Row 1 controls
- **AND** it no longer renders as an undersized or empty box, while keeping its existing options and behavior

#### Scenario: Arrow alignment

- **WHEN** Row 1's dropdowns render
- **THEN** all dropdown arrows are aligned to the right edge of their controls

### Requirement: Layout stability on filter selection

Selecting any filter value (Status → e.g. Pending, Year/Category, Year Level, Student Type, Date-preset, Sort, or Search text) SHALL NOT cause the toolbar or any control to jump, disappear, resize, reflow, or move. Only the selected control's displayed text may change; every control's position, width, and height SHALL remain identical before and after any selection.

#### Scenario: Status selection leaves layout unchanged

- **WHEN** an admin selects "Pending" (or another value) in the Status filter
- **THEN** the Status control shows "Pending"
- **AND** all other controls stay in the exact same positions and sizes as before the selection

#### Scenario: Any selection keeps controls stable

- **WHEN** an admin changes Year Level, Student Type, Date, Sort, Search, or Year/Category
- **THEN** no control changes size or position
- **AND** the two rows keep their shared boundaries

### Requirement: Filter state independence

Each filter control SHALL maintain its own selected value. Changing one filter SHALL NOT reset or remove another: with Status = Pending, Year Level = 2nd Year, and Student Type = Regular selected, changing Status SHALL NOT reset Year Level, Student Type, Date, Time, Sort, or Search.

#### Scenario: Status change preserves other filters

- **WHEN** an admin has Year Level = 2nd Year and Student Type = Regular selected, then changes Status from Pending to Rejected
- **THEN** Year Level and Student Type selections remain
- **AND** all filter controls remain mounted and visible

### Requirement: Empty results keep the filter layout

When a filter combination matches zero registration records, the system SHALL keep the filter section fully visible in its exact same layout and render an empty-state message in the table/content area (e.g. "No registrations found for the selected filters."). The admin SHALL still be able to change filters or click Reset Filters.

#### Scenario: Zero results do not hide filters

- **WHEN** a filter combination produces no matching registrations
- **THEN** the table area shows an empty-state message
- **AND** the filter toolbar remains visible with the exact same two-row layout

### Requirement: Reset Filters restores defaults

The Reset Filters button SHALL restore every control to its default (Status = All Status, Year/Category cleared, Year Level = All Year Level, Student Type = All Student Type, Date = All Date/All Time, Sort = default, Search cleared), refresh the registration records, and leave the two-row layout unchanged.

#### Scenario: Reset restores defaults and layout

- **WHEN** an admin clicks Reset Filters after making selections and typing a search
- **THEN** every control returns to its default value, the search box is cleared, and the full registration dataset is displayed
- **AND** the filter toolbar layout is exactly the same as before reset

### Requirement: No functional or visual-style changes to filters

The reorganization SHALL NOT change filter options, labels, placeholders, status filtering (limited to All Status, Pending, Approved, Rejected — no "Archived" option), search/reset/export behavior, the registration table, or the toolbar container's width, corners, border, background, or padding. Existing SmartServe colors, fonts, border colors, button colors, and dropdown arrow styling SHALL be preserved.

#### Scenario: Archive not added to Status

- **WHEN** an admin opens the Status filter
- **THEN** the dropdown lists only All Status, Pending, Approved, and Rejected
- **AND** no "Archived" (or similar archive/remove) option is present

#### Scenario: Existing styling retained

- **WHEN** the reorganized toolbar renders
- **THEN** it uses the existing Request Management border color, background, text color, font, border radius, button colors, and arrow styling
- **AND** no new colors or SmartServe theme changes are introduced