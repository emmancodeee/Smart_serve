## Why

The "My Feedback" history table on the student Feedback page (`public/feedback.html` + `public/js/feedback.js`) shows a View button plus Edit and Delete buttons in its Actions column, but Edit and Delete are frequently unavailable or non-functional. `renderFeedbackTable` only renders Edit/Delete when `feedback.status === 'pending'` (feedback.js:202), so any feedback that has been reviewed shows only "View". Additionally, `editFeedback` hijacks the form's `onsubmit` handler and `resetForm()` never restores it, so after one edit/save cycle the form stays broken for further edits and new submissions. The Edit and Delete actions must reliably work for every submitted feedback the student owns.

## What Changes

- **Remove View**: The Actions column in the "My Feedback" table SHALL contain only "Edit" and "Delete" buttons — the View button is removed entirely.
- **Always show Edit/Delete**: Render Edit and Delete for every feedback row regardless of status (drop the `feedback.status === 'pending'` conditional in `renderFeedbackTable`).
- **Fix Edit flow**: `editFeedback` SHALL populate the existing form (Category, Subject, Detailed Feedback, Rating, Priority) with the selected feedback, switch the form to update mode via `dataset.feedbackId` + `dataset.mode`, and let the existing `handleFormSubmit` route the save to `updateFeedback`. Remove the `form.onsubmit` takeover that is never restored. The save SHALL update the existing record (PUT `/api/auth/feedback/:id`) and MUST NOT create a duplicate.
- **Fix Delete flow**: `deleteFeedback` SHALL keep the existing `confirm("Are you sure you want to delete this feedback?")`, then DELETE `/api/auth/feedback/:id` and reload the table so the removed row disappears immediately. Only the selected record is deleted.
- **Allow edit/delete regardless of status**: Remove the `status !== 'pending'` guards in the student-facing `updateFeedback` and `deleteFeedback` service functions so a student can always edit/delete their own submitted feedback. Ownership checks remain.
- **Do NOT change**: page layout, colors, spacing, table columns, the submission (create) process, sidebar/header, authentication, or admin/super-admin feedback management.

## Capabilities

### New Capabilities
<!-- No new capabilities. -->

### Modified Capabilities
- `student-feedback-page`: The "My Feedback" table Actions column SHALL display always-working Edit and Delete buttons (no View) for every feedback row, and editing/deleting SHALL work for the student's own submitted feedback regardless of its status without creating duplicates.

## Impact

- **Frontend (student)**: `public/js/feedback.js` — rewrite `renderFeedbackTable`'s Actions cell (remove View, drop the status conditional), fix `editFeedback` to stop hijacking `form.onsubmit` and rely on the existing `handleFormSubmit` update-mode routing, and keep the confirmation + reload flow in `deleteFeedback`.
- **Backend (student-facing)**: `services/feedbackService.js` — remove the `status !== 'pending'` rejection in `updateFeedback` and `deleteFeedback` so a student can edit/delete their own feedback in any status; ownership and validation checks stay intact.
- **Frontend markup**: `public/feedback.html` — no layout/color/spacing changes; the feedback form and table columns are untouched.
- **Non-goals (unchanged)**: admin/super-admin feedback management (`/admin/feedback` endpoints, admin-feedback UI), the feedback submission process, database schema, page shell.