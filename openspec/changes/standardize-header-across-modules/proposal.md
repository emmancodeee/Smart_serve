## Why

Every admin sidebar module page currently renders a slightly different header. `admin.html` (Dashboard / Admin Accounts / Transactions / Announcements) and `inventory.html` use `[Date & Time][Logout]` on the left and `[Search][Bell][Profile]` on the right, while `admin-returns.html` and `admin-feedback.html` put a "Welcome Admin" heading, a page title, and a long module description in the header and place `[Date & Time][Logout]` in a separate middle group. On every page the Notification Bell currently precedes the Admin Profile. This inconsistent structure produces crowding/overlap in some headers and does not match the target reference layout in which the bell is always the far-right element.

## What Changes

- Standardize the header on every sidebar module page to the exact reference structure:
  - LEFT: `[ Date & Time ] [ Logout ]`
  - RIGHT: `[ Search ] [ Admin Profile ] [ Notification Bell ]`
- Move the Notification Bell so it is the LAST / far-right element of the header on every page (it is currently second, before the Admin Profile)
- Remove the "Welcome Admin" heading, the in-header page title, and long module descriptions from the header (module titles/descriptions already live in page content); the header keeps only the six reference elements and stays clean and compact
- Keep the existing dynamic date/time clock, Logout behavior/style, search icon + placeholder + behavior, Admin profile block, and the bell/badge styling unchanged (same classes and styling as the reference)
- Add/refine shared CSS in `public/css/admin.css` (with page-agnostic selectors) so the standard header never overlaps and wraps/stacks cleanly on tablet and mobile — same responsive behavior on every page
- Preserve the sidebar (design, order, icons, labels, colors), all page content, and ALL functionality (inventory, returns, transactions, announcements, feedback, accounts, search, logout, notifications) and the full backend/API/auth/routes

## Capabilities

### New Capabilities
- `standard-admin-header`: The consistent admin header layout shared by all sidebar module pages — exact element set and order (LEFT `[Date & Time][Logout]`, RIGHT `[Search][Admin Profile][Notification Bell]`), uniform spacing/alignment, no in-header titles or module descriptions, no overlapping, and responsive behavior on desktop/tablet/mobile.

### Modified Capabilities

(no existing main specs are affected; everything is introduced as new)

## Impact

Affected files (header markup + shared styling only):
- `public/admin.html` — serves Dashboard, Admin Accounts, Transactions, Announcements (and registrations/pickup views); reorder right group to `[Search][Profile][Bell]` and align left group to the standard
- `public/inventory.html` — reorder right group to `[Search][Profile][Bell]`
- `public/admin-returns.html` — rebuild header to the standard structure; remove Welcome/title/description from header
- `public/admin-feedback.html` — rebuild header to the standard structure; remove Welcome/title/description from header
- `public/css/admin.css` — scoped CSS refinements for the standard header (alignment, bell spacing, responsive)

Explicitly NOT changed:
- `public/js/*`, backend, routes/db/auth/authorization, sidebar, page content, all module functionality
- `public/admin-requests.html` (legacy white-header page, not served by any current route and not part of the current sidebar modules)

Note: `admin.html`, `inventory.html`, `admin-returns.html`, and `admin-feedback.html` already carry uncommitted changes from the active `reorder-admin-sidebar-nav` and `fix-returns-page-ui` changes; implementation must preserve those (sidebar markup/order and the returns page layout fixes).