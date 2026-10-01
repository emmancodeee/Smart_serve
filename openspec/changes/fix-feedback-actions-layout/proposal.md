## Why

The Feedback Management Actions column renders its four buttons (View, Respond, Status, Priority) in a wrapping flex container (`.table-actions { display: flex; flex-wrap: wrap; ... }`, `admin-feedback.html:174`), so the buttons flow unevenly and Priority wraps below the others in an unorganized way. The actions group has no consistent grid, spacing, or alignment.

## What Changes

- Convert the Feedback Management Actions column's button container to a clean 2x2 grid: `[ View ][ Respond ]` on the first row and `[ Status ][ Priority ]` on the second.
- Achieve this with the smallest possible change: update only the page-local `.table-actions` rule in `public/admin-feedback.html` from `flex-wrap` to `grid` with two equal-width columns (`repeat(2, minmax(0, 1fr))`) and a uniform 0.4rem gap in both directions.
- Keep all four actions and their handlers exactly as-is (View → `viewFeedback`, Respond → `openResponseModal`, Status → `openStatusModal`, Priority → `updatePriority`); no JS change, no markup change in the row renderer.
- Preserve the existing button colors exactly (Bootstrap `btn-info`, `btn-primary`, `btn-warning`, `btn-secondary`) and the existing button sizing rule `.table-actions .btn` (padding 0.45rem 0.7rem, font-size 0.78rem, line-height 1.2).
- Keep the Actions column width provision already in place (`th:last-child { min-width: 250px }`) so the grid stays fully inside the column, and keep the existing `vertical-align: middle` so the grid is centered within each row.
- No redesign of the sidebar, header, "All Feedback" title, filters, search, reset, export, table columns, feedback data, category/subject/rating/status/priority/date cells, or the existing status/priority badges.

## Capabilities

### New Capabilities
- `feedback-actions-layout`: The Feedback Management administrator Actions column layout — the 2x2 button grid, equal button widths/heights, uniform spacing and alignment, no overlap/overflow/clipping, vertical centering in the row, and the invariant that the existing button colors, sizes, and handlers are preserved.

### Modified Capabilities
<!-- None: no existing spec requirements change. -->
- (none)

## Impact

- `public/admin-feedback.html` — one CSS rule: `.table-actions { display: flex; flex-wrap: wrap; min-width: 220px; ... }` → `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.4rem; width: 100%;`. No panel/table/filter/markup changes.
- `public/js/admin-feedback.js` — intentionally untouched (handlers, classes, and onclick wiring remain identical).
- `public/admin-returns.html` — untouched; its own page-local `.table-actions` rule (flex) is separate and unaffected.
- No backend/API changes, no new dependencies, no node-syntax impact (no JS edits).