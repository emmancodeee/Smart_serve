## Context

`public/admin-feedback.html` defines the Feedback Management table with page-local inline CSS. The Actions column (`th:last-child`, `min-width: 250px`) is populated by `public/js/admin-feedback.js`, whose row template renders:

```html
<td>
    <div class="table-actions">
        <button class="btn btn-sm btn-info" onclick="viewFeedback('...')">View</button>
        <button class="btn btn-sm btn-primary" onclick="openResponseModal('...')">Respond</button>
        <button class="btn btn-sm btn-warning" onclick="openStatusModal('...')">Status</button>
        <button class="btn btn-sm btn-secondary" onclick="updatePriority('...')">Priority</button>
    </div>
</td>
```

Relevant existing page-local CSS (`admin-feedback.html`):
- `.table-actions { display: flex; flex-wrap: wrap; gap: 0.4rem; min-width: 220px; }` (line 174) — wrapping flex, which lets Priority drop below the others unpredictably.
- `.table-actions .btn { padding: 0.45rem 0.7rem; font-size: 0.78rem; line-height: 1.2; }` (line 175) — the existing button sizing.
- `.admin-data-table th:last-child { min-width: 250px; }` (line 168) — Actions column width.
- `.admin-data-table td { vertical-align: middle; }` (line 169) — row vertical centering (already present).
- `.table td { padding: 1rem; }` (line 149).
- `.table-responsive` wraps the table (Bootstrap), giving horizontal scroll on narrow screens.
- `admin-returns.html` has an identical but separate page-local `.table-actions` rule (line 178) — it is a different page with its own inline styles.

Bootstrap 5.3 is loaded on this page only (`admin-feedback.html`), so the buttons rely on Bootstrap `btn`/`btn-sm`/`btn-*` color classes.

Constraints: keep colors/sizes/functions identical; only organize layout and spacing; do not redesign the page; buttons must not overflow the Actions column.

## Goals / Non-Goals

**Goals:**
- A stable 2x2 grid: View/Respond then Status/Priority, equal column widths, equal row gaps and column gaps, no wrapping, no overlap, no clipping.
- Grid vertically centered within each feedback row.
- Existing Bootstrap button colors, `.table-actions .btn` sizing, and all four onclick handlers unchanged (no JS edits).

**Non-Goals:**
- No changes to buttons' colors, classes, labels, or handlers (view/respond/status/priority).
- No markup changes in `admin-feedback.js`, no new table ids, no changes to any other column or page element.
- No changes to `admin-returns.html` or any other page (its `.table-actions` rule is separate).
- No new shared CSS or JavaScript files (single page-local rule change is sufficient and lowest-risk).

## Decisions

### D1 — CSS-only layout fix on the page-local `.table-actions` rule
Change `admin-feedback.html:174` from a wrapping flex to a two-column grid:

```css
.table-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.4rem; width: 100%; }
```

- `repeat(2, minmax(0, 1fr))` yields two equal-width columns; `minmax(0,1fr)` prevents a button's label from forcing its cell wider than its fair share (no overflow beyond the column).
- `gap: 0.4rem` gives an identical, small gap horizontally and vertically — matching the existing spacing and the ~6px gap used by the registration action grid elsewhere in the admin.
- `width: 100%` makes the group fill the Actions cell; the existing `th:last-child { min-width: 250px }` already guarantees enough column width for two ~105px buttons, a 6.4px gap, and 16px td paddings, so nothing overflows into the Date column or the table edge.
- Vertical centering needs **no change**: `.admin-data-table td { vertical-align: middle }` already centers the cell content.
- Button sizing is untouched: `.table-actions .btn` still matches (it only requires the ancestor class, which the container already has).
- *Alternatives considered:* (a) reusing the global `.action-buttons` class from the registration tables — rejected: it would require adding a table id, a second scoped CSS rule, and touching the JS row template, i.e., more churn for the same visual result, and it would relabel the container away from the page's existing `.table-actions` structure. (b) Adding `w-100`/`d-grid` Bootstrap utility classes to each button in JS — rejected: grid items are automatically blockified and stretch to fill their cells; no utility class is needed.

### D2 — Equal width, height, and spacing come from the grid itself
Grid items (the buttons) are blockified and stretch to their cells: equal column widths (from `1fr`), and equal heights per row plus identical `padding`/`font-size` from `.table-actions .btn`. Rows and columns share the same 0.4rem gap, so spacing is consistent in both directions. Buttons never touch (`gap`), never compress or overlap (two fixed columns, `minmax(0,1fr)`), and stay single-line for short labels.

### D3 — Preserve functionality and colors with zero JS changes
`admin-feedback.js` is not edited. The four buttons keep their exact `btn btn-sm btn-*` color classes (Bootstrap `btn-info` cyan, `btn-primary` blue, `btn-warning` gold/yellow, `btn-secondary` gray/neutral) and their existing `onclick` handlers (`viewFeedback`, `openResponseModal`, `openStatusModal`, `updatePriority`). Because grid columns render in source order and the container is unchanged in the DOM besides its computed display, handlers and state remain identical.

### D4 — Responsive behavior
`.table-responsive` (Bootstrap horizontal scroll) already wraps the table, so on narrow screens the whole table scrolls and the 2x2 grid stays intact rather than compressing/overlapping. This satisfies the responsive requirement without extra CSS. Verified by keeping the two-column grid fixed-width.

## Risks / Trade-offs

- [Buttons could stretch wider than their labels in the two equal columns] → Intended: equal/consistent widths are required; 1fr cells are ~105px, only slightly wider than the labels, so the group reads cleanly and is not oversized.
- [`.table-actions` is also used on admin-returns, which has its own inline rule] → They are independent page-local rules; only the feedback page's rule changes, and verification greps confirm the returns rule stays flex.
- [`flex-wrap`/`min-width` removal might affect nothing else on this page] → `.table-actions` is used only for this feedback Actions group; no other element uses it.
- [No JS file changes to syntax-check] → Compensated with a temp jest smoke test that reads `admin-feedback.js` and asserts the four buttons, color classes, and handlers are intact, plus the CSS rule assertions.

## Migration Plan

Static asset only: the single edited rule ships with `admin-feedback.html`. Rollback is a one-line git revert. No cache/backend/data impact.

## Open Questions

None.