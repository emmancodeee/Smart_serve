## Why

The Student Feedback page stacks every field vertically in a single narrow column, producing a long, sparse page with excessive vertical spacing. It does not match the improved, compact card-based layout used on the Returns page. Restructuring the form into a balanced two-column layout and tightening spacing will make the page more organized, compact, and professional while leaving all functionality intact.

## What Changes

UI-only restructuring of `public/feedback.html` (student Feedback page). No routing, API, database, validation, or feedback logic changes.

- Reorganize the Submit Feedback form into a responsive layout: Row 1 = Category + Subject side-by-side; Row 2 = Detailed Feedback (textarea ~110–140px) on the left with Rating + Priority controls stacked on the right.
- Keep the "Submit Feedback" and "My Feedback" full-width dark navy card headers with rounded top corners; do not add duplicate page titles.
- Keep the activity row only in "My Feedback" (Edit + Delete); do not add View/Details/Open actions.
- Keep the compact equal-height Edit (white/yellow accent) and Delete (white/red) buttons horizontally centered in the Actions column.
- Tighten spacing: 24–32px between cards, 16–20px between fields, 8–10px between labels/inputs, 12–16px between buttons. Keep buttons on one row, not full-width.
- Keep table header styling (italic not required) — light blue table header with uppercase small bold labels, vertically centered cells, subtle borders.
- Keep the sidebar and top header exactly as-is (Smart Serve logo, nav links, active Feedback state, Welcome/clock/avatar/bell/menu).
- Responsive: two-column layout on desktop, single-column on tablet/mobile.

## Capabilities

### New Capabilities
- `student-feedback-ui-layout`: Defines the visual layout of the Student Feedback page — a compact two-column submit form in a rounded navy-header card, a balanced "My Feedback" table card, tight consistent spacing, responsive collapse, and preserved sidebar/header — with all existing feedback behavior unchanged.

### Modified Capabilities
<!-- None - no existing main-spec requirement is changing; this is a new UI-only capability. -->

## Impact

- `public/feedback.html` — restructure form markup into grid layout, adjust CSS, tighten spacing, keep table/action structure and all IDs/names/how feedback controls.
- `public/js/feedback.js` — no changes expected; verify `editFeedback`, `deleteFeedback`, submit handler, rating/priority field IDs remain referenced correctly.
- Sidebar and header: unchanged.
- No server-side or database changes.