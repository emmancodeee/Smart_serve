## ADDED Requirements

### Requirement: Request Status Distribution chart
The dashboard SHALL render a "Request Status Distribution" doughnut chart that shows the distribution of student requests by their actual status. The status values SHALL be derived from the `status` field of the `Registration` collection records already fetched by the dashboard (`pending`, `approved`, `rejected`), with only statuses present in the filtered data displayed and no hardcoded counts or statuses. Each segment SHALL display the status, request count, and percentage. The center of the doughnut SHALL display "Total Requests" above the total count. The chart SHALL have a tooltip on hover, a legend, responsive sizing, a loading state, and an empty state. It SHALL update when the dashboard date range, course, or year level filters change.

#### Scenario: Segments reflect real statuses only
- **WHEN** the dashboard loads with registration data containing only `pending`, `approved`, and `rejected` records
- **THEN** the doughnut renders exactly one segment per status present, each labeled with its status, count, and percentage of the total

#### Scenario: Center shows total requests
- **WHEN** the Request Status Distribution chart is rendered with data
- **THEN** the center of the doughnut displays the label "Total Requests" and the actual total number of requests in the filtered data

#### Scenario: Empty data state
- **WHEN** no requests match the current filters
- **THEN** the chart displays the existing "No data available" empty state instead of an empty doughnut

### Requirement: Requests by Item Category chart
The dashboard SHALL render a "Requests by Item Category" horizontal bar chart showing which inventory categories receive the most requests. Categories SHALL be derived from the actual `inventoryAllocations[].category` values (resolved against inventory item categories where available) in the registration data, with only categories present in the data displayed. Entries SHALL be sorted from highest to lowest by request count. Each row SHALL show the category name, a progress bar, and the request count, with a tooltip on hover, responsive sizing, no overlapping labels, and an empty state.

#### Scenario: Sorted real categories
- **WHEN** the chart is rendered with category data
- **THEN** the categories appear sorted from highest to lowest request count, each row showing the category, bar, and count

#### Scenario: Empty data state
- **WHEN** no filtered registrations have inventory allocations
- **THEN** the chart displays the existing "No data available" empty state

### Requirement: Pickup Completion Rate chart and KPI
The dashboard SHALL render a full-width "Pickup Completion Rate" vertical bar chart showing pickup counts by actual display status derived from the fetched pickup-confirmation data (`Pending`, `Completed`, `Failed to comply` via the existing status resolution logic), with the Y-axis representing the number of pickups and the X-axis representing pickup status. Only statuses present in the data SHALL be displayed. The card SHALL also display a KPI labeled "Pickup Completion Rate" with the real completion percentage computed as completed pickups divided by total pickups, with no hardcoded percentage. The chart SHALL have a tooltip, responsive sizing, a loading state, and an empty state, and SHALL update when the dashboard date range filter changes.

#### Scenario: Bars reflect real statuses
- **WHEN** the pickup data contains only Pending, Completed, and Failed to comply statuses
- **THEN** the vertical bar chart renders one bar per status with its pickup count, and no invented statuses appear

#### Scenario: Real completion percentage
- **WHEN** 40 of 80 filtered pickups are completed
- **THEN** the KPI displays "Pickup Completion Rate" with the value "50%"

#### Scenario: Empty data state
- **WHEN** no pickups match the current date range
- **THEN** the card shows the existing "No data available" empty state and the completion KPI is not misleadingly shown as a rate

### Requirement: Existing filter integration
The three new charts SHALL be controlled by the existing dashboard filter toolbar (date range, course, year level, item category). No new filter toolbar SHALL be created. When a filter changes, the relevant new charts SHALL recompute and update automatically using the same criteria and date bounds as the existing charts. Item-category and inventory-status filters SHALL apply to the charts whose data carries those dimensions, and SHALL be ignored by charts whose data does not (pickup data has no category dimension). Filtering behavior of existing charts SHALL NOT change.

#### Scenario: Date range updates new charts
- **WHEN** the admin changes the date range filter
- **THEN** all three new charts recompute against the new date bounds and re-render with updated data

#### Scenario: Course and year level update request charts
- **WHEN** the admin selects a course or year level filter
- **THEN** the Request Status Distribution and Requests by Item Category charts update to the filtered registrations

### Requirement: Organized analytics layout
The analytics grid SHALL arrange chart cards in a balanced responsive structure: rows pairing Items Given Out with Most Requested Items, Low Stock Items with Active Courses, Request Status Distribution with Requests by Item Category, and Upcoming Demand with Inventory Changes; the Pickup Completion Rate card SHALL span the full content width on its own row above the Operational Summary. All cards SHALL use consistent padding (24px), consistent grid gaps (24px), consistent border radius and shadow, consistent title position and styling, and consistent chart spacing. Standard chart containers SHALL be 280–320px tall and the full-width pickup card 300–340px tall, with responsive adjustment.

#### Scenario: Two-column pairing on desktop
- **WHEN** the dashboard is rendered at desktop width
- **THEN** the analytics grid shows the specified pairings two-per-row with equal card widths and consistent gaps, and the Pickup Completion Rate card spans the full row

#### Scenario: Full-width pickup card
- **WHEN** the analytics grid is rendered at desktop width
- **THEN** the Pickup Completion Rate card occupies the entire row width and appears above the Operational Summary

### Requirement: Chart title consistency
All chart titles in the analytics section (existing and new) SHALL share the same style: same font size, font weight, color, margin, divider, and position within their cards. New chart titles SHALL NOT be visually different from existing chart titles.

#### Scenario: Identical title styling
- **WHEN** the dashboard renders the analytics section
- **THEN** every chart card title, including the three new ones, uses the identical heading style as "Items Given Out"

### Requirement: Loading, empty, and error states for new graphs
Each new graph SHALL show a clean skeleton loading state while data is pending, the existing "No data available" empty state when the dataset is empty, and an "Unable to load data" error state if its own computation fails. A failure in one new graph SHALL NOT break the rendering of the other charts or KPIs on the dashboard.

#### Scenario: Skeleton while loading
- **WHEN** the dashboard is fetching or computing analytics data
- **THEN** the new chart containers show a skeleton loading placeholder

#### Scenario: Isolated error handling
- **WHEN** the computation for one new graph throws an error
- **THEN** only that graph shows its error state and the remaining charts, existing graphs, and KPIs continue to render normally

### Requirement: Data and performance constraints
The three new charts SHALL use only real database data already fetched by the dashboard through the existing API endpoints, with no hardcoded counts, categories, percentages, pickup numbers, or statuses. No new API endpoints SHALL be added, and no duplicate API requests SHALL be made. Derived chart data SHALL be memoized with the existing chart cache and new charts SHALL render lazily like the existing scroll-triggered charts.

#### Scenario: No new network requests
- **WHEN** the dashboard loads and renders all analytics including the three new charts
- **THEN** the set of API requests made is identical to the set made before this change

#### Scenario: Memoized recomputation
- **WHEN** the same filter combination is applied twice
- **THEN** the chart data is served from the memoized cache on the second application

### Requirement: Responsive integrity and guardrails
The dashboard SHALL remain responsive with no horizontal scrolling, graph overlap, text overlap, cut-off charts, broken legends, or overflowing labels at desktop, tablet, and mobile widths; new charts SHALL stack vertically on mobile. Existing graphs, filters, and their data SHALL be unchanged, the sidebar and header SHALL remain unmodified, and the SMARTSERVE color palette SHALL be preserved.

#### Scenario: Mobile stacking
- **WHEN** the dashboard is rendered at mobile width
- **THEN** all chart cards stack vertically, the full-width pickup card stays full width, and no horizontal scroll appears

#### Scenario: Existing elements unchanged
- **WHEN** the change is applied
- **THEN** the existing charts, filter toolbar, sidebar, header, and color scheme render exactly as before, with the analytics section simply containing the three additional charts
