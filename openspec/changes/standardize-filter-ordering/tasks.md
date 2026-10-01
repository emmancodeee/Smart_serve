## 1. Shared Engine (Search last)

- [x] 1.1 In `public/js/admin-filters.js` `build()`, move the search-input block (currently `if (config.search) { ... }` at the top of the toolbar, ~line 654) to after the sort-select block and before the Reset Filters button (~line 705), so the toolbar order becomes: field selects → Date Range → Sort → Search → Reset → Export.
- [x] 1.2 Verify no other code in `admin-filters.js` depends on search being the first toolbar child (e.g., firstChild/index-based lookups).

## 2. Module Config Reorders (Category first)

- [x] 2.1 `public/js/admin-returns.js` (RETURN_FILTER_CONFIG): reorder `fields` to `category` → `status` → `reason` → `dateRange` so Item Category renders first.
- [x] 2.2 `public/js/admin.js` Analytics filter config (~line 4387): reorder `fields` to `itemCategory` → `course` → `yearLevel` → `inventoryStatus` → `dateRange` so Item Category renders first.
- [x] 2.3 Confirm inventory.js, admin-feedback.js, and admin.js Announcements configs already list the category field first (no change expected).

## 3. Static Pages

- [x] 3.1 `public/announcement.html`: move the Search block after the Timeframe/Sort controls and before the Clear Filters button (result: Category → Timeframe → Sort → Search → Clear Filters).
- [x] 3.2 Audit `public/js/announcement.js` for index-based selectors that assume Search is first; update to class/id-based lookup if found.
- [x] 3.3 `public/admin-requests.html`: verify Search is already the last filter control after Status and Module Code; no change unless confirmed out of order.

## 4. Tests

- [x] 4.1 Add a regression test to `tests/admin-filters.test.js` asserting the category select renders before other field selects and the `.filter-control__input--search` renders after all `.filter-control__select` controls.
- [x] 4.2 Run `npm test` (jest) and confirm all tests pass.

## 5. Verification

- [x] 5.1 Manually verify toolbar order on inventory.html, admin-returns.html, admin-feedback.html, and the admin.html modules (transactions, announcements, analytics, users, registrations, pickup confirmations, admin accounts).
- [x] 5.2 Verify the order holds when the toolbar wraps at narrow widths (no CSS changes; DOM order preserved by flex-wrap).