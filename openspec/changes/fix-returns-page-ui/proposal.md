## Why

The Return Requests admin page (`public/admin-returns.html`) has layout problems: overlapping/colliding text and controls in the header and the Return Management section, a duplicated page description in the top header that crowds the title, filter controls that lack consistent spacing and wrapping, and a table that can squeeze columns or overflow on narrower viewports. The page needs a frontend-only cleanup of its layout, spacing, alignment, and responsiveness while keeping every control functional and the existing visual theme intact.

## What Changes

- Remove the header description "View and manage student return requests for modules, uniforms, and books." from the top header only (the same sentence inside the Return Management content section is preserved)
- Fix the top header layout so the left side (Welcome Admin, Return Requests) and right side (Search, Notification, Date/time, Admin profile, Logout) are aligned and never collide or overlap
- Reorganize the Return Management section into a clean structure: "Return Management" eyebrow, "All Return Requests" title, its description, then the filter controls (Search, All Status, All Item Category, All Return Reason, All Date, All Time, Sort, Reset Filters, Export), then the table
- Fix filter control spacing: consistent gap/margin/padding/height/width, natural wrapping on narrower widths instead of forcing one row, no overlapping controls
- Ensure the Export button never overlaps the search field, dropdowns, Reset Filters, table, or section title
- Fix the returns table layout so all 7 columns (Student, Items, Requested Date, Status, Priority, Submitted, Actions) align with appropriate widths and use horizontal scrolling on narrow viewports instead of squeezing columns
- Make the whole page responsive (desktop, tablet, mobile) without horizontal page overflow, reusing the existing responsive sidebar behavior
- Preserve the existing SmartServe branding, colors, styles, buttons, inputs, dropdowns, typography, and visual theme — layout-only fixes

## Capabilities

### New Capabilities
- `returns-page-layout`: The layout, spacing, alignment, and responsiveness of the admin Return Requests page (header, Return Management section, filter toolbar, and table). Purely presentational; no behavioral/functional changes.

### Modified Capabilities

## Impact

- `public/admin-returns.html` — remove the header-subtitle description from the top header; ensure header container structure supports clean alignment
- `public/css/admin.css` — fix spacing/overlap in header, filter toolbar (Search, Status, Item Category, Return Reason, Date, Time, Sort, Reset, Export), and table layout; add responsive rules for tablet/mobile
- **No changes** to backend logic, APIs, routes, authentication, authorization, or any data handling
- **No changes** to `public/js/admin-returns.js` or `public/js/admin-filters.js` (filter functionality, search, sorting, export, and action behavior are preserved as-is)