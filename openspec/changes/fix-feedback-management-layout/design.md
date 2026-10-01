## Context

`public/admin-feedback.html` renders its top section as a `.dashboard-panel-header` flex row (inline `<style>` at line 35: `display:flex; justify-content:space-between; align-items:flex-start; gap:1rem`) that contains two children:

1. A `<div>` with the eyebrow "Feedback Management", the `h2` title "All Feedback", and the description copy.
2. `<div id="feedbackFilterContainer">`, into which `admin-feedback.js` renders the SmartFilter toolbar (`.filter-toolbar` with `.filter-toolbar__row--main` and a second advanced row, built by `admin-filters.js`).

`admin.css` styling makes this overflow-prone on the feedback page:

- `.filter-toolbar { width: 100% }` (admin.css:3433-3435) — forces the toolbar to claim the full width of the flex item it lives in.
- `.admin-page .filter-control, .admin-page .filter-toolbar__row .filter-btn { flex-shrink: 0 }` (admin.css:3442-3445) — controls cannot shrink.
- `.filter-control__select { min-width: 180px }` and search `flex: 1 1 280px; max-width: 520px` — the toolbar's natural minimum width is large.

Because the heading block and filter container share one non-wrapping (`flex-wrap` not set) flex row, once the toolbar's min-content width exceeds the panel's remaining space the line overflows. The controls stick out of their lane and visually collide with / cover the "All Feedback" heading (the dark `--dash-ink: #10284d` title) and its description. The `≤768px` rule in the page's inline style (`flex-direction: column`, admin-feedback.html:179) stacks them, but the tablet/laptop band (~769-1280px) exposes the overlap, which is what the user reports.

Root cause check (per requirements): no `position:absolute`, negative margins, fixed heights, or z-index are used in the header/filter CSS; the collision is purely a flex-layout sizing defect.

## Goals / Non-Goals

**Goals:**
- Give the filter toolbar its own full-width lane below the heading block on the Feedback Management page, so overlap is structurally impossible.
- Add explicit vertical spacing in the user-required hierarchy: Feedback Management → All Feedback → description → filters → table (heading → description spacing already exists; add description→filters and filters→table spacing).
- Keep controls wrapping rather than shrinking/clipping at every supported width; preserve the readable search placeholder.
- Preserve the existing design language and leave all other pages untouched.

**Non-Goals:**
- No changes to search/filter/sort/export behavior, data, API, routes, auth, or the data table.
- No theme/design changes (colors, typography, buttons, shadows, border radius).
- No z-index or negative-margin fixes.
- No changes to the returns page or any other admin/student page layout.

## Decisions

### 1. Scoped fix via a page hook, not shared-rule modification
Add a `feedback-management-page` class to the Feedback Management page `<body>`, and append scoped rules in `admin.css` targeting `.feedback-management-page ...`. The shared `.admin-page .filter-toolbar` rules (admin.css:3144-3157, 3433-3449) came from prior inventory/returns cleanups; editing them would ripple into other pages. Scoping keeps the fix surgical and satisfies the "other pages unaffected" requirement.
- Alternative considered: editing the shared `.filter-toolbar`/`.dashboard-panel-header` rules directly — rejected because it would alter admin returns and inventory layouts that the user did not ask to change.

### 2. Make the header wrap and drop filters to a full-width lane (no DOM restructuring)
Keep `#feedbackFilterContainer` a child of `.dashboard-panel-header`, but set on the feedback page:
- `.dashboard-panel-header { flex-wrap: wrap; row-gap: 1.1rem; margin-bottom: 1.5rem }` — the title block occupies the first wrapped line; the filter container begins on a second line, below the description.
- `#feedbackFilterContainer { flex: 1 1 100%; min-width: 0 }` — the toolbar always starts fresh on its own full-width row, so the heading block and filters can never share a row again.
- `.dashboard-panel-header > :first-child { flex: 0 1 auto; min-width: 0 }` — the heading block keeps its natural width but may grow if needed under wide screens, without being squeezed by the toolbar.

This keeps `admin-feedback.html` markup changes to a single attribute (the body class) and requires no JS changes (`admin-filters.js` only looks up the container by id). Spacing uses the page's existing rhythm (0.3 // 0.9 // 1.1-1.5rem), reinforcing the required vertical hierarchy.
- Alternative considered: moving the whole filter container out of `.dashboard-panel-header` into a new `<div>` before the table — functionally identical, but a larger DOM edit with no added benefit over the wrap approach.

### 3. Rely on existing toolbar wrap behavior
The toolbar already wraps (`flex-wrap: wrap` on `.filter-toolbar__row`; `flex-basis: 100%` search under 768px; `filter-control { flex: 1 1 auto }` under 768px). Once the toolbar owns a full-width lane, these existing rules make it flow onto multiple rows cleanly. No new responsive media rules are needed; the fix only corrects the lane placement that caused the collision.

### 4. No margin/overflow hacks; keep `:root`/inline styles as-is
The heading colors, panel styling, and `.admin-data-table { min-width: 940px }` + `.table-responsive` horizontal scroll remain untouched. If the toolbar's internal `margin-bottom` (1rem/20px) causes too much gap before the table, it stays inside the toolbar lane and is visually acceptable; margin fine-tuning happens in the implementation eyeball without touching other pages.

## Risks / Trade-offs

- Risk: the wrap approach adds one wrapped row at every width (filters always fully below the heading), slightly increasing vertical height compared to the intended side-by-side on very wide screens. → Mitigation: this is exactly the user-requested hierarchy and is stable across widths; the heading block should not look "short" on wide monitors. Optionally the heading block could later stretch full-width with the filter lane below it, which is already what this design yields.
- Risk: `.admin-page` shared rules (width 100%, flex-shrink 0) still apply to the feedback page — they now work *correctly* inside a full-width lane. → Mitigation: verified via scoped overrides; no other page is in scope.
- Risk: overriding `.dashboard-panel-header` (defined in the page's inline `<style>`, loaded before `admin.css`) from `admin.css` — `admin.css` <link> (line 182) is loaded after the inline block, and the scoped selector has higher specificity, so the override wins. → Mitigation: use `.feedback-management-page .dashboard-panel-header` (specificity beats `.dashboard-panel-header`).

## Migration Plan

Pure additive CSS + one body-class attribute. No data, schema, or dependency changes. Rollback = remove the appended `admin.css` block and the body class; the page returns to its current state instantly. No server restart; only browser cache refresh required.

## Open Questions

- None blocking. Verify in-browser afterwards at the four widths (desktop ~1440px, laptop ~1120px, tablet ~768px, mobile ~390px) per the task list, including a quick check that the returns page is visually unchanged.