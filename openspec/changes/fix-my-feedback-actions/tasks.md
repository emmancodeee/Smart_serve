## 1. Actions column — remove View, always show Edit/Delete

- [x] 1.1 In `public/js/feedback.js` `renderFeedbackTable`, remove the View button from the Actions cell (drop `viewFeedback` call)
- [x] 1.2 Render Edit and Delete for EVERY feedback row (remove the `feedback.status === 'pending'` conditional), keeping Edit as `student-btn-sm student-btn-warning` and Delete as `student-btn-sm student-btn-danger` with proper spacing so they don't overlap

## 2. Fix the Edit flow

- [x] 2.1 Rewrite `editFeedback` to populate the existing form (category, subject, content, rating radio, priority) from the fetched record WITHOUT replacing `form.onsubmit`
- [x] 2.2 Set `form.dataset.mode = 'update'` and `form.dataset.feedbackId = id`, and change the submit button text to "Update Feedback", so the existing `handleFormSubmit` routes the save to `updateFeedback(id)`
- [x] 2.3 Confirm `updateFeedback` PUTs to `/api/auth/feedback/:id` with content + rating, updates only that record (no duplicate creation), and that `resetForm()` fully restores the create state (button text, dataset) for repeated edits and new submissions

## 3. Fix the Delete flow

- [x] 3.1 Keep `deleteFeedback` with `confirm('Are you sure you want to delete this feedback?')`, DELETE `/api/auth/feedback/:id`, then `loadFeedbackHistory()` so the removed row disappears immediately

## 4. Allow edit/delete regardless of status (student endpoints)

- [x] 4.1 In `services/feedbackService.js`, remove the `feedback.status !== 'pending'` rejection from `updateFeedback` so a student can update their own feedback in any status (ownership + validation checks remain)
- [x] 4.2 In `services/feedbackService.js`, remove the `feedback.status !== 'pending'` rejection from `deleteFeedback` so a student can delete their own feedback in any status (ownership check remains)

## 5. No scope creep

- [x] 5.1 Confirm no changes to `public/feedback.html` layout, colors, spacing, table columns, form fields, or the create/submission flow (markup changes limited to wiring: ids/data-attributes, no inline onclick)
- [x] 5.2 Confirm admin/super-admin feedback endpoints and UI are untouched

## 6. CSP-safe event binding (root cause fix)

- [x] 6.1 Confirmed root cause: helmet CSP in `server.js` (`script-src`) omits `'unsafe-inline'`/`'unsafe-hashes'`, so browsers block every inline `onclick` attribute; pages are served under this policy (helmet line 164, `express.static` line 222)
- [x] 6.2 Replace the inline `onclick` on Edit/Delete in `renderFeedbackTable` with `data-action`/`data-id` buttons handled by one delegated `document` click listener in `feedback.js`
- [x] 6.3 Re-bind the feedback page Cancel and modal-close buttons via `addEventListener` (ids `cancelBtn`, `closeModalBtn`, `closeModalFooterBtn`), removing their previously dead inline `onclick`
- [x] 6.4 Re-bind the returns page Cancel button the same way (`returns.html` + `returns.js`) so it is not left as dead inline-onclick code

## 7. Verification

- [x] 7.1 Run `node --check public/js/feedback.js`, `node --check public/js/returns.js`, and `node --check services/feedbackService.js`
- [x] 7.2 Run existing tests (`npm test`) and confirm no new regressions
- [ ] 7.3 Live-verify with an actual submitted feedback record: the Actions column shows only [Edit] [Delete]; clicking Edit loads/form-fills, saves in place, and doesn't duplicate; clicking Delete confirms and removes only that row; the form remains usable afterward and the browser console shows no CSP violations