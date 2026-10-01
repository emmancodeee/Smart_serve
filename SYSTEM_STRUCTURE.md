# System File Structure Wireframe

This project is a Node.js + Express + MongoDB web application with a static frontend served from `public/`.

## High-Level Architecture

```text
Client (HTML/CSS/JS in public/)
        ->
Express Server (server.js)
        ->
Route Layer (routes/)
        ->
Controller Layer (controllers/)
        ->
Service Layer (services/)
        ->
Middleware / Utilities (middlewares/, utils/)
        ->
Data Layer (models/ with Mongoose)
        ->
MongoDB
```

## Data Model

The MongoDB logical ERD is documented in `MONGODB_ERD.md`.

## Folder Wireframe

```text
login-app/
|-- .github/
|   `-- copilot-instructions.md
|
|-- .vscode/
|   `-- tasks.json
|
|-- controllers/
|   |-- adminController.js
|   |-- authController.js
|   |-- inventoryController.js
|   `-- scheduleController.js
|
|-- middlewares/
|   |-- authenticateAdmin.js
|   |-- authenticateScheduleUser.js
|   |-- authenticateUser.js
|   |-- errorHandler.js
|   |-- notFound.js
|   `-- orfUpload.js
|
|-- models/
|   |-- Admin.js
|   |-- AuthCode.js
|   |-- Inventory.js
|   |-- Registration.js
|   |-- Schedule.js
|   |-- Transaction.js
|   `-- User.js
|
|-- public/
|   |-- admin.html
|   |-- dashboard.html
|   |-- index.html
|   |-- inventory.html
|   |-- profile.html
|   |-- register.html
|   |-- schedule.html
|   |
|   |-- css/
|   |   |-- admin.css
|   |   |-- dashboard.css
|   |   |-- inventory.css
|   |   |-- schedule.css
|   |   |-- style.css
|   |   |-- tailwind-input.css
|   |   `-- tailwind.css
|   |
|   |-- images/
|   |   |-- dfd-level1.jpg
|   |   |-- dfd-system.jpg
|   |   |-- erd-system.jpg
|   |   |-- login-bg.jpg
|   |   |-- login-bg-2.jpg
|   |   `-- login-bg-3.jpg
|   |
|   `-- js/
|       |-- admin.js
|       |-- app.js
|       |-- dashboard.js
|       |-- inventory.js
|       |-- login-bg-rotate.js
|       |-- profile.js
|       |-- register.js
|       `-- schedule.js
|
|-- routes/
|   |-- auth.js
|   `-- schedule.js
|
|-- scripts/
|
|-- services/
|   |-- adminService.js
|   |-- authService.js
|   |-- authSupportService.js
|   |-- inventoryService.js
|   |-- orfService.js
|   `-- scheduleService.js
|
|-- utils/
|   |-- sanitize.js
|   `-- scheduler.js
|
|-- .env
|-- .gitignore
|-- eng.traineddata
|-- package-lock.json
|-- package.json
|-- server.js
|-- setup-admins.js
|-- setup-env.js
`-- tailwind.config.js
```

## Responsibility By Folder

- `server.js`
  Main application entry point. Starts Express, connects MongoDB, applies middleware, serves static files, and mounts API routes.

- `routes/`
  Live endpoint declarations only. Each route file delegates request handling to controllers.

- `controllers/`
  HTTP handlers. Convert incoming requests into service calls and format HTTP responses.

- `services/`
  Business logic layer. Handles auth, OCR, admin workflows, scheduling rules, and inventory operations.

- `middlewares/`
  Shared request helpers and upload/auth guards used by the live runtime.

- `models/`
  Database schemas and collections handled through Mongoose.

- `public/`
  Frontend files served directly by Express.

- `utils/`
  Shared backend helper logic, including sanitization and schedule-related utilities.

## Functional Grouping View

```text
Backend
|-- server.js
|-- routes/
|-- controllers/
|-- services/
|-- middlewares/
|-- models/
`-- utils/

Frontend
`-- public/
    |-- *.html
    |-- css/
    |-- js/
    `-- images/

Setup / Config
|-- .env
|-- package.json
|-- package-lock.json
|-- tailwind.config.js
|-- setup-admins.js
`-- setup-env.js
```

## Page To Script Mapping

```text
index.html      -> public/js/app.js
register.html   -> public/js/register.js
admin.html      -> public/js/admin.js
dashboard.html  -> public/js/dashboard.js
profile.html    -> public/js/profile.js
inventory.html  -> public/js/inventory.js
schedule.html   -> public/js/schedule.js
```

## Current Refactor Status

The live backend now follows the layered pattern:

```text
routes/auth.js
        ->
middlewares/authenticateUser.js / authenticateAdmin.js / orfUpload.js
        ->
controllers/authController.js / adminController.js / inventoryController.js
        ->
services/authService.js / adminService.js / inventoryService.js / authSupportService.js / orfService.js
        ->
models/*

routes/schedule.js
        ->
middlewares/authenticateScheduleUser.js
        ->
controllers/scheduleController.js
        ->
services/scheduleService.js
        ->
models/Schedule.js + models/Registration.js
```
