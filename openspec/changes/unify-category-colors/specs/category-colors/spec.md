## ADDED Requirements

### Requirement: Reusable category badge mapping

The Admin interface SHALL map any stored form of a resource category (case-insensitive `uniform`/`uniforms`, `module`/`modules`, `book`/`books`) to a canonical label (Uniforms, Modules, Books) and to a badge class, via a single shared function on `SmartFilter` exposed by `public/js/admin-filters.js`. Values that are not Uniforms, Modules, or Books SHALL map to nothing (null) and MUST NOT be assigned a resource color.

#### Scenario: Uniforms mapping
- **WHEN** the shared mapping receives a category value of "Uniform", "uniform", "Uniforms", or "uniforms"
- **THEN** it returns the canonical label "Uniforms" with a badge class styled `#22C1E8` background and white text

#### Scenario: Modules mapping
- **WHEN** the shared mapping receives a category value of "Module", "module", "Modules", or "modules"
- **THEN** it returns the canonical label "Modules" with a badge class styled `#315FE8` background and white text

#### Scenario: Books mapping
- **WHEN** the shared mapping receives a category value of "Book", "book", "Books", or "books"
- **THEN** it returns the canonical label "Books" with a badge class styled `#F5B800` background and `#111827` text

#### Scenario: Unknown category stays neutral
- **WHEN** the shared mapping receives any other value such as Electronics, Stationery, Other, General, Service, an announcement-domain category, or an empty value
- **THEN** it returns null and the caller keeps the existing neutral/default display

### Requirement: Shared category badge style

The whole Admin interface SHALL render resource category badges using a single `.category-badge` pill style defined in `public/css/admin.css`: fully rounded (999px), small vertical and medium horizontal padding, 600–700 font weight, centered readable label, and no border, gradient, or shadow. Color distinctions come only from the `--uniforms`, `--modules`, and `--books` modifiers.

#### Scenario: Badge shape
- **WHEN** any category badge is rendered
- **THEN** it uses the shared `.category-badge` base class with a fully-rounded shape, compact padding, centered label, and no border, gradient, or shadow

### Requirement: Consistent category colors in Inventory Management

The Inventory Management category column SHALL display Uniforms, Modules, and Books using the shared category badge colors, and SHALL NOT alter the Edit/Archive buttons, filters, table structure, or stock-status colors.

#### Scenario: Inventory category badges
- **WHEN** the inventory table renders an item whose category is Uniforms, Modules, or Books
- **THEN** the Category cell shows a `.category-badge` in the exact matching color for that resource type

#### Scenario: Inventory unknown categories
- **WHEN** the inventory table renders an item whose category is not Uniforms, Modules, or Books
- **THEN** the Category cell shows the existing plain neutral category text with no resource color

### Requirement: Consistent category colors in Feedback Management

The Feedback Management Category column SHALL display Uniforms, Modules, and Books using the shared category badge colors instead of a single blue badge for every category, and the Actions buttons SHALL remain unchanged.

#### Scenario: Feedback category badges
- **WHEN** the feedback table (and its detail view) displays a category of Uniforms, Modules, or Books
- **THEN** the category is shown as a `.category-badge` in the exact matching color, while the Actions buttons are unchanged

#### Scenario: Feedback unknown categories
- **WHEN** the feedback table displays a category outside the three resource types
- **THEN** the existing neutral/default category display is retained

### Requirement: Consistent category colors in Request Management

The Request Management table SHALL render the Module/Code value as a Modules badge and the Uniform Type value as a Uniforms badge, and SHALL keep the request status colors separate and unchanged.

#### Scenario: Request module and uniform badges
- **WHEN** a request has a module value and a uniform type value
- **THEN** the Module/Code cell shows a Modules-colored badge on the module value and the Uniform Type cell shows a Uniforms-colored badge, with the existing `-`/code fallbacks preserved

#### Scenario: Status colors unchanged
- **WHEN** the request status badge is rendered
- **THEN** it uses the existing status colors and is never displayed with a resource category color

### Requirement: Consistent category colors in Announcements

The Announcements table SHALL render a category badge only when the announcement category value maps to Uniforms, Modules, or Books; all other announcement categories SHALL keep the existing plain neutral display.

#### Scenario: Announcement resource category
- **WHEN** an announcement's category value is Uniforms, Modules, or Books
- **THEN** the Category cell shows a `.category-badge` in the matching resource color

#### Scenario: Announcement non-resource category
- **WHEN** an announcement's category is General, Enrollment, Events, or any other non-resource value
- **THEN** the Category cell keeps the existing neutral text with no resource color

### Requirement: Category and status colors remain separate

Resource category colors SHALL be used only for resource-category indicators and SHALL NOT be applied to statuses (Approved, Rejected, Pending, Archived), actions, buttons, or unrelated indicators anywhere in the Admin interface.

#### Scenario: No color bleed into statuses
- **WHEN** any status badge, priority badge, stock-status indicator, or action button is rendered
- **THEN** it uses its existing colors and none of the `#22C1E8`, `#315FE8`, or `#F5B800` category colors