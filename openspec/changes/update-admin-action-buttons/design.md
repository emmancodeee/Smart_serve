# Update Admin Action Buttons Design

## Context

- The Admin dashboard Request Management view (`/admin/registrations`, rendered by `public/admin.html` + `public/js/admin.js`) lists student uniform registrations across three tables: Pending, Approved, and Rejected. Rows are built by `appendRegistrationRow()` (admin.js:2414) which currently renders `View`, `ORF` (when a document path exists), and — for the Pending table — `Approve` + `Reject` (admin.js:2463-2477). Decisions call `updateRegistrationStatus()` → `PUT /api/auth/admin/registrations/:id/status`, which runs the registration state machine and updates the user status.
- The Inventory Management page (`/inventory`, `public/inventory.html` + `public/js/inventory.js`) renders rows with `Edit` and `Delete` (inventory.js:591-592). Delete calls `deleteItem()` → `DELETE /api/auth/inventory/:id`.
- The codebase already has a soft-archive pattern: the Feedback module stores `isArchived: true` + `archivedAt` on the document (`models/Feedback.js:110-115`, `feedbackService.archiveFeedback`, `PUT /api/auth/feedback/:id/archive`) and excludes archived feedback from active queries (`feedbackService.js:105`).
- Backend list endpoints: `adminReadService.listRegistrations` (`Registration.find()`), `inventoryService.listInventory` (`Inventory.find()`), `inventoryService.getInventorySummary` (`Inventory.find()`). Registration status updates are super-admin-blocked via `isSuperAdminAccount` and invalidate the analytics/dashboard caches; inventory mutations are likewise super-admin-blocked and invalidate the inventory cache.
- The separate Uniform Request Management page (`public/admin-requests.html`) is out of scope (different table/action set).

## Goals / Non-Goals

**Goals:**
- Request Management Pending table final actions: `[ View ] [ ORF ] [ Approve ] [ Archive ]`; no `Reject`, no `Remove`.
- Inventory table final actions: `[ Edit ] [ Archive ]`; no `Delete`, no `Remove`.
- `Archive` performs a real, non-destructive soft-archive in both modules using the existing `isArchived`/`archivedAt` mechanism; only the selected record; the active table refreshes immediately.
- Reuse existing data models, API infrastructure, cache invalidation, auth guards, state, and transaction logging.

**Non-Goals:**
- No UI redesign — sidebar, header, colors, typography, table design, spacing, and button styling stay as-is.
- No new databases/collections, no permanent deletion path, no "fake" or duplicate records.
- No changes to the registration state machine (`services/stateMachineService.js`) — archive is orthogonal to status.
- No changes to the Uniform Request Management page (`public/admin-requests.html` / `requests-management.js`).
- No un-archive/restore feature (out of scope for this change).

## Decisions

### D1. Soft-archive with `isArchived` + `archivedAt` on existing documents
Add `isArchived: { type: Boolean, default: false }` and `archivedAt: { type: Date, default: null }` to both `models/Registration.js` and `models/Inventory.js`, mirroring `models/Feedback.js`. Rationale: the user explicitly requires reuse of the existing archive/status mechanism; this is the established pattern in the codebase. Alternative considered — moving records to archive collections (like `scripts/archive-transactions.js`) — rejected: it creates separate collections and copies data, contradicting "do not create duplicate databases or fake records."
- Backfill: existing documents are not archived by default (default `false`), so no data migration is required.

### D2. New archive endpoints mirroring the Feedback archive route
- `PUT /api/auth/admin/registrations/:id/archive` → `adminController.archiveRegistration` → `adminService.archiveRegistration`. Sets `isArchived=true`, `archivedAt=now`, saves, invalidates `ANALYTICS_PREFIX` + `DASHBOARD_PREFIX` caches (same as `updateRegistrationStatus`), and logs an admin transaction (`registration_archived`). Does NOT call the state machine and does NOT change `user.status`, `registrations.status`, or any pickup/return fields.
- `PUT /api/auth/inventory/:id/archive` → `inventoryController.archiveInventoryItem` → `inventoryService.archiveInventoryItem`. Sets `isArchived=true`, `archivedAt=now`, saves, invalidates `INVENTORY_PREFIX` cache, logs `inventory_archived` transaction. Failed/duplicate cases: 404 when not found, 400 when already archived.
- Both reuse `resolveAuthenticatedAdmin` and return 403 for `isSuperAdminAccount` (consistent with existing behavior of `updateRegistrationStatus`, `deleteInventoryItem`, etc.).
- The payload returns `{ message: 'Registration archived successfully' }` / `{ message: 'Item archived successfully' }`.
- The existing `DELETE /api/auth/inventory/:id` route stays in the API for backward compatibility but is no longer surfaced in the UI. Trade-off accepted: no breaking API change; UI is the source of truth for the no-delete rule.

### D3. Exclude archived records from active listings
- `adminReadService.listRegistrations`: query `Registration.find({ isArchived: { $ne: true } })` (keep existing populate + sort). While editing, also correct the model require path from `models/registration` to `models/Registration` (adminReadService.js:2) so the query change lands on the right model on case-sensitive filesystems.
- `inventoryService.listInventory`: `Inventory.find({ isArchived: { $ne: true } })` (cache key unchanged, so existing cached responses expire naturally within the 5-minute TTL).
- `inventoryService.getInventorySummary`: exclude archived items so card stats reflect active inventory only (use the same `{ isArchived: { $ne: true } }` filter).
- No change needed to `adminService.getRegistrations`-style paths used by other modules (e.g., dashboard) — archiving a registration does not clear the student's status; other views remain unaffected.

### D4. Frontend buttons
- Request Management (`admin.js`): in `appendRegistrationRow`, replace the `Reject` button with an `Archive` button (reuse the rose/slate button styling pattern but visually neutral — e.g., slate outline or the existing base classes — while `Approve` keeps emerald). Keep `setPendingBtn` behavior for the Approved/Rejected tables, and additionally offer `Archive` on every registration table so any record can be archived. New handler `archiveRegistration(registrationId)`:
  1. If `isSuperAdminViewOnlyMode()` → alert (view-only), return.
  2. `confirm('Are you sure you want to archive this record?')` — cancel aborts.
  3. `PUT ${API_BASE}/registrations/:id/archive` with Bearer token.
  4. On success → alert success + `await refreshData()` (existing refresh used by `updateRegistrationStatus`).
- Inventory (`inventory.js`): replace the `Delete` button with `data-action="archive-item"` (keep `Edit` + `data-action="edit-item"`). New handler `archiveItem(itemId)`:
  1. If `isCurrentSuperAdmin()` → `showToast('Super admin has view-only access on inventory.', 'warning')`, return.
  2. `confirm('Are you sure you want to archive this record?')` — cancel aborts.
  3. `PUT /api/auth/inventory/:id/archive` with Bearer token.
  4. On success → `showToast('Item archived successfully.', 'success')` + `loadInventory()` + `loadSummary()` (same refresh pattern as deleteItem).
- The delegated click listener at inventory.js:657 already dispatches on `[data-action]`; extend it to handle `archive-item`.

### D5. Button alignment / non-overlap
Archiving buttons reuse the same compact classes as the existing actions (`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold ...` with `ml-2`/margin where a button follows a sibling). No layout change; the Actions column uses the same flex wrap/margin pattern already in place. Action-cell content reviewed during implementation so four request buttons (`View`, `ORF`, `Approve`, `Archive`) stay aligned without overlap.

## Risks / Trade-offs

- [D2: Invented route names] → Archive routes follow the established `:id/archive` convention from Feedback, minimizing surprise; tests verify route wiring.
- [D3: Cached inventory list still momentarily returns archived items] → Existing 5-minute cache TTL is short; if a freshly-archived item appears in a stale cached list, a subsequent load serves the updated list. Acceptable; could cache-bust explicitly on archive (cache invalidation already runs `delByPrefix(INVENTORY_PREFIX)`).
- [D1: `user.status` untouched on archive] → Archived students keep their approved/pending status in other views. This matches the requirement (archive removes from the active admin table only) and avoids touching the state machine.
- [D4: `alter` used for confirmations] → Matches the existing admin.js interaction style (`updateRegistrationStatus` uses `confirm()`/`alert()`); no modal redesign per the no-UI-redesign constraint.
- [Requests-management page still shows Reject] → Explicitly out of scope (different page); documented in proposal so the "no Reject in Request Management" requirement is scoped to the Pending Registrations table.

## Migration Plan

1. Deploy backend first (models → services → controllers → routes). Existing rows default `isArchived=false`, so active lists are unchanged until an admin archives.
2. Deploy frontend (admin.js, inventory.js) last so buttons only appear once the endpoints exist.
3. Rollback: revert frontend changes (Delete/Reject return) or restore from git; archived rows can be re-listed by clearing `isArchived` in the DB via a one-off script if needed. No destructive data migration is involved.

## Open Questions

- None blocking. (Optional follow-up, out of scope: a "View archived" filter/restore action; not required by this change.)