## Context

Request Management is `public/admin.html`, served at `/admin/registrations` (server.js:289). Its registrations filters render into `<div id="registrationsFilterContainer">` inside `#registrationsFilterWrap.admin-section` (admin.html:417-419) via the shared **SmartFilter** component (`public/js/admin-filters.js`). On build, SmartFilter adds class `filter-toolbar` and `data-module="registrations"` to that container (admin-filters.js:707-708) and appends one `.filter-toolbar__row--main` row holding all **ten** controls in DOM order: Status, Course (Year/Category), Year Level, Student Type, Date field select ("All Date"), Date preset select ("All Time"), Sort, Search, Reset Filters, Export (verified by a headless jsdom mount of the real toolbar).

Current state (from the in-progress `fix-request-filter-alignment` / `reorganize-request-filter-layout` work): `#registrationsFilterWrap.admin-section` already spans the full content area width (block-level `.admin-section`, padding `1.45rem`, border, radius, shadow at admin.css:500), so the box itself reaches both the left and right boundaries of the Pending Registrations content below it. The toolbar rows are a `repeat(5, minmax(0, 1fr))` grid (admin.css:3531) with every control one equal column and `margin-bottom: 0` for the registrations toolbar (admin.css:3547), so it is vertically centered in its box. The dependency `?v=` cache-buster on the stylesheet link in admin.html guarantees fresh CSS.

Problem this change addresses: the current equal-width 5+5 grid makes the Search control (with its long placeholder "Search registrations by name, email, course, module, books, or...") the same narrow width as every dropdown, and the rows have no explicit shared-edge structure beyond auto-placement. The user wants the whole filter section to read as horizontally centered with the Search control clearly wider than the dropdowns, both rows sharing their left/right edges, consistent spacing, and no Export orphaned on its own line.

Constraints: CSS-only, scoped to `.filter-toolbar[data-module="registrations"]`; no HTML/JS/DOM-order changes; no changes to options, labels, filtering, the table, title, sidebar, header, or box visuals; responsive (≤768px) wrap without overflow.

## Goals / Non-Goals

**Goals:**
- Filter render reads as horizontally centered in the content area, aligned with the Pending Registrations section's left/right boundaries, with equal-appearing margins on both sides.
- Exactly two rows sharing the same left/right edges:
  - Row 1 = All Status | Year/Category Filter | All Year Level | All Student Type | All Date (five equal-width controls).
  - Row 2 = All Time | Sort | Search (wider) | Reset Filters | Export.
- Search wide enough to display the full placeholder without unnecessary truncation.
- Consistent 12px gaps, equal vertical spacing between the rows, equal 44px control heights, consistent radius/border/padding (existing).
- Responsive: two rows at desktop; natural centered wrap below 768px, no horizontal overflow.
- Scoped so no other admin module's toolbar changes.

**Non-Goals:**
- No changes to filter functionality, options, labels, placeholder text, statuses (All Status/Pending/Approved/Rejected — no "Archived"), the registration table, the Pending Registrations title, sidebar, header, colors, typography, or status badges.
- No HTML or JS changes; no reordering of the ten controls.
- No changes to any other Request Management section or other modules' toolbars.

## Decisions

### D1 — Keep the container full-content-width; center lives in the grid, not margins
`#registrationsFilterWrap` already spans the main content area (`display: block`, no max-width), so it is inherently aligned with the Pending Registrations section's edges. The "pushed left" appearance comes from the controls inside wrapping into ragged flex lines. No margin/width changes are made to the box (its padding, border, radius stay); centering is achieved by giving the rows an even grid that fills the full width, with equal gap track spacing. This satisfies "centered horizontally, not pushed left, not touching the sidebar, not excessively wide".

### D2 — Six-track grid: Row 1 = five equal controls, Row 2 = wide Search, shared outer edges
```css
.admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  align-items: center;
}
```
Auto-placement (`grid-auto-flow: row`, the default) lays the ten controls in DOM order:
- Row 1, tracks 1–5: Status, Course, Year Level, Student Type, Date "All Date" — five equal controls, each one track. Track 6 of Row 1 stays empty (the accepted small gap; user-chosen tradeoff against making a Row 1 control wider).
- Row 2: All Time (track 1), Sort (track 2), Search (`grid-column: span 2`, tracks 3–4), Reset Filters (track 5), Export (track 6) → exactly fills all six tracks, so Export can never wrap onto its own line and Row 2 shares Row 1's outer edges.

Search therefore gets 2/6 ≈ 33% of the row width (more than any dropdown), which fits the long placeholder. Auto-placement was chosen over explicit `grid-column` per control because the DOM order already matches the desired layout; the only explicit rule is `.filter-control--search { grid-column: span 2 }`.

Alternatives considered:
- *(a) Repeat 5 equal columns (current)* — search same width as dropdowns; fails the "wider Search / placeholder readable" goal. Rejected (previous header comment says "Every control is one column").
- *(b) Date also spans 2 tracks on Row 1 (6/6 filled)* — no Row 1 gap, but makes the Date control double-width against the "All Date: medium width" requirement. The user explicitly chose option (a) above.
- *(c) Flex-wrap with `flex-basis` percentages* — brittle; two flex lines with different internal item counts cannot both resolve to the exact same outer edge width. Rejected.

### D3 — Controls fill their cells so selections never move the layout
```css
.admin-page .filter-toolbar[data-module="registrations"] .filter-control,
.admin-page .filter-toolbar[data-module="registrations"] .filter-btn,
.admin-page .filter-toolbar[data-module="registrations"] .smart-combobox__button,
.admin-page .filter-toolbar[data-module="registrations"] .filter-control__select,
.admin-page .filter-toolbar[data-module="registrations"] .filter-control__input {
  min-width: 0;
  width: 100%;
}
```
Selecting a value only swaps displayed text; with `width: 100%` inside fixed tracks the box cannot grow, shrink, move, or collapse. This also overrides the shared `min-width: 180px/200px` from `.filter-control__select` / `.smart-combobox__button` for this row only.

### D4 — Spacing, height, and styling consistency
Grid `gap: 12px` gives equal horizontal gaps; the single row (two visual lines) has no separate inter-row margin, so vertical spacing between Row 1 and Row 2 is implicitly `align-items: center` + 44px controls, consistent with the existing admin-page `height: 44px` overrides (admin.css:3216-3230). Border, radius, padding, fonts come from untouched shared rules. The registrations toolbar keeps `margin-bottom: 0` (from the previous centering fix) so the toolbar block stays vertically centered in its box.

### D5 — Responsive two-row layout preserved at desktop, natural wrap below 768px
```css
@media (max-width: 768px) {
  .admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main .filter-control--search {
    grid-column: 1 / -1;
    max-width: none;
  }
}
```
Below 768px controls flow into even two-column rows (grid auto-placement centers them and there is no horizontal overflow); the Search goes full width. At and above 768px the shared-edge six-track two-row layout from D2 applies unchanged.

## Risks / Trade-offs

- [Row 1's 6th track is empty] → Accepted per explicit user selection; it reads as balanced spacing next to the wide Search on Row 2, and both rows still share the same outer edges. If it ever looks off, D2 can switch to the "Date wide" alternative.
- [Stale `/css/admin.css` in the browser] → Maintain the `?v=<sha256-prefix>` cache-buster on the stylesheet `link` in admin.html and bump it whenever admin.css changes.
- [Auto-placement depends on ten-control DOM order] → Order is produced by SmartFilter build and already proven by the headless jsdom mount; if a future config change adds a control, Row 2 would reflow — guard against that in the manual check.
- [Other SmartFilter consumers unaffected] → All rules remain scoped under `.filter-toolbar[data-module="registrations"]`; shared `.filter-toolbar*` and `.admin-page .filter-toolbar*` rules untouched.
- [Overlapping sibling changes] → `fix-request-filter-alignment` and `reorganize-request-filter-layout` share this CSS block; reconcile the `request-filter-layout` capability wording at archive time so the final main spec is coherent.

## Migration Plan

No migration — single additive CSS change in `public/css/admin.css` plus one `?v=` bump in `public/admin.html`. Rollback removes the scoped block (and the cache-buster query), returning the toolbar to its current grid layout. No data, API, or dependency changes.

## Open Questions

None — the search-width tradeoff was resolved with the user (Search wider; Row 1 stays five equal controls).