## Why

The Admin sidebar is hand-duplicated static markup in six separate HTML files, and the copies have drifted apart. Five of them share one item order, but `admin-supply-stock.html` has a completely different one — so clicking Supply & Stock reloads the page and the sidebar items visibly jump to new positions. Clicking any other module restores the original order. There is also no runtime reordering logic anywhere: the shifting is entirely caused by the six markup copies disagreeing with each other.

Because the sidebar is rebuilt from scratch on every full page navigation, any per-page order divergence reads to the user as "the sidebar reorders itself based on which module I'm on". The fix is to make the six copies identical so there is only one order, and to make the active route affect styling alone.

Only three of the six copies are actually correct. Four share one order that is close but not canonical, `admin-requests.html` is missing two links entirely, and `admin-supply-stock.html` is in a completely different order.

## What Changes

Establish one canonical physical order for the Admin sidebar `<ul>` and make all six pages use it verbatim:

1. Dashboard
2. Admin Accounts *(super-admin only)*
3. Supply & Stock
4. Inventory Management
5. Return Requests
6. Transactions
7. Announcements
8. Feedback Management
9. Request Management
10. Pickup Confirmations

- Reorder the sidebar `<li>` blocks in all six admin pages to match. `admin-supply-stock.html` receives the largest change — its order is currently almost the reverse of the target. The other five need Supply & Stock and Inventory Management swapped, and Return Requests moved ahead of Transactions.
- Add the two missing links to `admin-requests.html` — **Return Requests** and **Feedback Management**. That page today has 8 items where every other page has 10, so it cannot share the canonical order until both are restored.
- Keep **Admin Accounts** in place at position 2, still gated to super admins by its existing inline `display:none`. A regular admin therefore sees exactly the requested nine items: Dashboard, Supply & Stock, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management, Request Management, Pickup Confirmations.
- Guarantee that no script may reorder, move, insert, or re-parent a sidebar item, and that the active route influences only the `active` class.
- Keep the existing route-derived `active` highlighting from the `fix-admin-sidebar-supply-stock-nav` change, which already works and already touches styling only.

Explicitly **not** changing:**

- No change to the sidebar's visual design — width, gradient, colours, icons, font, font size, border radius, active-state colours, logo, or spacing.
- No change to the header, page content, or any other module.
- No change to `admin.js`, `inventory.js`, or `supply-stock.js` — this is an HTML-only change.
- No new routes, no duplicate nav systems, no second sidebar.
- `Admin Accounts` is not removed; it keeps its link, its route, and its super-admin gate.

## Capabilities

### New Capabilities

- `admin-sidebar-fixed-order`: The invariant that the Admin sidebar presents one fixed, route-independent item order on every admin page, and that the active route changes only the active highlight and never an item's position.

### Modified Capabilities

- `admin-sidebar-navigation`: Created by the in-flight `fix-admin-sidebar-supply-stock-nav` change, which specified a canonical order of Dashboard, Admin Accounts, Inventory Management, Supply & Stock, Return Requests, Request Management, Pickup Confirmations, Transactions, Announcements, Feedback Management. This change **supersedes that ordering**: Supply & Stock and Inventory Management swap, and the three trailing management items move to the end. The other requirements of that capability (always-visible Supply & Stock link, independent direct navigation, route-derived active state, single source of nav visibility) are unchanged and remain satisfied.

## Impact

**Files edited** — sidebar `<ul>` markup only:

| File | Change |
| --- | --- |
| `public/admin.html` | Reorder `<li>` 44-53 to the canonical order |
| `public/inventory.html` | Reorder `<li>` 43-53 to the canonical order |
| `public/admin-returns.html` | Reorder `<li>` 216-225 to the canonical order |
| `public/admin-feedback.html` | Reorder `<li>` 212-221 to the canonical order |
| `public/admin-requests.html` | Reorder `<li>` 56-63 **and add the missing Return Requests and Feedback Management links** |
| `public/admin-supply-stock.html` | Full reorder of `<li>` 286-295 — largest delta of the six |

**Not modified:** all JavaScript (`admin.js`, `inventory.js`, `supply-stock.js`, `admin-filters.js`), all CSS, `server.js`, `routes/`, all controllers. The `active` class remains route-derived at runtime, so no hardcoded `active` needs to be introduced or moved.

**Data/API impact:** none. No schema, dependency, or environment changes.
