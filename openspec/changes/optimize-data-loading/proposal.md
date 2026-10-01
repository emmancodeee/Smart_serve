## Why

When a sidebar feature is clicked, the destination page opens immediately (navigation is fast), but its data arrives piece by piece. Each module serializes one or more independent API requests behind unrelated prerequisites (most notably the user-profile `/me` request), or issues duplicate/waterfalled requests, so the page stays incomplete for several seconds. The goal is to make the complete available data appear as promptly as possible after each page opens.

## What Changes

- **Remove blocking-profile serialization.** Stop making main module data wait for the user-profile request when the profile is unrelated (e.g., inventory list, summary, announcements). Fire independent requests concurrently.
- **Remove the duplicate admin-probe.** The fallback boot path fetches the full users list a second time just to test authorization; eliminate the duplicate request.
- **Parallelize independent frontend fetches on standalone pages** (inventory, announcements) using `Promise.all` where safe.
- **Remove double renders on initial load.** `SmartFilter.create()` already applies; the explicit unconditional `refreshOptions()`+`apply()` in several loaders re-renders the same data twice.
- **Eliminate redundant per-record detail fetches.** Returns and Feedback Views re-fetch a full document already present in the loaded list.
- **Avoid full-dataset refetches after single mutations** where a targeted refetch is appropriate (keeping legitimate refresh behaviors).
- **Load the role's complete dataset before rendering analytics** so the shared dashboard shows complete data for both super admins and regular admins.
- **Eliminate artificial/duplicate polling where it causes out-of-order, duplicated loads** on the announcements page.
- **Backend:** avoid duplicate authentication DB lookups (middleware already authenticates; services re-query) and, where cheap and safe, reduce redundant scans on read-heavy endpoints. No schema, response-shape, or permission changes.

## Capabilities

### New Capabilities
- `data-loading-optimization`: Loads a page's required datasets concurrently, without blocking on unrelated requests or duplicate fetches, and renders immediately once data is available.

### Modified Capabilities
- `admin-filters`: The SmartFilter component must not perform duplicate initial renders — creation-time `apply()` is the single initial render; explicit re-applies should only happen when data actually changes.
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation). Check openspec/specs/. -->

## Impact

- `public/js/admin.js` — boot waterfall (remove duplicate probe), premutation refetch scope, superadmin analytics data gap.
- `public/js/inventory.js` — parallelize `/me`, `/inventory`, `/summary`; remove double render.
- `public/js/announcement.js` — parallelize profile + announcements; dedupe concurrent polling.
- `public/js/admin-returns.js` and `public/js/admin-feedback.js` — remove double render and redundant detail fetches.
- `public/js/admin-filters.js` — guard/fix the double `apply()` pattern used by loaders (no behavior change to filtering/sorting/export).
- Backend services (`adminService.js`, `inventoryService.js`, `announcementService.js`, `uniformRequestService.js`, `analyticsService.js`) — remove duplicate `authenticateAdminRequest` calls where the middleware already authenticated; use `req.admin`. No API response-shape changes.
- No changes to: sidebar, page UI design, database schema, authentication/authorization rules, permissions, or existing filtering/searching/sorting/export functionality.
