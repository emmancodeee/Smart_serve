## ADDED Requirements

### Requirement: A status selection SHALL restrict displayed records to that status
The Request Management Status filter SHALL offer exactly the options All Status, Pending, Approved, and Rejected. When a specific status is selected, every registration record rendered to the page SHALL have that status, and no record of any other status SHALL be rendered anywhere on the page. When All Status is selected, every active registration record SHALL be rendered, each exactly once.

#### Scenario: All Status shows every record
- **WHEN** the Status filter is set to All Status
- **THEN** every active registration record SHALL be rendered
- **AND** each record SHALL appear exactly once across the three status tables
- **AND** no record SHALL be rendered in more than one table

#### Scenario: Pending shows only Pending records
- **WHEN** the Status filter is set to Pending
- **THEN** every rendered record SHALL have status Pending
- **AND** no record with status Approved or Rejected SHALL be rendered anywhere on the page

#### Scenario: Approved shows only Approved records
- **WHEN** the Status filter is set to Approved
- **THEN** every rendered record SHALL have status Approved
- **AND** no record with status Pending or Rejected SHALL be rendered anywhere on the page

#### Scenario: Rejected shows only Rejected records
- **WHEN** the Status filter is set to Rejected
- **THEN** every rendered record SHALL have status Rejected
- **AND** no record with status Pending or Approved SHALL be rendered anywhere on the page

#### Scenario: Repeated switching updates the result every time
- **WHEN** the Status filter is switched in the sequence Pending, Approved, Rejected, All Status, Pending
- **THEN** the rendered records SHALL match the selected status after every single change
- **AND** no record from a previously selected status SHALL remain on the page

### Requirement: Status SHALL be applied in the filter pipeline, not only at render time
The selected status SHALL narrow records inside the shared filter pipeline, which runs source rows, then field filters including status, then date range, then search, then sort, then render. Status SHALL NOT be applied solely as a display-time decision that leaves the underlying row set untouched. Because status is applied in the pipeline, the resulting record set SHALL also drive CSV Export.

#### Scenario: Status narrows the record set before rendering
- **WHEN** the Status filter is evaluated
- **THEN** the status comparison SHALL occur within the filter callback alongside the course, year level, and student type comparisons
- **AND** the narrowed record set SHALL be the one passed to the render step

#### Scenario: Export reflects the status selection
- **WHEN** the Status filter is set to Approved and Export is clicked
- **THEN** the exported CSV SHALL contain only Approved records
- **AND** the exported CSV SHALL NOT contain any Pending or Rejected record

#### Scenario: Clearing the status restores the unfiltered record set
- **WHEN** the Status filter is changed from a specific status back to All Status
- **THEN** records of every status SHALL be eligible for rendering again

### Requirement: Status comparison SHALL use a value normalized for display
The status comparison SHALL be performed against a normalized value derived from the same field and the same helper that produces the row's Status badge, so that the filter and the badge cannot disagree. That helper lowercases the value and maps any value outside the set pending, approved, rejected to pending; it does not trim surrounding whitespace, and it SHALL NOT be changed to do so, because a value such as " approved " is displayed as Pending today and the filter must agree with what the badge shows. The normalization SHALL affect filtering only; the stored records and the displayed labels SHALL remain unchanged.

#### Scenario: Mixed capitalization in stored data still matches
- **WHEN** a record stores its status as "Approved" or "APPROVED" and the Approved filter is selected
- **THEN** that record SHALL be included in the result
- **AND** the comparison SHALL succeed regardless of case

#### Scenario: A status outside the three filterable values is treated as Pending
- **WHEN** a record stores a status value outside pending, approved, and rejected, and the Pending filter is selected
- **THEN** that record SHALL be included in the result
- **AND** the record's badge SHALL read Pending, matching the filter that selected it

#### Scenario: Stored records are not modified
- **WHEN** the status filter is applied
- **THEN** no registration record SHALL be created, deleted, duplicated, reassigned, or have its stored status value changed
- **AND** no record SHALL be moved between statuses

### Requirement: The rendered Status badge SHALL always agree with the active status filter
For every record rendered while a specific status is selected, the Status badge in that record's row SHALL display the selected status. This invariant SHALL hold for every record rendered on the page at that moment, and SHALL continue to hold after any change of status selection or of the underlying records.

#### Scenario: Badge matches the selected status for every row
- **WHEN** the Status filter is set to Rejected
- **THEN** every rendered row's Status badge SHALL read Rejected
- **AND** no rendered row SHALL display a Pending or Approved badge

#### Scenario: Badge agrees after a status change is applied to a record
- **WHEN** a record's status is changed through the page's action buttons and the filter is re-applied
- **THEN** the record SHALL appear in, and be excluded from, the tables matching its new status
- **AND** its badge SHALL display the new status

#### Scenario: Badge and filter stay in agreement for the active-status value
- **WHEN** a record's stored status is the active value permitted by the user schema but not offered as a filter option
- **THEN** the badge rendered for that record SHALL match the status of the table it is displayed in

### Requirement: Status SHALL compose with every other active filter
The status filter SHALL combine with course, year level, student type, date range, and search as a conjunction. When multiple filters are active, the rendered records SHALL satisfy all of them simultaneously. A record SHALL NOT be included merely because it matches one filter while failing another.

#### Scenario: Status combined with Course
- **WHEN** the Status filter is set to Approved and a course is selected
- **THEN** every rendered record SHALL have status Approved
- **AND** every rendered record SHALL belong to the selected course

#### Scenario: Status combined with Year Level
- **WHEN** the Status filter is set to Rejected and a year level is selected
- **THEN** every rendered record SHALL have status Rejected
- **AND** every rendered record SHALL belong to the selected year level

#### Scenario: Status combined with Student Type
- **WHEN** the Status filter is set to Pending and a student type is selected
- **THEN** every rendered record SHALL have status Pending
- **AND** every rendered record SHALL have the selected student type

#### Scenario: Status combined with a date range
- **WHEN** the Status filter is set to a specific status and a date preset or custom range is selected
- **THEN** every rendered record SHALL satisfy the status selection
- **AND** every rendered record SHALL fall within the selected date range

#### Scenario: Status combined with search
- **WHEN** the Status filter is set to Pending and the search field contains a term
- **THEN** every rendered record SHALL have status Pending
- **AND** every rendered record SHALL match the search term
- **AND** no Approved or Rejected record SHALL be rendered solely because it matches the search term

#### Scenario: Sort does not alter status membership
- **WHEN** a sort option is selected
- **THEN** the set of rendered records SHALL be unchanged
- **AND** only their order SHALL change

### Requirement: Reset Filters SHALL clear the status selection
Clicking Reset Filters SHALL return the status selection to All Status, return every other filter to its default, and re-render the full active dataset with each record appearing exactly once. No status narrowing from a previous selection SHALL persist.

#### Scenario: Reset restores the full dataset
- **WHEN** a specific status and other filters are active and Reset Filters is clicked
- **THEN** the Status filter SHALL read All Status
- **AND** every other filter SHALL read its default value
- **AND** every active registration record SHALL be rendered exactly once

#### Scenario: Reset after a status-only selection
- **WHEN** only the Status filter is set to a specific status and Reset Filters is clicked
- **THEN** every active registration record SHALL be rendered
- **AND** no status narrowing SHALL remain in effect

### Requirement: A status selection with no matches SHALL show the existing empty state
When the active filters match no records for a displayed table, the existing empty-state message for that table SHALL be shown. The page SHALL NOT populate a table with records of another status to avoid showing an empty result.

#### Scenario: Empty result for a specific status
- **WHEN** the Status filter is set to a status for which no records match the other active filters
- **THEN** the table for that status SHALL display its existing empty-state message
- **AND** no other status's records SHALL be displayed in its place

#### Scenario: Empty result does not leak across tables
- **WHEN** one status table has no matching records and another has some
- **THEN** the empty table SHALL show only its empty-state message
- **AND** the populated table SHALL show only its own matching records

### Requirement: Status filtering SHALL be applied frontend-side without new requests
The status filter SHALL be evaluated against the registration records already held in the page. Selecting a status SHALL NOT trigger an additional network request, and the API contract SHALL remain unchanged. Archived registrations SHALL remain excluded.

#### Scenario: Selecting a status issues no request
- **WHEN** the Status filter is changed
- **THEN** no network request SHALL be issued
- **AND** the result SHALL be derived from the already-loaded record set

#### Scenario: Archived registrations stay excluded
- **WHEN** any status is selected
- **THEN** archived registrations SHALL NOT be rendered

#### Scenario: The API contract is unchanged
- **WHEN** this change is applied
- **THEN** no route, service, model, or schema SHALL be modified
- **AND** no status query parameter SHALL be introduced

### Requirement: Status filtering changes SHALL not alter the page's presentation
This change SHALL be limited to filtering logic. The filter toolbar layout, dropdown appearance and options, the three Pending/Approved/Rejected sections and their headings, the table columns, the status badges, the row action buttons, and all colours, spacing, and typography SHALL remain as they are.

#### Scenario: Filter control is unchanged
- **WHEN** the Request Management page is compared before and after this change
- **THEN** the Status dropdown SHALL offer the same four options with the same labels
- **AND** its size, position, and styling SHALL be unchanged

#### Scenario: Sections and tables are unchanged
- **WHEN** the page is compared before and after this change
- **THEN** the Pending, Approved, and Rejected sections and their headings SHALL be unchanged
- **AND** the table columns, Status badges, and action buttons SHALL be unchanged
- **AND** the existing empty-state messages SHALL be unchanged

#### Scenario: Section visibility still follows the selected status
- **WHEN** a specific status is selected
- **THEN** the section for that status SHALL be visible
- **AND** the sections for the other two statuses SHALL be hidden
- **AND** the visible section SHALL contain only records of the selected status

#### Scenario: Other admin modules are unaffected
- **WHEN** any other admin view is rendered
- **THEN** its filter behaviour SHALL be unchanged
- **AND** the shared filter component SHALL NOT be modified

### Requirement: The status filter SHALL be covered by automated tests
Automated tests SHALL cover the registrations status filter, asserting the filtered record set for each of the four status options, composition with the other filters and with search, reset, the normalization cases, and the absence of duplicate rendering under All Status. The shared filter component SHALL NOT be modified to make the registrations configuration testable.

#### Scenario: Each status option is asserted
- **WHEN** the registrations filter is exercised with the full dataset loaded
- **THEN** a test SHALL assert the exact resulting record set for All Status, Pending, Approved, and Rejected

#### Scenario: A test guards against the regression
- **WHEN** a status selection is made
- **THEN** a test SHALL fail if any record of a different status is included in the result

#### Scenario: No-duplicate-rendering is asserted
- **WHEN** All Status is selected
- **THEN** a test SHALL assert that the combined row count across the three tables equals the number of active records

#### Scenario: The shared component is untouched
- **WHEN** this change is applied
- **THEN** no file under the shared filter component SHALL be modified
