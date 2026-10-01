## 1. Link Audit

- [x] 1.1 Extract every navigation `href` from `admin.html`, `admin-feedback.html`, `admin-returns.html`, and `admin-requests.html` (sidebar links and in-page links)
- [x] 1.2 Enumerate the actual Express routes served by `server.js` and cross-reference each link; classify each as resolves / broken / outdated
- [x] 1.3 Verify the sidebar links on Feedback and Return pages specifically (all items: Dashboard, Announcements, Admin Accounts, Transactions, Request Management, Pickup Confirmations, Feedback Management, Return Requests, Inventory Management) — each must resolve to a served route, no 404s
- [x] 1.4 Confirm feedback and return pages serve correctly via the server (HTTP 200 for `/admin/feedback` and `/admin/returns`), and that `/admin/*` SPA routes (`/admin/registrations`, `/admin/pickup-confirmations`) still resolve through `admin.html`
- [x] 1.5 Record the broken-link findings (which links, which routes, root cause) for the report

## 2. Fix Broken Links

- [x] 2.1 Fix any `href` that points to a non-existent or outdated route, only when a correct served path exists
- [x] 2.2 Remove any invalid/outdated path with no valid replacement, in coordination with the report
- [x] 2.3 Re-run the link audit after any fix to confirm zero broken links remain

## 3. Sidebar / Layout Verification

- [x] 3.1 Confirm Feedback Management and Return Request render the shared Dashboard shell: exactly one `nav#sidebar.sidebar-shell` (`lg:w-[270px]`, navy gradient), one `#main-content`, one header, no duplicate sidebar/layout/nav markup (no `dashboard-sidebar`, `dashboard-topbar`, `dashboard-main-inner`)
- [x] 3.2 Confirm the nav item markup matches the reference pages: `admin-nav-link` class string, `px-5 py-4 rounded-2xl`, `gap-4` icon spacing, `text-[0.96rem] font-semibold`, 20px icons, `p-6` nav padding, `gap-2` list spacing, identical "Smart Serve" logo block
- [x] 3.3 Confirm both pages load `public/js/admin.js` and use the shared gold-tinted active styling (no page-local gray restyle); active item is static `active` on the page's own nav item; no `data-view` on cross-file links
- [x] 3.4 Search the codebase for duplicate Sidebar/Layout/Nav components or page-local shell CSS referenced only by Feedback/Return, and replace/remove any found with the shared shell conventions

## 4. Cross-Page Consistency

- [x] 4.1 Confirm the full set (Dashboard, Announcements, Transactions, Request Management, Pickup Confirmations, Feedback, Return, Inventory) shares one sidebar/header/layout — only content changes between pages
- [x] 4.2 Immediately before finishing, verify no served page was unintentionally restructured (`admin.html`, `admin.css`, `admin.js`, reference pages untouched)

## 5. Final Report

- [x] 5.1 Written report in the change: what caused the broken links, which routes were corrected (or none broken if resolved), which files were modified, which duplicate components were removed (none — single shared shell confirmed), and final confirmation that Feedback Management and Return Request now use the exact same layout/sidebar as Dashboard and all broken links are fixed
- [x] 5.2 Close the change: all tasks complete, recommend /opsx-archive after user confirms visual regression pass