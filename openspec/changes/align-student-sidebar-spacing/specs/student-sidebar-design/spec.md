## ADDED Requirements

### Requirement: Super Admin / Admin geometry parity
The Student sidebar SHALL apply the exact same per-item spacing, padding, sizing, alignment, and proportion rules used by the Super Admin/Admin sidebar on all six student pages. Each navigation item SHALL have 1rem top/bottom padding and 1.25rem left/right padding, a 1rem gap between the icon container and the label, and a 1rem border radius. The nav list SHALL use 1.5rem outer padding and 0.5rem vertical spacing between items. Menu text SHALL match the reference font size (0.96rem), weight (600), and vertical alignment.

#### Scenario: Item geometry matches the reference
- **WHEN** a rendered Student sidebar item is measured
- **THEN** its padding, gap, radius, height, and the vertical spacing between items equal the same measured values as a Super Admin/Admin sidebar item

#### Scenario: Header rhythm matches the reference
- **WHEN** the Student sidebar header/logo section renders
- **THEN** the vertical spacing around the logo box and the gold divider match the reference header, and the gap between the divider and the first nav item matches the Super Admin/Admin sidebar

### Requirement: Consistent icon and label columns
Icons SHALL render in a fixed 2.35rem container with 0.85rem radius, glassy white border/background, gold `#fde047` glyph, and `flex-shrink:0` so all icons align on the same vertical axis and all labels align on the same vertical axis, matching the Super Admin/Admin sidebar. Icon glyphs SHALL use the same rendering metrics as the admin nav icons. Labels that wrap to two lines SHALL keep a 1.25 line-height, matching the reference, without changing the menu item's overall structure.

#### Scenario: Icons and labels align on single axes
- **WHEN** the six Student sidebar items render
- **THEN** every icon container starts at the same left offset on a single vertical axis and every label starts at the same left offset on a single vertical axis

#### Scenario: Two-line labels stay consistent
- **WHEN** a label wraps to two lines (for example, "Feedback Management" or "Inventory Management" width wrapping)
- **THEN** the wrapped label keeps the reference line-height and the item keeps the same overall height, padding, and spacing as the other items

### Requirement: Active item geometry and continuous gold border
The active item SHALL keep the same rounded-rectangle shape, padding, and dimensions as every other menu item. The gold/yellow border SHALL be solid, visible, and continuous on all four sides. Activating a different item SHALL move only the active styling (position offset, background, and border color) and SHALL NOT change any item's width, height, padding, or spacing.

#### Scenario: Active item matches other items' dimensions
- **WHEN** an item is active
- **THEN** its height, width, padding, radius, and spacing are identical to every other item, and the gold border is fully visible on all four sides

#### Scenario: No layout shift when the active item changes
- **WHEN** the student clicks a different sidebar item
- **THEN** no item resizes, reflows, or shifts; only the active styling moves to the clicked item