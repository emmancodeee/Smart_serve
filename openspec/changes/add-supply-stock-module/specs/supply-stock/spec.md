## ADDED Requirements

### Requirement: Supply In API Endpoint
The system SHALL provide a `POST /api/auth/supply` endpoint that accepts `itemName` (required), `category` (required), `quantity` (required, min 1), and `notes` (optional), authenticated via admin JWT. When the supplied item already exists in inventory (matched by case-insensitive `itemName` + `category`), the system SHALL increment the existing item's `quantity` and set `lastRestockedAt` to the current timestamp. When the item does not exist, the system SHALL create a new Inventory document with the supplied quantity, default `reorderLevel` of 10, and default `unitOfMeasure` of 'pcs'. The system SHALL also create a Supply transaction record and invalidate the inventory cache.

#### Scenario: Supply existing item
- **WHEN** an admin supplies an item whose `itemName` and `category` match an existing inventory item
- **THEN** the existing item's `quantity` is incremented by the supplied amount, `lastRestockedAt` is set to now, and a Supply record is created

#### Scenario: Supply new item
- **WHEN** an admin supplies an item whose `itemName` + `category` does not match any existing inventory item
- **THEN** a new Inventory document is created with the supplied quantity, `reorderLevel` 10, `unitOfMeasure` 'pcs', and a Supply record is created

#### Scenario: Invalid supply data
- **WHEN** an admin submits a supply request with missing `itemName`, missing `category`, `quantity` < 1, or a non-numeric `quantity`
- **THEN** the system returns a 400 error with a descriptive message

### Requirement: Supply In UI Form
The Supply In tab SHALL provide a form with fields for Item Name (text input, required), Category (dropdown: Books, Uniforms, Modules, Electronics, Stationery, Other — required), Quantity (number input, min 1, required), and Notes (textarea, optional). The form SHALL display validation errors inline. On successful submission, the form SHALL clear and show a success toast.

#### Scenario: Successful supply submission
- **WHEN** the admin fills in item name, category, and quantity and submits
- **THEN** a success toast appears, the form clears, and the history tab is updated

#### Scenario: Validation error
- **WHEN** the admin submits with missing required fields or invalid quantity
- **THEN** an error message appears near the relevant field or as a toast

### Requirement: Stock Out API Endpoint
The system SHALL provide a `POST /api/auth/stock-out` endpoint that accepts `inventoryId` (required), `quantity` (required, min 1), `reason` (required, one of: Damaged, Expired, Disposed, Manual Adjustment), and `notes` (optional), authenticated via admin JWT. The system SHALL verify the referenced inventory item exists and that the requested quantity does not exceed the current stock. On success, the system SHALL decrement the item's `quantity`, create a StockOut transaction record (with snapshot of `itemName` and `category`), and invalidate the inventory cache.

#### Scenario: Successful stock-out
- **WHEN** an admin removes stock with valid `inventoryId`, `quantity` ≤ available stock, and valid `reason`
- **THEN** the inventory item's `quantity` is decremented, a StockOut record is created, and the cache is invalidated

#### Scenario: Insufficient stock
- **WHEN** an admin requests a stock-out with `quantity` greater than the item's current `quantity`
- **THEN** the system returns a 400 error with "Insufficient stock" message

#### Scenario: Invalid inventory item
- **WHEN** an admin submits a stock-out with a non-existent `inventoryId`
- **THEN** the system returns a 404 error with "Inventory item not found" message

#### Scenario: Invalid stock-out data
- **WHEN** an admin submits with missing `inventoryId`, `quantity` < 1, missing `reason`, or invalid `reason` value
- **THEN** the system returns a 400 error with a descriptive message

### Requirement: Stock Out UI Form
The Stock Out tab SHALL provide a form with fields for Inventory Item (dropdown populated from `GET /api/auth/inventory`, showing item name and current quantity, required), Quantity (number input, min 1, max = selected item's current quantity, required), Reason (dropdown: Damaged, Expired, Disposed, Manual Adjustment — required), and Notes (textarea, optional). The form SHALL show the selected item's current stock level. On successful submission, the form SHALL clear and show a success toast.

#### Scenario: Successful stock-out submission
- **WHEN** the admin selects an item, enters valid quantity and reason, and submits
- **THEN** a success toast appears, the form clears, and the history tab is updated

#### Scenario: Quantity exceeds available stock
- **WHEN** the admin enters a quantity greater than the selected item's current stock
- **THEN** the form shows an error message and prevents submission

### Requirement: Supply History List API
The system SHALL provide a `GET /api/auth/supply` endpoint that returns all Supply records sorted by `createdAt` descending, authenticated via admin JWT. Each record SHALL include `itemName`, `category`, `quantity`, `notes`, `suppliedBy` (admin name), and `createdAt`.

#### Scenario: Supply records exist
- **WHEN** an admin requests the supply history
- **THEN** the system returns an array of Supply records sorted newest-first

#### Scenario: No supply records
- **WHEN** no Supply records exist
- **THEN** the system returns an empty array

### Requirement: Stock Out History List API
The system SHALL provide a `GET /api/auth/stock-out` endpoint that returns all StockOut records sorted by `createdAt` descending, authenticated via admin JWT. Each record SHALL include `inventoryId`, `itemName`, `category`, `quantity`, `reason`, `notes`, `removedBy` (admin name), and `createdAt`.

#### Scenario: Stock-out records exist
- **WHEN** an admin requests the stock-out history
- **THEN** the system returns an array of StockOut records sorted newest-first

#### Scenario: No stock-out records
- **WHEN** no StockOut records exist
- **THEN** the system returns an empty array

### Requirement: Combined History View
The History tab SHALL display a unified table of all Supply In and Stock Out transactions, sorted by date descending (newest first). Each row SHALL show: Type (Supply In / Stock Out, color-coded green / red), Item Name, Category, Quantity (+ for supply, - for stock out), Reason (stock out only, blank for supply), Admin Name, and Date/Time. The table SHALL support search, filter (by type, category, date range), sort, pagination, and CSV export via SmartFilter.

#### Scenario: History with mixed records
- **WHEN** both supply and stock-out records exist
- **THEN** the table shows all records sorted newest-first with type indicators

#### Scenario: Empty history
- **WHEN** no supply or stock-out records exist
- **THEN** the table shows "No supply or stock-out records found"

### Requirement: Inventory Read-Only Mode
The inventory management page (`/inventory`) SHALL be read-only. The "Add Item" button, Add Item Modal, Edit Modal, and per-row Edit/Delete action buttons SHALL be removed. The table SHALL display Item Name, Category, Quantity, Status, and Last Updated columns only (no Actions column). All filtering, sorting, pagination, CSV export, and summary card functionality SHALL remain unchanged.

#### Scenario: Admin views inventory
- **WHEN** an admin navigates to `/inventory`
- **THEN** they see the inventory table with stock levels and status, with no add/edit/delete controls

### Requirement: Supply & Stock Navigation Link
A "Supply & Stock" link SHALL appear in the sidebar navigation of the inventory page and the supply-stock page, positioned after the "Inventory Management" link. The link SHALL navigate to `/admin/supply-stock`.

#### Scenario: Sidebar visibility
- **WHEN** an admin views the inventory page or supply-stock page
- **THEN** the sidebar shows a "Supply & Stock" link that navigates to the supply-stock page

### Requirement: Super Admin Access to Supply & Stock
All admin accounts, including super admins, SHALL have full access to the Supply & Stock module (add supply, remove stock, view history). The super admin read-only restriction that exists on the inventory page SHALL NOT apply to Supply & Stock.

#### Scenario: Super admin uses Supply & Stock
- **WHEN** a super admin navigates to Supply & Stock
- **THEN** they can add supply and remove stock without restrictions

## MODIFIED Requirements

### Requirement: Inventory Mutation Endpoints Removed
The following endpoints SHALL be removed and return 404 if called:
- `POST /api/auth/inventory/add`
- `PUT /api/auth/inventory/:id`
- `DELETE /api/auth/inventory/:id`

The following endpoints SHALL remain:
- `GET /api/auth/inventory` — list inventory items (read-only)
- `GET /api/auth/inventory/analytics/summary` — inventory summary stats

#### Scenario: Removed endpoint called
- **WHEN** a client calls `POST /api/auth/inventory/add`, `PUT /api/auth/inventory/:id`, or `DELETE /api/auth/inventory/:id`
- **THEN** the system returns a 404 response

#### Scenario: Existing endpoints still work
- **WHEN** a client calls `GET /api/auth/inventory` or `GET /api/auth/inventory/analytics/summary`
- **THEN** the system returns the expected data as before
