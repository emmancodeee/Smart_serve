## Why

Admin and Super Admin sidebar navigation is visibly broken: clicking a module shows the wrong or previous module's content first, the correct landing page arrives late, and the page blocks on data it does not need. This is a regression from recent sidebar/navigation/loading work, and it is architectural rather than per-module — the fix must land once for **both** roles, not as a patch to Pickup Confirmations, Feedback, or Inventory alone.

## What Changes

- **Fix the boot-time crash in `applySuperAdminUI()`** — `superAdminNotice` is read at `public/js/admin.js:598` but is never declared and matches no DOM element, so it throws `ReferenceError`. The throw aborts the `DOMContentLoaded` handler at `public/js/admin.js:1648` before `/api/auth/me` (1654), `refreshData()` (1700), `applyViewFromLocation()` (1697/1706), and `initAdminFilters()` (1705) ever run. `setAdminView()` is therefore never called on boot, so no module is ever hidden.
- **Guarantee single-module rendering** — the shell must render exactly one module. Today `#analytics` (whose heading is "Inventory Overview", `public/admin.html:95-96`) plus `#transactions` (396), `#registrationsFilterWrap` (418), `#registrationsPending` (422) and `#pickupConfirmations` (485) all ship without `display:none`, so they are all visible on first paint.
- **Route-driven module resolution with no generic fallback** — the current view is derived from `window.location` (`getViewFromLocation`, `admin.js:312`) and any unmatched path silently resolves to `dashboard` (`admin.js:315`, `getDefaultAdminView` 379). `/inventory` is not in `ADMIN_VIEW_PATHS` (242-250) and `inventory` is absent from `ROLE_VIEW_KEYS.superadmin` (238-241), so the Inventory nav item for Super Admin resolves to Dashboard.
- **Eliminate full-page reloads for sidebar navigation** — six separate documents (`admin.html`, `inventory.html`, `admin-supply-stock.html`, `admin-returns.html`, `admin-feedback.html`, `admin-requests.html`) are each a hard `href` target, so most sidebar clicks tear down and re-bootstrap the app.
- **Single source of truth for the sidebar** — the sidebar `<ul>` is hand-copied into six files with drifting `style="display:none"` defaults, drifting `data-view` attributes, and hardcoded `active` classes. `inventory.html` and `admin-supply-stock.html` never mark themselves active; `admin-requests.html:65` omits the `display:none` on `pickupConfirmationsNavItem` that every other copy has; `admin-requests.html` and `inventory.html` do not load `admin.js` at all, so no role gating, no auth boot, and no active-link logic runs there.
- **Load only the active module's data** — `refreshData()` (`admin.js:1709-1717`) fires six loaders in parallel on every boot plus `loadAnalytics()`, so landing on Pickup Confirmations also waits on Inventory, Announcements, Transactions, Users and Registrations.
- **Add per-module loading states** — `showLoading`/`showError`/`showEmpty` (`admin.js:55-108`) have exactly one call site each, all on `adminAccountsTable` (1779/1788/1805). There is no loading state for any other module, so modules show empty tables while data is in flight.
- **Deduplicate requests** — the abort above means the intended sequencing is masked; once boot survives, `applyViewFromLocation()` runs twice (1697, 1706) and `updateSidebarActiveLink()` runs three times, so effects and loaders need explicit dependency and in-flight guards.
- **Preserve everything visual and behavioural** — sidebar order, module set, role permissions, layouts, colours, typography, cards, tables, filters and buttons are unchanged. Inventory Management / Supply & Stock keep sharing the real Books, Modules and Uniforms datasets. No artificial `setTimeout` delays.

## Capabilities

### New Capabilities
- `admin-panel-navigation`: Sidebar-driven module navigation for both Admin and Super Admin — immediate active state, single-module rendering with no cross-module content, route-driven module resolution, per-module loading states, and client-side navigation without full-page reload. Covers the existing separate role configurations rather than unifying them.
- `admin-module-data-loading`: Per-module on-demand data loading for both Admin and Super Admin — no eager preload of unrelated datasets, no duplicate or concurrent duplicate requests, lightweight Dashboard summaries, and reuse of the shared inventory dataset between Inventory Management and Supply & Stock.

### Modified Capabilities
<!-- None. The two existing specs (student-feedback-ui-layout, student-sidebar-design) cover student surfaces and are unaffected. -->

## Impact

- `public/js/admin.js` — `applySuperAdminUI` (565-626), `setAdminView` (516-547), `getViewFromLocation` (312-317), `updateSidebarActiveLink` (334-361), `updateHeaderForView` (392-398), `refreshData` (1709-1717), the `DOMContentLoaded` boot (1632-1707), all `load*` loaders (1727-1912, 2275), `showLoading`/`showError`/`showEmpty` (55-108), view config tables (229-259), `pageshow` handler (425-436).
- `public/admin.html`, `public/inventory.html`, `public/admin-supply-stock.html`, `public/admin-returns.html`, `public/admin-feedback.html`, `public/admin-requests.html` — six hand-copied sidebars, section visibility defaults, script include lists.
- `public/js/admin-filters.js`, `public/js/inventory.js`, `public/js/supply-stock.js`, `public/js/admin-feedback.js`, `public/js/admin-returns.js`, `public/js/requests-management.js` — per-module loaders and filter init, plus the dead `/dashboard` redirect at `requests-management.js:50`.
- `public/css/admin.css`, `public/css/inventory.css` — `.loading-spinner` and `.btn-loading` exist in `inventory.css` but are referenced nowhere in any HTML or JS.
- `server.js:284-297` — page routes; `/admin/*` shell routes and the `/inventory` outlier share one document per module.
- Existing `/api/auth/admin/*` read endpoints (users, registrations, transactions, pickup-confirmations, inventory, announcements, feedback, returns, analytics) are consumed as-is; no API contract change.
- No dependency, permission, or database-schema changes.
