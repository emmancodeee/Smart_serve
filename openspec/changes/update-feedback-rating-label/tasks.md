## 1. Update the label text

- [x] 1.1 In `public/feedback.html`, change the Rating section label text from "Rating (1-5)" to "Ratings", keeping the `student-form-label feedback-label` classes and the element otherwise unchanged
- [x] 1.2 Confirm the five rating buttons `[1] [2] [3] [4] [5]` and the helper text "1 = Poor, 5 = Excellent" remain exactly as-is, with no changes to markup, ids, or names

## 2. Preserve everything else

- [x] 2.1 Confirm no changes to the Priority section (label "Priority *", "Select Priority" placeholder, dropdown options), the Category/Subject/Detailed Feedback fields, the Submit Feedback/Cancel buttons, the My Feedback table, or the sidebar/header
- [x] 2.2 Confirm no changes to `public/js/feedback.js` and that rating/priority functionality, submit, edit/delete, and history reload are unaffected

## 3. Final verification

- [ ] 3.1 Browser smoke-test (student login): the Feedback form shows the label "Ratings" above the five rating buttons with the helper text below, and everything else renders unchanged
- [ ] 3.2 Visual cross-check: the Rating section label reads "Ratings" only on the Student Feedback page; the Returns page modal label is not affected