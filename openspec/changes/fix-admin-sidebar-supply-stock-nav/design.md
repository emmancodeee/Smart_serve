## Context

SmartServe is an Express + static-HTML application (`package.json` name `login-app`, entry `server.js`). There is no React, no JSX, and no client-side router. The Admin sidebar is a hand-duplicated `<nav id="sidebar" class="sidebar-shell …">` block copy-pasted into six separate HTML files:

| File | Serves | Nav `<li>` block | Scripts loaded |
| --- | --- | --- | --- |
| `public/admin.html` | `/admin`, `/admin/dashboard`, `/admin/users`, `/admin/accounts`, `/admin/announcements`, `/admin/transactions`, `/admin/registrations`, `/admin/pickup-confirmations` (server.js:287-288) | 44-53 | `admin.js` |
| `public/inventory.html` | `/inventory` (server.js:323) | 43-53 | `admin-filters.js`, `inventory.js` — **no `admin.js`** |
| `public/admin-supply-stock.html` | `/admin/supply-stock` (server.js:295) | 286-295 | `admin.js`, `supply-stock.js` |
| `public/admin-returns.html` | `/admin/returns` (server.js:292) | 216-225 | `admin.js` |
| `public/admin-feedback.html` | `/admin/feedback` (server.js:289) | 212-221 | `admin.js` |
| `public/admin-requests.html` | `/admin/registrations` (server.js:288) | 56-63 | `admin.js` |

### Root cause of the reported symptom

The report is "Supply & Stock only appears after I click Inventory Management". There is **no conditional rendering anywhere**. `#supplyStockNavItem` carries no inline `display:none` in any file, no CSS rule targets it, and the only script that touches it (`admin.js:553-556`) sets `display = ''` — it can only ever show it. The actual defect is **position**, and it is a direct consequence of module sequencing:

1. The `reorder-admin-sidebar-nav` change (complete, 20/20) established a canonical sidebar order and deliberately excluded the Supply & Stock module, which did not exist yet. Its spec fixes the order as: Dashboard, Admin Accounts, Inventory Management, Return Requests, Request Management, Pickup Confirmations, Transactions, Announcements, Feedback Management.
2. The later `add-supply-stock-module` change added a `Supply & Stock` `<li>` to each of the six files, **appended at the end of the list** in five of them. Its own spec only required the link on the inventory and supply-stock pages, and the corresponding manual-verification task (9.2) is still unchecked.
3. `inventory.html` and `admin-supply-stock.html` happen to be the two files where the link sits directly under Inventory Management. Everywhere else it is the **last** item in a ten-item `lg:overflow-y-auto` sidebar, which puts it below the fold on shorter viewports.

So: an Admin lands on the dashboard, misses the buried last item, clicks Inventory Management to look for it, and finds it sitting right next to the Inventory link. The two-step interaction the report describes is a discovery artifact, not a state bug — but the user-visible outcome is exactly the defect, and the fix is to put the link where it is discoverable everywhere.

### Secondary defect: active state

Three inconsistent mechanisms coexist:

- `admin.js:500-503` toggles `.active` by matching the `data-view` attribute against `ADMIN_VIEW_PATHS` (admin.js:242-250). That map has **no entry** for `/inventory` or `/admin/supply-stock`, so both links — which carry no `data-view` — are never managed by it.
- `inventory.js:179-206` (`updateSidebarActiveLink`) compares `window.location.pathname` against each link's resolved `href`, with exact match only, plus a hardcoded `/inventory` fallback. This is the correct model, but it only runs on the inventory page.
- `admin-supply-stock.html:295` hardcodes `class="admin-nav-link active"` in the HTML with **no runtime derivation at all**.

### Blocker discovered during implementation: duplicate top-level bindings

`admin.js`, `inventory.js`, and `supply-stock.js` each declare the same bindings at the top level of a classic script:

| Binding | admin.js | inventory.js | supply-stock.js |
| --- | --- | --- | --- |
| `let allInventory` | 150 | 1 | 2 |
| `let currentAdminProfile` | 154 | 2 | 1 |
| `const ADMIN_PROFILE_CACHE_KEY` | 156 | 4 | — |

Top-level `let`/`const` in classic scripts share one global lexical environment, so a duplicate declaration raises a `SyntaxError` at parse time and the second script never executes. Verified in a shared VM context, in both orders:

```
admin.js  -> inventory.js    SyntaxError: Identifier 'allInventory' has already been declared
inventory.js -> admin.js     SyntaxError: Identifier 'allInventory' has already been declared
admin.js  -> supply-stock.js SyntaxError: Identifier 'currentAdminProfile' has already been declared
```

Two consequences:

1. **`/admin/supply-stock` is broken today.** `admin-supply-stock.html:448-449` loads `admin.js` then `supply-stock.js`, and `supply-stock.js` dies on its first line. The page renders but none of its logic runs — no data load, no tabs, no forms, no logout.
2. **`inventory.html` deliberately avoids `admin.js`** (its script list is only `admin-filters.js` and `inventory.js`, inventory.html:196-197). The omission is a workaround for this collision, not an oversight.

`admin-filters.js` declares no colliding bindings, so it is safe on either page.

Seven top-level *function* names are also defined in both `admin.js` and `inventory.js` — `setupEventListeners`, `loadInventory`, `startHeaderClock`, `applyHeaderGreeting`, `enforceAuthOnPageShow`, `isCurrentSuperAdmin`, `redirectToLogin`. These do not throw; the later definition silently wins. Resolving that is a larger refactor and is out of scope here, but it is why loading `admin.js` on `inventory.html` is not safe even after the `let` collision is fixed.

### Constraints

- The user has explicitly ruled out: new routes, duplicate routes, fake pages, a second Supply & Stock button, a duplicated nav item, and any change to the sidebar's visual design (width, colours, icons, font, typography, spacing, active border, logo, header) or to any other nav item.
- `admin-requests.html` is missing a Return Requests link entirely, and `admin-supply-stock.html` uses a different order again. The user chose "reorder + unify active state" over centralising the nav markup, so the duplication stays.

## Goals / Non-Goals

**Goals:**

- The Supply & Stock link is present, visible, and in the same position on all six admin pages.
- Supply & Stock sits immediately after Inventory Management on every admin page, making it discoverable without scrolling and independent of any prior click.
- Active state is derived from `window.location.pathname` on every admin page, by equivalent implementations.
- Exactly one active link at a time, including on `/inventory` and `/admin/supply-stock`.
- `/admin/supply-stock` actually functions — its page script must parse and run.
- Zero visual change to the sidebar.

**Non-Goals:**

- Extracting the duplicated `<nav>` markup into a shared partial or client-side component. The user selected the surgical option; centralisation is a separate, larger change.
- Converting all admin scripts to scoped modules or a shared bundle, which would let `inventory.html` load `admin.js` and eliminate the seven duplicated function definitions. This is the correct long-term fix and is deliberately deferred.
- Adding the missing Return Requests link to `admin-requests.html`, or fully normalising the order of `admin-supply-stock.html`. Both are pre-existing inconsistencies that predate the Supply & Stock module and are out of scope here.
- Converting `/inventory` and `/admin/supply-stock` into SPA views inside the `admin.html` shell. They are full page loads today and must stay that way.
- Any change to the Inventory Management page, the Supply & Stock page, the API, or the data model.

## Decisions

### D1 — Insert the link after Inventory Management; leave every other link where it is

Move the existing `supplyStockNavItem` `<li>` to sit immediately after the `inventoryNavItem` `<li>` in the six files. Do not renumber, rewrite, or otherwise touch any other `<li>`.

Resulting order on the four files that follow the canonical spec: Dashboard, Admin Accounts, Inventory Management, **Supply & Stock**, Return Requests, Request Management, Pickup Confirmations, Transactions, Announcements, Feedback Management. `inventory.html` and `admin-supply-stock.html` are already correct for the Supply & Stock position and need no move.

This is the smallest change that makes the link discoverable everywhere, and it is a pure insertion into a gap the canonical order already leaves free.

**Alternative considered — centralise the nav into a shared partial.** Rejected by the user in favour of the surgical fix. Noted as the correct follow-up if nav drift recurs.

**Alternative considered — reorder the whole list to match `admin-supply-stock.html`.** Rejected: it would move links the user explicitly asked us not to touch, and would contradict the completed `reorder-admin-sidebar-nav` spec.

### D2 — Adopt the pathname-comparison model already proven in `inventory.js`

Promote `updateSidebarActiveLink()` (inventory.js:179-206) into the shared implementation in `admin.js`, and have it run on every admin page. It already handles the case this change needs: it resolves each link's `href` against `location.origin` and compares normalised `pathname` + `hash`, so `href="/admin/supply-stock"` matches on `/admin/supply-stock` with no `data-view` attribute required.

**Alternative considered — add `data-view="supplystock"` and an `ADMIN_VIEW_PATHS` entry.** Rejected. That map drives SPA view switching via `setAdminView(nextView)` (admin.js:4650-4661), which resolves to a section ID in `SECTION_VIEWS`. Supply & Stock is a separate HTML page with no section in the `admin.html` shell, so it cannot be a `data-view`. Registering a path there would risk routing Supply & Stock into a non-existent section.

### D3 — Dispatch order: pathname match first, `data-view` match as fallback

Run the pathname comparison first. If it produced an exact match, that result stands. Only when no link matched at all does the existing `data-view` matcher (admin.js:500-503) run.

This keeps the existing SPA view switching on `/admin/dashboard`, `/admin/announcements`, etc. — where several routes map to the *same* `admin.html` file and no single `href` can be a unique pathname match in the general case — while guaranteeing that the full-page-load routes (`/inventory`, `/admin/supply-stock`, `/admin/returns`, `/admin/feedback`) get correct, deterministic highlighting. The `/inventory` hardcoded fallback at inventory.js:202-205 becomes redundant and is removed.

**Trade-off accepted:** a pathname match takes precedence over `data-view`. For the routes where both could fire, the pathname is the more specific signal, so this is the correct precedence.

### D4 — De-collide `supply-stock.js`; keep `inventory.js` self-contained

**Revised during implementation.** The original plan was to load `admin.js` on `inventory.html` and delete `applySuperAdminSidebar()` from `inventory.js`. The duplicate-binding blocker above makes that unsafe: even after fixing the `let` collision, the seven duplicated function names would silently shadow each other and whichever set of listeners lost would never attach.

Revised approach, in two parts:

**Part 1 — repair `/admin/supply-stock`.** Wrap the body of `supply-stock.js` in an IIFE so its `let allInventory`, `let currentAdminProfile`, `function isCurrentSuperAdmin()`, and `function redirectToLogin()` stop entering the global lexical environment. This removes the `SyntaxError` and lets the page's script actually run. The file is already a single scope with no reliance on its declarations being global — its only inline handler is `onclick="this.parentElement.remove()"` (supply-stock.js:52), and every other handler is wired with `addEventListener` inside its own `DOMContentLoaded` — so wrapping is behaviour-preserving. `supply-stock.js` then reads and writes its own private `currentAdminProfile` and `allInventory`, and `admin.js` keeps its own.

**Part 2 — leave `inventory.html` as it is.** It keeps `admin-filters.js` and `inventory.js` and does not load `admin.js`. `inventory.js` retains `applySuperAdminSidebar()`, with the addition of an explicit `supplyStockNavItem` unhide so it satisfies the same guarantee `admin.js:553-556` provides, and the same pathname-based `updateSidebarActiveLink()` it already has. The two implementations are behaviourally equivalent rather than literally shared, which is what the "Equivalent Nav Visibility And Active State" requirement encodes.

**Alternative considered — wrap all three scripts in IIFEs and share the duplicated functions explicitly.** Rejected as too large for this change: it means restructuring a 4685-line file and introducing a shared module, with real regression risk to unrelated admin behaviour. Worth doing, but as its own change.

**Alternative considered — rename the colliding bindings in `supply-stock.js`.** Rejected in favour of the IIFE: renaming only fixes the three `let`/`const` bindings, leaving `isCurrentSuperAdmin` and `redirectToLogin` to shadow `admin.js`'s versions, which is a latent bug of the same family. The IIFE closes the whole class of problem for that one file at no greater cost.

### D5 — Active class becomes derived, not authored

Remove the hand-written `active` class from the Inventory Management and Supply & Stock links in all six files and let the shared derivation set it on load.

Each of those two links therefore needs its `<a>` to carry a class list identical to every other link's, so the derived state looks identical everywhere. The Tailwind `border-yellow-300 bg-yellow-400/15` currently on `inventory.html:45` is redundant with `admin.css:1616`'s `!important` border and is removed so the two links match the rest of the sidebar.

Because the derivation runs on `DOMContentLoaded` there is a brief window before hydration where no link is active. This is invisible in practice (the derivation is synchronous at DOMContentLoaded) and strictly better than the current state, where `admin-supply-stock.html` has no derivation at all.

**Alternative considered — leave the hardcoded classes and only add derivation.** Rejected: two sources of truth for the same state is precisely the fragility being removed, and a stale hardcoded class would survive a future route change.

### D6 — Normalise the two link markups, nothing else

While moving the `<li>`s, make the two links byte-identical across files apart from the `active` class:

- `inventory.html:47` uses the HTML entity `&amp;`; the other five use a literal `&`. Standardise on the literal `&`, matching the five-file majority and the `<title>`/heading on `admin-supply-stock.html`.
- `admin-requests.html:58` carries a stray `data-view="inventory"`. Remove it. It matches no key in `ADMIN_VIEW_PATHS`, so it is inert today, but it makes the Inventory link the only one in the codebase that would be captured by the `data-view` click interceptor at admin.js:4650 — which calls `preventDefault()` and would swallow the navigation to `/inventory`. This is a latent bug and the reason it is worth fixing while the file is open.

The icon SVGs, labels, `href`s, and `li` IDs are already consistent and are left alone.

### D7 — Keep the existing `id="supplyStockNavItem"` hook

`admin.js:553-556` looks the item up by ID to guarantee `display = ''`. That is the right defensive shape and the hook is what makes the guarantee checkable, so the ID stays and the explicit unhide is kept rather than deleted as redundant.

## Risks / Trade-offs

**[Wrapping `supply-stock.js` in an IIFE could break a dependency on one of its globals]** → Its only inline handler is `onclick="this.parentElement.remove()"`; all other handlers are registered via `addEventListener` inside its own `DOMContentLoaded`, and no other file calls into it. Mitigation: grep for cross-file references to `loadInventoryItems`, `switchTab`, `logout`, and `handleSupplySubmit` before wrapping, and confirm the tabs, both forms, the item dropdown, and logout all work on `/admin/supply-stock` afterwards.

**[`admin.js` and `inventory.js` still duplicate seven function names and can still shadow each other]** → Accepted and explicitly deferred. They are not loaded on the same page, so the shadowing is currently unreachable. Mitigation: recorded as follow-up work; the "Equivalent Nav Visibility And Active State" requirement covers the behaviour that matters today, and a comment in `inventory.js` should record why it stays separate.

**[Reordering `<li>` elements could break a position-dependent selector]** → Every existing selector is by ID or by `data-view`, never by `:nth-child` or index. The prior `reorder-admin-sidebar-nav` change already moved items and its spec asserts this is safe. Verified: the only `:nth-*` selectors in the six files target data-table `th` and `tbody tr` rules. Mitigation: after the move, re-grep for `:nth-child` and `:nth-of-type` against the sidebar `<ul>` and confirm nothing depends on position.

**[`/admin/supply-stock` becoming functional for the first time may surface latent bugs in that page's code, which has apparently never run in a browser]** → The page was written but blocked by the `SyntaxError`, so its code is untested. Mitigation: verify the page end-to-end after the fix — data load, tab switching, add-supply submit, stock-out submit, item dropdown, and logout — and treat any failure as pre-existing rather than caused by the nav change. Report rather than silently expand scope.

**[Losing the hardcoded `active` class could leave a page momentarily without a highlight]** → The derivation runs synchronously at `DOMContentLoaded`. Mitigation: visually confirm the highlight on `/inventory` and `/admin/supply-stock` immediately after the edits, and on a hard reload of `/admin/supply-stock` to confirm the derived class is what is now doing the work.

**[The fix is invisible in a code review of the JS, since the primary defect is in HTML ordering]** → Mitigation: the specs encode the ordering as a normative requirement with scenarios, and the manual verification pass walks all six pages in both a fresh-load and a post-Inventory-click state.

**[`admin-requests.html` still lacks a Return Requests link and `admin-supply-stock.html` still has a different order]** → Accepted, out of scope, and explicitly called out in the proposal's Non-Goals. These are pre-existing inconsistencies from before the Supply & Stock module, and fixing them would mean moving links the user asked us not to touch. Mitigation: recorded as follow-up work rather than silently absorbed here.

## Migration Plan

Static assets only — no data migration, no deploy coordination, no cache-busting requirement beyond a normal hard refresh during verification.

Rollback is a straight revert of the eight touched files. No database, no API, and no state changes are involved, so there is nothing to unwind beyond the source edits.

Verification order: `/admin/dashboard` → `/inventory` → `/admin/supply-stock` → `/admin/returns` → `/admin/feedback` → `/admin/registrations`, checking on each page that (a) Supply & Stock appears directly under Inventory Management, (b) it is visible without scrolling, (c) clicking it lands on the Supply & Stock page, and (d) exactly one link is highlighted and it is the current page's.

## Open Questions

- Should the missing Return Requests link on `admin-requests.html` and the divergent order on `admin-supply-stock.html` be folded into a follow-up change, or fixed here? Currently assumed follow-up, per the agreed scope.
- Should `/inventory` and `/admin/supply-stock` eventually be absorbed into the `admin.html` SPA shell as real `data-view` sections? Out of scope here; noted as a possible future simplification of the active-state logic.
