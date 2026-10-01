## ADDED Requirements

### Requirement: Statistic cards SHALL have uniform sizing
All statistic cards on the admin dashboard SHALL have equal height and width, 24px internal padding, and 20px border-radius.

#### Scenario: Card dimensions
- **WHEN** inspecting a statistic card
- **THEN** it SHALL have `padding: 24px`, `border-radius: 20px`, and equal width within the same row

### Requirement: Statistic cards SHALL use soft shadow with hover animation
Each card SHALL use `box-shadow: 0 8px 24px rgba(15,23,42,.08)` and lift 3px on hover with a 0.2s transition.

#### Scenario: Card shadow
- **WHEN** a statistic card is rendered
- **THEN** it SHALL have `box-shadow: 0 8px 24px rgba(15,23,42,.08)`

#### Scenario: Card hover animation
- **WHEN** hovering over a statistic card
- **THEN** the card SHALL translate up by 3px with `transition: all 0.2s ease`

### Requirement: Cards SHALL have Lucide icons in blue circles
Each statistic card SHALL display a Lucide SVG icon inside a soft blue circular background positioned in the upper-right of the card.

#### Scenario: Icon container
- **WHEN** inspecting a statistic card
- **THEN** the icon SHALL be inside a `span` with `background: rgba(39,71,166,0.1)`, `border-radius: 50%`, `width: 44px`, `height: 44px`, positioned in the top-right

### Requirement: Card typography SHALL follow hierarchy
Card titles SHALL use 14px semi-bold navy text, values SHALL use 48px bold dark navy text, and descriptions SHALL use 15px gray text.

#### Scenario: Card title style
- **WHEN** inspecting a card title
- **THEN** it SHALL have `font-size: 14px`, `font-weight: 600`, `color: var(--color-primary-navy)`

#### Scenario: Card value style
- **WHEN** inspecting a card value
- **THEN** it SHALL have `font-size: 48px`, `font-weight: 700`, `color: var(--color-text-primary)`

#### Scenario: Card description style
- **WHEN** inspecting a card description
- **THEN** it SHALL have `font-size: 15px`, `color: var(--color-text-secondary)`
