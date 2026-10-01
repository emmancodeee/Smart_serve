## Why

The Feedback Management (`/admin/feedback`) and Return Request (`/admin/returns`) pages historically rendered a copied student-dashboard shell and had navigation links that could drift from the server routes, producing broken navigation and a sidebar that looked different from the rest of the SMARTSERVE Admin Panel (Dashboard, Announcements, Transactions, Request Management, Pickup Confirmations). The shell work is already effectively done by `unify-admin-layout` and `unify-sidebar-visuals`; this change closes the loop: audit every admin nav link against the real `server.js` routes, fix any dead/incorrect link, verify one shared sidebar standard remains, and produce the final report the user asked for.

## What Changes

- Verify every navigation link on all admin pages against the actual Express routes in `server.js`; there is **no React Router** in this project, so "router verification" means confirming each `href` maps to a served route.
- Fix any link that 404s or points to a stale/outdated path.
- Confirm Feedback Management and Return Request still render inside the shared admin shell (the same markup shell as Dashboard — the non-React equivalent of the shared `AdminLayout`): identical sidebar width/`270px`, padding, spacing, item height, border radius, gold-tinted active highlight, hover animation, 20px icon size and `gap-4` spacing, typography, colors, gradient background, borders, shadows, and identical "Smart Serve" logo block.
- Confirm **no duplicate** Sidebar/Header/Layout/Nav components on Feedback/Return — no student-dashboard copy (`dashboard-sidebar`/* topbar*` variants), no second sidebar, no page-local layout CSS.
- The active style stays **gold-tinted shared (matches Dashboard as-is)**; the request's "gray active" description conflicts with "identical to Dashboard", and per user decision the gold shared style wins.
- Produce the final report: what caused the broken links, which routes were corrected, which files were modified, which duplicates were removed, and the confirmation that the pages now match Dashboard.

## Capabilities

### New Capabilities
- `admin-link-consistency`: Every admin page nav link MUST resolve to a real, served route — no 404s or outdated paths; Feedback Management and Return Request are served by explicit files while the other admin pages are served by one SPA/role-aware handler.

### Modified Capabilities
<!-- No archived specs exist in openspec/specs/; prior admin-layout/sidebar deltas live in the unify-admin-layout and unify-sidebar-visuals changes, which are the vehicles for the visual standard. No new requirement-level changes. -->

## Impact

- `public/admin-feedback.html`, `public/admin-returns.html` — nav links/`href`s audited & fixed if broken (no visual changes expected; the sidebar already shares the Dashboard shell from `unify-admin-layout`).
- `public/admin.html`, `public/admin-requests.html` — untouched; they are the design reference. (`admin-requests.html` is no longer served by `server.js` — dead file, out of scope.)
- `public/css/admin.css`, `public/js/admin.js` — no changes expected; single source of shared sidebar styles/behavior.
- `server.js` — no changes expected; routes already serve Feedback/Return as distinct pages and the rest through `admin.html`.
- Purely presentational + link-resolution; no API, schema, or data changes. Inventory Management is verified as part of "all admin pages" but is not modified.