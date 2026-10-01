## Context

The SmartServe application has two main admin-facing pages: the Dashboard (`admin.html`) and the Inventory Management page (`inventory.html`). Both share the same sidebar navigation, header, and design system defined in `admin.css`, but the inventory page currently uses its own layout classes (`.inventory-page`, `.inventory-summary`, `.inventory-list-card`, `.inventory-table`, `.inventory-toolbar`) that diverge from the dashboard's patterns (`.admin-page`, `.analytics-grid`, `.stat-card`, `.admin-section`, `.admin-table-wrap`).

The dashboard uses a consistent layout system:
- Body class `admin-page` activates shared layout rules
- `.admin-section` cards with dark navy header strips for content sections
- `.analytics-grid` / `.stat-card` for summary statistics
- `.admin-table-wrap` for table containers with horizontal scroll
- `.admin-main` for the content area with `max-width: 1280px` and `32px` padding

The inventory page needs to adopt this same system while preserving all its functional behavior (data loading, filters, search, export, pagination, modals, toasts).

## Goals / Non-Goals

**Goals:**
- Make the inventory page visually identical to a dashboard page when navigating between them
- Adopt `admin-page` body class to inherit shared layout rules
- Use dashboard's `.admin-section` card pattern for the inventory list container
- Use dashboard's `.analytics-grid` / `.stat-card` pattern for summary cards
- Use dashboard's `.admin-table-wrap` for the table container
- Use dashboard's filter/input/button styles
- Maintain all existing functionality without modification

**Non-Goals:**
- Changing any API endpoints, database queries, or server-side logic
- Modifying `inventory.js` or `admin-filters.js` behavior
- Adding new features or capabilities
- Refactoring the dashboard itself
- Changing the sidebar navigation items or their behavior

## Decisions

### Decision 1: Use `admin-page` body class instead of `inventory-page`

**Choice**: Change `<body class="inventory-page ...">` to `<body class="admin-page ...">`

**Rationale**: The `admin-page` class activates all shared layout rules in `admin.css` — sidebar, header, content shell, section cards. The `inventory-page` class only activates a narrow set of overrides. Using `admin-page` eliminates the need for most inventory-specific layout CSS.

**Alternative considered**: Keep `inventory-page` and duplicate all dashboard styles — rejected because it creates maintenance overhead and drift.

### Decision 2: Use dashboard's `<nav>` sidebar structure verbatim

**Choice**: Copy the exact sidebar HTML from `admin.html` (lines 32-54) into `inventory.html`, marking the Inventory Management link as active.

**Rationale**: The sidebar is identical across all admin pages. Using the exact same HTML ensures consistent styling, spacing, and behavior. The `admin.js` mobile menu toggle logic applies to the same element IDs.

### Decision 3: Use dashboard header structure with clock/search/bell/profile

**Choice**: Adopt the header layout from `admin.html` (lines 59-86) — left side has clock + logout, right side has search + bell + profile.

**Rationale**: The dashboard header is the canonical layout. The inventory header should be indistinguishable.

### Decision 4: Replace `.inventory-summary` with `.analytics-grid` / `.stat-card`

**Choice**: Use the dashboard's stat card pattern for the 4 inventory summary cards.

**Rationale**: The dashboard's `.stat-card` has the correct border-radius (20px), padding (24px), shadow, and typography. The inventory's `.summary-card` uses gradient backgrounds which diverge from the dashboard's white-card aesthetic.

### Decision 5: Wrap inventory list in `.admin-section` card

**Choice**: Use the dashboard's `.admin-section` pattern — a card with a dark navy header strip containing the title, and white content area below.

**Rationale**: This is the dashboard's standard content container. The inventory list, filters, and table should live inside this container just like dashboard sections.

### Decision 6: Remove duplicate CSS from inventory.css

**Choice**: Remove inventory-specific layout classes that overlap with admin.css (sidebar, header, summary cards, table wrapper, modal styles). Keep only inventory-specific styles that don't exist in admin.css (status badges, category badges, toast notifications, sort arrows).

**Rationale**: Duplicate CSS creates specificity conflicts and maintenance burden. The inventory page should inherit as much as possible from admin.css.

## Risks / Trade-offs

- **Risk**: Removing inventory.css classes might break JS that queries by class name → **Mitigation**: inventory.js binds by element ID, not class. Verified all `getElementById` calls are preserved.
- **Risk**: Dashboard's `.admin-section` card pattern might not accommodate the inventory toolbar/filter layout → **Mitigation**: The section's content area is a flexible container; toolbar and table will flow naturally.
- **Risk**: `.stat-card` styling might conflict with inventory's gradient card design → **Mitigation**: The gradient cards are being replaced with the dashboard's white stat cards intentionally.
- **Risk**: Specificity conflicts between inventory.css and admin.css → **Mitigation**: inventory.css is loaded after admin.css; remaining inventory styles use sufficiently specific selectors.
