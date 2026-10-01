## ADDED Requirements

### Requirement: Admin Nav Links Resolve to Served Routes
Every navigation `href` in the admin pages (`admin.html`, `admin-feedback.html`, `admin-returns.html`, and `admin-requests.html` for completeness) SHALL point to a route that is actually served by `server.js`. Any link that resolves to an unserved or stale path MUST be corrected, and no admin page SHALL produce a 404 for a sidebar/menu navigation action.

#### Scenario: All nav links resolve
- **WHEN** the admin pages' nav links are checked against the Express routes in `server.js`
- **THEN** each link matches a served route (e.g. `/admin/dashboard`, `/admin/accounts`, `/admin/announcements`, `/admin/transactions`, `/admin/registrations`, `/admin/pickup-confirmations`, `/admin/feedback`, `/admin/returns`, `/inventory`)

#### Scenario: Broken link removed or corrected
- **WHEN** a link points to a route that does not exist or is outdated
- **THEN** the link is changed to the correct served route (or removed), and the report records what was corrected

### Requirement: Feedback and Return Pages Share the Dashboard Sidebar
`/admin/feedback` (Feedback Management) and `/admin/returns` (Return Request) SHALL render inside the same shared admin shell as Dashboard: fixed 270px sidebar (`lg:w-[270px]`), navy gradient (`from-[#17357f] via-[#2447a8] to-[#315fda]`), identical brand/logo block, identical nav list (`p-6`, `gap-2`), identical menu item dimensions/classes (`admin-nav-link`, `px-5 py-4`, `rounded-2xl`, `text-[0.96rem] font-semibold`, `gap-4` for 20px icons), and the identical shared active and hover styling. No page SHALL define a second sidebar, header, or layout.

#### Scenario: Sidebar indistinguishable from Dashboard
- **WHEN** an admin compares the Feedback Management or Return Request sidebar with the Dashboard sidebar side by side
- **THEN** the sidebar width, item dimensions, padding, spacing, icons, typography, colors, borders, shadows, and hover effects are identical and the user cannot tell the pages apart by the sidebar

#### Scenario: Brand and logo block identical
- **WHEN** an admin opens any admin page
- **THEN** the "Smart Serve" logo section (gold icon, same padding and typography) is identical on every page

### Requirement: Shared Active Menu Style (Gold)
The active menu item SHALL use the shared Dashboard style: gold-tinted background (`rgba(250,204,21,0.2)`), yellow border (`rgba(253,224,71,0.95)`), white text, `translateX(3px)`, and the same border-radius and padding as Dashboard. Inactive items SHALL match Dashboard exactly (same card size, spacing, vertical gap). No page SHALL restyle active/inactive states differently (no per-page gray variant).

#### Scenario: Active highlight matches Dashboard
- **WHEN** the Feedback Management item is active on `/admin/feedback` or the Return Requests item is active on `/admin/returns`
- **THEN** the active styling is identical to the active item on the Dashboard page

#### Scenario: Inactive items match Dashboard
- **WHEN** an admin views the sidebar on Feedback Management or Return Requests
- **THEN** inactive items have the same dimensions, spacing, and vertical gap as on Dashboard

### Requirement: No Duplicate Sidebar/Layout Code on Feedback and Return Pages
Feedback Management and Return Request SHALL NOT contain page-local sidebar, header, or layout definitions or duplicate Navigation components (no `dashboard-sidebar`, `dashboard-topbar`, `dashboard-main-inner`, or a second `<nav>` sidebar). All sidebar styling MUST come from the shared `public/css/admin.css` and shell markup shared with the reference pages, and behavior (mobile drawer, active highlight, logout, clock) MUST come from shared `public/js/admin.js`.

#### Scenario: Audit finds no duplicate layout code
- **WHEN** Feedback and Return page sources are searched for sidebar/layout definitions
- **THEN** they contain no duplicate sidebar, header, layout, or nav markup; exactly one `nav#sidebar.sidebar-shell` and one `#main-content` per page

#### Scenario: Shared behavior applies
- **WHEN** an admin uses the mobile drawer or navigates between admin pages
- **THEN** drawer toggle, overlay, and active-highlight behavior are identical on Feedback Management, Return Requests, and the reference pages

### Requirement: Single Shared Layout Across All Admin Pages
All admin-facing pages — Dashboard, Announcements, Transactions, Request Management, Pickup Confirmations, Feedback Management, Return Request, and Inventory Management — SHALL share one layout: the same sidebar, header, spacing, and overall UI. Only the page content differs. Reference pages (Dashboard, Announcements, Transactions, Request Management, Pickup Confirmations) SHALL remain unchanged; Feedback Management and Return Request MUST conform to them, not the reverse.

#### Scenario: All pages use one shared layout
- **WHEN** the admin panel is navigated in a browser
- **THEN** only the page content changes between pages; the sidebar, header, spacing, and overall UI stay identical

#### Scenario: Reference pages untouched
- **WHEN** the change is complete
- **THEN** the reference admin pages contain no modifications introduced by this change, and all eight admin pages share one layout standard