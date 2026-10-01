# Tasks

## Backend

- [x] **T1.1 — Add archive fields to the Announcement model** (`models/Announcement.js`)
  Add, following the existing Inventory/Feedback/Registration soft-archive shape:
  `isArchived: { type: Boolean, default: false }` and `archivedAt: { type: Date, default: null }`.

- [x] **T1.2 — Add archive service** (`announcementService.js`)
  Add `archiveAnnouncement(req)` mirroring `deleteAnnouncement`:
  `resolveAuthenticatedAdmin` → `findById(req.params.id).select('title')` (404 `'Announcement not found.'`) →
  set `isArchived = true`, `archivedAt = new Date()`, `save()` → `logAdminTransaction(admin, 'announcement_archived', 'announcement', id, \`…archived announcement "${title}"\`)` →
  return `{ body: { message: 'Announcement archived successfully.' } }`. Export it.

- [x] **T1.3 — Hide archived announcements from lists** (`announcementService.js`)
  - `listAdminAnnouncements`: query `Announcement.find({ archivedAt: null })` instead of bare `.find()`.
  - `listStudentAnnouncements`: add `archivedAt: null` to the query object.

- [x] **T1.4 — Add controller wrapper** (`announcementController.js`)
  Add `archiveAnnouncement(req, res)` using the existing `sendResult` + try/catch-500 pattern; export it.

- [x] **T1.5 — Add archive route** (`routes/auth.js`)
  `adminRouter.route('/announcements/:id/archive').put(announcementController.archiveAnnouncement);` (matches `PUT /registrations/:id/archive` and `PUT /feedback/:id/archive`).

## Frontend

- [x] **T2.1 — Replace Delete button with Archive** (`public/js/admin.js` `renderFilteredAnnouncements`)
  Replace the Delete-button element with an Archive button: label exactly `Archive`, same size/position as Edit (`ml-2`, `px-3 py-1.5 text-xs`), glass/outline style consistent with the module's other Archive buttons; `onclick` → `archiveAnnouncement(announcement._id, announcement.title)`. Remove every Delete reference from this render block.

- [x] **T2.2 — Replace `deleteAnnouncement` with `archiveAnnouncement`** (`public/js/admin.js`)
  - `confirm('Are you sure you want to archive this announcement?')` (exact text); cancel → no-op.
  - Auth'd `PUT ${API_BASE}/announcements/${id}/archive` (same request helper pattern as the function it replaces).
  - Success → `resetAnnouncementForm()` then reload: `Promise.all([loadAdminAnnouncements(), loadTransactions()])`.
  - Error → `alert(err.message)`.
  - Remove the old `deleteAnnouncement` function entirely (its only caller is the removed button).

## Verification

- [x] **T3.1 — Static checks**: `node --check public/js/admin.js`, `node --check announcementService.js`;
  grep confirms no Delete button/label remains in the admin.js announcements render block,
  `archiveAnnouncement` present in admin.js + controller + service, route present in auth.js,
  `archivedAt: null` filter present in both list queries, archive fields present in the model.

- [x] **T3.2 — Temp jest smoke test** (throwaway, in `C:\Users\Dja\AppData\Local\Temp\opencode` with a dedicated `--config`): assert the model fields, both query filters, the route line, the controller export, `Archive` label + `ml-2`/sizing classes in `admin.js`, exact confirm text, and absence of `Delete` in the admin.js announcements render block. Delete the test + config afterward.

- [x] **T3.3 — Baseline suite**: `npm test` unchanged from the known baseline (1 failing suite `tests/admin-filters.test.js`, 1 passing; 5 failing / 14 passing cases).

## Manual (browser — requires running app + admin login)

- [ ] **T3.4** — Admin > Announcements: existing announcements show `[ Edit ] [ Archive ]` in Actions; NO Delete anywhere in the module.
- [ ] **T3.5** — Click Archive → confirmation shows exactly "Are you sure you want to archive this announcement?"; Cancel leaves everything intact.
- [ ] **T3.6** — Confirm Archive → the row disappears from the table immediately (table refresh), other announcements unchanged, a transaction entry appears in the Admin transactions log.
- [ ] **T3.7** — Student announcements feed no longer shows the archived announcement (if it was visible before); other announcements still show.
- [ ] **T3.8** — Edit still works on a non-archived announcement; button styling/sizing matches Edit; page appearance otherwise unchanged.