## Context

SmartServe's Admin/Super Admin surface is a multi-page vanilla-JS app: six hand-written HTML documents each embedding a copy of the same sidebar, plus `public/js/admin.js` (174 KB) which owns view resolution, role gating, and most data loading. There is no router, no framework, and no `useState` — the "active page" is a `window.location`-derived view key resolved by `getViewFromLocation()` and applied by `setAdminView()`, which toggles `style.display` on section elements already present in the DOM.

Two independent defects produce the reported symptoms.

**Defect 1 — navigation boot aborts.** `applySuperAdminUI()` reads `superAdminNotice` at `public/js/admin.js:598` (plus `superAdminNoticeText` at 603-604). Neither identifier is declared anywhere in the repo, and no element with those IDs exists in any HTML file. In a classic script an undeclared identifier read throws `ReferenceError`. `applySuperAdminUI()` is invoked from the `DOMContentLoaded` handler at line 1648 — *before* the `try` block at 1651 and before any `await`. The throw therefore rejects the async listener and silently halts it, so lines 1654 (`/api/auth/me`), 1696-1697 (`applySuperAdminUI`, `applyViewFromLocation`), 1700 (`refreshData`), 1705 (`initAdminFilters`) and 1706 never execute, and the tail of `applySuperAdminUI` itself (616-625: `initAdminProfile`, `applyHeaderGreeting`, `history.replaceState`, `setAdminView`) never runs. `currentAdminProfile` stays `null`; role gating silently no-ops; filters never initialize; **and `setAdminView()` is never called, so no module is ever hidden.**

**Defect 2 — the shell ships every module visible.** `#analytics` — whose heading is literally "Inventory Overview" (`public/admin.html:95-96`) — has no `style="display:none"`, and neither do `#transactions` (396), `#registrationsFilterWrap` (418), `#registrationsPending` (422), or `#pickupConfirmations` (485). Only `#announcements` (190), `#adminAccounts` (300) and `#users` (373) are pre-hidden. With `setAdminView()` never running, a cold load of `/admin/dashboard` paints Inventory Overview, Transactions, the Request Management filter and Pending registrations, and Pickup Confirmations all stacked and simultaneously visible. That is precisely "click Pickup Confirmations → Inventory content appears", and it is why the *first* module in document order wins the top of the viewport regardless of the route.

Contributing factors:

- **Route config is incomplete and has a silent fallback.** `getViewFromLocation()` returns `'dashboard'` for any unmatched path (`admin.js:315`, `getDefaultAdminView` 379). `ADMIN_VIEW_PATHS` (242-250) has no `inventory` key; `ROLE_VIEW_KEYS.superadmin` (238-241) has no `inventory`; `SECTION_VIEWS` (229-237) has no `inventory`. The sidebar links Inventory to `/inventory` (outside the `/admin/*` namespace), so it always resolves to Dashboard.
- **Most clicks are full page loads.** Only the four `data-view` links inside `admin.html` are client-side; Supply & Stock, Inventory, Return Requests, Feedback and Request Management are hard `href` navigations to separate documents.
- **`inventory.html` and `admin-requests.html` do not load `admin.js` at all** (their script lists are `admin-filters.js` + `inventory.js` and `admin-filters.js` + `requests-management.js` respectively). So no role gating, no auth boot, and no active-link logic runs on those pages. `admin-requests.html:65` also omits the `style="display:none"` on `pickupConfirmationsNavItem` that all five other copies carry, leaking an Admin-only module into the Super Admin nav there.
- **Six drifting sidebar copies.** `admin-supply-stock.html`, `admin-feedback.html` and `admin-returns.html` sidebars have no `data-view` attributes at all; `admin-feedback.html:219`, `admin-returns.html:220` and `admin-requests.html:64` hardcode the `active` class; `inventory.html:46` and `admin-supply-stock.html:288` never mark themselves active.
- **Eager preload.** `refreshData()` (1709-1717) fires six loaders in parallel plus `loadAnalytics()` on every boot, so every module pays for every other module's data.
- **No real loading states.** `showLoading`/`showError`/`showEmpty` (55-108) have exactly one call site each, all on `adminAccountsTable` (1779/1788/1805). `.loading-spinner` and `.btn-loading` exist in `public/css/inventory.css` but are referenced by nothing. `updateHeaderForView` (392-398) targets `#headerTitle`/`#headerSubtitle`, which do not exist in any markup, so the header never updates.
- **No dedupe guard.** Once boot survives, `applyViewFromLocation()` runs at both 1697 and 1706 and `updateSidebarActiveLink()` at 1638, 544 and 1637 — with no in-flight guard on any loader.

## Goals / Non-Goals

**Goals:**

- Make navigation boot survive to completion for both roles, with every step contained so no single failure can abort the rest.
- Guarantee exactly one module is mounted and visible at any time, driven by the route, with no cross-module content and no generic module fallback.
- Make the sidebar active highlight update synchronously on click, on every page, with one shared sidebar definition replacing the six hand-copied blocks.
- Replace full-page reloads with client-side navigation for sidebar clicks, while keeping direct URL entry and back/forward working.
- Give every module its own loading state so the page structure (heading, filters) paints before data resolves.
- Load only the active module's data, once per activation, reusing the existing loaders and endpoints.
- Share the Books/Modules/Uniforms source between Inventory Management and Supply & Stock.

**Non-Goals:**

- No visual redesign, no changes to colors, typography, cards, tables, filters, buttons, header, or landing page layouts.
- No change to role permissions, module sets, or the Admin sidebar's existing order.
- No new framework, router library, build step, or runtime dependency.
- No backend API contract change and no new endpoints beyond reusing the existing summary/analytics ones.
- No special-casing of Pickup Confirmations, Feedback, or Inventory — the fix is global.
- No artificial delays, fake timers, or simulated progress.
- Student-side surfaces (`dashboard.html`, `feedback.html`, `returns.html`, `schedule.html`, `profile.html`) are untouched.

## Decisions

### D1. Fix the crash by removing the orphan block, not by declaring the identifier

`applySuperAdminUI()` lines 598-612 are dead code for markup that does not exist. Declare `superAdminNotice` as a null-checked `const superAdminNotice = document.getElementById('superAdminNotice')` and the notice logic stays silently off forever — the same latent problem, now hidden behind a `const`. The honest fix is to delete the block, since no HTML renders that notice and no spec requires it.

Separately, `applySuperAdminUI()` and the boot handler get a `try`/`catch` with a `console.error`. Requirement "Navigation Boot Completes Without Aborting" is about a *class* of bug, not one line: `currentAdminProfile` being `null` is what made `isCurrentSuperAdmin()` quietly return `false` and made the role gates a no-op. Containing future throws is the durable part.

*Alternative considered:* wrap only line 1648 in a `try`/`catch`. Rejected — the throw at 598 would be swallowed, `setAdminView()` would still never run on the failure path, and the same class of bug returns the next time someone touches boot.

### D2. One shared sidebar definition rendered by JS, replacing the six copies

Add `public/js/admin-nav.js` exporting a single `ADMIN_NAV` descriptor: ordered list of `{ id, label, path, icon, roles }`. Each page keeps its own `<ul id="adminNav">` placeholder and one `<script src="/js/admin-nav.js">`. The script builds the `<li>`/`<a>` markup, applies per-role visibility from the resolved profile, and owns active-state application.

This directly kills the drift: `admin-requests.html:65`'s leaked `pickupConfirmationsNavItem`, the hardcoded `active` classes in three files, the missing `data-view` attributes in three files, and the six-way duplication of a 10-item list.

*Alternative considered:* keep the markup in HTML and fix the six copies by hand. Rejected — it preserves the mechanism that caused the drift and offers no place to hang `roles` metadata; the next edit reintroduces the bug.

*Alternative considered:* server-render the sidebar from a shared partial. Rejected — this app uses `res.sendFile` (`server.js:284-297`) with no template engine, so this would require introducing one.

### D3. Correct per-page module resolution within the existing multi-page architecture

**Revised after scoping review.** The change keeps the six existing documents. Merging all ten modules into one shell with `pushState` routing (the original D3) would satisfy "no full reload" and "only the active module is mounted" in the strongest form, but it requires relocating ~113 KB of module markup and retiring five documents — a blast radius disproportionate to the regression. The reported bug is caused by wrong content rendering and unnecessary fetching, both of which are fixed without that move. The accepted trade-off is that cross-document sidebar clicks remain full page loads, which the request explicitly permits "unless absolutely required by the current architecture".

What replaces mount/unmount:

**Each page resolves exactly one module, and the resolver never substitutes another.** Every document declares which module it is, and `admin.js` renders that module and hides the rest. `admin.html` is the only multi-section document; it keeps `display` toggling between its six in-DOM sections, but every section is now pre-hidden in the markup so the correct one is the only thing ever visible. Within `admin.html`, the four `data-view` links continue to switch sections client-side, so those navigations do not reload.

**Sections are hidden, not unmounted — and that is acceptable only because nothing else is mounted behind them.** The six `admin.html` sections remain in the DOM, which is weaker than true unmounting. This is made safe by D5: a hidden section has no loader reachable from its own activation, so it issues no API call and performs no render. A section is therefore inert until it becomes active. This is a deliberate, documented limitation, not the "mount everything and hide with CSS" pattern the request rejects — that pattern is defined by *eagerly fetching and rendering all modules*, which D5 eliminates.

**Boot is now survivable, which is what actually makes per-page resolution reliable.** Before the D1 fix, `setAdminView()` never ran, so the pre-hide in the markup was the only thing standing between a cold load and five modules painting at once. With the boot sequence fixed, the resolver runs on every load and the pre-hide becomes a belt-and-braces guard against a flash before JS executes.

*Alternative considered:* the original single-shell consolidation. Deferred, not rejected — it remains the correct end state for the "no full reload" requirement and is recorded here as follow-up work.

*Alternative considered:* true mount/unmount within `admin.html` only, leaving the other five pages alone. Rejected for now — it would require extracting six sections out of `admin.html` while the pages that link to them still exist, splitting the module loading code across two incompatible mechanisms for no gain that the pre-hide + lazy-loading combination does not already provide.


### D4. Extend the view registry so `inventory` is a first-class route, and never fall back to `dashboard`

Add `inventory`, `supplystock`, `returns`, `feedback` and `requests` to the view/path/role/section tables, and add the matching `/admin/inventory` etc. paths. `server.js` gains `/admin/inventory` → shell alongside the existing `adminPageHandler` list, and `/inventory` redirects to `/admin/inventory` so the old bookmark keeps working.

Change the resolver so an unmatched route yields an explicit not-found state instead of `getDefaultAdminView()`. This is the requirement "No silent fallback": as long as `getViewFromLocation()` returns `dashboard` for anything it does not recognise, "Inventory Management as a generic fallback" remains one map entry away from returning. The genuine default — first navigation with no route at all — stays `dashboard` and is expressed as *absence of a route*, not as *a route that matched nothing*.

The existing `LEGACY_VIEW_ALIASES` (`users` → `adminaccounts`) stays; it is a deliberate alias, not a fallback.

*Alternative considered:* keep `/inventory` as the canonical path. Rejected — one namespace under `/admin/*` makes the resolver, the nav descriptor, and the route table agree, and removes the outlier that caused this class of bug.

### D5. Per-module loaders with an in-flight guard, replacing the `refreshData()` fan-out

Give each module definition a `load(context)` and a module-level `dataState` (`idle | loading | ready | error`) plus an `inFlight` promise. `ensureModuleData(id)` returns the existing `inFlight` promise when a request is already pending, so a second activation during flight reuses it. `refreshData()`'s six-way `Promise.all` on boot is removed; boot resolves the active module and loads only that.

*Alternative considered:* a `Map` of `id -> {state, inFlight}` owned by `admin.js` rather than by each module. Equivalent in effect; co-locating state with the module that owns it keeps the loader and its guard adjacent. Chosen per-module so `inventory.js` and `supply-stock.js` can share one cache object explicitly (D6).

### D6. One shared Books/Modules/Uniforms cache for Inventory and Supply & Stock

Both modules read the same real Books, Modules and Uniforms data. Give them a single shared cache object with its own `dataState`/`inFlight` pair, so navigating between them reuses the loaded dataset instead of re-requesting. The two modules keep separate *rendering*; only the data is shared. This satisfies "Reuse the existing shared data source where appropriate" and "Do not create duplicate datasets" without merging the two pages.

### D7. Dashboard uses the existing analytics endpoints only

`loadAnalytics()` already has dedicated endpoints available under `/api/auth/admin/analytics/*` (`funnel`, `inventory`, `noshow`, `dashboard` — `routes/auth.js:111-114`). The Dashboard keeps calling those and stops relying on `refreshData()` having pre-loaded full users, registrations, transactions and inventory arrays. No new endpoint is added.

### D8. Reuse the existing loading primitives; wire them per module

`showLoading`/`showError`/`showEmpty` (`admin.js:55-108`) already emit a Tailwind spinner row into a table container. They are generalised to take a data-region target (table body, card grid, or block container) and are invoked by each module's own data region, so the indicator is the module's own rather than a borrowed component. `.loading-spinner` in `public/css/inventory.css` is used where a block region (not a table) needs a spinner.

No timer is introduced anywhere. The spinner shows while `dataState === 'loading'` and is replaced when the promise settles.

### D9. Page structure paints before data; only the data region is gated

Each page's module markup is already split naturally into a page structure (heading, filter controls, layout, table shell) and a data region (the table body, card grid, or list container). The page structure is static markup in the document and therefore paints before any script runs. The per-module loader's job is only to render into the data region: render the module's loading state there immediately, then replace it with rows when the request settles. The static structure needs no splitting, because the documents already separate it.

### D10. Containment and hygiene cleanups that ride along

- `safeApiCall` (`admin.js:124-144`) is dead — zero call sites. Delete it rather than leave an unused wrapper that a future change might adopt.
- `updateHeaderForView` (392-398) targets `#headerTitle`/`#headerSubtitle`, which exist in no markup. The real title elements are resolved from the shell so the header reflects the active module instead of silently doing nothing.
- `requests-management.js:50` redirects to `/dashboard`, which is the **student** dashboard (`dashboard.html` loads `student-header.js` + `dashboard.js`). Corrected to the admin landing route.
- `enforceAuthOnPageShow` (425-436) calls `window.location.reload()` on a `pageshow` with `event.persisted` (bfcache restore). That is a legitimate necessity — a persisted page's JS state is stale — so it is retained and documented rather than removed, per the "unless absolutely required" clause.

## Known Limitations Of This Scope

- **Cross-document sidebar clicks are still full page loads.** Supply & Stock, Inventory Management, Return Requests, Feedback Management and Request Management each live in their own document, so navigating between documents re-boots the app. The four `data-view` sections inside `admin.html` switch client-side. Closing this requires the deferred single-shell consolidation in D3.
- **`admin.html`'s six sections are hidden rather than unmounted.** They remain in the DOM. They are inert — no loader is reachable from an inactive section, so no request or render occurs for them (D5). Fully unmounting them is part of the deferred consolidation.
- **No `pushState` routing.** Not required for this scope; every document is entered by a real navigation and resolves itself on boot.
- **Verification is static.** The navigation walks in tasks 12-14 are satisfied by tracing code paths, not by driving a browser.

## Risks / Trade-offs

- **Risk: extracting six module bodies out of their documents is a large diff that can silently break module behaviour.** → Mitigation: move markup verbatim without class or structure changes; verify each module end-to-end against the Admin and Super Admin navigation walks in the specs before touching its loader. Sequence the extraction as its own task group ahead of the loading work so a regression is attributable.
- **Risk: the six sidebars are hand-copied, so a hand-edit could be missed.** → Mitigation: delete the copied `<ul>` blocks as part of D2 rather than leaving them alongside the renderer; a leftover copy is visibly wrong in review.
- **Risk: `/inventory` → `/admin/inventory` changes a live URL.** → Mitigation: server-side redirect preserves existing bookmarks and any external links; do not remove `/inventory` until the redirect is confirmed.
- **Risk: removing the boot `Promise.all` means cross-module widgets that implicitly depended on a preloaded array now render empty.** → Mitigation: audit every consumer of `allUsers`/`allRegistrations`/`allTransactions`/`allPickupConfirmations`/`allInventory`/`allAnnouncements` and route each to its owning module's loader or to a shared cache; this audit is a required task, not a follow-up.
- **Risk: mount/unmount changes module state lifecycles — local UI state inside an unmounted module is lost on navigation.** → Mitigation: state that must survive navigation (filters, pagination, cached data) is lifted to the shared cache or session state rather than kept in a module instance. This is the same tension the existing "stay on page, switch module" filter behaviour already has, and it is resolved the same way.
- **Risk: faster page transitions make double-click and rapid clicking more likely to expose in-flight races.** → Mitigation: D5's `inFlight` reuse plus D4's single-resolution path means a superseded response is dropped rather than rendered, because a module is only written to if it is still the active module.
- **Risk: `admin-filters.js` initializers currently run once per page load for every filter container in the document.** → Mitigation: under mount/unmount each module initializes its own filters on mount; verify existing filter ordering and behaviour is unchanged (see the completed `standardize-filter-ordering` and `dedupe-filter-options` work).
- **Trade-off: mount/unmount costs a re-render of the module's DOM on every navigation, whereas `display` toggling was free.** → Accepted. The cost is a few hundred DOM nodes against eliminating six simultaneous module mounts, their API calls, and their calculations on every page load. Cached data means no re-fetch, so the re-render is local and synchronous.
- **Trade-off: a single shell document is larger than today's `admin.html`.** → Accepted, and mitigated by loading only the active module's module script; module code is split out rather than inlined, so the initial payload is not materially larger than `admin.html` plus its per-page scripts combined.
