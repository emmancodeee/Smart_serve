## Context

`public/feedback.html` is the single Student Feedback page (route `/feedback`, sidebar "Feedback" active). It contains a Submit Feedback form card (`.student-panel.feedback-card`) and a My Feedback history card below, plus a feedback-details modal. The current page already has navy blue card headers (`feedback-card-header`), consistent `student-form-*` controls, and a working submit/edit/delete/cancel flow. However:

- The form body padding (`.feedback-card-body`: `1.5rem 1.75rem`) is close to but below spec and inconsistent with the target.
- Form fields use `space-y-4` (16px gap), below the ~20–24px target.
- Label-to-input gap is `0.45rem` (~7.2px), slightly below the ~8px target.
- Rating buttons are `min-width: 2.5rem; height: 2.5rem` (40px), below the 44–48px target, and gap is only `0.4rem` (~6px).
- Submit and Cancel are stacked full-width (`space-y-3` + `w-full`), stretching across the entire page — the main visual complaint.
- Table column alignment is universally `text-align: left`, not matching the required centering for STATUS/RATING/DATE/ACTIONS.
- The Actions column renders buttons via a JS template with `flex flex-wrap gap-2`, not centered.
- Cancel does nothing in edit mode — it should call `resetForm()` to exit editing.

The compiled `public/css/tailwind.css` is missing many responsive/flex utilities (notably `flex-col`, `sm:flex-row`, `p-6`, `mt-3`, `items-end`, `gap-5`). Any responsive or spacing behavior that relies on missing utilities must use explicit scoped CSS in the inline `<style>` block — same pattern used successfully in `fix-student-returns-layout`.

## Goals / Non-Goals

**Goals:**
- Add consistent inner padding (~28–32px) to the form card body.
- Increase field-to-field spacing to ~20–24px and label-to-input gap to ~8px.
- Enlarge rating buttons to ~46px with ~8px spacing, single row, no stretching.
- Replace the stacked full-width button row with a left-aligned horizontal `[ Submit/Update ] [ Cancel ]` row using a scoped `.feedback-actions` rule.
- Add a ~28px gap between the Submit Feedback card and the My Feedback card.
- Center-align STATUS, RATING, DATE, and ACTIONS table columns; center action buttons in the Actions cell.
- Call `resetForm()` from the Cancel handler so Cancel exits edit mode.
- Keep all existing functionality, styling tokens, sidebar/header/shell, and the navy/blue/yellow theme untouched.

**Non-Goals:**
- No changes to form submission, editing, deletion, rating, category/priority selection, backend APIs, validation, authentication, routing, or database schema.
- No changes to the admin/superadmin feedback management pages.
- No changes to `public/css/tailwind.css`, `theme.css`, or any other shared stylesheet.
- No new dependencies or build steps.
- No re-skinning or color-scheme changes; only adjust spacing, sizing, alignment, and responsive stacking using the existing tokens.

## Decisions

### 1. Scope all CSS changes in the feedback.html inline `<style>` block
- **Decision**: Add scoped rules (`.feedback-form`, `.feedback-actions`, `.feedback-section-gap`, `.student-rating-group` overrides, `.student-table` nth-child column alignment) in the existing `<style>` block of `feedback.html`. Do not edit `tailwind.css` or `theme.css`.
- **Why**: Matches the pattern proven in `fix-student-returns-layout`; keeps the change self-contained in the two affected files (`feedback.html` + `feedback.js`); avoids rebuilds.
- **Alternative considered**: Extend Tailwind config → rejected; adds build dependency and touches shared files.

### 2. Replace `space-y-4` on the form with a flex-gap wrapper
- **Decision**: Add a `.feedback-form` rule (`display: flex; flex-direction: column; gap: 1.25rem;`) and apply it to `<form id="feedbackForm">`, replacing the `space-y-4` class. Label-to-input spacing moves from `.student-form-label` margin-bottom to an explicit `.feedback-label { margin-bottom: 0.5rem; }` rule scoped to this page.
- **Why**: `space-y-4` = 16px; the spec requires ~20–24px. Using flex-gap is cleaner than fiddling with `margin-top` on each child; it matches the proven `space-y-3`/`space-y-4` approach already used across student pages.
- **Alternative considered**: Keep `space-y-4` and add extra margins → rejected; inconsistent per-element. Change to `space-y-5` (1.25rem) → missing utility (not present in tailwind.css).

### 3. Button row via `.feedback-actions` flex rule
- **Decision**: Replace the current `<div class="space-y-3">` wrapper with `<div class="feedback-actions">`. Add a scoped CSS rule: base = `display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;`; at `@media (min-width: 640px)`: `flex-wrap: nowrap;`. Remove `w-full` from both buttons; keep existing `student-btn` classes. Keep Submit/Update first and Cancel second (per user spec: Submit on LEFT, Cancel on RIGHT).
- **Why**: Two `w-full` buttons stacked (`space-y-3`) is the root cause of the "stretched across the entire page" problem. A flex row with `gap: 1rem` (16px) and no `w-full` gives a normal left-aligned action row matching other student modules (Dashboard, Returns).
- **Alternative considered**: Use Tailwind `sm:w-auto` on buttons inside a flex container → works but the wrapper's responsive stacking also needs `flex-col`/`sm:flex-row`, which are missing; explicit CSS is more reliable.

### 4. Rating buttons: explicit `.student-rating-group` override in inline style
- **Decision**: Override the existing `.student-rating-group` and `.student-rating-label` rules within the inline `<style>` block (more specific selectors or simply adjust the existing rules). Set rating buttons to `min-width: 46px; height: 46px; gap: 8px; flex-wrap: nowrap;` to prevent wrapping on desktop.
- **Why**: The existing rules already define `.student-rating-group` and `.student-rating-label`; overriding them in the same `<style>` block is the simplest path with no class-name changes needed.
- **Alternative considered**: Add a new `.feedback-rating` wrapper class → works but adds a class name change in the HTML with no real benefit.

### 5. Table column alignment via nth-child CSS
- **Decision**: Add nth-child rules inside the inline `<style>` block targeting `th:nth-child(3)` through `th:nth-child(6)` and matching `td` children to `text-align: center;`. Keep SUBJECT (1) and CATEGORY (2) left-aligned. Center action buttons in the Actions cell via a `justify-center` flex utility on the button wrapper.
- **Why**: The table columns are static (6 columns, fixed order), so nth-child is reliable and avoids adding individual class names to every `<th>` and `<td>`.
- **Alternative considered**: Add classes to each `<th>` and render them in JS → rejected; unnecessary churn in a working table renderer.

### 6. Cancel handler: call `resetForm()`
- **Decision**: Change the existing Cancel button listener from an empty body to `resetForm()`. The `resetForm()` function (feedback.js:454) already handles clearing the form, resetting `dataset.mode` to `'create'`, deleting `dataset.feedbackId`, and restoring the "Submit Feedback" label.
- **Why**: `resetForm()` already does exactly what Cancel in edit mode requires; no new function needed. The `fix-cancel-navigation` change already ensured Cancel doesn't navigate away; this simply adds the edit-mode exit.
- **Alternative considered**: Duplicate logic in the cancel handler → rejected; DRY.

### 7. Section gap: scoped `.feedback-section-gap` rule
- **Decision**: Replace the `mt-5` class on the My Feedback card with a scoped `.feedback-section-gap` class using `margin-top: 1.75rem` (28px, within the 24–32px target).
- **Why**: `mt-5` = 20px (below target); `mt-6`/`mt-7` may or may not exist in tailwind; explicit CSS is guaranteed.
- **Alternative considered**: `mt-8` (32px) → possible but upper bound; 28px is a clean middle ground.

## Risks / Trade-offs

- **Missing Tailwind utilities** → Any responsive behavior (flex-col→row, stacking, mobile) that relies on missing utilities must be covered by explicit CSS in the inline `<style>` block; verify each class against `tailwind.css` at implementation time.
- **`student-rating-label` override** → The override in the inline `<style>` block must come after the existing rule declaration to take effect; confirm specificity is sufficient.
- **JS template alignment** → The `renderFeedbackTable` Actions cell markup (`flex flex-wrap gap-2`) must be updated to `flex justify-center gap-2`; if missed, action buttons stay left-aligned.
- **`resetForm()` side effects** → Verify `resetForm()` does not trigger any unwanted scroll or modal behavior; current implementation is purely DOM manipulation and is safe.
- **Inline style bloat** → Keep the added CSS minimal and scoped (`.feedback-*` or specific selectors); avoid duplicating rules already in the inline block.

## Migration Plan

- Apply all edits to `public/feedback.html` (inline `<style>` block + HTML class adjustments) and `public/js/feedback.js` (cancel handler + table Actions cell markup only).
- No server, route, database, or build changes; no CSS file edits.
- Rollback: revert the one HTML file and the one JS file. Changes are purely presentational with one trivial JS behavior addition (cancel calls resetForm); rollback is trivial.

## Open Questions

- None affecting implementation. All requirements are clear from the proposal and spec.
