## Why

The SMARTSERVE Admin Dashboard currently shows inventory issuance, low-stock health, cohort distribution, and operational KPIs, but it has no visibility into the outcome of student requests (pending/approved/rejected), which item categories drive demand, or how many pickups are actually completed. Adding Request Status Distribution, Requests by Item Category, and Pickup Completion Rate turns the dashboard into a complete operational picture — and, critically, the analytics section must be reorganized so the three new graphs feel native rather than appended.

## What Changes

- **New graph — Request Status Distribution** (doughnut): distribution of student requests by their actual `status` values from the `Registration` collection (`pending`, `approved`, `rejected` — only statuses present in data are shown), with status label, request count, percentage, a "Total Requests" center label, tooltip, legend, and responsive sizing. No hardcoded counts.
- **New graph — Requests by Item Category** (horizontal bar): top categories by number of units requested, derived from real `inventoryAllocations[].category` values (and inventory item category resolution), sorted highest to lowest, with request counts, tooltips, and no overlapping labels.
- **New graph — Pickup Completion Rate** (vertical bar): count of pickups per actual display status (`Pending`, `Completed`, `Failed to comply` — derived from real `Schedule` data via the existing `resolvePickupDisplayStatus` mapping), Y-axis = number of pickups, X-axis = status, plus an inline KPI showing the real completion percentage. No hardcoded percentage.
- **Analytics layout reorganization**: the `.charts-container` grid is reordered to the balanced 5-row × 2-column structure (Items Given Out / Most Requested Items, Low Stock Items / Active Courses, Request Status Distribution / Requests by Item Category, Upcoming Demand / Inventory Changes), with the full-width Pickup Completion Rate card above the Operational Summary.
- **Chart card consistency**: uniform card padding (24px), grid gaps (24px), consistent chart heights (280–320px; 300–340px for the full-width pickup card), consistent titles, and the existing spacing scale (8/12/16/20/24/32px).
- **States for the new graphs**: skeleton loading state, "No data available" empty state (reusing the existing empty-state renderer), and a per-graph error fallback so one failed graph never breaks the dashboard.
- **Filter integration**: the three new graphs respond to the existing dashboard filters (date range, course, year level, item category where applicable) and update automatically on filter change — no new filter toolbar, no new API endpoints.
- **Performance**: all new chart data is derived client-side inside the existing memoized `getChartData` pipeline (reusing already-fetched globals), rendered lazily via the existing `renderChartWhenVisible`, with no duplicate API requests.

No functionality, backend logic, existing graphs, filters, sidebar, header, routes, or colors are modified.

## Capabilities

### New Capabilities
- `dashboard-request-analytics`: The three new analytics graphs (Request Status Distribution, Requests by Item Category, Pickup Completion Rate), their data derivation from real request/pickup data, filter integration, states (loading/empty/error), and their organized placement within the existing analytics grid.

### Modified Capabilities
<!-- No main specs exist yet (openspec/specs/ is empty); this introduces a new capability spec. -->

## Impact

- `public/admin.html` — reorder existing chart-boxes into the new row structure; add 3 chart-boxes (with skeleton loading markup); add full-width pickup card with KPI + chart container.
- `public/js/admin.js` — add `renderVerticalBarChart` (uses existing `.vbar-*` CSS), `buildRequestStatusDistribution`, `buildCategoryRequestEntries`, `buildPickupCompletionData`; wire all into `loadAnalytics()` with per-chart try/catch and lazy rendering. No changes to existing chart renderers or filter logic.
- `public/css/admin.css` — additive rules for the full-width card, vertical bar polish, donut center label, completion-rate KPI, and skeleton shimmer; reuse existing `.bar-*`, `.vbar-*`, `.donut-*`, `.chart-empty` styles.
- **No backend changes**: no new endpoints, no model changes, no service changes. Data comes from the existing `/api/auth/admin/registrations`, `/api/auth/admin/pickup-confirmations`, `/api/auth/admin/transactions`, `/api/auth/inventory` responses already fetched by the dashboard.
