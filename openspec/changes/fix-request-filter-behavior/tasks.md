## 1. Relocate the registrations filter container

- [x] 1.1 In `public/admin.html`, remove `<div id="registrationsFilterContainer"></div>` from inside the `#registrationsPending` section (currently at line 419, between the section heading and `.admin-table-wrap`)
- [x] 1.2 Insert directly above `<section id="registrationsPending" ...>` a new wrapper: `<div id="registrationsFilterWrap" class="admin-section"><div id="registrationsFilterContainer"></div></div>` — the only filter container instance on the page
- [x] 1.3 Confirm the three registration sections (`#registrationsPending`, `#registrationsApproved`, `#registrationsRejected`) and their headers/tables are otherwise untouched

## 2. Register the wrapper with the registrations view

- [x] 2.1 In `public/js/admin.js`, add `'registrationsFilterWrap'` as the first entry of `SECTION_VIEWS.registrations` (currently `['registrationsPending', 'registrationsApproved', 'registrationsRejected']`) so `setAdminView` shows/hides the filter wrapper only with the Request Management view
- [x] 2.2 Leave `syncRegistrationSectionVisibility` (admin.js:2035) toggling only the three registrations table sections — verify it does not reference or affect `registrationsFilterWrap` or `registrationsFilterContainer`

## 3. Verify filter persistence

- [ ] 3.1 Manual browser pass (Admin → Request Management): the filter toolbar shows Status, Course, Year Level, Student Type, Date range, Sort, Search registrations, Reset Filters, Export before any selection
- [ ] 3.2 Select each status in turn (Pending, Approved, Rejected, All Status): the filter section stays visible, the selection stays in the Status control, and only the visible table sections change
- [ ] 3.3 Confirm the Status dropdown offers only All Status / Pending / Approved / Rejected — no Archiving/Removed/Deleted option
- [ ] 3.4 Combine Status with Year Level, Student Type, search, sort, and a date range: changing Status does not reset the other filters and vice versa

## 4. Verify reset, empty results, and view switching

- [ ] 4.1 Apply a mix of filters that yields zero registrations: the table shows an empty-state message while all filters remain visible and Reset Filters still works
- [ ] 4.2 Click Reset Filters with several filters active: all controls return to defaults, the full dataset is restored, and the filter section remains visible
- [ ] 4.3 Navigate to other admin views and back: the filter wrapper hides with the Request Management view and reappears when returning

## 5. Regression checks

- [ ] 5.1 Run `npm test` and confirm `tests/admin-filters.test.js` (and the full jest suite) passes — NOTE: 5 pre-existing failures in `tests/admin-filters.test.js` reproduced identically at baseline (`git stash` of this change's files); unrelated to this change, fails the same way without it
- [x] 5.2 Confirm no changes were made to `public/js/admin-filters.js`, the registrations filter config, the filtering/state logic, the API, or the data source