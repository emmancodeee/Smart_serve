## Context

Request Management is `public/admin.html` served at `/admin/registrations` (server.js:293 → `sendFile(public/admin.html)`). Its registrations filters render into `<div id="registrationsFilterContainer">` (inside `#registrationsFilterWrap.admin-section`, admin.html:417-419) via the shared **SmartFilter** component (`public/js/admin-filters.js`). On build, SmartFilter adds class `filter-toolbar` and `data-module="registrations"` to that container (admin-filters.js:707-708) and appends one `.filter-toolbar__row--main` row holding all ten controls in DOM order: Status (select), Course (SmartCombobox = the "Year/Category" control), Year Level (select), Student Type (select), Date field select (default "All Date"), Date preset select (DATE_RANGE_PRESETS, default "All Time"), Sort (select), Search (input), Reset Filters (button), Export (button). There are two distinct Date controls; both are retained.

The toolbar CSS lives in `public/css/admin.css`:
- `.filter-toolbar` (2888): flex column, `gap: 0.75rem`.
- `.filter-toolbar__row` (2895): flex row, `flex-wrap: wrap`, `align-items: center`, `gap: 0.75rem` — the single row wraps into ragged visual lines.
- Controls: `.filter-control__select { min-width: 180px }` (2930), `.smart-combobox__button { min-width: 200px }` (2957), `.filter-control--search { flex: 1 1 280px; max-width: 520px }` (2908).
- Admin-page overrides (3216-3230, 3505-3521): all controls/buttons `height: 44px`, row `gap: 12px`, controls `flex-shrink: 0`.

Why it currently misaligns: ten flex items with independent `min-width`/`flex`/`max-width` wrap at a device-dependent point; the Search input flex-grows toward `max-width: 520px` and shoves Reset/Export; buttons keep intrinsic widths; flex lines never share boundaries.

Constraint: `#registrationsFilterContainer` is the only registrations toolbar (SmartFilter is shared by other admin modules: transactions, returns, feedback, inventory, analytics — all scoped away by `data-module`).

## Goals / Non-Goals

**Goals:**
- Row 1 = five equal columns: Status | Course/Year-Category | Year Level | Student Type | Date (All Date); Row 2 = Date preset (All Time) | Sort | Search | Reset Filters | Export, each control one equal column reusing Row 1's track edges.
- Exactly two rows at desktop width; no third row; Export/Reset can never wrap under another control.
- Uniform control height (44px), same vertical center, consistent 12px spacing, controls fully inside the container.
- Layout is dimension-stable: selecting a filter only changes displayed text, never any control's box.
- Pure CSS scoped to the registrations toolbar; existing visuals and behavior unchanged elsewhere.

**Non-Goals:**
- No changes to filter options, labels (aside from existing behavior), search/reset/export functionality, the registration table, sidebar, header, page title, or status handling.
- No HTML or JS changes (DOM order identical); no new colors or theme changes.
- No redesign of other modules' toolbars or the container's look (width, corners, border, background, padding stay).

## Decisions

### D1 — Five-column CSS grid for the registrations main row
```css
.admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  align-items: center;
}
```
Grid auto-placement puts the five field controls (Status, Course, Year Level, Student Type, Date "All Date") on Row 1 and the remaining five (Date preset "All Time", Sort, Search, Reset Filters, Export) on Row 2, both using the same five tracks → identical left/right boundaries. Ten items over five tracks always yields exactly 5+5 — never a third row, and no wrap point to guess. Alternatives rejected: editing the shared SmartFilter renderer (JS change affecting every module); percentage `flex-basis` wrapping (brittle wrap point, ragged edges); Search spanning two tracks (forces Row 2 to six tracks → Export wraps to a third row — measured in a headless jsdom mount of the real toolbar).

### D2 — Controls fill their cells so value changes never move the layout
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
Selecting "Pending", a course, a year level, sorting, or typing search only swaps inner text; fixed `width: 100%` + fixed track keep every box identical before/after (satisfies "selecting a status must not change the layout" and "changing one filter must not reset/move another"). Overrides shared `min-width: 180px/200px` scoped to this container only; each equal track is narrower than the shared search `max-width: 520px`, so the search stays a single column like its peers.

### D3 — Every control is one equal column (no span)
```css
/* No grid-column span: all ten controls are single-column grid items. */
```
A headless mount of the real toolbar (jsdom) shows exactly ten controls; with five equal tracks and no spans, Row 1 and Row 2 each get exactly five — the Date preset "All Time" lands as Row 2's first item and Search matches the width of every other control. Forcing Search to span two tracks would push Export onto a third row, which the spec forbids.

### D4 — Responsive reflow without overlap
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
At ≤768px the grid collapses to even two-column tracks with the search full-width, so no control overlaps or becomes disproportionately tall/short; desktop width returns to the two-row layout.

### D5 — Persistence and reset are existing SmartFilter behavior, not new code
Status options (All Status/Pending/Approved/Rejected, no "Archived"), independent per-control state, empty-results persistence, and Reset-to-defaults are already implemented in `SmartFilter` (admin-filters.js) and in the registrations section rendering (admin.js `renderRegistrationsWithFilter`). This change only guarantees the layout never changes when those behaviors run — it does not re-implement them, and the spec documents them so they cannot regress.

## Risks / Trade-offs

- [Other SmartFilter consumers (transactions/returns/feedback/inventory/analytics) could be affected] → All rules are scoped under `.filter-toolbar[data-module="registrations"]`; shared rules are untouched.
- [Search `max-width: 520px` from the shared rule] → Each equal grid track (about a fifth of the container) is narrower than 520px at any realistic width, so the clamp never binds; no reset needed.
- [Cached `/css/admin.css` makes the change invisible] → Static asset cache (browser heuristic); hard refresh / restart dev server needed; no cache middleware in server.js (express.static, no maxAge).
- [Layout tests only assert DOM, not CSS] → DOM/class/order unchanged; `npm test` must match baseline; visual verification covered by manual browser checks.
- [Very long preset/sort labels could clip] → Cells are `minmax(0,1fr)` with `min-width: 0`; labels truncate rather than resize the column.
- [Duplicate-scope overlap with `fix-request-filter-alignment`] → This change is intentionally a standalone record of the full two-row + persistence scope; if both are archived, reconcile the shared `request-filter-layout` capability requirements in the same wording.

## Migration Plan

No migration — one additive CSS block; rollback removes the block and the toolbar returns to its current flex layout. No data/API/dependency changes.