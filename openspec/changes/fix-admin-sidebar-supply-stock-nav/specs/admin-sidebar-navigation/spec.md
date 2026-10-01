## ADDED Requirements

### Requirement: Admin Sidebar Link Set
Every page in the SmartServe Admin interface SHALL render the same set of sidebar navigation links, in the same relative order. The canonical physical order in the sidebar `<ul>` SHALL be: Dashboard, Admin Accounts, Inventory Management, Supply & Stock, Return Requests, Request Management, Pickup Confirmations, Transactions, Announcements, Feedback Management.

This extends the order established by the `admin-sidebar-navigation-order` capability by inserting Supply & Stock directly after Inventory Management, which is the position that capability's ordering leaves free. No existing link SHALL change its relative position with respect to another existing link.

The links that are role-gated (Admin Accounts, Request Management, Pickup Confirmations) MAY be hidden based on the signed-in account's role; the remaining links SHALL be visible to every authenticated Admin account regardless of role.

This applies to all Admin pages: the dashboard shell served at `/admin` and `/admin/dashboard`, `/admin/users`, `/admin/accounts`, `/admin/announcements`, `/admin/transactions`, `/admin/registrations`, `/admin/pickup-confirmations`, plus `/admin/feedback`, `/admin/returns`, `/admin/supply-stock`, and `/inventory`.

#### Scenario: Nav links are present on every admin page
- **WHEN** an authenticated Admin loads any Admin page
- **THEN** the sidebar contains the full shared link set, with Inventory Management and Supply & Stock both present

#### Scenario: Role-gated links are the only ones that may be hidden
- **WHEN** a non-super Admin loads any Admin page
- **THEN** Admin Accounts, Request Management and Pickup Confirmations are hidden per role rules, and Inventory Management and Supply & Stock remain visible

#### Scenario: Link ordering is consistent across pages
- **WHEN** the sidebar of two different Admin pages is compared
- **THEN** the relative order of the shared links is identical, with Supply & Stock appearing immediately after Inventory Management on both

#### Scenario: Supply & Stock insertion does not disturb existing links
- **WHEN** the sidebar order is compared against the pre-change order
- **THEN** every link other than Supply & Stock keeps its relative position with respect to all other links

### Requirement: Supply & Stock Link Is Always Visible
The "Supply & Stock" sidebar link SHALL be visible on every Admin page at all times. Its visibility SHALL NOT depend on the current route, the active module, whether the Inventory Management page has been visited or clicked, whether inventory data has loaded, or any inventory-related state. No script and no stylesheet SHALL hide, collapse, or conditionally mount the link.

#### Scenario: Visible immediately on dashboard load
- **WHEN** an Admin loads `/admin/dashboard` and has clicked nothing
- **THEN** both "Inventory Management" and "Supply & Stock" are visible in the sidebar without any interaction

#### Scenario: No click on Inventory Management required
- **WHEN** an Admin views the sidebar for the first time in a session
- **THEN** the "Supply & Stock" link is already rendered, with no prior click on "Inventory Management"

#### Scenario: Remains visible on unrelated pages
- **WHEN** an Admin is on Dashboard, Return Requests, Transactions, Announcements, Feedback Management or Request Management
- **THEN** the "Supply & Stock" link is visible on that page's sidebar

#### Scenario: Remains visible while navigating away from inventory
- **WHEN** an Admin is on `/inventory` and then navigates to another Admin page
- **THEN** the "Supply & Stock" link is still visible on the destination page's sidebar

#### Scenario: Not below the fold on a standard viewport
- **WHEN** an Admin views the sidebar on a viewport at least 768 pixels tall
- **THEN** the "Supply & Stock" link is reachable without scrolling the sidebar, because it is not the last item in a long list

### Requirement: Independent Direct Navigation
"Supply & Stock" and "Inventory Management" SHALL each be independent, directly clickable navigation items. Activating either link SHALL navigate straight to that module's own page in a single interaction. The two-step sequence "Inventory Management, then Supply & Stock" SHALL NOT be required to reach the Supply & Stock module.

Each link SHALL point at its existing route and SHALL NOT be intercepted by SPA view-switching logic. "Inventory Management" SHALL point at `/inventory`; "Supply & Stock" SHALL point at `/admin/supply-stock`. No duplicate route, no placeholder page, and no second "Supply & Stock" entry SHALL be introduced.

#### Scenario: Direct click reaches Supply & Stock
- **WHEN** an Admin clicks "Supply & Stock" in the sidebar from any Admin page
- **THEN** the Supply & Stock page loads in a single interaction

#### Scenario: Direct click reaches Inventory Management
- **WHEN** an Admin clicks "Inventory Management" in the sidebar from any Admin page
- **THEN** the Inventory Management page loads in a single interaction

#### Scenario: Clicking Inventory Management does not gate Supply & Stock
- **WHEN** an Admin clicks "Inventory Management" and does not subsequently click "Supply & Stock"
- **THEN** the "Supply & Stock" link is visible in the sidebar and remains clickable

#### Scenario: Supply & Stock link is not a SPA view switch
- **WHEN** an Admin clicks "Supply & Stock"
- **THEN** the browser performs a normal navigation to `/admin/supply-stock` rather than an in-page view swap

### Requirement: Sidebar Active State Derived From Route
The Admin sidebar SHALL derive which link is active by comparing `window.location.pathname` against each link's resolved `href`. Exactly one link SHALL carry the active class at a time, except on a route that matches no link, in which case none SHALL be active. The active class SHALL NOT be hardcoded into page markup as the sole source of truth.

The active-state logic SHALL be implemented once and SHALL behave identically on every Admin page, including `/inventory` and `/admin/supply-stock`.

#### Scenario: Inventory Management highlighted on /inventory
- **WHEN** an Admin is on `/inventory`
- **THEN** the "Inventory Management" link is active and the "Supply & Stock" link is not

#### Scenario: Supply & Stock highlighted on its own route
- **WHEN** an Admin is on `/admin/supply-stock`
- **THEN** the "Supply & Stock" link is active and the "Inventory Management" link is not

#### Scenario: Both links never active simultaneously
- **WHEN** an Admin is on any Admin page
- **THEN** "Inventory Management" and "Supply & Stock" are never both active at the same time

#### Scenario: Active state survives a full page load
- **WHEN** an Admin hard-reloads `/admin/supply-stock` directly
- **THEN** the "Supply & Stock" link is active, derived at runtime rather than baked into the HTML

#### Scenario: Other pages keep their correct highlight
- **WHEN** an Admin is on Dashboard, Return Requests, Transactions, Announcements, Feedback Management or Request Management
- **THEN** only that page's link is active

### Requirement: Equivalent Nav Visibility And Active State On Every Page
Every Admin page SHALL apply equivalent nav-visibility and active-state rules, whether it loads the shared admin script or a page-specific one. Where a page uses its own script, that script SHALL implement the same rules as the shared one, including an explicit guarantee that the Supply & Stock link's display is never set to `none`.

The Admin inventory page (`/inventory`) loads its own page script rather than the shared admin script, because the two files declare conflicting top-level bindings and cannot be loaded together.

#### Scenario: Inventory page applies the same rules
- **WHEN** an Admin loads `/inventory`
- **THEN** nav visibility and active state are governed by the inventory page's own script, implementing the same rules as the shared script

#### Scenario: Supply & Stock visibility is guaranteed on every page
- **WHEN** the codebase is inspected for sidebar visibility logic
- **THEN** every implementation that manages the sidebar explicitly ensures the Supply & Stock link's display is never set to `none`

#### Scenario: Equivalent behaviour across page scripts
- **WHEN** the same route is rendered by the shared script and by the inventory page's script
- **THEN** the resulting visible nav items and active link are identical

### Requirement: Admin Page Scripts Parse Without Colliding
Every Admin page SHALL load its scripts without a top-level binding collision. No two scripts loaded by the same Admin page SHALL declare the same top-level `let` or `const` binding, because the second declaration would raise a `SyntaxError` and prevent that script from executing.

#### Scenario: Supply & Stock page scripts all execute
- **WHEN** an Admin loads `/admin/supply-stock`
- **THEN** the shared admin script and the supply-stock page script both execute, and the page's data, forms, tabs, and logout control are all functional

#### Scenario: No script is silently skipped
- **WHEN** any Admin page is inspected for its `<script>` list
- **THEN** no two listed scripts declare a duplicate top-level `let` or `const`

### Requirement: Sidebar Visual Design Unchanged
This change SHALL alter only the order of existing navigation items and the logic that marks the current page. It SHALL NOT change the sidebar's width, colours, gradient, icons, font, typography, spacing, active-state border, logo block, or the page header. It SHALL NOT change the Inventory Management page, the Supply & Stock page, any API endpoint, or any data shape.

#### Scenario: No visual regression
- **WHEN** the fix is applied
- **THEN** the sidebar renders with the same width, gradient, icon set, type scale, spacing rhythm and active border as before

#### Scenario: No functional regression
- **WHEN** the fix is applied
- **THEN** the Inventory Management page and the Supply & Stock page behave and display exactly as before

#### Scenario: Exactly one Supply & Stock entry per page
- **WHEN** the sidebar of any Admin page is rendered
- **THEN** exactly one "Supply & Stock" link is present

#### Scenario: Consistent link markup across pages
- **WHEN** the "Supply & Stock" and "Inventory Management" link markup is compared across Admin pages
- **THEN** the label text, target `href`, icon and class list are identical apart from the active class
