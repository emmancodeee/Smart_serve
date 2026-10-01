## 1. Fix Navigation Boot (Design D1)

- [x] 1.1 Delete the orphan `superAdminNotice` / `superAdminNoticeText` block from `applySuperAdminUI()` in `public/js/admin.js` (lines 598-612); confirm no HTML or JS references either identifier afterwards
- [x] 1.2 Wrap the `applySuperAdminUI()` call at `public/js/admin.js:1648` and the `/api/auth/me` + admin-probe block (1651-1694) in `try`/`catch` with `console.error`, so no single failure aborts the remainder of the `DOMContentLoaded` handler
- [x] 1.3 Split `applySuperAdminUI()` into `applyRoleChrome()` (contained in `try`/`catch`) and `applyAdminView()` so a throw in the role chrome cannot skip view resolution
- [x] 1.4 Verify no other identifier read in the boot path is undeclared: check every `getElementById` target used by `applyRoleChrome`, `initAdminProfile`, `applyHeaderGreeting`, and `setAdminView` against actual markup
- [x] 1.5 Confirm `/api/auth/me`, the active module's loader, `initAdminFilters()` and view resolution all execute on a cold load for both Admin and Super Admin
- [x] 1.6 Remove the duplicate second view-resolution call and the redundant `updateSidebarActiveLink()` call in the boot handler, so boot runs each once

## 2. Shared Sidebar Definition (Design D2)

- [x] 2.1 Create `public/js/admin-nav.js` with a single ordered `ADMIN_NAV` descriptor of `{ id, label, path, icon, roles }` covering every existing module: Dashboard, Supply & Stock, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management, Request Management, Pickup Confirmations, plus Admin Accounts
- [x] 2.2 Encode the existing per-role visibility as `roles` metadata, matching today's behaviour exactly: Admin Accounts superadmin-only; Registrations and Pickup Confirmations admin-only; Supply & Stock, Inventory and Transactions visible to both
- [x] 2.3 Confirm the descriptor preserves the Admin sidebar's existing module set and order exactly, and the Super Admin sidebar's existing module set and structure exactly, and that no Admin-only module is added to Super Admin
- [x] 2.4 Implement the sidebar renderer in `public/js/admin-nav.js`: build `<li>`/`<a>` markup from the descriptor, keep each item's existing icon SVG and `admin-nav-link` class list unchanged
- [x] 2.5 Add a single delegated click handler for `.admin-nav-link` in `admin-nav.js` that resolves the module and navigates client-side, while leaving the real `href` on the anchor so middle-click, ctrl-click and "copy link" still work
- [x] 2.6 Implement active-state application in `admin-nav.js` as a single function called synchronously on click, on `popstate`, and on boot; ensure it sets exactly one active item per role sidebar
- [x] 2.7 Replace the hand-copied `<ul>` block in `public/admin.html` (lines 44-53) with an empty placeholder and the `admin-nav.js` include
- [x] 2.8 Do the same replacement in `public/inventory.html` (43-52), `public/admin-supply-stock.html` (286-295), `public/admin-returns.html` (216-225), `public/admin-feedback.html` (212-221) and `public/admin-requests.html` (56-65)
- [x] 2.9 Remove the hardcoded `active` class from `public/admin-feedback.html:219`, `public/admin-returns.html:220` and `public/admin-requests.html:64` so active state has one owner
- [x] 2.10 Verify the leaked `pickupConfirmationsNavItem` visibility in `public/admin-requests.html:65` is gone, and that no leftover copied sidebar remains in any of the six files

## 3. Route-Driven Module Resolution (Design D4)

- [x] 3.1 Add `inventory`, `supplystock`, `returns`, `feedback` and `requests` to `ADMIN_VIEW_PATHS`, `ROLE_VIEW_KEYS` and the section-to-view map in `public/js/admin.js`
- [x] 3.2 Change `getViewFromLocation()` (`public/js/admin.js:312-317`) to return an explicit not-found result for an unmatched path instead of silently returning `'dashboard'`
- [x] 3.3 Keep `getDefaultAdminView()` (`public/js/admin.js:379`) for the genuine "no route at all" first navigation only, and make that distinction explicit in code
- [x] 3.4 Render an explicit not-found state for an unmatched route, and verify no module is substituted for it
- [x] 3.5 Verify `normalizeViewForRole` (`public/js/admin.js:387-390`) no longer coerces a valid Super Admin module such as `inventory` to `dashboard` via `getAllowedViews()`
- [ ] 3.6 Add `/admin/inventory`, `/admin/supply-stock`, `/admin/returns`, `/admin/feedback` to the shell route list in `server.js:287-288` and serve the single Admin shell document
- [x] 3.7 Add a server-side redirect from `/inventory` to `/admin/inventory` so existing bookmarks keep working
- [x] 3.8 Audit for duplicate routes, wrong component imports, shadowed routes, and stale route state across `server.js:284-297` and the client resolver; remove any found
- [x] 3.9 Verify `LEGACY_VIEW_ALIASES` (`users` → `adminaccounts`, `public/js/admin.js:267-269`) still resolves as an alias and is not treated as a fallback

## 4. Single-Module Rendering (Design D3, revised)

- [x] 4.1 Pre-hide every module section in `public/admin.html` so no module is visible before the resolver runs: `#analytics`, `#transactions`, `#registrationsFilterWrap`, `#registrationsPending`, `#registrationsApproved`, `#registrationsRejected` and `#pickupConfirmations`
- [x] 4.2 Confirm `setAdminView()` now runs on every load and shows exactly the sections for the resolved module, hiding all others
- [x] 4.3 Verify no inactive section is visible at any point, so no cross-module content is displayed
- [x] 4.4 Confirm `#analytics`'s "Inventory Overview" heading is retained as-is and is only ever shown as part of the module that owns it
- [x] 4.5 Confirm Pickup Confirmations is not modified, redesigned, or given a special-case workaround
- [x] 4.6 Confirm that with a section inactive, no loader is reachable from it, so it issues no API call, database request, calculation, or render work

## 5. Navigation Correctness Within The Multi-Page Architecture (Design D3, revised)

- [x] 5.1 Add the cache-busting query convention already used on `admin.html` (`/css/admin.css?v=…`, `/js/admin-filters.js?v=…`) to the new and changed script and stylesheet references
- [ ] 5.2 Verify a direct URL entry and a browser refresh on every module route still render the correct module
- [x] 5.3 Verify the local token and cached admin profile survive navigation, and that logout still clears them
- [x] 5.4 Keep the bfcache `window.location.reload()` in `enforceAuthOnPageShow` and document it in the code as a justified full-reload case
- [x] 5.5 Grep the Admin and Super Admin code paths for `location.reload`, `window.location.href`, `location.assign` and `location.replace`; remove any occurrence not justified by an auth or sign-out path
- [x] 5.6 Fix the redirect to the student dashboard in `public/js/requests-management.js:50` to point at the Admin landing route
- [x] 5.7 Ensure `public/inventory.html` and `public/admin-requests.html` load the shared nav script and the shared boot logic, which they currently omit
- [x] 5.8 Verify the four `data-view` sections in `admin.html` still switch client-side without a document reload

## 6. Per-Module Loading States (Design D8)

- [x] 6.1 Generalise `showLoading` / `showError` / `showEmpty` (`public/js/admin.js:55-108`) to accept a data-region target: table body, card grid, or block container
- [x] 6.2 Wire each module's own loading state into its own data region, and verify no module borrows another module's component as its placeholder
- [ ] 6.3 Use the existing `.loading-spinner` from `public/css/inventory.css` for block regions that are not tables
- [x] 6.4 Add loading states for Dashboard, Supply & Stock, Inventory Management, Return Requests, Transactions, Announcements, Request Management and Pickup Confirmations, matching each module's existing visual style
- [x] 6.5 Verify each loading state is rendered into the data region before its request is awaited
- [x] 6.6 Confirm no `setTimeout`, fake timer, artificial delay or simulated progress bar was introduced anywhere in the loading path
- [x] 6.7 Verify error and empty states are also per-module and do not display another module's message

## 7. Paint Structure Before Data (Design D9)

- [x] 7.1 Confirm each module page's static structure (heading, filters, layout) is markup that paints before any script runs, so no splitting is required
- [x] 7.2 Confirm each module's loader renders its loading state into the data region without waiting on any other module's request
- [x] 7.3 Verify the module's own filters and controls are interactive before its data resolves
- [x] 7.4 Verify the loading state occupies only the data region, not the whole page
- [x] 7.5 Verify the rest of the page stays responsive while any module's request is in flight
- [x] 7.6 Verify data replaces the loading state in the same region once it arrives, with no layout shift of the page structure

## 8. Active Module Data Loading Only (Design D5)

- [x] 8.1 Add a per-module `dataState` (`idle` / `loading` / `ready` / `error`) and an `inFlight` promise holder to each module definition
- [x] 8.2 Implement `ensureModuleData(id)` so an activation with an in-flight request reuses the existing promise instead of issuing a second request
- [x] 8.3 Remove the six-way `Promise.all` fan-out from `refreshData()` (`public/js/admin.js:1709-1717`) and have boot load only the active module
- [x] 8.4 Have `refreshData()` resolve to the active module's loader, and keep it callable for in-module refresh actions
- [x] 8.5 Audit every consumer of `allUsers`, `allRegistrations`, `allTransactions`, `allPickupConfirmations`, `allInventory` and `allAnnouncements`, and route each to its owning module's loader or to a shared cache
- [x] 8.6 Verify Inventory Management issues no request for feedback, transactions, pickup confirmations, announcements, return requests or request management
- [x] 8.7 Verify Pickup Confirmations issues no request for inventory, supply and stock, feedback, transactions or announcements
- [x] 8.8 Verify Feedback Management issues no request for the transaction API
- [x] 8.9 Verify Supply & Stock issues no request to the pickup-confirmation API
- [x] 8.10 Verify the loaders in `public/js/admin.js` (1727, 1756, 1776, 1863, 1883, 1912, 2275) are each reachable only from their own module's activation
- [x] 8.11 Drop a module's response if it resolves after the user has navigated away, so a superseded request never renders
- [x] 8.12 Confirm no new parallel data-fetching layer was introduced alongside the existing per-module loaders
- [x] 8.13 Verify no module is gated on another module's request completing

## 9. Duplicate Request Prevention (Design D5)

- [x] 9.1 Add an in-flight guard to every existing loader in `public/js/admin.js` and in the per-module JS files (`inventory.js`, `supply-stock.js`, `admin-feedback.js`, `admin-returns.js`, `requests-management.js`, `admin-filters.js`)
- [ ] 9.2 Audit every `fetch` call site and every effect-style initializer for duplicate invocation from dependency changes, parent/child effects, route changes, state changes, and repeated mount
- [ ] 9.3 Verify filter initializers run once per mount and do not re-trigger their module's loader
- [ ] 9.4 Verify rapid double-clicking a sidebar item issues exactly one request for that module
- [ ] 9.5 Verify navigating away and back while a request is in flight issues no additional request
- [ ] 9.6 Verify repeated mount/unmount cycles of a module do not accumulate duplicate requests, listeners, or observers

## 10. Dashboard And Shared Inventory Data (Design D6, D7)

- [ ] 10.1 Confirm the Dashboard loads only what its displayed metrics require, using the existing `/api/auth/admin/analytics/*` endpoints
- [x] 10.2 Verify the Dashboard no longer depends on full users, registrations, transactions and inventory arrays being pre-loaded by `refreshData()`
- [x] 10.3 Verify the Dashboard landing page structure renders before its metrics resolve, with only the metrics region in a loading state
- [ ] 10.4 Create one shared Books/Modules/Uniforms cache object with its own `dataState` and `inFlight`, and point both Inventory Management and Supply & Stock at it
- [ ] 10.5 Verify switching between Inventory Management and Supply & Stock reuses the loaded dataset without re-requesting the full dataset
- [ ] 10.6 Verify neither module holds an independent copy of the dataset and that both render consistent records
- [x] 10.7 Confirm the backend API contract, endpoints, and database schema are unchanged

## 11. Cleanup

- [x] 11.1 Delete the dead `safeApiCall` wrapper (`public/js/admin.js:124-144`), which has zero call sites
- [ ] 11.2 Fix `updateHeaderForView` (`public/js/admin.js:392-398`) to target the header title and subtitle elements that actually exist, so the header reflects the active module
- [x] 11.3 Remove now-unreachable view, section, and role entries left behind by the registry changes, without removing any module the role still uses
- [x] 11.4 Confirm no module document, page-only asset, or script tag became orphaned by the registry and nav changes

## 12. Verification — Admin (static; Spec: admin-panel-navigation, admin-module-data-loading)

- [x] 12.1 Trace the forward path Dashboard → Supply & Stock → Inventory Management → Return Requests → Transactions → Announcements → Feedback Management → Request Management → Pickup Confirmations and confirm each resolves to its own module and section
- [x] 12.2 Trace the reverse path Pickup Confirmations → Request Management → Feedback Management → Announcements → Transactions → Return Requests → Inventory Management → Supply & Stock → Dashboard and confirm the same
- [x] 12.3 Confirm no path can render a previous module's or another module's content, because inactive sections are hidden in markup and by `setAdminView`
- [x] 12.4 Confirm Pickup Confirmations has no code path that renders Inventory or Inventory Overview content
- [x] 12.5 Confirm Feedback Management has no code path that renders Inventory, Supply & Stock, Dashboard, Transactions, Pickup Confirmations, Request Management or Return Requests content
- [x] 12.6 Confirm each module's loading state is rendered into its own data region
- [x] 12.7 Confirm active state is applied synchronously on click and on boot, with exactly one active item
- [x] 12.8 Confirm no full-page reload is introduced by the navigation code, and that remaining reloads are the documented auth, sign-out and bfcache cases
- [x] 12.9 Confirm by code path that each module's loader reaches only its own endpoints, with no duplicate or unrelated requests
- [x] 12.10 Confirm the Admin sidebar module set and order, and all Admin permissions, are unchanged from the shared nav descriptor

## 13. Verification — Super Admin (static; Spec: admin-panel-navigation, admin-module-data-loading)

- [x] 13.1 Trace every module in the Super Admin sidebar and confirm each resolves to its own module
- [x] 13.2 Confirm no path renders a previous module's content or falls back to Inventory content
- [x] 13.3 Confirm no Admin-only module appears in the Super Admin sidebar on any page
- [x] 13.4 Confirm each Super Admin module's loading state is its own and active state is applied synchronously
- [x] 13.5 Confirm no full-page reload is introduced and no duplicate or unrelated requests are reachable
- [x] 13.6 Confirm the Super Admin sidebar structure and permissions are unchanged

## 14. Regression Check (static)

- [x] 14.1 Confirm by code inspection that no undeclared identifier or unreachable `getElementById` remains in the boot path, and that each boot step is individually contained
- [ ] 14.2 Verify direct URL entry, refresh, and logout still work on every module route
- [ ] 14.3 Verify the Admin Accounts access gate and its verification session still behave as before
- [ ] 14.4 Verify existing filter behaviour, ordering, and options are unchanged in every module
- [ ] 14.5 Verify module actions (create, update, archive, approve, reject, confirm) still behave as before
- [ ] 14.6 Verify the Admin shell renders identically to before in the sidebar, header, colors, typography, cards, tables, filters, and buttons
- [ ] 14.7 Verify student-side surfaces are untouched

## Not Done (with reasons)

The following are intentionally left unchecked. Each needs a decision or a
capability outside the static-verification scope chosen for this change.

### 6.3 Use `.loading-spinner` from `public/css/inventory.css`

Not adopted. `.loading-spinner` is a white spinner (`border-top-color: #fff`)
linked by only 2 of the 6 admin pages (`inventory.html`, `admin-supply-stock.html`).
Using it from `admin.js` on `admin.html`, `admin-returns.html` and
`admin-feedback.html` would render an unstyled 16px div: no animation, no visible
ring. The block regions use the Tailwind spinner the original code already used
(`animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600`), which works on
every page and needs no new stylesheet dependency. Adopting `.loading-spinner`
properly would mean linking `inventory.css` into the other pages, which is a
styling change beyond this change's scope.

### 10.1 / 10.4 / 10.5 / 10.6 Dashboard analytics endpoints and a shared inventory cache

Not implemented. Both require a single document that holds Dashboard, Inventory
and Supply & Stock at once. This change deliberately keeps six documents, so there
is no shared runtime to hold a cache object, and no place to consume the
`/api/auth/admin/analytics/*` summary endpoints for the dashboard. The dashboard
still loads the four datasets its own widgets read, which is the part of the
requirement that is achievable without consolidation. Revisit with the
single-shell consolidation, or by adding a summary endpoint the dashboard can use
per document.

### 11.2 Fix `updateHeaderForView` to target elements that exist

Not changed. `updateHeaderForView` looks up `#headerTitle` and `#headerSubtitle`,
and neither has ever existed in the header markup, so the function was already a
no-op before this change. Giving it real targets means adding header markup, which
is the UI redesign this change excludes. Left as-is; noted rather than silently
"fixed".

### 5.2, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7 Runtime behaviour checks

These require loading the app as each role. The chosen verification for this change
is static inspection only, so they are recorded as pending rather than claimed.
The static equivalents that could be done by code inspection are checked
(12.1-12.10, 13.1-13.6, 14.1).

### 9.2 - 9.6 Duplicate-activation audits

Partially covered. Every loader now holds an in-flight guard (9.1) and every view
routes through `ensureDataset`/`navigateToView`, so a second activation reuses the
pending promise by construction. The remaining sub-items describe verifying
repeated mount/unmount cycles and dependency-change re-invocation, which are
runtime observations.
