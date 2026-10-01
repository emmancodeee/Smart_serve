## ADDED Requirements

### Requirement: Statistic cards SHALL use responsive grid
The statistic cards container SHALL use CSS Grid that adapts to screen width: 5 columns on desktop, 3 on tablet, 1 on mobile.

#### Scenario: Desktop card grid
- **WHEN** viewing on a screen ≥1024px wide
- **THEN** statistic cards SHALL display in 5 columns

#### Scenario: Tablet card grid
- **WHEN** viewing on a screen between 640px and 1023px
- **THEN** statistic cards SHALL display in 3 columns

#### Scenario: Mobile card grid
- **WHEN** viewing on a screen <640px wide
- **THEN** statistic cards SHALL display in 1 column

### Requirement: Sidebar SHALL be collapsible on mobile
On mobile screens, the sidebar SHALL collapse behind a toggle button using the existing drawer pattern.

#### Scenario: Sidebar hidden on mobile
- **WHEN** viewing on a screen <1024px wide
- **THEN** the sidebar SHALL be hidden by default and toggleable via a hamburger button
