## Context

The Student Feedback page (`public/feedback.html`) already uses the standard Smart Serve shell (`.student-shell` / `.student-sidebar` / `.student-main` + `.student-topbar`), two `.student-panel.feedback-card` cards with `.feedback-card-header` navy bars ("Submit Feedback", "My Feedback"), and a `feedback.js` script that is tightly coupled to specific IDs/names/classes (`category`, `subject`, `content`, `rating*` radios, `priority`, `feedbackTableBody`, `student-btn-warning`/`student-btn-danger` for Edit/Delete).

The current form stacks every field vertically in a narrow single column, and the spacing is looser than the improved Returns page. The goal is a visual-only re-layout: keep every functional hookpoint intact and only reorganize markup/CSS.

## Goals / Non-Goals

**Goals:**
- Reorganize the Submit Feedback form into a balanced desktop two-column layout with clean single-column fallback on small screens.
- Keep both full-width navy card headers ("Submit Feedback", "My Feedback") as the only headings; no new titles.
- Tighten spacing to match the Returns page (24–32px card gap, 16–20px field gap, 8–10px label gap, 12–16px button gap) with compact, non-full-width side-by-side buttons.
- Preserve the existing table structure, six columns, and the Edit/Delete-only actions with compact equal-height buttons.
- Leave sidebar, header, and all JavaScript-required attributes untouched.

**Non-Goals:**
- No new APIs, routes, database changes, validation changes, or behavioral changes to feedback.js.
- No redesign of the sidebar or top header.
- No new actions (View/Details/Open) in the table.
- No color additions beyond the Smart Serve palette.

## Decisions

**D1: Reuse the existing shell, cards, and navy headers instead of generating a new page.**
`feedback.html` already has the correct skeleton. The redesign only changes markup inside `.feedback-form` and CSS tuning. This preserves the sidebar/header and all existing IDs/names/attributes that `feedback.js` references.

**D2: Wrap form fields into responsive grid rows.**
Replace the single-column stack with two logical rows: Row 1 = Category + Subject; Row 2 = Detailed Feedback (wider, left) + Rating/Priority (narrower, right). Implement with a CSS grid: `grid-template-columns: 1fr 1fr` (Row 1) and `grid-template-columns: 1.4fr 1fr` or similar (Row 2) at desktop widths, collapsing to `1fr` single column below ~1024px. Tailwind-style `md:`/`lg:` breakpoint behavior matches the rest of the student pages (the app already uses compiled Tailwind utilities).

**D3: Keep rating radio + label markup, only compacting styles.**
`feedback.js` sets the active rating via `input[name="rating"][value="..."]`, and `editFeedback` relies on the `rating1..rating5` ids. The current radio+`student-rating-label` pattern is retained; only the label sizing is tightened so the five buttons are compact, equal-size, and horizontally aligned with a blue outline on unselected buttons and the dark navy active style on the selected one.

**D4: Textarea height via CSS, not the `rows` attribute.**
A fixed CSS height (~120px) gives the "large enough for details, not excessive" 110–140px band requested, independent of the `rows` value, preventing excessive page height on desktop and mobile alike.

**D5: Keep button classes and DOM order for submit/cancel.**
`feedback.js` finds the submit button with `form.querySelector('button[type="submit"]')` and flips its label to "Update Feedback" in edit mode, so the submit button must remain a `type="submit"` button inside the form, and the Cancel button keeps `id="cancelBtn"`. The existing `.student-btn-primary` (navy) and `.student-btn-secondary` (white/navy, light border) already match the requested button styles; they stay in a horizontal flex row with fixed gap (not full-width).

**D6: Preserve table markup and action buttons.**
The table already has the six requested columns and Edit(`student-btn-warning`, yellow accent) + Delete(`student-btn-danger`, red) actions centered via `flex justify-center gap-2`. This is kept; no View/Details/Open added. Minor CSS only: ensure equal-height compact buttons and vertical centering.

**Alternatives considered:**
- *Generate a fresh page from scratch* — rejected: would duplicate the shell and risk losing the JS coupling (all IDs/names) and the modal/header behavior.
- *Bootstrap-style external grid library* — rejected: the app uses its own Tailwind utilities and inline styles; no new dependency needed.
- *Keep single column but wider* — rejected: does not achieve the compact, balanced two-column result requested.

## Risks / Trade-offs

- [Breaking a hookpoint in feedback.js] → Mitigation: keep all ids/names (`category`, `subject`, `content`, `rating1..5`, `priority`, `feedbackForm`, `feedbackTableBody`, `cancelBtn`, modal ids) and the submit `type="submit"` button within the form; tasks include a grep-based verification before visual test.
- [Table/actions lose alignment after re-layout] → Mitigation: keep the existing centered flex action cell and the table's pre-existing header/row styles; only adjust spacing.
- [Mobile layout too tall] → Mitigation: single-column collapse plus the CSS-capped textarea height keeps the page compact.
- [Inconsistent spacing with Returns] → Mitigation: reuse the Returns page's spacing values (card gap `margin-top: 1.75rem`, field gap ~1.25rem, label gap 0.45–0.5rem) so both pages share the same rhythm.