## Context

Smart Serve's Inventory Management page uses an Express-served HTML page (`public/inventory.html`) with vanilla JavaScript (`public/js/inventory.js`) and component CSS (`public/css/inventory.css`), plus shared styles in `public/css/admin.css`.

Current state:
- The table lives inside `.admin-table-wrap.table-scroll` within `.section-body` inside `.admin-section`.
- `.admin-table-wrap` already provides `border: 1px solid #d9e6fb; border-radius: 24px; background: white; box-shadow: 0 10px 24px rgba(30,58,138,0.06);` (admin.css:2330).
- Table header row uses `#1E2F73` background; td padding is `20px 24px` (inventory.css:338); row height is `72px` (inventory.css:347).
- Column widths are not explicitly set — columns stretch proportionally, which makes Item Name cramped when other columns consume equal space.
- The `.pagination-bar` (inventory.css:153) is a flex container with `justify-content: space-between` and `border-top: 1px solid #e2e8f0; padding: 1rem 0;`.
- The `.pagination-limit` block contains a `<label>Per page:</label>` and a `<select>` (inventory.html:180-188), styled in inventory.css:197-212.
- The internal `perPage` variable defaults to `10` (inventory.js:42) and is mutated by the `perPageSelect` change listener (inventory.js:646).

User's stated problem: the page is cramped, the Per page selector must be removed, and the pagination footer must show info left / buttons right with a clean gap above it.

## Goals / Non-Goals

**Goals:**
- Make the inventory table look like a clean, padded card with consistent row spacing.
- Give the Item Name column enough width so long names display on one line on desktop.
- Keep the Quantity column compact with number+unit together.
- Completely remove the visible "Per page" selector from the pagination footer.
- Structure the pagination footer as info-left / buttons-right with no large empty gap.
- Add a comfortable vertical gap between the last table row and the pagination footer.
- Ensure the table card and pagination footer share the same left/right boundaries.
- Keep responsive behavior: horizontal scroll inside the card on mobile, footer usable on small screens.

**Non-Goals:**
- No backend, API, database, or authentication changes.
- No changes to inventory data, filtering logic, sorting, modal forms, Add Item / Edit Item buttons, sidebar, or header.
- No pagination logic changes — internal `perPage` stays at 10.
- No redesign of the table column content or status styling.

## Decisions

**1. Explicitly set column widths using `<colgroup>` in the table HTML.**
Use a `<colgroup>` inside `<table id="inventoryTable">` to assign proportional widths:
- Item Name: ~30% (generous for long names)
- Category: ~14%
- Quantity: ~12%
- Status: ~14%
- Last Updated: ~14%
- Actions: ~100px fixed (right-aligned, not percentage-based)
This avoids the "stretch to equal" behavior that makes Item Name cramped.
- Alternative considered: CSS `table-layout: fixed` with `width: 100%`. Rejected because it forces equal distribution unless column widths are explicit — `<colgroup>` achieves the same without overriding the browser's automatic layout.

**2. Remove the `.pagination-limit` block from the DOM on page load.**
In `inventory.js` DOMContentLoaded handler, select `#paginationBar .pagination-limit` and remove it from the DOM (or set `display: none`). This is simpler and more robust than adding a CSS class, and prevents any layout interference. The internal `perPage` variable and its initialization remain untouched at `10`.
- Alternative considered: `display: none` via CSS. Equivalent, but removing from DOM is cleaner since the element has no other purpose.

**3. Ensure `.pagination-bar` already uses `justify-content: space-between` — verify and keep it.**
The current inventory.css already has `justify-content: space-between` on `.pagination-bar`. With the per-page block removed, the two remaining children (`.pagination-info` left, `.pagination-controls` right) will naturally fill the space correctly. No structural HTML change needed in the pagination bar.

**4. Add a margin-top to `.pagination-bar` and padding-bottom to `.section-body` to create the vertical gap.**
Increase `.pagination-bar` top margin slightly (add `margin-top: 1rem` or adjust the existing `margin-top: 0.5rem`) so the footer doesn't hug the last table row. Also ensure `.section-body` has bottom padding so the footer isn't flush with the card bottom.
- Alternatively: increase the table container bottom padding. Either works; targeting `.pagination-bar` is more localized.

**5. Ensure the table wrap and pagination bar are both inside the same `.section-body` so they share the same horizontal boundaries.**
They already are (inventory.html:145-190). No HTML restructure needed — both are children of `.section-body`.

**6. Responsive: keep existing `overflow-x: auto` on `.admin-table-wrap` / `.table-scroll` for horizontal scrolling on mobile.**
On screens < 640 px, the pagination bar should wrap (using existing `flex-wrap: wrap` on `.pagination-bar`) so info stacks above buttons if space is insufficient.

## Risks / Trade-offs

- Removing the per-page selector from the DOM is irreversible for the user session. If a future requirement restores it, the removal code must be reverted. Mitigation: the removal is a one-line DOM removal; easily reversed.
- Explicit `<colgroup>` widths may need tweaking on different screen sizes. Mitigation: use percentage-based widths with a fixed Actions column; test at tablet breakpoints.
- The "View only" text in the Actions column is a plain `<span>`, not a button — alignment depends on `text-align: right` on `.cell-actions`. Verify this exists in the CSS (inventory.css:370-373: `.inventory-table td.cell-actions { text-align: right; }`). The HTML currently uses class `action-buttons` on the `<td>` (inventory.js:587), not `cell-actions`. This needs alignment fix: add `text-align: right` to the Actions column `<td>` via class or inline style.
