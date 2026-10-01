## 1. Page container & section shell

- [x] 1.1 Add inert `analytics-section-body` wrapper div inside `#analytics` (after the h2/filters, wrapping the grids + summary) in `public/admin.html` — carries no styles of its own
- [x] 1.2 Append labeled CSS block `/* inventory-page-ui-cleanup */` at the end of `public/css/admin.css` with all new rules scoped under `.admin-page`
- [x] 1.3 Normalize `.admin-page .admin-main` page padding to 32px desktop / 20px tablet / 16px mobile (consistent left/right margins, centered 1280px max width)

## 2. Inventory Overview header

- [x] 2.1 Keep navy `#152c69` header band; set consistent horizontal padding (24px) and vertical padding (20px) for `#analytics`'s `h2` so title alignment matches content below
- [x] 2.2 Ensure header band keeps `28px 28px 0 0` border radius and content below shares the header's left padding edge

## 3. Filter toolbar

- [x] 3.1 Style `.admin-page .filter-toolbar` main row as a single wrapping flex row with 12px gaps and reduced bottom margin (20px) — no vertical stacking on desktop
- [x] 3.2 Standardize filter control height (44px), border radius (`--radius-lg`), horizontal padding (16px), and equal gaps for select/date-range/combobox/reset/export controls
- [x] 3.3 Confirm date-range custom row still toggles via `.is-visible` without JS changes; verify no excessive gap when filters wrap on narrower widths

## 4. Summary stat cards

- [x] 4.1 Change `.admin-page .analytics-grid` to `grid-template-columns: repeat(5, minmax(0, 1fr))` with 20px gaps so the 6th card (Active Cohorts) flows to the next row
- [x] 4.2 Add responsive tiers for `.analytics-grid`: 3 columns ≤1023px, 2 columns ≤639px, 1 column ≤480px
- [x] 4.3 Convert `.admin-page .stat-card` to a flex column with 24px padding; keep `stat-header` as label (flex:1, min-width:0, wraps) + 40px fixed icon (`flex-shrink:0`) top-right with no overlap
- [x] 4.4 Apply consistent stat-card rhythm: 12px label→value, 8px value→description, 16px description→sparkline
- [x] 4.5 Anchor `.stat-sparkline` to the card bottom (`margin-top: auto`) so sparklines align across cards in a row

## 5. Analytics chart grid

- [x] 5.1 Change `.admin-page .charts-container` to `grid-template-columns: repeat(2, minmax(0, 1fr))` with 24px gaps (existing DOM order already yields the required left/right pairing)
- [x] 5.2 Collapse charts to `1fr` single column at ≤900px
- [x] 5.3 Set `.admin-page .chart-box` to flex column with 24px padding; `.chart` gets `flex: 1; width: 100%; min-height: 280px` for equal-height paired cards
- [x] 5.4 Keep chart heading divider spacing at 16px margin / 12px padding-bottom with the existing `2px #dbeafe` divider; ensure chart content never touches card borders

## 6. Chart internals (no data/logic changes)

- [x] 6.1 Verify Items Given Out / Upcoming Demand line charts have readable axis labels with breathing room and no label clipping against card edges
- [x] 6.2 Align Most Requested Items and Low Stock Items progress-bar rows: consistent row spacing (12px), aligned bars, aligned numeric values, item names wrapping without breaking alignment
- [x] 6.3 Center Active Courses donut chart, space chart vs. legend consistently, and allow long course names to wrap without overflow
- [x] 6.4 Balance Inventory Changes timeline: aligned markers, fixed vertical line position, consistent row spacing, aligned date/time text
- [x] 6.5 Ensure chart tooltips do not cause layout shifts (no container size changes on hover)

## 7. Operational Summary

- [x] 7.1 Set `.admin-page .summary-box` to 24px padding, heading margin 0 0 16px, and the same `2px #dbeafe` divider as chart boxes
- [x] 7.2 Change `.kpi-grid` to `repeat(3, minmax(0, 1fr))` with 20px gaps for a balanced 3x2 grid (2 columns ≤1024px, 1 column ≤640px)
- [x] 7.3 Standardize `.kpi-card` internal padding (18px 20px), icon/label/value alignment, and keep `overflow-wrap: anywhere` so long values wrap instead of overflowing

## 8. Spacing consistency & cleanup

- [x] 8.1 Audit the whole inventory view for random spacing values (13/17/27/31px etc.) and replace with the 4/8/12/16/20/24/32px scale or existing tokens
- [x] 8.2 Remove excessive empty space: between filter rows, between stat cards, inside chart cards, around Operational Summary, and between section heading and content — without removing intentional whitespace
- [x] 8.3 Confirm no horizontal overflow, text overlap, card collisions, clipped graphs, filter overflow, or broken long-title wrapping at 1280px, 1024px, 768px, and 390px widths

## 9. Guardrail verification

- [x] 9.1 Verify `public/js/admin.js`, `public/js/admin-filters.js`, sidebar markup, header markup, and all colors are untouched (git diff shows only admin.html + admin.css)
- [x] 9.2 Verify all filters, charts, tables, and KPI data render identically to before (same options, same data, same chart types)
- [x] 9.3 Verify the Inventory Management page top-to-bottom shows no overlapping elements, inconsistent gaps, excessive whitespace, or misaligned cards
