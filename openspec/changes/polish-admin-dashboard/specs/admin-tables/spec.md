## ADDED Requirements

### Requirement: Tables SHALL have rounded corners
All admin tables SHALL have 18px border-radius applied to the `<table>` element.

#### Scenario: Table border radius
- **WHEN** inspecting an admin table
- **THEN** it SHALL have `border-radius: 18px` with `overflow: hidden`

### Requirement: Table headers SHALL use navy background with white text
All table header cells SHALL have a navy background color and white bold text.

#### Scenario: Table header styling
- **WHEN** inspecting a `<th>` element in any admin table
- **THEN** it SHALL have `background: var(--color-primary-navy)`, `color: white`, `font-weight: 600`

### Requirement: Table rows SHALL have hover highlight
Table body rows SHALL have white background with a light hover state.

#### Scenario: Row hover
- **WHEN** hovering over a table row
- **THEN** the row SHALL have `background: #F8FAFC`
