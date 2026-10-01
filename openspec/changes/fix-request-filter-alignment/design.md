## Context

The Request Management filters are rendered into `<div id="registrationsFilterContainer">` (inside `#registrationsFilterWrap`, a `.admin-section`, `public/admin.html:417-419`) by the shared **SmartFilter** component in `public/js/admin-filters.js`. On create, SmartFilter adds class `filter-toolbar` and `data-module="registrations"` to that container (admin-filters.js:707-708) and appends a single `.filter-toolbar__row--main` row holding every control in DOM order — ten controls: Status (select), Course (SmartCombobox), Year Level (select), Student Type (select), Date field select (default "All Date"), Date preset select (DATE_RANGE_PRESETS, default "All Time"), Sort (select), Search (input), Reset Filters (button), Export (button).

Shared toolbar CSS in `public/css/admin.css`:
- `.filter-toolbar` (2888): flex column, `gap: 0.75rem`, `margin-bottom: 1rem`.
- `.filter-toolbar__row` (2895): flex row with `flex-wrap: wrap`, `gap: 0.75rem`, `align-items: center`. One row wraps into the two visual lines.
- Controls: `.filter-control__select { min-width: 180px }` (2930), `.smart-combobox__button { min-width: 200px }` (2957), `.filter-control--search { flex: 1 1 280px; max-width: 520px }` (2908).
- Admin-page overrides (3216-3230): all controls/buttons `height: 44px`; row `gap: 12px`; controls `flex-shrink: 0` (3514-3517).

Why it misaligns: ten flex items with per-control `min-width`/`flex`/`max-width` wrap onto the second line at a varying point; the Search input flex-grows toward `max-width: 520px` and shoves Reset/Export rightward, buttons keep intrinsic widths, and the flex lines never share boundaries — horizontally or vertically.

Constraints: keep filter options/behavior/labels identical; keep the white rounded container; do not affect the other SmartFilter consumers (transactions, returns, feedback, inventory, analytics), which share `.filter-toolbar` rules.

The toolbar is only scoped safely via `#registrationsFilterContainer` / `[data-module="registrations"]` — the container gains both `filter-toolbar` and `data-module` at build time, and there is exactly one registrations filter on the admin request-management page.

There are two distinct Date controls in the toolbar: the field select for the `dateRange` field (default "All Date" — the fifth DOM control, Row 1 track 5) and the DATE_RANGE_PRESETS preset select (default "All Time" — the sixth DOM control, Row 2 track 1). Both are retained; the grid places exactly five controls on each of the two rows.

## Goals / Non-Goals

**Goals:**
- Row 1 renders as five equal-width columns: Status | Course | Year Level | Student Type | Date (All Date).
- Row 2 uses the same five column tracks, one control per column: Date preset (All Time) | Sort | Search | Reset Filters | Export — so both rows share identical left/right boundaries and can never form a third row.
- All controls 44px tall, vertically centered, 12px gaps, no shrink/overlap; no control noticeably taller/shorter than its peers.
- Selecting any filter (status → Pending, a course, a year level, a student type, a date preset, a sort, or search text) must not move, resize, or reflow the toolbar.
- Scoped so no other admin module's toolbar changes.

**Non-Goals:**
- No changes to filter functionality, options, labels, placeholder, search behavior, reset, export, table, or status handling.
- No HTML or JS changes (DOM order stays the same — this is a pure CSS layout fix).
- No changes to the container's width, corners, border, background, or padding.
- No redesign of other modules' toolbars or the page shell.
- No reordering of controls (Date stays on Row 1; DOM order is unchanged).

## Decisions

### D1 — Convert only the registrations main row to a five-column CSS grid
Replace the flex behavior of *just the registrations row* with a grid:

```css
.admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  align-items: center;
}
```

- Row 1 auto-places the first five controls (Status, Course, Year Level, Student Type, Date "All Date") into five equal `minmax(0, 1fr)` tracks → even distribution, uniform widths, shared boundaries.
- Row 2's five remaining controls (Date preset "All Time", Sort, Search, Reset Filters, Export) auto-place into the same tracks — one per column — giving both rows identical left/right edges automatically. Ten controls across five tracks always yields exactly 5+5 and never a third row; Export/Reset Filters can never wrap beneath another control. (A Search spanning two tracks was measured in a headless jsdom mount of the real toolbar and forces Export onto a third row — rejected.)
- The shared `.filter-toolbar__row { flex-wrap: wrap }` rules do not apply to grid containers (`display: grid` replaces flex layout for this row), so nothing wraps mid-row.

Alternatives considered: (a) editing the shared SmartFilter renderer to emit two explicit rows → would change DOM for every module and require JS changes; rejected (violates "no JS, no other modules"). (b) forcing `flex-basis` percentages on a wrapping flex row → brittle wrap point, ragged second-row edges; rejected. (c) a three-column grid where sorts/search share — five-column grid already matches the requirement's row structure exactly.

### D2 — Fill grid cells and rely on width-stable controls
Controls fill their cells so text swaps never resize the layout:

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

- Selecting a value only changes the control's inner text; with `width: 100%` and a fixed grid track the control's box cannot grow, shrink, or move (Requirement: selecting a filter must not change the layout).
- Overrides the shared `min-width: 180px/200px` for this row only: in grid layout `flex` is ignored, and each equal track (about a fifth of the container) is narrower than the shared search `max-width: 520px`, so the search fills its single column exactly like its peers — no `max-width` reset needed.

### D3 — Course control is sized like its peers without touching its options
The "almost empty" second control is the Course SmartCombobox. It keeps its label and option mechanism exactly as-is; equal grid tracks (`minmax(0, 1fr)` + `width: 100%` + `min-width: 0`) make its button the same width and height as the status/year-level/student-type/date selects, and the native `height: 44px` parity rules already keep heights equal.

### D4 — Responsive collapse below the two-row desktop layout
Keep the five-column two-row layout at desktop width. Below `768px` (where five columns are too narrow), scope a collapse so controls stay balanced and non-overlapping:

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

The shared mobile rules at 3135-3155 keep working behind this (they set `width: 100%` on selects/comboboxes and break the date-range apart); the grid columns above guarantee there is always a clean, even fill at any width.

## Risks / Trade-offs

- [Other SmartFilter consumers unaffected] → All new rules are scoped under `.filter-toolbar[data-module="registrations"]`; the shared `.filter-toolbar*` rules and the existing `.admin-page .filter-toolbar*` overrides are untouched.
- [Shared search `max-width: 520px` clamping the search cell] → Each equal grid track is narrower than 520px at realistic widths, so the clamp never binds; the search stays one equal column with no reset required.
- [Existing admin-filters tests assert `.filter-toolbar__row--main` children / DOM structure] → This change is CSS-only; DOM, class names, and control order are identical, so tests still pass (verified in tasks with a full `npm test` run).
- [Combobox likes wider than 1/5 of a narrow desktop container] → `minminmax(0,1fr)` + `min-width: 0` allows the pill to truncate rather than push the grid; the label/swatch layout inside the combobox is unchanged and the droplist is absolutely positioned, so nothing is clipped.
- [Very long preset labels could desktop-wrap] → Dates and sort labels are short; if text wraps, it wraps inside an equal-width cell (height stays 44px) rather than resizing the column.

## Migration Plan

No migration needed — single CSS addition, fully additive (no rules replaced or removed). Rollback = remove the scoped block; everything reverts to the current flex toolbar. There are no data, API, or dependency changes.