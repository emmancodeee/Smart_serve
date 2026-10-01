## ADDED Requirements

### Requirement: Horizontally scrollable tables on mobile

All data tables on the admin, inventory, and schedule pages SHALL be wrapped in a horizontal scroll container when the table width exceeds the viewport width.

#### Scenario: Table overflows viewport on mobile
- **WHEN** the table's natural width exceeds the viewport width
- **THEN** the table SHALL be contained within a scrollable wrapper with visible scrollbar, and the user SHALL be able to horizontally scroll to see all columns

#### Scenario: Table fits viewport on desktop
- **WHEN** the viewport width is 1024px or greater
- **THEN** the table SHALL display normally without any scroll wrapper affecting its layout

### Requirement: Sticky table headers on scroll

The table header row SHALL remain visible when the user scrolls vertically within long tables.

#### Scenario: Vertical scroll with sticky header
- **WHEN** the user scrolls down within a table
- **THEN** the table header row SHALL remain fixed at the top of the scroll container

### Requirement: Minimum column widths

Table columns SHALL have reasonable minimum widths to prevent content from being crushed on narrow viewports.

#### Scenario: Column content is readable
- **WHEN** a table is viewed on any viewport width
- **THEN** each column SHALL have a minimum width sufficient to display its content without clipping or extreme wrapping

### Requirement: Action column accessibility

The Actions column in tables (containing edit/delete/approve buttons) SHALL use icon-only buttons with accessible labels on narrow viewports to save horizontal space.

#### Scenario: Actions column on mobile
- **WHEN** the viewport width is less than 640px
- **THEN** action buttons within tables SHALL display as icons without text labels, but SHALL retain accessible aria-labels for screen readers
