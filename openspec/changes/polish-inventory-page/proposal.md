## Why

The inventory management page uses outdated styling—large gradient summary cards, a bulky add-item form, flat table design, and inconsistent spacing—that feels unpolished compared to the rest of the admin dashboard. Administrators use this page daily to search, filter, and manage stock, so improving readability, layout, and visual hierarchy will make the tool faster and more pleasant to use.

## What Changes

- Replace 2 large gradient summary cards with 4 compact, equal-width cards (Total Items, Low Stock, Categories, Last Updated)
- Move the Add New Inventory Item form into a modal triggered by a "+ Add Item" button
- Reposition the inventory list as the primary content area directly below summary cards
- Add a single toolbar row: Search bar, Category filter, Sort dropdown, and Add Item button
- Redesign the table with increased row height (72px), centered Quantity, formatted dates ("Jul 14, 2026"), and icon-based Edit/Delete actions
- Replace existing status badges with colored circular indicators (green/orange/red)
- Apply category badge colors (Light Blue for Books, Light Purple for Modules, Light Orange for Uniforms)
- Reduce shadow intensity to `0 4px 16px rgba(15,23,42,.06)`
- Standardise all form inputs to 52-56px height with 12px border radius
- Add subtitles to section titles
- Add subtle 0.2s hover animations to cards, buttons, table rows, dropdowns
- Apply consistent spacing system (32px page padding, 28px section gap, 24px card padding, 20px/24px table cell padding)
- Preserve SMARTSERVE Navy (#1E2F73) + Gold (#F4C542) branding

## Capabilities

### New Capabilities
- `polished-inventory-ui`: Redesigned inventory page with modern layout, consistent spacing, compact summary cards, inline modal for add-item, redesigned table with icon actions, coloured category/status badges, and soft shadows

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `public/inventory.html` — Restructure page layout: summary cards, toolbar, table, modal form
- `public/css/inventory.css` — Replace all existing styles with new design system styles
- `public/js/inventory.js` — Update display logic for new table structure, badges, date format, and modal
