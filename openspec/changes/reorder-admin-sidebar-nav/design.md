# Design for reorder-admin-sidebar-navigation

## Problem Statement

The admin sidebar navigation order does not reflect the preferred prioritization. The user wants the super admin to see, in order: Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management.

The sidebar is **shared markup duplicated across five static HTML pages** — there is no templating/component system. Four pages have a 9-item sidebar; the fifth has 7 items.

## Constraints

- **Reorder only**: only the physical order of the existing `<li>` elements inside the sidebar `<ul>` may change.
- **Preserve everything else exactly**: icon SVGs, label text, `href`, `data-view`, `li` IDs, `active` class, `style="display:none;"` on Admin Accounts, whitespace/structure of each `<li>`.
- **Do not modify** `public/js/admin.js`, `public/js/inventory.js`, `public/js/admin-filters.js`, or any CSS. All role-based visibility happens client-side by `element.style.display` toggling referencing item IDs, so it is position-independent and untouched.
- **Request Management and Pickup Confirmations stay in their current DOM spots** (positions 5 and 6) — the user explicitly asked to keep them in place. They are hidden for super admins, so they don't affect the super-admin-visible order.

## Current vs. Target Physical Order

### 9-item pages: `admin.html`, `inventory.html`, `admin-feedback.html`, `admin-returns.html`

| Pos | Current | New |
| --- | ------- | --- |
| 1 | Dashboard | Dashboard |
| 2 | Announcements | Admin Accounts |
| 3 | Admin Accounts | Inventory Management |
| 4 | Transactions | Return Requests |
| 5 | Request Management | **Request Management (kept)** |
| 6 | Pickup Confirmations | **Pickup Confirmations (kept)** |
| 7 | Feedback Management | Transactions |
| 8 | Return Requests | Announcements |
| 9 | Inventory Management | Feedback Management |

Super-admin-visible result: Dashboard → Admin Accounts → Inventory Management → Return Requests → Transactions → Announcements → Feedback Management (the two hidden items are skipped). This matches the requested order exactly.

### 7-item page: `admin-requests.html`

Contains only Dashboard, Announcements, Admin Accounts, Transactions, Request Management, Pickup Confirmations, Inventory Management (no Return Requests, no Feedback Management).

| Pos | Current | New |
| --- | ------- | --- |
| 1 | Dashboard | Dashboard |
| 2 | Announcements | Admin Accounts |
| 3 | Admin Accounts | Inventory Management |
| 4 | Transactions | Transactions |
| 5 | Request Management | **Request Management (kept)** |
| 6 | Pickup Confirmations | **Pickup Confirmations (kept)** |
| 7 | Inventory Management | Announcements |

## Implementation Approach

For each of the five files, reorder the `<li>` elements to match the target physical order above by cutting-and-pasting the existing `<li>` blocks — no other edits inside the `<ul>`.

## Verification

1. Diff each file and confirm the only changes are the physical order of `<li>` elements; every other line is byte-identical (including the exact set of `active` classes, which must be present on the same items, e.g. Inventory Management keeps `active` on `inventory.html`).
2. Confirm Admin Accounts still carries `style="display:none;"` at whatever position it now occupies.
3. Confirm no CSS or JS files changed.
4. Grep for the IDs in `admin.js` / `inventory.js` (`announcementsNavItem`, `adminAccountsNavItem`, `transactionsNavItem`, `registrationsNavItem`, `pickupConfirmationsNavItem`, `inventoryNavItem`) and verify each ID still appears once per page.
5. Visual/`file://` spot-check that sidebar ordering renders correctly.