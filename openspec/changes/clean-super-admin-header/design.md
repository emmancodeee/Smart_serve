## Context

The Super Admin Dashboard header (`views/superAdmin/dashboard.ejs` or equivalent) currently contains three text elements — a welcome greeting, a page title, and a subtitle description — alongside functional elements (date/time, logout, search, notifications, user profile). These text elements are decorative and consume valuable horizontal space, making the header feel cluttered. The project uses a single-file EJS/CSS structure with existing CSS classes for header layout.

## Goals / Non-Goals

**Goals:**
- Remove the three decorative text elements from the header HTML
- Reclaim horizontal space by adjusting CSS so remaining elements fill the header naturally
- Maintain exact same visual appearance for all retained elements (colors, fonts, spacing, borders)
- Keep responsive behavior across desktop, tablet, and mobile breakpoints

**Non-Goals:**
- Changing sidebar, dashboard cards, tables, or any non-header content
- Modifying API routes, database models, or server logic
- Redesigning the visual theme or color scheme
- Changing the functionality of search, notifications, logout, or user profile

## Decisions

**1. Edit HTML directly to remove elements, adjust CSS to fill gaps**
- Rationale: Simplest approach — no new classes or component restructuring needed. Removing the three elements and letting the existing flex/grid layout reflow is safer than rewriting the header structure.
- Alternative considered: Hide elements via `display: none` in CSS — rejected because dead HTML is confusing for future maintainers.

**2. Reuse existing CSS classes for remaining elements**
- Rationale: Existing classes already style the retained elements correctly. Only minor layout adjustments (flex gap, justify-content) are needed.
- Alternative considered: Create new CSS classes — unnecessary complexity for a layout-only change.

**3. Target the specific header container, not global styles**
- Rationale: Changes scoped to the Super Admin header only prevent side effects on other dashboards (admin, staff).

## Risks / Trade-offs

- **[Risk]** Layout shift on certain screen sizes → **Mitigation**: Test at desktop (1920px), tablet (768px), and mobile (375px) breakpoints after changes.
- **[Risk]** Missing a hidden reference to removed text (e.g., used in JS for conditional display) → **Mitigation**: Search codebase for the three text strings before removal; verify no JS references.
