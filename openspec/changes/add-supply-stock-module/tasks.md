## 1. Models

- [x] 1.1 Create `models/Supply.js` — Mongoose schema with `itemName` (String, required), `category` (String, required), `quantity` (Number, min 1, required), `notes` (String), `suppliedBy` (ObjectId ref 'Admin', required), timestamps enabled; add index on `createdAt: -1`
- [x] 1.2 Create `models/StockOut.js` — Mongoose schema with `inventoryId` (ObjectId ref 'Inventory', required), `itemName` (String, required), `category` (String, required), `quantity` (Number, min 1, required), `reason` (String, enum: ['Damaged', 'Expired', 'Disposed', 'Manual Adjustment'], required), `notes` (String), `removedBy` (ObjectId ref 'Admin', required), timestamps enabled; add index on `createdAt: -1`

## 2. Sanitization

- [x] 2.1 Add `sanitizeSupplyInput(data)` to `utils/sanitize.js` — validate and sanitize `itemName` (required, non-empty string), `category` (required, non-empty string), `quantity` (required, number ≥ 1), `notes` (optional string, trimmed); return `{ sanitized, errors }`
- [x] 2.2 Add `sanitizeStockOutInput(data)` to `utils/sanitize.js` — validate and sanitize `inventoryId` (required, non-empty string), `quantity` (required, number ≥ 1), `reason` (required, one of enum values), `notes` (optional string, trimmed); return `{ sanitized, errors }`
- [x] 2.3 Export both new sanitizers from `utils/sanitize.js`

## 3. Services

- [x] 3.1 Create `services/supplyService.js` with `addSupply(req)` function: authenticate admin via `authenticateAdminRequest`, sanitize input via `sanitizeSupplyInput`, check if inventory item exists (case-insensitive match on `itemName` + `category` using `Inventory.findOne` with regex), if exists: `Inventory.findByIdAndUpdate` with `$inc: { quantity }` and `$set: { lastRestockedAt: new Date(), updatedAt: new Date() }`, if not: create new `Inventory` document with defaults, create `Supply` record with `suppliedBy: admin._id`, invalidate cache via `cache.delByPrefix(CACHE_KEYS.INVENTORY_PREFIX)`, log transaction via `logAdminTransaction(admin, 'inventory_supplied', 'supply', supply._id, ...)`, return success
- [x] 3.2 Create `services/supplyService.js` with `listSupply(req)` function: authenticate admin, find all Supply records sorted `createdAt: -1`, populate `suppliedBy` with `name` field, return array
- [x] 3.3 Create `services/stockOutService.js` with `removeStock(req)` function: authenticate admin via `authenticateAdminRequest`, sanitize input via `sanitizeStockOutInput`, find inventory item by `inventoryId`, return 404 if not found, validate `quantity ≤ item.quantity` (return 400 "Insufficient stock" if not), `Inventory.findByIdAndUpdate` with `$inc: { quantity: -quantity }` and `$set: { updatedAt: new Date() }`, create `StockOut` record with `removedBy: admin._id`, snapshot `itemName` and `category` from the found item, invalidate cache, log transaction via `logAdminTransaction(admin, 'inventory_stocked_out', 'stockout', stockOut._id, ...)`, return success
- [x] 3.4 Create `services/stockOutService.js` with `listStockOut(req)` function: authenticate admin, find all StockOut records sorted `createdAt: -1`, populate `removedBy` with `name` field, return array

## 4. Controllers

- [x] 4.1 Create `controllers/supplyController.js` with `addSupply(req, res)` and `listSupply(req, res)` handlers following the `sendResult` pattern from `inventoryController.js`
- [x] 4.2 Create `controllers/stockOutController.js` with `removeStock(req, res)` and `listStockOut(req, res)` handlers following the `sendResult` pattern from `inventoryController.js`

## 5. Routes

- [x] 5.1 In `routes/auth.js`, import `supplyController` and `stockOutController`; add to `inventoryRouter`: `inventoryRouter.route('/supply').get(supplyController.listSupply).post(supplyController.addSupply)` and `inventoryRouter.route('/stock-out').get(stockOutController.listStockOut).post(stockOutController.removeStock)`
- [x] 5.2 In `routes/auth.js`, remove `POST /add` route (line 104) and `PUT`/`DELETE` on `/:id` (lines 107-108) from `inventoryRouter`

## 6. Frontend — Supply & Stock Page

- [x] 6.1 Create `public/admin-supply-stock.html` — clone sidebar structure from `inventory.html`, update sidebar active link, add new "Supply & Stock" nav link, set page title to "Supply & Stock | Admin Dashboard", include header with title "Supply & Stock" and subtitle, create three tab buttons (Supply In, Stock Out, History), create tab content panels with forms and history table, include `<script>` tags for `admin-filters.js` and new `supply-stock.js`
- [x] 6.2 Create `public/js/supply-stock.js` — implement auth check (same pattern as `inventory.js`), tab switching logic, Supply In form submission (POST to `/api/auth/supply`), Stock Out form submission (POST to `/api/auth/stock-out` with inventory item dropdown populated from `GET /api/auth/inventory`), History table loading (fetch from `GET /api/auth/supply` and `GET /api/auth/stock-out`, merge and sort by date), SmartFilter integration for history (search, filter by type/category/date, sort, pagination, CSV export), toast notifications, form validation (client-side quantity checks), loading states

## 7. Frontend — Inventory Page Modifications

- [x] 7.1 In `public/inventory.html`: remove the "Add Item" button (`#openAddModalBtn`), remove the Add Item Modal (`#addItemModal` block, lines 170-215), remove the Edit Modal (`#editModal` block, lines 217-277), remove the "Actions" `<th>` from table header (line 139), add "Supply & Stock" link to sidebar (after Inventory Management link)
- [x] 7.2 In `public/js/inventory.js`: remove `handleAddItem`, `openAddModal`, `closeAddModal`, `editItem`, `closeEditModal`, `handleEditItem`, `deleteItem` functions; remove event listeners for add/edit/delete forms and modal overlay clicks; remove `setButtonLoading` function; in `displayInventory` function, remove the Actions `<td>` and the edit/delete buttons from the row template (remove the `isCurrentSuperAdmin()` conditional — just render no actions column)
- [x] 7.3 In `public/inventory.html` sidebar, add "Supply & Stock" nav link after the Inventory Management link: `<li><a href="/admin/supply-stock" class="admin-nav-link flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent px-5 py-4 text-[0.96rem] font-semibold text-white transition duration-200 hover:translate-x-1 hover:border-yellow-300 hover:bg-yellow-400/15 hover:shadow-lg"><span class="admin-nav-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 3h5v5"></path><path d="M8 3H3v5"></path><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path><path d="m15 9 6-6"></path></svg></span><span>Supply & Stock</span></a></li>`

## 8. Server Route

- [x] 8.1 In `server.js`, add route: `app.get('/admin/supply-stock', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'admin-supply-stock.html')); });` — place after the existing `/admin/returns` route (line 293)

## 9. Verification

- [x] 9.1 Run `node --check` on all modified/created JS files: `models/Supply.js`, `models/StockOut.js`, `utils/sanitize.js`, `services/supplyService.js`, `services/stockOutService.js`, `controllers/supplyController.js`, `controllers/stockOutController.js`, `routes/auth.js`, `server.js`, `public/js/inventory.js`, `public/js/supply-stock.js`
- [ ] 9.2 Manual browser verification: (a) Supply In tab — fill form, submit, verify inventory updated and Supply record created; (b) Stock Out tab — select item, enter quantity/reason, submit, verify inventory decremented and StockOut record created; (c) History tab — verify combined records shown with correct type, item, quantity, reason, admin, date; (d) Inventory page — verify no add/edit/delete controls, read-only table displays correctly; (e) Sidebar — verify "Supply & Stock" link appears on inventory and supply-stock pages
