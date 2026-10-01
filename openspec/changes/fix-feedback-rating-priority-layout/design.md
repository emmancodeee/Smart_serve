## Context

The Student Feedback page was recently redesigned (`redesign-student-feedback-ui`, now archived and synced to `openspec/specs/student-feedback-ui-layout/spec.md`) to use a compact two-column form. Inside `#feedbackForm`, Row 2 splits into a wider "Detailed Feedback" textarea (`.feedback-grid--detail`, `1.4fr 1fr`) and a right section (`.feedback-right-col`). Today `.feedback-right-col` is a single-column grid, so "Rating (1-5)" stacks above "Priority". The target design places Rating on the LEFT and Priority on the RIGHT side by side in a balanced two-column row, matching the reference screenshot.

Current state in `public/feedback.html`:
- `.feedback-right-col` at `feedback.html:129` is `display: grid; grid-template-columns: 1fr; gap: 1.25rem; align-content: start;`
- The `.feedback-form` provides `gap: 1.25rem` between fields.
- Rating uses `.student-rating-group` (flex row of five 46x46px buttons) + `.student-rating-hint`.
- Priority uses `#priority` select with `student-form-select` styling; its label currently reads "Priority" (no asterisk) and it has no placeholder option.

## Goals / Non-Goals

**Goals:**
- Render Rating (left) and Priority (right) side by side in a balanced two-column row inside the right section of Row 2 on desktop.
- Both labels start at the same vertical position; the priority select aligns horizontally with the rating buttons.
- Keep the existing rating look (five compact equal-size buttons, navy selected state, hint below) and the existing select styling.
- Add "Priority *" label and a default "Select Priority" placeholder option as the first `<option>`.
- Stack Rating above Priority with no overlap/overflow on tablet and mobile.

**Non-Goals:**
- No changes to sidebar, header, logo, colors, typography, category/subject/detailed-feedback fields, submit/cancel buttons, My Feedback table, or any JavaScript.
- No changes to rating or priority behavior (ids/names unchanged).
- No full-width Priority across the whole form.

## Decisions

**D1: Convert `.feedback-right-col` into a two-column grid on desktop.**
Change `.feedback-right-col` to `grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;` for a balanced split (matching the `1fr 1fr` recommendation and ~32px gap), and add a media query (e.g., `max-width: 1023px` or the existing breakpoint approach) that collapses it back to `1fr` with `gap: 1.25rem` on smaller screens.
- Rationale: Minimal markup/CSS surface — the two existing child `<div>`s already correspond to Rating and Priority, so only CSS changes are needed to reach the target layout. Reuses the established `.feedback-right-col` hook.
- Alternative considered: new wrapper grids with dedicated classes (e.g., `.feedback-controls`) — rejected as redundant given the existing two-child structure.

**D2: Align labels and controls via `align-items: start` plus equal top spacing.**
Both the Rating label and the Priority label are direct children of their columns with the same `.feedback-label` margin, so `align-items: start` keeps them at the same vertical origin. The priority select (`.student-form-select`, which already stretches to full width) fills the right column, aligning it with the rating-button row.
- Rationale: Grid stretch default would force both columns to equal height; `start` keeps columns independent and prevents the select from starting lower than the buttons.

**D3: Add "Select Priority" placeholder without changing priority functionality.**
Insert `<option value="" disabled selected>Select Priority</option>` as the first option of `#priority`, and change the label text to `Priority *` (keeping `for="priority"`). 
- Rationale: The screenshot requires the placeholder; a disabled empty option preserves form behavior (nothing is submitted for it) and avoids changing how `feedback.js` reads the select.
- Trade-off: the option is non-functional by design (auto-submit default). This matches "Select Priority" as a hint, not a value.

**D4: Keep rating markup and styles untouched.**
No changes to `.student-rating-group`, `.student-rating-label`, `.student-rating-input`, or `.student-rating-hint`; only their container (`.feedback-right-col`) changes.
- Rationale: The five buttons, spacing, and selected appearance already meet the spec; they only move columns.

## Risks / Trade-offs

- [Right column too narrow on medium screens] → Two equal columns inside the already-narrow `1fr` right section could cramp the priority select; mitigate by collapsing to one column below 1024px (matching the existing `feedback-grid--detail` breakpoint).
- [Placeholder option constrains selection UX] → The disabled "Select Priority" option prevents submitting an unintended empty priority; the existing Low/Medium/High/Urgent options remain intact and selectable.
- [Regressions to the archived layout spec] → The delta spec modifies "Two-column submit form layout" and "Rating and priority controls"; keep ids/names and responsive collapse consistent so the main spec syncs cleanly.

## Migration Plan

1. Edit `public/feedback.html` CSS: `.feedback-right-col` two-column at desktop, single-column below.
2. Edit the Priority block: label to "Priority *", add the "Select Priority" disabled placeholder option.
3. Verify no markup changes to Rating and no JS changes.
4. Browser smoke-test desktop (side by side), tablet/mobile (stacked, no overflow), and confirm submit works with the placeholder present.