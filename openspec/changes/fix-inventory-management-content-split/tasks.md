## 1. Remove the duplicated Inventory Summary section

- [x] 1.1 Delete the Inventory Summary `<section>` (the four `stat-card` blocks and their `analytics-section-body` / `analytics-grid` wrappers) from `public/inventory.html`. Remove the markup itself; do not add a CSS `display: none` rule.
- [x] 1.2 Confirm the `Total Items`, `Low Stock`, `Categories`, and `Last Updated` card blocks are no longer present in `public/inventory.html`.
- [x] 1.3 Confirm the Inventory List section is now the first content below the page header, with the read-only notice as its first child.
- [x] 1.4 Confirm `public/admin.html` still contains its own Inventory Overview cards under `#analytics` and is byte-for-byte unchanged.

## 2. Remove the read-only notice entirely

- [x] 2.1 Delete the `<p id="inventoryReadOnlyNotice">` element from `public/inventory.html`, including its `mb-4` wrapper spacing, amber background, border, text, and the `/admin/supply-stock` link.
- [x] 2.2 Confirm no replacement message, substitute element, or empty container is left where the notice was, and that no compensating margin or padding was added.
- [x] 2.3 Confirm the `section-header-bar` with its `h2` "Inventory List" is now the first child of the Inventory List `<section>`, and that the wrapper was neither removed nor restyled (the `h2`'s `margin: 0 -1.25rem 1rem` resolves against it).
- [x] 2.4 Remove `applySuperAdminSidebar()` from `public/js/inventory.js` and both of its call sites, keeping the adjacent comment explaining why this page does not load `admin.js`.
- [x] 2.5 Confirm `isCurrentSuperAdmin()` is still used by `applyHeaderGreeting()` and was not collaterally removed.
- [x] 2.6 Confirm the shared sidebar still lists Supply & Stock for both roles, so the removed inline link leaves no gap in navigation.

## 3. Arrange the inventory filter toolbar as two rows

- [x] 3.1 Append a scoped block to `public/css/admin.css` converting `.admin-page .filter-toolbar[data-module="inventory"] .filter-toolbar__row--main` to `display: grid` with `grid-template-columns: repeat(4, minmax(0, 1fr))` and `gap: 12px`, with a comment recording that other modules are unaffected.
- [x] 3.2 Place `.filter-control--search` on `grid-column: span 2` so the search field spans the first two tracks of the second row.
- [x] 3.3 Set `min-width: 0; width: 100%` on the inventory-scoped `.filter-control`, `.filter-btn`, `.filter-control__select`, and `.filter-control__input` so controls fill their tracks without overflowing the `min-width: 180px` select floor.
- [x] 3.4 Add a `max-width: 768px` media query that drops the inventory toolbar to `repeat(2, minmax(0, 1fr))` with the search spanning `1 / -1`.
- [x] 3.5 Confirm the seven controls resolve to exactly two rows — Category, Stock Status, Date Added, Sort on row 1; search, Reset Filters, Export on row 2 — and that the hidden `.filter-date-range__custom` sub-row does not consume a track.
- [x] 3.6 Confirm the search placeholder "Search items by name, category, or unit of measure..." is not clipped and does not overlap Reset Filters or Export.
- [x] 3.7 Confirm the left edges of row 1 and the search field align, and the right edges of Sort and Export align.
- [x] 3.8 Confirm no existing CSS rule was edited or deleted: the change is purely additive, and the shared unprefixed `.filter-toolbar*`, `.filter-control*`, and `.filter-btn*` rules are byte-identical.

## 4. Repair the element nesting in inventory.html

- [x] 4.1 Add the missing `</div>` that closes the `div.mx-auto` header content wrapper opened at `public/inventory.html:47`, placing it before the `</header>` end tag.
- [x] 4.2 Remove the stray `</div>` at `public/inventory.html:133` that closes no element opened within the Inventory List section.
- [x] 4.3 Verify every `</div>` in the file now matches a `div` open at that point in document order, and that file-wide `<div>` and `</div>` counts are equal.
- [x] 4.4 Verify the parsed structure places `<main>` and the Inventory List section inside `#main-content`, matching the pre-change rendered structure.

## 5. Remove the card-only JavaScript

- [x] 5.1 Enumerate and list every call site of `loadSummary()` and `updateCardStats()` in `public/js/inventory.js`, including any call from the `loadInventory()` path, before deleting anything.
- [x] 5.2 Remove the `loadSummary()` function and all of its call sites.
- [x] 5.3 Remove the `updateCardStats()` function and all of its call sites.
- [x] 5.4 Confirm no remaining reference to the removed card element ids (`totalItems`, `lowStockItems`, `totalCategories`, `lastUpdatedDate`) exists in `public/inventory.html` or `public/js/inventory.js`.
- [x] 5.5 Confirm the `totalItems` local variable in the pagination helpers (`getPaginatedItems`, `renderPagination`, `applyDisplay`) is intact and unrenamed.
- [x] 5.6 Confirm `getStatusInfo(quantity, reorderLevel)` and all table status badge logic are unchanged.

## 6. Verify preserved behavior and absence of regressions

- [x] 6.1 Run `node --check` on `public/js/inventory.js` and confirm it passes.
- [x] 6.2 Confirm `public/js/inventory.js` no longer issues a request to `/api/auth/inventory/analytics/summary` on page load, and that the endpoint itself is left in place for the Dashboard.
- [x] 6.3 Confirm the inventory filters, search, sort, pagination, and CSV export controls are all still present and functional.
- [x] 6.4 Confirm the inventory table still renders its columns, status badges, and the real Books/Modules/Uniforms dataset, with no demo records introduced.
- [x] 6.5 Confirm the shared sidebar and `admin-nav.js` mount are unaffected and the Inventory Management item still resolves to `/admin/inventory`.
- [x] 6.6 Confirm no CSS rule that the Dashboard depends on was removed; in particular, `stat-card` styling is shared and must be retained.
- [x] 6.7 Confirm the read-only notice is absent for both Admin and Super Admin, and that no Supply & Stock link remains in the main content region.
- [x] 6.8 Confirm role permissions and routes in `server.js` are unchanged.
- [x] 6.9 Note the pre-existing `public/admin.html` div imbalance (110 opens / 109 closes) as out of scope and leave it unmodified.
- [x] 6.10 Confirm `public/js/admin-filters.js` is unmodified and the other nine filter containers keep their existing `data-module` values, so no other admin module's toolbar changes.

## 7. Validate the change

- [x] 7.1 Run `openspec validate fix-inventory-management-content-split` and confirm it passes.
- [x] 7.2 Run `openspec status --change fix-inventory-management-content-split` and confirm the change is complete.
- [x] 7.3 Flag for the requester, before archiving, that the unarchived changes `redesign-inventory-page-layout` and `inventory-page-ui-cleanup` still require the summary cards to be present and must be retired or re-scoped.

## Notes

- **This change absorbed a second request.** The request to remove the yellow read-only notice and arrange the filters into two rows was folded into this unarchived change rather than stacked as a separate one, because this change's own spec asserted the notice was the first element of the module content. The `## MODIFIED Requirements` block for "Information banner displays below summary cards" was replaced by a `## REMOVED Requirements` entry.
- **The "All Time" control is not a separate filter.** `All Time` is the first entry of `DATE_RANGE_PRESETS` (`{ key: 'all', label: 'All Time' }`) and therefore the default option of the single Date Added range select. No time-of-day filter was introduced.
- **`.section-header-bar` has no CSS rule anywhere in the project.** The blue title bar is produced by `.admin-page .admin-section h2` (`admin.css:2046`) via `--module-title-*` tokens, bleeding full-width with `margin: 0 -1.25rem 1rem`. That negative margin resolves against the unstyled wrapper, so the wrapper is retained untouched.
- **The toolbar is a single wrapping flex row, not two rows.** `SmartFilter.build()` emits one `filter-toolbar__row filter-toolbar__row--main`; the two-row arrangement is new work delivered by the scoped grid rule, following the existing `[data-module="registrations"]` precedent at `admin.css:3523-3565`.
- **Deviation from design D4 (intentional).** `formatDate()` was removed from `public/js/inventory.js` in addition to `loadSummary()` and `updateCardStats()`. A repo-wide grep confirmed its only caller was `updateCardStats()`. Note `supply-stock.js` defines its own separate `formatDate`; the two pages are never loaded together, so there is no cross-page dependency.
- **Call sites removed (task 5.1 enumeration).** `loadSummary()`: the `DOMContentLoaded` call, the `setInterval(..., 30000)` call, and the definition. `updateCardStats()`: the call inside `loadInventory()`, the call inside `loadSummary()`, and the definition. `summaryInFlight` and `formatDate()` went with them. `applySuperAdminSidebar()` and its two calls were removed under task 2.4. The identically named `loadSummary`/`summaryInFlight`/`formatDate` in `schedule.js` and `supply-stock.js` belong to other pages and were not touched.
- **Protected files confirmed byte-for-byte unchanged** (SHA-256 compared before and after): `public/admin.html`, `public/js/admin.js`, `public/js/admin-nav.js`, `public/js/admin-filters.js`, `server.js`, `public/css/inventory.css`. `public/css/admin.css` is modified additively only.
- **Resulting `public/inventory.html`:** 147 lines (was 188), 24 `<div>` opens and 24 `</div>` closes, no unmatched end tag in document order, nothing unclosed at EOF. `GET /api/auth/inventory/analytics/summary` remains defined at `routes/auth.js:118` but now has no client caller.
- **Not verified (needs a running server and a logged-in admin):** live rendering, the two-row wrap at real viewport widths, the Date Added `custom` preset sub-row, real filter/sort/pagination interaction, and CSV export download.
