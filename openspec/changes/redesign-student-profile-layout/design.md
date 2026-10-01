## Context

The Student User Profile page (`public/profile.html`) currently renders the main content as a single flowing column inside a `max-width: 1280px` centered content area. After the preceding `reorganize-student-dashboard` change it already contains: a `module-title-bar` titled "User Profile", a "Your Student Details" card (7 info pills), a "Registration Details" card (6 info pills) with internal `h2.student-panel-heading` titles, a standalone `module-title-bar` titled "Edit Your Profile", and a single-column edit form whose inputs carry only placeholders and a full-width "Update Profile" submit button.

The two info-card grids currently use `grid-cols-1 md:grid-cols-2` with a `md:col-span-2` Registration Status pill in Student Details, the pills use `align-items: flex-start`, and there is no explicit vertical rhythm between the cards or a button group. The layout wastes horizontal space on desktop and is not a balanced landscape design.

Page layout shell (shared with other student pages): fixed 270px left sidebar at `≥1024px` (`student-shell` flex, `student-main` margin-left 270px), a sticky top header (`student-topbar`, `position: sticky; top: 0; z-index: 20`), and `.student-main-inner` limited to `max-width: 1280px` with `px-4 md:px-7 pt-5 pb-8`. Password visibility eye icons are injected by `public/js/show-password.js` (wraps any input from `TARGET_IDS` — `oldPassword`, `newPassword`, `confirmNewPassword` — in a `.pw-field` wrapper and repositions the eye inside the field, adding `padding-right: 2.75rem` to the input).

This is a layout-only change; no backend, sidebar, header, color, or font changes.

## Goals / Non-Goals

**Goals:**
- Reorganize the User Profile main content into a clean landscape, wide-desktop layout: title bar → "Your Student Details" card → "Registration Details" card → "Edit Your Profile" card.
- Two-column equal-width, equal-height grids in both info cards with a dark-blue internal section header per card.
- Landscape two-column edit form with labels above inputs, equal aligned input heights, and password eye icons preserved inside the inputs.
- Left-aligned "Save Changes" (primary) + "Cancel" (secondary outline) buttons below the form with proper spacing and top margin.
- Fix alignment/spacing: no content under the sticky header, no overlapping section headers, no touching/poorly aligned boxes, no excess blank space, vertically centered box text, no horizontal scroll on desktop.
- Responsive: two columns on desktop/tablet, one column on small screens.

**Non-Goals:**
- No changes to the fixed sidebar, sticky header, Smart Serve color palette, fonts, icons, or navigation.
- No backend/API/database/model changes; no new data fields; Contact Number stays "Not on file".
- No new page; no changes to `show-password.js`; no change to the profile update submission logic or endpoints.

## Decisions

### Decision 1: Structure main content as four stacked elements with consistent rhythm
Keep `.student-main-inner px-4 pb-8 pt-5 md:px-7` (gives 16px / 28px horizontal padding, within the 24–32px target on desktop). Stack: `module-title-bar` "User Profile" → three `section.student-panel` cards, separated by 20–24px (apply `mb-6` between the title bar and first card, and between cards; the existing card style gives rounded corners, white background, and the soft shadow). Move the "Edit Your Profile" heading inside its card as `h2.student-panel-heading` so all three cards share the identical internal dark-blue section-header style (the standalone `module-title-bar` under it is removed).

- **Alternative considered:** keeping three separate `module-title-bar` section dividers. Rejected — inconsistent with a "cards" visual hierarchy and wastes vertical space.
- **Rationale:** one heading pattern per card keeps headers perfectly aligned with card edges and matches the requested hierarchy (USER PROFILE bar, then three headed cards).

### Decision 2: Two-column equal-height info grids in both cards
Use `grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2` (20px column gap, 16px row gap, 16px is within 12–16px vertical target) for both "Your Student Details" and "Registration Details". Each info item keeps its individual `.student-info-pill` box (bordered, rounded 18px, `#f8fbff` background, 0.95rem/1rem padding ≈ 15–16px internal padding). Grid rows stretch so every box in a row is equal height; set `.student-info-pill` to `align-items: center` so label + value are vertically centered. `.student-info-pill` is only used in `profile.html`, so adjusting it is page-local and safe.

Field order (auto-flow fills left then right; the odd count leaves the last right cell intentionally empty, matching the requested layout):
- Student Details left: Student Name, Email, Year Level, Registration Status. Right: Student ID, Program/Course, Contact Number. Remove the old `md:col-span-2` on Registration Status so it occupies the left cell of the last row.
- Registration Details left: Status, Module, Books. Right: Course, Uniform Type, Pickup Day.

- **Alternative considered:** a definition-list/flex row with fixed `min-height`. Rejected — CSS grid stretch is simpler and guarantees equal row heights.
- **Rationale:** CSS grid gives equal column widths and equal row heights automatically; the existing Tailwind `md:grid-cols-2` breakpoint (768px) already provides the desktop/tablet two-column and small-screen one-column behavior.

### Decision 3: Landscape two-column edit form
Convert `#editProfileForm` from `grid gap-4` (single fixed column) to `grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2`. Each cell is a field wrapper: a `<label>` above its `<input>` (Full Name → `editName`, Email Address → `editEmail`, Old Password → `oldPassword`, New Password → `newPassword`, Confirm New Password → `confirmNewPassword`), with `for` attributes. Inputs keep their existing rounded-xl/border styling and `w-full` so, padded by the same internal gap, all cells and inputs are equal width and height and align across rows. Row 3's right cell is intentionally empty (no existing field belongs there). Password inputs keep their IDs unchanged so `show-password.js` still wraps them in `.pw-field` and renders the eye icon inside the field; do not alter the functional classes.

- **Alternative considered:** replacing `grid` with `flex` rows. Rejected — grid provides automatic column alignment and equal widths with less markup.
- **Rationale:** labels-above-inputs, equal aligned fields, and the empty right cell all fall out of a plain 2-col grid without custom CSS.

### Decision 4: Left-aligned "Save Changes" + "Cancel" button group
Below the form, add `<div class="mt-6 flex flex-wrap items-center gap-3">` containing the primary submit (rename its text from "Update Profile" to "Save Changes", keep `type="submit"` and its existing dark-blue rounded-xl styling) and a new secondary outline "Cancel" button (`type="button"`). Buttons are inline-flex so they never stretch across the page. Wire Cancel in `profile.js` to reset `editName`/`editEmail` to the currently loaded user's saved `name`/`email` and clear the three password fields (a local reset — no navigation, no request). Save Changes keeps the existing submit handler (`#editProfileForm` submit listener) unchanged.

- **Alternative considered:** Cancel navigates back to a previous page. Rejected — the profile page is a standalone destination and the safe, expected behavior is to discard unsaved edits.
- **Rationale:** minimal surface area (only Profile page markup + small handler), preserves existing submit logic.

### Decision 5: Fix header/spacing alignment
The top header is `position: sticky`, not fixed, so it occupies layout flow and content cannot slide under it; `pt-5` keeps the title bar clear of it. No overlap fix is needed beyond keeping `.student-main-inner`'s existing padding. Section headers live inside cards (`h2.student-panel-heading`) so they cannot overlap other sections; horizontal scroll is prevented by `min-w-0` on `.student-main`, `overflow-wrap: anywhere` on pills, and the single/`md` grid columns.

- **Rationale:** the required fixes (no overlap, no touching boxes, even spacing, no horizontal scroll) are achieved by the structure in Decisions 1–3 rather than ad-hoc overrides.

## Risks / Trade-offs

- [Adjusting `.student-info-pill` alignment could affect other pages] → Verified by grep: `.student-info-pill` appears only in `public/profile.html`; the calendar/admin pages do not use it. Low risk.
- [Removing `md:col-span-2` from Registration Status leaves an intentionally empty right cell] → Matches the requested layout (Registration Status in the left column, empty right cell). Accepted.
- [Converting the edit form to two columns could break `show-password.js` eye-icon placement] → Input IDs unchanged and the wrapper approach is layout-agnostic; the eye stays positioned `absolute; right: 0.5rem` inside the input. Verified by file read; manual smoke test in task 6.4 confirms.
- [Old single-column form look changes] → Intentional; landscape form is the point of this change. Existing submit handler and field IDs are untouched.
- [Cancel discards unsaved edits] → Accepted behavior per Decision 4; it does not submit or navigate and is explicitly described in the spec.

## Migration Plan

No data migration. Deploy by updating `public/profile.html` (markup) and `public/js/profile.js` (Cancel handler + optional label references). Rollback is a revert of those files; no server restart or state change. The `reorganize-student-dashboard` change that previously touched this page can be archived independently and will merge cleanly since this change only reorganizes the same page's layout.

## Open Questions

None.