## ADDED Requirements

### Requirement: Card header uses flexbox layout
The stat card header SHALL use a flexbox row layout (`.stat-header`) that places the label and icon side by side.

#### Scenario: Icon does not overlap title text
- **WHEN** a stat card has a long title such as "Units Distributed (30 Days)"
- **THEN** the title SHALL be fully visible without any portion hidden behind the icon

#### Scenario: Title wraps naturally
- **WHEN** the title text exceeds the available width beside the icon
- **THEN** the title SHALL wrap onto a second line

### Requirement: Icon container specifications
The icon container (`.stat-icon`) SHALL be 40x40px, circular, with `flex-shrink: 0`, and SHALL NOT use absolute positioning.

#### Scenario: Icon size is correct
- **WHEN** a stat card renders
- **THEN** the icon container SHALL be 40px wide and 40px tall

#### Scenario: Icon does not affect title width
- **WHEN** a stat card renders
- **THEN** the icon SHALL NOT shrink and SHALL NOT overlap the title area

### Requirement: Title spacing
The title text SHALL have a minimum 20px right padding to prevent it from touching the icon.

#### Scenario: Gap between title and icon
- **WHEN** a stat card renders
- **THEN** there SHALL be at least 20px of space between the end of the title text and the start of the icon

### Requirement: Icon SVG sizing
The SVG inside `.stat-icon` SHALL be 18-20px wide and 18-20px tall.

#### Scenario: SVG dimensions
- **WHEN** a stat card renders
- **THEN** the icon SVG SHALL be between 18px and 20px in both width and height
