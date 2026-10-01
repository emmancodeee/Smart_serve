## Context

SMARTSERVE has a two-tier category value system with no normalization bridge:

- **Inventory/stock layer** stores title-case plural categories: `Modules`, `Books`, `Uniforms` (seeder.js, registrationInventoryService.js, inventory.html, inventory.js fallback).
- **Student request layer** stores lowercase singular types: `module`, `uniform`, `books` (returnRequestService.js `validTypes`, feedbackService.js `validCategories`, returns.html/feedback.html option values, returns.js/feedback.js submission code).

The admin filter engine (`admin-filters.js`) already supports option objects `{ value, label }` and function-based `options` via `sfNormalizeOptions()` (admin-filters.js:236). Its live-option helper `distinctFrom()` dedups by lowercase raw value only, so it treats `module` and `Modules` as distinct. Student pages (`returns.html`, `feedback.html`) do **not** load `admin-filters.js` (verified via script tags), so any shared helper placed there is only available to admin pages.

The admin Return Request / Feedback category filters derive options from live records (lowercase singular values) with singular fallbacks (`['Module', 'Uniform', 'Books']`), so the same category is displayed inconsistently across modules. This change canonicalizes the **displayed** options without touching stored values or filter logic.

## Goals / Non-Goals

**Goals:**
- Display the canonical labels **Books**, **Modules**, **Uniforms** (and Feedback's **General**, **Service**) in every category dropdown/filter on both student and admin sides.
- Keep every option's underlying **value** identical to today so filtering results, submission payloads, and server validation are byte-for-byte unchanged.
- Guarantee a category can never appear twice in one dropdown under different spellings.
- Normalize display-only category labels elsewhere (dashboard step tab, admin detail/column labels) so the same category reads the same everywhere.

**Non-Goals:**
- No database/data migration, no inventory record changes, no service/validator changes.
- No new categories, no removal of valid unique categories (Electronics/Stationery/Other, General/Service).
- No changes to status, condition, priority, unit-of-measure, or other non-category dropdowns (they contain no singular/plural duplicates today).
- No priority-scale changes (returns use `urgent`; announcements use `critical` — different scales, not duplicates).

## Decisions

**D1 — Value-preserving label canonicalization.**
Map raw category values to canonical display labels through a label map while keeping the raw value as the select's option value. Example: `{ value: 'module', label: 'Modules' }`, `{ value: 'uniform', label: 'Uniforms' }`, `{ value: 'books', label: 'Books' }`, `{ value: 'general', label: 'General' }`, `{ value: 'service', label: 'Service' }`. The engine already renders `{value,label}` options correctly (admin-filters.js:236-241), and the existing filters compare values lowercase (admin-returns.js:91, admin-feedback.js:72), so results are unchanged.
- *Alternative rejected*: canonicalize the stored values to `Modules`/`Uniforms` in options AND update the filter functions to match both spellings. This changes filter-matching behavior and risks mismatching legacy rows, violating "do not change existing functionality".

**D2 — Where the canonicalization logic lives.**
- Admin filters (`admin-returns.js`, `admin-feedback.js`): add a shared `ITEM_CATEGORY_LABELS` map and a small `buildCategoryFilterOptions(values, fallback)` helper in `admin-filters.js`, exported on `SmartFilter`. Both admin config files source options through it.
- Student pages: `admin-filters.js` is not loaded, so define an equivalent local label map in `returns.js` and `feedback.js` for display-text rendering (options in the rendered HTML keep their current values).

**D3 — Duplicate-proof option building.**
The helper collects raw category values from records, maps each to its canonical label, and dedupes **by label**; for each label it keeps the raw value that occurs most frequently (so the option value matches the majority of records). Fallback lists produce the same canonical labels with the current stored values as values. This collapses `module` + `Modules` into a single **Modules** option while keeping filtering correct for the dominant raw spelling.

**D4 — Student form selects: display text only.**
In `returns.html`, `returns.js` (addItem template), and `feedback.html`, change the `<option>` **text content** to the canonical label but leave the `value` attributes (`module`, `uniform`, `books`, `general`, `service`) untouched. Submission code reads `.value` (returns.js collectItems, feedback.js formData.get('category')), so payloads and validation are unaffected.

**D5 — Display-label consistency (index-safe).**
Verified that dashboard step tabs/panels are wired by `data-step-tab`/`data-step-panel` indices and `REGISTRATION_STEPS` is only used for `.length`/index arithmetic (dashboard.js:1263-1291). Therefore renaming the visible label `Uniform` → `Uniforms` in `REGISTRATION_STEPS`, the step-tab button, the metric/detail card labels (dashboard.js:1235,1256), the admin registration-detail label (admin.js:2616), and the admin column header (admin.js:4289) is safe and purely cosmetic.

**D6 — Leave `distinctFrom` and all non-category filters untouched.** Only the category option builder changes.

## Risks / Trade-offs

- [Mixed-case legacy records (`module` and `Modules` in the same dataset)] → dedupe-by-label keeps the most frequent raw value, so the option value matches the dominant records; worst case, minority-spelling rows are reachable via the remaining spelling edge, which today does not exist (each source uses one consistent case).
- [A displayed label changing without a value change could confuse any label-text lookups] → audited: no code matches these select options by label text.
- [Dashboard/admin label renames could look out of place if backend returns "Uniform"] → these labels are hardcoded display text, not derived from the backend; verified.
- Low functional risk: the change is confined to option rendering and display text.

## Migration Plan

- Single deploy of front-end files only; no data or backend migration.
- Rollback: restore the affected files. Because stored values never change, reverting restores prior display immediately.