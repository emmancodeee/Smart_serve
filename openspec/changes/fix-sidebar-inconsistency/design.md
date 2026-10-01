## Context

The Smart Serve admin panel consists of multiple HTML pages served by Express: `admin.html` (SPA-style with sections), `inventory.html`, and `admin-requests.html`. Each page has its own sidebar markup hardcoded in the HTML, and they have diverged over time:

- `admin.html` has the canonical sidebar with 7 items: Dashboard, Announcements, Admin Accounts (hidden), Transactions, Request Management, Pickup Confirmations, Inventory Management
- `inventory.html` is missing Announcements and labels "Request Management" as "Registration Management"
- `admin-requests.html` has only 3 items: Dashboard, Request Management, Inventory

## Goals / Non-Goals

**Goals:**
- All admin pages display the same sidebar with the same items in the same order
- The active menu item highlights correctly on each page
- All links navigate to the correct routes
- No menu items disappear when switching between pages

**Non-Goals:**
- Extracting the sidebar into a shared template or partial (out of scope for this fix)
- Changing the student sidebar on dashboard.html, announcement.html, etc.
- Redesigning the layout or styling of the sidebar
- Changing server-side routing

## Decisions

- **Canonical source**: Use `admin.html` sidebar as the canonical reference. Copy its exact `<ul>` block (including `data-view`, `id`, `href`, icon SVGs, and CSS classes) into `inventory.html` and `admin-requests.html`.
- **Active state on separate pages**: The `admin.html` page uses `setAdminView()` JS for active highlighting. For `inventory.html` and `admin-requests.html` (separate page loads), add the `active` CSS class directly to the current page's nav link in the HTML markup and use JS to highlight the current page on page load.
- **Header consistency**: Keep the existing page-specific headers (they show the current page title) but ensure the sidebar above them is identical.
- **Mobile drawer**: Preserve the mobile drawer pattern (`drawer-checkbox`, `drawer-sidebar`, `drawer-overlay`) on inventory.html and admin-requests.html - only change the nav items inside.

## Risks / Trade-offs

- [Visual regression] Sidebar duplication means future changes must be made in 3+ files → Acceptable for now; a future refactor can extract a shared template
- [Broken active highlighting] If `data-view` attributes aren't added to inventory.html links, the admin.js `setAdminView` behavior may not work on admin.html → Ensure consistent `data-view` attributes
- [CSS class differences] inventory.html uses `grid-cols-2` on the sidebar `<ul>` → Override to `grid-cols-1` to match admin.html
