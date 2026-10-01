## ADDED Requirements

### Requirement: Shared filter component across admin modules
The system SHALL provide a single reusable filter component used by every admin module (dashboard analytics, registrations, transactions, pickup confirmations, announcements, admin accounts, feedback, returns, inventory) so that spacing, typography, buttons, dropdowns, and placement are consistent, with filters positioned above the data table.

#### Scenario: Consistent filter placement and styling
- **WHEN** an admin opens any admin module with a data table
- **THEN** the module SHALL render the filter toolbar above the table using the shared component markup and shared CSS, with identical spacing, typography, and control styling

### Requirement: Horizontal filter toolbar
The system SHALL render filters in a horizontal toolbar containing: a search input, status/type/category selects, a date range select, a sort select, a Reset Filters button, and an Export button. On smaller screens the toolbar SHALL wrap controls into multiple rows with consistent spacing and alignment.

#### Scenario: Toolbar renders on every module
- **WHEN** an admin navigates to any admin module
- **THEN** the toolbar SHALL display the module's configured controls in a single wrapped row

#### Scenario: Toolbar wraps on small screens
- **WHEN** the viewport width is below the toolbar breakpoint
- **THEN** the toolbar controls SHALL wrap onto additional rows without overflow or horizontal scrolling

### Requirement: Advanced Filters panel
The system SHALL provide a collapsible "Advanced Filters" section containing course, year level, department, status, category, date range, and sort controls, with Apply Filters and Reset Filters buttons that commit or clear the advanced selections.

#### Scenario: Apply advanced filters
- **WHEN** an admin opens the Advanced Filters panel, selects criteria, and clicks Apply Filters
- **THEN** the table SHALL be re-filtered using all selected criteria combined with toolbar filters

#### Scenario: Reset from advanced panel
- **WHEN** an admin clicks Reset Filters in the Advanced Filters panel
- **THEN** all filter criteria (toolbar and advanced) SHALL be cleared and the full dataset restored

### Requirement: Date range presets
The system SHALL provide date range presets: All Time, Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month, This Year, and Custom Range, in a single date range select on every module that supports date filtering.

#### Scenario: Selecting a preset filters by calendar range
- **WHEN** an admin selects "This Month" from the date range select
- **THEN** only records whose date falls within the current calendar month SHALL be shown

#### Scenario: Custom range selection
- **WHEN** an admin selects "Custom Range"
- **THEN** the system SHALL show from/to date inputs, and only records within the selected range SHALL be shown

### Requirement: Sort options
The system SHALL provide sort options relevant to the module, from the universal set: Newest, Oldest, A–Z, Z–A, Highest Quantity, Lowest Quantity, Most Requested, Least Requested.

#### Scenario: Sorting a module
- **WHEN** an admin selects a sort option
- **THEN** the table SHALL be re-sorted accordingly, combined with the active filters

### Requirement: Searchable dropdowns for long lists
The system SHALL render searchable dropdowns (custom comboboxes, no third-party dependency) for selects whose option lists may be long (e.g., course, item, department, admin), allowing typing to filter options.

#### Scenario: Typing filters dropdown options
- **WHEN** an admin types into a searchable dropdown
- **THEN** the option list SHALL narrow to matching options and the admin SHALL be able to select one

### Requirement: Live data filter options
The system SHALL populate filter option lists (course, year level, department, item category, admin role) from live backend data whenever available, and SHALL NOT rely on hardcoded option lists except as empty-data fallbacks.

#### Scenario: Options reflect loaded records
- **WHEN** registrations, inventory items, or admin accounts are loaded
- **THEN** the corresponding filter selects SHALL be populated from those records' distinct values

#### Scenario: Empty dataset fallback
- **WHEN** no records exist to derive an option list
- **THEN** the select SHALL show only the default "All" option

### Requirement: Combined filtering
The system SHALL allow all active filters (search, status, category, date range, sort) to be applied simultaneously, with results matching every active criterion.

#### Scenario: Search plus status plus date range
- **WHEN** an admin enters a search query, selects a status, and selects a date range
- **THEN** the table SHALL show only records matching the query AND the status AND the date range

### Requirement: Search fields
The system SHALL provide text search on every module, supporting at least the relevant identifiers: student name, student ID, transaction ID, item name, feedback ID, return request ID, and admin name, using case-insensitive tokenized matching.

#### Scenario: Search by identifier
- **WHEN** an admin types a student name, student ID, transaction ID, feedback ID, return request ID, item name, or admin name into the search box
- **THEN** matching records SHALL be shown immediately as the query is typed

### Requirement: Reset Filters button
The system SHALL provide a Reset Filters button in every filter toolbar that clears the search text, all selects, the date range, and the sort selection, restoring the full dataset.

#### Scenario: Reset restores full dataset
- **WHEN** an admin clicks Reset Filters with multiple filters active
- **THEN** all filters SHALL be cleared and the unfiltered dataset SHALL be shown

### Requirement: Per-module filter configurations
The system SHALL configure filters per module: dashboard (date range, course, year level, department, item category, inventory status), registrations (search, course, year level, status, date registered), transactions (search, course, item category, transaction type, payment status, date range), pickup confirmations (search, pickup status, item category, pickup date), inventory (search, category, stock status, date added, sort), feedback (search, category, rating, status, date submitted), returns (search, status, return reason, item category, request date), admin accounts (search, role, account status, department, date created).

#### Scenario: Each module shows its configured filters
- **WHEN** an admin opens a specific module
- **THEN** the toolbar SHALL contain exactly that module's configured filter controls

### Requirement: Dashboard analytics filtering
The system SHALL allow the dashboard analytics section to be filtered by date range, course, year level, department, item category, and inventory status, with all charts, stat cards, KPI cards, and sparklines recomputed from the filtered dataset.

#### Scenario: Analytics reflects selected criteria
- **WHEN** an admin selects a course and item category on the dashboard filter
- **THEN** the analytics charts and cards SHALL be recomputed using only records matching both criteria

### Requirement: Backend and data integrity
The system SHALL keep all existing backend logic, API endpoints, and MongoDB collections unchanged; all filtering, sorting, searching, and exporting SHALL be performed client-side on data fetched through the existing endpoints.

#### Scenario: No backend changes
- **WHEN** an admin uses any filter, sort, search, or export feature
- **THEN** no new API endpoints SHALL be called and no server-side logic SHALL be executed beyond the existing endpoints' standard responses
