## Why

The Super Admin dashboard's Inventory Overview shows six summary cards. "Inventory Adjustments" and "Active Cohorts" add noise that makes the core inventory health stats harder to read, so they should be removed. After removal the four remaining cards sit in a grid still sized for six cards, leaving an empty column and an uneven, unbalanced layout.

## What Changes

- Remove the **Inventory Adjustments** and **Active Cohorts** summary cards from the Super Admin dashboard (`public/admin.html`).
- Keep the four remaining cards untouched: **Units Available**, **Units Distributed (Last 30 Days)**, **Projected Demand (30 Days)**, and **Items Below Reorder Point** — same markup, same values, same functionality.
- Reflow the remaining four cards through the existing grid container so they fill the dashboard width evenly with no empty placeholders, no dead space, and no manual per-card spacing.
- Update only the grid/container behavior (CSS), not the card design. Leave the sidebar, header, colors, charts, and all other cards alone.

## Capabilities

### New Capabilities
- `super-admin-dashboard-overview`: the four-card Inventory Overview grid on the Super Admin dashboard, including which cards are shown and how they reflow responsively across the dashboard width.

### Modified Capabilities
<!-- None. No existing spec covers the Super Admin dashboard cards. -->

## Impact

- `public/admin.html` — delete the Inventory Adjustments and Active Cohorts `.stat-card` blocks (last two cards in `.analytics-grid`).
- `public/css/admin.css` — adjust `.admin-page .analytics-grid` (and its responsive rules) from the six-card column layout to a balanced four-card layout: 4 across on desktop, 2×2 on smaller screens, 1 per row on the narrowest screens.
- `public/js/admin.js` — no changes required; `setText` and `renderSparkline` already guard against missing elements, so the removed cards' DOM updates no-op safely.