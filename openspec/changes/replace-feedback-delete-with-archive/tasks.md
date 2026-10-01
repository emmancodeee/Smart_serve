## 1. Data model

- [x] 1.1 In `models/Feedback.js`, add `isArchived: { type: Boolean, default: false }` and `archivedAt: { type: Date, default: null }` to the schema

## 2. Service layer

- [x] 2.1 In `services/feedbackService.js`, replace `deleteFeedback` with `archiveFeedback`: find by `req.params.id`, 404 if not found, 403 if the user does not own it, then set `isArchived = true` and `archivedAt = new Date()`, save, and log `feedback_archived`; return `{ message: 'Feedback archived successfully' }`
- [x] 2.2 In `services/feedbackService.js`, change `getUserFeedbacks` to exclude archived records (query `Feedback.find({ userId, isArchived: { $ne: true } })`) so archived feedback no longer appears in the active list
- [x] 2.3 Update the module exports to expose `archiveFeedback` and remove `deleteFeedback`

## 3. Controller and route

- [x] 3.1 In `controllers/feedbackController.js`, replace the `deleteFeedback` wrapper with `archiveFeedback` (same pattern, updated name/log message) and update the exports
- [x] 3.2 In `routes/auth.js`, replace `accountRouter.route('/feedback/:id').delete(...deleteFeedback)` with `accountRouter.route('/feedback/:id/archive').put(authenticateUser, feedbackController.archiveFeedback)`; confirm no other code calls `DELETE /api/auth/feedback/:id`

## 4. Frontend confirmation modal

- [x] 4.1 In `public/feedback.html`, add an archive confirmation modal (`.student-modal-overlay`/`.student-modal-box` pattern) with `id="archiveConfirmModal"`, body text "Are you sure you want to archive this feedback?", a Cancel button (`student-btn-secondary`), an Archive button (`student-btn-info`), and a close button
- [x] 4.2 Ensure the modal reuses existing overlay/box/button styles and is hidden by default (no `is-open` class)

## 5. Frontend table and handlers

- [x] 5.1 In `public/js/feedback.js` `renderFeedbackTable`, change the Actions column to show Edit (`data-action="edit"`, `student-btn-warning`) and Archive (`data-action="archive"`, `student-btn-info`) with the exact text "Archive"; remove the Delete button entirely
- [x] 5.2 In the delegated click handler, route `data-action === 'archive'` to open the confirmation modal (store the pending feedback id); remove the `delete` branch
- [x] 5.3 Wire the modal's Cancel/close to close the dialog without changing anything; wire the Archive confirm to call a new `archiveFeedback(id)` that `PUT`s to `/api/auth/feedback/${id}/archive` with the auth header, closes the modal, then calls `loadFeedbackHistory()` on success
- [x] 5.4 Remove the old `deleteFeedback` function and any leftover "Delete"/"delete" references from `public/js/feedback.js`

## 6. Verify

- [x] 6.1 Grep `public/feedback.html` and `public/js/feedback.js` to confirm no "Delete" button or delete-on-feedback references remain in the My Feedback section
- [x] 6.2 Confirm archived record is not permanently deleted: the document persists with `isArchived: true` and `archivedAt` set, and only the selected record is changed
- [x] 6.3 Tool tests: run the existing test suite to confirm no regression (e.g., `npm test`), and check server starts/loads the feedback page
- [ ] 6.4 Browser smoke-test (student login): Archive button shows beside Edit; clicking shows the confirmation dialog; Cancel keeps the row; Confirm archives exactly that row, refreshes the list, and the row disappears; other rows remain