## ADDED Requirements

### Requirement: Super Admin dashboard shows only the four inventory summary cards
The Super Admin dashboard Inventory Overview SHALL display exactly four summary cards: Units Available, Units Distributed (Last 30 Days), Projected Demand (30 Days), and Items Below Reorder Point. The Inventory Adjustments and Active Cohorts cards SHALL be removed entirely, and the dashboard MUST NOT leave empty card placeholders or blank space where those cards were.

#### Scenario: Dashboard renders without the removed cards
- **WHEN** a Super Admin opens the dashboard
- **THEN** the Inventory Overview shows exactly four stat cards (Units Available, Units Distributed, Projected Demand, Items Below Reorder Point)
- **AND** no Inventory Adjustments or Active Cohorts card is present
- **AND** no empty placeholder or gap remains on the grid line where they were

### Requirement: Four-card grid reflows evenly across the dashboard width
The four remaining cards SHALL align evenly across the available dashboard width using the grid/container behavior. On desktop the cards SHALL occupy one row of four equal columns; on smaller screens they SHALL reflow to a balanced arrangement (two by two), and on the narrowest screens to a single column. Cards MUST NOT leave an empty column or trailing blank space at any breakpoint.

#### Scenario: Desktop layout is one even row of four
- **WHEN** the dashboard is viewed at a desktop viewport width
- **THEN** the four cards render in one row of four equal-width columns with no empty fifth column

#### Scenario: Tablet and mobile layout reflows two by two
- **WHEN** the dashboard is viewed at a tablet or small mobile viewport width
- **THEN** the four cards reflow into two columns (a balanced two-by-two grid)

#### Scenario: Narrowest layout stacks one per row
- **WHEN** the dashboard is viewed at a very narrow viewport width
- **THEN** the four cards stack one per row without blank space

### Requirement: Retained cards, page, and other cards unchanged
The four retained cards SHALL keep their existing values, sparklines, hint text, colors, and card design. The dashboard's other content (charts, sidebar, header, filters) SHALL remain unchanged, and removing the two cards MUST NOT disable any existing functionality of the four retained cards.

#### Scenario: Retained cards behave identically to before
- **WHEN** a Super Admin views the dashboard after the removal
- **THEN** Units Available, Units Distributed, Projected Demand, and Items Below Reorder Point show the same values and behavior as before
- **AND** the charts, sidebar, header, filters, colors, and card designs are unchanged