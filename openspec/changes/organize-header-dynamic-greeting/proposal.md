## Why

The SmartServe headers are inconsistent and incomplete: admin pages show no greeting or page title in the header (only clock, logout, search, profile, bell), while student pages have a compact topbar with a static "Welcome, Student" heading and no search bar, profile block, or notification bell. There is no dynamic, role-aware greeting anywhere, so the header never reflects who is actually logged in.

## What Changes

- **Admin header organization** (`admin.html`, `admin-feedback.html`, `admin-returns.html`, `inventory.html`): structure the header into a clearly separated left group (dynamic greeting + current page title + existing clock/logout) and right group in the fixed order **Search → Avatar/Name/Role → Notification Bell**, with the bell always the far-right element. No element overlap; responsive wrap instead.
- **Dynamic role greeting**: render `Welcome Super Admin` (Super Admin), `Welcome Admin` (Admin), or `Welcome, [First Name]` (Student), derived only from the confirmed authenticated user. No default-to-Admin, no role fallback, no wrong-greeting flash while auth/data loads.
- **Student header parity** (`dashboard.html`, `profile.html`, `schedule.html`, `announcement.html`, `feedback.html`, `returns.html`): reorganize the topbar to the same left greeting + title (+) and right **Search → Avatar/Name/Role → Bell** structure, complementing the compact design.
- **First-name greeting for students**: reuse the existing authenticated user payload (`/api/auth/me` → `firstName` or first token of the full name) — no new user record, no schema change.
- **No greeting flash**: greeting/title elements stay neutral until the user is confirmed, then render once with the correct role/name.
- No changes to the sidebar, page content, auth logic, routes, or module functionality.

## Capabilities

### New Capabilities
- `header-dynamic-greeting`: The header renders a role-aware greeting (`Welcome Super Admin` / `Welcome Admin` / `Welcome, [First Name]`) plus the current page title on the left, and the fixed right-side group Search → user profile (avatar + name + role) → Notification Bell (far right), across all admin and student pages, without wrong-greeting flashes and with responsive non-overlapping layout.

### Modified Capabilities
<!-- No existing merged specs exist (openspec/specs/ is empty), so there are no requirement changes to existing capabilities. -->

## Impact

- HTML shells: `public/admin.html`, `public/inventory.html`, `public/admin-feedback.html`, `public/admin-returns.html` (admin header) and `public/dashboard.html`, `public/profile.html`, `public/schedule.html`, `public/announcement.html`, `public/feedback.html`, `public/returns.html` (student topbar).
- Client JS: `public/js/admin.js` (greeting + title from confirmed `currentAdminProfile`; `HEADER_TITLES`/`updateHeaderForView` wiring), `public/js/inventory.js`, and the student page scripts (`dashboard.js`, `profile.js`, `schedule.js`, `announcement.js`, `feedback.js`, `returns.js`) — greet from the fetched `/api/auth/me` payload; only render after the user is loaded.
- Header CSS for the admin header and the student topbars (flex/grid alignment, spacing, wrap behavior) — visual identity unchanged.
- No database, API, authentication, sidebar, or module behavior changes.