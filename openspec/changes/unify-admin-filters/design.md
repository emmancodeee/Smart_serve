## Context

Today each SMARTSERVE admin module implements filters differently (see proposal):
- `admin.html` (SPA shell): client-side filtering with a shared time engine (`normalizeTimeFilter`/`getTimeRangeBounds`/`filterRecordsByTimeRange`, admin.js:578-653) and tokenized search (`matchesQuery`, admin.js:1861), but three different markup patterns (`.section-filters`, `.filter-bar`, `.search-bar`), no sort, no export, and missing filters on pickup confirmations/admin accounts.
- Feedback/returns pages: server-side query-param filtering (status/category/priority), Bootstrap selects in duplicated inline `<style>` blocks, refetch on every change, implicitly capped at 20 rows by server default.
- Inventory: its own `.inventory-toolbar` with two overlapping filter paths (`getFilteredItems` vs `filterInventory`) and a CSV exporter that ignores filters.
- No filter state persistence, no searchable selects, no universal date presets or sort options.

Constraints: keep all backend logic/endpoints/MongoDB collections unchanged; no new dependencies; stay consistent with navy/white/gold branding and the existing card/table styling.

## Goals / Non-Goals

**Goals:**
- One shared filter component (markup + CSS + JS engine) used by all nine admin surfaces.
- Universal search, date range presets (incl. custom range), sort, reset, and CSV export, configurable per module.
- Live-data option population with hardcoded fallbacks only when no data exists.
- Searchable dropdowns for long lists; responsive toolbar; combined filtering; dashboard analytics filterable by the requested criteria.
- Feedback/returns switch to client-side filtering of a full dataset fetched through existing endpoints.

**Non-Goals:**
- No backend/API/MongoDB changes (no new endpoints, no server-side filter expansion).
- No filter state persistence (URL/localStorage) — out of scope.
- No server-side pagination for admin.html tables (existing cap of 200 rows for pickup confirmations is retained).
- `admin-requests.html` (unserved legacy page) and student-facing pages are untouched.

## Decisions

### D1 — Single shared engine: `admin-filters.js` with per-module configs
New `public/js/admin-filters.js` exports a `SmartFilter` component and a registry of per-module configurations:

```js
SmartFilter.create(container, {
  moduleId: 'registrations',
  search: { placeholder: 'Student name or ID' },
  fields: [
    { key: 'course', label: 'Course', options: () => distinct(allRegistrations, r => r.course) },
    { key: 'status', label: 'Status', options: STATUSES },
    { key: 'dateRange', label: 'Date', presets: true, getDate: r => getFirstValidDate(r) },
    { key: 'sort', options: SORTS }
  ],
  advanced: ['course', 'yearLevel', 'department'],
  getRows: () => allRegistrations,
  filter: (rows, state) => rows,        // module-specific predicate
  onRender: rows => displayRegistrations(rows),
  export: { columns: [...], fileName: 'registrations' }
});
```

Each module registers one config; the component renders the toolbar + advanced panel, owns filter state, debounced search, date-range handling, sorting, and export dispatch. Existing display functions (`displayUsers`, `displayRegistrations`, `displayTransactions`, `renderPickupConfirmationsTable`, `renderAdminAccounts`, `renderAnnouncementsTable`-equivalents, feedback/returns/inventory tables) become the `onRender` targets and stay untouched.
**Alternatives considered:** per-module bespoke toolbars (rejected — the current mess), a grid library like DataTables/Tabulator (rejected — new dependency, fights existing Tailwind/Bootstrap table markup and the analytics panels), extending Bootstrap (rejected — admin.html does not use Bootstrap).

### D2 — Client-side filtering everywhere, including feedback/returns
Feedback and returns currently refetch with query params and only ever display the first server page (limit 20). They will fetch the full dataset once per refresh through the existing endpoints (explicit large `limit` param — the services already support `page`/`limit`) and filter client-side via the shared engine, like every other module. `onchange="loadFeedbacks()"` inline handlers are removed. Server endpoints, services, and collections are unchanged.
**Alternatives considered:** expanding server-side filters to match the request (rejected — violates the keep-backend-unchanged constraint).

### D3 — Extend the time engine with calendar-aware presets
The current engine is rolling-window based. Add `getDateRangePresetBounds(preset, now)` in `admin-filters.js`:
- Rolling: Last 7 Days, Last 30 Days (window-based).
- Calendar: Today, Yesterday, This Month, Last Month, This Year (local-time boundaries).
- Custom Range: from/to `<input type="date">` fields (revealed when the preset is chosen).
- All Time: unbounded.
Legacy keys are mapped (day→Today, week→Last 7 Days, month→Last 30 Days, year→This Year, all→All Time) so the existing `sectionTimeFilters` consumers (including analytics buckets) keep working; per-module `getDate(row)` functions supply each record's date (reuse existing per-entity date getters; feedback uses `createdAt`, returns uses `requestedReturnDate`).

### D4 — Searchable dropdown + custom range, zero dependencies
A lightweight `SmartCombobox` (button + input + option list, arrow/enter/escape keyboard support, `role="combobox"`/`aria-expanded` semantics) renders whenever a field's option list exceeds a threshold (e.g., 8 options) or the config flags it searchable. Native `<select>` is kept for short lists. Custom date range uses two native date inputs.
**Alternatives considered:** native `<select>` (not searchable), `<datalist>` (inconsistent browser UX) — rejected.

### D5 — Analytics filtering feeds the existing pipeline
A `analyticsCriteria` state (course, year level, department, item category, inventory status, date range preset) is added; `getChartData(rangeKey)` gains a criteria parameter that (a) filters `filteredUsageEntries` by course/year level/department (mapping `entry.cohort`/registration fields), (b) filters by item category (mapping `entry.itemKey` → `allInventory` category), and (c) restricts inventory-derived metrics (health rows, low-stock counts) by status when set. `chartCache` keys extend to include a criteria hash. Default (no criteria) produces byte-identical output to today. The existing rolling-window bucket logic is unchanged.

### D6 — Registration status semantics
Registrations keep their three tables (pending/approved/rejected). The new Status filter (`All / Pending / Approved / Rejected`) selects which tables are visible: a chosen status shows only that table; `All` shows all three as today. One filter set still drives all visible tables.

### D7 — Feedback/returns taxonomy uses live stored values
Feedback category and status selects are populated from the distinct stored values in the loaded records (labels = stored values, capitalized), satisfying "use live backend data; don't hardcode". Where a requested option (e.g., rating 1–5) has no data, the select shows only options that exist in data. Return reason is likewise derived from stored reason values when present. (Requested-but-unavailable options degrade gracefully instead of matching nothing.)

### D8 — Shared export
`exportRowsCsv(moduleId, rows, columns)` in `admin-filters.js` replaces `inventory.js`'s `exportCsv` (which currently ignores filters) and is exposed as the Export button on every module. Columns per module follow the data-export spec; filename `<module>-export-YYYY-MM-DD.csv`; empty result exports header only; exports the full filtered dataset (not the visible page).

### D9 — Styling
Shared component CSS added to `public/css/admin.css` (kept in one place): `.filter-toolbar` (flex wrap, gap consistent with existing `--space-*` tokens), `.filter-control`, `.smart-combobox` (+ dropdown list + focus-visible rings using `#2563eb`), `.advanced-filters` (collapsible via `<details>`-style button or disclosure pattern), `.filter-btn`, `.filter-btn--reset`, `.filter-date-range` inputs, and responsive wrap at ≤768px. The duplicated inline `.dashboard-table-controls` styles in feedback/returns HTML are deleted; inventory's `.inventory-toolbar` is re-based on the shared classes (retaining its per-page select). Old per-section markup (`.section-filters`, `.search-bar`, `.filter-bar` in admin.html, `.inventory-toolbar` in inventory.html) is removed or slimmed to the shared component.

## Risks / Trade-offs

- [Feedback/returns full fetch may grow payloads] → existing endpoints support limit; fetch with explicit large limit once per refresh; client-side filtering is cheap; dataset sizes are small (single school).
- [Payment status may not be derivable from transaction data] → resolver maps available status/confirmation fields; if a row has no payment info it is treated as unclassified and excluded only when the filter is set (documented in REPORT).
- [Rewiring removes long-standing element IDs/handlers] → one change, systematic; grep audit in verification tasks; pages load the same script set.
- [Custom combobox a11y complexity] → keyboard navigation + ARIA combobox pattern + focus-visible styling; verified in the browser pass.
- [Analytics criteria could slow re-renders] → cache invalidation only on criteria/range change; same memoized pipeline as today.
- [Two codebases (Bootstrap feedback/returns vs Tailwind admin.html) styling mismatch] → shared CSS overrides Bootstrap form-control sizing on those pages to match the 44px control height used elsewhere.

## Migration Plan

1. Land `admin-filters.js` + shared CSS (component, presets, combobox, export) — no page changes yet.
2. Migrate `admin.html` sections one at a time: registrations → transactions → pickup confirmations → admin accounts → announcements → users, each through the shared engine, verifying counts per step.
3. Migrate feedback, then returns (switch to full fetch + client-side filtering).
4. Migrate inventory (single filter path, fix export, shared toolbar).
5. Wire dashboard analytics criteria into `getChartData`/`loadAnalytics`.
6. Full verification: `node --check`, grep audit of removed IDs, browser pass (all modules, all presets, custom range, combobox keyboard, export contents, responsive).
Rollback: revert the affected files (no backend/data migrations exist, so rollback is a plain revert).

## Open Questions

- None blocking — resolved above: payment-status availability (D8 risk note), feedback category taxonomy (D7), analytics window semantics (D5).
