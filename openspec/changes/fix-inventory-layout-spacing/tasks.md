## 1. Remove the Per Page selector

- [x] 1.1 In `public/inventory.html`, remove the `<div class="pagination-limit">` block containing the "Per page:" label and the `#perPageSelect` dropdown
- [x] 1.2 In `public/js/inventory.js`, remove the hidden element defensively on init: delete `#paginationBar .pagination-limit` from the DOM if present (so no stale markup can reappear)
- [x] 1.3 In `public/js/inventory.js`, remove the `perPageSelect` change listener binding (no longer references a removed element)
- [x] 1.4 Confirm the internal `perPage` state stays at the default of 10 and pagination still pages correctly (no logic changes)

## 2. Table card container spacing

- [x] 2.1 Verify `.admin-table-wrap` (admin.css:2330) provides the rounded card (border, radius, background, shadow) and that the inventory page uses it
- [x] 2.2 Ensure the table has comfortable horizontal padding inside the card; verify the inventory page does not let the table touch the page edges (`.admin-main` uses `px-4 md:px-6`)
- [x] 2.3 Keep the table width responsive (`width: 100%`) so the card fills the content column

## 3. Column header and data alignment

- [x] 3.1 Add a `<colgroup>` to `#inventoryTable` assigning proportional widths: Item Name ~30%, Category ~14%, Quantity ~12%, Status ~14%, Last Updated ~14%, Actions fixed
- [x] 3.2 Verify the Actions column header aligns right and matches the right-aligned "View only" label
- [x] 3.3 Confirm Item Name headers/data are left-aligned and long names wrap to one line on desktop when space allows

## 4. Row styling

- [x] 4.1 Ensure a consistent minimum row height and equal vertical padding across all inventory rows (inventory.css: `.inventory-table td` padding `20px 24px`, `tbody tr` height `72px`)
- [x] 4.2 Add `text-align: right` to the Actions `<td>` (currently rendered with class `action-buttons`) so "View only" aligns consistently on the right
- [x] 4.3 Verify the Quantity cell keeps the number and unit ("14 pcs") together without excess separation
- [x] 4.4 Verify horizontal separators between rows remain clean and no text touches the row borders

## 5. Pagination footer layout

- [x] 5.1 Verify `.pagination-bar` uses `display: flex; align-items: center; justify-content: space-between;` (inventory.css:153) with the two remaining groups (info left, controls right)
- [x] 5.2 Increase the gap between the last table row and the pagination top border (bump `.pagination-bar` `margin-top` from 0.5rem to ~1rem)
- [x] 5.3 Confirm the pagination info text ("Page X of Y" + "Showing X-Y of Z items") stays left-aligned and no empty area remains where the Per Page selector was
- [x] 5.4 Confirm « Prev / Next » keep existing styling, equal height, spacing, and disabled state on page 1

## 6. Responsive behavior

- [x] 6.1 Verify horizontal scrolling stays contained inside the table card on tablet/mobile (`.table-scroll` / `.admin-table-wrap` `overflow-x: auto`)
- [x] 6.2 Confirm the pagination footer wraps gracefully on < 640 px screens (info above buttons, no off-screen overflow)
- [x] 6.3 Confirm no overlapping text or elements outside the screen on desktop, tablet, and mobile

## 7. Regression checks

- [x] 7.1 Verify sorting, search/filter, and the view-only Actions display still work after the layout changes
- [x] 7.2 Verify the Add Item / Edit Item modals and inventory summary cards are unaffected
- [x] 7.3 Verify sidebar (Inventory Management active) and header layout are unchanged
- [x] 7.4 Grep for `pagination-limit`, `perPageSelect`, and "Per page:" in the codebase; confirm they are fully removed from visible UI