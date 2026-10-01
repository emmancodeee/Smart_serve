## Context

The current inventory system (`models/Inventory.js`, `services/inventoryService.js`, `controllers/inventoryController.js`, `routes/auth.js:102-108`) supports full CRUD: admins can add, update, and delete inventory items directly. Super admins are restricted to read-only (403 on mutations). The inventory page (`public/inventory.html` + `public/js/inventory.js`) has "Add Item" button, edit/delete action buttons per row, and two modals (add/edit).

Problems with the current approach:
- No audit trail for who added/removed items and why
- The `lastRestockedAt` field on `Inventory` schema (line 27) is never set by any code path
- No way to track stock-out reasons (damaged, expired, disposed)
- Inventory management mixes monitoring with mutation

There is no existing supply or stock-out module. The registration allocation system (`services/registrationInventoryService.js`) decrements inventory on approval and restores on return confirmation, but this is automatic — not manual supply/stock management.

## Goals / Non-Goals

**Goals:**
- Create a new Supply & Stock module that becomes the sole mechanism for manually adding and removing inventory
- Supply In: admin enters item name, category, quantity, optional notes → system creates/updates inventory item + logs the transaction
- Stock Out: admin selects an existing inventory item, enters quantity and reason (Damaged/Expired/Disposed/Manual Adjustment) + optional notes → system decrements inventory + logs the transaction
- History view showing all supply and stock-out transactions
- Convert inventory management page to read-only monitoring (remove add/edit/delete)
- Maintain existing automatic allocation/restore behavior for registrations and returns

**Non-Goals:**
- No changes to automatic inventory allocation (`allocateInventoryForRegistration`) or restoration (`restoreInventoryAllocations`)
- No changes to the registration or return workflows
- No supplier name, PO number, or unit cost tracking (simple supply model)
- No changes to the dashboard analytics or sidebar layout beyond adding one new nav link

## Decisions

### D1: Two new Mongoose models — `Supply` and `StockOut`

Rather than a single `StockMovement` model with a type field, use two separate models. This keeps each model's schema clean and purpose-specific, matches the existing codebase pattern (separate models per entity), and makes query/index optimization straightforward.

**Supply model** (`models/Supply.js`):
```
itemName: String (required)
category: String (required)
quantity: Number (min: 1, required)
notes: String (optional)
suppliedBy: ObjectId ref Admin (required, from JWT)
timestamps: true
```

**StockOut model** (`models/StockOut.js`):
```
inventoryId: ObjectId ref Inventory (required)
itemName: String (required, snapshot)
category: String (required, snapshot)
quantity: Number (min: 1, required)
reason: String enum [Damaged, Expired, Disposed, Manual Adjustment] (required)
notes: String (optional)
removedBy: ObjectId ref Admin (required, from JWT)
timestamps: true
```

Why snapshot `itemName`/`category` on StockOut: if the inventory item is later deleted (which won't happen now, but defensively), the stock-out record remains meaningful.

### D2: Supply In creates or updates existing inventory items

When an admin supplies an item, the service checks if an inventory item with the same `itemName` (case-insensitive) and `category` already exists:
- **Exists**: increment `quantity`, set `lastRestockedAt = new Date()`, update `updatedAt`
- **Does not exist**: create a new Inventory document with the supplied quantity, default `reorderLevel` of 10, `unitOfMeasure` of 'pcs'

This avoids duplicate inventory entries for the same item and ensures `lastRestockedAt` is finally used meaningfully.

### D3: Stock Out decrements with validation

Stock-out validation:
- `inventoryId` must reference an existing inventory item
- Requested `quantity` must be ≤ current `item.quantity` (return 400 with "Insufficient stock" if not)
- After decrement, if `quantity` reaches 0, the item stays in the database (no auto-delete)

### D4: Cache invalidation follows existing pattern

Both Supply and StockOut services will call `cache.delByPrefix(CACHE_KEYS.INVENTORY_PREFIX)` after successful mutations, matching the existing pattern in `inventoryService.js:48,73,91`. The `INVENTORY_LIST` and `INVENTORY_SUMMARY` keys both start with `inventory:` so they are both invalidated.

### D5: Transaction logging via existing `logAdminTransaction`

Both services will log via `logAdminTransaction` from `services/authSupportService.js`:
- Supply: action `inventory_supplied`, entity type `supply`, entity id = new Supply `_id`
- Stock-out: action `inventory_stocked_out`, entity type `stockout`, entity id = new StockOut `_id`

### D6: Routes added to the existing `inventoryRouter` in `auth.js`

Add supply and stock-out routes to the same `inventoryRouter` (already behind `authenticateAdmin`):
```
inventoryRouter.route('/supply').get(supplyController.listSupply).post(supplyController.addSupply);
inventoryRouter.route('/stock-out').get(stockOutController.listStockOut).post(supplyController.removeStock); // or stockOutController
```

Remove mutation routes:
```
DELETE inventoryRouter.route('/add')         // remove POST
DELETE inventoryRouter.route('/:id')         // remove PUT and DELETE
```

### D7: Super admin restriction lifted for Supply & Stock

The current inventory mutations block super admins (403). For Supply & Stock, **all admins including super admins** can add supply and remove stock. This makes operational sense — supply/stock management is an active operational task, not an account-management-only function.

### D8: Frontend — new `admin-supply-stock.html` page with 3 tabs

The new page follows the existing admin page layout pattern (sidebar, header, main content area):
- **Tab 1: Supply In** — form with item name (text), category (dropdown: Books/Uniforms/Modules/Electronics/Stationery/Other), quantity (number), notes (textarea, optional)
- **Tab 2: Stock Out** — form with inventory item (dropdown populated from `GET /api/auth/inventory`), quantity (number, max = item.quantity), reason (dropdown: Damaged/Expired/Disposed/Manual Adjustment), notes (textarea, optional)
- **Tab 3: History** — combined table of Supply and Stock Out records, newest first, with SmartFilter for search/filter/sort/pagination/CSV export

Server route: `app.get('/admin/supply-stock', ...)` → serves `admin-supply-stock.html`.

### D9: Inventory page modifications

Remove from `inventory.html`:
- The "Add Item" button (`#openAddModalBtn`, line 124-128)
- The Add Item Modal (`#addItemModal`, lines 170-215)
- The Edit Modal (`#editModal`, lines 217-277)
- The "Actions" column header and cells in the table

Remove from `inventory.js`:
- `handleAddItem` function (line 627-668)
- `editItem` / `closeEditModal` / `handleEditItem` functions (lines 670-737)
- `deleteItem` function (lines 739-764)
- `openAddModal` / `closeAddModal` functions (lines 561-567)
- Event listeners for add/edit/delete (lines 573-576, 578-580, 599-614, 617-622)
- `setButtonLoading` function (only used by add/edit — can be removed)

Keep in `inventory.js`:
- Auth check, sidebar, clock, filter, pagination, sort, display, summary loading
- The `displayInventory` function but remove the Actions `<td>` from the row template

### D10: Sidebar link addition

Add a new `<li>` in the sidebar of `inventory.html` (and `admin-supply-stock.html`) for "Supply & Stock" with a link to `/admin/supply-stock`, placed between the Inventory Management link and the closing `</ul>`.

The sidebar is duplicated across `inventory.html` and `admin-supply-stock.html` (not a shared component — this is the existing pattern). Both sidebars get the new link.

## Risks / Trade-offs

- [Duplicate sidebar markup across pages] → This is the existing pattern (inventory.html, admin-returns.html, admin-feedback.html all have their own sidebar copy). Not ideal, but consistent with the codebase. A shared component refactor is out of scope.
- [Supply creating new items vs. requiring pre-existing items] → Chosen: supply can create new items. This is simpler for admins and matches real-world supply workflows where new items arrive. Alternative (supply only to existing items) would require a separate "create item" step.
- [Race condition on stock-out quantity check] → Low risk in practice (single-server, admin-only, low concurrency). The existing inventory allocation system has the same pattern. Could add MongoDB `$inc` with condition in the future if needed.
- [Category enum duplication] → The category list (Books, Uniforms, Modules, Electronics, Stationery, Other) is hardcoded in the inventory model's seed, the add form, the filter config, and now the supply form. Extracting to a shared constant is possible but out of scope for this change.

## Migration Plan

1. Create `models/Supply.js` and `models/StockOut.js`
2. Create `services/supplyService.js` and `services/stockOutService.js`
3. Create `controllers/supplyController.js` and `controllers/stockOutController.js`
4. Add `sanitizeSupplyInput` and `sanitizeStockOutInput` to `utils/sanitize.js`
5. Update `routes/auth.js` — add supply/stock-out routes, remove inventory mutation routes
6. Create `public/admin-supply-stock.html` and `public/js/supply-stock.js`
7. Update `server.js` — add route for `/admin/supply-stock`
8. Modify `public/inventory.html` — remove modals, add button, actions column; add sidebar link
9. Modify `public/js/inventory.js` — remove CRUD handlers and event listeners
10. Update sidebar in `public/inventory.html` and all admin pages with the new Supply & Stock link
11. Run `node --check` on modified JS files; manual browser verification

## Open Questions

- None blocking. All design decisions are grounded in the existing codebase patterns and the user's requirements.
