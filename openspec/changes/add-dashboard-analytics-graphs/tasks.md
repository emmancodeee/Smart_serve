## 1. Analytics layout (public/admin.html)

- [x] 1.1 Reorder the existing chart-boxes in `.charts-container` to the balanced structure: row 1 Items Given Out + Most Requested Items, row 2 Low Stock Items + Active Courses, row 3 (new) Request Status Distribution + Requests by Item Category, row 4 Upcoming Demand + Inventory Changes — moving only DOM positions, keeping every container ID intact
- [x] 1.2 Add the Request Status Distribution chart-box: heading "Request Status Distribution", `<div id="requestStatusChart" class="chart">` with skeleton loading markup inside
- [x] 1.3 Add the Requests by Item Category chart-box: heading "Requests by Item Category", `<div id="categoryRequestsChart" class="chart">` with skeleton loading markup inside
- [x] 1.4 Add the full-width Pickup Completion Rate chart-box after Inventory Changes: class `chart-box chart-box--wide`, heading "Pickup Completion Rate", a KPI block (label "Pickup Completion Rate" + `<span id="pickupCompletionRateValue">`), `<div id="pickupCompletionChart" class="chart chart--wide">` with skeleton markup

## 2. Data derivation (public/js/admin.js)

- [x] 2.1 Add `buildRequestStatusDistribution()`: filter `allRegistrations` by analytics date bounds and course/year level criteria, count by real `status` values, return `[[statusLabel, count]]` sorted by count
- [x] 2.2 Add `buildCategoryRequestEntries()`: `aggregateUsageEntries(filteredUsageEntries, entry => getUsageEntryCategory(entry), 8)` reusing the existing filtered usage pipeline
- [x] 2.3 Add `buildPickupCompletionData()`: filter `allPickupConfirmations` by `pickupDate` within analytics bounds (with best-effort course/year join via email→user→registration map, unmatched = "Unassigned"), count by `resolvePickupDisplayStatus`, compute completion percentage
- [x] 2.4 Add the three datasets to the `getChartData` returned `data` object so they inherit `chartCache` memoization

## 3. Rendering (public/js/admin.js)

- [x] 3.1 Add `renderVerticalBarChart(containerId, entries)`: uses the existing `.bar-grid`/`.vbar-*` CSS classes, count labels above bars, tooltips via `bindChartInteraction`, no overlapping labels
- [x] 3.2 Render Request Status Distribution in `loadAnalytics` via `renderDonutChart` with center "Total Requests" label and per-segment count/percentage
- [x] 3.3 Render Requests by Item Category in `loadAnalytics` via `renderRankedBarChart`
- [x] 3.4 Render Pickup Completion Rate in `loadAnalytics`: vertical bars + set `pickupCompletionRateValue` KPI text; clear skeleton markup on render
- [x] 3.5 Wire the new charts through `renderChartWhenVisible` (lazy render) and `addChartAnimation` like existing scroll charts
- [x] 3.6 Wrap each new chart's compute+render in its own `try/catch` that falls back to `renderChartEmptyState(..., 'Unable to load data')` on error

## 4. Styles (public/css/admin.css)

- [x] 4.1 Add `.chart-box--wide { grid-column: 1 / -1; }` and a `--wide` chart container height of 300–340px (responsive)
- [x] 4.2 Add pickup card internals: KPI row (label + value with 8–12px spacing) styled consistently with existing stat/KPI cards
- [x] 4.3 Polish `.vbar` styles for consistent track height, bar widths, labels, and spacing; add `overflow-wrap` for status labels
- [x] 4.4 Add `.donut-total-label` style for the "Total Requests" center label (small, centered, consistent with `.donut-total`)
- [x] 4.5 Add `.chart-skeleton` shimmer loading style used by the three new containers (removed when data renders)

## 5. Empty/loading state wiring

- [x] 5.1 Ensure all three new containers render the existing "No data available" empty state (`renderChartEmptyState`) when their dataset is empty
- [x] 5.2 Verify skeleton markup is removed and never blocks the rendered chart (innerHTML cleared on render)

## 6. Verification

- [x] 6.1 Verify filter integration: changing date range, course, year level, and item category updates the relevant new charts via `loadAnalytics`, and the existing charts/filters are unaffected
- [x] 6.2 Verify no new API calls: network request set identical to before the change (all data from existing globals)
- [x] 6.3 Verify responsive layout at 1280px, 1024px, 768px, and 390px: 2-column pairing, full-width pickup card, vertical stacking on mobile, no horizontal scroll or overflow
- [x] 6.4 Verify chart consistency: new cards match existing card padding (24px), gaps (24px), title style, and chart heights (280–320px standard, 300–340px wide)
- [x] 6.5 Verify empty and error states: with no data the three charts show "No data available"; an injected compute error in one chart leaves the rest of the dashboard rendering
- [x] 6.6 Guardrails: `git diff` shows only `public/admin.html`, `public/js/admin.js`, `public/css/admin.css`; sidebar, header, existing graphs, colors, and backend are untouched
- [x] 6.7 Final top-to-bottom dashboard inspection: summary cards aligned, existing graphs intact, new graphs visually native, no overlaps, no excessive whitespace, filters functional
