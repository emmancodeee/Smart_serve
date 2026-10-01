## Why

On the admin Feedback Management page (`admin-feedback.html`), the search/filter controls overlap the "All Feedback" dark-blue section header and crowd the page description, making the top of the page look broken at common desktop/tablet widths. The filters are rendered inside the same flex row as the page title, so when the toolbar is wider than the remaining space it collides with the heading block.

## What Changes

- Scope layout fixes to the Feedback Management page only (each change targeted via a page-scoped selector so admin returns, inventory, dashboard, and student pages are untouched).
- Force the filter toolbar onto its own full-width lane **below** the page heading, so the vertical hierarchy reads: Feedback Management → All Feedback → description → filters → table.
- Add explicit, consistent vertical spacing between the heading block and the filter toolbar, and between the filter toolbar and the data table, so nothing overlaps and spacing follows the existing 8/12/16/20px rhythm already used on the page.
- Keep filter controls wrapping onto additional lines rather than shrinking enough to overlap or clip; the search input remains readable at all supported widths.
- Preserve the existing design (colors, dark-blue heading, white container, rounded panel, borders, button/control styling, responsive breakpoints). No changes to search/filter/sort/export/data, table contents, API, routes, or auth.

## Capabilities

### New Capabilities
- `feedback-management-layout`: The layout presentation rules that keep the Feedback Management page heading block, filter toolbar, and data table vertically stacked, non-overlapping, and properly spaced across desktop/tablet/mobile widths.

### Modified Capabilities
<!-- No existing specs to modify; openspec/specs/ has no capabilities yet. -->

## Impact

- `public/admin-feedback.html` — add a page-scoped class hook on `<body>` for targeting.
- `public/css/admin.css` — append the scoped layout rules for the feedback management page.
- No changes to `public/js/admin-feedback.js`, `public/js/admin-filters.js`, routes, API, data, or server code.
- Layout only: no visual theme, content, or behavior changes.