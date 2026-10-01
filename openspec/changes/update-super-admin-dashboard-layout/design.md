## Context

The Super Admin dashboard renders its "Inventory Overview" summary cards in `public/admin.html` inside a `.analytics-grid` container (`admin.html:99`). Six `.stat-card` blocks currently sit in that grid; the last two are "Inventory Adjustments" (`admin.html:136-144`) and "Active Cohorts" (`admin.html:145-153`).

The grid's effective columns come from the last `.admin-page .analytics-grid` rule in `public/css/admin.css` (`admin.css:3176-3198`): `repeat(5, minmax(0, 1fr))` on desktop, `repeat(3, ...)` at ≤1023px, `repeat(2, ...)` at ≤639px, and `1fr` at ≤480px. Earlier `.admin-page .analytics-grid` declarations (`admin.css:2114`, `admin.css:2200`) are superseded at equal specificity, so only the final block decides layout. Other pages using `admin-page` are unaffected: `inventory.html` sets its own inline grid (`repeat(4, 1fr)`), and the admin-feedback/admin-returns pages do not use `.analytics-grid`.

`public/js/admin.js` writes the card values (e.g. `inventoryAdjustments`, `cohortsServed`) through `setText` and `renderSparkline`, both of which guard against missing DOM elements, so removing the cards requires no JS changes.

## Goals / Non-Goals

**Goals:**
- Remove the Inventory Adjustments and Active Cohorts cards completely, with no empty placeholders or dead space.
- Reflow the four remaining cards evenly across the dashboard width using the existing grid container.
- Keep the four remaining cards, their values, sparklines, hints, colors, and designs exactly as they are.
- Leave the sidebar, header, charts, and any other cards untouched.

**Non-Goals:**
- No changes to `public/js/admin.js` or the analytics data pipeline (removed cards' DOM updates already no-op safely).
- No changes to `inventory.html` or any other page that reuses `.analytics-grid`.
- No restyling of card design, colors, or the four retained cards.

## Decisions

**D1: Delete just the two `.stat-card` blocks, no JS changes.**
Remove the Inventory Adjustments (`admin.html:136-144`) and Active Cohorts (`admin.html:145-153`) blocks from `.analytics-grid`. The JS that would update them (`admin.js:4161-4170`, `4220-4224`) calls `setText`/`renderSparkline`, which already `return` when the element is missing, so the dashboard renders normally without edits to `admin.js`.

**D2: Rebalance the grid through the effective `.admin-page .analytics-grid` rule.**
Change the final grid block in `admin.css` (`.admin-page .analytics-grid`, `admin.css:3176-3198`) from the six-card layout to a four-card one:
- Desktop: `repeat(5, minmax(0, 1fr))` → `repeat(4, minmax(0, 1fr))` — four equal columns fill one clean row with no empty fifth column.
- ≤1023px: `repeat(3, minmax(0, 1fr))` → `repeat(2, minmax(0, 1fr))` — a balanced 2×2 grid.
- ≤639px: keep `repeat(2, minmax(0, 1fr))` — remains a balanced 2×2.
- ≤480px: keep `1fr` — four stacked single-column cards.

Rationale: equal `1fr` columns guarantee the four cards stretch evenly across the full container width with no manual spacing and no leftover gaps. Alternative considered: deleting the fixed override to fall back to the base `.analytics-grid` `repeat(auto-fit, minmax(200px, 1fr))`; rejected because the explicit four-column override matches the existing structure at every breakpoint and keeps the same gaps/padding behavior.

**D3: Change only the effective rule, not the superseded duplicates.**
The `admin.css:2114` and `admin.css:2200` `.admin-page .analytics-grid` declarations are overwritten by the `admin.css:3176` block (equal specificity, later in the file). Only the last block is edited, keeping the change minimal; the design is verified with a headless computed-style check rather than editing redundant rules.

## Risks / Trade-offs

- [Shared `.admin-page .analytics-grid` CSS could change other pages] → Mitigation: grep confirmed only `admin.html` uses it without an inline override; `inventory.html` pins its own `repeat(4, 1fr)` inline and other admin pages don't use the class.
- [Responsive 2×2 at ≤639px could feel crowded] → Mitigation: the retained cards render at the same widths today (three-per-row previously); keeping two columns preserves a balanced 2×2, and the ≤480px single-column rule covers the narrowest devices.
- [A future CSS reorder could unmask the superseded `repeat(5)` rules] → Mitigation: the effective rule is edited, and the harness asserts the computed grid columns at four widths; if the dead rules ever surface, the test catches the regression.