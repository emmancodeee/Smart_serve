## 1. Baseline Verification

- [x] 1.1 Record the current sidebar order per page from the static markup: `admin.html` 44-53, `inventory.html` 43-53, `admin-returns.html` 216-225, `admin-feedback.html` 212-221, `admin-requests.html` 56-63, `admin-supply-stock.html` 286-295. Supply & Stock is the last item in all but `inventory.html` and `admin-supply-stock.html`
- [x] 1.2 Grep the sidebar `<ul>` in all six HTML files for `:nth-child`, `:nth-of-type`, or index-based selectors — confirmed the only hits are data-table `th` / `tbody tr` rules in `admin-returns.html` and `admin-feedback.html`; nothing depends on `<li>` position
- [x] 1.3 Grep for `showSupplyStock|isInventoryOpen|expandedInventory|selectedModule|isSupplyStock|supplyStockOpen|inventoryActive` — confirmed zero matches; no conditional-visibility flag exists and none is to be introduced

## 2. Repair The Supply & Stock Page Script Collision

`admin-supply-stock.html:448-449` loads `admin.js` then `supply-stock.js`. Both declare `let allInventory` and `let currentAdminProfile` at top level, so `supply-stock.js` throws `SyntaxError: Identifier 'currentAdminProfile' has already been declared` and never executes. The page renders dead.

- [x] 2.1 Confirm the collision empirically: evaluate `admin.js` then `supply-stock.js` in a shared VM context and capture the `SyntaxError`
- [x] 2.2 Grep all other script files for cross-file references to `supply-stock.js` internals (`loadInventoryItems`, `switchTab`, `handleSupplySubmit`, `handleStockOutSubmit`, `handleStockOutItemChange`, `logout`, `allHistoryRows`, `historyFilter`) to confirm nothing depends on them being global
- [x] 2.3 Wrap the entire body of `public/js/supply-stock.js` in an IIFE — `(function () {` after any leading comment block, `})();` at end of file — so `let allInventory`, `let currentAdminProfile`, `isCurrentSuperAdmin()` and `redirectToLogin()` leave the global lexical environment
- [x] 2.4 Re-run the VM check from 2.1 and confirm `supply-stock.js` now parses with no `SyntaxError`
- [x] 2.5 Confirm no indentation-only churn: the diff for `supply-stock.js` is the two wrapper lines only

## 3. Move The Supply & Stock Link After Inventory Management

Move the existing `<li id="supplyStockNavItem">` block only. Do not rewrite, renumber, or reorder any other `<li>`. Preserve the icon SVG, label, `href="/admin/supply-stock"`, and `li` ID exactly.

- [x] 3.1 `public/admin.html` — move the `supplyStockNavItem` `<li>` (line 53) to sit immediately after the `inventoryNavItem` `<li>` (line 46)
- [x] 3.2 `public/admin-returns.html` — move the `supplyStockNavItem` `<li>` (line 225) to sit immediately after the `inventoryNavItem` `<li>` (line 218)
- [x] 3.3 `public/admin-feedback.html` — move the `supplyStockNavItem` `<li>` (line 221) to sit immediately after the `inventoryNavItem` `<li>` (line 214)
- [x] 3.4 `public/admin-requests.html` — move the `supplyStockNavItem` `<li>` (line 63) to sit immediately after the `inventoryNavItem` `<li>` (line 58)
- [x] 3.5 Confirm `public/inventory.html` (line 47) and `public/admin-supply-stock.html` (line 295) already sit directly after Inventory Management and require no move
- [x] 3.6 Verify all six files now place Supply & Stock immediately after Inventory Management, and that every other link kept its relative position

## 4. Normalise The Two Link Markups

- [x] 4.1 `public/inventory.html` line 47 — replace the HTML entity `&amp;` in the Supply & Stock label with a literal `&`, matching the other five files
- [x] 4.2 `public/admin-requests.html` line 58 — remove the stray `data-view="inventory"` from the Inventory Management link; it matches no `ADMIN_VIEW_PATHS` key and the `data-view` click interceptor at `admin.js:4650` would `preventDefault()` and swallow the navigation to `/inventory`
- [x] 4.3 Confirm the Supply & Stock and Inventory Management link markup is now identical across all six files apart from the `active` class — also added the missing `aria-hidden="true"` to `inventory.html`'s Supply & Stock SVG, which was the last remaining difference

## 5. Make Active State Derived On Every Page

- [x] 5.1 In `public/js/admin.js`, add a shared `updateSidebarActiveLink()` that resolves each `.sidebar-shell a[href], .sidebar a[href]` against `location.origin` and compares normalised `pathname` + `hash`, tracking whether any link matched exactly
- [x] 5.2 Dispatch order: if the pathname comparison produced an exact match, apply it and return; only when nothing matched, fall back to the `data-view` matcher using `getViewFromLocation()`, so the bare `/admin` route still resolves to the dashboard view
- [x] 5.3 Ensure exactly one link can be active at a time — clear `active` from every link before setting it on the match, and confirm `/inventory` and `/admin/supply-stock` are never both active
- [x] 5.4 Replace the inline `data-view` active toggle at `admin.js:500-503` with a call to `updateSidebarActiveLink()`, so initial load, `pushState` SPA navigation, and `popstate` all derive active state through the same path
- [x] 5.5 Add a `hashchange` listener calling `updateSidebarActiveLink()` so hash navigation stays correct
- [x] 5.6 Keep `applySuperAdminUI()`'s explicit `display = ''` for `supplyStockNavItem` (`admin.js:553-556`) and the `id="supplyStockNavItem"` hook, so the link can never be hidden by any script
- [x] 5.7 `public/js/inventory.js` — drop the now-redundant hardcoded `/inventory` active fallback at lines 202-205; the generic pathname match against `href="/inventory"` already covers it

## 6. Keep Inventory Page Nav Logic Equivalent

`inventory.html` deliberately does not load `admin.js` (the two files declare conflicting top-level bindings), so it keeps its own implementation. Make it behaviourally equivalent rather than literally shared.

- [x] 6.1 `public/js/inventory.js` — add the explicit `supplyStockNavItem` unhide to `applySuperAdminSidebar()` (lines 128-148), matching the guarantee `admin.js:553-556` provides, so the link is never hidden on `/inventory`
- [x] 6.2 Add a short comment above `applySuperAdminSidebar()` recording that this page intentionally does not load `admin.js` because of the top-level binding collision, so a future change does not "fix" it back
- [x] 6.3 Confirm `inventory.js` still owns `applyHeaderGreeting()`, `checkAuth()`, `startHeaderClock()`, the `inventoryReadOnlyNotice` show/hide, and inventory data loading — all unchanged
- [x] 6.4 Confirm `inventory.html`'s script list is still exactly `admin-filters.js` then `inventory.js`, and that `admin-filters.js` declares no top-level binding that collides with `inventory.js`

## 7. Make The Active Class Derived, Not Authored

- [x] 7.1 Remove the hand-written `active` class from the Inventory Management and Supply & Stock links in all six HTML files so the derived state owns it
- [x] 7.2 `public/inventory.html` line 45 — remove the redundant `border-yellow-300 bg-yellow-400/15` Tailwind utilities from the Inventory Management link so its active state matches every other link via `admin.css:1616`
- [x] 7.3 Confirm every other `<a>` retains the standard `admin-nav-link` class list, and that `admin.css` is unmodified

## 8. Static Verification

- [x] 8.1 Run `npm test` and confirm no test regressions — 5 failures in `tests/admin-filters.test.js` (`blob.text is not a function`, a jsdom Blob limitation) are pre-existing: confirmed identical `5 failed, 14 passed` on a clean tree with all changes stashed
- [x] 8.2 Grep all six HTML files to confirm exactly one `supplyStockNavItem` per file — no duplicated Supply & Stock button
- [x] 8.3 Evaluate every script pair used by each of the six admin pages in a shared VM context and confirm no `SyntaxError: Identifier ... has already been declared` — all six page script sets now evaluate cleanly under jsdom
- [x] 8.4 Confirm `server.js` routes are untouched: `/inventory` at line 323 and `/admin/supply-stock` at line 295 both still serve their original files, with no new or duplicate routes
- [x] 8.5 Confirm no CSS file, controller, or route was modified — `git diff --stat` touches only the six HTML files, `admin.js`, `inventory.js`, and `supply-stock.js` (plus a pre-existing unrelated `.env.example` edit that was already dirty before this change)

## 9. Manual Browser Verification

Hard-refresh to bypass cached assets before starting. Check each page as both a super admin and a regular admin.

- [ ] 9.1 On `/admin/dashboard` with no clicks made, confirm Inventory Management and Supply & Stock are both visible and Supply & Stock sits directly beneath Inventory Management
- [ ] 9.2 On a viewport at least 768px tall, confirm Supply & Stock is reachable without scrolling the sidebar
- [ ] 9.3 Click Supply & Stock directly from the dashboard — confirm the Supply & Stock page loads in one interaction, with no prior Inventory Management click
- [ ] 9.4 On `/admin/supply-stock`, confirm the page is functional: inventory items load, tabs switch, add-supply and stock-out forms submit, the item dropdown populates, and logout works. This is the first time this script will have run — treat any failure as pre-existing and report it
- [ ] 9.5 Click Inventory Management directly — confirm the Inventory Management page loads and its content and read-only notice are unchanged
- [ ] 9.6 On `/inventory`, confirm only Inventory Management is highlighted; on `/admin/supply-stock`, confirm only Supply & Stock is highlighted; confirm the two are never both active
- [ ] 9.7 Hard-reload `/admin/supply-stock` directly and confirm the Supply & Stock highlight is derived at runtime rather than baked into the HTML
- [ ] 9.8 On the bare `/admin` route, confirm the Dashboard link is highlighted via the `data-view` fallback
- [ ] 9.9 Click Announcements then Dashboard from the sidebar to confirm SPA view switching and its active-state updates still work
- [ ] 9.10 Visit `/admin/returns`, `/admin/feedback`, and `/admin/registrations` and confirm Supply & Stock is visible on each and exactly one link is highlighted per page
- [ ] 9.11 Navigate away from `/inventory` to another admin page and confirm Supply & Stock is still visible
- [ ] 9.12 As a regular admin, confirm Admin Accounts, Request Management, and Pickup Confirmations still gate correctly on `/inventory` and on `/admin/supply-stock`
- [ ] 9.13 Check the browser console on `/admin/supply-stock` and `/inventory` for errors
- [ ] 9.14 Compare the sidebar against the pre-change state — confirm identical width, gradient, icons, typography, spacing, active border, logo, and header
