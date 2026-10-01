## ADDED Requirements

### Requirement: Inventory filter toolbar occupies exactly two rows on desktop
At desktop viewports, the Inventory Management filter toolbar SHALL lay out its controls in exactly two rows. The toolbar emits eight controls; every one of them SHALL be placed in one of those two rows, and no control SHALL wrap onto a third row. The Export button SHALL occupy the same row as the Sort control, the search field, and the Reset Filters button.

#### Scenario: Toolbar renders as two rows at desktop width
- **WHEN** the Inventory Management page is rendered at a desktop viewport width of 1024px or greater
- **THEN** the filter toolbar SHALL occupy exactly two rows of controls
- **AND** the Export button SHALL appear on the second row, beside Sort, the search field, and Reset Filters
- **AND** no filter control SHALL be placed on a third row

#### Scenario: Second row reads left to right
- **WHEN** the second filter row is inspected at desktop width
- **THEN** its controls SHALL appear in this order: Sort, Search, Reset Filters, Export

#### Scenario: No orphaned action control
- **WHEN** the filter toolbar is rendered at desktop width
- **THEN** the Export button SHALL NOT be the only control on its own row
- **AND** the Export button SHALL NOT appear below the Reset Filters button

### Requirement: First filter row holds four equal-width dropdown filters
The first row SHALL contain exactly the All Category, All Stock Status, All Date Added, and All Time dropdown filters, in that order. All four SHALL be rendered at equal width, at the same height, with the same border radius, and separated by a consistent gap. No one of the four SHALL be rendered noticeably wider than the others.

#### Scenario: Four dropdowns share the first row
- **WHEN** the first filter row is inspected at desktop width
- **THEN** it SHALL contain exactly four controls in this order: All Category, All Stock Status, All Date Added, All Time
- **AND** no other control SHALL appear on that row

#### Scenario: First row controls are equal width
- **WHEN** the rendered widths of the All Category, All Stock Status, All Date Added, and All Time controls are measured
- **THEN** all four widths SHALL be equal to one another
- **AND** no single control SHALL exceed the others by more than 1px of rounding tolerance

#### Scenario: First row shares the container's boundaries
- **WHEN** the first filter row is measured
- **THEN** its leftmost control SHALL begin at the same horizontal offset as the second row's leftmost control
- **AND** its rightmost control SHALL end at the same horizontal offset as the second row's rightmost control

#### Scenario: First row labels are not clipped
- **WHEN** the first filter row is rendered
- **THEN** each dropdown SHALL display its label — All Category, All Stock Status, All Date Added, All Time — without the text being truncated or overflowing its control

### Requirement: Second filter row proportions suit control content
The second row SHALL allocate horizontal space by fraction rather than fixed pixel widths, so that the Sort control occupies approximately one quarter of the row, the search field approximately two fifths, and the Reset Filters and Export buttons approximately one sixth each. No fixed pixel width SHALL be used that could overflow a normal desktop viewport. The search field SHALL be visibly wider than either button.

#### Scenario: Search field is the widest control on the row
- **WHEN** the rendered widths of the Sort control, search field, Reset Filters button, and Export button are compared
- **THEN** the search field SHALL be the widest of the four
- **AND** its width SHALL be at least 1.5 times the width of the Reset Filters button

#### Scenario: Buttons are balanced against each other
- **WHEN** the rendered widths of the Reset Filters and Export buttons are compared
- **THEN** the two widths SHALL be equal to one another
- **AND** the Sort control SHALL be wider than either button

#### Scenario: Row width is fluid
- **WHEN** the Inventory List container is resized across desktop widths without crossing a breakpoint
- **THEN** the second row SHALL continue to occupy a single row of four controls
- **AND** the four controls SHALL keep their relative proportions
- **AND** no horizontal scrollbar SHALL appear within the Inventory List container

### Requirement: Search field keeps its placeholder and stays on the second row
The search field SHALL retain the placeholder text "Search items by name, category, or unit of measure..." and SHALL remain on the second row beside Sort, Reset Filters, and Export. It SHALL be wide enough to display that placeholder without clipping, and SHALL NOT overlap its neighbouring controls.

#### Scenario: Placeholder fully readable
- **WHEN** the page is rendered at a viewport width of 1440px or wider
- **THEN** the search field SHALL be wide enough to display "Search items by name, category, or unit of measure..." without clipping or ellipsizing the text
- **AND** the field SHALL NOT overlap the Reset Filters or Export buttons

#### Scenario: Widest button label fits its track
- **WHEN** the page is rendered at any viewport width of 1024px or greater
- **THEN** the Reset Filters button SHALL be wide enough to render "Reset Filters" on a single line
- **AND** no control label SHALL wrap to a second line inside its 44px-tall control

### Requirement: All filter controls share one height
The All Category, All Stock Status, All Date Added, All Time, Sort, search, Reset Filters, and Export controls SHALL all be rendered at the same height. That height SHALL be the existing admin filter control height of 44px. No control SHALL be given an individual height differing from the others.

#### Scenario: Uniform control height
- **WHEN** the rendered heights of all eight filter controls are measured
- **THEN** every one of them SHALL be 44px tall
- **AND** no two controls SHALL differ in height

#### Scenario: Buttons match field height
- **WHEN** the Reset Filters and Export buttons are compared with the Sort dropdown and the search field
- **THEN** all four SHALL render at the same height
- **AND** all four SHALL be vertically aligned on the same baseline within the second row

### Requirement: Filter controls are separated by consistent spacing
All gaps between adjacent filter controls, horizontally and vertically, SHALL come from a single consistent spacing value. Controls SHALL NOT touch one another, SHALL NOT carry individual margins that create uneven rhythm, and the filter area SHALL NOT contain unnecessary empty space below the last row.

#### Scenario: Uniform horizontal gap
- **WHEN** the horizontal gaps between adjacent controls in either row are measured
- **THEN** every measured gap SHALL be equal to the same value
- **AND** the toolbar SHALL NOT exceed its declared gap between rows

#### Scenario: No dead space beneath the filter area
- **WHEN** the filter area is measured from its first row to the top of the inventory table
- **THEN** the only vertical space present SHALL be the toolbar's own row gap
- **AND** no extra empty row SHALL be introduced to accommodate wrapped controls

### Requirement: Filter controls stay inside the Inventory List container
The filter toolbar SHALL remain inside the existing Inventory List content container, aligned with the left and right margins of that container and of the inventory table below it. The toolbar SHALL NOT extend beyond the container's edges and SHALL NOT introduce horizontal overflow in order to keep controls on one row.

#### Scenario: Controls contained by the card
- **WHEN** the filter controls are measured against the Inventory List container
- **THEN** no control's left, right, top, or bottom edge SHALL fall outside the container's content box
- **AND** the toolbar SHALL have equal left and right margins inside the container

#### Scenario: No horizontal overflow introduced
- **WHEN** the Inventory Management page is rendered at desktop width
- **THEN** neither the Inventory List container nor the page body SHALL gain a horizontal scrollbar from the filter toolbar

### Requirement: Filter control order is preserved
The rendered order of the filter controls SHALL remain: All Category, All Stock Status, All Date Added, All Time, then Sort, search field, Reset Filters, Export. No filter SHALL be renamed, removed, or reordered.

#### Scenario: Documented order preserved
- **WHEN** the filter toolbar's controls are enumerated in DOM order
- **THEN** they SHALL be: All Category, All Stock Status, All Date Added, All Time, Sort, search field, Reset Filters, Export

#### Scenario: No control removed or renamed
- **WHEN** this change is applied
- **THEN** all eight controls documented above SHALL still be present
- **AND** each SHALL retain its existing accessible name and visible label

### Requirement: Toolbar DOM shape is pinned so the grid cannot desynchronize
The grid SHALL rely on a fixed, asserted control count and order rather than on an assumed count. The SmartFilter toolbar for this module SHALL emit exactly the eight controls listed above, in that order, and a regression test SHALL assert that shape. If the emitted control set ever changes, the test SHALL fail and the grid definition SHALL be updated in the same change.

#### Scenario: Control count and order are asserted
- **WHEN** the filter toolbar is built for the inventory module
- **THEN** the toolbar's main row SHALL contain exactly eight child elements
- **AND** those children SHALL be the Category select, the Stock Status select, the Date Added select, the date-range group, the Sort select, the search field, the Reset Filters button, and the Export button, in that order
- **AND** the test suite SHALL fail if this shape changes

#### Scenario: Hidden sub-controls do not consume grid tracks
- **WHEN** the Date Added custom-range sub-row is hidden
- **THEN** it SHALL remain nested inside its own group element
- **AND** it SHALL NOT be a direct child of the grid and SHALL NOT consume a column track

### Requirement: Filter behavior and exported data are unchanged
This change is presentational. Category, Stock Status, Date Added, All Time, Sort, search, Reset Filters, and Export SHALL all keep their existing behavior. Filtered rows, sort order, and exported CSV content SHALL be identical to the behavior before the layout change. No API, data source, or dependency SHALL change.

#### Scenario: Filtering still narrows rows
- **WHEN** a Category, Stock Status, Date Added, or All Time value is selected
- **THEN** the inventory table SHALL be filtered by that value exactly as before

#### Scenario: Search still filters rows
- **WHEN** text is typed into the search field
- **THEN** the inventory table SHALL be filtered on item name, category, and unit of measure exactly as before

#### Scenario: Sort still reorders rows
- **WHEN** a Sort option is selected
- **THEN** the inventory table SHALL be reordered according to that option and the column header indicators SHALL update

#### Scenario: Reset Filters still clears the filter state
- **WHEN** the Reset Filters button is clicked after filters have been applied
- **THEN** every filter, the search field, and the sort selection SHALL return to their default state
- **AND** the full inventory list SHALL be shown again

#### Scenario: Export still produces the same CSV
- **WHEN** the Export button is clicked
- **THEN** a CSV SHALL be downloaded using the existing filename and column set
- **AND** its contents SHALL reflect the currently filtered and sorted rows exactly as before

### Requirement: Existing SmartServe visual design is preserved
The filter controls SHALL retain their existing appearance: white control backgrounds, existing blue borders, existing border radii, existing blue filled Export button, existing Reset Filters styling, existing control typography, and the existing dark-blue Inventory List title bar. No new colors SHALL be introduced and no other Inventory Management content SHALL be restyled.

#### Scenario: Control colors unchanged
- **WHEN** the filter controls are compared to their appearance before this change
- **THEN** the dropdown and search backgrounds SHALL remain white
- **AND** the control borders SHALL remain the existing blue
- **AND** the Export button SHALL remain the existing blue fill with white text
- **AND** the Reset Filters button SHALL retain its existing white-and-outline treatment

#### Scenario: Typography unchanged
- **WHEN** the filter controls are compared to their appearance before this change
- **THEN** every control SHALL retain its existing font size, font weight, and text color

#### Scenario: Rest of the page untouched
- **WHEN** the Inventory Management page is compared to its appearance before this change
- **THEN** the Inventory List title bar, the inventory table, the overview cards, the sidebar, and the header SHALL be visually unchanged

### Requirement: Filter layout changes are scoped to the Inventory Management page
Any style that arranges the inventory filter toolbar SHALL be scoped to the inventory module. The shared filter toolbar script, the shared unprefixed toolbar class names, and the shared filter style rules SHALL remain unchanged in behavior and appearance for every other admin module. This change SHALL edit the existing inventory-scoped rules in place rather than appending a parallel duplicate block.

#### Scenario: Other admin modules unchanged
- **WHEN** the Dashboard, Supply & Stock, Request Management, Return Requests, Feedback Management, Announcements, Admin Accounts, Users, Transactions, or Pickup Confirmations pages are rendered
- **THEN** their filter toolbars SHALL retain their existing layout, control order, and appearance

#### Scenario: Shared component untouched
- **WHEN** this change is applied
- **THEN** the shared filter toolbar script SHALL NOT be modified
- **AND** the shared unprefixed toolbar style rules SHALL NOT be altered
- **AND** the unprefixed `.filter-control__select` minimum width SHALL NOT be changed

#### Scenario: No duplicate competing rules
- **WHEN** the stylesheet is inspected
- **THEN** the inventory filter grid SHALL be defined by one inventory-scoped rule set
- **AND** no additional competing inventory filter rule set SHALL be added elsewhere in the cascade

#### Scenario: Existing inventory-scoped overrides retained
- **WHEN** the inventory filter rules are inspected
- **THEN** the existing zero minimum-width overrides for the inventory controls SHALL still be present
- **AND** the duplicate toolbar bottom margin suppression SHALL still be present
