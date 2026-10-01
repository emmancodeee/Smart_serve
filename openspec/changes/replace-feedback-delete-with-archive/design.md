## Context

The My Feedback table (student) currently renders an "Edit" action plus a destructive "Delete" action per row. The delete calls `DELETE /api/auth/feedback/:id`, which permanently removes the feedback document. The change replaces Delete with a soft "Archive" action so records are retained and simply hidden from the active student list.

Relevant current code:
- `public/js/feedback.js`: `renderFeedbackTable` renders `data-action="delete"` with `student-btn-danger` (`feedback.js:221-222`); delegated click handler routes `data-action === 'delete'` to `deleteFeedback` (`feedback.js:172-173`); `deleteFeedback` uses `confirm()` + `DELETE /api/auth/feedback/${id}` (`feedback.js:383-406`).
- `services/feedbackService.js`: `deleteFeedback` performs `Feedback.deleteOne` (`feedbackService.js:175-198`); `getUserFeedbacks` returns all of the user's docs (`feedbackService.js:99-110`).
- `controllers/feedbackController.js`: `deleteFeedback` wrapper (`feedbackController.js:70-78`).
- `routes/auth.js`: `DELETE /api/auth/feedback/:id` (`auth.js:39`).
- `models/Feedback.js`: no archive field.
- `public/feedback.html`: has a `.student-modal-overlay`/`.student-modal-box` pattern with `openModal`/`closeModal` (`is-open` class, `feedback.js:140-147`), usable for the confirmation dialog.

## Goals / Non-Goals

**Goals:**
- Actions column shows exactly "Edit" + "Archive" per row (no Delete anywhere in My Feedback).
- Archive is soft: set `isArchived: true` + `archivedAt`, never delete the document.
- Confirmation dialog with Cancel / Archive before archiving.
- Active My Feedback list excludes archived records; other records unaffected.
- Preserve Edit, submit, pri icon styling, table layout, and all existing behavior.

**Non-Goals:**
- No admin archive section/view (records stay retrievable in DB only).
- No archive/unarchive toggle or archive list UI on the student page.
- No changes to sidebar, header, colors, spacing, or the returns page.

## Decisions

**D1: Soft-archive via a boolean field instead of a separate collection.**
Add `isArchived: { type: Boolean, default: false }` and `archivedAt: { type: Date, default: null }` to `models/Feedback.js`. Archiving sets both fields.
- Rationale: Keeps records in the same collection (so admin `getAllFeedbacks` still sees everything and history is preserved), no data migration, simple queries (`find({ userId, isArchived: { $ne: true } })`).
- Alternative considered: deleting into an archive collection (like `scripts/archive-*.js` move documents to `_archive_YYYY_MM`). Rejected — that is a batch data-retention pattern, not per-record student action, and would hide records from admin management.

**D2: Replace the DELETE route with a PUT archive endpoint.**
Replace `DELETE /api/auth/feedback/:id` with `PUT /api/auth/feedback/:id/archive` (`routes/auth.js:39`), mapped to `archiveFeedback` in controller/service.
- Rationale: `PUT` on a sub-path is semantically cleaner than overloading DELETE to mean "soft delete," and avoids breaking the REST-style DELETE meaning. Only the student route changes; o rspec/architecture unchanged.

**D3: Service ownership checks unchanged.**
`archiveFeedback` reuses the same ownership guard as the old delete: find by `:id`, 404 if missing, 403 if `feedback.userId !== userId`, then set `isArchived=true` + `archivedAt=now` and save.
- Rationale: prevents a student from archiving another user's feedback.

**D4: Confirmation dialog reuses the existing modal pattern.**
Add a dedicated `archiveConfirmModal` overlay in `feedback.html` (same `student-modal-overlay`/`student-modal-box`/`student-btn` styles) with body text "Are you sure you want to archive this feedback?" and Cancel (`student-btn-secondary`) + Archive (`student-btn-info`) buttons. In `feedback.js`, track the pending feedback id, open on Archive click, close on Cancel/overlay/Escape, and call the archive API on Archive confirm; on success call `loadFeedbackHistory()` to refresh the table.
- Rationale: matches the app's CSP-safe pattern (no inline onclick) and the existing modal interactions; the button styling `student-btn-info` exists in `feedback.js`/`feedback.html` already.
- Alternative considered: native `confirm()` — rejected because the spec requires Cancel/Archive buttons and refresh behavior consistent with the page design.

**D5: Archive button styling.**
Use the existing compact `student-btn student-btn-sm student-btn-info` (white bg, blue border, blue text — `feedback.html:299-308`) beside the `student-btn-warning` Edit button.
- Rationale: `student-btn-info` exists and is distinct from red/danger; visually signals a non-destructive action.

## Risks / Trade-offs

- [Archived records shown to admins as normal] → Accepted: admin management still lists them; removing them from admin list is out of scope and could hide data (the spec only requires retaining retrievability).
- [Old DELETE callers broken] → Only `feedback.js` `deleteFeedback` called the student DELETE route; it is replaced in the same change. Grep verified no other callers.
- [CSP blocks inline handlers in modal] → Confirmation buttons are wired via `addEventListener` in `feedback.js`, following the existing CSP-safe pattern.

## Migration Plan

1. Extend `models/Feedback.js` with `isArchived`/`archivedAt`.
2. Update `services/feedbackService.js`: replace `deleteFeedback` with `archiveFeedback`; filter `getUserFeedbacks` to exclude archived.
3. Update `controllers/feedbackController.js` export/wiring.
4. Update `routes/auth.js` to `PUT /api/auth/feedback/:id/archive`.
5. Update `public/feedback.html` with the archive confirmation modal.
6. Update `public/js/feedback.js`: Archive button render, handler, confirmation flow, API call, table refresh; remove delete code.
7. Tests: existing tests unaffected (no delete tests found for feedback); spot-check submit/edit/archive flows in browser.