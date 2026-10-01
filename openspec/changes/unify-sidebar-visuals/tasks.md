## 1. Static Audit

- [x] 1.1 Grep all four admin HTML files (`admin.html`, `admin-requests.html`, `admin-feedback.html`, `admin-returns.html`) for `dashboard-sidebar`, `dashboard-topbar`, `dashboard-main-inner`, `dashboard-shell` and confirm zero occurrences in every file
- [x] 1.2 Confirm each admin page has exactly one `nav#sidebar.sidebar-shell` (with `lg:w-[270px]`, navy gradient) and one `#main-content` shell; no page defines a second sidebar, header, or layout wrapper
- [x] 1.3 Compare the nav item class strings between the reference pages (`admin.html`) and `admin-feedback.html` / `admin-returns.html` — they must use the same `admin-nav-link` classes, `px-5 py-4 rounded-2xl` sizing, `gap-4` icon spacing, `text-[0.96rem] font-semibold` typography, 20px icons, `p-6` nav padding and `gap-2` list spacing
- [x] 1.4 Confirm both pages load `public/js/admin.js`, carry no `data-view` on nav links, and mark their own page active with the static `active` class (Feedback Management / Return Requests respectively)
- [x] 1.5 Confirm the brand block (`px-6 py-6`, gold logo icon, "Smart Serve" h2) is identical across all admin pages
- [x] 1.6 Confirm the shared active style in `public/css/admin.css` (gold-tinted background, yellow border, white text, `translateX(3px)`) applies to all pages via the shared `.admin-page .sidebar-shell a.active` rule — no page-local active styles

## 2. Fix Deviations (only if audit found any)

- [x] 2.1 Fix any page found with a deviating sidebar markup (class strings, dimensions, spacing, icons, typography) to match the reference pages exactly
- [x] 2.2 Remove any remaining duplicate sidebar/layout CSS or markup found on `admin-feedback.html` / `admin-returns.html`
- [x] 2.3 Re-run the static audit (1.1–1.6) after any fix to confirm compliance

## 3. Documentation

- [x] 3.1 Record the root cause in the change: Feedback Management and Return Request originally copied the student-dashboard shell (`dashboard-sidebar`/`dashboard-topbar`) instead of the shared admin shell; fixed by `unify-admin-layout` (canonical shell, shared `admin.css`/`admin.js`, SPA guards) and verified here
- [x] 3.2 List the files inspected (the four admin HTML files, `public/css/admin.css`, `public/js/admin.js`, `public/js/admin-feedback.js`, `public/js/admin-returns.js`) and which duplicate components were removed (page-local `dashboard-sidebar*` CSS and markup, page-local `startHeaderClock`/`setupLogout` handlers)
- [x] 3.3 Confirm no changes to `server.js`, the reference pages, or the shared `admin.css`/`admin.js` (unless 2.x applied a fix)

## 4. Manual Browser Verification

- [ ] 4.1 Open `/admin/feedback` and `/admin/returns` next to `/admin/dashboard` and confirm the sidebar is visually identical: width, item dimensions, padding, spacing, active highlight (gold), hover animation, icon size/placement, text placement, colors, borders, typography
- [ ] 4.2 Confirm the mobile drawer (hamburger, overlay, escape close), active item highlight on navigation, and logout work on both pages
- [ ] 4.3 Confirm page functionality (feedback list/filters/modals, return request list/actions) still works
