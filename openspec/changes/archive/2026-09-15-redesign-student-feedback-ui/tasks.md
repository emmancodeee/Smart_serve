## 1. Prepare the form grid structure

- [x] 1.1 Open `public/feedback.html` and wrap the "Category *" field and the "Subject *" field in a Row 1 container (`grid grid-cols-1 lg:grid-cols-2 gap-5` or equivalent responsive grid) so they render side by side on desktop and stacked on mobile; preserve the `category`/`subject` ids, names, labels, and options exactly
- [x] 1.2 Wrap the "Detailed Feedback *" textarea and a right section (Rating + Priority) in a Row 2 container using a wider left column for the textarea and a narrower right column (e.g., `lg:grid-cols-[1.4fr_1fr]`), collapsing to one column on small screens; preserve the `content` textarea id/name and `rating1..rating5` radios and `priority` select id/name exactly

## 2. Style the submit form card

- [x] 2.1 Confirm the Submit Feedback card keeps its full-width `.feedback-card-header` navy bar ("Submit Feedback") as the only heading; remove nothing above it and add no duplicate title
- [x] 2.2 Set the Detailed Feedback textarea to approximately 110–140px tall via CSS (e.g., `height: 7.5rem` on `#content`), keeping the placeholder text "Please provide detailed feedback..."
- [x] 2.3 Verify the Rating control renders five compact equal-size square/rounded buttons (1–5) horizontally with the dark navy active style on the checked radio and white/blue-border styling on unselected ones, plus the "1 = Poor, 5 = Excellent" helper text below
- [x] 2.4 Verify the Priority select stays full-width and normal height, aligned with the Rating section in the right column

## 3. Style the form actions

- [x] 3.1 Confirm the Submit Feedback (`student-btn-primary`) and Cancel (`student-btn-secondary`) buttons remain on ONE horizontal row, not full-width; keep `@media` nowrap and 1rem gap (12–16px target) so they never stack or touch
- [x] 3.2 Confirm Cancel keeps `id="cancelBtn"` and the submit button remains a `type="submit"` button inside `#feedbackForm` (required by feedback.js label switching in edit mode)

## 4. Polish the My Feedback card

- [x] 4.1 Confirm the "My Feedback" card keeps its full-width `.feedback-card-header` navy bar and sits ~28px below the Submit Feedback card (`.feedback-section-gap` margin-top 1.75rem; 24–32px target)
- [x] 4.2 Confirm the table columns are Subject, Category, Status, Rating, Date, Actions with the existing light-blue uppercase header styling, vertically centered cells, and subtle borders
- [x] 4.3 Confirm the Actions column shows only compact equal-height Edit (`student-btn-warning`, yellow accent) and Delete (`student-btn-danger`, red) buttons, horizontally spaced and vertically centered; add no View/Details/Open actions

## 5. Tighten spacing

- [x] 5.1 Adjust `.feedback-card-body`/`.feedback-form` padding and gaps to the Returns-page rhythm: card gap 24–32px (`margin-top`), field gap 16–20px (`gap: 1.25rem`), label→input gap 8–10px (`.feedback-label` margin-bottom), button gap 12–16px
- [x] 5.2 Verify no label overlaps its input, no text touches card borders, buttons do not touch each other, and table content clears card edges

## 6. Preserve sidebar/header and functionality

- [x] 6.1 Confirm the sidebar (logo, nav items, active Feedback state) and the top header (welcome, clock, avatar/name/role, bell, menu) are byte-identical to the current page aside from indentation if any
- [x] 6.2 Grep `public/feedback.js` references and confirm every used hook (`feedbackForm`, `category`, `subject`, `content`, `rating` name + `rating1..5` ids, `priority`, `feedbackTableBody`, `cancelBtn`, modal ids, `student-btn-warning`/`student-btn-danger`) still exists in `feedback.html` with the same ids/names/classes

## 7. Final verification

- [x] 7.1 Browser smoke-test (student login): desktop shows side-by-side Category+Subject and a wider Detailed Feedback next to Rating/Priority; narrow the window to confirm single-column collapse; Submit/Cancel side by side; table renders with all six columns; Edit and Delete work; submit and history reload work unchanged
- [x] 7.2 Visual cross-check with the Returns page to confirm matching card spacing, navy headers, and overall compact professional layout; no excessive vertical whitespace