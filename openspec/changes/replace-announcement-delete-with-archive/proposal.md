## Why

In Admin > Announcements, the Actions column currently offers `[ Edit ] [ Delete ]`. Delete hard-removes the announcement from the database. The module should instead offer `[ Edit ] [ Archive ]` so announcements are softly archived: removed from all active lists, but stored so the record is not lost.

The announcements domain has **no archive mechanism today**: the `Announcement` model has no archive/status field and no archive endpoint. The codebase already defines and reuses a soft-archive pattern elsewhere (registration, inventory, and feedback records use `isArchived: Boolean` + `archivedAt: Date` and are hidden from active lists), so this change applies that same existing pattern to announcements and replaces the Delete button with a functional Archive button.

## What Changes

- Replace the Announcements Actions column `[ Edit ] [ Delete ]` with `[ Edit ] [ Archive ]`: the Delete button is removed from the UI and an Archive button (label exactly `Archive`) appears in the same column position with Smart Serve action-button styling/sizing identical to the rest of the module. Edit is unchanged.
- Add soft-archival to the announcement record, reusing the existing app pattern: `isArchived` (Boolean, default false) + `archivedAt` (Date, default null) fields on the `Announcement` model — same shape as `Inventory`/`Feedback`/`Registration`. No new database, no duplicate records, no hard-coded data.
- Add the archive action to the existing admin announcement API, mirroring the existing `/:id/archive` route convention (registrations: `PUT /registrations/:id/archive`; feedback: `PUT /feedback/:id/archive`), the existing authenticated-admin service pattern (`resolveAuthenticatedAdmin` + `logAdminTransaction`), and the existing `Announcement` model/collection.
- Exclude archived announcements from the active lists: `listAdminAnnouncements` (the admin table) and `listStudentAnnouncements` (the student announcements feed) query `{ archivedAt: null }`, so an archived announcement disappears from both active views immediately while the record stays stored.
- On Archive click, show the confirmation "Are you sure you want to archive this announcement?" and, when confirmed, call the archive endpoint, then refresh the table and transactions just like the delete flow did.
- Keep every other piece of the UI and data pipeline untouched (sidebar, header, colors, typography, spacing, filters, form, table structure, Edit behavior).

## Capabilities

### New Capabilities
- `announcement-archive-action`: Archive replaces Delete in the Admin > Announcements Actions column — soft-archives the selected announcement using the existing authenticated-admin API + model + transaction-logging mechanisms, hides it from active admin and student lists, keeps the record stored, and does not alter any other announcement or UI element.

### Modified Capabilities
<!-- None: no existing spec requirements change. -->
- (none)

## Impact

- `models/Announcement.js` — add `isArchived` and `archivedAt` fields (existing soft-archive field shape; default records remain `null`/`false`, so all current announcements keep appearing in lists with no migration).
- `announcementService.js` — add `archiveAnnouncement(req)` (authenticated admin; set `isArchived = true`, `archivedAt = new Date()`; log an admin transaction; return success). Filter `listAdminAnnouncements` and `listStudentAnnouncements` to `archivedAt: null`.
- `announcementController.js` — add the `archiveAnnouncement` handler wrapper following the existing controller pattern; export it.
- `routes/auth.js` — add `adminRouter.route('/announcements/:id/archive').put(announcementController.archiveAnnouncement)` (matches the existing `/:id/archive` PUT convention).
- `public/js/admin.js` — `renderFilteredAnnouncements`: replace the Delete button element with the Archive button (same column, label `Archive`, glass/outline Smart Serve style, `ml-2`, click → `archiveAnnouncement`). Replace the `deleteAnnouncement` function with `archiveAnnouncement` (exact confirm text; `PUT …/:id/archive`; on success `resetAnnouncementForm` + reload announcements and transactions; error alert). The server-side DELETE endpoint, controller, and service remain untouched (out of scope: only the UI button is removed per the request).
- No `public/admin.html`, student-facing `public/js/announcement.js`, database schema migration, or new dependencies.
- No functionality is created twice: the archive endpoint reuses the existing `Announcement` model, the admin auth middleware, `resolveAuthenticatedAdmin`, `logAdminTransaction`, and the same list-refresh flow already used by delete.