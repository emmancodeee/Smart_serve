# Update Admin Action Buttons Tasks

## 1. Backend — Data Model

- [x] 1.1 Add `isArchived: { type: Boolean, default: false }` and `archivedAt: { type: Date, default: null }` to `models/Registration.js`
- [x] 1.2 Add `isArchived: { type: Boolean, default: false }` and `archivedAt: { type: Date, default: null }` to `models/Inventory.js`

## 2. Backend — Registration Archive API

- [x] 2.1 Add `archiveRegistration(req)` to `services/adminService.js`: resolve admin (`resolveAuthenticatedAdmin`), block super admin (`isSuperAdminAccount`), find registration (404 if missing), set `isArchived=true`/`archivedAt=now`, save, invalidate `ANALYTICS_PREFIX` + `DASHBOARD_PREFIX` caches, log admin transaction `registration_archived`; do NOT touch the state machine or `user.status`
- [x] 2.2 Export `archiveRegistration` from `services/adminService.js`
- [x] 2.3 Wire `archiveRegistration` in `controllers/adminController.js` following the existing controller pattern
- [x] 2.4 Add `PUT /api/auth/admin/registrations/:id/archive` route in `routes/auth.js`
- [x] 2.5 Update `adminReadService.listRegistrations` to query `Registration.find({ isArchived: { $ne: true } })` (keep populate + sort) and fix the model require path to `models/Registration`

## 3. Backend — Inventory Archive API

- [x] 3.1 Add `archiveInventoryItem(req)` to `services/inventoryService.js`: resolve admin, block super admin, find item (404 if missing, 400 if already archived), set `isArchived=true`/`archivedAt=now`, save, invalidate `INVENTORY_PREFIX` cache, log admin transaction `inventory_archived`
- [x] 3.2 Exclude archived items from `listInventory` (`Inventory.find({ isArchived: { $ne: true } })`)
- [x] 3.3 Exclude archived items from `getInventorySummary` stats
- [x] 3.4 Export `archiveInventoryItem` from `services/inventoryService.js`
- [x] 3.5 Wire `archiveInventoryItem` in `controllers/inventoryController.js`
- [x] 3.6 Add `PUT /api/auth/inventory/:id/archive` route in `routes/auth.js` (keep DELETE `/inventory/:id` for API backward compatibility)

## 4. Frontend — Request Management Buttons

- [x] 4.1 In `public/js/admin.js` `appendRegistrationRow()`: remove the `Reject` button; add an `Archive` button that calls `archiveRegistration(reg._id)` for every registration table (Pending/Approved/Rejected), keeping `Approve` (pending only) and `Set Pending` (approved/rejected) intact; keep `View` and `ORF`
- [x] 4.2 Add `async function archiveRegistration(registrationId)` in `admin.js`: view-only guard (`isSuperAdminViewOnlyMode` → alert + return), `confirm('Are you sure you want to archive this record?')` (cancel aborts), `PUT ${API_BASE}/registrations/:id/archive`, success alert + `await refreshData()`
- [x] 4.3 Confirm no `Remove` or `Reject` button remains anywhere in the Request Management (registrations) toolbar or rows

## 5. Frontend — Inventory Buttons

- [x] 5.1 In `public/js/inventory.js` `displayInventory()`: replace the `Delete` button with an `Archive` button (`data-action="archive-item"` with `data-item-id`), keeping `Edit` (`data-action="edit-item"`) and the super admin view-only label
- [x] 5.2 Add `async function archiveItem(itemId)` in `inventory.js` following the `deleteItem` pattern: super admin guard (toast + return), `confirm('Are you sure you want to archive this record?')` (cancel aborts), `PUT /api/auth/inventory/${itemId}/archive`, success toast + `loadInventory()` + `loadSummary()`
- [x] 5.3 Extend the delegated `[data-action]` click listener (inventory.js:657) to handle `'archive-item'`
- [x] 5.4 Confirm no `Delete` or `Remove` button remains anywhere in the Inventory Management table or toolbar

## 6. Verification

- [x] 6.1 Run `node --check` on edited JS files (`public/js/admin.js`, `public/js/inventory.js`, `services/adminService.js`, `services/inventoryService.js`, `adminReadService.js`, `controllers/*`, `routes/auth.js`)
- [x] 6.2 Run `npm test` and ensure no existing tests break; add or update unit tests for `archiveRegistration` and `archiveInventoryItem` if a test pattern exists for those services
- [ ] 6.3 Manual check — Request Management: pending rows show `[ View ] [ ORF ] [ Approve ] [ Archive ]`; archive prompts "Are you sure you want to archive this record?", confirms archive, removes the row immediately, record still in Mongo with `isArchived: true`; no Reject/Remove button
- [ ] 6.4 Manual check — Inventory: rows show `[ Edit ] [ Archive ]`; archive prompts, confirms, removes the row immediately, record still in Mongo with `isArchived: true`; summary card counts exclude archived items
- [ ] 6.5 Manual check — buttons aligned/visible/no overlap in both tables; super admin view hides archive on both modules