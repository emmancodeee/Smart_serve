## Context

The dashboard analytics live in the `#analytics` section of `public/admin.html`, computed entirely client-side in `public/js/admin.js`:

- **Data**: admin.js fetches five existing endpoints once at load — `/api/auth/admin/users`, `/api/auth/admin/registrations`, `/api/auth/admin/transactions`, `/api/auth/admin/pickup-confirmations`, `/api/auth/inventory` — into globals `allUsers`, `allRegistrations`, `allTransactions`, `allPickupConfirmations`, `allInventory`.
- **Pipeline**: `getChartData(rangeKey)` derives all chart series from those globals and memoizes the result in `chartCache` keyed on range + `analyticsCriteriaHash()` (criteria: preset/custom dates, course, yearLevel, itemCategory, inventoryStatus). `loadAnalytics()` consumes it and renders every chart. `renderChartWhenVisible` lazy-renders charts on scroll; `bindChartInteraction` provides hover tooltips; `renderChartEmptyState` provides the "No data available" state; `DONUT_PALETTE` (6 colors) matches the SMARTSERVE palette.
- **Reusable renderers**: `renderDonutChart` (conic-gradient donut with center total, legend, tooltips — used by Active Courses) and `renderRankedBarChart` (horizontal `.bar-list`/`.bar-row` rows — used by Most Requested Items and Low Stock Items). Vertical-bar CSS classes already exist (`bar-grid`, `vbar-col`, `vbar-track`, `vbar-fill`, `vbar-label`, `vbar-value`) but have no JS renderer yet.
- **Real status fields**: `Registration.status` enum `['pending','approved','rejected']`; `Registration.inventoryAllocations[]` carries `{ quantity, itemName, requestedLabel, category }`; pickups are `Schedule` docs exposed by `listPickupConfirmations` as `{ id, studentName, studentEmail, module, pickupDate, status, confirmationStatus, source }` where `status ∈ ['Planned','Completed','No Show']` and the existing `resolvePickupDisplayStatus()` maps them to display values `Pending` / `Completed` / `Failed to comply`.
- **Layout**: `.charts-container` is a 2-column grid (`repeat(2, minmax(0,1fr))`, gap 24px, 1 column ≤900px) holding 6 `.chart-box` cards (24px padding, flex column, equal-height `.chart` at ≥280px). The `inventory-page-ui-cleanup` change (already applied) standardized card padding/gaps/spacing scale.

## Goals / Non-Goals

**Goals:**
- Add the three graphs using only already-fetched data — zero new API endpoints or backend changes.
- Reorganize the analytics grid into a balanced 5×2 structure with a full-width Pickup Completion Rate card, so the new graphs look native.
- Keep every new graph responsive to the existing dashboard filters and memoized like the current charts.
- Provide loading, empty, and per-graph error states.
- Maintain the existing SMARTSERVE theme, card language, and spacing scale.

**Non-Goals:**
- No backend/model/service changes; no new endpoints.
- No changes to existing graphs, their data, or their renderers.
- No changes to the filter toolbar or filter behavior.
- No sidebar, header, route, or color changes.
- No charting library — all rendering stays in the existing hand-rolled SVG/HTML chart style.

## Decisions

### D1: Compute the three new datasets inside `getChartData` for memoization and filter consistency
All three datasets are derived from existing globals inside `getChartData` and added to its returned `data` object, so they inherit the `chartCache` memoization and the exact date bounds (`getAnalyticsBounds()`) used by every other chart. Filter changes trigger `loadAnalytics()` via the existing SmartFilter `onRender`, which recomputes and re-renders — automatic and consistent with current behavior.
- Alternative considered: separate fetch + render path — rejected (duplicate requests, violates performance requirement, risks desync with other charts).

### D2: Request Status Distribution — count `allRegistrations` by actual `status`, reusing the donut renderer
Count registrations by their real `status` values (`pending`/`approved`/`rejected` — labels capitalized for display), filtered by the analytics date bounds (via the existing `getRegistrationInventoryDate`) and by course/year level (registration fields). Only statuses present in the filtered data produce segments; the donut center shows the total with a small "Total Requests" label. Percentages are computed per segment. Reuses `renderDonutChart` + `DONUT_PALETTE`; tooltips via `bindChartInteraction`. Item-category and inventory-status filters are not applicable to a request-status count and are ignored for this chart.
- Alternative considered: count by `pickupStatus` or a merged status set — rejected; the user asked for the request's status, and the `Registration.status` enum is the actual request lifecycle field.

### D3: Requests by Item Category — reuse the usage-entry pipeline and horizontal bar renderer
Category demand is computed from the same `filteredUsageEntries` (already date/course/year/category-filtered by `applyAnalyticsCriteriaToUsage`) using `aggregateUsageEntries(filteredUsageEntries, entry => getUsageEntryCategory(entry), 8)` — the same aggregation and category resolution the existing charts use (category resolved against `allInventory` when available, else the allocation's category). Sorted highest-to-lowest by the existing aggregator, rendered with `renderRankedBarChart` (horizontal bars). No overlapping labels: the existing `.bar-row` grid keeps label/bar/value in separate columns and labels wrap via `overflow-wrap: anywhere`.
- Alternative considered: aggregate raw `inventoryAllocations` directly — rejected; would ignore the criteria filters and inventory category resolution the rest of the dashboard uses.

### D4: Pickup Completion Rate — vertical bar chart + inline KPI, computed from `allPickupConfirmations`
Count `allPickupConfirmations` by `resolvePickupDisplayStatus(item)` (existing mapping producing `Pending` / `Completed` / `Failed to comply`), filtered to the analytics date bounds using `pickupDate`. Completion rate = `completed / total × 100` rounded to the nearest integer, displayed as a KPI ("Pickup Completion Rate — XX%") inside the card. A new small `renderVerticalBarChart` builds the bars using the already-present `.bar-grid` / `.vbar-*` CSS classes (no new visual language), with counts labeled above bars, tooltips via `bindChartInteraction`, and statuses derived only from real data.
- Filter handling: the date range applies via `pickupDate`. Course/year level apply best-effort through a lightweight email→registration join (pickups carry `studentEmail`; `allUsers` maps email→userId; registrations carry `userId`) built once per `getChartData` call; unmatched pickups count as "Unassigned" and still appear. Item-category and inventory-status are not applicable to pickup data.
- Alternative considered: extend `listPickupConfirmations` to include course/year — rejected; that is a backend change and this change forbids it.

### D5: Layout — reorder existing chart-boxes and add the new ones in the balanced 5-row structure
The `.charts-container` DOM order is rearranged (HTML-only, IDs unchanged) to: (1) Items Given Out | Most Requested Items, (2) Low Stock Items | Active Courses, (3) Request Status Distribution | Requests by Item Category, (4) Upcoming Demand | Inventory Changes, (5) Pickup Completion Rate as a full-width card (`grid-column: 1 / -1`) above the Operational Summary. Reordering is safe because every renderer looks its container up by ID (`renderChartWhenVisible`) and each `.chart-box` is styled uniformly. Chart heights stay consistent: the donut and bar cards use the existing 280px `.chart` minimum; the wide pickup card uses 300–340px.
- Alternative considered: keep existing order and append new cards at the bottom — rejected; the user explicitly requires an organized, non-appended feel.

### D6: States — skeleton, empty, and error per graph
Each new `.chart-box` starts with a skeleton markup (`<div class="chart-skeleton">` shimmer blocks) that is cleared when the chart renders. Empty data reuses `renderChartEmptyState(containerId, iconKey, message)`. Each new chart's computation+render in `loadAnalytics` is wrapped in its own `try/catch` that renders `renderChartEmptyState(containerId, 'chart', 'Unable to load data')` on failure, so one failure cannot break the other charts or KPIs.
- Alternative considered: global try/catch — rejected; per-graph isolation matches the "one failed graph must not break the dashboard" requirement.

### D7: Performance — no new requests, memoized derivation, lazy rendering
All derivation happens inside the memoized `getChartData`; no new `fetch` calls; new charts render through `renderChartWhenVisible` (IntersectionObserver) exactly like the existing timeline/forecast charts; sparkline-style animations reuse `addChartAnimation`. Aggregations reuse `aggregateUsageEntries` (single pass over already-filtered arrays).

## Risks / Trade-offs

- **Pickup course/year join is best-effort** (D4) → Mitigation: unmatched pickups fall back to "Unassigned" and are never dropped; the date range still always applies, so the chart remains useful even without the join.
- **Reordering chart-boxes could be perceived as changing existing graphs** → Mitigation: it is a pure DOM reorder; container IDs, renderers, and data are untouched; verified by diffing that only positions changed.
- **Donut center space is tight for "Total Requests" label** → Mitigation: small (0.7rem) label under the existing `donut-total` number, reusing the centered layout; verified at the minimum 2-column card width (≈440px) and 1-column mobile.
- **Vertical bar labels could overflow on narrow cards** → Mitigation: X-axis status labels rotate or truncate via `overflow-wrap`; bars render in a horizontal flex row that degrades gracefully; verified at 390px.
- **Larger data sets (registrations × allocations, pickups) add client-side work** → Mitigation: work is O(n) single-pass and memoized; pickups are already capped at 300 by the endpoint; allocations only iterate within the filtered window.

## Open Questions

- None blocking. Status labels will be derived from live data; if the seed data only contains a subset of statuses, the charts show exactly those statuses (per requirement).
