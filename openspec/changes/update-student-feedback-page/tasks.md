## 1. Submit Feedback card (blue header + form wrapping)

- [x] 1.1 In `public/feedback.html`, wrap the `#feedbackForm` panel so the Submit Feedback section is a white rounded card with a blue header band containing bold white left-aligned text "Submit Feedback" (rounded top corners matching the card radius; no `.module-title-bar` duplication)
- [x] 1.2 Keep the existing form (`#feedbackForm`), all field ids/names/options/placeholders, validation attributes, and the submit button element unchanged

## 2. My Feedback card (blue header + history table)

- [x] 2.1 Place the My Feedback history section directly below the Submit Feedback card as a separate white rounded card with a matching blue header band containing bold white text "My Feedback"
- [x] 2.2 Keep the existing `student-table-wrap` / `student-table` markup and all six columns (Subject, Category, Status, Rating, Date, Actions) unchanged, including the loading row and the JS-rendered empty state

## 3. Rounded form controls and labels

- [x] 3.1 Adjust `.student-form-input`, `.student-form-select`, and `.student-form-textarea` styles to rounded corners (~10px), thin light-blue/gray border, white background, and comfortable padding; keep all fields full width inside the same column so left/right edges align
- [x] 3.2 Confirm the Detailed Feedback textarea is taller than the other fields (existing `rows`/height) and that no control overflows the card
- [x] 3.3 Verify each label is dark navy, medium/bold, directly above its field with consistent spacing, and that required labels (Category, Subject, Detailed Feedback) keep the red "*"
- [x] 3.4 Confirm the Priority select uses the same width/border/radius styling as the other fields and still shows Low/Medium/High/Urgent with Medium selected by default

## 4. Rating, submit button, and alignment

- [x] 4.1 Keep the existing 1–5 rating functionality rendered as five horizontal small rounded rectangles with the hint "1 = Poor, 5 = Excellent" below
- [x] 4.2 Make the Submit Feedback button full width inside the form, blue background, bold white text, rounded corners, retaining the existing submit flow (keep the Cancel link as a secondary action)
- [x] 4.3 Ensure the Submit Feedback card and My Feedback card share the same width and left/right margins with consistent vertical spacing between them (no overlap or cut-off content)

## 5. Verification

- [x] 5.1 Run `node --check public/js/feedback.js` (and `node --check` on any file touched) and confirm no syntax regressions
- [x] 5.2 Run existing tests (`npm test`) and confirm no regressions in auth/admin behavior
- [ ] 5.3 Manually verify in the running app: submit (create), edit, delete, view modal, history table rendering, and the centered "No feedback submitted yet" empty state all still work on the restyled page
- [ ] 5.4 Visually confirm responsive alignment (desktop, laptop, tablet, mobile): no horizontal scroll, no text/field overlap, cards aligned, fields consistent width, and no content cut off
- [x] 5.5 Confirm student sidebar, header, topbar, and other student pages are untouched