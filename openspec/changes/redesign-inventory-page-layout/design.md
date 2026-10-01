## Context

The Inventory Management page (`public/inventory.html`) currently has all functional components — sidebar, header, summary cards, filters, table, pagination, modals — but the visual layout is inconsistent with the admin dashboard. The page uses a CSS-only mobile drawer for the sidebar, shared admin CSS for header/sidebar, and page-specific `inventory.css` for cards, table, and filters. All data fetching, filtering, search, export, and CRUD operations are handled by `inventory.js` and `admin-filters.js`.

## Goals / Non-Goals

**Goals:**
- Restructure the inventory page HTML to match the admin dashboard's visual structure
- Redesign the sidebar with consistent navy gradient, logo section, and nav items
- Redesign the header with left-aligned title/subtitle and right-aligned controls
- Restyle summary cards into a clean 4-column row with consistent card design
- Add a full-width read-only information banner
- Restyle filters to use a horizontal layout with consistent input styling
- Update the table header to navy/blue with white text
- Ensure responsive behavior at all breakpoints
- Preserve all existing JavaScript functionality without modification

**Non-Goals:**
- Changing API endpoints, database models, or server routes
- Modifying filter logic, search algorithms, or export functionality
- Changing authentication, authorization, or role-based access control
- Adding new CRUD operations or modifying existing ones
- Changing the data model or inventory calculations
- Modifying the admin dashboard or other pages

## Decisions

**1. Restructure inventory.html rather than create new files**
- Rationale: The page is a single static HTML file served directly. Restructuring the existing file keeps the routing simple and avoids breaking the `res.sendFile()` handler.
- Alternative: Create a new file and update the route — unnecessary complexity for a layout change.

**2. Reuse existing CSS classes from admin.css for sidebar/header**
- Rationale: The admin dashboard already has well-styled sidebar (`.sidebar-shell`) and header (`.admin-header-white`) components. Using the same classes ensures visual consistency.
- Alternative: Write new CSS from scratch — would duplicate styles and create maintenance burden.

**3. Keep inventory.css for page-specific styles**
- Rationale: Summary cards, table, filters, modals, and status badges are inventory-specific. Keeping them in `inventory.css` maintains separation of concerns.
- Alternative: Move everything to `admin.css` — would bloat the shared stylesheet.

**4. Preserve all existing element IDs**
- Rationale: `inventory.js` references elements by ID (`#inventoryBody`, `#inventoryTable`, `#totalItems`, `#lowStockItems`, etc.). Changing IDs would break JavaScript.
- Alternative: Update JS to use new IDs — violates the "no JS changes" constraint.

**5. Use Tailwind utilities for new layout, CSS for existing components**
- Rationale: The project already uses Tailwind for layout (flex, grid, spacing). Page-specific components (cards, table, badges) use custom CSS. Continue this pattern.

## Risks / Trade-offs

- **[Risk]** Layout changes could break responsive behavior → **Mitigation**: Test at 1920px, 1024px, 768px, and 375px breakpoints. Use existing Tailwind responsive prefixes.
- **[Risk]** CSS specificity conflicts between admin.css and inventory.css → **Mitigation**: Use scoped selectors (`.inventory-page .admin-header-white`) as already done in the codebase.
- **[Risk]** Sidebar nav items may not match admin dashboard exactly → **Mitigation**: Reuse the same HTML structure and CSS classes from `admin.html` sidebar.
