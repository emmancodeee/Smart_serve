# Update Admin Action Buttons Proposal

## Why

The Admin Request Management ("Pending Registrations") and Inventory Management tables expose actions (Reject in requests, Delete in inventory) that contradict the intended soft-archive workflow. Admins need a single, consistent way to act on records — approve or archive — without permanently destroying data. Reject and Delete/Remove are removed so records are never destroyed and actions stay coherent across modules.

## What Changes

- **Request Management (Pending Registrations table)** — replace the `Reject` action with `Archive`. Final per-row actions: `[ View ] [ ORF ] [ Approve ] [ Archive ]`. No `Reject`, no `Remove` anywhere in this table.
- **Inventory Management table** — replace the `Delete` action with `Archive`. Final per-row actions: `[ Edit ] [ Archive ]`. No `Delete`, no `Remove` anywhere in this table.
- **Archive is a real, functional soft-archive** in both modules:
  - Confirmation prompt: "Are you sure you want to archive this record?"
  - Only the selected record is archived; it is **not** permanently deleted.
  - The record is marked with the existing soft-archive mechanism (`isArchived` + `archivedAt`, the same pattern already used by the Feedback module) on the existing `Registration` and `Inventory` documents.
  - The record disappears from the active table immediately (table refresh).
- **View, ORF, and Approve (requests) and Edit (inventory) remain fully functional.**
- **UI is not redesigned** — sidebar, header, colors, typography, table design, spacing, and button styling are untouched. Only the Actions column buttons and their behavior change; buttons stay aligned, visible, and non-overlapping.
- **Scope**: the Admin dashboard Request Management view (`/admin/registrations`, rendered by `public/js/admin.js`) and the Inventory Management page (`/inventory`, `public/js/inventory.js`). The separate Uniform Request Management page (`public/admin-requests.html`) is out of scope because it uses a different table/action set (no View/ORF).

## Capabilities

### New Capabilities

- `admin-record-actions`: Defines the approved action sets and the soft-archive behavior for Admin Request Management (Pending Registrations) and Inventory Management tables — View/ORF/Approve/Archive for requests, Edit/Archive for inventory, with Reject/Delete/Remove permanently absent and archive operating as a non-destructive soft-delete using the existing `isArchived`/`archivedAt` mechanism.

### Modified Capabilities

<!-- None: no existing spec covers admin request/inventory action buttons -->

## Impact

- **Frontend**
  - `public/js/admin.js` — `appendRegistrationRow()` (line ~2414): replace Reject button with Archive; add `archiveRegistration()` handler; keep View/ORF/Approve.
  - `public/js/inventory.js` — row actions (line ~591): replace Delete with Archive; add `archiveItem()` handler; keep Edit.
- **Backend**
  - `models/Registration.js` — add `isArchived`, `archivedAt` (soft-archive fields).
  - `models/Inventory.js` — add `isArchived`, `archivedAt`.
  - `services/adminService.js` — add `archiveRegistration()` (reuses `resolveAuthenticatedAdmin`, super admin guard, tx logging, cache invalidation).
  - `services/inventoryService.js` — add `archiveInventoryItem()`; exclude archived items from `listInventory` and `getInventorySummary`.
  - `adminReadService.js` — `listRegistrations` excludes archived registrations.
  - `controllers/adminController.js`, `controllers/inventoryController.js` — wire archive handlers.
  - `routes/auth.js` — add `PUT /admin/registrations/:id/archive` and `PUT /inventory/:id/archive`.
  - `services/stateMachineService.js` — no change: archive is orthogonal to the registration state machine and is not a status transition.
- **No new collections, no new databases.** Existing data models, API base paths, state management, and cache keys are reused.