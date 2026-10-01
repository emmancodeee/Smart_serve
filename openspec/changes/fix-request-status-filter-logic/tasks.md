## 1. Capture the failing baseline before touching production code

- [x] 1.1 Create `tests/request-status-filter.test.js` with the jsdom harness from design D6: `@jest-environment jsdom` docblock, load `admin-filters.js` then `admin.js` as classic `<script>` elements, set a `token` in `localStorage` before load, stub `window.fetch`
- [x] 1.2 Comment both harness traps in the file: script tags must not be replaced with `eval` (a concatenated eval goes strict-mode and stops declarations reaching the global), and the `localStorage` token is what suppresses the auth guard's `Location.replace`
- [x] 1.3 Add a smoke assertion that `initAdminFilters()` produces a `#registrationsFilterContainer` with `data-module="registrations"` and a `select[aria-label="Status"]` carrying exactly the four options `''`/pending/approved/rejected
- [x] 1.4 Add fixtures covering all three statuses plus one `active` user, and differing course, year level and student type values
- [x] 1.5 Add a failing test asserting the four expected outcomes, and run `npx jest tests/request-status-filter.test.js` to record that it fails against current `admin.js` before the fix — recorded: 7 records produced 21 rows, each id repeated once per table

## 2. Filter records by status in the pipeline

- [x] 2.1 In `public/js/admin.js`, inside the registrations `SmartFilter` config's `filter` callback (~4911-4921), read `state.values.status` and normalize it with `String(...).trim().toLowerCase()` alongside the existing course, year level and student type reads
- [x] 2.2 Add the status rejection using `normalizeRegistrationStatusForDisplay(reg?.userId?.status) !== status` so the comparison uses the same field and helper the row badge uses (design D3), keeping the surrounding guard style consistent with the other three predicates
- [x] 2.3 Confirm no other filter config, no other branch of `initAdminFilters`, and nothing in `public/js/admin-filters.js` was modified — `state.values.status` now appears in four filter callbacks (4866 users, 4920 registrations, 4982 transactions, 5030 pickup) and only the registrations one gained the predicate; `admin-filters.js` untouched
- [x] 2.4 Run the new test file and confirm the status assertions pass and the "Export reflects the status selection" case passes without a production change to export — export reads `currentRows` (`admin-filters.js:777`), the same array `getCurrentRows()` exposes, asserted in task 4.6

## 3. Partition rows per status table

- [x] 3.1 In `renderFilteredRegistrations` (`public/js/admin.js:2537-2551`), keep the `syncRegistrationSectionVisibility(status)` call as the first statement (design D5)
- [x] 3.2 Replace the `if / else if / else` chain with an unconditional three-way partition of `rows` by `normalizeRegistrationStatusForDisplay(reg?.userId?.status)`, calling `displayRegistrations`, `displayApprovedRegistrations` and `displayRejectedRegistrations` once each with their own subset (design D4)
- [x] 3.3 Confirm `displayRegistrations`, `displayApprovedRegistrations`, `displayRejectedRegistrations`, `appendRegistrationRow`, `normalizeRegistrationStatusForDisplay` and `registrationStatusBadgeClass` were not modified — the normalizer still has exactly one call site inside the badge path at 2966; the new call sites are 2551 and 4925
- [x] 3.4 Confirm `renderRegistrationsWithFilter` (~5154-5157) still passes the status through and needed no change

## 4. Extend the test coverage

- [x] 4.1 Assert the exact rendered record set for each of All Status, Pending, Approved and Rejected
- [x] 4.2 Assert that under All Status the combined row count across the three tables equals the number of active records, so no record is rendered twice (design D4)
- [x] 4.3 Assert repeated switching Pending → Approved → Rejected → All Status → Pending leaves no stale record
- [x] 4.4 Assert the `active`-status record is rendered in the Pending table and its badge reads Pending (design D3 risk)
- [x] 4.5 Assert case variants (`'Approved'`, `'APPROVED'`) match the Approved filter; the whitespace-padded fixture is asserted to fall to Pending because `normalizeRegistrationStatusForDisplay` lowercases but does not trim, and the filter must agree with the badge rather than second-guess it — see the spec correction in section 6
- [x] 4.6 Assert composition: status + course, status + year level, status + student type, status + custom date range, and status + search term all intersect, plus a sort test proving membership is unchanged and an Export test reading the captured CSV
- [x] 4.7 Assert Reset Filters returns the Status select to `''` and restores each record exactly once
- [x] 4.8 Assert an empty result shows the table's existing empty-state message and does not pull in another status's records, plus the inverse case of a populated table beside an empty one
- [x] 4.9 Assert no fetch call is issued when the status changes, and that changing status issues no additional request
- [x] 4.10 Run `npx jest tests/request-status-filter.test.js` and confirm the whole file passes — 21/21

## 5. Verify no presentation or data side effects

Note on method: `public/js/admin.js` and several other files already carried uncommitted work from the other in-flight changes, so a raw `git diff` cannot isolate this change's hunks. Scope was verified by file modification time instead — only `public/js/admin.js` and `tests/request-status-filter.test.js` were written during this change, and their mtimes postdate the start of the work.

- [x] 5.1 Confirm `public/css/admin.css`, `public/admin.html`, `public/js/admin-filters.js` and `models/` received no edit from this change — mtimes are 9/28 09:35 (admin.css, from the earlier inventory change), 9/27 20:25 (admin.html), 9/25 23:36 (admin-filters.js) and 9/25 23:36 / 9/4 (models), all predating the first edit of this change
- [x] 5.2 Confirm the change to `public/js/admin.js` is limited to the `filter` callback and `renderFilteredRegistrations` — the predicate at 4925 and the partition at 2545; the normalizer definition at 2464 and its sole badge call site at 2966 are untouched
- [x] 5.3 Confirm no file outside `public/js/admin.js` and the new test file was written by this change
- [ ] 5.4 Open Request Management and confirm the toolbar, the four Status options, the three section headings, the table columns, the badges and the action buttons are visually unchanged — **automated part done** (toolbar child count, the four options and their labels, all three sections, 7 cells per row, empty-state copy are asserted in `tests/request-status-filter.test.js`); **pixel check still needs a browser**
- [ ] 5.5 Exercise the four status options against the real dataset and confirm every visible row's badge matches the selected status, and that All Status shows each record once — **needs a running server with real data; not done in this environment**
- [x] 5.6 Exercise Reset Filters and confirm All Status is restored with no stale narrowing — covered by the automated reset test
- [x] 5.7 Load one other admin view and confirm its filter behaviour is unchanged — the users, transactions and pickup `filter` callbacks (4866, 4982, 5030) and `admin-filters.js` are unmodified; a visual pass over another view is still worth a look
- [x] 5.8 Run `npx jest` and record the suite result — 44 tests, 39 passed, 5 failed; all 5 failures are in `tests/admin-filters.test.js` and are the pre-existing date-boundary and `blob.text is not a function` failures, byte-identical to the baseline recorded before this change started

## 6. Record findings for follow-up changes

- [x] 6.1 Correct Decision D3 in `openspec/changes/fix-request-filter-behavior/design.md`, which asserts that `renderFilteredRegistrations` "splits rows into the three tables by status" — it passed one identical array to all three, and that change's tasks explicitly exclude filtering logic, so it cannot land this fix
- [x] 6.2 Note in the change that `public/admin-requests.html` and `public/js/requests-management.js` are unrouted dead code carrying a second, divergent copy of the filter logic, so future work must not target them
- [x] 6.3 Note that the registrations toolbar emits 10 children, not 8, because `dateField` is located from `fields` without being removed from `mainFields` in `public/js/admin-filters.js`, so the date field renders twice — pinned by an assertion in the new test file so a future change cannot alter it silently
- [x] 6.4 Run `openspec validate fix-request-status-filter-logic` and confirm it passes
- [x] 6.5 Correct the spec's normalization requirement: it claimed the shared normalizer "SHALL lowercase and trim", but `normalizeRegistrationStatusForDisplay` only lowercases, and the same spec forbids touching that helper twice. The requirement now states lowercase-only, and the mixed-capitalization scenario no longer claims whitespace tolerance. Behaviour is unchanged and remains self-consistent — the filter and the badge use the same helper, so `' approved '` is bucketed and badged as Pending together.
