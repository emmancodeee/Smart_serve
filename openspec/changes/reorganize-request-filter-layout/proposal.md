# reorganize-request-filter-layout

## Why

The Request Management (Pending Registrations) filter section in Admin renders as a single wrapping flex row, so its two visible lines come out misaligned: Row 1 controls have uneven widths (the Course/Year-Category control reads as an undersized box), Row 2 never lines up with Row 1, the Search field can grow past the dropdowns and push Reset Filters / Export off-alignment, and there is no stable sizing when filters change. This change reorganizes only the filter section into the intended clean two-row layout while leaving every other part of the page untouched.

## What Changes

- Layout-only reorganization of the Request Management filter toolbar, inside the existing white rounded container. No redesign of the page, table, sidebar, or header.
- Row 1 becomes five balanced dropdowns across the available width: Status | Year/Category | Year Level | Student Type | Date — all equal height, vertically aligned, consistent spacing, arrow-on-the-right.
- Row 2 reuses Row 1's left/right boundaries: Date-preset (All Time) | Sort | Search (the widest control) | Reset Filters | Export. Exactly two rows at desktop width — no third row, no control pushed underneath another.
- Controls keep the existing SmartServe styling (border, background, text, font, radius, button colors, arrow style) — no new colors or theme changes.
- Selecting any filter (e.g. Status = Pending) leaves every control in exactly the same position and size; changing one filter never resets another; all controls stay mounted and visible.
- Empty results keep the identical filter layout visible and show only an empty-state message in the table area.
- Reset Filters restores all controls to their defaults and re-renders the full records without moving the layout.

## Capabilities

### New Capabilities
- `request-filter-layout`: The Request Management filter section renders as two aligned balanced rows — Row 1 (Status, Year/Category, Year Level, Student Type, Date) and Row 2 (Date-preset/All Time, Sort, wide Search, Reset Filters, Export) — sharing the same boundaries, with consistent control dimensions, layout stability across filter selection, persistent visibility on empty results, and reset-to-defaults. Behavioral guarantees (Status options without "Archived", independent filter state) are also covered so no external feature regresses.

### Modified Capabilities
<!-- No existing spec-level behavior changes outside this new capability. -->

## Impact

- `public/css/admin.css` — one scoped block for the registrations toolbar (`#registrationsFilterContainer` / `.filter-toolbar[data-module="registrations"]`); purely additive.
- No changes to `public/js/admin.js`, `public/js/admin-filters.js`, `public/admin.html`, or tests. Filter options, search/reset/export behavior, the table, and all other admin modules are unaffected.
- Note: an earlier in-progress change (`fix-request-filter-alignment`) already implements this same layout; this change stands as its own record for the full two-row + state-persistence scope.