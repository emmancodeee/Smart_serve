## ADDED Requirements

### Requirement: Spacing between section header and filter toolbar
The system SHALL render every admin section's SmartFilter toolbar with a consistent vertical gap of 8–16px below the section's navy header bar, so the filter controls never touch the header. The gap SHALL be defined once by the shared section header rule, not per page, and SHALL remain intact when the toolbar wraps onto additional rows on smaller screens.

#### Scenario: Filter toolbar below a navy section header
- **WHEN** an admin opens the Admin Account Management section
- **THEN** the filter toolbar SHALL be separated from the navy section header by a gap of at least 8px, with no part of the controls touching the header

#### Scenario: Same gap across all section-header sections
- **WHEN** an admin opens the Announcement Management or Users Management section that uses the same header pattern
- **THEN** the filter toolbar SHALL use the identical header-to-toolbar gap as Admin Account Management

#### Scenario: Gap holds when filters wrap
- **WHEN** the viewport is narrow enough that the toolbar controls wrap onto multiple rows
- **THEN** the wrapped rows SHALL still sit below the navy header with the same gap, without overlap, clipping, or negative margins

### Requirement: Unchanged visual design
The spacing fix SHALL NOT alter any other aspect of the admin sections: navy header color, white background, rounded corners, borders, shadows, filter control styling, buttons, typography, filter options, or filter behavior shall remain as-is.

#### Scenario: Visual design preserved
- **WHEN** the gap fix is applied and an admin views any affected section
- **THEN** the only visual difference SHALL be the added vertical gap between the navy header and the filter controls

### Requirement: Consistent spacing on announcement page
The Announcements page SHALL keep its search and filter controls separated from the navy heading/header area by at least 8px, consistent with the admin sections, both on desktop and when the sidebar stacks on smaller screens.

#### Scenario: Announcements filters clear of the header
- **WHEN** a user opens the Announcements page on any screen size
- **THEN** the search and filter controls SHALL not touch the navy header area and SHALL remain aligned within their container