## Why

Inventory/resource categories (Uniforms, Modules, Books) are displayed inconsistently across the Smart Serve Admin interface: the Inventory Management category column renders an unstyled `badge-*` span with no CSS, Feedback Management shows every category as the same Bootstrap `bg-info` blue, Request Management shows module/uniform as plain text, and Announcements display category as plain text. There is no shared badge style or category-color mapping, so the same resource type looks different on every page.

## What Changes

- Introduce a single reusable category badge: a compact, fully-rounded pill rendered through one shared CSS style (`.category-badge`) and one shared JS mapping function exposed on `SmartFilter` (in `public/js/admin-filters.js`), so every page uses the exact same colors, shape, and label canonicalization.
- Apply the badge in the four admin surfaces that display a resource category:
  - **Inventory Management** table category cell — replace the broken/unstyled `badge-*` span with the category badge.
  - **Feedback Management** table Category column and category detail — replace the always-blue Bootstrap `bg-info` badge with the per-category badge.
  - **Request Management** table — render the Module/Code value as a Modules badge and the Uniform Type value as a Uniforms badge, keeping the request status badge unchanged.
  - **Announcements** table — render a category badge only when the announcement category value maps to a resource category (Uniforms/Modules/Books); otherwise keep the existing neutral plain-text display.
- Category color rules (exact, reused everywhere):
  - Uniforms / Uniform → background `#22C1E8`, text `#FFFFFF`
  - Modules / Module → background `#315FE8`, text `#FFFFFF`
  - Books / Book → background `#F5B800`, text `#111827`
- Normalize stored category values (`uniform`/`uniforms`, `module`/`modules`, `book`/`books`, any case) to the canonical labels Uniforms / Modules / Books, reusing the existing `SmartFilter.ITEM_CATEGORY_LABELS` canonical label map.
- Non-resource or unknown categories (Electronics, Stationery, Other, General, Service, announcement categories, etc.) keep their existing neutral/default display — they must never be tinted with a resource color.
- No redesign: header, sidebar, layout, typography, spacing, table structure, filters, buttons, and the separate status colors (Pending/Approved/Rejected/Archived and inventory in-stock/low-stock) are untouched.

## Capabilities

### New Capabilities
- `category-colors`: The shared category badge visual system for the Admin interface — the `.category-badge` pill style, the exact Uniforms/Modules/Books color mappings, value normalization to canonical labels, and the rule that unknown/other categories keep their existing neutral display.

### Modified Capabilities
<!-- None: no existing spec requirements change. -->
- (none)

## Impact

- `public/js/admin-filters.js` — add `SmartFilter.categoryBadge(value)` returning `{ className, label }` for Uniforms/Modules/Books (reusing `ITEM_CATEGORY_LABELS`) or `null` for anything else.
- `public/css/admin.css` — add the `.category-badge` base pill + `--uniforms`, `--modules`, `--books` color modifiers (loaded by every admin page).
- `public/js/inventory.js` — category cell (~line 584) uses the shared badge; plain fallback otherwise.
- `public/js/admin-feedback.js` — Category cell (~line 122) and detail modal (~line 200) use the shared badge; existing `bg-info` fallback for unknown categories.
- `public/js/requests-management.js` — Module/Code and Uniform Type cells (~lines 116-117) render Modules/Uniforms badges; status badges untouched.
- `public/js/admin.js` — announcements category cell (~lines 2287-2288) renders a badge only when the value maps to a resource category.
- `public/admin-requests.html` — add `<script src="/js/admin-filters.js">` before `js/requests-management.js` so the shared mapping is available (inventory/feedback/admin already load it).
- No backend/API changes, no new dependencies.