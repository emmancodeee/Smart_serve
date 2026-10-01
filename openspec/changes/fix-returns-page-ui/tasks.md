## 1. Remove Header Description

- [x] 1.1 Remove the `<div class="header-subtitle">View and manage student return requests for modules, uniforms, and books.</div>` node from the top header in `public/admin-returns.html` (around line 225)
- [x] 1.2 Confirm no new description text was added to the header (only "Welcome Admin" and "Return Requests" remain on the left)
- [x] 1.3 Confirm the same sentence still exists once as the content description (`dashboard-panel-copy`) under "All Return Requests"

## 2. Fix Header Layout and Spacing

- [x] 2.1 Confirm the header keeps its left group (`header-left`: Welcome Admin, Return Requests) and right groups (clock, logout, `header-right`: search, bell, profile)
- [x] 2.2 Add/refine CSS (in `public/css/admin.css`) so header groups are vertically and horizontally aligned with consistent gaps and never overlap at desktop widths
- [x] 2.3 Ensure the header wraps cleanly (no overlap, no clipping) on tablet/mobile widths using the existing media queries
- [x] 2.4 Verify no header element collides with the sidebar or extends outside the header container

## 3. Fix Return Management Section Structure

- [x] 3.1 Keep the "Return Management" eyebrow, "All Return Requests" title, and content description in the `dashboard-panel-header` with adequate vertical spacing
- [x] 3.2 Ensure the content description does not collide with the `#returnFilterContainer` below it or the table below them
- [x] 3.3 Verify the "All Return Requests" title and description have enough space between them (title not clipped, description not touching filters)

## 4. Fix Filter Toolbar Spacing and Wrapping

- [x] 4.1 Ensure `.filter-toolbar` uses full width, flex-wrap, and a consistent `gap` so controls never overlap (edit `public/css/admin.css`)
- [x] 4.2 Give all toolbar controls (search input, Status/Item Category/Return Reason/Date/Time selects/comboboxes, Sort, Reset Filters, Export) a uniform height and comfortable min-width
- [x] 4.3 Verify the toolbar wraps to a second row on narrow widths instead of shrinking/overlapping
- [x] 4.4 Verify all controls remain functional: search by student/item, dropdown filtering, sort, reset filters, and export

## 5. Fix Export Button Placement

- [x] 5.1 Confirm the Export button sits within the toolbar layout, beside or below other filters depending on width
- [x] 5.2 Verify it never overlaps the search field, dropdowns, Reset Filters button, "All Return Requests" title, or the table
- [x] 5.3 Keep the Export button's existing design style and functionality unchanged

## 6. Fix Table Layout

- [x] 6.1 Ensure all seven column headers (Student, Items, Requested Date, Status, Priority, Submitted, Actions) are visible, aligned, and not overlapping
- [x] 6.2 Add appropriate column widths / min-widths (especially Items and Actions) so text has enough space and rows have comfortable height
- [x] 6.3 Verify `.table-responsive` provides horizontal scrolling on narrow viewports instead of squeezing columns
- [x] 6.4 Confirm the table stays inside its container and the Actions column is not cut off

## 7. Responsiveness

- [x] 7.1 Desktop: sidebar positioned correctly, header aligned, filters fit cleanly or wrap, table uses available width
- [x] 7.2 Tablet: filters wrap naturally, containers resize, no overlapping elements
- [x] 7.3 Mobile: existing off-canvas sidebar behavior preserved, header elements adapt, filters stack/wrap, table scrolls horizontally
- [x] 7.4 Confirm no page-level horizontal overflow is introduced at any viewport width

## 8. Preservation and Final Verification

- [x] 8.1 Confirm no JS files (`admin-returns.js`, `admin-filters.js`) and no backend/API/routes/auth code were modified
- [x] 8.2 Confirm the sidebar markup and ordering in `admin-returns.html` are byte-identical to the `reorder-admin-sidebar-nav` result
- [x] 8.3 Confirm colors, typography, borders, icons, and the visual theme are unchanged
- [x] 8.4 Final check: inspect the page for overlapping text/inputs/dropdowns/buttons, clipping, header/sidebar collisions, uneven alignment, and table overflow — fix any remaining issue found
- [x] 8.5 Grep the page source to confirm the description sentence appears exactly once (in the content section, not the header)