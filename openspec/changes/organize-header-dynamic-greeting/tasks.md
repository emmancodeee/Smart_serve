## 1. Admin header markup

- [x] 1.1 In `public/admin.html`: add a left greeting group with `#headerGreeting` (neutral/empty) and `#headerPageTitle` elements beside the existing `#headerClock` / `#logoutBtn`; keep right-group order `.header-search` → `.admin-profile` → `.header-bell`
- [x] 1.2 In `public/inventory.html`: same greeting + `Inventory Management` title in the left group; confirm right-group order Search → Profile → Bell
- [x] 1.3 In `public/admin-feedback.html`: same greeting + `Feedback Management` title; right-group order Search → Profile → Bell
- [x] 1.4 In `public/admin-returns.html`: same greeting + `Return Requests` title; right-group order Search → Profile → Bell
- [x] 1.5 Confirm no static role text (no literal `Welcome Admin`) is placed in any admin header markup

## 2. Student topbar markup

- [x] 2.1 `public/dashboard.html`: replace static `Welcome, Student` with neutral `#dashboardWelcomeText` (`Welcome`) + `Dashboard` page title; add search, profile (avatar/name/role), bell to the right side; keep clock/logout
- [x] 2.2 `public/profile.html`: neutral `#profileHeaderTitle` (`Welcome`) + `Profile` title; add search, profile block, bell; keep clock/logout
- [x] 2.3 `public/schedule.html`: neutral `#scheduleHeaderTitle` (`Welcome`) + `Schedule` title; add search, profile block, bell; keep clock/logout
- [x] 2.4 `public/announcement.html`: neutral `#scheduleHeaderTitle` (`Welcome`) + `Announcements` title; add search, profile block, bell; keep clock/logout
- [x] 2.5 `public/feedback.html`: add neutral greeting + `Feedback` title; add search, profile block, bell; keep clock/logout
- [x] 2.6 `public/returns.html`: add neutral greeting + `Returns` title; add search, profile block, bell; keep clock/logout
- [x] 2.7 Confirm on every student page the right-side order is Search → Profile → Bell and the bell is far-right relative to them

## 3. Header CSS

- [x] 3.1 Add `.header-greeting` / `.header-page-title` styles (and any spacing/alignment) to `public/css/admin.css` reusing current header tokens
- [x] 3.2 Add student `.student-search` / `.student-profile` / `.student-avatar` / `.student-role` / `.student-bell` styles in the student pages' style blocks reusing navy/yellow/blue tokens
- [ ] 3.3 Verify flex-wrap reflow for narrow widths (no overlap/clipping of greeting, title, search, profile, bell, clock, logout)

## 4. Admin JS wiring

- [x] 4.1 In `public/js/admin.js`: add `applyHeaderGreeting()` setting `#headerGreeting` to `Welcome Super Admin` (isSuperAdmin) or `Welcome Admin`, called from `applySuperAdminUI()` after `currentAdminProfile` is assigned
- [x] 4.2 Wire `#headerPageTitle` into `updateHeaderForView()`/`HEADER_TITLES` so SPA view titles render in the header (compact title only, no long subtitles)
- [x] 4.3 Confirm the greeting is never set before role confirmation (no `user?.role || 'Admin'` style fallback)

## 5. Student JS greeting + first name

- [x] 5.1 Add `getFirstName(user)` to `public/js/dashboard.js` (precedence: `firstName` → first token of `fullname`/`name` → empty) and render `Welcome, [FirstName]` in `#dashboardWelcomeText` + profile name/role/avatar after `/api/auth/me` resolves
- [x] 5.2 Add the same helper + greeting/profile rendering to `public/js/profile.js`
- [x] 5.3 Add the same helper + greeting/profile rendering to `public/js/schedule.js` (replace current uppercase full-name `Welcome ${name}`)
- [x] 5.4 Add the same helper + greeting/profile rendering to `public/js/announcement.js`
- [x] 5.5 Add the same helper + greeting/profile rendering to `public/js/feedback.js`
- [x] 5.6 Add the same helper + greeting/profile rendering to `public/js/returns.js`
- [x] 5.7 Confirm no student page renders `Welcome Student` or the full name in the header greeting at any point

## 6. Verify the header end to end

- [x] 6.1 Super Admin login: greeting reads `Welcome Super Admin`; refresh shows no `Welcome Admin` or other wrong greeting flash
- [x] 6.2 Admin login: greeting reads `Welcome Admin`; refresh and navigation keep it correct
- [x] 6.3 Student login: greeting reads `Welcome, [First Name]`; refresh keeps it; no `Welcome Student`/full-name greeting
- [x] 6.4 Page titles update correctly on admin SPA navigation (Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management) and on student pages
- [x] 6.5 Right-side order is Search → Profile → Bell on every page, bell far-right; verify on desktop, laptop, tablet, and mobile widths with no overlap/clipping
- [x] 6.6 Search and Notification Bell elements remain functional/present as before; clock and logout remain functional with no overlap
- [x] 6.7 Sidebar unchanged (including Admin-only Pickup Confirmations); browser Console/Network shows no role, auth, or undefined-user errors