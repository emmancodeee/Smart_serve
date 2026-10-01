## 1. Rewrite the inventory-scoped grid track system

- [x] 1.1 In `public/css/admin.css`, replace `grid-template-columns: repeat(4, minmax(0, 1fr))` on `.admin-page .filter-toolbar[data-module="inventory"] .filter-toolbar__row--main` with `repeat(12, minmax(0, 1fr))` (design D2)
- [x] 1.2 Add a default `grid-column: span 3` for every direct child of that row (`.filter-toolbar__row--main > *`), covering the four row-1 dropdowns and the Sort control
- [x] 1.3 Change the existing `.filter-control--search` rule from `grid-column: span 2` to `grid-column: span 5`, keeping its `min-width: 0` and `max-width: none` (design D4)
- [x] 1.4 Add a rule giving `.filter-btn--reset` and `.filter-btn--export` `grid-column: span 2`; keep the existing `min-width: 0; width: 100%` override block for `.filter-control`, `.filter-btn`, `.smart-combobox__button`, `.filter-control__select`, and `.filter-control__input` intact (design D3, D4)
- [x] 1.5 Keep `margin-bottom: 0` on the inventory-scoped `.filter-toolbar` so the `.inventory-toolbar` wrapper remains the single source of the filters-to-table gap
- [x] 1.6 Rewrite the block's header comment: state that the toolbar emits eight controls, that row 1 sums to `3+3+3+3` and row 2 to `3+5+2+2` for a total of 12 tracks, give the resulting percentages (~25% each / 25% / ~42% / ~17% / ~17%), and remove the stale "Seven controls" and "Row 1 = ... | Sort" claims

## 2. Responsive tiers

- [x] 2.1 Add a `@media (min-width: 1024px) and (max-width: 1279px)` tier that overrides row-2 spans to Sort `span 2`, search `span 4`, Reset `span 3`, Export `span 3` (12 tracks total), leaving row 1 at `span 3` (design D5)
- [x] 2.2 Extend the existing `@media (max-width: 768px)` block to reset every span override (`span 3` default, search `grid-column: 1 / -1`, Reset and Export back to `span 1`) so no `span 5` or `span 2` survives into the two-column grid
- [x] 2.3 Confirm the desktop two-row rules apply from 1280px upward and that no fixed pixel widths were introduced anywhere in the block

## 3. Regression test for the DOM shape

- [x] 3.1 In `tests/admin-filters.test.js`, add a case that builds a toolbar with an inventory-shaped config and asserts `.filter-toolbar__row--main` has exactly eight direct children
- [x] 3.2 Assert the child signature in order: Category select, Stock Status select, Date Added select, `.filter-date-range` group, Sort select, `.filter-control--search`, `.filter-btn--reset`, `.filter-btn--export` (design D6)
- [x] 3.3 Assert the hidden `.filter-date-range__custom` sub-row is nested inside the `.filter-date-range` group and is not a direct child of the row
- [x] 3.4 Assert the search input retains the placeholder "Search items by name, category, or unit of measure..." and that Reset/Export keep their labels
- [x] 3.5 Run `npx jest tests/admin-filters.test.js` and confirm the whole file passes, including the pre-existing DOM-shape assertions at lines 137–160

> **Note on 3.5 — pre-existing failures, not caused by this change.** All five new
> tests pass (`-t "inventory grid contract"` → 5 passed), and the pre-existing
> DOM-shape assertions at lines 137–160 pass. The file as a whole does not go
> green: five unrelated tests in the `SmartFilter engine` block fail — "date
> presets", "sort options order rows", "Reset Filters clears…", and both export
> tests. Verified pre-existing by stashing this change and re-running at HEAD,
> which gives the identical 5 failures (12 passed at HEAD, 17 passed with the 5
> new tests). Causes look to be date-boundary assertions and `Blob.text` being
> absent in this jsdom version. Out of scope here; they warrant their own change.

## 4. Verification

- [ ] 4.1 Open Inventory Management at a 1920px viewport and confirm exactly two rows: All Category / All Stock Status / All Date Added / All Time, then Sort / Search / Reset Filters / Export, with no third row
- [ ] 4.2 Measure the four row-1 dropdowns and confirm equal widths; confirm both rows share identical left and right edges and align with the table below
- [ ] 4.3 Measure row 2 and confirm the search is the widest control, at least 1.5× the Reset Filters button, and that Reset and Export are equal width
- [ ] 4.4 Confirm all eight controls render at 44px and no label wraps to a second line
- [ ] 4.5 Repeat the row-1/row-2 check at 1440px and 1280px, then at 1024px and 900px for the tier-2 spans; confirm no control exceeds its track and no horizontal scrollbar appears
- [ ] 4.6 Check at 768px and below that the toolbar collapses cleanly with the search spanning the full row and no overlap or horizontal overflow
- [ ] 4.7 Exercise Category, Stock Status, Date Added, All Time, Sort, search, Reset Filters, and Export; confirm filtered rows, sort order, and the downloaded CSV are unchanged
- [ ] 4.8 Confirm the Inventory List title bar, overview cards, table, sidebar, and header are visually unchanged, and that no new color, radius, or typography value was introduced
- [ ] 4.9 Load one non-inventory admin page (for example Request Management or Feedback Management) and confirm its filter toolbar is unchanged

## 5. Spec reconciliation before archiving

- [x] 5.1 Review `openspec/changes/fix-inventory-management-content-split/specs/inventory-page-layout/spec.md`, whose "Inventory filter toolbar uses a balanced two-row layout" requirement asserts a seven-control DOM, places Sort on row 1, and states a separate "All Date Added" select SHALL NOT exist — all contradicted by the real DOM and by this change
- [x] 5.2 Decide the resolution before archiving: archive `fix-inventory-management-content-split` first so this change's delta lands on top, or edit that requirement's text in place to match the eight-control reality. Do not leave both requirements asserting contradictory layouts for the same capability
- [x] 5.3 Run `openspec validate fix-inventory-filter-layout-sizing` and confirm it passes

> **Note on 5.1 — findings.** The old requirement is *internally* coherent but
> describes a DOM that does not exist. For seven controls its arithmetic works:
> row 1 = Category + Stock Status + Date Added + Sort (4 tracks), row 2 = Search
> spanning 2 + Reset + Export (4 tracks). The real toolbar emits **eight**
> controls, because `dateField = fields.find(f => f.presets)` (`admin-filters.js:478`)
> stays in `mainFields` and is therefore rendered twice — once by
> `buildFieldControl` as an "All Date Added" select, and again by
> `buildDateRange()` as the "All Time" preset group. The extra control is what
> pushed Export to a third row.
>
> Four concrete contradictions with reality and with this change:
> 1. Line 87 / scenario at 89-92 place **Sort on row 1**; the real and required
>    layout puts Sort on row 2.
> 2. Line 87 requires the first row to be "the Category, Stock Status, Date
>    Added, and Sort controls" — the real row 1 is All Category, All Stock
>    Status, All Date Added, All Time.
> 3. Line 87 states "a separate time-of-day filter SHALL NOT be introduced" and
>    that Date Added "SHALL remain the single date-range preset select". Both
>    selects are in fact rendered, and the user explicitly requires all eight
>    controls be kept.
>  4. Scenarios at 94-97 and 104-107 (search spanning two tracks, right edge
>    aligning with the Sort control) describe the seven-control geometry and no
>    longer hold.
>
> **Resolution (5.2):** chose to edit the old requirement in place rather than
> archive. `fix-inventory-management-content-split`'s "Inventory filter toolbar
> uses a balanced two-row layout" requirement was rewritten to name the real
> eight controls, to state that Export shares the second row, to record that the
> Date Added field legitimately renders both an "All Date Added" select and the
> "All Time" preset select, and to point at this change for the track arithmetic.
> Scenario "Search spans two tracks on the second row" became "Four controls
> share the second row". Both changes now validate, and either can be archived
> first without reintroducing the stale geometry.
