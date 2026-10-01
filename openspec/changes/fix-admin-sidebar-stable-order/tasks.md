## 1. Baseline Verification

- [x] 1.1 Record the pre-change sidebar item sequence for all six pages (`public/admin.html`, `public/inventory.html`, `public/admin-returns.html`, `public/admin-feedback.html`, `public/admin-requests.html`, `public/admin-supply-stock.html`) so the delta is provable
- [x] 1.2 Record the pre-change `href` of every nav item and the item count per page, to prove no link is added, removed, or retargeted by this change
- [x] 1.3 Confirm `git status` shows only the expected uncommitted files, and leave the unrelated dirty `.env.example` untouched

## 2. Order Verification Harness

- [x] 2.1 Write a throwaway Node script that extracts the sidebar `<ul>` label/href sequence from each of the six admin HTML files (no dependencies; use the existing `C:\Users\Dja\AppData\Local\Temp\opencode\collision-test\` scratch area)
- [x] 2.2 Encode the canonical order in that script: Dashboard, Admin Accounts, Supply & Stock, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management, Request Management, Pickup Confirmations
- [x] 2.3 Run it against the unmodified tree and confirm it reports the current divergence, including `admin-supply-stock.html` out of order and `admin-requests.html` missing Return Requests

## 3. Reorder the Outlier Page

- [x] 3.1 Reorder the sidebar `<li>` blocks in `public/admin-supply-stock.html` to the canonical order, moving each block intact with its classes, `href`, icon, and label unchanged
- [x] 3.2 Confirm Supply & Stock now sits at position 3 and Inventory Management at position 4 in that file
- [x] 3.3 Run the order script and confirm `admin-supply-stock.html` now passes

## 4. Reorder the Five Matching Pages

- [x] 4.1 Reorder the sidebar `<li>` blocks in `public/admin.html` so Supply & Stock precedes Inventory Management and Return Requests precedes Transactions
- [x] 4.2 Apply the same reorder to `public/inventory.html`
- [x] 4.3 Apply the same reorder to `public/admin-returns.html`
- [x] 4.4 Apply the same reorder to `public/admin-feedback.html`
- [x] 4.5 Run the order script and confirm those four files pass

## 5. Complete Nav Coverage

- [x] 5.1 Add the two missing links to `public/admin-requests.html` — Return Requests at position 5 and Feedback Management at position 8 — matching the markup of the equivalent items in the other five pages
- [x] 5.2 Run the order script and confirm `admin-requests.html` now passes with all ten items
- [x] 5.3 Confirm every page's item count is ten and all six `href` sets are now identical, and that no pre-existing `href` changed relative to the 1.2 baseline

## 6. Active State Regression Check

- [x] 6.1 Confirm no new hardcoded `active` class was introduced, and that the three pre-existing ones (`admin-returns.html`, `admin-feedback.html`, `admin-requests.html`) travelled with their own item and were not removed
- [x] 6.2 Verify the existing route-derived active highlighting still marks exactly one link per page for `/admin`, `/admin/supply-stock`, `/inventory`, `/admin/returns`, `/admin/feedback`, and `/admin/registrations` (re-run the existing `test-active.js` harness in `C:\Users\Dja\AppData\Local\Temp\opencode\collision-test\`)
- [x] 6.3 Confirm `public/js/admin.js`, `public/js/inventory.js`, and `public/js/supply-stock.js` are unmodified by this change
- [x] 6.4 Confirm `admin-requests.html` still highlights only Request Management, since it does not load `admin.js` and relies on its hardcoded `active`

## 7. Non-Visual-Change Verification

- [x] 7.1 Confirm `git diff` touches only the sidebar `<ul>` blocks in the six HTML files, with no header, page content, or script lines moved
- [x] 7.2 Confirm no CSS file is modified
- [x] 7.3 Confirm no new or duplicate nav system, partial, or second sidebar was introduced, and no route was added or changed
- [x] 7.4 Confirm each moved `<li>` is byte-identical to its previous form, so no item changed size, icon, label, or styling

## 8. Cross-Artifact Reconciliation

- [x] 8.1 Note in the change that this canonical order supersedes the ordering in `admin-sidebar-navigation-order` (archived) and the in-flight `admin-sidebar-navigation` ordering, so archive time does not leave contradictory orders
- [x] 8.2 Run `openspec validate fix-admin-sidebar-stable-order --strict` and resolve any findings
- [ ] 8.3 Manually load each of the six admin pages and confirm the sidebar order is identical across all of them and the active item is highlighted without any item shifting
