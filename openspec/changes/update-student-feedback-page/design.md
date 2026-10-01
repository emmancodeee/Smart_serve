## Context

The student Feedback page (`public/feedback.html`) is served from the existing student portal shell: a deep blue gradient sidebar, sticky navy topbar (`#152c69`), light blue gradient body, gold accents, and rounded white `student-panel` cards. The page currently uses one `student-panel` for the form (`#feedbackForm`) with the page title in a `module-title-bar` above it, and a second `student-panel` containing the My Feedback history table.

The existing markup already includes all required form controls with stable ids/names: `#category` (select), `#subject` (input), `#content` (textarea), five radio inputs `name="rating"` (`#rating1..#rating5`), `#priority` (select), and a primary submit button. All behaviors live in `public/js/feedback.js`: `handleFormSubmit` (POST create), `updateFeedback`/`editFeedback` (PUT), `deleteFeedback` (DELETE), `viewFeedback`/`showFeedbackModal` (view modal), `loadFeedbackHistory`/`renderFeedbackTable` (GET), and the "No feedback submitted yet" centered empty state. The modal markup (`#feedbackModal`) and header helpers (`student-header.js`) are shared infrastructure.

This change is purely a UI restyle: reorganize the two sections into matching rounded cards with blue headers, apply rounded (8–12px) styling to the existing controls, and make the layout aligned, balanced, and responsive. No backend, route, validation, API call, form field name, or functionality changes.

## Goals / Non-Goals

**Goals:**
- Presentation-only restyle of the student Feedback page within the existing navigation shell.
- A "Submit Feedback" card: blue header with bold white left-aligned title, followed by the existing form.
- A "My Feedback" card: matching blue header, placed directly below, containing the existing history table.
- Both cards same width, same left/right margins, balanced spacing, and consistent alignment.
- Rounded form controls (≈8–12px radius), thin light blue/gray borders, white backgrounds, comfortable padding; consistent field widths; no overflow beyond the card.
- Dark navy labels directly above each field, medium/bold weight, red required asterisks, consistent spacing.
- Existing rating group kept as horizontal small rounded rectangles with hint "1 = Poor, 5 = Excellent".
- Existing Priority select styled identically to the other fields.
- Submit Feedback button: full width inside the form, blue background, white bold text, rounded corners.
- History table with very light blue header, equal column spacing, responsive overflow handling, and centered empty state.
- Backend, API, routes, validation, form field names, and all functionality remain identical.

**Non-Goals:**
- No backend, database, route, or API changes.
- No form field renames or behavior logic changes in `public/js/feedback.js`.
- No changes to the student sidebar, topbar, header, auth, or other student pages.
- No changes to admin feedback management.
- No new dependencies, libraries, or build changes.

## Decisions

**Decision 1: Keep the existing `student-panel` shell and restructure only the content region.**
Keep the page shell (sidebar, topbar, `module-title-bar`) as-is. Change the content area so each section is a white rounded card that gains a blue header band. The header band is implemented by wrapping a blue `#17357f → #2447a8 → #315fda` gradient strip (matching the sidebar) at the top of each card, with bold white left-aligned text, plus rounded top corners so the band sits inside the card's existing `border-radius`.
- Rationale: matches the existing navy/blue visual system, keeps the shared `student-panel`, `module-title-bar`, sidebar, and topbar styles untouched, and avoids new page-level layout scaffolding.
- Alternative considered: adding a separate global header component to all module pages — rejected as out of scope (other student pages unchanged).

**Decision 2: Reuse the existing form controls; do not replace any input/select/textarea.**
The existing `#category`, `#subject`, `#content`, `#rating1..#rating5`, and `#priority` controls are kept with identical ids, names, options, placeholders, and defaults. Only their CSS (`.student-form-input`, `.student-form-select`, `.student-form-textarea`) is adjusted to add rounded corners (~10px), a thin light-blue/gray border (`#cfdff2`/`#d9e6fb`), white background, and comfortable internal padding (e.g., `0.75rem 1rem`).
- Rationale: guarantees zero impact on `feedback.js` form reading (`FormData.get('category'|'subject'|'content'|'rating'|'priority')`), validation, and the create/update flows. Changing markup here is the highest-risk part of the page.
- Alternative considered: introducing a new component library — rejected; adds dependencies and risk with no functional gain for a pure styling task.

**Decision 3: Make the Submit button full-width within the form.**
The submit button becomes `w-full` (full width inside the form column) with the blue `student-btn-primary` treatment and bold white text. The Cancel link is retained as a secondary action below to preserve the existing navigation-to-dashboard behavior.
- Rationale: requirement 8 asks for a full-width blue submit button; keeping Cancel preserves existing functionality per the "do not change functionality" constraint.
- Alternative considered: removing Cancel — rejected (remove functionality).

**Decision 4: Rating group stays as styled small rounded rectangles; only visual refinement allowed.**
Keep the existing `student-rating-group`/`student-rating-label` structure (radio inputs + labels, `.student-rating-input:checked + .student-rating-label` active state). No JS changes. Adjust only the look (rounded rectangle, fit width, consistent gap) if needed to match the design (buttons already exist at ~2.5rem with 10px radius).
- Rationale: the rating behavior is fully data/JS driven; visual touch-ups only, keeping `input[name=rating]` intact so `parseInt(formData.get('rating'))` still works.

**Decision 5: Preserve the My Feedback table exactly in markup; adjust header background and alignment styles.**
Keep the `student-table-wrap` + `student-table` structure and all six columns (Subject, Category, Status, Rating, Date, Actions) with the existing empty-state row (centered "No feedback submitted yet") as rendered by `renderFeedbackTable`. Change `.student-table thead th` background to a very light blue (`#eef5ff`/`#f0f6ff`), keep equal padding/letter-spacing, and rely on the existing `overflow-x: auto` wrapper for responsiveness.
- Rationale: `row/colspan` logic in `feedback.js` (View/Edit/Delete buttons, status badges, star ratings) depends on this exact table structure; only cosmetic table header/column styles change.
- Alternative considered: migrating to a different table layout library — rejected; unnecessary and would break the JS-driven rendering.

**Decision 6: Alignment/spacing via width-constrained same-width cards.**
Both cards use a shared wrapper so they share `max-width` and `margin` (left/right aligned). The content column keeps centered/balanced widths so the page does not stretch. Fields inside the form all use `w-full` inputs inside the same column, so left/right edges align to the card padding. Vertical rhythm is a consistent gap (`space-y-6`) between cards.
- Rationale: simple, robust alignment without a grid framework; consistent with how the other student pages use Tailwind utilities.

## Risks / Trade-offs

- **[Breaking JS selectors/behaviors]** → Mitigated: no form control or table markup changes; only scoped CSS plus wrapping the two sections in header-band blocks. `feedback.js` selectors (`#feedbackForm`, `button[type="submit"]`, `#feedbackTableBody`, `#feedbackModal`, `input[name="rating"]`) all remain valid.
- **[Overflow / responsive breakage]** → Mitigated: full-width fields inside a width-constrained card, existing `overflow-x: auto` table wrapper, and the page's existing mobile topbar/clock media queries are preserved; verified on desktop/laptop/tablet/mobile during implementation (#1.4, #5 tasks).
- **[Card headers misalign with rounded corners]** → Mitigated: header band uses matching `border-radius` on top corners (`border-radius: 24px 24px 0 0`-style) inside the card's `border-radius: 28px`, verified visually in implementation.
- **[Full-width submit looks ambiguous on very wide screens]** → Mitigated: cards are width-constrained (not stretched), so the button remains a reasonable full-width element within the card, matching requirement 8.

## Migration Plan

No data or schema changes; no deployment steps beyond shipping the updated `public/feedback.html` (and any scoped CSS). Rollback = restore the previous file; no state migration required.

## Open Questions

- None. The design deliberately makes all changes frontend-only within `public/feedback.html`; backend/routes/data are untouched.