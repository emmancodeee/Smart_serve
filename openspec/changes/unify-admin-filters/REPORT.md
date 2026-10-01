# unify-admin-filters — Implementation Report

## Files Modified

| File | Change |
| --- | --- |
| `public/js/admin-filters.js` | New shared filter engine: `SmartFilter.create(container, config)` (toolbar + collapsible Advanced Filters, debounced search, field selects that auto-upgrade to searchable comboboxes >8 options, universal date-range presets incl. Custom Range, sort select, Reset Filters, Export), `SmartFilter.DATE_RANGE_PRESETS`, `getDateRangePresetBounds`, `legacyPresetKey`, `exportRowsCsv` (BOM, quoted cells, header-only on empty, `<module>-export-YYYY-MM-DD.csv`), `distinctFrom`, `SmartCombobox` (ARIA listbox, arrow/Enter/Escape keyboard nav, outside-click close). Added `setSort(key)` (Phase D: lets per-page column-header sorts drive the shared sort select). |
| `public/css/admin.css` | Appended shared component CSS: `.filter-toolbar`/`.filter-toolbar__row`, `.filter-control` (+ `.filter-control--search`, 44px parity for Bootstrap pages), `.filter-control__select`/`.filter-control__input`, `.smart-combobox` (button, search, options list, `is-open`/`is-highlighted`/`is-selected`), `.filter-date-range` + `.filter-date-range__custom`/`is-visible`, `.advanced-filters` collapsible, `.filter-btn`/`.filter-btn--reset`/`.filter-btn--export`, responsive wrap at ≤768px. |
| `public/js/admin.js` | Rewired all six SPA sections through `SmartFilter` (users, registrations, transactions, pickup confirmations, admin accounts, announcements) + new analytics criteria panel. Added instance globals + `initAdminFilters()` (runs after first `refreshData()`), `setSort`-driven registrations status → table-visibility sync (`renderRegistrationsWithFilter`), `pickupStatusOf` helper, `analyticsCriteria` state (preset incl. custom from/to, course, year level, item category, inventory status; department omitted — no such field in any model), `analyticsCriteriaHash` in the `chartCache` key, `getAnalyticsBounds` (custom-range aware), `applyAnalyticsCriteriaToUsage` (course, year level via `cohort`, item category via `itemKey`→`allInventory`), `applyAnalyticsStatusToInventory` (In/Low/Out of Stock), preset-aware label helpers, `buildInventoryHealthRows` pool param. Removed old `getFiltered*` helpers, `matchesQuery`, `normalizeSearchText`, `filterRecordsByTimeRange`, `populateSelectOptions`, and the `#analyticsTimeFilter` handler. |
| `public/admin.html` | All six section toolbars + the analytics criteria panel replaced with shared containers (`#analyticsFilterContainer`, `#usersFilterContainer`, `#registrationsFilterContainer`, `#transactionsFilterContainer`, `#pickupConfirmationsFilterContainer`, `#adminAccountsFilterContainer`, `#announcementsFilterContainer`) below the navy section headers; removed `.section-filters`/`.search-bar`/`.filter-bar` markup and the `#analyticsTimeFilter` select; `<script src="/js/admin-filters.js">` added before admin.js. |
| `public/admin-feedback.html` + `public/js/admin-feedback.js` | Switched to client-side filtering: `loadFeedbacks()` fetches the full dataset once (`?limit=1000`), `#feedbackFilterContainer` + `FEEDBACK_FILTER_CONFIG` (search student/subject/message, category + status from live stored values, rating 1–5 when data exists, date submitted, sort, export). Removed the three `.form-select` filters + `onchange` handlers and duplicated inline `.dashboard-table-controls` CSS; `admin-filters.js` script added. |
| `public/admin-returns.html` + `public/js/admin-returns.js` | Same treatment: `loadReturnRequests()` full fetch (`?limit=1000`), `#returnFilterContainer` + `RETURN_FILTER_CONFIG` (search, status, return reason from stored values, item category from `items[].type`, requested return date, sort, export). Removed duplicated inline styles; `admin-filters.js` script added. |
| `public/inventory.html` + `public/js/inventory.js` | Unified to the single `SmartFilter` path: `#inventoryFilterContainer` inside the retained `.inventory-toolbar` (Add Item button kept beside it), config = search, category (live), stock status (In/Low/Out of Stock), date added (`createdAt || updatedAt`), sort, export. Column-header sort (`sortBy`/`updateSortArrows`) now maps onto the shared sort select via `setSort`; `getFilteredItems()` returns the SmartFilter output feeding the retained pagination + per-page select. Removed `filterInventory`, `handleFilterChange`, `getSortedItems`, duplicate event bindings, `exportCsv` + `#exportCsvBtn` (replaced by shared Export honoring active filters). `admin-filters.js` script added. |

## Configs Added (per module)

| Module | Search | Fields | Sort | Export columns |
| --- | --- | --- | --- | --- |
| Analytics (dashboard) | — | Date Range (presets+custom), Course, Year Level, Item Category, Inventory Status | — | — |
| Users | name/email/student number/status | Status, Date | Name, Last login | Name, Email, Student Number, Status, Last Login |
| Registrations | name/email/course/module/books/uniform | Status (→ table visibility), Course, Year Level, Student Type, Date | Student, Last updated | Student ID, Name, Course, Year Level, Status, Date |
| Transactions | user/status/details | Type, Status, Date | Date desc/asc, Student | Date, Student, Type, Details |
| Pickup confirmations | student name/email/module | Status, Date | Date, Student | Date, Student, Module, Status, Confirmation |
| Admin accounts | name/email | Role, Date | Name, Last login | Name, Email, Role, Date Created |
| Announcements | title/category/content/author/priority | Category, Priority, Date | Title, Published | Title, Category, Priority, Created By, Date |
| Feedback | student/subject/message | Category, Status, Rating, Date | Date desc/asc, Student | Date, Student, Category, Rating, Status, Message |
| Returns | student/item/reason | Status, Item Category, Return Reason, Date | Requested date, Student, Status | Date, Student, Item, Status, Reason, Quantity |
| Inventory | name/category/UOM | Category, Stock Status, Date Added | Name, Quantity, Category, Last Updated | Item Name, Category, Quantity, UOM, Status, Last Updated |

## Behavior Notes

- Feedback/returns export columns follow the data-export spec (Date, Student, Category, Rating, Status, Message / Date, Student, Item, Status, Reason, Quantity); all exports = filtered rows in current sort order, filename `<module>-export-YYYY-MM-DD.csv`, header-only when empty.
- Analytics default (no criteria) output is identical to before: default preset Last 30 Days maps to the legacy `month` range, buckets/rolling-window logic unchanged; forecast/slow-moving/cohort series now read from the criteria-filtered usage entries (byte-identical when no criteria).
- **Department filter omitted by decision (2026-08-02)**: no `department` field exists in any model (User/Registration/Admin), courses are free text ("BS Information Technology"); the analytics toolbar ships with course, year level, item category, inventory status. Tasks 5.1–5.3 retain the word "department" but the implementation intentionally excludes it until a data source exists.
- `admin-requests.html` / `requests-management.js` are a separate legacy page outside this change's file list and were left untouched.

## Verification

- `node --check` passes on all five modified JS files: `admin.js`, `admin-filters.js`, `admin-feedback.js`, `admin-returns.js`, `inventory.js`.
- Grep audit: zero remaining `onchange="loadFeedbacks()"`, `registrationCourseFilter`, `searchBox`/`sortSelect`/`exportCsvBtn`/`statusFilter`/`categoryFilter`/`priorityFilter` references in the four migrated pages; `.section-filters` classes removed from `admin.html`; duplicated inline `.dashboard-table-controls` styles removed from feedback/returns.
- All ten filter containers present (7 in admin.html + feedback + returns + inventory) with `admin-filters.js` loaded before each page script.
- No backend/API/MongoDB changes; no new dependencies.
- **Manual browser pass pending (user)**: combined filters, all presets incl. custom range, combobox keyboard nav, Reset Filters, export contents per module, responsive wrap on mobile, no console errors.
