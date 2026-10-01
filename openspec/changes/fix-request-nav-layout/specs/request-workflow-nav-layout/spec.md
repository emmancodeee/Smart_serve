## ADDED Requirements

### Requirement: Navigation separated from form content
The Request workflow SHALL reserve 28–36px of vertical space between the last form field/content of a step and the bottom navigation container. The navigation container SHALL NOT be absolute or fixed repositioned; spacing SHALL be produced by the container's `margin`, `padding`, and flex layout.

#### Scenario: Every workflow step has breathing room
- **WHEN** a student is on any of the 5 Request workflow steps (ORF, Review, Modules, Books, Uniforms/Summary) and the step's last field is rendered
- **THEN** there is 28–36px of empty space between that field and the navigation container below it

### Requirement: Navigation is a distinct, padded card
The bottom navigation SHALL remain a separate card (its existing `border`, `border-radius: 16px`, background, and shadow are retained) with internal padding of 18–24px on top and bottom and 24–32px on the left and right. Back and Next SHALL NOT touch the card's edges.

#### Scenario: Navigation card padding
- **WHEN** the navigation card is rendered on any step
- **THEN** it has ~20px vertical and ~24px horizontal internal padding, and neither the Back nor the Next button touches the card edges

### Requirement: Back and Next aligned on one horizontal line
Back SHALL be positioned on the left and Next on the right of the same horizontal line, both vertically centered within the navigation container. The container SHALL use `display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box;`.

#### Scenario: Buttons on the same line
- **WHEN** a step is rendered at a wide enough width (desktop/tablet)
- **THEN** Back is on the left, Next is on the right, and both buttons share the same vertical center line

### Requirement: Existing button styles and sizes preserved
The Back button SHALL keep its existing outline/white style and the Next button SHALL keep its existing dark blue filled style with white text. Neither button SHALL be resized or restyled by this change, and their functionality SHALL remain unchanged. Back and Next SHALL continue working exactly as before.

#### Scenario: Button appearance and function unchanged
- **WHEN** the student clicks Back or Next after the layout change
- **THEN** the buttons look the same as before (sizes, colors, outline/fill styles) and step navigation behaves exactly as it did previously

### Requirement: Gap between navigation and workflow card bottom
There SHALL be a 16–24px gap between the bottom edge of the navigation card and the bottom edge of the workflow card.

#### Scenario: Bottom separation on a short step
- **WHEN** a step's content is shorter than the card and the student scrolls to the end
- **THEN** the navigation card sits 16–24px above the workflow card's bottom edge

### Requirement: Responsive navigation layout
On desktop and tablet widths the Back and Next buttons SHALL stay horizontally aligned (Back left, Next right) if the width allows, resizing without overlapping when space becomes tight. At narrow mobile widths the navigation SHALL use the existing stacked full-width layout so buttons never overlap.

#### Scenario: Narrow screen behavior
- **WHEN** the screen is narrow (below the mobile breakpoint)
- **THEN** Back and Next stack full-width below each other without overlapping, and the navigation card keeps consistent padding