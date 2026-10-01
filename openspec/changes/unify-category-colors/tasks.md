## 1. Shared Category Badge System

- [x] 1.1 In `public/js/admin-filters.js`, add `SmartFilter.categoryBadge(value)` returning `{ className, label }` for Uniforms/Modules/Books (canonical label derived by reusing `ITEM_CATEGORY_LABELS`) or `null` for any other/empty value
- [x] 1.2 In `public/css/admin.css`, add the shared `.category-badge` pill base style plus `.category-badge--uniforms` (`#22C1E8`, white text), `.category-badge--modules` (`#315FE8`, white text), and `.category-badge--books` (`#F5B800`, `#111827` text) — fully rounded, compact, centered, no border/gradient/shadow

## 2. Apply Badges per Admin Surface

- [x] 2.1 Inventory Management (`public/js/inventory.js` category cell ~577-584): when `SmartFilter.categoryBadge(item.category)` is non-null render `<span class="category-badge ...">label</span>`, otherwise keep the existing plain neutral category text; remove the broken `badge badge-${slug}` markup
- [x] 2.2 Feedback Management (`public/js/admin-feedback.js` table ~122 and detail modal ~200): render the `.category-badge` when mapped, otherwise keep the existing `badge bg-info` neutral fallback; do not touch the Actions buttons
- [x] 2.3 Request Management (`public/js/admin-requests.html` + `public/js/requests-management.js` ~116-117): add `<script src="/js/admin-filters.js">` before `js/requests-management.js`, render a Modules badge around the module value and a Uniforms badge around the uniform type value, preserving `-`/moduleCode fallbacks and the status badge unchanged
- [x] 2.4 Announcements (`public/js/admin.js` category cell ~2287-2288): render the `.category-badge` only when `SmartFilter.categoryBadge(item?.category)` is non-null; otherwise keep the existing `safeText(item?.category, 'General')` plain display

## 3. Verification

- [x] 3.1 Grep all admin JS: no status/action element uses `.category-badge` colors and no surface hard-codes a category color to a specific record; the three colors appear only in `admin.css` modifiers and the shared mapping
- [x] 3.2 Grep to confirm other/unknown category values (Electronics, Stationery, Other, General, Service, announcement categories) are not tinted anywhere
- [x] 3.3 Run `node --check` on every edited JS file (`admin-filters.js`, `inventory.js`, `admin-feedback.js`, `requests-management.js`, `admin.js`)
- [x] 3.4 Add a temporary jest smoke test asserting `SmartFilter.categoryBadge` normalizes all six stored forms to the three canonical labels/classes and returns null for unknown values, plus that the four surfaces reference the shared badge; run it, then remove the temp test
- [x] 3.5 Run `npm test` and confirm no regression (baseline: 1 suite failed, 1 passed; 5 failed, 14 passed — pre-existing admin-filters failures)
- [ ] 3.6 Manual browser check (Inventory, Feedback, Request Management, Announcements): badges show the exact colors, unknown categories stay neutral, status colors and buttons unchanged, layouts unchanged