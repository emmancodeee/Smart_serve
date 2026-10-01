## Why

The Inventory Management filter toolbar renders eight controls but its grid is sized for seven, so the eighth control — Export — spills onto a third row. The result is an unbalanced, vertically wasteful filter area where the primary action (Export) is visually detached from Sort, Search, and Reset Filters, and the left/right edges of the two rows no longer line up with the Inventory List container or the table below it.

## What Changes

- Correct the root cause: the inventory-scoped filter grid in `public/css/admin.css` declares four equal tracks, but the toolbar emits eight controls (Category, Stock Status, Date Added, the date-range group, Sort, Search, Reset Filters, Export) and the search field is forced to span two tracks — five tracks of demand against a four-track row, so auto-placement pushes Export to row 3.
- Re-specify the inventory filter grid so that it resolves to exactly two rows at desktop widths:
  - **Row 1:** All Category | All Stock Status | All Date Added | All Time — four visually equal tracks.
  - **Row 2:** Sort | Search items by name, category, or unit of measure... | Reset Filters | Export — with the search field the widest control and the two buttons balanced against each other.
- Replace the fixed-track-count grid with a fractional track system that can express both an equal first row and an asymmetric second row from a single grid container, so the two rows share identical left and right boundaries and no fixed pixel widths are introduced.
- Keep all eight controls at the existing 44px control height, existing border radius, existing blue borders, existing blue Export button and existing Reset Filters styling.
- Update the narrow-viewport rules for the same track system so the toolbar still collapses cleanly and never overflows horizontally.
- Add a regression test that pins the toolbar's control order and count, so the CSS cannot silently desynchronize from the DOM again.
- Explicitly **not** in scope: no redesign, no new colors, no typography changes, no table/data changes, no sidebar or header changes, and no behavior changes to any filter. No shared (unprefixed) filter style rules and no shared filter script are modified.

## Capabilities

### New Capabilities
- `inventory-page-layout`: Visual layout, sizing, spacing, and alignment of the Inventory Management page's filter toolbar — the two-row grid structure, equal first-row tracks, the relative widths of the second-row controls, uniform control height, container containment, and narrow-viewport collapse.

### Modified Capabilities
- None. `inventory-page-layout` is not yet present in `openspec/specs/`; it is currently only a pending, unarchived delta on the `fix-inventory-management-content-split` change. This change defines it as a new capability and supersedes that pending change's two-row filter requirement, which was written against an incorrect seven-control assumption.

## Impact

- **`public/css/admin.css`** — the inventory-scoped block at lines 3782–3832 (`.admin-page .filter-toolbar[data-module="inventory"] …`) is rewritten: the `grid-template-columns` track system, the per-control column spans, and the `max-width: 768px` rules. This is the only production file modified.
- **No changes to** `public/js/admin-filters.js`, `public/js/inventory.js`, `public/inventory.html`, `public/css/inventory.css`, or any API, data source, or dependency. `INVENTORY_FILTER_CONFIG` already supplies search, sorts, fields, and export, and the existing `data-module="inventory"` hook already scopes the styles — the markup is already correct for a two-row layout.
- **Tests** — `tests/admin-filters.test.js` gains a case asserting the toolbar emits exactly the eight documented controls in the documented order, which is the invariant the CSS column spans rely on.
- **Blast radius** — one admin page. The rules stay scoped to `[data-module="inventory"]`, so no other admin module's filter toolbar is affected.
