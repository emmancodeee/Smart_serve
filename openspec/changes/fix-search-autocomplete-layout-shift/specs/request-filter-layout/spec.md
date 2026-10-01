## ADDED Requirements

### Requirement: Search focus never shifts the filter layout

In Admin > Request Management > Pending Registrations, focusing or clicking the "Search registrations..." field SHALL NOT open any suggestion or autocomplete dropdown, and SHALL NOT change the position, size, width, height, alignment, or spacing of any filter control, either filter row, or the filter container. The two-row shared-edge grid SHALL remain exactly as rendered while the Search field is focused.

#### Scenario: Focusing Search keeps every control fixed

- **WHEN** an admin clicks or focuses the Search field
- **THEN** no suggestion or autocomplete dropdown appears
- **AND** All Status, Year/Category, All Year Level, All Student Type, All Date, All Time, Sort, Reset Filters, and Export all remain in their exact previous positions and sizes
- **AND** Row 2 does not move downward and the filter container height does not increase

#### Scenario: Search focus shows no overlay

- **WHEN** an admin focuses the Search field and the field contains one or more previously-typed characters
- **THEN** the browser does not render its native autofill/autocomplete list
- **AND** the Search field stays in place with its existing width, height, border radius, and styling

### Requirement: Blur restores the same layout

When the Search field loses focus, the suggestion/autocomplete dropdown SHALL NOT be open and the layout SHALL be identical to before focus — with no jump or reflow.

#### Scenario: Blur closes cleanly

- **WHEN** an admin clicks away from the Search field
- **THEN** the layout is identical to the state before the Search field was focused
- **AND** no controls move, resize, or re-align

### Requirement: Existing search functionality preserved

The fix SHALL NOT change how the Search field filters registration records, how Reset Filters clears it, or how Export works. Typing a query SHALL still filter the table as before; only the browser's native autocomplete suggestion display is suppressed.

#### Scenario: Typing still filters records

- **WHEN** an admin types text into the Search field
- **THEN** the table filters as before, without any placeholder list or suggestion UI appearing

#### Scenario: Reset and Export unchanged

- **WHEN** an admin clicks Reset Filters or Export
- **THEN** both behave exactly as before the fix