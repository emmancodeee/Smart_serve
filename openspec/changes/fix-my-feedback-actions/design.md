## Context

The "My Feedback" table is rendered client-side by `renderFeedbackTable()` in `public/js/feedback.js`. Its Actions cell currently renders a View button always, plus Edit/Delete only when `feedback.status === 'pending'`. The student-facing edit/delete endpoints exist and work, but the service functions reject any attempt when the record is no longer `pending`, and the frontend edit flow breaks after the first save because `editFeedback` replaces `form.onsubmit` with a closure that `resetForm()` never restores.

Investigation result for the "not clickable" report: the buttons are physically present, but there is NO overlay, `pointer-events: none`, z-index conflict, disabled attribute, or covering element on the feedback page. There are two actual root causes:

1. **CSP blocks inline event handlers (primary).** `server.js` applies helmet with `script-src: ['self', cdn.jsdelivr.net, cdnjs.cloudflare.com]` (no `'unsafe-inline'`/`'unsafe-hashes'`), and all pages are served under it (helmet at line 164, `express.static` at line 222). Browsers therefore refuse to execute every inline `onclick="..."` attribute — which is how the Edit and Delete buttons were wired — so clicking them silently does nothing (CSP violation in the console). The same blocks the page's Cancel and modal-close buttons.
2. **Conditional rendering + edit submit-handler leak (secondary).** `renderFeedbackTable()` gates Edit/Delete behind `status === 'pending'`, and `editFeedback()` replaces `form.onsubmit` with a closure that `resetForm()` never restores.

## Goals / Non-Goals

**Goals:**
- Actions column shows ONLY "Edit" and "Delete" for every row.
- Edit loads the record into the existing form, updates the same record (no duplicates), and works repeatedly.
- Delete confirms with the existing dialog, deletes only the selected record, and removes the row from the table immediately.
- Both actions work regardless of the feedback's status for the owning student.

**Non-Goals:**
- No layout, color, spacing, or table-column changes.
- No changes to the feedback submission (create) flow, form fields, or validation.
- No changes to admin/super-admin feedback management or the admin `GET /admin/feedback` etc. endpoints.
- No database/schema changes.

## Decisions

- **Replace inline `onclick` attributes with CSP-safe event binding.** Inline event handlers are blocked by the app's Content-Security-Policy, so the Edit/Delete buttons (and the page's Cancel and modal-close buttons, plus the returns page Cancel) are re-wired with `addEventListener`. The row buttons use `data-action="edit|delete"` + `data-id` and are handled by one delegated `document` click listener in `feedback.js` — this is CSP-compliant, robust against re-renders, and removes reliance on global function names.
- **Keep the existing `handleFormSubmit` update-mode routing.** `handleFormSubmit` already calls `updateFeedback(form.dataset.feedbackId)` when `form.dataset.mode === 'update'`, so `editFeedback` only populates the four fields + rating, sets the dataset, and changes the submit-button label; the fragile `form.onsubmit` takeover is removed.
- **Remove the `status !== 'pending'` guards in the student-facing service functions.** Rationale: the requirement says Edit/Delete "MUST BE ACTUALLY CLICKABLE AND FUNCTIONAL" for the student's own submitted feedback. Keeping the guards would make the always-visible buttons error out with 400 for reviewed feedback. Ownership checks (`String(feedback.userId) === String(userId)`) and validation stay intact, and only the student-facing `PUT/DELETE /api/auth/feedback/:id` paths are affected. Alternative considered: keep the guards and only show Edit/Delete while pending — rejected because the user explicitly wants actions always available after submission.
- **Delete confirmation stays as the existing `confirm()` dialog** with the exact text "Are you sure you want to delete this feedback?", then DELETE and `loadFeedbackHistory()` to drop the row immediately.
- **No visual CSS/markup layout changes** — the existing button classes, spacing, and layout are reused unchanged; markup changes are limited to wiring (ids/data-attributes, removing inline onclick).

## Risks / Trade-offs

- Removing the status guards lets a student edit/delete feedback that an admin already responded to. → Mitigation: changes are limited to the student-owned endpoints with ownership checks intact; admin records and endpoint behavior are untouched, and this is exactly what the user requested.
- Always-visible Edit/Delete on very old records could allow editing feedback that admins consider closed. → Accepted as a product decision per the request; the history table and admin views are not affected.
- `updateFeedback` currently sends only `content` and `rating` from FormData, matching what the service updates. → Keep as-is; the PUT route is unchanged.

## Migration Plan

- Apply frontend change in `public/js/feedback.js` and the two guard removals in `services/feedbackService.js`. No data migration. Rollback = revert the single commit / these two files.
- Verify with `node --check`, `npm test` (no new regressions), and a live create→edit→delete cycle on a submitted record.

## Open Questions

- None.