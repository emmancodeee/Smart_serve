## Why

On the Admin > Request Management ("Pending Registrations") page, the filter section disappears when a status is selected from the "All Status" filter. The filter container (`#registrationsFilterContainer`) lives inside the `#registrationsPending` section, and the status filter hides that entire section when Approved or Rejected is chosen, so the filter toolbar vanishes along with the pending table. Selecting a status should only change which records are shown — the filters must stay visible and usable.

## What Changes

- Keep the registrations filter section permanently visible on the Request Management page, regardless of the selected status, filter results, loading state, or empty results.
- Move the registrations filter toolbar out of the `#registrationsPending` section into its own wrapper that stays mounted and visible while viewing Request Management.
- Ensure selecting Status (All Status / Pending / Approved / Rejected) only toggles the three registrations table sections (Pending / Approved / Rejected) — never the filter toolbar.
- Preserve the exact existing Status options: All Status, Pending, Approved, Rejected. Never expose "Archived" (or Removed/Deleted) in the Status filter; Archive remains an action button only.
- Preserve each filter's independent state — changing Status must not reset Year Level, Student Type, Date, Time, Sort, or Search, and vice versa.
- Keep the existing empty-state behavior in the table area (filters stay visible) and keep Reset Filters working as before.
- No data, API, state-management, or Smart Serve filtering logic changes. No fake records, no new filter system, no redesign.

## Capabilities

### New Capabilities

- `request-filter-persistence`: Persistent, always-visible filter toolbar for the Admin Request Management page — Status (All/Pending/Approved/Rejected only) selects never hide, collapse, remove, or reset the filter controls; the filters stay mounted and usable across every status selection, empty results, reset, and data reload.

### Modified Capabilities

- `registration-actions-layout`: No requirement change. The Archive action button remains an action button in the Pending Registrations actions column and SHALL NOT appear as a status filter option.

## Impact

- `public/admin.html` — relocate `#registrationsFilterContainer` from inside `#registrationsPending` into a dedicated wrapper that is never hidden by status filtering.
- `public/js/admin.js` — include the new filter wrapper id in the registrations view's visible-section list (`SECTION_VIEWS`) so it shows/hides only with the Request Management view; keep `syncRegistrationSectionVisibility` toggling only the three table sections; registrations filter config unchanged.
- `public/js/admin-filters.js` — unchanged (already renders a persistent toolbar).
- Tests — `npm test` (jest) continues to pass; verify no regressions in `tests/admin-filters.test.js`.