## 1. Baseline & Audit

- [x] 1.1 Capture the canonical shell markup from `public/admin.html` (hamburger `#mobileMenuBtn`, `#sidebarOverlay`, `nav#sidebar.sidebar-shell`, `#main-content.main-content-shell.lg:ml-[270px]`, `header.admin-header`, `main.admin-main.mx-auto.max-w-[1280px]`, nav `a.admin-nav-link` items)
- [x] 1.2 Grep `public/admin-feedback.html` and `public/admin-returns.html` for all shell/layout classes to be removed (`.dashboard-sidebar`, `.dashboard-sidebar-link`, `.dashboard-topbar`, `.dashboard-main`, `.dashboard-main-inner`, `.dashboard-shell`) and confirm none are used by page content markup
- [x] 1.3 Grep `public/js/admin-feedback.js` and `public/js/admin-returns.js` for handlers that bind `#logoutBtn`, `#headerClock`, `#profileName`, `#profileAvatar`, or `#sidebar`; audit found both pages duplicate `startHeaderClock()` + `setupLogout()`, and `admin.js` has SPA-only behaviors (URL rewrite, `data-view` nav hijack, header-title overwrite, bulk data refresh) that must be guarded

## 2. Shared Shell Foundation

- [x] 2.1 Add SPA guards to `public/js/admin.js`: guard the `history.replaceState` + `setAdminView` block in `applySuperAdminUI()` and the `refreshData()` call in the DOMContentLoaded init behind the `#analytics` marker so they run only on `admin.html`; confirm `/admin/dashboard` behavior unchanged

## 3. Rebuild Feedback Management Layout

- [x] 3.1 In `public/admin-feedback.html`, delete the inline shell CSS block (`.dashboard-sidebar*`, `.dashboard-topbar`, `.dashboard-main*`, `.dashboard-shell` and their media queries), keeping content-only styles (`.dashboard-panel*`, `.dashboard-table-controls`, table, button, badge, modal styles)
- [x] 3.2 Replace the body/root with the canonical shell: skip link, `#mobileMenuBtn`, `#sidebarOverlay`, `nav#sidebar.sidebar-shell` (270px, navy gradient), then `#main-content.main-content-shell.lg:ml-[270px]` containing `header.admin-header` (title/subtitle with styling classes but no `#headerTitle`/`#headerSubtitle`/`#adminWelcomeTitle` IDs, clock `#headerClock`, search, bell, profile `#profileAvatar`/`#profileName`, `#logoutBtn`) and `main.admin-main.mx-auto.grid.max-w-[1280px].gap-5.px-4.pb-8.pt-5.md:px-6`
- [x] 3.3 Replace the `dashboard-sidebar-link` nav list with `admin-nav-link` items using static `active` class on the Feedback Management item (no `data-view` on any link — SPA hijack would break cross-file navigation), including the role-gating nav item IDs from `admin.html` (`announcementsNavItem`, `adminAccountsNavItem`, `transactionsNavItem`, `registrationsNavItem`, `pickupConfirmationsNavItem`, `inventoryNavItem`)
- [x] 3.4 Keep the feedback table, filters, and modals inside the new main wrapper with content classes unchanged
- [x] 3.5 Add `<script src="/js/admin.js"></script>` before `admin-feedback.js`; remove the duplicate `startHeaderClock()` / `setupLogout()` handlers and their DOMContentLoaded wiring from `admin-feedback.js`

## 4. Rebuild Return Request Layout

- [x] 4.1 In `public/admin-returns.html`, delete the inline shell CSS block (`.dashboard-sidebar*`, `.dashboard-topbar`, `.dashboard-main*`, `.dashboard-shell` and their media queries), keeping content-only styles
- [x] 4.2 Replace the body/root with the canonical shell (same as 3.2), setting the title to "Return Requests"
- [x] 4.3 Replace the `dashboard-sidebar-link` nav list with `admin-nav-link` items using static `active` class on the Return Requests item (no `data-view`), including the role-gating nav item IDs from `admin.html`
- [x] 4.4 Keep the return request table, filters, and modals inside the new main wrapper with content classes unchanged
- [x] 4.5 Add `<script src="/js/admin.js"></script>` before `admin-returns.js`; remove the duplicate `startHeaderClock()` / `setupLogout()` handlers and their DOMContentLoaded wiring from `admin-returns.js`

## 5. Verification

- [x] 5.1 Grep audit: no admin page (`admin.html`, `admin-requests.html`, `admin-feedback.html`, `admin-returns.html`) contains `dashboard-sidebar`, `dashboard-topbar`, or `dashboard-main-inner`; each has exactly one `#sidebar` / `#main-content` shell
- [x] 5.2 Confirm both pages load `/js/admin.js`; nav uses `admin-nav-link` with the correct page marked `active` and no `data-view` on cross-file links
- [x] 5.3 Confirm the `admin.js` guards are keyed on `#analytics` and reference-page behavior is unchanged (admin.html still SPA-navigates and rewrites its URL)
- [ ] 5.4 Manual check in the browser: `/admin/feedback` and `/admin/returns` render sidebar, header, and content wrapper identical to `/admin/dashboard` (width, spacing, icons, active highlight, hover, colors, typography); content area differs only
- [ ] 5.5 Manual check: mobile drawer toggle, overlay, escape/close, and logout button work on both pages; header clock, profile avatar/name render
- [ ] 5.6 Smoke-test page functionality: feedback list/filters/modals and return request list/actions still work after the layout swap
- [x] 5.7 Verify `server.js` untouched and `git diff` shows only the two HTML files, the two page JS files, and the guarded `admin.js` (note: `package-lock.json` was already dirty before this change; untouched by this work)
