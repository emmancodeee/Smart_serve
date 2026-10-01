## ADDED Requirements

### Requirement: Feedback management page header hierarchy

The Feedback Management page (`admin-feedback.html`) SHALL render its top section in a fixed vertical order with visible spacing between each element, so no element overlaps or covers another: eyebrow label "Feedback Management", heading "All Feedback", description "View and manage student feedback submissions.", the filter toolbar, then the data table.

#### Scenario: Heading block never overlaps filters

- **WHEN** the Feedback Management page renders at any supported viewport width (desktop, tablet, or mobile)
- **THEN** the "All Feedback" heading and its description SHALL be fully visible and not covered, covered-by, or overlapping the search/filter controls

#### Scenario: Filter toolbar sits below the heading

- **WHEN** the filter toolbar renders on the Feedback Management page
- **THEN** the toolbar SHALL occupy its own full-width row below the page description, separated by explicit spacing, and SHALL NOT share a row with the "All Feedback" heading

#### Scenario: Data table separated from filters

- **WHEN** the data table renders below the filter toolbar
- **THEN** visible spacing SHALL exist between the bottom of the filter toolbar and the top of the table, with no overlap between them

### Requirement: Feedback management filter toolbar responsive behavior

The filter toolbar on the Feedback Management page SHALL keep all controls fully visible and usable at every supported width by wrapping controls onto additional rows instead of shrinking, clipping, or overlapping them.

#### Scenario: Controls wrap below medium breakpoint

- **WHEN** the viewport narrows past the width at which all controls fit on one row
- **THEN** the controls SHALL wrap to a new row while remaining fully visible, unclipped, and non-overlapping

#### Scenario: Search input remains readable

- **WHEN** the filter toolbar renders at any supported width
- **THEN** the search input show the placeholder "Search feedback by student, subject, or name..." and remain wide enough for the placeholder text to be fully readable without being cut off

### Requirement: Feedback management layout changes are scoped

Layout fixes for the Feedback Management page SHALL apply to that page only and MUST NOT alter the layout, spacing, or responsive behavior of any other page, including admin returns, inventory, dashboard, and student-facing pages.

#### Scenario: Other pages unaffected

- **WHEN** the layout fixes for the Feedback Management page are applied
- **THEN** other pages SHALL render with their existing layouts unchanged

#### Scenario: Feedback management page design preserved

- **WHEN** the layout fixes are applied
- **THEN** the existing design SHALL be preserved: the dark-blue heading color, white rounded container, borders, shadows, control/button styling, fonts, and the existing breakpoints MUST remain unchanged, and no z-index or negative-margin tricks SHALL be used to force elements apart