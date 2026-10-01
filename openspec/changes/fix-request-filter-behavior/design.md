## Context

The Admin > Request Management page (`public/admin.html`) renders three registration table sections: `#registrationsPending`, `#registrationsApproved`, `#registrationsRejected`. The status-aware registrations filter toolbar is created by `SmartFilter.create(...)` (`public/js/admin.js` `initAdminFilters`, config at admin.js:4351) into `#registrationsFilterContainer`, which is currently nested *inside* the `#registrationsPending` section (admin.html:419).

`SmartFilter` itself is well behaved — its `build()` (admin-filters.js:705) renders a persistent, single-mount toolbar (Status, Course, Year Level, Student Type, Date range, Sort, Search, Reset Filters, Export) and never conditionally hides it; filter state lives in a closure and survives `apply()` / `reset()`.

The bug: when a specific status is selected, `renderFilteredRegistrations` → `syncRegistrationSectionVisibility(status)` (admin.js:2035) sets `display: none` on the entire `#registrationsPending` section for non-pending statuses, and sets `display: none` on the approved/rejected sections for others. Because the filter container is a child of `#registrationsPending`, selecting "Approved" or "Rejected" hides the whole pending section — taking the filter toolbar with it. This matches the reported symptom exactly.

## Goals / Non-Goals

**Goals:**
- Keep the registrations filter toolbar permanently mounted and visible while on the Request Management view, across every status selection, empty result, reset, and data reload.
- Restrict status-selected visibility changes to the three table sections only — never the filter section.
- Preserve the existing Status options (All Status / Pending / Approved / Rejected), independent filter state, empty-state messages, Reset Filters, Export, and all existing styling and data/API behavior.
- Minimal, low-risk diff limited to `public/admin.html` markup placement and a one-line view-registration list in `public/js/admin.js`.

**Non-Goals:**
- Redesigning the page, filters, tables, sidebar, header, colors, typography, or spacing.
- Changing `SmartFilter` (`admin-filters.js`), the registrations filter config, filtering logic, API, or data source.
- Adding "Archived"/"Removed"/"Deleted" status options or otherwise touching the Archive action button.
- Changing approved/rejected section styling (covered by the in-progress `fix-approved-rejected-registrations-layout` change).

## Decisions

### D1: Move the filter container into a dedicated wrapper that is never hidden by status filtering

Place a new sibling wrapper element before `#registrationsPending` and move `#registrationsFilterContainer` inside it:

```html
<div id="registrationsFilterWrap" class="admin-section">
  <div id="registrationsFilterContainer"></div>
</div>
<section id="registrationsPending" class="admin-section section-pending">
  <h2>Pending Registrations</h2>
  <!-- table -->
</section>
<section id="registrationsApproved" ...>...</section>
<section id="registrationsRejected" ...>...</section>
```

The wrapper reuses the existing `.admin-section` card class so it (a) keeps the toolbar inside the same white rounded-card visual language it originally had inside the Pending card, and (b) re-engages the shared `.admin-section + .admin-section` margin rule so the transactions card → toolbar card → Pending card spacing stays identical — zero CSS changes.

`syncRegistrationSectionVisibility` continues to toggle only the three section ids, so it never touches `#registrationsFilterWrap`. The toolbar is now detached from the pending section's visibility and stays mounted.

**Alternatives considered:**
- *Only stop hiding `#registrationsPending` on status change.* Rejected — the pending title + table would still render above the approved/rejected tables, producing redundant/incorrect section headers and duplicate "Pending" content when another status is selected. Fails the "only the table results change" expectation.
- *Move/resize the toolbar in JS on status change.* Rejected — re-rendering or relocating DOM on every status change reintroduces exactly the conditional-layout jank the change must eliminate, and adds moving parts for no benefit.

### D2: Register the wrapper in the registrations view's visible-section list

`setAdminView` (admin.js:472) toggles every section listed in `SECTION_VIEWS` by id, and only those. Add `'registrationsFilterWrap'` as the first entry of `SECTION_VIEWS.registrations` (admin.js:235) so the wrapper (and its toolbar) is shown exactly when the Request Management view is active and hidden when navigating to other views. Because `allSectionIds` is derived from the union of `SECTION_VIEWS` values (admin.js:483), this is the single registration point needed.

**Alternatives considered:**
- *Place the wrapper outside every section and never hide it.* Rejected — the toolbar would stay visible on Dashboard/Users/etc. views, violating "hide with the view".

### D3: No changes to filter logic or SmartFilter

The registrations filter config (admin.js:4351–4410), `SmartFilter` (`admin-filters.js`), `reset()`, `apply()`, sort, search, date-range, and CSV export are all already correct and are reused unchanged. Empty-result messages already render inside each table's tbody (admin.js:2551, 2568, 2585) with the toolbar untouched, satisfying the empty-results requirement.

**Correction (recorded by `fix-request-status-filter-logic`, 2026-09-28).** An earlier version of this decision also claimed that `renderFilteredRegistrations` "splits rows into the three tables by status". That was false. It passed one identical array to all three display functions, so every record rendered three times under All Status and the status selection narrowed nothing. The status `filter` callback also never read `state.values.status`, so status reached neither the renderer nor CSV export. Both defects are real and are fixed by `fix-request-status-filter-logic`; this change remains layout-only and still excludes filtering logic, but it could not have delivered the filtering behaviour its own spec describes.

## Risks / Trade-offs

- [Super-admin role hides Request Management in the sidebar] → The wrapper is registered in `SECTION_VIEWS.registrations`; `setAdminView` still gates the whole registrations view (including the wrapper) by role as before, so super-admin behavior is unchanged.
- [CSS expectations on `.filter-toolbar` inside `.admin-section`] → The wrapper is placed at the same DOM position as the original container and carries the existing `admin-section` class, so card spacing, padding, background, and toolbar styling (class-based on `.filter-toolbar`, admin.css:2893+) are unchanged. Confirm visually per the empty-space/ordering review in `fix-approved-rejected-registrations-layout` if that change is still in flight.
- [Row ambiguity in tiny regressions] → This is a 2-file, few-line diff; verify via jest suite plus a targeted manual pass of the Request Management page for each status.
- [Id collisions] → `registrationsFilterWrap` is new and uniquified; no existing code references it, and `getElementById` lookups in `setAdminView` tolerate the new node safely.

## Migration Plan

- Deploy: apply the HTML restructure and the one-line `SECTION_VIEWS` edit together — they are interdependent and atomic; no data migration.
- Rollback: revert the two edits; the page returns to prior behavior.
- Verification: `npm test`; manual browser pass of Admin → Request Management selecting All Status / Pending / Approved / Rejected, combined with Year Level/Student Type/search/sort/date, empty-filter results, and Reset Filters.

## Open Questions

- None blocking. The exact empty-state wording is already established per table ("No pending/approved/rejected registrations match the current filters.") and left unchanged to honor the no-redesign constraint.