## Why

The Request Management Status filter changes the dropdown but does not filter the data. Selecting "Approved" hides the Pending and Rejected **sections** and then fills the Approved table with *every* registration — pending, approved and rejected mixed. Selecting "All Status" fills all three tables with the identical full row set, so each registration appears three times.

The cause is a single omission. The registrations `SmartFilter` config at `public/js/admin.js:4911-4921` reads `course`, `yearLevel` and `studentType` from filter state but never reads `state.values.status`. The status value is consumed only by `renderFilteredRegistrations` (`admin.js:2537-2551`) to decide *which table to write into*, and that function hands the same unfiltered `rows` array to every table it touches. Status is a section-visibility switch that was never given a data predicate.

The status filter is the only filter in the entire admin panel with this defect — every other `SmartFilter` config (returns, feedback, users, transactions, pickup confirmations) reads its field values. Registrations is the sole outlier, and it has no test coverage at all, which is why it survived.

## What Changes

- Add the missing status predicate to the registrations `filter` callback, so status narrows rows in the shared pipeline (`getRows` → `filter` → date range → search → sort → render) rather than only at render time. This automatically makes the status filter compose correctly with Course, Year Level, Student Type, Date, Search, Sort, Reset, and CSV Export.
- Partition rows by status inside `renderFilteredRegistrations` so each of the three tables receives only its own status, replacing the current behaviour of passing one identical array to all three. This removes the triple-rendering of every registration under "All Status" and leaves a single code path with no status branching.
- Key the status comparison on `reg.userId.status` through the existing `normalizeRegistrationStatusForDisplay` helper, so the filter and the Status badge in each row can never disagree — including for the `active` value that `models/User.js:22` permits, which the badge already renders as "Pending".
- Add Jest coverage for the registrations filter config and the status partitioning, which currently has none.
- **Not** in scope: no UI, layout, markup, table, badge, button, colour, spacing, or typography change; no data, schema, seed, or record modification; no new API call; no status-label or option changes; no change to the shared `SmartFilter` component.

## Capabilities

### New Capabilities
- `request-status-filtering`: Correctness of the Request Management Status filter — which registration records a given status selection makes visible, how that selection composes with the other filters, search, sort, reset and export, how it interacts with the three Pending/Approved/Rejected sections, and the invariant that a displayed row's Status badge always agrees with the filter that selected it.

### Modified Capabilities
- None. `request-filter-persistence` and `request-filter-layout` are not present in `openspec/specs/`; both are unarchived deltas owned by other in-progress changes and both are scoped to layout and section-visibility, not record filtering. This change defines the filtering behaviour as its own capability rather than editing another change's delta.

## Impact

- **`public/js/admin.js`** — the only production file modified, in two places: the registrations `filter` callback (`~4911-4921`) gains a status predicate, and `renderFilteredRegistrations` (`2537-2551`) partitions rows per table instead of forwarding the same array. Reuses the existing `normalizeRegistrationStatusForDisplay` helper at `2464-2468`; no new helper needed.
- **No changes to** `public/js/admin-filters.js` (the shared `SmartFilter` engine already threads `state.values` into `config.filter` correctly), `public/admin.html`, `models/User.js`, `models/Registration.js`, any service or route, or the database. `GET /api/auth/admin/registrations` already returns the complete non-archived dataset client-side, so filtering stays frontend-only and no request is added.
- **`public/admin-requests.html` / `public/js/requests-management.js` are unrouted dead code** and are explicitly not touched. No server route serves `admin-requests.html`; the sidebar's "Request Management" link resolves to `/admin/registrations`, which serves `public/admin.html`. Interestingly the dead page's own `applyFilters` compares `req.status === statusFilter` correctly — evidence this logic was correct once and was lost when the page was folded into the admin shell.
- **Tests** — a new `tests/request-status-filter.test.js` (Jest 30 + jsdom) covering the status predicate, the four option values, composition with the other filters and search, reset, the `active`-status case, and the no-duplicate-rendering invariant.
- **Blast radius** — the Request Management view only. The shared filter engine and every other admin module's filter config are untouched.
