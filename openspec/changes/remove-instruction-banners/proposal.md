## Why

SmartServe surfaces user-facing text that reads like internal system instructions, permission descriptions, and AI-generated implementation notes (e.g. "Super admin can review inventory data here, but inventory changes stay read-only."). These banners make the product feel unfinished and developer-facing instead of a professional production system.

## What Changes

- Remove all visible instruction/explanation banners and permission-description text from the frontend, including:
  - Inventory: the `#inventoryReadOnlyNotice` read-only banner and its JavaScript toggle.
  - Admin hub: the amber `#superAdminNotice` banner in `admin.html` and the notice-writing block in `admin.js` (`applySuperAdminUI`).
  - Announcements (student): the "Search, filter, and review..." sidebar paragraph, the "refresh automatically" note, and the "Open any announcement to see the full details." feed hint.
  - Dashboard (student): the hero-card default status sentence ("Review your profile, check your registration status...") in both the HTML default and `dashboard.js`.
  - Registration wizard (student): step-chip/description notes in ORF Upload, Student Information, Module/Books/Uniform windows, and the final review banner, plus the instructional default ORF-upload messages.
- Clean up spacing after removals: do not leave empty amber/white boxes — either remove the container or collapse the space, preserving the existing SmartServe design.
- Keep ALL functionality and permissions unchanged:
  - Runtime access-denied/view-only alerts (e.g. "Super admin has view-only access on inventory.") are kept — they are required system feedback.
  - Empty states, errors, success messages, confirmations, validation messages, status pills, filter/CSV meta lines, ratings hint ("1 = Poor, 5 = Excellent"), and module-level subtitle copy under page titles are kept.
  - The read-only permission itself (super admin view-only on inventory) is NOT changed.

## Capabilities

### New Capabilities
- `ui-copy-cleanup`: Requires that no visible user-facing text reads like an internal instruction, permission description, AI-generated explanation, or implementation note, while every functional element (tables, filters, buttons, errors, empty states, runtime feedback, permissions) stays intact and no empty/blank containers are left behind.

### Modified Capabilities
<!-- No existing capability requirements change; this is presentational copy removal only. -->

## Impact

- `public/inventory.html`, `public/admin.html`, `public/announcement.html`, `public/dashboard.html` — banner text removed and spacing adjusted.
- `public/js/inventory.js`, `public/js/admin.js`, `public/js/dashboard.js` — remove banner-wiring code for deleted elements and instructional default copy.
- `public/css/admin.css` — remove the now-unused `#superAdminNotice` rule. No backend, database, authentication, authorization, or route changes.