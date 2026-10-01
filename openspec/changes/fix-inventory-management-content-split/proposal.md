## Why

The Inventory Management page shows a Dashboard-style summary above its real module content, so the module reads as two stacked pages. This is caused by a duplicated summary block in `public/inventory.html` — not by a duplicated component or route. This codebase is Express + static HTML + classic scripts, not React, so there is no component tree or `activePage` branch involved.

**Primary defect — duplicated summary block.** `public/inventory.html:84-123` carries its own copy of the four "Inventory Summary" stat cards (`Total Items`, `Low Stock`, `Categories`, `Last Updated`) in a `<section>` immediately above the real module content (read-only notice, filters, table). The same four metrics already exist on the Dashboard's Inventory Overview in `public/admin.html` under `#analytics`, driven by `public/js/admin.js`. On the Inventory Management page they are redundant, and they push the actual module content below the fold so the page appears to be two separate content blocks.

**Secondary defect — the read-only notice pushes the module content down.** `public/inventory.html:87-89` renders an amber notice reading "Inventory is read-only here. Add supply or remove stock from the Supply & Stock page." with a link to `/admin/supply-stock`. It has no `display:none`, so it is visible to **both** Admin and Super Admin, and `applySuperAdminSidebar()` in `public/js/inventory.js` only ever sets its `display` to `''`, which is a no-op. With the summary cards gone, this notice is the last block between the page header and the module content. It restates what the page already conveys, since the page exposes no mutating controls, and Supply & Stock is already listed in the shared sidebar for both roles.

**Tertiary defect — the filter toolbar is a single wrapping flex row.** `SmartFilter` builds one `filter-toolbar__row filter-toolbar__row--main` containing, in DOM order, the Category select, Stock Status select, Date Added range select, Sort select, search field, Reset Filters, and Export. The row wraps opportunistically, so control grouping and the search field's width are incidental rather than designed. Two clarifications against a common misreading of the current UI: **`All Time` is not a separate filter** — it is the first option (`{ key: 'all', label: 'All Time' }`) of the single Date Added range select — and the toolbar is **not** currently two rows.

**Quaternary defect — invalid markup nesting (correctness, not layout).** The div nesting in `public/inventory.html` is malformed in a way that is currently masked by browser error recovery:

- The header wrapper `<div class="mx-auto flex max-w-[1280px] ...">` opened at line 47 is never closed. The header region (lines 45-80) contains 12 `<div>` opens and only 11 `</div>` closes.
- A stray `</div>` at line 133 closes no element opened in its own section and exists only to make the raw tag count balance.

Browsers recover from both: `</header>` at line 80 pops the unclosed wrapper, and the `</div>` at line 133 is a parse error that is silently ignored because the current node is a `<section>`, not a `div`. **The consequence is therefore not a layout shift** — the filters and table still render inside `#main-content` and keep the sidebar offset. The cost is correctness: the file is not valid HTML, the two errors happen to cancel, and any future edit to the header or the list section can break the layout for real. This change fixes the markup as part of removing the summary, because the summary section is the region the stray close sits next to.

## What Changes

- **Remove the Inventory Summary section from the Inventory Management page.** Delete the `<section>` that held the four `stat-card` blocks and their `analytics-section-body` / `analytics-grid` wrappers from the DOM. This is a structural removal, not a CSS `display: none`.
- **Remove the read-only notice entirely.** Delete the `<p id="inventoryReadOnlyNotice">` element, including its amber background, border, text, and the `/admin/supply-stock` link. No replacement message and no leftover container or reserved spacing. Remove `applySuperAdminSidebar()` from `public/js/inventory.js`, which exists only to manipulate that notice, along with its two call sites, while keeping the adjacent comment explaining why this page does not load `admin.js`.
- **Arrange the inventory filter toolbar as a balanced two-row layout.** Scope a new rule to `.filter-toolbar[data-module="inventory"]` (the `data-module` attribute is already emitted by `SmartFilter`) so the first row holds Category, Stock Status, Date Added, and Sort in four equal tracks, and the second row holds the search field spanning two tracks followed by Reset Filters and Export. Mirror the existing `[data-module="registrations"]` precedent at `public/css/admin.css:3523-3565`, and collapse to two tracks with a full-width search below 768px.
- **Repair the header wrapper and the stray close.** Close the `div.mx-auto` wrapper opened at line 47 before the `</header>` end tag, and delete the unmatched `</div>` at line 133, so `<main>` and the Inventory List section are properly nested inside `#main-content`.
- **Retire the conflicting requirements** "Summary cards display in a 4-column row" and "Information banner displays below summary cards" that the unarchived `redesign-inventory-page-layout` change currently mandates.
- **BREAKING (internal)**: the read-only notice is no longer present on the Inventory Management page for either role, so the inline path to Supply & Stock is removed from this page. The shared sidebar still links to Supply & Stock.
- Not changed: the Dashboard (`public/admin.html`, `#analytics`, `public/js/admin.js`), the shared sidebar, the admin header, the "Inventory List" title bar and its styling, the inventory table and its columns, the Books/Modules/Uniforms dataset, role permissions, routes, the shared `SmartFilter` component, and any student-side surface.

## Capabilities

### New Capabilities

None. This change corrects an existing capability's requirements rather than introducing a new subject area.

### Modified Capabilities

- `inventory-page-layout`: the "Summary cards display in a 4-column row" requirement is **removed**; the "Information banner displays below summary cards" requirement is **removed** outright rather than repositioned; requirements are **added** asserting the page renders exactly one module content block with no notice and no summary, that the Inventory List title bar is preserved, that the inventory filter toolbar uses a balanced two-row layout, that filter layout changes are scoped to the inventory module, and that the page markup is well-formed with balanced element nesting.

> **Coordination required.** `redesign-inventory-page-layout` (capability `inventory-page-layout`) and `inventory-page-ui-cleanup` (capability `inventory-overview-layout`) are both still unarchived and contain requirements that directly contradict this change — most explicitly *"The inventory page SHALL display four summary cards"* and *"All existing sections, cards… SHALL remain present."* Those requirements must be retired or those changes re-scoped before this one can be archived, or the specs will conflict. `inventory-overview-layout` describes the Dashboard's `#analytics` overview in `public/admin.html`; it is left untouched here because this change does not modify the Dashboard.

> **Note on the banner copy.** The `redesign-inventory-page-layout` requirement quoted the banner text as "Super admin can review inventory data here, but inventory changes stay read-only." That copy was never implemented; the shipped notice read "Inventory is read-only here. Add supply or remove stock from the Supply & Stock page." This change deletes the notice outright, so reconciling the sibling spec's copy is left to that change.

## Impact

- `public/inventory.html` — remove the summary `<section>` and the `<p id="inventoryReadOnlyNotice">` element; add the missing `</div>` for the header wrapper; remove the stray `</div>`. The Inventory List section becomes the first and only content of `<main>`.
- `public/js/inventory.js` — remove `loadSummary()`, `updateCardStats()`, `formatDate()`, `summaryInFlight`, `applySuperAdminSidebar()` and all their call sites. Note `totalItems` is also a local variable in the pagination helpers (`getPaginatedItems`, `renderPagination`, `applyDisplay`); the pagination local must be left intact.
- `public/css/admin.css` — add a new block scoped to `.admin-page .filter-toolbar[data-module="inventory"]` plus a `max-width: 768px` media query. No existing rule is edited or deleted, so the other ten filter containers are unaffected.
- Unaffected and to be verified as unchanged: `public/admin.html`, `public/js/admin.js`, `public/js/admin-nav.js`, `public/js/admin-filters.js`, `server.js`, `public/css/inventory.css`, and the `data-module` values of every other module's filter config.
- No API, schema, dependency, or route change. `GET /api/auth/inventory/analytics/summary` and the Supply & Stock route are both retained.
- Also noted while investigating, **out of scope**: `public/admin.html` has 110 `<div>` against 109 `</div>`, a separate pre-existing defect on the Dashboard that this change deliberately does not fix. It additionally carries the same unclosed header-wrapper pattern this change repairs in `inventory.html`.

