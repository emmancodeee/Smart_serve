## Why

The SMARTSERVE admin dashboard analytics are currently hand-rolled DOM/SVG charts: four panels are generic horizontal progress bars, one is a pie, one a basic line, plus a plain-text summary — they under-represent inventory trends (volume, low-stock risk, timeline activity, and upcoming demand) and do not clearly communicate the operational KPIs admins need at a glance. The redesign replaces each panel with the most informative chart type (area, ranked bars, donut, timeline, forecast, KPI cards) while keeping the existing card layout, sidebar, header, spacing, and the blue/white/gold SMARTSERVE branding.

## What Changes

- **Items Given Out** — replace the line chart with a smooth **Area Chart** (light blue fill, blue line + circular points, date x-axis, units-distributed y-axis, hover tooltip, empty state).
- **Most Requested Items** — replace progress bars with a **Horizontal Bar Chart**: top 10, sorted high→low, item names left, request counts right, blue-to-gold gradient bars, tooltip with exact requests.
- **Low Stock Items** — replace progress bars with a **Horizontal Bar Chart**: lowest stock first, Green=Safe / Yellow=Warning / Red=Critical bars, remaining quantity shown, reorder threshold in tooltip, critical items highlighted.
- **Active Courses** — replace progress bars with a **Donut Chart**: slice per course sized by request count, percentages, total requests in center, interactive legend, tooltip with course name/count/percentage.
- **Inventory Changes** — replace the pie with a **Timeline Chart**: chronological activity entries (Stock Added, Stock Updated, Quantity Adjusted, Item Deleted, Manual Correction) each with icon, date, time, admin name, action, quantity changed; color-coded green/blue/orange/red; empty state "No inventory changes recorded."
- **Upcoming Demand** — replace progress bars with a **Forecast Line Chart**: upcoming weeks x-axis, predicted demand y-axis, smooth line, confidence shaded band, tooltip; forecast derived from previous inventory requests.
- **Operational Summary** — replace the plain-text `<ul>` with a **KPI Dashboard**: small statistic cards (Units Distributed, Highest Utilization Item, Most Active Course, Estimated Stock Coverage, Critical Low Stock Items, Slow Moving Items) each with large number, label, icon, color indicator, optional % change, responsive grid.
- **Inventory Overview cards** — keep layout/icons; add a tiny sparkline at the bottom of each card, subtle hover animation, slight shadow, rounded corners, better spacing, no icon/title overlap, better wrapping for long titles.
- **Global filters** — the existing day/week/month/year filter stays and re-renders every chart against the selected timeframe.
- **Empty states** — every chart shows a friendly icon/illustration + "No data available" + "Data will appear once transactions are recorded." — never a broken/blank chart.
- **Responsiveness** — desktop 2 charts/row, tablet 1–2 depending on width, mobile 1/row with no overflow.
- **Performance & accessibility** — memoize computed chart datasets, lazy-render heavy charts, avoid redundant re-renders, animate only on first render; high contrast, keyboard-accessible tooltips, screen-reader labels, responsive legends.

## Capabilities

### New Capabilities
- `dashboard-analytics`: Defines the visual and behavioral standard for the admin dashboard analytics panels — chart types per panel, data semantics (units distributed, top requested items, low-stock status bands, course distribution, inventory change timeline, demand forecast, KPI cards, sparklines), global timeframe filtering, empty states, responsiveness, performance behavior, and accessibility — all within the existing SMARTSERVE layout and blue/white/gold branding.

### Modified Capabilities
<!-- No archived specs exist in openspec/specs/; this is the first spec defining dashboard analytics requirements. -->

## Impact

- `public/js/admin.js` — main change: new/extended chart renderers (area, ranked horizontal bars with status colors, donut with center total + legend, timeline, forecast line with confidence band, KPI card renderer, sparkline for every stat card), `loadAnalytics()` rewiring (~line 3233), memoized dataset helpers, lazy render, animation-on-first-render.
- `public/admin.html` — `#analytics` section markup: chart container updates, KPI card container replacing `#analyticsummary`, sparkline slots per stat card (lines ~99–187).
- `public/css/admin.css` — new chart/KPI/sparkline/timeline/forecast styles + responsive rules; existing layout/branding kept.
- No changes to `server.js` routes, API endpoints, or data computation sources (all metrics stay client-side over the existing raw list endpoints: `/api/auth/admin/registrations`, `/api/auth/admin/transactions`, `/api/auth/inventory`).
- No new dependencies — charts remain vanilla DOM/SVG (no Chart.js on the dashboard page).