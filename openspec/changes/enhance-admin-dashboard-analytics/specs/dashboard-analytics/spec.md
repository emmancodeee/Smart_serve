## ADDED Requirements

### Requirement: Items Given Out Area Chart
The Items Given Out panel SHALL render an area chart: dates on the x-axis, units distributed on the y-axis, a smooth curve with a light blue filled area (`#EFF6FF`) beneath a blue line (`#2563EB`) with circular points, hover tooltips showing date and units, and an empty state when no distribution data exists for the selected timeframe.

#### Scenario: Distribution data exists
- **WHEN** the admin opens the dashboard with distribution records in the selected timeframe
- **THEN** the area chart renders dates on the x-axis, units distributed on the y-axis, a smooth blue line with circular points over a light blue fill, and hovering a point shows a tooltip with date and units

#### Scenario: No distribution data
- **WHEN** there are no distribution records in the selected timeframe
- **THEN** the panel shows the empty state instead of an empty chart

### Requirement: Most Requested Items Horizontal Bar Chart
The Most Requested Items panel SHALL render a horizontal bar chart of the top 10 requested items, sorted from highest to lowest request count, with item names on the left, request counts on the right, blue-to-gold gradient bars, a tooltip showing the exact request count, and a responsive layout.

#### Scenario: Items requested
- **WHEN** the dashboard loads with request data
- **THEN** up to 10 items are listed sorted by request count descending, with names left, counts right, gradient bars, and hover tooltips with exact counts

#### Scenario: Fewer than 10 items
- **WHEN** fewer than 10 items were requested
- **THEN** the chart renders only the items that have request data, without blank rows

### Requirement: Low Stock Items Status Bar Chart
The Low Stock Items panel SHALL render a horizontal bar chart sorted from lowest stock to highest, with bars colored by status — Green (`#10B981`) = Safe, Yellow (`#FBBF24`) = Warning, Red (`#EF4444`) = Critical — showing the remaining quantity and the reorder threshold in the tooltip, with critical items visually highlighted.

#### Scenario: Low stock data present
- **WHEN** inventory items exist with quantities at or below reorder levels
- **THEN** the chart lists items lowest-stock first with status-colored bars, remaining quantity shown, reorder threshold in the tooltip, and critical items highlighted

#### Scenario: All items healthy
- **WHEN** no item is at or below its reorder level
- **THEN** the panel renders the healthiest items or shows the empty state, and never renders broken bars

### Requirement: Active Courses Donut Chart
The Active Courses panel SHALL render a donut chart with one slice per course sized by request count, showing percentages, the total request count in the center, an interactive legend, and a tooltip with course name, request count, and percentage.

#### Scenario: Course data present
- **WHEN** registrations exist with course allocations in the timeframe
- **THEN** the donut renders one slice per course with center total, percentage labels, an interactive legend, and tooltips showing course, count, and percentage

#### Scenario: No course data
- **WHEN** no course requests exist in the timeframe
- **THEN** the donut panel shows the empty state

### Requirement: Inventory Changes Timeline
The Inventory Changes panel SHALL render a chronological timeline of inventory activities (Stock Added, Stock Updated, Quantity Adjusted, Item Deleted, Manual Correction), each entry with an icon, date, time, admin name, action, and quantity changed, color-coded Green = Added, Blue = Updated, Orange = Adjusted, Red = Deleted. When no activity exists it SHALL display "No inventory changes recorded."

#### Scenario: Activity exists
- **WHEN** inventory transactions exist in the timeframe
- **THEN** the timeline lists entries newest-first with icon, date, time, admin name, action, and quantity change, color-coded by action type

#### Scenario: No activity
- **WHEN** no inventory transactions exist in the timeframe
- **THEN** the panel displays "No inventory changes recorded."

### Requirement: Upcoming Demand Forecast Line Chart
The Upcoming Demand panel SHALL render a forecast line chart with upcoming weeks on the x-axis, predicted demand on the y-axis, a smooth line, a confidence shaded area around the forecast, and a tooltip; the forecast SHALL be derived from previous inventory requests.

#### Scenario: Historical data present
- **WHEN** inventory request history exists
- **THEN** the chart renders a smooth forecast line for upcoming weeks with a confidence band and hover tooltips

#### Scenario: No historical data
- **WHEN** no request history exists
- **THEN** the panel shows the empty state

### Requirement: Operational Summary KPI Dashboard
The Operational Summary SHALL render as a responsive grid of KPI statistic cards — Units Distributed, Highest Utilization Item, Most Active Course, Estimated Stock Coverage, Critical Low Stock Items, Slow Moving Items — each card with a large number, small label, related icon, color indicator, and optional percentage change.

#### Scenario: KPI cards render
- **WHEN** the admin views the dashboard
- **THEN** the summary renders as responsive KPI cards with number, label, icon, color indicator, and percentage change where applicable

#### Scenario: Missing KPI values
- **WHEN** a metric has no data
- **THEN** the card shows a neutral value (e.g., "—" or "0") with its label, never an empty card

### Requirement: Inventory Overview Cards with Sparklines
Each Inventory Overview stat card SHALL keep its existing layout and icon and add a tiny sparkline at the bottom of the card, subtle hover animation, slight shadow, rounded corners, improved spacing, no icon/title overlap, and better text wrapping for long titles.

#### Scenario: Sparklines present
- **WHEN** the dashboard loads
- **THEN** every stat card renders its small sparkline, hover animation, shadow, and rounded corners without icon/title overlap

#### Scenario: Long titles
- **WHEN** a card label is long
- **THEN** the label wraps cleanly and never overlaps the icon

### Requirement: Global Timeframe Filter
The day/week/month/year filter SHALL drive every analytics chart, KPI card, and sparkline: changing the filter re-renders all visualizations against the selected timeframe.

#### Scenario: Filter changes
- **WHEN** the admin selects a different timeframe (day, week, month, year)
- **THEN** every chart, KPI card, and sparkline updates to the selected timeframe

#### Scenario: Default timeframe
- **WHEN** the dashboard loads
- **THEN** the month timeframe is selected by default and all charts render month data

### Requirement: Chart Empty States
Every analytics chart SHALL show, when its data is empty, a friendly icon or illustration with "No data available" and "Data will appear once transactions are recorded." — never a broken or empty chart.

#### Scenario: Empty chart data
- **WHEN** a chart's dataset is empty
- **THEN** the chart renders the icon, "No data available", and the guidance message

### Requirement: Analytics Responsiveness
The analytics section SHALL render two charts per row on desktop, one or two per row on tablet depending on width, and one per row on mobile without horizontal overflow.

#### Scenario: Desktop
- **WHEN** the viewport is desktop width
- **THEN** charts render two per row

#### Scenario: Tablet and mobile
- **WHEN** the viewport is tablet or mobile width
- **THEN** charts render one or two per row as width allows, one per row on mobile, with no overflow

### Requirement: Analytics Performance
The dashboard SHALL memoize computed chart datasets, lazily render heavy charts, avoid unnecessary re-renders (only re-render when data or timeframe changes), and animate charts only on first render.

#### Scenario: Timeframe change re-render only
- **WHEN** the timeframe changes
- **THEN** only affected visualizations re-render, using cached datasets where unchanged

#### Scenario: First render animation
- **WHEN** a chart first renders
- **THEN** it animates in once and does not re-animate on subsequent updates

### Requirement: Analytics Accessibility
Charts SHALL use high color contrast, keyboard-accessible tooltips (focusable and dismissible), screen-reader labels (aria-labels describing each chart), and responsive legends.

#### Scenario: Keyboard access
- **WHEN** a user tabs to a chart point or element
- **THEN** they can focus it and read the tooltip via keyboard

#### Scenario: Screen readers
- **WHEN** a screen reader reads the analytics section
- **THEN** each chart has an accessible name and summary