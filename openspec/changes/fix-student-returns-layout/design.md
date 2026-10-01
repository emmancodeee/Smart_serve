# Design: Fix Student Returns Module Layout

## Context

`public/returns.html` is the single Student Returns page (route `/returns`, sidebar item "Returns" active). It contains one form (`#returnForm`) plus a "My Return Requests" history table below. The current page shows a single blue `.module-title-bar` reading "Submit Return Request" directly above the form card.

The target (per reference pictures, treated as one page scrolled from top to bottom):
- VIEW 1 (top): a blue rounded page-title box reading **"Return Request"**, with the form card below.
- VIEW 2 (below, same page): the same form card, topped by a blue title box reading **"Submit Return Request"**, containing the full-width `Registration *` and `Items to Return *` fields, an evenly aligned item-field grid (Quantity, Condition, Additional Notes), and a Cancel left / Submit Request right button row.

Key constraints from the user:
- Layout-only. No functional, data, routing, sidebar, header, or unrelated-module changes.
- The form has one card; item rows are added/removed via existing `addItem()`/`removeItem()` in `public/js/returns.js`.
- Do NOT make the form too narrow or too wide; keep consistent margins; stack fields on small screens.
- No new route — VIEW 2 is achieved solely by the second title bar + card layout and natural page scrolling.

## Goals / Non-Goals

**Goals:**
- Render a top page-title box "Return Request", then the "Submit Return Request" form card, then the history card, stacked vertically on one page.
- Make the form fields (especially the item rows) evenly aligned with consistent heights and spacing by relying on explicit CSS instead of missing Tailwind utilities.
- Place Cancel (left) and Submit Request (right) consistently, away from the card edges.
- Stay responsive: single-column stack on small screens, no horizontal overflow.

**Non-Goals:**
- No changes to form submission, API calls, auth, routing, sidebar, or header.
- No changes to the history table content or its existing styling beyond what is needed for consistent page spacing.
- No re-skinning, no new color scheme; only reuse of existing student tokens/classes.

## Decisions

### 1. Use two stacked `.module-title-bar`s on the same page
- `public/returns.html` currently has one `.module-title-bar` reading "Submit Return Request" (line 734). We will:
  - Insert a new `.module-title-bar mb-5` reading "Return Request" as the first element inside `.student-main-inner`, BEFORE the form card.
  - Keep the existing blue `.module-title-bar` "Submit Return Request" immediately above the form card (this becomes VIEW 2's section title).
- Follows the exact pattern already used in `public/profile.html` (two `module-title-bar`s: "Registration Details" and "Edit Your Profile") which is the established convention.
- `.module-title-bar` styling already exists in `theme.css` (pages 29-54), including the fixed 20px top/bottom spacing rules scoped to `.student-main-inner` direct children. No theme.css changes needed unless a margin must be tuned; prefer inline utility classes (`mb-5`) to keep the change local.

### 2. Fix alignment by adding explicit CSS, not by relying on missing utilities
Investigation of the compiled `public/css/tailwind.css` shows these utilities used by the current form are MISSING: `sm:grid-cols-2`, `md:grid-cols-4`, `sm:flex-row`, `mt-3`, `items-end`, `md:px-7`, etc. Consequently the item-row grid yields confusing wraps on some breakpoints and the button row cannot lay out horizontally via those classes.
- Add a small set of explicit CSS rules inside the page's existing inline `<style>` block (scoped with a prefix like `.return-*`) OR reuse verified-existing utilities:
  - Verified present: `grid`, `grid-cols-1`, `grid-cols-2`, `sm:grid-cols-3`, `md:grid-cols-2`, `md:grid-cols-3`, `gap-3`, `gap-4`, `flex`, `flex-wrap`, `justify-center`, `items-center`, `items-start`, `w-full`, `mb-5`.
  - For the item-row field grid, prefer `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`-style breakpoints but CONFIRM each class exists at implementation time; if a responsive utility is missing, add a small custom rule in the inline `<style>` (e.g. a media query) rather than editing the compiled `tailwind.css`.
- Rationale: keeping changes in the page's inline `<style>` avoids rebuilding the Tailwind CLI output and keeps the change isolated to the Returns module.

### 3. Item-row structure stays data-compatible
`collectItems()` in `returns.js` reads `.item-type`, `.item-name`, `.item-condition`, `.item-quantity`, `.item-notes` per `.student-item-row`. So:
- Keep the same field classes and the same order of fields (Type, Name, Condition, Quantity, Notes) inside each `.student-item-row`, including the "Add Another Item" and per-row "Remove" buttons.
- `addItem()` (returns.js:261) builds identical rows; if grid classes on the template change, update the `addItem()` template to match so dynamically added rows render the same.
- The "Quantity, Condition, Additional Notes" alignment requirement maps to ensuring Condition, Quantity, and Notes fields share equal column width/height and consistent `gap`.

### 4. Button row: Cancel left, Submit Request right
- Currently the buttons are `Submit Return Request` (submit) then `Cancel` in DOM order. Requirement: Cancel on the LEFT, Submit Request on the RIGHT.
- Use an explicit flex container with `justify-content: space-between` (or `flex-col` stack on mobile via a media query), and confirmed utilities. If `sm:flex-row` is missing (it is), add a tiny inline rule or use verified `flex ... sm:` classes; alternatively define the row rule in the inline `<style>` with a media query at ~640px. This guarantees Cancel-left/Submit-right on desktop and stacked full-width on mobile.
- Buttons keep existing `.student-btn`, `.student-btn-primary`, `.student-btn-secondary`, and `w-full sm:w-auto` classes (verified `sm:w-auto` present).

### 5. Card spacing and responsiveness
- Form section markup: keep `.student-panel` (verified it defines white card, radius 28px, subtle border, shadow) with an inner wrapper for the form. Ensure the form content uses comfortable padding (e.g. `p-6`, verified `px-4`/`p-*` (check presence)) so labels/fields never touch the card edges.
- Maintain the existing `.student-main-inner px-4 pb-8 pt-5 md:px-7` main container class string; note that `pt-5`/`md:px-7` may or may not be present in tailwind — theme.css already pins the top spacing for the title bar, so leave as-is.
- History card: unchanged; only ensure adequate vertical separation (it already follows the form card).
- No fixed widths; the form fills the content column (1280px max), satisfying "not too narrow or wide".

## Risks / Trade-offs

- **Missing Tailwind utilities** → Verify each responsive/grid class against `tailwind.css` at implementation; add inline `<style>` rules (scoped to returns page) for any that are absent. Do not edit `tailwind.css`.
- **Layout divergence between HTML template and `addItem()` JS template** → Update both in the same task; add a grep/visual check that the dynamic row classes match the static row.
- **Accidental behavior change** → Keep all `student-form-*`, `item-*`, modal, and form-submit references intact; no JS logic edits beyond the `addItem()` template classes.
- **Inline style bloat** → Keep added CSS minimal and prefixed; avoid duplicating rules already in `theme.css`/`student-panel`.

## Migration Plan

- Apply edits to `public/returns.html` only (plus the `addItem()` template line in `public/js/returns.js` if grid classes change there).
- No server, route, data, or build changes; no database migration.
- Rollback: revert the one HTML file (and the one JS template line). Because changes are declarative CSS/markup, rollback is trivial.

## Open Questions

- Whether the exact breakpoints for the item grid should be 2-col/3-col/4-col on sm/md/lg — resolved at implementation by using verified utilities, falling back to inline media queries.
- None affecting behavior.