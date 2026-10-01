## Why

Every SMARTSERVE admin module has its own ad-hoc filter setup: admin.html mixes three different placement patterns (`.section-filters` in header rows, standalone `.filter-bar`s, separate `.search-bar`s), feedback/returns use duplicated inline Bootstrap styles with server-side refetch filtering, inventory has its own toolbar with two overlapping sort implementations, and several modules (pickup confirmations, admin accounts) have no search/sort at all. Filters are inconsistent, hard to maintain, and frustrating to use.

## What Changes

- Introduce a single reusable **filter component** (shared markup pattern, shared CSS in `public/css/admin.css`, shared client-side filter engine in a new `public/js/admin-filters.js`) used by every admin module: dashboard analytics, registrations, transactions, pickup confirmations, announcements, admin accounts, feedback, returns, and inventory.
- Standardize the horizontal filter toolbar: search box, status/category/type selects, date range select (with presets incl. Custom Range), sort select, Reset Filters and Export buttons — wrapping into multiple rows on small screens.
- Add a collapsible **Advanced Filters** panel (course, year level, department, category, status, date range, sort) with Apply Filters and Reset Filters buttons.
- Add universal **date range presets**: Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month, This Year, Custom Range, All Time.
- Add universal **sort options**: Newest, Oldest, A–Z, Z–A, Highest Quantity, Lowest Quantity, Most Requested, Least Requested (applicable subset per module).
- Add **searchable dropdowns** (lightweight custom combobox, no new dependencies) for long option lists (courses, items, departments).
- Add **search fields** where missing (feedback, returns, pickup confirmations, admin accounts) and extend searchable fields (transaction ID, item name, feedback/return request IDs, admin name).
- Add **CSV export** of the currently filtered rows for every module (shared exporter; inventory's existing `exportCsv` replaced by it).
- Populate filter options from **live data** (courses, year levels, departments, categories) with hardcoded fallbacks only when no data exists; remove hardcoded option lists where data is available.
- Dashboard analytics gains filterable criteria (date range, course, year level, department, item category, inventory status) that feed `getChartData`.
- **BREAKING**: feedback/returns switch from server-side filter-refetch (query params) to client-side filtering of a full dataset fetched via the existing endpoints (endpoints unchanged). Feedback/returns/registrations/transactions gain visible per-row counts only when their endpoints provide them.
- **BREAKING**: the old per-section filter markup/IDs in `admin.html`, `admin-feedback.html`, `admin-returns.html`, `inventory.html` are replaced by the shared component; existing handlers (`getFiltered*`, `renderFiltered*`) are rewired through the shared engine. Public API endpoints and MongoDB collections are untouched.

## Capabilities

### New Capabilities
- `admin-filters`: The unified filtering system — shared toolbar + advanced panel UI, filter engine (search, status/category/type, date range presets incl. custom range, sort), live-data option population, searchable dropdowns, Apply/Reset behavior, responsive layout, and per-module filter configurations.
- `data-export`: CSV export of the currently filtered rows for each admin module, with consistent file naming and column mapping.

### Modified Capabilities
<!-- None — `openspec/specs/` is currently empty; no existing capability specs are changing. -->

## Impact

- **Files modified**: `public/admin.html`, `public/js/admin.js`, `public/admin-feedback.html`, `public/js/admin-feedback.js`, `public/admin-returns.html`, `public/js/admin-returns.js`, `public/inventory.html`, `public/js/inventory.js`, `public/css/admin.css`, `public/css/inventory.css`.
- **New files**: `public/js/admin-filters.js` (shared filter engine + component), `public/css/admin-filters.css` (or a section in `admin.css`).
- **Backend**: no changes — all existing API endpoints, services, and MongoDB collections stay as-is (feedback/returns continue using `/api/auth/admin/feedback` and `/api/auth/admin/returns`; clients fetch the full dataset and filter client-side).
- **Dependencies**: none added (searchable dropdown + date range are custom vanilla implementations; CSV via existing Blob technique).
- **Out of scope**: `public/admin-requests.html` (unserved legacy page), student-facing pages.
