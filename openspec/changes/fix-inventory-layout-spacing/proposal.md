## Why

The Inventory Management page layout is cramped and the pagination footer includes a visible "Per page" selector that clutters the UI. The table container lacks comfortable padding, column alignment needs tightening, row spacing is inconsistent, and the pagination footer needs cleanup — all of which make the page feel unpolished compared to the rest of the admin interface.

## What Changes

- Wrap the inventory table in a clean, centered, rounded card with comfortable left/right padding and no page-edge touching.
- Tighten column header alignment: ITEM NAME gets enough width for long names; QUANTITY keeps number+unit together; STATUS, LAST UPDATED, ACTIONS are properly aligned.
- Standardize row height, padding, and horizontal separation across all inventory rows.
- Completely remove the "Per page: [10]" selector from the pagination footer (UI-only removal; the internal `perPage` variable and pagination logic remain at the default of 10).
- Restructure the pagination footer: "Page X of Y · Showing X-Y of Z items" on the left; « Prev / Next » buttons on the right, using `justify-content: space-between`.
- Add proper vertical gap between the last inventory row and the pagination footer.
- Ensure the table and pagination footer share the same left/right boundaries.
- Keep all existing functionality: pagination buttons, sorting, search/filter, view-only actions, modals, responsive behavior.

## Capabilities

### New Capabilities
- `inventory-page-layout`: Spacing, alignment, card styling, and pagination footer layout for the Inventory Management page. Covers the table card, column widths, row spacing, and the bottom pagination bar structure. No functional changes.

### Modified Capabilities

## Impact

- **Frontend (HTML)**: `public/inventory.html` — remove `.pagination-limit` block from the pagination footer; no structural changes to table or modals.
- **Frontend (CSS)**: `public/css/inventory.css` — adjust `.pagination-bar` flex layout, hide/remove `.pagination-limit` styles, tighten row padding, ensure responsive breakpoints.
- **Frontend (JS)**: `public/js/inventory.js` — hide the `#perPageSelect` and its wrapper from the DOM on init (or remove the event listener reference), keeping the internal `perPage` state at the default of 10.
- **Backend/API/DB**: No changes.
- **Other modules**: No changes to sidebar, header, login, authentication, or other admin pages.
