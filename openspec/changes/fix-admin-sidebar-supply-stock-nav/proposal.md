## Why

The SmartServe Admin sidebar buries the "Supply & Stock" link at the bottom of the navigation list on four of the six admin pages, so it is pushed below the fold and users only ever discover it after navigating to Inventory Management, where it happens to sit adjacent to the Inventory link. On top of that, "which page am I on" is only correctly highlighted on the inventory page and the supply-stock page, and on the supply-stock page the highlight is hardcoded in HTML with no runtime derivation at all.

The practical effect is that a top-level Admin module is effectively undiscoverable from most of the admin UI, and the active state can silently drift out of sync with the current route.

## What Changes

- Move the **existing** "Supply & Stock" `<li>` so it sits immediately after the "Inventory Management" `<li>` in the sidebar of every admin page, not last in the list.
- Establish a single pathname-based active-state rule for the Admin sidebar so the current page's link is highlighted on all admin pages, including `/inventory` and `/admin/supply-stock`, instead of relying on hand-written `active` classes in HTML.
- Guarantee the "Supply & Stock" link is present and visible in the sidebar on **all** admin pages, unconditionally — no role gating, no page-load-script gating, no scroll dependency.
- Remove the divergent, partial copy of the sidebar role-visibility logic in `public/js/inventory.js` so the inventory page stops diverging from `public/js/admin.js`.
- **Repair `/admin/supply-stock`, which is currently non-functional.** `public/js/supply-stock.js` declares `let allInventory` and `let currentAdminProfile` at the top level, colliding with the same top-level declarations in `admin.js` loaded immediately before it. The duplicate `let` raises a `SyntaxError` at parse time, so the page script never executes — the page renders but its data, tabs, forms, and logout are all dead. Wrap `supply-stock.js` in an IIFE to remove the collision.
- Fix markup inconsistencies for the two links so the same link is byte-consistent across pages: the `&amp;` vs literal `&` in the "Supply & Stock" label, and the stray `data-view="inventory"` on the Inventory Management link in `admin-requests.html`.

Explicitly **not** changing:

- No new routes. `/admin/supply-stock` (server.js:295) and `/inventory` (server.js:323) already exist and keep serving the same pages.
- No new or duplicate nav items, no fake pages, no placeholder screens.
- No change to the sidebar's visual design — width, gradient, colours, icons, typography, spacing, the active border, the logo block, or the header.
- No change to the Inventory Management page, the Supply & Stock page, or any API endpoint or data shape.

## Capabilities

### New Capabilities

- `admin-sidebar-navigation`: Behavioural contract for the SmartServe Admin sidebar navigation — which links are present, in what order, on which pages, how each link navigates, and how the active state is derived from the current route.

### Modified Capabilities

None. `openspec/specs/` currently contains only `student-sidebar-design` and `student-feedback-ui-layout`; neither governs the Admin sidebar. The in-flight `add-supply-stock-module` change carries a "Supply & Stock Navigation Link" requirement scoped to the inventory and supply-stock pages only — this change supersedes that scoping with the broader `admin-sidebar-navigation` capability, and the two should be reconciled when `add-supply-stock-module` is archived.

## Impact

**Files edited** (sidebar markup only — no logic, data, or styling changes):

- `public/admin.html` — nav `<li>` at line 53 moves up to follow line 46
- `public/admin-requests.html` — nav `<li>` at line 63 moves up; stray `data-view="inventory"` at line 58 removed
- `public/admin-returns.html` — nav `<li>` at line 225 moves up
- `public/admin-feedback.html` — nav `<li>` at line 221 moves up
- `public/inventory.html` — `&amp;` label normalised; already correctly ordered
- `public/admin-supply-stock.html` — already correctly ordered; hardcoded `active` class becomes derived

**Files edited** (nav visibility / active-state logic):

- `public/js/admin.js` — `applySuperAdminUI()` (~line 524) keeps its unconditional `supplyStockNavItem` unhide; a shared `updateSidebarActiveLink()` is added so `/inventory` and `/admin/supply-stock` participate in active-state derivation
- `public/js/inventory.js` — `applySuperAdminSidebar()` (line 128) gains the same explicit `supplyStockNavItem` unhide `admin.js` already has, so both implementations guarantee the link is never hidden; the redundant hardcoded `/inventory` active fallback (lines 202-205) is dropped
- `public/js/supply-stock.js` — body wrapped in an IIFE to remove the top-level `let` collision that currently prevents the file from executing on `/admin/supply-stock`

**Not affected:** `server.js` routes, `routes/auth.js`, all controllers, all CSS. No dependency changes, no schema changes, no new files.

**Known limitation, deliberately deferred:** `admin.js` and `inventory.js` still each define seven identically-named top-level functions (`setupEventListeners`, `loadInventory`, `startHeaderClock`, `applyHeaderGreeting`, `enforceAuthOnPageShow`, `isCurrentSuperAdmin`, `redirectToLogin`). These shadow each other silently rather than throwing. It is unreachable today because the two files are never loaded on the same page — `inventory.html` omits `admin.js` for exactly this reason — so consolidating them is left to a separate change that would restructure `admin.js` into scoped modules.
