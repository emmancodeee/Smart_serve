## ADDED Requirements

### Requirement: Header shows only title and subtitle without duplication
The Return Requests top header SHALL display "Welcome Admin" and "Return Requests" on the left, and Search, Notification, Date/time, Admin profile, and Logout on the right. The header SHALL NOT contain the description text "View and manage student return requests for modules, uniforms, and books."

#### Scenario: Header description removed
- **WHEN** the Return Requests page loads
- **THEN** the top header displays only "Welcome Admin" and "Return Requests" on the left
- **AND** the header does not contain the text "View and manage student return requests for modules, uniforms, and books."
- **AND** the Search icon, Notification icon, Date/time clock, Admin profile, and Logout button remain present

#### Scenario: Content section description preserved
- **WHEN** the Return Management content section loads
- **THEN** the sentence "View and manage student return requests for modules, uniforms, and books." is still present as the content description under "All Return Requests"
- **AND** the sentence is not shown anywhere else on the page

### Requirement: No overlapping header elements
The header SHALL lay out all elements with sufficient spacing so that no title, input, dropdown, button, icon, or text overlaps another element or extends outside the header at any viewport width.

#### Scenario: Desktop header layout
- **WHEN** the page is viewed on a desktop-width viewport
- **THEN** "Welcome Admin" and "Return Requests" are vertically and horizontally aligned in the header-left group
- **AND** Search, Notification, Date/time, Admin profile, and Logout are aligned in the header-right/control groups with consistent gaps
- **AND** no header element overlaps another header element or the page sidebar

#### Scenario: Narrow-header wrapping
- **WHEN** the viewport is too narrow to fit all header controls on one line
- **THEN** the header controls wrap to additional lines with adequate spacing instead of overlapping
- **AND** no header text is clipped or hidden behind another container

### Requirement: Return Management section structure
The Return Management section SHALL present, in order: the "Return Management" eyebrow, the "All Return Requests" title, the content description, the filter controls (Search, All Status, All Item Category, All Return Reason, All Date, All Time, Sort, Reset Filters, Export), and then the returns table.

#### Scenario: Section content order
- **WHEN** the Return Management section is inspected
- **THEN** the section shows the eyebrow, title, and description with adequate vertical spacing
- **AND** the description does not collide with the filter controls below it or the table below them

### Requirement: Filter controls have consistent spacing and wrap
The filter toolbar SHALL arrange its controls with consistent gap, margin, padding, height, and width, and SHALL wrap to additional rows when the available width is insufficient rather than overlapping.

#### Scenario: Filter toolbar on desktop
- **WHEN** the Return Requests page is viewed on a desktop viewport
- **THEN** the filter controls (search, status, item category, return reason, date, time, sort, reset filters, export) display with uniform spacing
- **AND** no control overlaps another control

#### Scenario: Filter toolbar wrapping on narrow widths
- **WHEN** the viewport is too narrow for all filter controls on one row
- **THEN** the controls wrap naturally into additional rows
- **AND** no control is shrunk to the point of clipping its text or overlapping its neighbors

#### Scenario: Filter functionality preserved
- **WHEN** the page is loaded after the layout fix
- **THEN** the search field still searches by student and item, the Status/Item Category/Return Reason/Date/Time dropdowns still filter, Sort still sorts, Reset Filters clears all filters, and Export still exports the current result set

### Requirement: Export button never overlaps other elements
The Export button SHALL be positioned within the filter toolbar layout so it does not overlap the search field, any dropdown, the Reset Filters button, the section title, or the table.

#### Scenario: Export button placement
- **WHEN** the Return Requests page is rendered at any viewport width
- **THEN** the Export button occupies its own space in the toolbar (beside or below the other filters depending on available width)
- **AND** it does not overlap the search field, dropdowns, Reset Filters, the "All Return Requests" title, or the table

### Requirement: Returns table layout and responsiveness
The returns table SHALL display all seven columns (Student, Items, Requested Date, Status, Priority, Submitted, Actions) with aligned headers, appropriate column widths, sufficient row height, and no clipped or overlapping text. On narrow viewports the table SHALL scroll horizontally instead of squeezing columns.

#### Scenario: Table column alignment on desktop
- **WHEN** the table is rendered on a desktop viewport
- **THEN** all seven column headers are visible and aligned with their column data
- **AND** the Actions column is not cut off and the table does not overflow its container

#### Scenario: Horizontal scroll on narrow viewports
- **WHEN** the viewport is narrower than the table's minimum content width
- **THEN** the table scrolls horizontally within its container
- **AND** the page itself does not overflow horizontally

### Requirement: Responsive layout without horizontal page overflow
The Return Requests page SHALL remain responsive on desktop, tablet, and mobile viewports, using the existing responsive sidebar behavior and adapting the header, filter toolbar, and table so that no page-level horizontal overflow or text overlap occurs.

#### Scenario: Tablet viewport
- **WHEN** the page is viewed at a tablet width
- **THEN** the filter controls wrap naturally into multiple rows and the header controls adapt without overlapping
- **AND** the content containers resize appropriately without overflow

#### Scenario: Mobile viewport
- **WHEN** the page is viewed at a mobile width
- **THEN** the sidebar uses the existing off-canvas responsive behavior (unchanged)
- **AND** the header elements stack or wrap adaptively without overlap
- **AND** the filter controls stack or wrap without overlap
- **AND** the table becomes horizontally scrollable if needed
- **AND** the page does not scroll horizontally at the page level

### Requirement: Visual theme preserved
The layout fixes SHALL NOT alter the existing visual identity of the page.

#### Scenario: Existing styling retained
- **WHEN** the layout fixes are applied
- **THEN** the SmartServe branding, sidebar (including its icon set and ordering), colors, header style, button styles, input styles, dropdown styles, typography, border styles, and border radii remain visually consistent with the rest of the admin pages
- **AND** no functionality, filtering logic, search logic, sorting, export, status handling, routing, authentication, or API behavior is changed