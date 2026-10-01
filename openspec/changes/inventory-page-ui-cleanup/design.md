## Context

The Inventory Management page is the `#analytics` section of `public/admin.html` (rendered at `/admin/dashboard`'s inventory view). Current structure:

- `main.admin-main` — max-width 1280px, centered, padding driven by `--spacing-page: 32px`.
- `section#analytics.admin-section` — white card, 28px radius, navy `#152c69` header band "Inventory Overview" (`padding: 18px 24px`, `margin: 0 -1.25rem 1rem`, radius `28px 28px 0 0`).
- `#analyticsFilterContainer` — populated by `SmartFilter` (js/admin-filters.js) with `.filter-toolbar` containing: Date Range (preset select + optional custom date row), Course, Year Level, Item Category, Inventory Status selects, plus Reset and Export buttons.
- `.analytics-grid` — 6 `.stat-card`s in `repeat(5, 1fr)`; the 6th card ("Active Cohorts") wraps to a lonely row.
- `.charts-container` — 6 `.chart-box`es in `repeat(2, 1fr)`.
- `.summary-box.admin-surface-block` — "Operational Summary" heading + `#analyticsKpis` filled by `renderKpiCards()` (js/admin.js) with 6 `.kpi-card`s in a 3-column `.kpi-grid`.

Relevant CSS lives in `public/css/admin.css` under the `.admin-page` scope (lines ~2025-2290), `.kpi-*` (lines ~2684-2837), and `.filter-toolbar`/`.filter-control` (lines ~2843+). Design tokens exist at the top: `--spacing-page: 32px`, `--spacing-section: 24px`, `--spacing-card: 20px`, `--radius-card: 20px`, `--shadow-card`.

Constraints: no JS changes (chart/SmartFilter/KPI-render logic is off-limits), no color/theme changes, no sidebar/header changes, no feature/route changes. The page already uses the SMARTSERVE design language; this is a pure layout/spacing pass.

## Goals / Non-Goals

**Goals:**
- Consistent, balanced spacing and alignment across the whole inventory view.
- Summary cards in a clean 5-per-row grid with the 6th flowing to the next row; no single-card orphan row of awkward whitespace on wide screens.
- Filters in one tidy wrapping row with uniform control heights/gaps.
- Two-column analytics grid with evenly sized, aligned chart cards.
- Operational Summary KPI cards in a balanced 3x2 grid.
- Fully responsive with no overflow or overlap.

**Non-Goals:**
- No changes to filter options, behavior, or SmartFilter JS.
- No changes to chart data, series, colors, or rendering logic (including sparklines).
- No changes to KPI data, icons, or `renderKpiCards`.
- No sidebar or header changes.
- No color palette changes.
- No new features or removed content.

## Decisions

### D1: CSS-only change surface, with minimal HTML class additions
All spacing/layout is controlled via `public/css/admin.css` under the `.admin-page` scope; `public/js/admin.js` and `public/js/admin-filters.js` are untouched. Where the current markup lacks hooks (e.g., a wrapper for the analytics section content below the header band, or grid wrappers), add **only** inert wrapper elements/classes in `public/admin.html` that carry no styling of their own (CSS-only scaffolding). This keeps the entire change reviewable as CSS diffs and eliminates any risk to behavior.
- Alternative considered: restructure HTML heavily — rejected because it risks breaking SmartFilter container expectations and `renderChartWhenVisible` container lookups.

### D2: Reuse existing design tokens and an 8px-based spacing scale
Use the existing `--spacing-card` (20px), `--spacing-section` (24px), `--spacing-page` (32px) tokens plus explicit 4/8/12/16/20/24/32px values drawn from the same scale. Random values (13px, 17px, 27px…) are avoided. Target values:
- Page padding: `--spacing-page` (32px) desktop; 20px tablet; 16px mobile (Tailwind `px-4 md:px-6` already on `main` — normalize via the `.admin-page .admin-main` rule).
- Section inner padding: `24px` (from current `0 1.25rem 1.25rem` → `24px` all sides, header excluded via negative margins).
- Card gaps: `20px` (already `var(--spacing-card)`).
- Stat/chart card padding: `24px`; KPI card padding: `16px 20px`.

### D3: Summary card grid — `repeat(5, minmax(0, 1fr))` with natural wrap
Change `.admin-page .analytics-grid` from `repeat(5, 1fr)` to `repeat(5, minmax(0, 1fr))` (prevents min-content overflow of the 40px fixed icon + long titles) and add a responsive tier: `repeat(3, 1fr)` at ≤1023px, `repeat(2, 1fr)` at ≤639px, `1fr` at ≤480px. The 6th card (Active Cohorts) fills the next row's first cell — no forced full-width row, no orphan positioning.
- Alternative considered: `repeat(auto-fit, minmax(210px, 1fr))` — rejected because it makes card counts vary unpredictably with width (5, 4, 3…), which contradicts the "5 across when space allows" requirement.

### D4: Stat card internals — flex column with fixed icon, bottom-anchored sparkline
Make `.stat-card` a flex column: header row (`stat-header`) = label (flex:1, min-width:0) + 40px fixed `stat-icon` circle (already `flex-shrink:0`); value; description; then `margin-top:auto` on `.stat-sparkline` so all sparklines sit flush to the card bottom at equal height. Keep `align-items:flex-start`, allow label wrapping (`white-space:normal`, existing `padding-right:20px` → bump to `24px` gap via `gap` on header). Card content spacing: label→value 12px, value→description 8px, description→sparkline 16px.

### D5: Filters — single wrapping row via the existing toolbar structure
`SmartFilter` already renders `.filter-toolbar__row--main` and an `.advanced-filters` panel; leave the DOM untouched. In CSS, make the main row `flex-wrap: wrap; align-items: stretch/center` with uniform gaps (12px), give every control a consistent `44px` height (already set on `.filter-control__select/__input/.smart-combobox__button`), consistent radius (`--radius-lg`), and reduce toolbar bottom margin to `20px`. The date-range custom row remains inside its control (its own is-visible toggle) — no JS change.
- Note: `.filter-control--search` is not used by the analytics filter; the analytics config registers only the five selects + reset/export buttons, so the single row holds 5 controls + 2 buttons, which fits at desktop widths and wraps naturally below.

### D6: Analytics grid — 2 equal columns with a sensible min
Keep `repeat(2, 1fr)` but change to `repeat(2, minmax(0, 1fr))` with `gap: 24px`, collapse to `1fr` at ≤900px (instead of the current 768px) so tablet portrait keeps one clean column. Chart order in markup is: Items Given Out, Most Requested Items, Low Stock Items, Active Courses, Inventory Changes, Upcoming Demand — row 1 pairs Items Given Out (left) with Most Requested Items (right), row 2 pairs Low Stock Items with Active Courses, row 3 pairs Inventory Changes with Upcoming Demand. This matches the requested left/right grouping (left: items-given/low-stock/inventory-changes; right: most-requested/active-courses/upcoming-demand) with **zero markup reordering**, keeping the DOM stable for `renderChartWhenVisible`.

### D7: Chart boxes — consistent padding and equalized height
`.admin-page .chart-box` → `padding: 24px`, `display: flex; flex-direction: column`. `.chart` containers get `flex: 1; min-height: 280px; width: 100%` so both cards in a row equalize in height. Headings keep `margin-bottom: 16px; padding-bottom: 12px` with the existing `2px #dbeafe` divider. Internal list/bar/timeline spacing follows the scale (rows `12px` apart, timeline markers aligned via fixed-width marker column). No chart SVG geometry is touched.

### D8: Operational Summary — KPI grid 3x2
`.kpi-grid` → `repeat(3, minmax(0, 1fr))` with `gap: 20px`, matching the section's card gap; `repeat(2, 1fr)` at ≤1024px and `1fr` at ≤640px (already present). `.kpi-card` → `align-items: center` (existing), `gap: 14px`, `padding: 18px 20px`, and `.kpi-value { overflow-wrap: anywhere }` retained so long values wrap instead of overflowing. `.summary-box` padding → `24px`, heading margin `0 0 16px` with the same `2px #dbeafe` divider as chart boxes for consistency.
- Alternative considered: keep 3-col auto rows — rejected; `repeat(3, 1fr)` with 6 items yields exactly 3x2 with equal card heights per row.

### D9: Responsive breakpoints consolidated under `.admin-page`
Centralize all breakpoints for this page in one block near the existing `.admin-page` overrides: 1280px (no change — grid stays 5/2/3), ≤1023px (3-col stats, 2-col KPIs), ≤900px (charts 1-col), ≤639px (stats 2-col, KPIs 1-col), ≤480px (stats 1-col). Media queries are CSS-only and additive.

## Risks / Trade-offs

- **Grid wrap leaves a 6th-card row of 1** (D3) → Mitigation: that is the intended "Active Cohorts occupies the next available position" behavior; it only appears at exactly desktop widths where the 5+1 layout reads as intentional. Narrower breakpoints (3/2/1-col) fill rows more evenly.
- **CSS-only wrappers in HTML could look like dead markup** → Mitigation: add a short comment-free, class-only wrapper (`<div class="analytics-section-body">` etc.) scoped in CSS; document in code review notes that it carries no behavior.
- **Long titles still overflow if label area is too narrow** → Mitigation: `min-width: 0` + `flex:1` on `.stat-label`, fixed 40px icon with `flex-shrink:0`, and `word-break` retained; verified at 5-col desktop (≈200px labels).
- **Over-constraining `.admin-page` selectors affects other admin sections** → Mitigation: all new rules are scoped under `.admin-page` and, where needed, `#analytics`-specific descendant selectors (e.g., `.admin-page #analytics .analytics-grid`) to avoid touching announcements/users/transactions sections.
- **CSS file is large with duplicated override layers** → Mitigation: append the new rules as one clearly-labeled block at the end of admin.css (`/* inventory-page-ui-cleanup */`) rather than editing in place, keeping the diff additive and easy to roll back.

## Migration Plan

1. Add the new labeled CSS block at the end of `public/css/admin.css`.
2. Add the two inert wrappers/classes in `public/admin.html` (`#analytics` body wrapper; nothing else).
3. Verify at 4 viewports (≥1280px, 1024-1279px, 768-1023px, ≤767px): no overflow, aligned grids, equal card heights, sparklines bottom-aligned, no filter overlap.
4. Rollback: remove the appended CSS block and the wrapper classes — zero behavioral risk.

## Open Questions

- None blocking. Screenshots referenced by the requester confirm the current structure matches the described state; if the shipped page differs (e.g., different breakpoints), adjust within the appended block.
