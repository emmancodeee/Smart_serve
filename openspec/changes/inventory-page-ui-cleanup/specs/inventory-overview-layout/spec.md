## ADDED Requirements

### Requirement: Page container layout
The Inventory Management content area (`.admin-page .admin-main` containing the `#analytics` section) SHALL be centered with a consistent maximum content width of 1280px, use equal left/right margins, keep content clear of the browser edges, and apply a consistent page padding scale (32px desktop, 20px tablet, 16px mobile). Vertical spacing between the page header and the Inventory Overview section SHALL be consistent with other section gaps, and the page SHALL feel compact without excessive empty space.

#### Scenario: Centered container on desktop
- **WHEN** the page is rendered on a desktop viewport wider than 1280px
- **THEN** the inventory content is centered horizontally with equal left/right margins and a maximum width of 1280px

#### Scenario: Balanced edge padding on mobile
- **WHEN** the page is rendered on a viewport narrower than 640px
- **THEN** the content maintains at least 16px padding on all sides with no content touching the browser edges

### Requirement: Inventory Overview header alignment
The "Inventory Overview" header band SHALL keep its existing navy color (`#152c69`), typography, and 28px top border radius. Its horizontal and vertical padding SHALL be consistent, and the section content below SHALL align with the header's left padding.

#### Scenario: Header title alignment
- **WHEN** the Inventory Overview section is rendered
- **THEN** the header band has consistent padding on all sides and its title is vertically centered within the band

#### Scenario: Content aligns with header
- **WHEN** the Inventory Overview section is rendered
- **THEN** the first column of filter controls and summary cards below the header shares the same left edge as the header title

### Requirement: Filter toolbar layout
The analytics filter toolbar SHALL arrange its controls (Date Range, Course, Year Level, Item Category, Inventory Status, Reset, Export) in a single wrapping row on desktop, with uniform control heights (44px), uniform gaps, uniform border radius, and uniform horizontal padding. The toolbar SHALL NOT create excessive vertical space between rows when wrapping occurs. Filter options, presets, and behavior SHALL remain unchanged.

#### Scenario: Single row on desktop
- **WHEN** the page is rendered with a content width sufficient for all controls
- **THEN** all filter controls are positioned on one row with equal spacing between them and consistent heights

#### Scenario: Natural wrap on narrower widths
- **WHEN** the viewport narrows until the controls no longer fit on one row
- **THEN** the controls wrap to additional rows with consistent row spacing and no overlapping

#### Scenario: Filter behavior unchanged
- **WHEN** a filter control is changed
- **THEN** the analytics data and charts update exactly as before the layout change, with the same options available

### Requirement: Summary stat card grid
The summary stat cards (Units Available, Units Distributed, Projected Demand, Items Below Reorder Point, Inventory Adjustments, Active Cohorts) SHALL be laid out in a CSS grid with 5 columns (`repeat(5, minmax(0, 1fr))`) on desktop, with the sixth card (Active Cohorts) flowing to the first position of the next row. The grid SHALL use equal gaps (20px) and responsive breakpoints (3 columns ≤1023px, 2 columns ≤639px, 1 column ≤480px) without horizontal overflow.

#### Scenario: Five cards across on desktop
- **WHEN** the page is rendered at desktop width
- **THEN** exactly five summary cards occupy the first row and Active Cohorts occupies the first cell of the second row

#### Scenario: Responsive card columns
- **WHEN** the viewport is between 640px and 1023px
- **THEN** the cards render in 3 columns per row

#### Scenario: No horizontal overflow on mobile
- **WHEN** the viewport is 480px or narrower
- **THEN** cards render in a single column and the page has no horizontal scroll

### Requirement: Stat card internal alignment
Each summary stat card SHALL use consistent internal padding (24px), a fixed-size icon container (40px) positioned top-right without overlapping the title, and consistent vertical rhythm: 12px between title and value, 8px between value and description, 16px between description and sparkline. Titles SHALL wrap naturally with enough width and SHALL NOT be shrunk to avoid collision. Sparklines SHALL be anchored to the bottom of the card so all sparklines align across cards.

#### Scenario: Icon never overlaps title
- **WHEN** a card title such as "Units Distributed (30 Days)" is rendered in a narrow card
- **THEN** the title wraps onto additional lines and never overlaps or is covered by the icon

#### Scenario: Sparklines bottom-aligned
- **WHEN** cards in the same row have descriptions of different lengths
- **THEN** all sparklines sit flush at the bottom edge of their cards

### Requirement: Analytics two-column grid
The analytics chart cards SHALL be arranged in a two-column CSS grid (`repeat(2, minmax(0, 1fr))`) with a 24px gap. Row pairing SHALL be: Items Given Out with Most Requested Items, Low Stock Items with Active Courses, Inventory Changes with Upcoming Demand. Cards in the same row SHALL have equal heights and aligned tops. At widths below 900px the grid SHALL collapse to a single column. Chart data and rendering logic SHALL NOT change.

#### Scenario: Paired cards aligned
- **WHEN** the analytics grid is rendered at desktop width
- **THEN** each row contains two cards of equal height with consistent vertical spacing between rows

#### Scenario: Single column below 900px
- **WHEN** the viewport is narrower than 900px
- **THEN** the chart cards stack in a single column with consistent gaps

### Requirement: Analytics card internals
Each chart card SHALL use consistent internal padding (24px), a heading with 16px bottom spacing above a divider, and chart content that never touches the card borders. Chart containers SHALL have a consistent minimum height (280px) and full width, with axis labels and data labels given breathing room and no overlapping labels.

#### Scenario: Chart padding consistency
- **WHEN** all six chart cards are rendered
- **THEN** every card uses the same internal padding and heading/divider spacing

#### Scenario: Labels not clipped
- **WHEN** a chart renders axis or data labels
- **THEN** the labels remain fully visible inside the card with space between labels and card borders

### Requirement: Operational Summary KPI grid
The Operational Summary SHALL render its six KPI items (Units Distributed, Highest Utilization Item, Most Active Course, Estimated Stock Coverage, Critical Low Stock Items, Slow Moving Items) in a 3-column by 2-row CSS grid with equal gaps (20px), equal card widths, and equal card heights. KPI cards SHALL use consistent internal padding and aligned icons, labels, and values. Long values SHALL wrap naturally without overflowing. The grid SHALL collapse to 2 columns ≤1024px and 1 column ≤640px.

#### Scenario: Three by two on desktop
- **WHEN** the Operational Summary is rendered at desktop width
- **THEN** six KPI cards appear in exactly 3 columns and 2 rows with equal gaps and equal heights per row

#### Scenario: Long value wrapping
- **WHEN** a KPI value is longer than its card width
- **THEN** the value wraps to additional lines and does not overflow or clip

### Requirement: Responsive integrity
The Inventory Management page SHALL remain clean at large desktop, standard desktop, laptop, tablet, and mobile widths with no horizontal overflow, no text overlapping, no cards touching, no clipped graphs, and no long titles breaking the layout. All layout SHALL use CSS Grid/Flexbox and media queries rather than fixed positioning.

#### Scenario: Tablet and mobile checks
- **WHEN** the page is rendered at 768px and 390px viewports
- **THEN** all sections render without horizontal scroll, overlapping text, or clipped chart content

### Requirement: No functional or visual redesign changes
The layout cleanup SHALL NOT alter any functionality, database logic, API calls, filter behavior, chart data or logic, sidebar design, header design, color scheme, routes, or existing features. All existing sections, cards, graphs, and information SHALL remain present. Changes SHALL be limited to spacing, padding, alignment, sizing, grid layout, text wrapping, chart container sizing, and responsive behavior.

#### Scenario: Behavior preserved
- **WHEN** the layout changes are applied
- **THEN** all filters, charts, tables, and KPIs function and display the same data as before with the same colors and the same visual theme
