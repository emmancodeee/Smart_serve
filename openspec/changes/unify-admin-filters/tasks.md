## 1. Shared Filter Component

- [x] 1.1 Create `public/js/admin-filters.js` with the `SmartFilter` component: toolbar renderer (search input, selects, date range, sort, Reset Filters, Export), filter state, debounced search (reuse `debounce`), change wiring, and a per-module config registry (D1)
- [x] 1.2 Add the date-range preset engine `getDateRangePresetBounds` (Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month, This Year, Custom Range, All Time) with legacy key mapping (day/week/month/year/all) and custom from/to date inputs (D3)
- [x] 1.3 Add the `SmartCombobox` searchable dropdown (input + filtered list, Arrow/Enter/Escape keyboard support, `role="combobox"` ARIA) used for long option lists (D4)
- [x] 1.4 Add shared filter CSS to `public/css/admin.css`: `.filter-toolbar`, `.filter-control`, `.smart-combobox`, `.advanced-filters` (collapsible), `.filter-btn`/`.filter-btn--reset`, date-range inputs, responsive wrap at ≤768px, 44px control-height parity for Bootstrap-based pages (D9)
- [x] 1.5 Add `exportRowsCsv(moduleId, rows, columns)` shared CSV exporter: `<module>-export-YYYY-MM-DD.csv` naming, header-only export when empty, full filtered dataset export (D8, data-export spec)
- [x] 1.6 Add live-data option helpers (`distinctFrom(records, getter)`) with hardcoded fallback lists only for empty datasets

## 2. admin.html SPA Sections

- [x] 2.1 Registrations: config (search student name/ID, course + year level live options, status → table visibility All/Pending/Approved/Rejected, date registered, sort), rewire `getFilteredRegistrationsByStatus`/`displayRegistrations` (D6)
- [x] 2.2 Transactions: config (search transaction ID/student name/ID, course, item category, transaction type Module/Book/Uniform, payment status best-effort resolver, date range, sort), rewire `getFilteredTransactions`/`displayTransactions`
- [x] 2.3 Pickup confirmations: config (search student name/ID, pickup status via `resolvePickupDisplayStatus`, item category, pickup date, sort), rewire `renderPickupConfirmationsTable`
- [x] 2.4 Admin accounts: config (search admin name/email, role, account status, department, date created, sort), rewire `renderAdminAccounts`
- [x] 2.5 Announcements: config (search title/content/author, category, priority, date, sort), rewire `getFilteredAnnouncements`/`renderFilteredAnnouncements`
- [x] 2.6 Users: config (search name/email/student number, status, date, sort), rewire `getFilteredUsers`/`renderFilteredUsers`
- [x] 2.7 Replace all old per-section filter markup in `admin.html` (`.section-filters`, `.search-bar`, `.filter-bar` blocks) with the shared toolbar containers; remove now-unused handlers from `setupEventListeners`

## 3. Feedback & Returns

- [x] 3.1 Feedback: change `loadFeedbacks` to fetch the full dataset via the existing endpoint (explicit large limit), remove inline `onchange="loadFeedbacks()"` handlers and the Bootstrap `.form-select` markup (D2)
- [x] 3.2 Feedback: `admin-filters` config (search student/message, category + status from live stored values, rating 1–5 when data exists, date submitted, sort); delete duplicated inline `.dashboard-table-controls` styles (D7)
- [x] 3.3 Returns: change `loadReturnRequests` to full fetch; config (search, status, return reason from stored values, item category, request date, sort) (D2, D7)
- [x] 3.4 Returns: delete duplicated inline styles; confirm both pages still load the shared shell correctly after rewiring

## 4. Inventory

- [x] 4.1 Unify inventory filtering to a single path: remove `filterInventory`/`handleFilterChange` duplication and double event bindings; one `getFilteredItems` + sort flow (D1)
- [x] 4.2 Re-base `.inventory-toolbar` on the shared component; add stock status + date added filters; keep the per-page select and column-header sort
- [x] 4.3 Replace inventory's `exportCsv` with the shared exporter honoring active filters (D8)

## 5. Analytics

- [x] 5.1 Add `analyticsCriteria` state (date range preset, course, year level, department, item category, inventory status) and include a criteria hash in the `chartCache` key (D5)
- [x] 5.2 Extend `getChartData`/`loadAnalytics` to filter usage entries (course, year level, department, item category via `itemKey`→`allInventory` category) and inventory-derived metrics by status; default (no criteria) output identical to today
- [x] 5.3 Add the dashboard filter toolbar (date range with presets + custom, course, year level, department, item category, inventory status) wired to `analyticsCriteria`

## 6. Verification

- [x] 6.1 `node --check` on all modified JS; grep audit that no old filter IDs/handlers remain (`onchange="loadFeedbacks()"`, `registrationCourseFilter`, `searchBox`, inline filter styles, `.section-filters`)
- [ ] 6.2 Functional verification: combined filters (search + status + date range), all presets incl. custom range, combobox keyboard navigation, sort options, Reset Filters, export contents per module (headers, filtered rows, filename)
- [ ] 6.3 Manual browser pass (user): all nine modules, responsive wrap on mobile, searchable dropdowns, no console errors
- [x] 6.4 Update `REPORT.md` with findings (files modified, configs added, verification results)
