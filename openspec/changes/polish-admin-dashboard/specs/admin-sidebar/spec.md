## ADDED Requirements

### Requirement: Sidebar SHALL be 280px wide
The admin sidebar SHALL have a fixed width of 280px on desktop screens, with improved internal spacing.

#### Scenario: Sidebar width on desktop
- **WHEN** viewing any admin page on a desktop screen (≥1024px)
- **THEN** the sidebar SHALL be 280px wide

### Requirement: Sidebar menu items SHALL have improved spacing
Each sidebar menu item SHALL have adequate internal padding, centered icons, and vertically aligned text.

#### Scenario: Menu item padding
- **WHEN** inspecting a sidebar menu item
- **THEN** it SHALL have `padding: 12px 20px` with `gap: 14px` between icon and text

### Requirement: Active menu item SHALL have distinct visual state
The active sidebar link SHALL have a slightly lighter blue background, a subtle gold left border, and a soft shadow.

#### Scenario: Active item styling
- **WHEN** a sidebar link has the `active` class
- **THEN** it SHALL have `background: rgba(255,255,255,0.12)`, `border-left: 3px solid var(--color-gold-accent)`, and `box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08)`

### Requirement: Sidebar hover SHALL use smooth transition
All sidebar links SHALL have a 0.2-second transition on hover with a slightly lighter background.

#### Scenario: Hover effect
- **WHEN** hovering over a sidebar link
- **THEN** the link SHALL lighten by `background: rgba(255,255,255,0.08)` with `transition: all 0.2s ease`
