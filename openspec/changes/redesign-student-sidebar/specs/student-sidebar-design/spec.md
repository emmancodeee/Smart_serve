## ADDED Requirements

### Requirement: Consistent all-pages layout
The Student sidebar SHALL render as a full-height, fixed (non-scrolling with the page) left sidebar on every student page: Dashboard, User Profile, Request, Announcements, Feedback, and Returns. The sidebar SHALL use the Admin/Superadmin blue gradient background and SHALL keep a consistent width across all six pages. It SHALL NOT collapse, overlap content, or shift width when navigating between student pages.

#### Scenario: Sidebar visible on each student page
- **WHEN** a student is signed in and visits Dashboard, User Profile, Announcements, Feedback, or Returns (or the Request view under Dashboard)
- **THEN** the sidebar is fixed to the left edge, full viewport height, with the same width and blue gradient on every page

#### Scenario: No layout shift between pages
- **WHEN** the student navigates from one student page to another
- **THEN** the sidebar width, position, and background remain identical and the main content does not shift or overlap the sidebar

### Requirement: Logo header
The sidebar SHALL show, at the top, a graduation-cap icon inside a glassy white/translucent icon box and the bold white text "Smart Serve", styled exactly like the Admin/Superadmin logo header (including the gold hairline divider below it).

#### Scenario: Logo renders on all student pages
- **WHEN** the sidebar loads on any of the six student pages
- **THEN** the top of the sidebar displays a glassy graduation-cap icon box and bold white "Smart Serve" text identical in size, weight, and styling

### Requirement: Nav module set and order
The sidebar SHALL contain exactly six navigation items, in this order: Dashboard, User Profile, Request, Announcements, Feedback, Returns. No additional modules SHALL be added and none removed on student pages.

#### Scenario: Six items in fixed order
- **WHEN** a rendered student sidebar is inspected
- **THEN** it lists exactly Dashboard, User Profile, Request, Announcements, Feedback, Returns, in that order, each with the correct per-module icon (home/dashboard, user/profile, request/document, announcements/calendar or megaphone-style, feedback/chat bubble, returns/refresh arrow)

### Requirement: Active state
The currently active item SHALL be styled exactly like the Admin/Superadmin active state: a gold-tinted translucent background, gold border, gold glow shadow, and a subtle right-shift, with white label text and a gold icon (the icon SHALL NOT turn navy). The active item SHALL correspond to the page the student is currently on and SHALL NOT remain stuck on Dashboard. The Request item SHALL be considered active when the student is on the Request view (`/dashboard#request`).

#### Scenario: Active item follows current page
- **WHEN** the student visits User Profile, Announcements, Feedback, or Returns
- **THEN** the corresponding item is rendered with the gold-tinted active style and the Dashboard item is rendered inactive

#### Scenario: Request view active state
- **WHEN** the student navigates to the Request view via `/dashboard#request`
- **THEN** the Request item is rendered with the gold-tinted active style

### Requirement: Inactive state
Inactive items SHALL use white label text with their icon shown in a glassy gold icon box matching the Admin/Superadmin `.admin-nav-icon` style (rounded box, translucent white fill and border, gold icon), with no background fill on the item itself. Their icon boxes and labels SHALL be evenly spaced and vertically aligned (consistent icon/text columns) across all items.

#### Scenario: Inactive items are consistently styled
- **WHEN** a non-active item is rendered
- **THEN** it shows white text and a gold icon inside the glassy icon box, no item background, with spacing and alignment matching every other inactive item

### Requirement: Scope constraints
The redesign SHALL apply only to the design and style of the Student sidebar on the six student pages. The sidebar on `schedule.html` (including its Scheduler module and "Registration" label) SHALL remain unchanged. The Admin and Superadmin sidebars (Admin pages, `inventory.html`) SHALL remain unchanged. No student content, module set, labels, hrefs, routing, or functionality SHALL be altered.

#### Scenario: Schedule and Admin sidebars untouched
- **WHEN** the change is delivered
- **THEN** `schedule.html` and all Admin/Superadmin sidebar markup and styles are byte-identical to before the change

#### Scenario: No functional changes
- **WHEN** the student uses any feature on the six student pages
- **THEN** all existing behaviors, links, and views work exactly as before

### Requirement: Responsive stability
The sidebar SHALL remain stable and usable across desktop and mobile viewport sizes, with desktop behavior matching the fixed full-height layout and existing mobile behavior preserved per page.

#### Scenario: Desktop and mobile rendering
- **WHEN** the page is rendered at desktop width and at mobile width
- **THEN** the sidebar renders without overlap or collapse, using the fixed layout on desktop and each page's existing mobile behavior