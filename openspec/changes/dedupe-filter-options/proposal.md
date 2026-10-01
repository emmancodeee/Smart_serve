## Why

The same item categories are shown under different singular/plural spellings across the Student and Superadmin system. Return Request and Feedback items are stored lowercase and singular (`module`, `uniform`, `books`), so their admin filters and student forms display `module`/`Module` and `uniform`/`Uniform`, while Inventory, Analytics, the seeder, and the inventory database use `Modules` and `Uniforms`. Fallback option lists such as `['Module', 'Uniform', 'Books']` (admin-returns.js, admin-feedback.js) reinforce the singular variants. The result: one category appears as both "Module" and "Modules" in different dropdowns, and the same value is presented twice under singular/plural versions that refer to the same thing.

## What Changes

- Establish one canonical display set for item categories used by every dropdown and filter: **Books, Modules, Uniforms** (plus "All Item Category" for filters; Feedback's `General`/`Service` remain as valid distinct options).
- Normalize the Return Request and Feedback admin filter category dropdowns (`admin-returns.js`, `admin-feedback.js`): keep the stored filter **value** (`module`/`uniform`/`books`) so existing filter logic and results are unchanged, but display the canonical labels **Modules**, **Uniforms**, **Books** (and **General**, **Service** for feedback).
- Replace the singular fallback option lists (`['Module', 'Uniform', 'Books']` and `['Module', 'Uniform', 'Books', 'General', 'Service']`) with canonical-label options.
- Update the student-facing item type / category selects (`returns.html` + `returns.js` add-item template, `feedback.html`): display **Modules**/**Uniforms**/**Books** (and General/Service) while preserving the submitted option **values** so server validation and stored data are untouched.
- Guard live option building against duplicates: group raw category values by canonical label so the same category can never appear twice in one dropdown (e.g., `module` and `Modules` collapse to a single **Modules** option).
- Normalize remaining display-only category labels for cross-module consistency: dashboard registration step tab **Uniform** → **Uniforms** (dashboard.html, dashboard.js `REGISTRATION_STEPS` and metric card labels), admin registration-detail label and table column header **Module** → **Modules**.
- No database writes, no inventory/record deletion, no service validation changes, and no filter-behavior changes.

## Capabilities

### New Capabilities
- `category-option-consistency`: Canonical item-category option display (Books, Modules, Uniforms) in every filter and dropdown across the student and admin system, with stable stored filter values and no duplicate singular/plural options.

### Modified Capabilities
- `admin-filters`: The Return Request and Feedback category filter options now surface canonical plural labels while preserving their existing stored values and filtering behavior; duplicate singular/plural fallbacks are removed.

## Impact

- **Files modified**: `public/js/admin-filters.js` (shared label map + option helper), `public/js/admin-returns.js`, `public/js/admin-feedback.js`, `public/returns.html`, `public/js/returns.js`, `public/feedback.html`, `public/js/dashboard.js`, `public/dashboard.html`, `public/js/admin.js`.
- **Tests**: `tests/admin-filters.test.js` regression-checked; add coverage for the canonical category option mapping.
- **Backend**: no changes — services, validators, API endpoints, and MongoDB values stay as-is.
- **Data**: no migration; storage format of `module`/`uniform`/`books` (returns/feedback) and `Modules`/`Uniforms`/`Books` (inventory) is preserved.
- **Dependencies**: none added.