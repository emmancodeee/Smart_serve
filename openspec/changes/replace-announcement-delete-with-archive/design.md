# Design

## Context

- Single surface to change: the Admin > Announcements page. The table is rendered entirely client-side by `renderFilteredAnnouncements` in `public/js/admin.js` (`#announcementsTable` in `public/admin.html`, empty-state colSpan 7). The only per-row actions are Edit (`startAnnouncementEdit`) and Delete (calls `deleteAnnouncement`).
- Announcements API: `routes/auth.js` — `GET/POST /announcements` and `PUT/DELETE /announcements/:id` are admin-only (`adminRouter.use(authenticateAdmin)`); `GET /announcements` is student-only. Handlers go through `announcementController.js` wrappers → `announcementService.js`.
- The service layer already guards every admin operation with `resolveAuthenticatedAdmin` and records audit history via `logAdminTransaction` (e.g. `announcement_deleted`).
- The project's soft-archive convention (see `models/Inventory.js`, `models/Feedback.js`, `models/Registration.js`) is:
  - `isArchived: { type: Boolean, default: false }`
  - `archivedAt: { type: Date, default: null }`
  - Archived records are hidden from active lists (queries filter them out) but never deleted.
- Deviations that would NOT follow requirements: hard-deleting in the archive action, adding a `Delete`/`Unarchive` button anywhere, redesigning button colors/typography or the table, or inventing a parallel archive store.

## Decisions

### D1 — Reuse the existing soft-archive pattern on the Announcement model
Add to `models/Announcement.js`:
```js
// Archival (soft archive - record retained, hidden from active list)
isArchived: { type: Boolean, default: false },
archivedAt: { type: Date, default: null },
```
Same field names/shape as `Inventory.js`/`Feedback.js`/`Registration.js`, and `timestamps: true` is already on the schema. Existing records have no archive fields, which Mongoose treats as `false`/`null`, so every current announcement stays visible — no migration.

### D2 — Backend archive action mirrors the existing service/controller/route conventions
- `announcementService.archiveAnnouncement(req)`:
  - `resolveAuthenticatedAdmin(req)` → error passthrough (mirrors `deleteAnnouncement`).
  - `Announcement.findById(req.params.id).select('title')` → 404 `'Announcement not found.'` if missing.
  - Set `isArchived = true`, `archivedAt = new Date()`, `save()`.
  - `logAdminTransaction(admin, 'announcement_archived', 'announcement', id, \`${adminName} archived announcement "${title}"\`)`.
  - Return `{ body: { message: 'Announcement archived successfully.' } }`.
  - Idempotent: archiving an already-archived record just resets `archivedAt` — safe.
- `announcementController.archiveAnnouncement(req, res)` — same wrapper shape as the other five handlers (`sendResult` + try/catch 500).
- Route: `adminRouter.route('/announcements/:id/archive').put(announcementController.archiveAnnouncement);` — matches the existing `PUT /registrations/:id/archive` and `PUT /feedback/:id/archive` convention.

### D3 — Hide archived announcements from every active list
- `listAdminAnnouncements`: `Announcement.find({ archivedAt: null })` (replaces bare `.find()`).
- `listStudentAnnouncements`: add `archivedAt: null` to the existing query (`audience: 'students'`, expiry window). This is what makes the archived announcement "disappear from the normal active announcements list" on both the admin table and the student feed, with no client change on the student side.
- `updateAnnouncement`/`deleteAnnouncement` server handlers are left unchanged; their buttons no longer exist in the UI, and archived rows are never rendered so Update/Delete cannot be triggered from the page.

### D4 — Frontend: Archive replaces Delete in the Actions column
In `renderFilteredAnnouncements`, replace the Delete-button block (currently `bg-rose-600`) with an Archive button cell-mate of Edit:
- Label exactly `Archive`.
- Same sizing/padding/typography as Edit and the previous Delete (`px-3 py-1.5 text-xs font-semibold rounded-md ml-2`).
- Uses the app's archive-button glass/outline styling (`border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`), consistent with how Archive is styled elsewhere in this admin module (registrations/requests) and signaling archive-over-destructive-delete. (Note: an equally valid alternative is keeping the replaced Delete's rose classes verbatim — the requirement says "match Smart Serve styling/sizing," which both satisfy; live in `admin.js:2321` above/around, trivially switchable.)
- Click → `archiveAnnouncement(announcement._id, announcement.title)`.

### D5 — Confirmation and refresh mirror the delete flow
Replace the `deleteAnnouncement` function with `archiveAnnouncement(id, label)`:
1. `confirm('Are you sure you want to archive this announcement?')` (exact required text).
2. Auth'd `PUT ${API_BASE}/announcements/${id}/archive` (request helper used by the siblings).
3. On success: `resetAnnouncementForm()` then `if (window.location.pathname.includes('/admin-announcements.html')) …` — keep the exact refresh shape delete used: `Promise.all([loadAdminAnnouncements(), loadTransactions()])` so the table re-reads excluded archives and the transactions log refreshes.
4. On error: `alert(err.message)`; nothing else changes.

### D6 — Out-of-scope removals
- The server-side `DELETE`, service `deleteAnnouncement`, and controller `deleteAnnouncement` endpoint stay intact but are no longer referenced by any UI. Removing an API verb that nothing else consumes is riskier than leaving it; the request only removes the UI button. (If the user later wants the endpoint dropped, that is a separate tiny change.)
- No archive-view/unarchive UI is built — none exists for registrations/feedback either; the record is retained in the store, satisfying "keep the archived record stored."

## Affected Files

| File | Change |
|---|---|
| `models/Announcement.js` | Add `isArchived`, `archivedAt` fields (D1) |
| `announcementService.js` | Add `archiveAnnouncement`; filter both list queries by `archivedAt: null`; export (D2, D3) |
| `announcementController.js` | Add + export `archiveAnnouncement` wrapper (D2) |
| `routes/auth.js` | Add `PUT /announcements/:id/archive` route (D2) |
| `public/js/admin.js` | Archive button + `archiveAnnouncement` replacing Delete (D4, D5) |

## Risks & Mitigations

- **Archived rows have no admin-facing view.** Mirrors the existing behavior for archived registrations/feedback (hidden from active lists, no unarchive UI). Accepted per requirements; adding a view would be a separate change.
- **Archive button color choice** (glass/outline vs. rose). Both satisfy "match styling/sizing"; glass/outline matches the module's other Archive buttons. Identified and easy to flip.
- **Backend DELETE retained** while UI deletes it. Intentional (D6); no behavior change, only an unused verb.
- **Filtering both lists** could accidentally hide records if `archivedAt` indexed differently — none of it is; all existing docs are `null` → visible. Verified by query shape.
- **Client filename**: `public/js/admin.js` is large; edits are localized to the render + one function so regressions stay scoped to announcements.

## Open Questions

- None blocking. (Answer inline only if needed: keep the rose Delete classes verbatim for the Archive button instead of glass/outline — default is glass/outline per D4.)