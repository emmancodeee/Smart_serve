## Why

The SmartServe header is inconsistent across modules: admin headers show a yellow module label (e.g. "Announcements") next to the greeting, student headers show per-page welcome text plus a module title, and the visible header search boxes are decorative (unbound) while Logout sits directly in the header. The system needs ONE clean, consistent header everywhere: dynamic role greeting + date/time on the left, and User Profile → Notification Bell → Burger menu (containing Search + Logout) on the right.

## What Changes

- **Remove the module/page title from the header**: delete the yellow `#headerPageTitle` span (admin.html, inventory.html, admin-returns.html, admin-feedback.html) and the `.student-page-title` span plus per-page context/welcome labels on the six student pages (`dashboard.html`, `profile.html`, `schedule.html`, `announcement.html`, `feedback.html`, `returns.html`). Page titles already exist in page content and are untouched. `updateHeaderForView` in `public/js/admin.js` stops writing `#headerPageTitle` (in-content `headerTitle`/`headerSubtitle` keep updating).
- **Unify the left side**: dynamic greeting followed by the existing live date/time clock (`#headerClock`, `startHeaderClock()`). Greeting only: "Welcome Super Admin" / "Welcome Admin" / "Welcome, {FirstName}". Exchange admin left order (currently Clock → Logout → heading) to Greeting → Clock.
- **Unify the right side**: User Profile → Notification Bell → Burger button (far right). Remove the visible header search (`.header-search`/`.student-search`, currently unbound) and move the existing Logout button into the burger menu.
- **Add a burger menu** (right dropdown) containing Search and Logout. Search reuses each page's existing search mechanism (SmartFilter filter search on admin pages; `#announcementSearch` and module search inputs on student pages) or a generic visible-table row filter fallback. Logout reuses the existing `#logoutBtn` element and its bound handler (`performLogout` / per-student logout) — only its location changes.
- **One implementation path**: shared admin-header behavior lives in `public/js/admin.js` (loaded by all admin pages); student behavior follows the existing per-page JS pattern (`dashboard.js`, `profile.js`, `schedule.js`, `announcement.js`, `feedback.js`, `returns.js`). Burger/menu styling appended to `public/css/admin.css` (admin) and `public/css/theme.css` (student pages; schedule.html additionally links theme.css).
- No sidebar, page-content, database, API, route, auth, or module-functionality changes.

## Capabilities

### New Capabilities
- `standard-header-layout`: The consistent header structure used by every SmartServe page — greeting + live date/time on the left; user profile, notification bell, and burger menu (containing functional Search and Logout) on the right — with no module name beside the greeting, role-based dynamic greeting, and no overlap at any viewport width.

### Modified Capabilities
<!-- No existing specs to modify; openspec/specs/ has no capabilities yet. -->

## Impact

- `public/admin.html`, `public/inventory.html`, `public/admin-returns.html`, `public/admin-feedback.html` — header markup reorder + burger menu; remove `#headerPageTitle`.
- Six student pages — header markup unify + burger menu; remove page-title/context labels; schedule.html adds the `css/theme.css` link.
- `public/js/admin.js` — remove `#headerPageTitle` update from `updateHeaderForView`; add header burger toggle + burger-search wiring (reuses SmartFilter/module search).
- Six student page scripts — add burger toggle + burger-search wiring (forward to page search hook or generic row filter).
- `public/css/admin.css`, `public/css/theme.css` — append burger menu + header layout styles (no z-index/negative-margin hacks).
- No backend/API/routes/auth/data changes.