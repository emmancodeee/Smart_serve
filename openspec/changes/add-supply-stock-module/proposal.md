## Why

The current inventory management system allows admins to directly add, update, and delete items, which creates several problems:

1. **No audit trail** — When items are added or removed, there's no record of who did it, when, or why
2. **No supply tracking** — The `lastRestockedAt` field exists in the schema but is never used; there's no way to track when items were restocked
3. **No stock-out logging** — When items are removed (damaged, expired, disposed), there's no record of the reason
4. **Mixed responsibilities** — Inventory management currently handles both monitoring AND modification, making it harder to maintain clean separation of concerns

The solution is to introduce a dedicated **Supply & Stock** module that becomes the single source of truth for all inventory changes, while Inventory Management becomes a read-only monitoring dashboard.

## What Changes

- **Supply In** — New functionality allowing admins to add stock to inventory. Each supply entry records the item name, category, quantity, and optional notes. The system automatically increments the inventory quantity and updates `lastRestockedAt`.

- **Stock Out** — New functionality allowing admins to remove stock from inventory with a predefined reason (Damaged, Expired, Disposed, Manual Adjustment). Each stock-out entry records the inventory item, quantity, reason, and optional notes. The system automatically decrements the inventory quantity.

- **Supply & Stock History** — A combined log view showing all supply-in and stock-out transactions with timestamps, admin names, and details.

- **Inventory Management (Modified)** — Remove all mutation capabilities (add, update, delete). The page becomes a read-only monitoring dashboard showing current stock levels, low stock alerts, and category breakdowns.

- **Removed Endpoints**:
  - `POST /api/auth/inventory/add`
  - `PUT /api/auth/inventory/:id`
  - `DELETE /api/auth/inventory/:id`

- **New Endpoints**:
  - `POST /api/auth/supply` — Add stock to inventory
  - `POST /api/auth/stock-out` — Remove stock from inventory
  - `GET /api/auth/supply` — List supply history
  - `GET /api/auth/stock-out` — List stock out history

- **New Frontend Page** — `admin-supply-stock.html` with tabs for Supply In, Stock Out, and History.

## Capabilities

### New Capabilities
- `supply-stock`: Defines the Supply & Stock module — endpoints, data models, business rules for adding/removing inventory, audit logging, and the admin UI for managing supply transactions.

### Modified Capabilities
- `inventory-management`: Changes from a full CRUD interface to a read-only monitoring dashboard. Removes add/update/delete functionality; keeps list view, analytics summary, and low stock alerts.

## Impact

### Backend Changes
- `models/Inventory.js` — No schema changes (existing fields sufficient)
- `models/Supply.js` — **NEW** — Supply transaction model
- `models/StockOut.js` — **NEW** — Stock-out transaction model
- `services/inventoryService.js` — Remove `addInventoryItem`, `updateInventoryItem`, `deleteInventoryItem` functions
- `services/supplyService.js` — **NEW** — Supply business logic
- `services/stockOutService.js` — **NEW** — Stock-out business logic
- `controllers/inventoryController.js` — Remove add/update/delete handlers; keep list and summary
- `controllers/supplyController.js` — **NEW** — Supply HTTP handlers
- `controllers/stockOutController.js` — **NEW** — Stock-out HTTP handlers
- `routes/auth.js` — Add `/supply` and `/stock-out` routes; remove `/inventory/add`, `/inventory/:id` PUT/DELETE
- `utils/sanitize.js` — Add `sanitizeSupplyInput` and `sanitizeStockOutInput` functions

### Frontend Changes
- `public/admin-supply-stock.html` — **NEW** — Supply & Stock management page
- `public/js/supply-stock.js` — **NEW** — Supply & Stock UI logic
- `public/inventory.html` — Remove add/edit/delete buttons and forms; keep read-only table
- `public/js/inventory.js` — Remove mutation handlers; keep list rendering and filtering
- `public/js/admin.js` — Add sidebar link for Supply & Stock; update navigation

### Cache & Logging
- `services/cacheService.js` — Invalidate inventory cache on supply/stock-out operations
- `services/authSupportService.js` — Log supply and stock-out transactions via `logAdminTransaction`

### Documentation
- `API.md` — Document new endpoints; mark old inventory mutation endpoints as removed
- `MONGODB_ERD.md` — Add Supply and StockOut collections
