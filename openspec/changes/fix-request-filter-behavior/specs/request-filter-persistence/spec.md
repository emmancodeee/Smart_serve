## ADDED Requirements

### Requirement: Registrations filter section stays visible

The Admin > Request Management ("Pending Registrations") page SHALL render its registrations filter section (Status, Course/Category, Year Level, Student Type, Date range, Sort, Search, Reset Filters, and Export) in a container that remains mounted and visible at all times while the Request Management view is active. Selecting a value from the Status filter SHALL NOT hide, remove, collapse, resize, or reset the filter toolbar or any of its controls.

#### Scenario: Filter section remains after selecting a status

- **WHEN** an admin is on the Request Management page and selects "Rejected" (or "Approved" or "Pending") from the Status filter
- **THEN** the same filter section with Status, Course/Category, Year Level, Student Type, Date range, Sort, Search registrations, Reset Filters, and Export remains visible
- **AND** the selected status remains selected in the Status control
- **AND** only the registration table contents change

#### Scenario: Filter section toggles only with the view

- **WHEN** an admin navigates to the Request Management view
- **THEN** the registrations filter section is visible
- **AND** when the admin navigates away to another admin view, the registrations filter section is hidden with the rest of the Request Management view

### Requirement: Status filter options

The Status filter SHALL offer exactly: "All Status" (empty value), "Pending", "Approved", and "Rejected". The system SHALL NOT include "Archived", "Removed", "Deleted", or any other archive/remove label as a Status filter option. Archive SHALL remain an action button in the registration table rows only.

#### Scenario: Status dropdown contains only registration statuses

- **WHEN** an admin opens the Status filter on the Request Management page
- **THEN** the dropdown lists only All Status, Pending, Approved, and Rejected
- **AND** no Archive/Removed/Deleted option is present

#### Scenario: Archive stays an action button

- **WHEN** an admin inspects a registration row's Actions
- **THEN** Archive appears only as a row action button, never as a Status filter option

### Requirement: Selecting a status filters only the records

Selecting "Pending", "Approved", or "Rejected" in the Status filter SHALL filter the displayed registration records to that status, and SHALL NOT alter the visibility or state of any other filter control. Selecting "All Status" SHALL show all three sections again.

#### Scenario: Select Rejected

- **WHEN** an admin selects "Rejected" in the Status filter
- **THEN** the Status control shows "Rejected"
- **AND** only the Rejected Registrations section/records are displayed
- **AND** every other filter control remains visible and usable

#### Scenario: Return to All Status

- **WHEN** an admin selects "All Status" in the Status filter
- **THEN** Pending, Approved, and Rejected Registrations sections all display again
- **AND** the filter toolbar remains visible

### Requirement: Independent filter state

Each filter control (Status, Course/Category, Year Level, Student Type, Date range, Sort, Search) SHALL maintain its own selected value. Changing Status SHALL NOT reset Year Level, Student Type, Date, Time, Sort, or Search, and changing any other filter SHALL NOT remove or reset the Status selection.

#### Scenario: Changing Status preserves other filters

- **WHEN** an admin has Year Level = 2nd Year and Student Type = Regular selected, then changes Status from Pending to Rejected
- **THEN** Year Level and Student Type selections are preserved
- **AND** the Status control shows Rejected

#### Scenario: Changing another filter preserves Status

- **WHEN** an admin has Status = Rejected selected and then changes Year Level or clears the search field
- **THEN** the Status control continues to show Rejected
- **AND** the Rejected records remain filtered

### Requirement: Persistent filters on empty results

When a selected filter combination matches no registration records, the system SHALL keep the filter section fully visible and render an empty-state message inside the table content area (e.g., "No rejected registrations match the current filters."). The admin SHALL still be able to change filters or click Reset Filters.

#### Scenario: Empty result set keeps filters visible

- **WHEN** a filter combination produces no matching registrations
- **THEN** the table area shows an empty-state message
- **AND** all filter controls remain visible and usable
- **AND** Reset Filters is available and restores all records

### Requirement: Reset Filters

The Reset Filters button SHALL reset all filters to their defaults: Status to "All Status", all field selects cleared, Date range to All Time, Sort to default, Search cleared; then SHALL refresh the table to show the full registration dataset. The filter section SHALL remain visible after reset.

#### Scenario: Reset Filters restores defaults

- **WHEN** an admin clicks Reset Filters with Status = Rejected, Year Level and Student Type selected, a search query, custom date range, and sort active
- **THEN** every filter returns to its default value, the search box is cleared, and the full registration dataset is displayed
- **AND** the filter section remains visible

### Requirement: No conditional rendering of filter section

The registrations filter section SHALL NOT be conditionally removed, hidden, or re-rendered based on selected status, filtered registrations, registration count, loading state, empty results, or active filter state. The same filter toolbar SHALL remain mounted across all states.

#### Scenario: No layout swap on status change

- **WHEN** an admin applies any combination of filters including Status on the Request Management page
- **THEN** the filter row does not jump, disappear, collapse, or move unexpectedly
- **AND** the same filter toolbar instance remains mounted in place