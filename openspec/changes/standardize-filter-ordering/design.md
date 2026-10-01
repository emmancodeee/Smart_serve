## Context

SMARTSERVE's filtering UI comes from two sources:

1. **Shared filter engine** (`public/js/admin-filters.js`, `SmartFilter.create`) which renders a toolbar for 10 admin modules (inventory, returns, transactions, announcements, feedback, users, registrations, pickup confirmations, admin accounts, analytics). Its `build()` currently renders **Search first**, then field selects in `config.fields` array order, then the Date Range preset control, the sort select, and the Reset/Export buttons.
2. **Static filter markup**: the student Announcements sidebar (`public/announcement.html`) renders Search → Category → Timeframe → Sort → Clear; Uniform Request Management (`public/admin-requests.html`) renders Status → Module Code → Search → buttons.

The desired rule everywhere is **Item Category → other filters → Search last**. Today category controls appear wherever the config places them (Return Request has Status before Item Category; Analytics has Item Category after Course/Year Level), and Search is always first. No filter's options, labels, data sources, or behavior should change — only control order.

## Goals / Non-Goals

**Goals:**
- Enforce Item Category first (when present), other controls after, Search last on every page with filters.
- Achieve this with a single engine change plus per-config field reordering and two static-markup reorders.
- Keep the order intact when the toolbar wraps onto multiple rows on narrow screens.
- Keep all filter options, labels, styling, and functionality identical; zero backend changes.

**Non-Goals:**
- No new filters, no renamed filters, no duplicated filters, no removed filters.
- No color/design/layout/header/sidebar changes.
- No changes to filter data sources or filtering logic.
- No search box added where none exists (Analytics); no Item Category added where none exists.

## Decisions

**D1 — Search is moved last in the shared engine.**
In `SmartFilter.create`'s `build()` (`public/js/admin-filters.js:649`), relocate the search-input block from the top of the toolbar (currently line 654) to after the sort-select block (line 689) and before the Reset Filters button (line 705). The final toolbar order is: category fields → other field selects → Date Range → Sort → **Search** → Reset → Export.
- *Why*: a single change covers every engine-based module and prevents regression; per-module overrides would be duplicated and error-prone.
- *Alternative considered*: re-order search in each module's HTML/template — rejected as duplication.

**D2 — Category-first is expressed in each module's `config.fields` array.**
The engine already renders main fields in config array order (`admin-filters.js:446`, `mainFields = fields.filter(...)`). Reorder the `fields` array so the category field is first in every module that has one:
- `public/js/admin-returns.js` (RETURN_FILTER_CONFIG): `status→category→reason→dateRange` becomes `category→status→reason→dateRange`.
- `public/js/admin.js` Analytics config: `dateRange→course→yearLevel→itemCategory→inventoryStatus` becomes `itemCategory→course→yearLevel→inventoryStatus→dateRange`.
- Modules whose category field is already first (inventory.js, admin-feedback.js, admin.js announcements) are already compliant — no config change.
- Modules without a category field (transactions, users, registrations, pickup confirmations, admin accounts) keep their field order unchanged.
- *Why*: explicit, greppable, and consistent with how the engine already orders controls.
- *Alternative considered*: engine auto-promotes any field keyed `category`/`itemCategory` — rejected as implicit magic that would desync configs from rendered order and complicate the field-index mapping used in `tests/admin-filters.test.js`.

**D3 — Static pages reorder manually.**
- `public/announcement.html` (student sidebar): move the Search block (currently first) to just before the Clear Filters button. Result: Category → Timeframe → Sort → **Search** → Clear Filters. Audit `public/js/announcement.js` for any index-based selection that assumes Search is first.
- `public/admin-requests.html`: search is already the final filter control (Status → Module Code → Search → Search button → Reset button) — verify only, no change expected.

**D4 — Responsive wrapping is already correct, no CSS changes.**
The toolbar row uses flex-wrap (`.filter-toolbar__row--main`); DOM order is preserved when flex items wrap, so moving the search node keeps the intended order on wrapped rows. Add/extend a test rather than CSS.

**D5 — Tests.**
`tests/admin-filters.test.js` asserts existence via classes (not positions) and selects fields by config index, so moving Search does not break existing assertions (the test config also has `category` already first). Add one regression test asserting DOM order: the category select renders before other selects and `.filter-control__input--search` renders after all `.filter-control__select` controls.

## Risks / Trade-offs

- [Module JS that references controls positionally (firstChild / index-based queries) may break when Search moves] → audit `announcement.js`, `inventory.js`, `admin.js`, `admin-returns.js`, `admin-feedback.js` for selectors that assume Search is the first toolbar child; keep control lookups class/id-based.
- [The `selectField` helper in tests maps config index → `.filter-control__select` DOM node; a config-level reorder changes that mapping] → helper derives the index from `filter.getConfig().fields`, so it stays correct as long as tests are updated/re-run; the warehouse regression test only asserts order, not index positions.
- [Dual-rendered date control (engine quirk) could obscure order assertions] → assert relative order of category select vs. other field selects and that the search input is the last filter control, ignoring the date placeholder duplication.
- Low functional risk: filtering/searching logic is untouched; visual-first only.

## Migration Plan

- Single deploy: edit `admin-filters.js` (search last), reorder two config arrays, reorder student-announcements markup, update tests.
- Revert by restoring the affected files; no data or backend artifacts involved.