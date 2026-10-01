## Why

The Feedback Management (`/admin/feedback`) and Return Request (`/admin/returns`) pages render with a completely different shell than the rest of the SMARTSERVE Admin Panel. Instead of the shared admin layout (fixed 270px navy sidebar, drawer toggle, dark navy header, centered content wrapper) used by Dashboard, Admin Accounts, Transactions, Registration Management, and Pickup Confirmations, these two pages use a copy of the student dashboard layout (`dashboard-sidebar w-full`, a clock-style topbar, different content padding). This makes the admin panel inconsistent and confusing to use.

## What Changes

- Rebuild `public/admin-feedback.html` and `public/admin-returns.html` on the exact same layout shell as the reference pages (`public/admin.html`, `public/admin-requests.html`).
- Replace the `dashboard-sidebar` / `dashboard-topbar` markup in both pages with the shared admin shell: `nav#sidebar.sidebar-shell` (fixed 270px, navy gradient, mobile drawer + `sidebarOverlay` + hamburger toggle), `header.admin-header` (dark navy, sticky, with search bar, notification icon, date/time section, admin profile, logout), and `main.admin-main mx-auto max-w-[1280px]` content wrapper.
- Keep each page's own content (feedback table / return request table) inside the shared shell — only the page content changes.
- Preserve the active menu highlight on the correct nav item (Feedback Management on `/admin/feedback`, Return Requests on `/admin/returns`) using the same `is-active` mechanism as reference pages.
- Remove the per-page duplicated layout CSS blocks (`.dashboard-sidebar`, `.dashboard-topbar`, `.dashboard-main-inner`, etc.) from both pages; rely on the shared `public/css/admin.css` + Tailwind theme used by the reference pages.
- Ensure both pages load the shared `public/js/admin.js` behavior (sidebar toggle, drawer, active-link highlighting) just like the reference pages, instead of any page-specific sidebar scripts.
- No changes to `server.js` routing: `/admin/feedback` and `/admin/returns` keep serving the same files.

## Capabilities

### New Capabilities
- `admin-layout`: Defines the single shared Admin Panel layout standard that every admin page must render inside — the `#sidebar` drawer (fixed 270px navy gradient sidebar, hamburger toggle, overlay), the `admin-header` (dark navy, search, notifications, date/time, profile, logout), and the `admin-main max-w-[1280px]` content wrapper. Feedback Management and Return Request must conform to it, and no admin page may carry a duplicate sidebar/header/layout shell.

### Modified Capabilities
<!-- No existing specs present; none modified -->

## Impact

- `public/admin-feedback.html` — replace layout shell + inline layout CSS; keep feedback content markup and `admin-feedback.js` wiring.
- `public/admin-returns.html` — replace layout shell + inline layout CSS; keep return request content markup and `admin-returns.js` wiring.
- `public/js/admin.js` — verify shared sidebar/toggle logic applies to both pages; no changes expected unless hookup IDs differ.
- `public/css/admin.css` / Tailwind theme — single source of layout styles; no changes expected.
- `server.js` — no changes (routes unchanged).
- Reference pages (`admin.html`, `admin-requests.html`) — untouched; they define the standard.
- Visual/UX impact only; no API, schema, or data changes.
