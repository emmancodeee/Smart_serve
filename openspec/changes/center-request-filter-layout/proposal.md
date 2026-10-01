## Why

On Admin > Request Management > Pending Registrations, the filter section sits unevenly in the content area: the controls read as pushed toward the left, the two rows do not share their left/right edges, and the long search placeholder has too little room. The filter section should be visually centered above the Pending Registrations table with balanced spacing and control widths, without touching the sidebar or changing the rest of the page.

## What Changes

- Reposition the registrations filter toolbar so it is horizontally centered in the content area, aligned with the Pending Registrations section's left/right boundaries, with equal visual spacing on both sides (it no longer reads as pushed left).
- Lay the controls out in the two supported rows so both rows share the same left and right edges:
  - Row 1: All Status | Year/Category Filter | All Year Level | All Student Type | All Date (five equal-width controls).
  - Row 2: All Time | Sort | Search (wider than the dropdowns) | Reset Filters | Export.
- Make the Search control wide enough for its placeholder ("Search registrations by name, email, course, module, books, or...") without unnecessary truncation.
- Keep consistent horizontal gaps, equal vertical spacing between the two rows, equal control heights, and consistent radius/border styling.
- Keep the toolbar responsive: the two-row layout is preserved on the current desktop width; below an 768px breakpoint controls wrap naturally with centered alignment and no horizontal overflow.
- No changes to filter options, filtering behavior, the table, the Pending Registrations title, sidebar, header, colors, typography, or status badges.

## Capabilities

### New Capabilities

- `request-filter-layout`: The Request Management registrations filter toolbar's position, two-row alignment, control widths, spacing, and responsive behavior (this delta extends the capability scope previously drafted in the `fix-request-filter-alignment` / `reorganize-request-filter-layout` changes, which never reached the main specs).

### Modified Capabilities

- None.

## Impact

- `public/css/admin.css` — the registrations-scoped filter toolbar style rules under `.filter-toolbar[data-module="registrations"]` (grid columns, control widths, row/column spacing, centered alignment) are updated; only the registrations filter is affected.
- No HTML or JS changes (the toolbar DOM order — ten controls — is unchanged).
- No API, data, or dependency changes.
- Other admin filter consumers (transactions, returns, feedback, inventory, analytics) are untouched because every rule stays scoped to `[data-module="registrations"]`.
- Overlap: this change intentionally overlaps the sibling in-progress changes `fix-request-filter-alignment` and `reorganize-request-filter-layout`, which share the same CSS block; if all three are archived, reconcile the shared `request-filter-layout` capability wording so the final main spec is coherent.