## Why

The My Feedback table currently offers a permanent "Delete" action, which removes the feedback record entirely. A destructive delete is risky and loses data students and staff may still need. Replacing it with "Archive" keeps the record stored but removes it from the student's active list, which is safer and still lets the system retain/manage it.

## What Changes

- Replace the "Delete" button in the My Feedback table Actions column with an "Archive" button (exact text "Archive"), placed beside the existing "Edit" button.
- Remove all Delete button/text from the My Feedback section.
- Add a confirmation dialog before archiving: "Are you sure you want to archive this feedback?" with Cancel and Archive buttons.
- Add archive API: a new authenticated endpoint that softly archives a feedback record (marks it archived instead of deleting it).
- Archived feedback disappears from the student's active My Feedback list but the document stays in the database.
- Archiving affects only the selected feedback record; other records are untouched.
- No sidebar, header, table structure, colors, spacing, or other functionality changes.

## Capabilities

### New Capabilities
- `student-feedback-archiving`: Behavior of archiving student feedback — the Archive action, confirmation flow, soft-archive persistence (no permanent deletion), and exclusion of archived records from the active My Feedback list.

### Modified Capabilities
- `student-feedback-ui-layout`: The "Editing actions in the table" requirement changes the Actions column from "Edit" + "Delete" to "Edit" + "Archive".

## Impact

- `models/Feedback.js`: add an `isArchived` field (default `false`) and `archivedAt` timestamp.
- `services/feedbackService.js`: replace `deleteFeedback` with `archiveFeedback` (soft update), and make `getUserFeedbacks` exclude archived records.
- `controllers/feedbackController.js`: replace `deleteFeedback` controller with `archiveFeedback`.
- `routes/auth.js`: replace `DELETE /api/auth/feedback/:id` with a `PUT` archive endpoint (e.g., `/api/auth/feedback/:id/archive`).
- `public/js/feedback.js`: render Archive button (`data-action="archive"`), delete handler, confirmation flow, and call the archive endpoint; refresh table after archiving.
- `public/feedback.html`: add the archive confirmation modal markup.
- No changes to admin feedback management, returns page, or other modules.