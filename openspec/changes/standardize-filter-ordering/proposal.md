## Why

Filter sections across SMARTSERVE modules render controls in inconsistent orders: the shared `admin-filters.js` engine always renders Search first, then field selects, then date range, sort, reset, and export, while static pages (student announcements, uniform requests) place Search anywhere in the sequence. This makes the interface feel disorganized and harder to scan. Users expect the Item Category filter first and Search last for consistent, predictable filtering on every page.

## What Changes

- Enforce a single filtering-order rule on every module/page that has a filter section: **Item Category (if present) → Other existing filters → Search (always last)**.
- Modify the shared filter engine `public/js/admin-filters.js` so the search input is rendered **after** all field selects instead of first, and so any category filter (`category`/`itemCategory` field) is rendered **first** among the field controls.
- Reorder the field configuration in each module using the engine so category is positioned first and search remains last: Inventory Management, Return Request, Transactions, Announcements (admin), Feedback Management, Users, Registrations, Pickup Confirmations, Admin Accounts, Analytics.
- Reorder the static filter markup: student Announcements page (`announcement.html`) and Uniform Request Management (`admin-requests.html`), placing Search last.
- Preserve responsive wrapping so the Item Category → other filters → Search order holds even when controls wrap to additional rows on small screens.
- Do **NOT** change any filter's options, labels, functionality, colors, spacing style, header, sidebar, or overall design. Only order, spacing, and alignment of existing controls change. No filters are added, removed, or renamed, and no duplicates are created.

## Capabilities

### New Capabilities
<!-- None — no new capability is introduced; this reorders controls within the existing filtering capability. -->

### Modified Capabilities
- `admin-filters`: The filter toolbar now renders the Item Category control first (when present), all other configured filter controls after it, and the search input last, across every module that uses the shared filter engine and on static filter pages.

## Impact

- **Files modified**: `public/js/admin-filters.js` (shared engine render order), `public/js/inventory.js`, `public/js/admin-returns.js`, `public/js/admin.js` (transactions, announcements, analytics, users, registrations, pickup confirmations, admin accounts configs), `public/js/admin-feedback.js`, `public/announcement.html` + `public/js/announcement.js`, `public/admin-requests.html` + `public/js/requests-management.js`.
- **Behavior**: filtering/sorting/searching/export functionality is unchanged; only the visual order of controls changes.
- **Backend**: no changes — APIs and MongoDB collections untouched.
- **Dependencies**: none added.