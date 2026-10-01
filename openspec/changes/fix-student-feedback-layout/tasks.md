## 1. Form container spacing (feedback.html)

- [x] 1.1 Increase the form body padding: change `.feedback-card-body` padding from `1.5rem 1.75rem` to `1.75rem 2rem` (~28–32px, within the 28–32px target) so labels/fields never touch the card borders
- [x] 1.2 Add a scoped `.feedback-form` rule in the inline `<style>` block (`display: flex; flex-direction: column; gap: 1.25rem;`) and apply it to `<form id="feedbackForm">`, replacing the `space-y-4` class so fields are spaced ~20px
- [x] 1.3 Add a scoped `.feedback-label` rule (`margin-bottom: 0.5rem`) and apply it to every form label (Category, Subject, Detailed Feedback, Rating, Priority) so the label-to-field gap is ~8px
- [x] 1.4 Confirm the form keeps its white `.student-panel.feedback-card` container and navy `feedback-card-header` "Submit Feedback" title bar unchanged

## 2. Field order and alignment (feedback.html)

- [x] 2.1 Confirm the field DOM order is exactly Category *, Subject *, Detailed Feedback *, Rating (1-5), Priority (no reordering)
- [x] 2.2 Confirm all labels share the same font-size/weight/color and the same left starting point (existing `.student-form-label` reused; `.feedback-label` only adds margin-bottom)
- [x] 2.3 Confirm all inputs/selects/textareas keep `.student-form-input` / `.student-form-select` / `.student-form-textarea` classes (same width, height, rounded corners, border), with the Detailed Feedback textarea rows left as-is

## 3. Rating (1-5) section (feedback.html)

- [x] 3.1 Update the existing `.student-rating-group` rule in the inline `<style>` block to `flex-wrap: nowrap; gap: 8px;` so the five buttons stay in one row with ~8px spacing
- [x] 3.2 Update the existing `.student-rating-label` rule to `min-width: 46px; height: 46px;` (~44–48px target) keeping the navy selected state, hover, and border styling
- [x] 3.3 Confirm the helper text "1 = Poor, 5 = Excellent" (`student-rating-hint`) sits directly below the rating buttons and that the buttons do not span the full form width
- [x] 3.4 Confirm the rating radio input / label pairing (id + for) is unchanged so rating selection functionality works

## 4. Submit / Cancel button row (feedback.html)

- [x] 4.1 Replace the button wrapper `<div class="space-y-3">` with `<div class="feedback-actions">` and remove `w-full` from both buttons
- [x] 4.2 Add a scoped `.feedback-actions` rule: base `display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;` and at `@media (min-width: 640px)` `flex-wrap: nowrap;` so Submit/Update and Cancel sit in a left-aligned row with ~16px spacing
- [x] 4.3 Keep the submit button (`student-btn student-btn-primary`, dark navy bg / white text) FIRST and Cancel (`student-btn student-btn-secondary`, white/light bg with border) SECOND with `id="cancelBtn"` preserved
- [x] 4.4 Confirm the submit button label is "Submit Feedback" in create mode and "Update Feedback" in edit mode (existing `editFeedback`/`resetForm` text handling unchanged)

## 5. Cancel button behavior (feedback.js)

- [x] 5.1 Update the existing Cancel listener (`document.getElementById('cancelBtn')?.addEventListener('click', ...)`) to call `resetForm()`, which clears the form, exits edit mode (`dataset.mode = 'create'`, removes `dataset.feedbackId`), and restores the "Submit Feedback" label — with NO navigation and NO reload
- [x] 5.2 Confirm `resetForm()` is unchanged and does not trigger any scroll/modal side effects beyond its existing behavior

## 6. Section gap and My Feedback header (feedback.html)

- [x] 6.1 Replace `mt-5` on the My Feedback card with a scoped `.feedback-section-gap` class; add the rule `margin-top: 1.75rem;` (~28px gap between the Submit Feedback card and the My Feedback card)
- [x] 6.2 Confirm the My Feedback card keeps its navy `.feedback-card-header` "My Feedback" title bar with the same height and left padding as the "Submit Feedback" header
- [x] 6.3 Confirm consistent spacing between the My Feedback header and its table (existing `.feedback-card-body` padding reused)

## 7. My Feedback table alignment (feedback.html + feedback.js)

- [x] 7.1 Add nth-child rules in the inline `<style>` block so `th` and `td` columns 3 (STATUS), 4 (RATING), 5 (DATE), and 6 (ACTIONS) are `text-align: center`, keeping columns 1 (SUBJECT) and 2 (CATEGORY) left-aligned (CATEGORY consistently left)
- [x] 7.2 Confirm `thead th` uses the existing consistent horizontal padding and that header/row content stays vertically centered
- [x] 7.3 Update the Actions cell markup in `renderFeedbackTable` (`public/js/feedback.js`) from `flex flex-wrap gap-2` to `flex justify-center gap-2` so Edit/Delete are centered and ~8px apart in the Actions column
- [x] 7.4 Confirm Edit keeps `.student-btn-warning` (yellow/accent) and Delete keeps `.student-btn-danger` (red), both `student-btn-sm`, same row, similar height, not stretched
- [x] 7.5 Confirm the table keeps `.student-table-wrap` (responsive, `overflow-x: auto`) so it remains usable on small screens without breaking layout

## 8. Verification

- [x] 8.1 Run `node --check public/js/feedback.js` to confirm no syntax errors after the Cancel and Actions-cell edits
- [x] 8.2 Grep feedback.html to confirm: `feedback-actions`, `feedback-section-gap`, `feedback-form`, and `.feedback-label` present; `space-y-3` and `w-full` removed from the button row; field order intact
- [x] 8.3 Grep feedback.js to confirm `resetForm()` is called from Cancel and that submit/edit/delete/view/modal/history functions are otherwise unchanged
- [x] 8.4 Confirm no changes to routing, sidebar markup, header markup, admin pages, `theme.css`, or `tailwind.css`
- [ ] 8.5 Smoke-test (browser or DOM inspection): submit, edit (button switches to Update Feedback), cancel in edit mode (returns to create mode, no navigation), delete, rating buttons ~46px in one row with navy selected state, table columns aligned, ~28px section gap, no horizontal overflow on mobile
