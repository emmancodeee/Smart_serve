## ADDED Requirements

### Requirement: Inventory table card styling
The inventory table and its surrounding container SHALL appear as a single unified rounded card with comfortable left and right padding. The card SHALL NOT touch the page edges. The card boundary SHALL be visually consistent on desktop, tablet, and mobile.

#### Scenario: Desktop table card
- **WHEN** the Inventory Management page is rendered on desktop (≥ 1024 px)
- **THEN** the inventory table sits inside a rounded bordered container with at least 16 px horizontal padding from the container edge to the table
- **AND** the table container has a visible rounded border and background consistent with the admin card style

#### Scenario: Mobile table card
- **WHEN** the Inventory Management page is rendered on mobile (< 640 px)
- **THEN** the table container scrolls horizontally within its rounded card boundary without overflowing the page
- **AND** the card retains its padding and border-radius

### Requirement: Column header alignment
The table column headers (Item Name, Category, Quantity, Status, Last Updated, Actions) SHALL be horizontally aligned with their corresponding data cells. Headers SHALL NOT overlap and SHALL vertically center their text.

#### Scenario: Item Name column width
- **WHEN** a row contains a long item name (e.g. "Business Analytics Module Pack")
- **THEN** the Item Name column is wide enough to display the name on one line on desktop (≥ 1024 px) without truncation

#### Scenario: Actions column alignment
- **WHEN** the Actions column header is rendered
- **THEN** the header text is aligned to the right of its cell
- **AND** each "View only" label or action button in the column is aligned consistently at the right side of the row

### Requirement: Consistent row styling
Each inventory table row SHALL have the same consistent height, vertical padding, horizontal padding, and clean horizontal separation from the next row. Rows SHALL be compact but readable with comfortable breathing room. No text SHALL touch the row border.

#### Scenario: Row height and padding
- **WHEN** the inventory table renders multiple rows
- **THEN** every row has identical vertical padding and a consistent minimum height
- **AND** every row has identical horizontal padding within each column

#### Scenario: Row separation
- **WHEN** two consecutive inventory rows are rendered
- **THEN** a visible horizontal separator exists between them
- **AND** no row text touches the separator or the row boundary

### Requirement: Quantity column format
The Quantity column SHALL display the numeric quantity immediately followed by its unit of measure (e.g. "14 pcs") with consistent spacing across all rows. The number and unit SHALL NOT be separated by excessive whitespace.

#### Scenario: Quantity display
- **WHEN** an inventory row has quantity 14 and unit "pcs"
- **THEN** the Quantity cell displays "14 pcs" as a single aligned unit

### Requirement: Pagination footer layout
The pagination footer SHALL contain two groups: information on the LEFT and navigation buttons on the RIGHT. The layout SHALL use a two-column left/right separation (e.g. `justify-content: space-between`). The "Per page" selector and label SHALL NOT be visible anywhere in the pagination footer.

#### Scenario: Footer content
- **WHEN** there are 44 total items and 10 shown on page 1
- **THEN** the pagination footer displays "Page 1 of 5" and "Showing 1-10 of 44 items" on the left
- **AND** displays « Prev and Next » buttons on the right

#### Scenario: Per page selector removed
- **WHEN** the Inventory Management page loads
- **THEN** no "Per page" label or items-per-page dropdown is visible in the pagination footer
- **AND** the internal pagination still operates with a page size of 10

#### Scenario: Page 1 button state
- **WHEN** the user is on page 1
- **THEN** the « Prev button is visually disabled and does not trigger navigation

### Requirement: Pagination footer vertical spacing
The pagination footer SHALL have a comfortable vertical gap separating it from the last inventory row. The footer SHALL NOT touch the last row or the bottom table border. There SHALL be adequate padding above and below the footer.

#### Scenario: Gap between last row and footer
- **WHEN** the inventory table renders its last row
- **THEN** a visible gap (at least 12 px) exists between the bottom of the last row and the pagination footer top border

### Requirement: Table and footer boundary alignment
The inventory table and the pagination footer SHALL share the same left and right visual boundaries. The pagination bar SHALL NOT extend beyond or fall short of the table container edges.

#### Scenario: Aligned edges
- **WHEN** the table and pagination are rendered together
- **THEN** the left edge of the pagination information aligns vertically with the left edge of the first table column
- **AND** the right edge of the pagination buttons aligns vertically with the right edge of the last table column

### Requirement: Responsive pagination footer
On mobile screens, the pagination footer SHALL stack vertically if horizontal space is insufficient, with the information above the navigation buttons. The footer SHALL NOT overflow off-screen.

#### Scenario: Mobile pagination
- **WHEN** the screen width is below 640 px
- **THEN** the pagination information and navigation buttons remain fully visible without horizontal overflow
- **AND** the footer content is readable and the buttons are tappable