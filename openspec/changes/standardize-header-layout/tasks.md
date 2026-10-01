## 1. Admin Header Markup (4 pages)

- [x] 1.1 `public/admin.html`: reorder `header-left` to greeting (`#headerGreeting`) first, then `#headerClock`; remove `#headerPageTitle` span and the `.header-heading` page-title; move `#logoutBtn` into a new far-right `.burger-btn` + `.burger-menu` (Search input + `#logoutBtn`) after `.header-bell`; remove `.header-search`.
- [x] 1.2 `public/inventory.html`: apply the identical header rebuild as 1.1 (greeting → clock left; profile → bell → burger right; remove `#headerPageTitle` and `.header-search`; `#logoutBtn` into burger menu).
- [x] 1.3 `public/admin-returns.html`: apply the identical header rebuild; remove the literal `#headerPageTitle` page title; `#logoutBtn` into burger menu.
- [x] 1.4 `public/admin-feedback.html`: apply the identical header rebuild; remove the literal `#headerPageTitle` page title; `#logoutBtn` into burger menu.

## 2. Admin Burger JS + CSS

- [x] 2.1 `public/js/admin.js`: remove the `#headerPageTitle` write from `updateHeaderForView` (keep `#headerTitle`/`#headerSubtitle`); confirm `applyHeaderGreeting`, `applySuperAdminUI`, and `#logoutBtn` binding still run on DOMContentLoaded and that `#logoutBtn` is found inside the burger menu.
- [x] 2.2 `public/js/admin.js`: add `initHeaderMenu()` — burger toggle (aria-expanded, `.is-open`, close on outside click/Escape) and burger-search wiring: forward input events to the first visible SmartFilter search input (`.filter-toolbar .filter-control__input--search`) or `#announcementSearch`/`#searchFilter`; else generic filter of visible `table tbody tr` rows (row hidden unless query matches any cell). Call it in the DOMContentLoaded init.
- [x] 2.3 `public/css/admin.css`: append `.burger-btn`/`.burger-menu`/`.burger-search`/`.burger-menu-item` styles consistent with the navy header + yellow accent (button brand, menu surface `#1d3b86`/white text, search input styling matching `.filter-control__input`), menu opened with `.is-open` below the button aligned right; responsive: menu min-width 260px, full-width (`left:0; right:0`) at ≤480px; no negative margins, no fixed heights, no z-index hacks beyond the existing sticky-header stacking.
- [x] 2.4 Verify no other page references `.header-search` removal: grep confirms `header-search`/`.search-input` in admin headers is gone and no admin JS binds it.

## 3. Student Header Markup (6 pages)

- [x] 3.1 `public/dashboard.html`: rebuild `.dashboard-topbar` header — left: greeting (`#dashboardWelcomeText` filled "Welcome, {FirstName}") then `#headerClock` then keep `.dashboard-status-pill`; remove `.dashboard-context-label` and `.student-page-title` (`#dashboardHeaderTitle`); right: `.student-profile` → `.student-bell` → burger (`#logoutBtn` moved into it); remove `.student-search`.
- [x] 3.2 `public/profile.html`: identical student header rebuild (its own greeting id, status pill kept), remove `.student-page-title`, add burger menu with search + logout, remove `.student-search`.
- [x] 3.3 `public/schedule.html`: identical student header rebuild (drawer-toggle sidebar hamburger untouched — keep it in its current position per responsive.css); connect the missing shared stylesheet so burger styles apply; remove `.student-page-title`, add burger, remove `.student-search`.
- [x] 3.4 `public/announcement.html`: identical student header rebuild; remove `.student-page-title`, add burger, remove `.student-search`; keep `#announcementSearch` where it lives in page content.
- [x] 3.5 `public/feedback.html`: identical student header rebuild (no status pill on this page today — do not add one), remove `.student-page-title`, add burger, remove `.student-search`.
- [x] 3.6 `public/returns.html`: identical student header rebuild (no status pill — do not add one), remove `.student-page-title`, add burger, remove `.student-search`.

## 4. Student Burger JS + CSS

- [x] 4.1 Add `initStudentHeaderMenu()` to `public/js/dashboard.js` (burger toggle + search forwarding: `#announcementSearch`/SmartFilter search input if present, else generic visible `table tbody tr` filter), called in the page init; verify greeting/clock/logout flows unchanged.
- [x] 4.2 Add the same `initStudentHeaderMenu()` to `public/js/profile.js`.
- [x] 4.3 Add the same `initStudentHeaderMenu()` to `public/js/schedule.js`.
- [x] 4.4 Add the same `initStudentHeaderMenu()` to `public/js/announcement.js` (forward to `#announcementSearch`).
- [x] 4.5 Add the same `initStudentHeaderMenu()` to `public/js/feedback.js`.
- [x] 4.6 Add the same `initStudentHeaderMenu()` to `public/js/returns.js`.
- [x] 4.7 `public/css/theme.css`: append the shared student `.burger-btn`/`.burger-menu`/`.burger-search` styles (navy/yellow consistent); keep the existing ≤640px rule hiding `.student-profile-info`; ensure `.student-topbar`/`.dashboard-topbar` left/right keep `flex-wrap` + `gap` so greeting + clock wrap without overlap; add `css/theme.css` link to `schedule.html` if not already present.

## 5. Verification

- [x] 5.1 `node --check` on all 7 modified JS files (admin.js + 6 student scripts).
- [x] 5.2 Routes: all 10 affected pages return 200; static CSS serves new rules (confirm `admin.css`/`theme.css` contain the burger/menu block).
- [ ] 5.3 Super admin browser pass (Dashboard + Announcements + Feedback): "Welcome Super Admin" then date/time on left; NO yellow "Announcements"/module name in header; profile, bell, burger order right; burger opens Search + Logout; Search filters current module table/toolbar; Logout redirects to `/`; no overlap at desktop/tablet/mobile.
- [ ] 5.4 Regular admin browser pass: "Welcome Admin", same order, burger + Search + Logout work (verify Pickup Confirmations view is reachable and its header matches).
- [ ] 5.5 Student browser pass (Dashboard + Announcements + Returns): "Welcome, {FirstName}" (first name only), date/time after greeting, no module name, burger Search + Logout work; announcement page `#announcementSearch` still usable from burger.
- [ ] 5.6 Regression: sidebar order unchanged (super admin has NO Pickup Confirmations; admin does), in-page titles/tables/smart filters unchanged, dashboard status pill still updates, no console errors on any page.
