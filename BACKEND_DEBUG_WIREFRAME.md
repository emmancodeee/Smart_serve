# Backend Debug Wireframe

This document maps the live backend flow for debugging during capstone demos, testing, and defense.

## Runtime Flow

```text
Browser / Frontend JS
        ->
Express entry: server.js
        ->
Mounted route files
        ->
Controller layer
        ->
Service / utility layer
        ->
Mongoose models
        ->
MongoDB (PhinmaServeDB)
```

## Live Route Mounts

Defined in [server.js](c:\New folder\server.js#L85).

```text
/api/auth                  -> routes/auth.js
/api/auth/schedule         -> routes/schedule.js
/api/schedule              -> routes/schedule.js

Page routes:
/                        -> public/index.html
/register                -> public/register.html
/admin                   -> public/admin.html
/dashboard               -> public/dashboard.html
/profile                 -> public/profile.html
/inventory               -> public/inventory.html
/schedule                -> public/schedule.html
```

## Frontend Mapping

### Page Routes To HTML

```text
/           -> public/index.html
/register   -> public/register.html
/admin      -> public/admin.html
/dashboard  -> public/dashboard.html
/profile    -> public/profile.html
/inventory  -> public/inventory.html
/schedule   -> public/schedule.html
```

### Frontend Scripts To API Endpoints

```text
public/js/app.js
  -> POST /api/auth/login
  -> POST /api/auth/forgot-password
  -> POST /api/auth/reset-password

public/js/register.js
  -> POST /api/auth/send-verification
  -> POST /api/auth/register

public/js/profile.js
  -> GET /api/auth/me
  -> PUT /api/auth/change-password
  -> PUT /api/auth/update-profile

public/js/inventory.js
  -> GET /api/auth/inventory
  -> GET /api/auth/inventory/analytics/summary
  -> POST /api/auth/inventory/add
  -> PUT /api/auth/inventory/:id
  -> DELETE /api/auth/inventory/:id

public/js/schedule.js
  -> GET /api/auth/me
  -> GET /api/auth/schedule
  -> GET /api/auth/schedule/analytics/summary
  -> POST /api/auth/schedule/check-conflicts
  -> POST /api/auth/schedule/add
  -> PUT /api/auth/schedule/:id
  -> DELETE /api/auth/schedule/:id

public/js/dashboard.js
  -> GET /api/auth/me
  -> GET /api/auth/schedule
  -> POST /api/auth/extract-orf
  -> PUT /api/auth/update-profile

public/js/admin.js
  -> GET /api/auth/me
  -> GET/POST/DELETE /api/auth/admin/...
  -> GET/POST/PUT/DELETE /api/auth/inventory...

  -> GET /api/auth/me
  -> GET /api/auth/admin/users
  -> GET /api/auth/admin/registrations
  -> GET /api/auth/admin/users/:id
```

### Mapping Rule

```text
No /api prefix    -> HTML page route
/api/... prefix   -> JSON backend route
```

## Route Wireframe

### 1. Auth / User / Admin / Inventory

Live file: [routes/auth.js](c:\New folder\routes\auth.js)

```text
/api/auth/send-verification              POST   -> authController.sendVerificationCode
/api/auth/forgot-password                POST   -> authController.forgotPassword
/api/auth/extract-orf                    POST   -> authController.extractOrf
/api/auth/reset-password                 POST   -> authController.resetPassword
/api/auth/register                       POST   -> authController.register
/api/auth/login                          POST   -> authController.login
/api/auth/me                             GET    -> authController.me
/api/auth/update-profile                 PUT    -> authController.updateProfile
/api/auth/change-password                PUT    -> authController.changePassword

/api/auth/admin/users                    GET    -> adminController.listUsers
/api/auth/admin/admins                   POST   -> adminController.createAdmin
/api/auth/admin/admins                   GET    -> adminController.listAdmins
/api/auth/admin/admins/:id               DELETE -> adminController.deleteAdmin
/api/auth/admin/registrations            GET    -> adminController.listRegistrations
/api/auth/admin/transactions             GET    -> adminController.listTransactions
/api/auth/admin/pickup-notifications     GET    -> adminController.listPickupNotifications
/api/auth/admin/pickup-confirmations     GET    -> adminController.listPickupConfirmations
/api/auth/admin/pickup-confirmations/:id PUT    -> adminController.applyPickupConfirmation
/api/auth/admin/registrations/:id/status PUT    -> adminController.updateRegistrationStatus
/api/auth/admin/users/:id                GET    -> adminController.getUserDetails
/api/auth/admin/users/:id                DELETE -> adminController.deleteUser

/api/auth/inventory                      GET    -> inventoryController.listInventory
/api/auth/inventory/add                  POST   -> inventoryController.addInventoryItem
/api/auth/inventory/:id                  PUT    -> inventoryController.updateInventoryItem
/api/auth/inventory/:id                  DELETE -> inventoryController.deleteInventoryItem
/api/auth/inventory/analytics/summary    GET    -> inventoryController.getInventorySummary
```

### 2. Schedule

Live route file: [routes/schedule.js](c:\New folder\routes\schedule.js#L1)

```text
/api/auth/schedule                      GET
/api/auth/schedule/analytics/summary    GET
/api/auth/schedule/check-conflicts      POST
/api/auth/schedule/add                  POST
/api/auth/schedule/:id                  PUT
/api/auth/schedule/:id                  DELETE

/api/schedule                           GET
/api/schedule/analytics/summary         GET
/api/schedule/check-conflicts           POST
/api/schedule/add                       POST
/api/schedule/:id                       PUT
/api/schedule/:id                       DELETE
```

## Layered Backend Flow

```text
routes/auth.js
        ->
middlewares/authenticateUser.js
middlewares/authenticateAdmin.js
middlewares/orfUpload.js
        ->
controllers/authController.js
controllers/adminController.js
controllers/inventoryController.js
        ->
services/authService.js
services/adminService.js
services/inventoryService.js
services/authSupportService.js
services/orfService.js
        ->
models/User.js
models/Admin.js
models/Registration.js
models/Schedule.js
models/Inventory.js
models/Transaction.js
models/AuthCode.js

routes/schedule.js
        ->
middlewares/authenticateScheduleUser.js
        ->
controllers/scheduleController.js
        ->
services/scheduleService.js
        ->
models/Schedule.js
models/Registration.js
utils/scheduler.js
```

## Database Wireframe

MongoDB connection:

```text
Database name: PhinmaServeDB
Connection source: MONGO_URI or mongodb://127.0.0.1:27017/PhinmaServeDB
```

## Final Debug Note

For debugging, start at `server.js`, then trace the mounted route file, controller, service, and model used by that endpoint. The live backend now uses `routes/auth.js`, `routes/schedule.js`, `middlewares/authenticateUser.js`, `middlewares/authenticateAdmin.js`, `middlewares/authenticateScheduleUser.js`, `middlewares/orfUpload.js`, `middlewares/notFound.js`, and `middlewares/errorHandler.js` as its active route and middleware entry files.
