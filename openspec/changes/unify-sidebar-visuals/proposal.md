## Why

The Feedback Management (`/admin/feedback`) and Return Request (`/admin/returns`) pages historically rendered a different sidebar — a copy of the student-dashboard shell (`dashboard-sidebar w-full`, no fixed width, no drawer) — instead of the shared SMARTSERVE admin sidebar used by Dashboard, Announcements, Transactions, Request Management, and Pickup Confirmations. The shell-alignment work (sidebar markup, header, content wrapper) was completed in the `unify-admin-layout` change; this change completes the effort by verifying the sidebar is pixel-identical on all seven admin pages, removing any leftover duplicated sidebar/layout code, and documenting the root cause.

## What Changes

- Verify every admin page (Dashboard, Announcements, Transactions, Request Management, Pickup Confirmations, Feedback Management, Return Requests) renders the same sidebar: fixed 270px width on desktop, navy gradient (`#17357f → #2447a8 → #315fda`), identical nav item dimensions (`px-5 py-4`, `rounded-2xl`, `gap-2` list spacing, `p-6` nav padding), 20px icons in gold, same typography (`text-[0.96rem] font-semibold`), and the same active/hover states.
- Confirm Feedback Management and Return Request carry **no** page-local sidebar CSS or markup; they rely on the shared shell: markup copied from `admin.html`, styles from `public/css/admin.css`, behavior from `public/js/admin.js` (drawer toggle, active highlight, clock, profile, logout).
- Keep the shared active style identical on every page (gold-tinted `rgba(250,204,21,0.2)` background, yellow border, white text, `translateX(3px)`) — matching Dashboard exactly. The request's "gray background" description conflicts with the dominant requirement "identical to Dashboard", which takes precedence; no per-page restyle is applied.
- Remove any remaining duplicate Sidebar/Layout markup or CSS discovered by the audit (page-local `dashboard-sidebar*`, `dashboard-topbar`, `dashboard-main-inner` are already gone; re-verify).
- Document why the two pages diverged (they copied the student-dashboard shell instead of the admin shell) and confirm the single shared shell.

## Capabilities

### New Capabilities
- `sidebar-visuals`: Defines the single shared sidebar visual standard that every admin page MUST render: 270px navy gradient sidebar, identical item dimensions/spacing/icons/typography, identical active and hover states, identical brand/logo block, and no page-local sidebar CSS or markup on any page. Feedback Management and Return Request MUST be visually indistinguishable from the reference pages' sidebar.

### Modified Capabilities
<!-- No archived specs exist in openspec/specs/; the admin-layout delta lives in the unify-admin-layout change. No requirement-level changes to it. -->

## Impact

- `public/admin-feedback.html` / `public/admin-returns.html` — no changes expected; re-verified against the shared shell (fix only if the audit finds a deviation).
- `public/css/admin.css` — no changes expected; it is the single source of sidebar styles for all admin pages.
- `public/js/admin.js` — no changes expected; supplies shared sidebar behavior (drawer, active class handling).
- `public/admin.html`, `public/admin-requests.html` — untouched; they are the design reference.
- `server.js` — no changes.
- Purely presentational; no API, schema, or data changes.
