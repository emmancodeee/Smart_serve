## 1. Markup Hook

- [x] 1.1 Add `feedback-management-page` class to the `<body>` element in `public/admin-feedback.html` (e.g. `class="admin-page feedback-management-page min-h-screen ..."`), keeping the existing classes intact. Verify no other page uses this class name.

## 2. Scoped Layout CSS

- [x] 2.1 Append a `/* feedback-management-layout */` block at the end of `public/css/admin.css` targeting `.feedback-management-page`: make the top `dashboard-panel-header` wrap (`flex-wrap: wrap`), keep `align-items: flex-start`, and set `row-gap`/`margin-bottom` so the heading block and filters are separated by the page's existing spacing rhythm.
- [x] 2.2 In the same scoped block, give the filter lane full width on its own row: `#feedbackFilterContainer { flex: 1 1 100%; min-width: 0; }` so the toolbar always renders on its own row below the description and can never share a row with the "All Feedback" heading.
- [x] 2.3 In the same scoped block, protect the title text columns: `.dashboard-panel-header > :first-child { flex: 0 1 auto; min-width: 0; }` so the heading/copy can never be squeezed or overlapped by the toolbar; do NOT use z-index, negative margins, absolute positioning, or fixed heights.
- [x] 2.4 Confirm the scoped rules override the page's inline `.dashboard-panel-header` (inline `<style>` loads before `admin.css`; scoped selector specificity must win) and that no other page's `.dashboard-panel-header` is affected.

## 3. Verification

- [x] 3.1 Reload the Feedback Management page (super admin) at desktop (~1440px): heading → description → filters → table in one clean vertical stack, no overlap between any element; "All Feedback" never covered by search/filter controls.
- [x] 3.2 Check tablet (~768px) and laptop (~1120px): controls wrap onto additional rows without clipping; search placeholder "Search feedback by student, subject, or name..." fully readable; no overlap between filters and heading or table.
- [x] 3.3 Check mobile (~390px): search takes a full row, other controls stack/wrap cleanly, heading, description, filters, and table all separated by visible spacing; no horizontal clipping of the filter area.
- [x] 3.4 Confirm the admin Returns page and one other admin page (e.g. Inventory) render identically to before (no layout ripple), and that search/filter/sort/export still work on the Feedback Management page.
- [x] 3.5 Run `node --check public/js/admin-feedback.js` and `node --check public/js/admin-filters.js` (should pass: these files must NOT have been modified) to confirm no JS drift.