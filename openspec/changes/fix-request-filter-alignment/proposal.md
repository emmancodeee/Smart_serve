# fix-request-filter-alignment

## Why

In Admin → Request Management → Pending Registrations, the filter toolbar renders through the shared `SmartFilter` component as a single wrapping flex row, so its two visible rows end up misaligned: Row 1 controls have uneven widths/heights (the Course control reads as an almost-empty, oddly-sized box), Row 2 never lines up with Row 1, and the Search field can grow wide enough to push the Reset Filters / Export buttons out of alignment. Selecting a filter can also make individual controls change width, nudging the layout.

## What Changes

- CSS-only fix, scoped to the Request Management filter container only (`#registrationsFilterContainer`, which carries `data-module="registrations"`). No shared `SmartFilter` styles are touched.
- Row 1 becomes an equal-width five-column grid: `[ Status ] [ Course ] [ Year Level ] [ Student Type ] [ Date ]`, each control filling its column evenly across the available container width.
- Row 2 reuses the same five column tracks so it shares Row 1's exact left/right boundaries: `[ Sort ] [ Search (spans 2 columns) ] [ Reset Filters ] [ Export ]`.
- Every control is 44px tall, vertically centered, with consistent spacing (12px gap) and no shrinking/overlap.
- Controls fill their grid cells (`width: 100%`), so changing a selection only swaps the button/select text — it can never resize, jump, collapse, or move the layout.
- The white rounded container, border, background, padding, and width are unchanged. Labels, options, functionality, colors, table, sidebar, and header are untouched. All other admin modules keep their current flex-wrap toolbar.
- The single Date control is a preset `select` whose default label is "All Time" — there is no separate Time control. It renders as the fifth Row 1 column, so the toolbar is exactly two rows at desktop width (Row 2 = Sort | wide Search | Reset Filters | Export) and never creates a third row or wraps a button below the search.
- Behavioral guarantees in scope (Status options limited to All Status/Pending/Approved/Rejected with no "Archived"; independent filter state; empty-results persistence; Reset-to-defaults) are owned by the sibling change `fix-request-filter-behavior`. This change is layout-only and relies on those behaviors without re-implementing or altering them.

## Capabilities

### New Capabilities
- `request-filter-layout`: The Request Management filter toolbar is laid out as two balanced, aligned rows — five equal-width controls in Row 1 (Status, Course, Year Level, Student Type, Date) and Row 2 (Sort, Search, Reset Filters, Export) sharing the same boundaries — with stable dimensions that never shift when a filter is selected.

### Modified Capabilities
<!-- No existing spec-level behavior changes; delta spec `request-filter-layout` is new. -->

## Impact

- `public/css/admin.css` — a new scoped block (targeting `.filter-toolbar[data-module="registrations"]` inside `#registrationsFilterContainer`), placed alongside the existing admin-page filter overrides. No existing rules are removed.
- No changes to `public/js/admin.js`, `public/js/admin-filters.js`, `public/admin.html`, or any test. Filter behavior, options, and exports are identical.
- Only the registrations filter toolbar changes; transactions/returns/feedback/inventory/analytics toolbars are unaffected.