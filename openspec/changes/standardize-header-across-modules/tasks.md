## 1. Standardize admin.html Header

- [x] 1.1 In `public/admin.html`, confirm the header already has the correct left group (`header-left`: `#headerClock` then `#logoutBtn`)
- [x] 1.2 In `public/admin.html`, reorder the `header-right` children to: `.header-search`, `.admin-profile`, `.header-bell` (bell last)
- [x] 1.3 Verify the outer header container (`mx-auto flex ... justify-between gap-3`) is unchanged and the sidebar below is untouched

## 2. Standardize inventory.html Header

- [x] 2.1 In `public/inventory.html`, confirm the header already has the correct left group (`header-left`: `#headerClock` then `#logoutBtn`)
- [x] 2.2 In `public/inventory.html`, reorder the `header-right` children to: `.header-search`, `.admin-profile`, `.header-bell` (bell last)
- [x] 2.3 Verify the sidebar `<nav>` markup and ordering in `inventory.html` are byte-identical to before this change

## 3. Standardize admin-returns.html Header

- [x] 3.1 In `public/admin-returns.html`, replace the header inner content with the canonical structure: `header-left` (`#headerClock` + `#logoutBtn`) and `header-right` (`.header-search`, `.admin-profile`, `.header-bell`)
- [x] 3.2 Remove the "Welcome Admin" heading, the in-header title, and any remaining header description text from the header
- [x] 3.3 Remove the old middle clock/logout `grid` group (clock and logout now live in `header-left`)
- [x] 3.4 Confirm the returns page content section (eyebrow, "All Return Requests", description, filter toolbar, table) and the sidebar remain unchanged

## 4. Standardize admin-feedback.html Header

- [x] 4.1 In `public/admin-feedback.html`, replace the header inner content with the canonical structure: `header-left` (`#headerClock` + `#logoutBtn`) and `header-right` (`.header-search`, `.admin-profile`, `.header-bell`)
- [x] 4.2 Remove the "Welcome Admin" heading, the in-header title, and the header description ("View and manage student feedback submissions.")
- [x] 4.3 Remove the old middle clock/logout `grid` group (clock and logout now live in `header-left`)
- [x] 4.4 Confirm the feedback page content and the sidebar remain unchanged

## 5. CSS Refinements (public/css/admin.css)

- [x] 5.1 Ensure the shared header rules produce the reference layout: left group `[#headerClock][#logoutBtn]`, right group `.header-search` → `.admin-profile` → `.header-bell`, with `justify-between` on the outer container
- [x] 5.2 Ensure the Notification Bell never shrinks: add/keep a rule ensuring `.header-right .header-bell` stays intact at the far end with proper spacing from the profile
- [x] 5.3 Remove now-dead rules in the `returns-page-layout` block that target `.admin-header .admin-welcome` and `.admin-header .header-title` (elements no longer in the standard header), keeping the useful alignment and responsive rules
- [x] 5.4 Verify desktop/tablet/mobile behavior is preserved via the existing `flex-wrap` and media queries (no new overlap risk)

## 6. Preservation Checks

- [x] 6.1 Confirm the sidebar markup and ordering are byte-identical on all four edited pages (no nav changes)
- [x] 6.2 Confirm no JS files (`admin.js`, `admin-returns.js`, `admin-filters.js`, etc.) and no backend/API/routes/auth code were modified
- [x] 6.3 Confirm the search icon, placeholder, logout styling, clock styling, profile block, and bell styling keep their existing classes/styling
- [x] 6.4 Confirm `admin.html` still serves Dashboard, Admin Accounts, Transactions, and Announcements views with the same content underneath the standard header

## 7. Final Verification

- [x] 7.1 Start the local server and confirm `/admin/dashboard`, `/inventory`, `/admin/returns`, and `/admin/feedback` all return 200
- [x] 7.2 Grep the four pages to confirm header-child order in `header-right` is search → profile → bell on each
- [x] 7.3 Grep the four pages to confirm no header description texts ("View and manage student return requests..." / "View and manage student feedback...") or "Welcome Admin" heading remain in the headers
- [x] 7.4 Statically inspect the CSS balance and confirm the four page headers render identical structure (same classes, order, spacing)