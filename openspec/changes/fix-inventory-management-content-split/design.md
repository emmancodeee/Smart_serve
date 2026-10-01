## Context

`public/inventory.html` is a standalone static admin page served at `/admin/inventory` (with `/inventory` redirecting there). It is hand-written HTML with Tailwind utility classes, sharing `public/css/admin.css` and the shared sidebar mounted by `public/js/admin-nav.js`. It is not a component-based framework page, so "component structure" here means the static document structure.

The page currently renders, in order: a sticky `header`, an Inventory Summary `<section>` with four `stat-card` blocks, then the Inventory List `<section>` with the read-only notice, filters, and the inventory table. The Inventory Summary duplicates the Dashboard's Inventory Overview in `public/admin.html`.

`public/js/inventory.js` is a classic script (no modules) that owns inventory fetching, filtering, table rendering, and pagination. It also calls `loadSummary()` and `updateCardStats()`, which exist solely to populate the four duplicated cards.

Two markup defects exist and currently cancel each other out in raw tag counts:

| Location | Defect | Current effect |
| --- | --- | --- |
| `inventory.html:47` | `div.mx-auto` header wrapper opened, never closed | `</header>` at line 80 pops it |
| `inventory.html:133` | Stray `</div>` closing nothing in its section | Ignored by the parser (current node is `<section>`) |

The header region has 12 `<div>` opens and 11 `</div>` closes; the stray close at line 133 restores the file-wide total to 46/46. Because browsers recover from both, the rendered result is currently correct — the module content stays inside `#main-content` and keeps the `lg:ml-[270px]` sidebar offset.

The read-only notice at lines 87-89 has no inline `display`, so it renders for every role. `applySuperAdminSidebar()` sets its `display` to `''`, which changes nothing; the function exists only to manipulate that one element.

The filter toolbar comes from `SmartFilter.create()` in `public/js/admin-filters.js`, a shared component used by **ten filter containers across five pages**. `build()` emits a single `filter-toolbar__row filter-toolbar__row--main` flex row whose children are, in DOM order: the Category select, the Stock Status select, the Date Added range group, the Sort select, the search field, Reset Filters, and Export. `container.dataset.module = moduleId` is set on the container, and the inventory config uses `moduleId: 'inventory'`, so `[data-module="inventory"]` is an existing, reliable scoping hook. `public/css/admin.css:3523-3565` already establishes exactly this technique for `[data-module="registrations"]`, converting that module's row to a six-track CSS grid with a search spanning two tracks and a `max-width: 768px` collapse.

Two structural details constrain the fix. `.admin-section` uses `padding: 0 1.25rem 1.25rem` with `border-radius: 28px` and `overflow: hidden`, and the title bar is styled by `.admin-page .admin-section h2`, which bleeds full-width via `margin: 0 -1.25rem 1rem`. The enclosing `<div class="section-header-bar">` has **no CSS rule anywhere in the project** — it is an unstyled wrapper that exists only to hold the `h2`. Because the `h2`'s negative margin resolves against that wrapper's box, the wrapper must not be removed or restyled. Separately, `All Time` is not an independent filter: it is the first entry of `DATE_RANGE_PRESETS` and therefore the default option label of the single Date Added range select.

## Goals / Non-Goals

**Goals:**

- Remove the Inventory Summary section from the Inventory Management page so the page shows one module content block: the Inventory List title bar, then filters, then the table.
- Remove the read-only notice entirely, leaving no replacement message, no leftover container, and no compensating spacing, so the Inventory List section is the first content below the page header.
- Arrange the inventory filter toolbar as a balanced two-row layout without altering any other admin module.
- Leave the Dashboard's Inventory Overview in `public/admin.html` byte-for-byte unchanged.
- Make `public/inventory.html` well-formed, so layout no longer depends on parser error recovery.
- Delete the JavaScript that existed only to feed the removed cards and to manipulate the removed notice.
- Preserve all existing module behavior: filters, search, sort, pagination, CSV export, status badges, and the real Books/Modules/Uniforms dataset.

**Non-Goals:**

- No changes to the Dashboard (`public/admin.html`, `public/js/admin.js`).
- No changes to the shared sidebar, `admin-nav.js`, `server.js` routing, or role permissions.
- No visual redesign of the filters, table, cards elsewhere, or spacing system.
- No API, database, or schema changes. The `GET /api/auth/inventory/analytics/summary` endpoint is retained.
- No new or demo inventory data.
- Not fixing the separate `public/admin.html` div imbalance (110 opens / 109 closes) found during investigation.

## Decisions

**D1. Remove the summary `<section>` from the DOM rather than hiding it with CSS.**

The four cards are removed together with their `analytics-section-body` and `analytics-grid` wrappers.

*Rationale:* Hiding with `display: none` would leave dead markup and dead JavaScript, and would keep the section in the accessibility tree and document flow checks. The user explicitly asked for removal from the page structure, not cosmetic hiding.

*Alternative considered:* Keep the markup and set `hidden` so it can be restored later. Rejected because it preserves the duplication that caused the defect and leaves `loadSummary()` running an extra API call on every page load for data no user can see.

**D2. Target the existing `inventory-page-layout` capability and retire the conflicting requirements, rather than introducing a new capability.**

The delta uses `## REMOVED Requirements` for "Summary cards display in a 4-column row", `## MODIFIED Requirements` for the banner placement, and `## ADDED Requirements` for the new single-block and well-formedness requirements.

*Rationale:* The behavior being changed was already specified by the unarchived `redesign-inventory-page-layout` change. Creating a parallel capability (for example `inventory-page-structure`) would let two contradictory specs coexist and would defer the conflict to archive time. Reusing the capability name keeps one source of truth and makes the contradiction explicit now.

*Alternative considered:* New capability `inventory-page-content-structure`. Rejected — it would duplicate subject matter and hide the conflict.

**D3. Fix both nesting defects together, and document that neither currently causes the visual split.**

The header wrapper gets its missing `</div>` and the stray `</div>` at line 133 is removed.

*Rationale:* The raw tag count is only balanced by coincidence, and the stray close sits immediately adjacent to the section being deleted. Leaving it would mean shipping a "simplification" that still depends on error recovery. However, the change must not claim the nesting caused the layout problem: per HTML parsing rules `</header>` already pops the unclosed wrapper and the stray `</div>` is already ignored, so the module content renders inside `#main-content` either way. The proposal and spec therefore justify the fix on correctness grounds and keep the layout claim out.

*Alternative considered:* Remove the summary section and leave the nesting alone as a separate change. Rejected — it leaves invalid markup in a file this change is already editing, and the stray close is in the immediate blast radius of the deletion.

**D4. Delete `loadSummary()` and `updateCardStats()` from `public/js/inventory.js`.**

Both functions and all call sites are removed, together with the `summaryInFlight` guard and `formatDate()`, whose only caller was `updateCardStats()`.

*Rationale:* `loadSummary()` fetches `/api/auth/inventory/analytics/summary` and writes only the four card values. `updateCardStats()` writes only `totalCategories` and `lastUpdatedDate`. After the cards are gone, both are unreachable dead code that still costs an API round trip on every inventory page load. `formatDate()` is removed with them because a repo-wide grep shows no other caller; note `supply-stock.js` defines its own separate `formatDate` and the two pages are never loaded together.

*Alternative considered:* Keep the functions for future use. Rejected — dead code plus a wasted request.

**D5. Preserve the `totalItems` pagination local.**

`totalItems` is also a local variable inside the pagination helpers `getPaginatedItems`, `renderPagination`, and `applyDisplay`.

*Rationale:* Grep-based cleanup keyed on the string `totalItems` risks deleting or shadowing the pagination local, which would break page counts. The implementation must distinguish the removed DOM id lookups from the retained pagination variable.

*Alternative considered:* Rename the pagination local to avoid the collision. Rejected — unnecessary churn in working code for a cosmetic naming benefit.

**D6. Leave the read-only notice to become the first element of the module content.**

*Superseded by D7.* This decision repositioned the notice; it is retained here only to record that the earlier plan was replaced rather than silently dropped.

**D7. Delete the read-only notice element outright, for both roles.**

The `<p id="inventoryReadOnlyNotice">` element, its amber styling, its text, and its `/admin/supply-stock` link are removed from the DOM, and `applySuperAdminSidebar()` plus its two call sites are removed from `public/js/inventory.js`. The explanatory comment above that function, which records why this page does not load `admin.js`, is kept.

*Rationale:* The notice restates what the page already conveys — it exposes no mutating controls — and Supply & Stock is already in the shared sidebar for both roles, so the inline link is redundant. Once the summary cards are gone it is the last block between the page header and the module content, so it is what keeps the Inventory List from being the first thing an admin sees. Because it has no inline `display:none`, it renders for every role, so the removal is naturally consistent for Admin and Super Admin rather than role-conditional. `applySuperAdminSidebar()` manipulates nothing else, so it becomes dead code and is removed with it.

*Alternatives considered:*
- *Hide it with CSS* — explicitly rejected by the requester and inconsistent with the rest of this change, which removes markup rather than concealing it.
- *Keep it but only for Super Admin* — rejected. It is not a role-distinguishing fact; the page is read-only for everyone, and retaining a role-conditional banner would reintroduce the block the change exists to remove.
- *Keep the function, empty it out* — rejected. A function whose entire body targeted a removed element has no reason to exist.

**D8. Arrange the toolbar with a new CSS grid rule scoped to `[data-module="inventory"]`, mirroring the registrations precedent.**

Add a block to `public/css/admin.css` that converts `.admin-page .filter-toolbar[data-module="inventory"] .filter-toolbar__row--main` from a wrapping flex row to `display: grid` with `grid-template-columns: repeat(4, minmax(0, 1fr))` and `gap: 12px`, places the search wrapper on `grid-column: span 2`, and adds a `max-width: 768px` media query that drops to two tracks with the search spanning `1 / -1`.

*Rationale:* The `data-module` attribute is already emitted by `SmartFilter.build()`, and `admin.css:3523-3565` uses this exact pattern for `[data-module="registrations"]`, including a comment recording that other modules are unaffected. A grid gives deterministic placement, so control grouping no longer depends on incidental wrap order, and `span 2` gives the search field enough width for its placeholder without touching the shared `.filter-control--search { flex: 1 1 280px; max-width: 520px }` rule. Because the row is the only child of the toolbar, the seven controls resolve to exactly two rows: four selects on row 1, then search/Reset/Export on row 2. The hidden `.filter-date-range__custom` sub-row lives inside the Date Added group rather than as its own grid item, so it does not consume a track.

*Alternatives considered:*
- *Add a layout option to the shared `SmartFilter` config* — rejected. It would require editing a component used by ten filter containers across five pages, for a layout concern that only one module has.
- *Add a second toolbar row in `build()`* — rejected, same reason: shared component surgery.
- *Edit the unprefixed `.filter-toolbar__row` / `.filter-control--search` rules* — rejected. Those affect every admin module, which the requester explicitly forbade.
- *Leave the toolbar on one wrapping row* — rejected. It does not deliver the requested two-row grouping or a reliably wide search field.

**D9. Do not modify `public/js/admin-filters.js` or any other module's filter configuration.**

The shared component source and every `moduleId` other than `inventory` are left untouched, and no existing CSS rule is edited or deleted — the new inventory block is purely additive.

*Rationale:* This is what keeps the blast radius at one page. The ten filter containers in `admin.html`, `admin-feedback.html`, `admin-returns.html`, `admin-supply-stock.html`, and `inventory.html` share the same class names, so any unprefixed edit would silently restyle the Dashboard, Supply & Stock, Request Management, Return Requests, Feedback Management, Announcements, Admin Accounts, Users, Transactions, and Pickup Confirmations. Because the change only appends a scoped rule, the other modules' computed styles are unchanged by construction, which makes "sidebar and other modules unchanged" verifiable rather than aspirational.

*Alternative considered:* Normalize the shared toolbar for all modules at once. Rejected — that is a redesign of ten screens, far outside this request.

**D10. Keep the `1280px` content width and the `.section-header-bar` wrapper as they are.**

*Rationale:* `max-width: 1280px` is the shared admin content token, applied identically to every module, so the Inventory List already spans the available main content width; the perceived narrowness came from the search field's `max-width: 520px` inside a wrapping row, which D8 addresses directly. Raising or removing the cap would desynchronize this page from the rest of the admin. Likewise `.section-header-bar` has no styles of its own, but the `h2`'s `margin: 0 -1.25rem 1rem` resolves against that wrapper, so removing or restyling it would break the title bar's full-bleed rounded corners. Width and title-bar requirements are therefore satisfied by leaving these alone.

## Risks / Trade-offs

- **Unarchived sibling specs contradict this change** → `redesign-inventory-page-layout` and `inventory-page-ui-cleanup` still require the summary cards to be present. Mitigation: the conflict is called out in the proposal's Capabilities section and the delta reuses the same capability name, so it must be resolved at archive time rather than silently merging. Those changes need their summary-card requirements retired.
- **Layout CSS could leak into other modules** → the shared toolbar classes serve ten filter containers. Mitigation: D9 requires the new rule to be purely additive and scoped to `[data-module="inventory"]`, and no existing rule is edited. Verification compares the other modules' `data-module` toolbars before and after.
- **Grid could break the Date Added custom range** → the `custom` preset reveals a from/to sub-row inside the Date Added group. Mitigation: the sub-row is a child of the group, not a grid item, so it cannot consume a track; it must be checked at the `custom` preset during verification.
- **Removing the notice removes the only inline path to Supply & Stock** → Mitigation: the shared sidebar lists Supply & Stock for both roles, and a requirement asserts the sidebar still provides it. If the sidebar ever stops listing it, the notice would need to return.
- **Four tracks may be too narrow for the selects** → `.filter-control__select` has `min-width: 180px`, and each track at the 1280px cap is roughly 285px, so the minimum fits. Mitigation: the 768px media query collapses to two tracks, and minimum widths are re-checked at the narrowest supported desktop width.
- **Users lose the four counts on this page** → Mitigation: the same metrics remain on the Dashboard Inventory Overview, and the REMOVED requirement's `Migration` section states where to read them.
- **`totalItems` name collision breaks pagination** → Mitigation: explicit task to verify pagination and page counts after the cleanup, and D5 documents the hazard.
- **Removing the summary shortens the page and changes vertical rhythm** → Mitigation: no spacer or empty-state markup is introduced; the section's own `padding-bottom: 1.25rem` and the title bar's `margin-bottom: 1rem` already define the internal rhythm, so the card closes naturally.
- **`updateCardStats()` may be called from more than one place** → Mitigation: task to enumerate every call site before deleting, including any `loadInventory()` path.
- **Well-formedness fix could alter rendering if the current recovery was load-bearing** → Mitigation: after the fix, compare the rendered DOM nesting of `#main-content` against the pre-change DOM; both must place the module content inside `#main-content`.
- **CSS may reference the removed `analytics-grid` / `stat-card` classes** → Mitigation: `stat-card` is shared with the Dashboard, so those rules must not be deleted; only confirm no Inventory-Management-only selector becomes orphaned.

## Migration Plan

1. Remove the Inventory Summary `<section>` from `public/inventory.html`.
2. Remove the `<p id="inventoryReadOnlyNotice">` element from `public/inventory.html`.
3. Repair the header wrapper `</div>` and remove the stray `</div>` at line 133.
4. Remove `loadSummary()`, `updateCardStats()`, `formatDate()`, `summaryInFlight`, `applySuperAdminSidebar()` and all call sites from `public/js/inventory.js`.
5. Append the scoped `[data-module="inventory"]` toolbar grid rules to `public/css/admin.css`.
6. Verify no reference to the removed card ids or the notice id remains, that the Dashboard still references its own copies, and that no shared rule was modified.

Rollback: revert the three files. No data, API, or migration step is involved, so rollback is a clean file revert with no cleanup required.

## Open Questions

- `redesign-inventory-page-layout` and `inventory-page-ui-cleanup` are unarchived and contradict this change on the summary cards. Should they be archived and re-scoped as part of this change, or handled separately before this change is archived?
- Is the pre-existing `public/admin.html` div imbalance (110 / 109) tracked anywhere, or should it be raised as its own change? It is out of scope here because the Dashboard must remain untouched. It also carries the same unclosed header-wrapper pattern repaired in `inventory.html`.
- `public/css/inventory.css` still defines `.inventory-toolbar` rules for `.search-box`, `.filter-select`, and `.btn-add-item`, none of which `SmartFilter` renders any more, and carries comments at lines 201 and 533 saying the rules were superseded by `admin.css`. Whether to prune that dead block is left alone here to keep this change scoped to the layout the requester described.
