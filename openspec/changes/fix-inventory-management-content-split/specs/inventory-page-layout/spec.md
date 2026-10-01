## REMOVED Requirements

### Requirement: Summary cards display in a 4-column row
**Reason**: The four Inventory Summary stat cards (`Total Items`, `Low Stock`, `Categories`, `Last Updated`) were duplicated onto the Inventory Management page, where they repeated data already shown by the Dashboard's Inventory Overview in `public/admin.html` and pushed the real module content below the fold. The Dashboard remains the single home for those summary metrics, and the Inventory Management page is now dedicated to its filters and inventory table.
**Migration**: Users who previously read counts on the Inventory Management page SHALL read them on the Dashboard's Inventory Overview instead. No data, API, or permission changes are required. The `GET /api/auth/inventory/analytics/summary` endpoint is retained.

### Requirement: Information banner displays below summary cards
**Reason**: The read-only notice ("Inventory is read-only here. Add supply or remove stock from the Supply & Stock page.") was the last block standing between the page header and the module content. It duplicated guidance the page already conveys, since the page exposes no mutating controls, and it pushed the Inventory List below the fold. The Supply & Stock page remains reachable from the shared sidebar for both roles, so the inline link is redundant.
**Migration**: No data, API, route, or permission changes. Users who relied on the notice to reach Supply & Stock SHALL reach it from the shared sidebar, which lists Supply & Stock for both Admin and Super Admin.

## ADDED Requirements

### Requirement: Page renders a single module content block
The Inventory Management page SHALL render exactly one module content block, consisting of the page header followed by the Inventory List section, which contains the "Inventory List" title bar, the filter toolbar, the inventory table, and pagination. The page SHALL NOT render an Inventory Summary section, its stat cards, a read-only notice or banner, or any other summary, notice, or duplicate module content. The Inventory List section SHALL be the first content below the page header.

#### Scenario: Summary cards absent from inventory page
- **WHEN** a user loads the Inventory Management page
- **THEN** the `Total Items`, `Low Stock`, `Categories`, and `Last Updated` cards SHALL NOT be present in the page
- **AND** the first content below the page header SHALL be the Inventory List section

#### Scenario: Read-only notice absent
- **WHEN** a user loads the Inventory Management page
- **THEN** no read-only notice, banner, or alert element SHALL be rendered above the Inventory List title bar
- **AND** the text "Inventory is read-only here" SHALL NOT appear anywhere in the page

#### Scenario: Read-only notice absent for super admin
- **WHEN** a super admin loads the Inventory Management page
- **THEN** the read-only notice SHALL NOT be rendered
- **AND** the Inventory List section SHALL still be the first content below the page header

#### Scenario: No Supply and Stock link in the content region
- **WHEN** the Inventory Management page is rendered
- **THEN** the main content region SHALL NOT contain a link to `/admin/supply-stock`
- **AND** the shared sidebar SHALL still provide navigation to Supply & Stock

#### Scenario: No empty container where the notice was
- **WHEN** the Inventory Management page is rendered
- **THEN** no element, wrapper, or reserved spacing SHALL remain where the notice previously appeared
- **AND** no artificial margin or padding SHALL be introduced to compensate for the removed notice

#### Scenario: One content block
- **WHEN** the Inventory Management page is rendered
- **THEN** the "Inventory List" title bar, the filter controls, and the inventory table appear in the same content flow, with the table directly below the filters
- **AND** no separate stacked page or split content region is visible

### Requirement: Page markup is well-formed
The Inventory Management page markup SHALL be well-formed HTML. Every element that is opened SHALL be closed by a matching end tag within its own section, and the page SHALL NOT contain unmatched or stray end tags. Specifically, the header content wrapper SHALL be closed within the header, and the Inventory List section SHALL NOT contain an end tag that closes no element opened within that section.

#### Scenario: Balanced element nesting
- **WHEN** the Inventory Management page markup is parsed
- **THEN** the number of opened and closed `div` elements in the file is equal
- **AND** every `</div>` token matches a `div` that is open at that point in document order

#### Scenario: Header wrapper closed within header
- **WHEN** the Inventory Management page markup is parsed
- **THEN** the `div` wrapper that contains the header left and header right groups SHALL be closed before the `</header>` end tag

#### Scenario: No stray end tag in the inventory list section
- **WHEN** the Inventory Management page markup is parsed
- **THEN** the Inventory List section contains no end tag that closes no element opened within that section
- **AND** the page does not rely on browser error recovery to produce the intended structure

#### Scenario: Layout survives without error recovery
- **WHEN** the Inventory Management page is rendered
- **THEN** the module content is a descendant of the main content container, so the sidebar offset applies
- **AND** the rendered structure is the same whether or not the parser performs error recovery

### Requirement: Inventory List title bar is preserved
The Inventory List section SHALL retain its "Inventory List" title bar, rendered with the existing SmartServe module-title styling and rounded top corners, and SHALL NOT be renamed, removed, or functionally altered. The title bar SHALL remain the first element of the Inventory List section.

#### Scenario: Title bar retained
- **WHEN** the Inventory Management page is rendered
- **THEN** the "Inventory List" heading SHALL be visible at the top of the Inventory List card, above the filter controls
- **AND** it SHALL use the shared module-title background, foreground color, padding, and border radius

#### Scenario: Title bar bleeds to the card edges
- **WHEN** the Inventory Management page is rendered
- **THEN** the "Inventory List" title bar SHALL extend to the left and right edges of the Inventory List card with rounded top corners
- **AND** no gutter SHALL appear between the title bar and the card edges

#### Scenario: No inner wrapper added or removed around the title
- **WHEN** the Inventory Management page markup is inspected
- **THEN** the `h2` containing "Inventory List" SHALL remain inside its existing wrapper element
- **AND** the full-bleed spacing of the title SHALL NOT depend on that wrapper being restyled

### Requirement: Inventory filter toolbar uses a balanced two-row layout
On desktop viewports, the Inventory Management filter toolbar SHALL arrange its controls in two rows sharing the same left and right boundaries. The first row SHALL contain the All Category, All Stock Status, All Date Added, and All Time dropdowns in four equal-width tracks. The second row SHALL contain the Sort dropdown, the search field, the Reset Filters button, and the Export button, with the search field the widest control and the two buttons equal to one another. Control heights SHALL remain 44px, gaps SHALL be consistent, and controls SHALL NOT overlap. The toolbar emits eight controls: the Date Added config field renders both an "All Date Added" select and the separate date-range preset select whose default option reads "All Time", and both SHALL be retained. Filter options, presets, and filtering behavior SHALL remain unchanged. The precise column-track arithmetic that realises these proportions is specified by the `fix-inventory-filter-layout-sizing` change.

#### Scenario: Four controls across the first row
- **WHEN** the page is rendered at a desktop width sufficient for four tracks
- **THEN** the All Category, All Stock Status, All Date Added, and All Time controls occupy the first row in four equal-width tracks
- **AND** no control wraps to a second line within that row

#### Scenario: Four controls share the second row
- **WHEN** the page is rendered at a desktop width
- **THEN** the Sort dropdown, the search field, the Reset Filters button, and the Export button all occupy the second row
- **AND** the Export button SHALL NOT wrap onto a third row

#### Scenario: Search placeholder readable
- **WHEN** the filter toolbar is rendered
- **THEN** the search input SHALL be wide enough to display the placeholder "Search items by name, category, or unit of measure..." without clipping the text
- **AND** the search input SHALL NOT overlap the Reset Filters or Export buttons

#### Scenario: Both rows share the same boundaries
- **WHEN** the filter toolbar is rendered
- **THEN** the left edge of the first row controls and the left edge of the Sort dropdown SHALL align
- **AND** the right edge of the All Time control and the right edge of the Export button SHALL align

#### Scenario: Natural collapse on narrower viewports
- **WHEN** the viewport narrows until four tracks no longer fit
- **THEN** the toolbar SHALL reduce to two tracks and the search field SHALL span the full row width
- **AND** controls SHALL wrap with consistent spacing and SHALL NOT overlap or overflow horizontally

#### Scenario: Filter behavior unchanged
- **WHEN** any filter control, the search field, Reset Filters, or Export is used
- **THEN** the filtered rows, sort order, and exported CSV SHALL be identical to the behavior before the layout change
- **AND** the same filter options and date-range presets SHALL be available

### Requirement: Filter layout changes are scoped to the Inventory Management page
Any style that arranges the inventory filter toolbar SHALL be scoped to the inventory module. The shared filter toolbar component, its shared class names, and the shared filter styles SHALL remain unchanged in behavior and appearance for every other admin module. No shared filter toolbar source file SHALL be modified by this change.

#### Scenario: Other admin modules unchanged
- **WHEN** the Dashboard, Supply & Stock, Request Management, Return Requests, Feedback Management, Announcements, Admin Accounts, Users, Transactions, or Pickup Confirmations pages are rendered
- **THEN** their filter toolbars SHALL retain their existing layout, control order, and appearance

#### Scenario: Shared component untouched
- **WHEN** this change is applied
- **THEN** the shared filter toolbar script SHALL NOT be modified
- **AND** the shared unprefixed toolbar style rules SHALL NOT be altered

#### Scenario: No new nested scroll container
- **WHEN** the Inventory Management page is rendered
- **THEN** the main content region SHALL NOT create its own vertical scroll container
- **AND** the page SHALL NOT introduce nested horizontal scrollbars
- **AND** the inventory table SHALL remain horizontally scrollable within its existing table container only
