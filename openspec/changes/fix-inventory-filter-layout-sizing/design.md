## Context

The Inventory Management filter toolbar is rendered at runtime by the shared `SmartFilter` component (`public/js/admin-filters.js`, `build()` at lines 705–795) into a single flat container, `#inventoryFilterContainer`. For the inventory module the container gets `class="filter-toolbar"` and `data-module="inventory"`, and a single `.filter-toolbar__row--main` is appended holding **eight** direct children in this order:

1. `div.filter-control` → `select` "All Category"
2. `div.filter-control` → `select` "All Stock Status"
3. `div.filter-control` → `select` "All Date Added" (vestigial — emitted by `buildFieldControl` for the `presets: true` `dateAdded` config field)
4. `div.filter-control.filter-date-range` → `select` "All Time" + a hidden `.filter-date-range__custom` sub-row nested **inside** it
5. `div.filter-control` → `select` "Sort"
6. `div.filter-control.filter-control--search` → `input[type=search]`
7. `button.filter-btn--reset`
8. `button.filter-btn--export`

The inventory-scoped grid currently in `public/css/admin.css` (lines 3782–3832) declares `grid-template-columns: repeat(4, minmax(0, 1fr))` and gives the search field `grid-column: span 2`. That is four tracks of capacity against eight children whose spans total **five** on the second row (Sort 1 + Search 2 + Reset 1 + Export 1). Sparse auto-placement therefore fills row 1 with children 1–4 and row 2 with children 5–7, and child 8 — Export — overflows onto a third row. The right edge of row 1 (the "All Time" control) and the right edge of row 2 (Reset Filters) therefore both fail to line up with the container.

Other relevant existing constraints:

- The shared `.filter-control__select` carries `min-width: 180px` (`admin.css:2931`). The inventory-scoped `min-width: 0` override at lines 3809–3816 is what keeps a 180px-floor from overflowing a narrow grid track; it is load-bearing, not cosmetic.
- The shared `.filter-control--search` carries `max-width: 520px` (`admin.css:2909`). The inventory-scoped `max-width: none` at line 3806 is likewise load-bearing — without it the field caps short of its track on wide viewports and the right edge stops aligning.
- Every control is already `height: 44px` (`admin.css:2915`, `3080`, `3229`). There is no `--input-height` design token in the repo; 44px is the established hard-coded value.
- The rules are already scoped to `[data-module="inventory"]` and the shared unprefixed rules are already untouched, so the blast radius is one page.
- A pending, unarchived change `fix-inventory-management-content-split` introduced this block and asserts a **seven**-control DOM with Sort on row 1 and no separate "All Date Added" select. That assumption does not match the real DOM.
- Test coverage is Jest 30 + jsdom (`tests/admin-filters.test.js`), which asserts DOM shape but never loads CSS. There is no visual or CSS-level test infrastructure in the repo.

## Goals / Non-Goals

**Goals:**

- Make the inventory filter toolbar occupy exactly two rows at desktop widths, with Export on the second row beside Sort, Search, and Reset Filters.
- Give the first row four genuinely equal-width tracks and the second row the requested ~24 / 40 / 18 / 18 proportions, from one grid container.
- Keep both rows flush to the same left and right edges, flush with the container and the table below.
- Guarantee uniform 44px height and a single consistent gap, with no control extending outside the Inventory List container and no horizontal overflow.
- Fix the existing rules in place rather than stacking a second competing inventory rule set.
- Pin the toolbar's control count and order with a regression test so the CSS cannot silently desynchronize from the DOM again.

**Non-Goals:**

- No redesign of the Inventory Management page, and no changes to the table, data, colors, typography, sidebar, header, or any filter's behavior.
- No changes to `public/js/admin-filters.js`, `public/js/inventory.js`, or `public/inventory.html`.
- No changes to the shared, unprefixed filter styles or to any other admin module.
- No introduction of a new design token for the 44px control height.
- No removal, renaming, or reordering of any filter — including the "All Date Added" select and the "All Time" date-range select, both of which are kept exactly as rendered today.

## Decisions

### D1 — Edit the existing inventory-scoped block in place

Rewrite `public/css/admin.css` lines 3782–3832 rather than appending a new block.

**Rationale:** The user's report explicitly asks to fix existing styles instead of adding duplicate CSS. The block is already correctly scoped and its comment is already wrong about the control count, so an in-place rewrite also removes a false claim from the stylesheet. Appending would leave two competing `grid-template-columns` declarations for the same selector and make the cascade order load-bearing.

**Alternatives considered:** *Append a later, higher-specificity block* — rejected, it creates exactly the conflicting duplicate rules we are trying to eliminate. *Move the rules to `public/css/inventory.css`* — rejected, `inventory.css` loads *before* `admin.css` in `inventory.html:10–16`, so rules there would lose the cascade to the block they are meant to replace.

### D2 — A 12-track fractional grid, not a 4-track grid

Replace `repeat(4, minmax(0, 1fr))` with `repeat(12, minmax(0, 1fr))`.

Row 1 spans `3 + 3 + 3 + 3 = 12` (four equal 25% tracks). Row 2 spans `3 + 5 + 2 + 2 = 12` → 25% / 41.7% / 16.7% / 16.7%, which is the closest integer-track realization of the requested 24 / 40 / 18 / 18.

**Rationale:** CSS Grid has exactly one column definition per grid container, so one container cannot give row 1 equal 25% columns and row 2 fractional columns at the same time. A single 4-track grid forces row 2 to also be quarters, which makes Search too narrow and leaves no room for Export at all. A 12-track grid is the smallest unit that expresses both rows exactly while keeping `minmax(0, 1fr)` so tracks can shrink below the shared `min-width: 180px` floor.

**Alternatives considered:** *Two sibling grid containers* — requires wrapping children 1–4 and 5–8 in two divs, which means editing the shared `build()` to branch on the module. Rejected: it changes the shared component and would affect every admin module's toolbar DOM. *`grid-template-areas`* — rejected: with no per-control identifying class on the four dropdowns or on Sort, each item cannot be bound to a named area without a JS change, and auto-placed items are not matched to areas by name. *Flexbox with `flex-wrap`* — rejected: to make items wrap at the row boundary, `flex-basis` must be a non-zero percentage; at 25% × 8 the row-1 total plus the gaps exceeds 100% and the fourth dropdown itself wraps, so rows cannot be controlled independently. *Nested `subgrid`* — rejected: it needs a separate wrapper element per row, i.e. the same DOM change as two containers, and buys nothing over a 12-track grid.

### D3 — Target controls by class hook, not by `:nth-child()`

```css
/* default: every control is a quarter-wide track */
.row--main > *                                { grid-column: span 3; }
/* three class-hooked controls override it */
.row--main > .filter-control--search          { grid-column: span 5; }
.row--main > .filter-btn--reset,
.row--main > .filter-btn--export              { grid-column: span 2; }
```

Sparse auto-placement then yields row 1 = children 1–4 (4 × 3 = 12) and row 2 = children 5–8 (3 + 5 + 2 + 2 = 12).

**Rationale:** Search, Reset, and Export each already carry a unique class. Only the four dropdowns and Sort are positionally identifiable, and a `span 3` default covers all five of them correctly without naming any of them. The three overrides are one class more specific than the default, so they win on specificity without needing `!important` or source order.

**Alternatives considered:** *`:nth-child()` on all eight* — rejected: it hard-codes the emission order into CSS, so any future `admin-filters.js` reordering silently reshapes the layout. With the class-hook approach, reordering a control moves it to a different track span only for Sort, and the regression test in D6 catches a count change. *Adding a distinct class per control in `admin-filters.js`* — rejected: same shared-component edit the alternatives above already rule out.

### D4 — Keep the load-bearing `min-width` and `max-width` overrides

Retain the existing inventory-scoped `min-width: 0; width: 100%` on controls, `min-width: 0; max-width: none` on the search, and the `margin-bottom: 0` on the toolbar.

**Rationale:** At a 2/12 track, Reset and Export get roughly 148px at a 1280px viewport. Without `min-width: 0` the shared `.filter-control__select { min-width: 180px }` would force the four dropdowns wider than their 3/12 tracks and blow out the row. Without `max-width: none` the search caps at 520px on wide viewports and the row-2 right edge stops aligning with row 1. These look like cleanup but are the reason the grid holds together.

### D5 — Two desktop column tiers so button labels always fit

Tier 1, viewport ≥ 1280px: row 2 spans `3 / 5 / 2 / 2`.
Tier 2, 1024px–1279px: row 2 spans `2 / 4 / 3 / 3` — Sort narrower, buttons wider.
Below 1024px: the existing `max-width: 768px` two-column collapse, extended to reset all spans.

**Rationale:** "Reset Filters" at 15px semibold plus 36px of horizontal padding needs roughly 130px. At 1024px viewport the container is about 672px wide, so tier 1 would hand Reset only about 106px and the label would wrap to a second line inside its 44px box. Widening the button tracks to 3/12 in tier 2 yields about 159px there. Tier 1 also keeps the search wide enough to show the full 51-character placeholder from roughly 1366px up, which is why the spec pins full placeholder readability at 1440px and above.

**Alternatives considered:** *Reduce `.filter-btn` horizontal padding below 1280px* — rejected: the user asked not to redesign the buttons, and a padding override is a second thing to keep in sync. *Let the buttons wrap and rely on `align-items`* — rejected, it silently produces two-line labels at a fixed height. *`min-width: max-content` on the buttons* — rejected, it fights the fractional track and reintroduces overflow.

### D6 — Regression-test the DOM shape, not the CSS

Add a case to `tests/admin-filters.test.js` that builds a toolbar with an inventory-shaped config and asserts the main row has exactly eight children whose class and label signature match the order in D2/D3.

**Rationale:** The layout is defined in terms of the emitted child sequence, and the suite already has a jsdom harness for exactly this. Pinning the shape turns a future silent desync into a test failure. The suite loads no CSS and the repo has no visual test tooling, so CSS-level assertions are not available — that gap is covered by the manual verification matrix in the tasks instead.

**Alternatives considered:** *Adding jsdom-computed-style assertions* — rejected: jsdom does not do grid layout or resolve `minmax`/`fr` track sizing, so such a test would assert nothing real while looking like coverage.

## Risks / Trade-offs

- **Conflicting pending spec for the same capability** → `fix-inventory-management-content-split` carries an unarchived `inventory-page-layout` delta whose two-row requirement asserts a seven-control DOM, places Sort on row 1, and explicitly states a separate "All Date Added" select SHALL NOT exist. If that change is archived *after* this one, the stale requirement lands on top of this one. Mitigation: resolve the older change's spec before or at the same time as archiving this one — either archive it first and then supersede, or edit its requirement text to match the real DOM. Flagged in the tasks as an explicit step rather than left implicit.
- **Layout still depends on emission order** → D3 reduces the exposure to Sort's position, but the count itself is assumed. Mitigation: the D6 regression test fails loudly on any count change, and the test is listed as a blocking task.
- **Placeholder readability is width-dependent** → the full 51-character placeholder does not fit below roughly 1366px even in tier 1. Mitigation: the spec states the guarantee at 1440px and above rather than claiming it unconditionally; the search is the widest control at every tier, so this degrades gracefully.
- **No automated CSS regression coverage** → nothing fails if a later edit breaks the two-row layout. Mitigation: explicit manual verification at 1920 / 1440 / 1280 / 1024 / 900 / 768px recorded in the tasks, plus the reason for each breakpoint documented in the CSS comment.
- **Two desktop tiers add a second set of span values to keep in sync** → a future change to the 3/5/2/2 split can be applied to tier 1 and forgotten in tier 2. Mitigation: keep both span rules adjacent under one comment block naming the layout they produce, so they read as a pair.
- **12 tracks is a slightly unusual track count** → a reader may expect it to divide evenly by the number of controls. Mitigation: the CSS comment states the per-row sums (12 for both rows) and the resulting percentages, so intent is readable without arithmetic.

## Migration Plan

Single production file, single contiguous block, no data or API change, no build step, no cache-busting concern beyond the existing `admin.css?v=` query string already on `inventory.html:14`.

Rollback is `git revert` of the `public/css/admin.css` hunk (plus the test file if the test is reverted), which restores the current three-row layout with no side effects to unwind.

## Open Questions

- Should the vestigial "All Date Added" select (child 3, whose value is never read by `INVENTORY_FILTER_CONFIG.filter`) be removed in a follow-up? It is functionally inert today, but the user explicitly required all eight controls be kept, so this change leaves it alone and the question is recorded rather than acted on.
- Is the 768px two-column collapse the right floor, or should the toolbar drop to a single column below roughly 600px? Out of scope here; noted in case a follow-up covers small-screen polish.
