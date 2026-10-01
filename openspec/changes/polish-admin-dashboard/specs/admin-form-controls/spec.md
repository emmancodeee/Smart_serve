## ADDED Requirements

### Requirement: Buttons SHALL have consistent styling
All admin buttons SHALL use 12px border-radius, 14px vertical × 22px horizontal padding, darker hover states, and smooth 0.2s transitions.

#### Scenario: Button border radius
- **WHEN** inspecting any admin button
- **THEN** it SHALL have `border-radius: 12px`

#### Scenario: Button padding
- **WHEN** inspecting any admin button
- **THEN** it SHALL have `padding: 14px 22px`

#### Scenario: Button hover
- **WHEN** hovering over an admin button
- **THEN** the background SHALL darken with `transition: all 0.2s ease`

### Requirement: Inputs and dropdowns SHALL have consistent styling
All admin inputs and `<select>` elements SHALL use 12px border-radius, equal heights, and proper internal padding.

#### Scenario: Input border radius
- **WHEN** inspecting any text input or dropdown
- **THEN** it SHALL have `border-radius: 12px`

#### Scenario: Input height
- **WHEN** inspecting any text input or dropdown
- **THEN** it SHALL have `height: 44px` with `padding: 0 16px`
