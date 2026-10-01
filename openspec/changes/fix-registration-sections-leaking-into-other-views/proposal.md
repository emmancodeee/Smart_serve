## Why

On the Transactions module, the Request Management sections — Pending Registrations, Approved Registrations and Rejected Registrations — appear underneath the correct "User Request History" content. Transactions must show only its own content, and Request Management must keep all three sections.

The cause is a single function that changes section visibility without knowing which module is open.

## What Changes

- Make `syncRegistrationSectionVisibility()` view-aware, so it only adjusts the three registration sections while Request Management is the active module and is a no-op otherwise.
- This removes the leak at its source. The alternative — sequencing fetches so a late response cannot arrive after navigation — treats one symptom and leaves the same function able to corrupt any other module.
- Keep `setAdminView()` unchanged. It is already correct: it hides all ten shell sections that do not belong to the resolved view.
- Keep the three sections in the document and owned by Request Management. Nothing is deleted, hidden with CSS, or unmounted; the sections are already siblings that are correctly hidden and are being re-shown by the defect.
- No change to the Transactions view, its filters, its table, or its data.

### How the leak actually happens

`admin.html` holds every shell module as a sibling `<section>`, each starting with inline `display:none`. `SECTION_VIEWS` (`admin.js:296`) maps the `registrations` view to four ids — `registrationsFilterWrap`, `registrationsPending`, `registrationsApproved`, `registrationsRejected` — and `transactions` to one, `transactions`.

`setAdminView('transactions')` hides all four registration ids. That works. The leak is a re-show *afterwards*:

1. `syncRegistrationSectionVisibility()` (`admin.js:2553`) sets `display` on the three sections purely from the status filter value, with no reference to the active view. With the default status `all` it sets all three to visible.
2. It is reached through the registrations filter's render callback: `registrationsFilter.apply()` → `renderRegistrationsWithFilter()` (`:5143`) → `renderFilteredRegistrations()` (`:2537`) → `syncRegistrationSectionVisibility()` (`:2538`).
3. That `apply()` runs inside `loadRegistrations()` (`:2220`), *after* its own `await fetch`. The render is a side effect of the data arriving, not of a module being opened.
4. `loadRegistrations()` is reachable only through `ensureDataset('registrations')`, and `ADMIN_VIEW_LOADERS` (`:2036`) lists `registrations` for the **dashboard** and for the `registrations` view. The dashboard is the default landing module and loads five datasets.
5. So when a registration response lands after the user has already navigated to Transactions, the three sections are made visible in a module that does not own them. Nothing re-runs `setAdminView` afterwards, so they stay.

`refreshData()` already tries to drop late responses (`:2142`), but that guard runs *after* `await Promise.all(...)`. It cannot undo a side effect that already happened inside the loader.

The timing dependence is why this reads as intermittent, and why it is easiest to hit from the dashboard — the slowest-loading module.

### Scope is wider than reported

The dashboard has the same defect, by the same path: it loads `registrations` for its own charts and counts, so the three sections render beneath the dashboard's analytics content too. The report only mentions Transactions.

The defect is also structurally isolated, which is good news: `syncRegistrationSectionVisibility` is the only function besides `setAdminView` and `clearAdminModuleSections` that writes `display` on a shell section id. Every other filter's render callback only writes table rows, so no other module has this bug.

## Capabilities

### New Capabilities
- `admin-module-isolation`: The rule that a module renders only the content it owns — a module's data arriving late, from a module that merely reads that data, must not make another module's sections visible. Covers view-gated section visibility, cross-module data reads that are read-only, and the requirement that a module's own content is unaffected.

### Modified Capabilities

None. `openspec/specs/` contains only `student-feedback-ui-layout` and `student-sidebar-design`, which cover the student UI and are unaffected. No existing capability's requirements change.

## Impact

- `public/js/admin.js` — the only file modified, in `syncRegistrationSectionVisibility()` and at most its immediate call site.
- Affected: Transactions (the reported case) and Dashboard (same cause, unreported). Request Management must be verified unchanged, since its three sections are what the fix stops other modules from claiming.
- `public/admin.html` is **not** modified. The markup is correct: sibling sections, inline `display:none`, and the registration sections properly owned by the `registrations` view.
- Unaffected: the Transactions view's title, filters, search, reset, export and table; the registration filters and tables; `setAdminView()`; `SECTION_VIEWS`; `ADMIN_VIEW_LOADERS`; all datasets, APIs, routes and permissions; both roles.
- No CSS, no `display:none` added as a workaround, no component removal, no refresh or timer.
- Interaction with the unverified change `fix-admin-cross-document-nav-interception`: none. That change gates cross-document sidebar clicks and alters no code path inside `admin.html`.
