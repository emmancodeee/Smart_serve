## Why

The Inventory Management page (`#analytics` section in `public/admin.html`) currently looks crowded and unbalanced: six summary stat cards are forced into a 5-column grid (the 6th card wraps awkwardly and sits alone), the filter toolbar consumes excessive vertical space, chart boxes in the 2-column analytics grid have inconsistent internal padding, and the Operational Summary KPI cards use nearly half of their card width as empty space. The page needs a purely visual cleanup — consistent spacing, padding, alignment, and sizing — while keeping every feature, color, and the SMARTSERVE design language intact.

## What Changes

- **Page container**: consistent max-width centering and balanced padding for the inventory content area (no content touching browser edges, compact but not cramped).
- **Inventory Overview header**: consistent horizontal/vertical padding and title alignment with the content below; colors, typography, and border radius unchanged.
- **Filter toolbar**: uniform control heights, gaps, and radii; controls arranged in one clean wrapping row instead of stacked rows; filter behavior and options untouched.
- **Summary stat cards**: consistent widths/heights, equal gaps, aligned icon/title/value/description; fixed-size icon container in the top-right so long titles wrap without colliding; sparklines anchored at the bottom.
- **Summary card grid**: CSS Grid with 5 columns on desktop so the 6th card (Active Cohorts) flows into the next row naturally, plus responsive breakpoints.
- **Analytics grid**: clean two-column layout (left: Items Given Out, Low Stock Items, Inventory Changes; right: Most Requested Items, Active Courses, Upcoming Demand) with equal columns, equal gaps, and paired-card alignment.
- **Analytics card internals**: consistent card padding, header spacing, divider alignment, and chart breathing room; aligned rows for progress-bar charts; centered donut charts; balanced timeline spacing; chart containers with consistent height.
- **Operational Summary**: 3-column x 2-row grid of KPI cards with equal widths/heights/gaps and consistent internal padding.
- **Spacing system**: consistent 4/8/12/16/20/24/32px scale (reusing existing tokens like `--spacing-card`/`--spacing-section` where they already match).
- **Responsive behavior**: clean layouts at large desktop, standard desktop, laptop, tablet, and mobile with no horizontal overflow, overlapping, or clipped charts.

No functionality, API calls, database logic, filters, chart data/logic, colors/theme, sidebar, header, or routes change.

## Capabilities

### New Capabilities
- `inventory-overview-layout`: Layout, spacing, padding, alignment, sizing, and responsive behavior of the Inventory Overview section (stat cards, filter toolbar, analytics charts, operational summary) in the admin inventory view.

### Modified Capabilities
<!-- No main specs exist yet (openspec/specs/ is empty); this introduces the first spec. -->

## Impact

- `public/admin.html` — minor structural/class additions only (section container, grid wrappers); no elements removed or reordered.
- `public/css/admin.css` — primary change surface: `.admin-page` section overrides (~lines 2025-2290), `.kpi-grid`/`.kpi-card` (~lines 2684-2837), `.filter-toolbar` (~lines 2843+).
- `public/js/admin.js`, `public/js/admin-filters.js` — NOT modified (chart rendering, SmartFilter, and KPI rendering logic stay untouched).
- No API, database, or route changes.
