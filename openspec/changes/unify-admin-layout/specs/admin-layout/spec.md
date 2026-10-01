## ADDED Requirements

### Requirement: Shared Admin Layout Shell

The SMARTSERVE Admin Panel SHALL provide a single shared layout shell that every admin page MUST render its content inside. The shell consists of the navy gradient sidebar (`nav#sidebar.sidebar-shell`, fixed 270px on desktop, mobile drawer with `sidebarOverlay` and toggle button), the header (`header.admin-header`, sticky, dark navy `#152c69` on white), and the content wrapper (`div#main-content.main-content-shell w-full min-w-0 lg:ml-[270px]` containing `main.admin-main mx-auto grid max-w-[1280px] gap-5 px-4 pb-8 pt-5 md:px-6`). Admin pages MUST NOT define or render their own standalone sidebar, header, navigation, or layout wrapper; only the page content changes between pages.

#### Scenario: Admin page renders inside shared shell
- **WHEN** an admin navigates to any admin panel page
- **THEN** the page renders its content inside the shared shell (same sidebar, header, and content wrapper as the reference pages)

#### Scenario: No duplicate layout shells
- **WHEN** the admin panel source is inspected for layout components
- **THEN** each admin page contains exactly one shell implementation and no page defines a duplicate sidebar, header, or navigation component

### Requirement: Sidebar Appearance Consistency

The sidebar SHALL be identical on every admin page: navy blue gradient background (`from-[#17357f] via-[#2447a8] to-[#315fda]`), fixed width of 270px on desktop, same padding/spacing (`px-6 py-6` brand block, `p-6` nav list, `gap-2` between items), same nav link styling (`rounded-2xl px-5 py-4`, hover `translate-x-1` + yellow border/bg + shadow), same 20px icons, and the same active menu highlight. The active menu item SHALL be highlighted with the same `is-active`/`active` treatment as the reference pages and MUST remain highlighted when navigating between pages.

#### Scenario: Feedback page sidebar matches dashboard
- **WHEN** an admin opens Feedback Management
- **THEN** the sidebar renders with the same width, spacing, icons, gradient, hover effects, and active highlight as the Dashboard page

#### Scenario: Active item highlighted on navigation
- **WHEN** an admin navigates to Feedback Management or Return Requests
- **THEN** the corresponding menu item is highlighted and the sidebar remains visible without reloading or changing appearance

#### Scenario: Mobile drawer behavior preserved
- **WHEN** an admin opens the sidebar drawer on a narrow viewport from any admin page
- **THEN** the drawer toggles with the same transition, overlay, and close behavior as the reference pages

### Requirement: Header Consistency

The header SHALL be identical on every admin page: sticky top, dark navy `#152c69` background with white text and shadow, and the same sections — page title/subtitle, search bar, notification bell, date & time (clock), admin profile (avatar, name, role), and Logout button — with the same spacing and styling as the reference pages.

#### Scenario: Header sections present on Feedback Management
- **WHEN** an admin opens Feedback Management
- **THEN** the header shows the search bar, notification icon, date & time, admin profile, and logout button styled identically to the reference pages

### Requirement: Content Wrapper Consistency

The page content area SHALL use the same wrapper classes and spacing on every admin page: `main.admin-main mx-auto grid max-w-[1280px] gap-5 px-4 pb-8 pt-5 md:px-6`, with white content cards using the same padding, border radius, shadows, typography, and colors as the reference pages.

#### Scenario: Content area matches reference pages
- **WHEN** an admin opens Return Requests
- **THEN** the content area is centered in the same `max-w-[1280px]` wrapper with the same padding, card spacing, border radius, and shadows as Dashboard

### Requirement: Feedback Management Uses Shared Layout

The Feedback Management page (`public/admin-feedback.html`, served at `/admin/feedback`) SHALL render its feedback table content inside the shared admin layout shell. It SHALL NOT use the student-dashboard style sidebar (`dashboard-sidebar`), clock topbar (`dashboard-topbar`), or page-specific layout CSS; it SHALL reuse the shared `public/css/admin.css` and `public/js/admin.js` behavior used by the reference pages, with the Feedback Management menu item marked active.

#### Scenario: Feedback Management renders in shared layout
- **WHEN** an admin opens `/admin/feedback`
- **THEN** the page shows the standard sidebar, header, and content wrapper with only the feedback content area differing from other admin pages

### Requirement: Return Request Uses Shared Layout

The Return Request page (`public/admin-returns.html`, served at `/admin/returns`) SHALL render its return request table content inside the shared admin layout shell. It SHALL NOT use the student-dashboard style sidebar, clock topbar, or page-specific layout CSS; it SHALL reuse the shared `public/css/admin.css` and `public/js/admin.js` behavior used by the reference pages, with the Return Requests menu item marked active.

#### Scenario: Return Request renders in shared layout
- **WHEN** an admin opens `/admin/returns`
- **THEN** the page shows the standard sidebar, header, and content wrapper with only the return request content area differing from other admin pages

### Requirement: Single Layout Standard Across All Admin Pages

All admin panel pages — Dashboard, Admin Accounts, Transactions, Registration Management, Pickup Confirmations, Feedback Management, and Return Requests — SHALL use one identical layout. The only difference between pages SHALL be the page content. The SMARTSERVE branding (navy blue sidebar, white header, gold accents, white content background, same fonts, spacing, and icon style) SHALL be consistent across all of them.

#### Scenario: Visual comparison across all admin pages
- **WHEN** an admin compares any two admin pages side by side
- **THEN** the sidebar, header, and content wrapper are identical and only the page content differs

### Requirement: No Duplicate Layout Components

The project SHALL NOT contain duplicate layout implementations (sidebar, header, navigation, layout wrappers) used only by Feedback Management or Return Requests. Any such duplicates SHALL be removed, and both pages SHALL reference the same shared components, styles, and scripts as the reference pages.

#### Scenario: Source search finds single shell implementation
- **WHEN** the admin page source is searched for sidebar, header, and layout definitions
- **THEN** Feedback Management and Return Requests do not define their own layout shells and instead reuse the shared ones from the reference pages
