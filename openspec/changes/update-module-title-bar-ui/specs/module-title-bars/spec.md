## ADDED Requirements

### Requirement: Standard module title bar

The system SHALL render every module/page title that appears below the main header inside a standardized title bar matching the existing "Inventory Overview" reference design. The title bar MUST be a full-width bar in the dark navy color `#152c69`, with rounded top-left and top-right corners (`28px 28px 0 0`), containing the title text in white, bold (`font-weight: 800`), at approximately `1.08rem` with `letter-spacing: 0.03em`, in the same font family already used system-wide. The title text MUST be horizontally left-aligned with the same horizontal padding as the reference (`24px` left/right) and MUST be vertically centered. The bar height MAY be defined by vertical padding (`18px` top/bottom) matching the reference.

#### Scenario: Inventory Overview remains the reference

- **WHEN** the Admin Inventory Overview page is rendered
- **THEN** its title bar keeps the existing "Inventory Overview" design and is treated as the visual standard for all other module title bars

#### Scenario: Consistent appearance on every module

- **WHEN** any Admin or Student module page listed in the change is rendered
- **THEN** its title bar uses the same navy color, white bold text, typography, horizontal padding, height, border-radius, and spacing as the Inventory Overview reference, with no per-module variations

### Requirement: Title bar placement and spacing

The title bar SHALL appear directly below the main header, spanning the same content width as the main module container. The bar MUST NOT overlap the main header, and there SHALL be a consistent vertical gap between the main header and the top of the title bar. Content (filters, cards, tables, forms, panels) MUST be kept visually separated from the title bar with consistent vertical spacing, and MUST NOT touch or overlap the bar. The title text SHALL be vertically centered within the bar.

#### Scenario: Bar sits directly under the header

- **WHEN** a module page loads in the Admin or Student interface
- **THEN** the title bar is rendered immediately below the main header within the content container, not overlapping the header and not hidden inside a white card

#### Scenario: Content separated from the bar

- **WHEN** a page renders filters, tables, cards, forms, or panels below the title bar
- **THEN** the content starts below the bar with consistent spacing and does not touch, overlap, or clip the title bar

### Requirement: Student module title bars

Each Student page SHALL display exactly ONE standard title bar directly below the main header, using the standard title bar design. The title bar SHALL contain the EXISTING page/module heading text, and MUST NOT introduce the sidebar/module name as an additional page title. The sidebar label (Dashboard, User Profile, Request, Announcements, Feedback, Returns) SHALL NOT be rendered as a standalone page title anywhere on the page. The boxed titles SHALL be "Dashboard" (Dashboard), "User Profile" (User Profile), "Registration Workflow" (Request section on the Dashboard), "Announcements" (Announcements), "Submit Feedback" (Feedback), and "Submit Return Request" (Returns). Any in-panel heading that duplicates the boxed title SHALL be removed so no duplicate headings exist. No student content, functionality, or data SHALL change as a result.

#### Scenario: Student dashboard title

- **WHEN** the Student Dashboard page is rendered
- **THEN** a single "Dashboard" title bar appears directly below the main header using the standard title bar design, with no other "Dashboard" heading on the page

#### Scenario: Student feedback title

- **WHEN** the Student Feedback page is rendered
- **THEN** a single "Submit Feedback" title bar appears directly below the main header and the previous duplicated in-panel "Submit Feedback" heading is removed

#### Scenario: Student returns title

- **WHEN** the Student Returns page is rendered
- **THEN** a single "Submit Return Request" title bar appears directly below the main header and the previous duplicated in-panel "Submit Return Request" heading is removed

#### Scenario: Student user profile title

- **WHEN** the Student User Profile page is rendered
- **THEN** a single "User Profile" title bar appears directly below the main header, and the sidebar labels are not repeated as page titles

#### Scenario: No sidebar-name duplication

- **WHEN** any Student page is rendered
- **THEN** the sidebar/module name is not rendered again as a standalone extra page title above or below the title bar

### Requirement: Admin module title bars

The Admin/Super Admin modules (Dashboard, Admin Account Management, Inventory Management/Overview, Return Management, Transaction Management, Announcement Management, Feedback Management) SHALL each display their module title in the standard title bar below the main header. Section headings that already sit inside `.admin-section` cards SHALL render as the standard title bar; any admin page whose module title currently appears outside the standard bar (e.g. in a white sub-header) SHALL be updated to use the standard bar.

#### Scenario: Admin title bars already in sections

- **WHEN** an Admin page section that uses the `.admin-section` container is rendered
- **THEN** its heading renders as the standard navy title bar (same as the reference)

#### Scenario: Admin request management page title

- **WHEN** the standalone admin "Uniform Request Management" page is rendered
- **THEN** its module title is displayed in the standard title bar below the main header instead of the white sub-header

### Requirement: Responsive title bar behavior

The title bar SHALL remain properly aligned and readable at desktop, laptop, tablet, and small-screen widths. Long titles such as "Admin Account Management" and "Feedback Management" MUST NOT be cut off, wrapped awkwardly, or overlap other elements. Left and right padding SHALL be preserved at all viewport sizes.

#### Scenario: Long title on small screen

- **WHEN** a module with a long title (e.g. "Admin Account Management") is viewed on a tablet or small screen
- **THEN** the full title remains visible inside the bar with preserved padding and no overlap of neighboring elements

#### Scenario: Alignment across breakpoints

- **WHEN** the page is resized across desktop, laptop, tablet, and mobile widths
- **THEN** the title bar tracks the content container width, stays below the header, and keeps consistent horizontal padding

### Requirement: UI-only consistency

The title-bar update SHALL be purely presentational. The system MUST NOT remove, rename, reorder, or modify any existing module information or functionality, and MUST NOT change data, API calls, routes, filters, buttons, tables, forms, permissions, the main header, or the sidebar. Only the module title area markup and its styling SHALL change.

#### Scenario: No functional changes

- **WHEN** the title-bar update is applied to any module page
- **THEN** existing functionality, data rendering, API calls, routes, filters, forms, buttons, tables, and permissions are unchanged and continue to behave as before