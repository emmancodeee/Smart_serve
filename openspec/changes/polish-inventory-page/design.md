## Context

The inventory page currently uses its own CSS (`inventory.css`) with a dated design: large gradient summary cards (blue for total, red for low-stock), a bulky inline add-item form, flat table with small padding, and legacy button styles. The page feels inconsistent with the polished admin dashboard (which uses design tokens, 12px radius, soft shadows). Since the inventory page is used daily by administrators to search, filter, and manage stock, improving its UX will directly impact daily workflow efficiency.

## Goals / Non-Goals

**Goals:**
- Replace 2 large summary cards with 4 compact equal-width cards (Total Items, Low Stock, Categories, Last Updated)
- Move add-item form into a modal dialog triggered by a "+ Add Item" button
- Add a single toolbar row (search, category filter, sort, add button) above the table
- Redesign the table: 72px row height, 20px/24px cell padding, centered Quantity, formatted dates
- Replace status badges with colored circular indicators (green/orange/red)
- Add category-specific badge colors (blue/purple/orange)
- Standardise all form inputs to 52-56px height, 12px border radius
- Apply consistent spacing system (32px page padding, 28px section gap, 24px card padding)
- Use only soft shadows: `0 4px 16px rgba(15,23,42,.06)`
- Add 0.2s hover animations to interactive elements
- Preserve Navy + Gold branding

**Non-Goals:**
- No backend or API changes
- No header or sidebar changes (already modernised)
- No new npm packages or build tools
- No changes to the edit modal (already modal-based)
- No changes to the read-only / super admin notice

## Decisions

- **Modal for Add Item**: Moving the form to a modal keeps the inventory list as the primary focus. The modal reuses the existing modal pattern from the edit dialog.
- **4 summary cards**: Total Items and Low Stock are the most important; adding Categories and Last Updated provides quick context without needing to scan the table.
- **Toolbar row**: Putting search + filter + sort + add on one row follows the Supabase/Vercel pattern and keeps controls accessible without scrolling.
- **Status as circular indicators**: Small colored dots with text labels (In Stock / Low Stock / Out of Stock) are more scannable than full-width badges.
- **Category badge colors**: Light blue/purple/orange backgrounds with darker text follow the same pattern as the admin dashboard's table filters.
- **Icon-only action buttons**: Using Lucide edit/trash2 icons in compact 36px buttons saves space and looks modern.

## Risks / Trade-offs

- [Modal complexity] The add-item modal and edit modal coexist → Ensure they don't conflict (different IDs, separate event listeners)
- [JS refactor] `displayInventory()` generates HTML for table rows → Must update template to match new structure (badge spans, icon buttons, formatted dates)
- [CSS collision] New styles may conflict with admin.css rules for `.inventory-page` → Scope new styles under `.inventory-page` or use unique class names

## Migration Plan

1. Write new CSS in `inventory.css` (replace all existing styles)
2. Update `inventory.html`: summary cards → 4-card grid, add toolbar, move form to modal, restructure table
3. Update `inventory.js`: rewrite `displayInventory()` for new markup, add modal open/close for add-item, format dates
4. Remove old CSS and dead code
