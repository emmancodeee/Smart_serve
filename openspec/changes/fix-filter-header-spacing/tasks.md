## 1. Shared CSS Fix (source of the gap)

- [x] 1.1 In `public/css/admin.css`, update `.admin-page .admin-section .section-header-row` (~line 2041) from `margin: 0 -1.25rem;` to `margin: 0 -1.25rem 1rem;` so every section using the wrapped navy header (Announcement Management, Admin Account Management, Users Management) gets a 16px gap between the blue bar and the filter toolbar. Keep the inner `h2 { margin: 0; padding: 0; background: none; }` reset unchanged.
- [x] 1.2 Grep `section-header-row` across `public/` and confirm the only usages are the admin sections that are immediately followed by a filter container (`#announcementsFilterContainer`, `#adminAccountsFilterContainer`, `#usersFilterContainer`), so the added bottom margin is always the desired gap and never misplaced content.

## 2. Verify Other Modules (no redesign)

- [x] 2.1 Confirm the plain-heading sections (Analytics `#analytics`, Transactions `#transactions`, Registrations `#registrationsPending`, Pickup Confirmations `#pickupConfirmations`) already rely on the `1rem` bottom margin of `.admin-page .admin-section h2` (~line 2027) and require no change; leave them untouched.
- [x] 2.2 Inventory Management (`public/inventory.html`): verify the `.section-header-bar` `h2` inherits the same `1rem` bottom margin so `#inventoryFilterContainer` sits at least 8px below the blue bar. Only if the gap is visually absent, add `margin-bottom: 1rem` to a `.section-header-bar` rule in `public/css/admin.css` using the same value — do not use a bespoke number.
- [x] 2.3 Return Requests (`admin-returns.html`) and Feedback Management (`admin-feedback.html`): confirm the filter toolbar sits beside the title in `dashboard-panel-header` (never directly under a blue bar) and renders unchanged; no CSS edit expected.

## 3. Announcements Page

- [x] 3.1 Admin "Announcement Management" section: confirm the shared rule from 1.1 produces the 16px gap between the navy header and the announcements filter toolbar.
- [x] 3.2 Student announcements page (`public/announcement.html`): verify the filter sidebar controls are at least 8px below the navy "Browse all published notices" heading (the `space-y-4` container should already provide it). Only if controls touch the header, apply the same `1rem` spacing token — never a page-specific arbitrary value.

## 4. Responsive + Regression Verification

- [x] 4.1 Reload Admin Account Management and Announcement Management at desktop (~1440px), laptop (~1120px), tablet (~768px), and mobile (~390px): filters show a clean 8–16px gap below the blue header, wrap on narrower widths without overlap, clipping, or negative margins, and "Reset Filters"/"Export" remain functional.
- [x] 4.2 Confirm no layout ripple on the plain-heading sections and other admin pages (Analytics, Transactions, Registrations, Pickup Confirmations, Users) and that no filter/search/sort/export behavior changed.
- [x] 4.3 Run `node --check public/js/admin.js`, `node --check public/js/admin-filters.js`, `node --check public/js/inventory.js`, and `node --check public/js/announcement.js` (should pass: these files must NOT have been modified) to confirm no JS drift.