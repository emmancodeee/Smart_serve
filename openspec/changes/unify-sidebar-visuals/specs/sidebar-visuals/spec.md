## ADDED Requirements

### Requirement: Identical Sidebar Across All Admin Pages

Every admin panel page — Dashboard, Announcements, Transactions, Request Management, Pickup Confirmations, Feedback Management, and Return Requests — SHALL render the same shared sidebar: fixed 270px width on desktop (`lg:w-[270px]`), navy gradient background (`from-[#17357f] via-[#2447a8] to-[#315fda]`), brand/logo block (`px-6 py-6` with gold icon and "Smart Serve" heading), nav list (`p-6`, `gap-2` between items), and nav items with identical dimensions (`px-5 py-4`, `rounded-2xl`), icon size (20px), icon spacing (`gap-4`), font (`text-[0.96rem] font-semibold`), text alignment, colors, borders, shadows, and hover animation (`translate-x-1` + yellow border/background).

#### Scenario: Sidebar indistinguishable from Dashboard
- **WHEN** an admin compares the Feedback Management or Return Request sidebar with the Dashboard sidebar side by side
- **THEN** the sidebar width, item dimensions, padding, spacing, icons, typography, colors, borders, and hover effects are identical and the user cannot tell the pages apart by the sidebar

#### Scenario: Brand block unchanged
- **WHEN** an admin opens any admin page
- **THEN** the "Smart Serve" logo section at the top of the sidebar is identical on every page

### Requirement: Identical Active and Inactive Menu States

The active menu item SHALL use the same shared style on every admin page as Dashboard: gold-tinted background (`rgba(250,204,21,0.2)`), yellow border (`rgba(253,224,71,0.95)`), white text, gold/yellow icon, `translateX(3px)` offset, and the same rounded corners and internal spacing. Inactive items SHALL also match Dashboard exactly — same card size, spacing, and vertical gap between items — with no per-page restyle on Feedback Management or Return Request.

#### Scenario: Active highlight matches Dashboard
- **WHEN** the Feedback Management item is active on `/admin/feedback` or the Return Requests item is active on `/admin/returns`
- **THEN** the active styling is identical to the active item styling on the Dashboard page

#### Scenario: Inactive items match Dashboard
- **WHEN** an admin views the sidebar on Feedback Management or Return Requests
- **THEN** inactive menu items have the same dimensions, spacing, and vertical gap as on Dashboard

### Requirement: No Page-Local Sidebar Code

Feedback Management and Return Request SHALL NOT contain page-local sidebar markup or CSS (no `dashboard-sidebar`, `dashboard-sidebar-link`, `dashboard-topbar`, `dashboard-main-inner`). All sidebar styling MUST come from the shared `public/css/admin.css` and shell markup shared with the reference pages, and sidebar behavior (mobile drawer toggle, active highlight, logo) MUST come from the shared `public/js/admin.js`.

#### Scenario: Audit finds no duplicated sidebar code
- **WHEN** the admin page sources are searched for sidebar/layout definitions
- **THEN** Feedback Management and Return Request contain no duplicate sidebar, layout, or header markup/CSS and no `dashboard-sidebar`-family classes

#### Scenario: Shared behavior applies
- **WHEN** an admin uses the mobile drawer or navigates between admin pages
- **THEN** drawer toggle, overlay, and active-highlight behavior are identical on Feedback Management, Return Requests, and the reference pages

### Requirement: Reference Pages Remain the Standard

Dashboard, Announcements, Transactions, Request Management, and Pickup Confirmations SHALL remain unchanged; Feedback Management and Return Requests MUST conform to their sidebar, not the reverse.

#### Scenario: Reference pages untouched
- **WHEN** the change is complete
- **THEN** the reference admin pages contain no modifications introduced by this change and all seven pages share one sidebar visual standard
