## Context

The live Request Management view is `public/admin.html` + `public/js/admin.js`. The sidebar entry resolves to `/admin/registrations`, which `server.js:280-288` serves from `public/admin.html`. `public/admin-requests.html` + `public/js/requests-management.js` are **unrouted dead code** — no route serves them, and the only way to reach them is typing the literal static path. The dead page's own `applyFilters` (`requests-management.js:181`) compares `req.status === statusFilter` correctly, which is strong evidence this predicate existed once and was lost when the page was folded into the admin shell.

The registrations `SmartFilter` config (`admin.js:4895-4941`) declares a `status` field with options `pending` / `approved` / `rejected`, but its `filter` callback (`4911-4921`) reads only `course`, `yearLevel` and `studentType`. `state.values.status` appears nowhere in it. Status is instead consumed downstream by `renderRegistrationsWithFilter` (`5154-5157`) → `renderFilteredRegistrations` (`2537-2551`), which uses the value purely to pick which table to write into and then passes the *same* `rows` array to every table it touches. The `all` branch (`2547-2549`) calls all three display functions with one identical array.

`apply()` in the shared engine runs `getRows` → `config.filter` → `applyDateRange` → `applySearch` → `applySort` → `onRender` (`admin-filters.js:661-671`), and `currentRows` is what CSV export writes. Because status never enters `config.filter`, it also never reaches search, date range, or export.

Every other `SmartFilter` config in the codebase does read its field values — returns, feedback, users (`admin.js:4383-4386`), transactions (`4970-4979`). Registrations is the only outlier, and it is the only admin filter with no test coverage at all.

**Two competing status fields.** `Registration.status` is the enum `['pending','approved','rejected']` (`models/Registration.js:25-30`) and is what the state machine writes. `User.status` is `['pending','approved','rejected','active']` (`models/User.js:20-25`). The row badge reads `reg.userId.status` through `normalizeRegistrationStatusForDisplay` (`admin.js:2957-2958`, `2464-2468`), which maps anything outside the three filterable values to `pending` — so an `active` user displays as **Pending**. Search keys (`4892`) and the export column (`4938`) also use `userId.status`. `adminService.updateRegistrationStatus:497-500` writes both fields, so they agree in practice; `uniformRequestService.approveRequest:75` writes only `Registration.status`, so they can drift.

**Empirically confirmed**, not inferred: driving the real page in jsdom with four fixture registrations produced 4 rows in each of the three tables under All Status, and 4/4/4 again under Pending, Approved and Rejected alike — twelve rendered rows for four records, and the selection changes nothing.

## Goals / Non-Goals

**Goals:**

- Selecting a status restricts the displayed records to that status, and only that status, everywhere on the page.
- Eliminate the triple-rendering of every registration under All Status.
- Make the filter and the row's Status badge incapable of disagreeing.
- Have status participate in the shared pipeline so it composes with course, year level, student type, date, search, sort, reset, and CSV export.
- Add the missing automated coverage.

**Non-Goals:**

- No UI, layout, markup, section, table, badge, button, colour, spacing, or typography change. The three Pending/Approved/Rejected sections and their headings stay exactly as they are.
- No data, schema, seed, or record modification; no records deleted, duplicated, reassigned, or moved between statuses.
- No new network request and no API/route/service/model change. The full non-archived dataset is already client-side.
- No change to the shared `SmartFilter` component or to any other admin module's filter config.
- No change to the dead `admin-requests.html` / `requests-management.js`.
- No change to status labels, option values, or their lowercase representation.

## Decisions

### D1 — Fix `admin.js`; leave the dead page alone

**Rationale:** Only `admin.js` is served. Editing `requests-management.js` would fix nothing and risk reintroducing a second, divergent implementation when the dead page is eventually deleted. Confirmed no route serves `admin-requests.html`.

**Alternatives considered:** *Port the dead page's `req.status === statusFilter` line into the live page* — rejected; it would reintroduce an exact-match comparison that breaks on the case/whitespace variants the spec requires tolerating, whereas the live page already has a display normalizer to reuse.

### D2 — Put the predicate in `config.filter`, not only in the render step

Add a status comparison to the existing `filter` callback alongside course, year level and student type.

**Rationale:** `config.filter` is the only place whose result reaches both the renderer *and* `currentRows`, which is what CSV export writes. Fixing only the render step would leave Export ignoring the status selection — exactly the "filter the data, not just the section" failure the request warns about. It also gets composition with date range and search for free, since both run after `config.filter` in the pipeline.

**Alternatives considered:** *Filter inside `renderFilteredRegistrations` only* — rejected, export stays wrong. *Add a `?status=` query parameter* — rejected, the data is already fully client-side and this would add a request for nothing.

### D3 — Compare on `reg.userId.status` through the existing display normalizer

`if (status && normalizeRegistrationStatusForDisplay(reg?.userId?.status) !== status) return false;`

**Rationale:** The acceptance rule is that the displayed table must never contain a different status *and* that the badge must correspond to the filter. The badge is rendered from `reg.userId.status` via `normalizeRegistrationStatusForDisplay`, so the filter must read the same field through the same helper or the two can disagree. Reusing the helper also inherits its `active` → `pending` collapse for free, so an `active` user is filtered into the Pending table and simultaneously *displays* Pending — self-consistent. It also normalises case and whitespace, and needs no new function.

**Alternatives considered:** *Use `reg.status` (Registration)* — rejected: it is the state machine's field, but it is not what the user sees. Where the two drift, keying on `reg.status` would put a record in the Approved table while its badge reads Pending — precisely the inconsistency the request forbids. *Add a fresh normalizer* — rejected, it would be a second definition of the same concept free to drift from the badge's.

### D4 — Partition rows per table; delete the status branching in the render step

Replace the `if / else if / else` chain in `renderFilteredRegistrations` with an unconditional three-way partition, calling all three display functions every time and leaving section visibility to `syncRegistrationSectionVisibility`.

**Rationale:** Under a specific status the other two tables are hidden anyway, so writing them is harmless; under All Status each table receives only its own status. One code path, no branching, and the "no record in two tables" invariant becomes structural rather than conditional. The three renderers already emit correct per-table empty-state messages, so the empty-result requirement is satisfied for free.

**Alternatives considered:** *Keep the branching and pass the whole `rows` to the selected table* — rejected, it leaves the All Status triple-render in place. *Merge All Status into a single table* — rejected, that deletes sections and is a UI change.

### D5 — Leave section visibility alone

`syncRegistrationSectionVisibility` keeps its current behaviour, including the active-view guard added by `fix-registration-sections-leaking-into-other-views`.

**Rationale:** Section visibility and row filtering are orthogonal concerns that happen to share the `status` value. Visibility controls which table is on screen; partitioning controls what is in it. Keeping them separate means the recent view-ownership fix is not disturbed, and a record can never be in a hidden table and a visible one at the same time.

### D6 — Test the real `admin.js` in jsdom; no production refactor

Load `admin-filters.js` then `admin.js` as classic `<script>` tags under jsdom, set a token in `localStorage` to suppress the auth redirect, stub `window.fetch` with fixture registrations, then call the page's own `loadRegistrations()` and drive the real Status `<select>` with a `change` event.

**Rationale:** Verified experimentally, not assumed. `admin.js` loads cleanly in jsdom; its function declarations reach `window`; the full path `loadRegistrations` → `registrationsFilter.apply()` → `render` runs against stubbed fixtures. This tests the actual production code end to end and needs **no** refactor, no new module file, and no change to the shared component. It also means the regression test would have caught this bug.

**Two harness traps, both hit during investigation and both worth encoding as comments in the test:**
- Scripts must be injected as `<script>` elements, not `w.eval`. Under `runScripts: 'outside-only'` script tags do not execute at all; concatenating the files into one `eval` instead makes the bundle strict-mode, which stops function declarations reaching the global. Jest's `jsdom` environment already behaves like real script tags.
- A token must be present in `localStorage` before load, otherwise the page's auth guard calls `Location.replace` and jsdom reports a navigation error.

**Alternatives considered:** *Extract the predicate and partition into a new shared module* — rejected: it adds a file, a script tag, and an indirection to fix something the existing structure can already express and test. *Replicate the config in the test and assert against the copy* — rejected, and this is what the existing `tests/admin-filters.test.js` does for the inventory config; such a test passes even when production is broken, which is precisely how the current defect survived.

## Risks / Trade-offs

- **The test harness is load-bearing and easy to get subtly wrong** → A test written with `eval`, or without a `localStorage` token, will fail confusingly or, worse, appear to pass while asserting nothing. Mitigation: the two traps are written into comments at the point of use, and the first assertion should be a smoke check that the Status select was found and has four options.
- **`active` users land in the Pending bucket** → Forced by the existing badge behaviour, not chosen here: `normalizeRegistrationStatusForDisplay` already renders `active` as Pending, so filtering any other way would break the badge/filter agreement. Mitigation: a dedicated test case pins the behaviour so it is a recorded decision, and the spec states it explicitly. Flagged as an open question.
- **Status and badge are sourced from `User.status`, which a legacy endpoint can leave stale** → `uniformRequestService.approveRequest` writes only `Registration.status`. Mitigation: keying on the badge's own field means filter and badge still agree with each other, which is what the user sees; the underlying drift is a separate data-consistency defect and is out of scope. Flagged as an open question.
- **The registrations toolbar has 10 children, not 8** → The same duplicate-`dateField` render that affects Inventory applies here: `dateField` is found from `fields` but is not removed from `mainFields`, so the date field renders twice. This is a layout/DOM concern, not a filtering one. Mitigation: untouched by this change, recorded as an open question so it is not rediscovered.
- **`fix-request-filter-behavior/design.md` contains a false claim that invites skipping this bug** → Its Decision D3 asserts that `renderFilteredRegistrations` "splits rows into the three tables by status", which is false — it passes one array to all three. That change's tasks explicitly certify "no changes to the filtering/state logic", so it cannot land this fix. Mitigation: a task to correct the claim, so the next reader is not misled.
- **A newly added test file in a suite with pre-existing failures** → `tests/admin-filters.test.js` has five unrelated failures (date-boundary assertions and `Blob.text` missing in this jsdom version), verified identical at baseline. Mitigation: the new coverage lives in its own file so its result is unambiguous, and the new file's own baseline is recorded before any fix is applied.
- **Partitioning runs three filters over the row set on every render** → Negligible at the page's scale (the dataset is a single unarchived collection with no pagination), and cheaper than the alternative of maintaining cached buckets, which would reintroduce the staleness the request warns about.

## Migration Plan

A single production file, one function plus one predicate. No schema, no API, no data, no build step. Rollback is reverting the `public/js/admin.js` hunk, which restores the current behaviour with no side effects to unwind.

Deploy order note: the code and its test can ship together; there is no ordering constraint against the other in-flight changes because this one edits the filter callback and the render function, which the layout-only request changes do not touch.

## Open Questions

- Should `active` be a distinct bucket rather than being folded into Pending? Answering it means changing the badge normalizer and possibly the `User.status` enum's role in this view — a product decision beyond "make the filter accurate".
- Should the legacy `/api/auth/admin/requests` family (`uniformRequestService`), which writes only `Registration.status`, be reconciled with `adminService.updateRegistrationStatus` so the two fields cannot drift? A data-consistency fix, separate from filtering.
- Should the dead `public/admin-requests.html` and `public/js/requests-management.js` be deleted? They are unrouted, carry their own copy of the filter logic, and will otherwise keep inviting edits to the wrong file.
- Should the duplicate `dateField` render (10 toolbar children instead of 8) be fixed in the shared `SmartFilter`? It affects both the Inventory and Registrations toolbars and is the same class of bug as the one just fixed, but in the shared component.
