## ADDED Requirements

### Requirement: Module title spacing
On every student page (Dashboard, User Profile, Request, Announcements, Feedback, and Returns), the page-title box (`.module-title-bar`) SHALL sit within the main content column with a consistent, visible vertical gap above and below it and SHALL NOT touch, overlap, or collapse against the sticky page header. The gap above the title box (between the bottom of the header and the top of the title box) SHALL be 20px, matching the Admin/Superadmin `mt-5` reference, and the gap below the title box (between the bottom of the title box and the first content block) SHALL be 20px, matching the Admin/Superadmin `mb-5` reference. The title box SHALL span the full width of the content column between the page's horizontal padding edges on every student page, and the spacing SHALL be identical across all six student modules.

#### Scenario: Header-to-title gap matches Admin
- **WHEN** a student page is rendered with its sticky header and page-title box at desktop and mobile widths
- **THEN** the vertical gap between the bottom of the header and the top of the blue title box is 20px on every student module, identical to the Admin/Superadmin `mt-5` spacing, and the title box never touches or overlaps the header

#### Scenario: Title-to-content gap matches Admin
- **WHEN** a student page is rendered
- **THEN** the vertical gap between the bottom of the title box and the first content block below it is 20px on every student module, identical to the Admin/Superadmin `mb-5` spacing

#### Scenario: Consistent layout on all modules
- **WHEN** the student navigates across Dashboard, User Profile, Request, Announcements, Feedback, and Returns
- **THEN** the title box alignment (full content-column width) and its top and bottom gaps are the same on every page, with the title box styling, the header, the sidebar, labels, and routing unchanged