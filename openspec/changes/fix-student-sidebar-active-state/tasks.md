## 1. Mark sidebar links in dashboard.html

- [x] 1.1 Add `data-sidebar-view="dashboard"` to the Dashboard sidebar link in `public/dashboard.html` (line 962), keeping its existing `is-active` classes unchanged.
- [x] 1.2 Add `data-sidebar-view="request"` to the Request sidebar link in `public/dashboard.html` (line 974), keeping its existing inactive classes unchanged.
- [x] 1.3 Verify no other student page sidebar contains a `data-sidebar-view` attribute and the other pages' static active markup is untouched.

## 2. Route/view-driven active state in dashboard.js

- [x] 2.1 Replace the dead `[data-dashboard-nav]` toggle block (dashboard.js:186-189) with an `updateSidebarActiveState(activeView)` function that iterates all `[data-sidebar-view]` elements and toggles `is-active` only where `data-sidebar-view === activeView`.
- [x] 2.2 Call `updateSidebarActiveState(showRequest ? 'request' : 'dashboard')` from `setDashboardSectionVisibility()` so the active view reuses the existing `#request`/`#registration` normalization and updates on every load and hashchange.
- [x] 2.3 Run `node --check public/js/dashboard.js` to confirm the file parses.

## 3. Verify active state behavior

- [x] 3.1 Confirm that on `/dashboard#request` (and refresh) the Request sidebar item is the only active item and Dashboard is inactive.
- [x] 3.2 Confirm that on `/dashboard` (or no hash) the Dashboard sidebar item is the only active item and Request is inactive.
- [x] 3.3 Confirm clicking Request from Dashboard and clicking Dashboard from Request updates the highlight immediately (hashchange), with at most one active item.
- [x] 3.4 Confirm direct navigation to `/request` redirects to `/dashboard#request` with Request active.
- [x] 3.5 Confirm User Profile, Announcements, Feedback, and Returns pages each keep exactly their own sidebar item active and the inactive items' appearance is unchanged.
- [x] 3.6 Confirm no changes to request content, request functionality, global header, sidebar order/design/colors, sidebar modules, or the Dashboard page content.