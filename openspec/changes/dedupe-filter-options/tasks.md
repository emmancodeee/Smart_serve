## 1. Shared Canonicalization Helper (admin-filters.js)

- [x] 1.1 Add an exported `ITEM_CATEGORY_LABELS` map in `public/js/admin-filters.js` mapping lowercase raw category values to canonical labels (module→Modules, modules→Modules, uniform→Uniforms, uniforms→Uniforms, book→Books, books→Books, general→General, service→Service).
- [x] 1.2 Add a `buildCategoryFilterOptions(rawValues, fallbackValues)` helper in `admin-filters.js` that maps each raw value to its canonical label, dedupes by label (keeping the most frequent raw value as the option value), returns `{ value, label }` objects, and uses canonical-labeled fallback objects when no raw values exist.

## 2. Admin Filter Configs (canonical category options)

- [x] 2.1 `public/js/admin-returns.js` (RETURN_FILTER_CONFIG category options): build options through the shared helper from `returnCategoriesOf(record)` values, with fallback `['module', 'uniform', 'books']`; verify the category filter function (line ~91) still matches lowercase raw values unchanged.
- [x] 2.2 `public/js/admin-feedback.js` (FEEDBACK_FILTER_CONFIG category options): build options through the shared helper from `allFeedbacks` categories, with fallback `['module', 'uniform', 'books', 'general', 'service']`; verify the category filter (line ~72) still matches lowercase raw values unchanged.

## 3. Student Form Selects (display labels canonical, values preserved)

- [x] 3.1 `public/returns.html`: change the item-type `<select>` option text to `Modules`, `Uniforms`, `Books` while keeping `value="module"`, `value="uniform"`, `value="books"`.
- [x] 3.2 `public/js/returns.js` (addItem template): same value/label split for the dynamically-added item type selects.
- [x] 3.3 `public/feedback.html`: change the category `<select>` option text to `Modules`, `Uniforms`, `Books`, `General`, `Service` while keeping the existing `value` attributes.

## 4. Display-Label Consistency (cosmetic, index-safe)

- [x] 4.1 `public/js/dashboard.js`: change `REGISTRATION_STEPS` entry `'Uniform'` → `'Uniforms'` and update metric/detail card labels at lines ~1235 and ~1256.
- [x] 4.2 `public/dashboard.html`: change the step-tab button text `Uniform` → `Uniforms` (data-step-tab="4").
- [x] 4.3 `public/js/admin.js`: change registration-detail label `'Uniform'` → `'Uniforms'` (line ~2616) and the table column header label `'Module'` → `'Modules'` (line ~4289).

## 5. Tests & Verification

- [x] 5.1 Add a unit test in `tests/admin-filters.test.js` for `buildCategoryFilterOptions` asserting canonical labels are produced, singular/plural raw values collapse to one option, and the option value matches the dominant raw spelling.
- [x] 5.2 Run `npm test` (jest) and confirm no regressions beyond the pre-existing unrelated failures.
- [x] 5.3 Manually verify Item Category dropdowns on returns, feedback, inventory, analytics, and the student return/feedback forms each display only canonical labels (Books/Modules/Uniforms, plus General/Service on feedback) and that filtering still works.