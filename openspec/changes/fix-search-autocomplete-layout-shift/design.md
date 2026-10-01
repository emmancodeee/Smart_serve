## Context

Request Management's registrations filter renders into `#registrationsFilterContainer` via the shared **SmartFilter** component (`public/js/admin-filters.js`). The Search control is a plain `<input type="search" class="filter-control__input filter-control__input--search">` created in `build()` (admin-filters.js:730-744), with `placeholder`, an `aria-label`, and a debounced `input` handler that filters the table. It carries **no `datalist`, no custom suggestion markup, and no suggestion list is ever inserted into the DOM** — confirmed by searching the codebase for suggestion/datalist/searchResults patterns.

Therefore the dropdown the user sees is the **browser's native autofill/autocomplete** overlay (previously-typed values such as "BS Business Administration"), drawn by the browser over the page. When that overlay appears it sits over/in front of the toolbar row and can trigger a viewport reflow or scroll (e.g., when a scrollbar appears/disappears or the input is scrolled into view), which makes the grid appear to shift — Sort, Reset Filters, and Export look displaced and the Search field looks cut off from its row.

The registrations toolbar is a six-track CSS grid (`.filter-toolbar__row--main`, `repeat(6, minmax(0, 1fr))`) inside `#registrationsFilterWrap.admin-section`; Search spans two tracks. The layout itself is stable — nothing in the app changes it on focus. The layout shift is entirely caused by the native popup.

Decision (confirmed with the user): **disable the browser's native autofill dropdown** so nothing can pop open and shift the layout. No custom suggestion UI is built (per "do not create a new search system").

## Goals / Non-Goals

**Goals:**
- Focusing the Search field NEVER opens a suggestion dropdown and NEVER changes the position, size, alignment, or spacing of any filter control, row, or the container.
- The two-row shared-edge grid stays exactly as rendered (Row 1 = All Status | Year/Category | Year Level | Student Type | All Date; Row 2 = All Time | Sort | Search | Reset Filters | Export).
- Fix applies to the shared SmartFilter search input so all admin search fields behave the same.
- Existing search/filtering functionality (typing filters the table; reset clears; export works) is fully preserved.

**Non-Goals:**
- No new suggestion/autocomplete UI (no custom overlay, no z-index overlay list, no suggestion data source).
- No changes to filter positions, widths, spacing, colors, typography, the table, sidebar, header, or other Request Management sections.
- No changes to `public/css/admin.css` (the grid already does not move once no popup can render).

## Decisions

### D1 — Suppress native autofill at the source in SmartFilter's `build()`
Add three attributes to the search input created at admin-filters.js:730-734:
```js
autocomplete: 'off',
autocorrect: 'off',
spellcheck: 'false'
```
Rationale: the browser cannot render an autofill/autocomplete popup for an input with `autocomplete="off"`, so the layout cannot shift — by construction, not by styling. `autocorrect="off"` and `spellcheck="false"` stop the browser's secondary inline affordances (spellcheck underline redraws, autocorrect popovers) from poking at the grid. Because every SmartFilter consumer uses the same builder, users/transactions/pickup/accounts/announcements search fields are de-risked too.

Alternatives considered and rejected:
- *(a) Per-module opt-in flag* (`config.search.autocomplete` defaulting to off) — adds configuration surface with no benefit; all module search fields hit the same native-popup problem.
- *(b) CSS-only `position: relative` + absolute overlay rules* — there is no custom dropdown to position; the native popup cannot be styled or positioned by page CSS, so defensive CSS cannot stop it. Rejected.
- *(c) Build a custom in-page suggestions overlay* — new UI + data source, contradicts "do not create a new search system", more surface area to break. Rejected by the user.

### D2 — No CSS/layout changes
The grid and its shared-edge alignment already meet the layout requirements; the only moving part was the native popup. Removing it (D1) means focus/blur changes to the input only affect the input's own border (existing focus styles), never track widths, row heights, or container height. No `z-index`/overlay CSS is needed because nothing renders.

### D3 — Cache-bust the `admin-filters.js` script tag
`public/admin.html:521` loads `<script src="/js/admin-filters.js">` with no cache-buster. Without one, the browser may keep executing the stale JS (which still shows native autofill) even though the file on disk is fixed. Give it a `?v=<sha256-prefix>` like the stylesheet link, bumping the hash whenever the file changes.

## Risks / Trade-offs

- [Some Chrome builds ignore `autocomplete="off"` for certain fields] → The input is `type="search"` with no `name`; Chrome honors `autocomplete="off"` for such non-login inputs. If a specific Chrome version still forces its "Autofill" panel, the manual check will catch it and `autocomplete="new-password"`-style workarounds can be added — noted as a follow-up, not pre-empted.
- [Removing native autofill removes "quick fill" convenience for admins] → Accepted, per the user's decision; the trade-off is a guaranteed-stable filter layout.
- [SmartFilter is shared — all module search inputs lose native autofill] → Intended and consistent; not a functional regression (typing search still works everywhere).
- [Overlapping sibling changes (`center-request-filter-layout` etc.) share this toolbar] → This change only touches the search input attributes and a script tag; reconcile capability wording at archive.

## Migration Plan

No data migration. Deploy = edit `build()` attributes + re-hash the `admin-filters.js` script tag. Rollback = remove the three attributes and revert the script tag hash. No CSS, API, or dependency changes.

## Open Questions

None — approach confirmed with the user (disable native autofill).