## Why

The Inventory Management page currently uses its own layout, styling, and component classes that diverge from the SmartServe Dashboard. This creates a fragmented user experience — navigating between Dashboard and Inventory feels like switching between two different applications rather than moving between pages of the same system. The sidebar, header, cards, spacing, and table presentation are inconsistent, breaking the unified design language.

## What Changes

- Replace the inventory page's body class from `inventory-page` to `admin-page` to inherit the dashboard's global layout styles
- Replace the inventory-specific sidebar (`<nav id="sidebar">` with custom classes) with the exact admin dashboard sidebar structure
- Replace the inventory header with the dashboard header structure (clock widget, search, bell, profile, logout in the same positions)
- Replace `.inventory-summary` cards with `.analytics-grid` / `.stat-card` pattern matching the dashboard's stat cards
- Replace `.inventory-list-card` container with `.admin-section` card pattern (dark navy header strip + white content)
- Replace `.inventory-toolbar` filter styling to match dashboard input/button styles
- Replace `.inventory-table` with dashboard table styling (`.admin-table-wrap`, navy header)
- Remove duplicate CSS classes from inventory.css that overlap with admin.css
- Ensure responsive breakpoints match the dashboard's breakpoints exactly

## Capabilities

### New Capabilities

- `inventory-dashboard-layout`: Refactoring the Inventory Management page HTML and CSS to use the admin dashboard's layout system, component classes, and design tokens

### Modified Capabilities

_(none — this is a UI-only refactor with no requirement-level behavior changes)_

## Impact

- **Files modified**: `public/inventory.html`, `public/css/inventory.css`
- **Files NOT modified**: `server.js`, `public/js/inventory.js`, `public/js/admin-filters.js`, `public/css/admin.css`, `public/css/responsive.css`, `public/css/tailwind.css`
- **APIs**: None affected
- **Database**: None affected
- **Dependencies**: None added or removed
- **Risk**: Low — pure frontend CSS/HTML refactor; all JS event listeners bind by element ID which are preserved
