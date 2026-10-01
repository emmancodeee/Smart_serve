## ADDED Requirements

### Requirement: Summary cards SHALL display 4 compact metrics
The page SHALL display four equal-width summary cards (Total Items, Low Stock, Categories, Last Updated) approximately 120-130px tall, with icons and consistent spacing.

#### Scenario: Summary cards render
- **WHEN** user loads the inventory page
- **THEN** four summary cards SHALL display in a row with equal widths, showing Total Items (blue gradient), Low Stock (orange), Categories (navy), and Last Updated (slate)

### Requirement: Add Item form SHALL be in a modal dialog
The "Add New Inventory Item" form SHALL open in a modal dialog triggered by a "+ Add Item" button in the toolbar.

#### Scenario: Open add item modal
- **WHEN** user clicks "+ Add Item" button
- **THEN** a modal SHALL appear with the add-item form (Item Name, Category, Quantity, Reorder Level)

#### Scenario: Close add item modal
- **WHEN** user clicks cancel or the backdrop
- **THEN** the modal SHALL close without submitting

### Requirement: Toolbar SHALL contain search, filter, sort, and add button
A single toolbar row SHALL contain a search bar (wide), category filter dropdown, sort dropdown, and "+ Add Item" button, all on one row with equal spacing.

#### Scenario: Toolbar renders
- **WHEN** user views the inventory list section
- **THEN** a toolbar SHALL display with search input, category filter, sort dropdown, and "+ Add Item" button

### Requirement: Table SHALL have increased row height and spacing
The inventory table SHALL have 72px row height, 20px vertical / 24px horizontal cell padding, centered Quantity column, and dates formatted as "Jul 14, 2026".

#### Scenario: Table renders with formatted dates
- **WHEN** inventory data loads
- **THEN** the table SHALL display rows with 72px height, dates in "MMM DD, YYYY" format, and Quantity centered

### Requirement: Status SHALL use colored circular indicators
Status values SHALL display as small colored dots with text: green (#22C55E) for "In Stock", orange (#F59E0B) for "Low Stock", red (#EF4444) for "Out of Stock".

#### Scenario: Status indicators render
- **WHEN** a table row has an item with quantity > reorder level
- **THEN** the status cell SHALL show a green dot with "In Stock"

#### Scenario: Low stock indicator
- **WHEN** a table row has an item with quantity <= reorder level and quantity > 0
- **THEN** the status cell SHALL show an orange dot with "Low Stock"

#### Scenario: Out of stock indicator
- **WHEN** a table row has an item with quantity = 0
- **THEN** the status cell SHALL show a red dot with "Out of Stock"

### Requirement: Category SHALL use colored badges
Category values SHALL display as rounded badges with subtle colors: Books (light blue #DBEAFE), Modules (light purple #EDE9FE), Uniforms (light orange #FEF3C7), other categories with neutral gray.

#### Scenario: Category badge renders
- **WHEN** a table row has category "Books"
- **THEN** the category cell SHALL display a badge with `background: #DBEAFE`

### Requirement: Action buttons SHALL be icon-only
Edit and Delete actions SHALL render as compact 36px icon buttons with 10px radius: Edit (blue) and Delete (red), using Lucide SVG icons.

#### Scenario: Icon buttons render
- **WHEN** a table row renders for a non-super-admin user
- **THEN** the actions cell SHALL contain a blue edit icon button and a red delete icon button, each 36px

### Requirement: Shadows SHALL be soft
All cards, modals, and dropdowns SHALL use `box-shadow: 0 4px 16px rgba(15,23,42,.06)`.

#### Scenario: Box shadows
- **WHEN** any card or modal renders
- **THEN** it SHALL use the soft shadow `0 4px 16px rgba(15,23,42,.06)`

### Requirement: Hover animations SHALL be subtle
Cards, buttons, table rows, and dropdowns SHALL transition at 0.2s ease on hover (translateY, opacity, or shadow changes).

#### Scenario: Card hover animation
- **WHEN** user hovers over a summary card
- **THEN** the card SHALL transition with 0.2s ease, lifting slightly

### Requirement: Section titles SHALL include subtitles
Each section title SHALL have a descriptive subtitle below it in secondary text (#64748B).

#### Scenario: Section subtitles
- **WHEN** user views the inventory list section
- **THEN** the title "Inventory List" SHALL display with a subtitle "Manage all inventory items, stock levels, and availability."
