## Why

The current Inventory Management page has a functional but unpolished layout. The header, sidebar, summary cards, filters, and table exist but lack the clean, professional dashboard appearance of the admin dashboard. This redesign brings visual consistency across the SmartServe admin panel while preserving all existing functionality.

## What Changes

- Restructure the page layout to match the admin dashboard reference design (sidebar + header + content)
- Redesign the sidebar with navy background, logo section, and consistent nav styling
- Redesign the header with left-aligned title/subtitle and right-aligned controls
- Restyle summary cards into a clean 4-column row with icons and consistent card design
- Add a read-only information banner below the cards
- Restyle the inventory list section with a clean white card container
- Restyle filters to use a horizontal layout with consistent input styling
- Update the table header to use navy/blue background with white text
- Ensure full responsive behavior at desktop, tablet, and mobile breakpoints
- Do NOT change: API calls, database logic, filters, search, export, authentication, CRUD operations, or server routes

## Capabilities

### New Capabilities

- `inventory-page-layout`: Complete visual redesign of the Inventory Management page — sidebar, header, summary cards, information banner, filter toolbar, and inventory table layout

### Modified Capabilities

_(none — no existing spec-level behavior changes; this is a pure UI/layout change)_

## Impact

- **Files**: `public/inventory.html`, `public/css/inventory.css`, `public/css/admin.css` (header/sidebar shared styles)
- **Scope**: UI/CSS restructuring only — no API, route, or database changes
- **Risk**: Low — layout-only change with all existing functionality preserved via existing JS
