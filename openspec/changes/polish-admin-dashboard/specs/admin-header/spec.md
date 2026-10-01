## ADDED Requirements

### Requirement: Header elements SHALL be vertically centered
The admin header SHALL display the Welcome title, clock, and Logout button in a single row with vertical centering.

#### Scenario: Header layout
- **WHEN** viewing any admin page
- **THEN** the header SHALL use Flexbox with `align-items: center` and `justify-content: space-between`

### Requirement: Clock and Logout button SHALL have equal height
The clock display and Logout button SHALL have the same height, 16px border-radius, and 20px spacing between them.

#### Scenario: Clock and button sizing
- **WHEN** inspecting the clock and Logout button
- **THEN** both SHALL have `border-radius: 16px`, `height: 44px`, and `gap: 20px` between them
