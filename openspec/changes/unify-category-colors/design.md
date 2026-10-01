## Context

Smart Serve stores three inventory/resource categories (Uniforms, Modules, Books) plus others, but the Admin pages render them inconsistently:

- **Inventory Management** (`public/js/inventory.js:584`) emits `<span class="badge badge-${safeCategoryClassName}">` — the `badge-*` classes have **no CSS**, so category is effectively plain text. `safeCategoryClass()` (64-68) lowercases/strips the value; an unused `getCategoryClass()` (78-87) and an unused `.cat-badge.*` pill family (`inventory.css:429-466`) predate this change.
- **Feedback Management** (`public/js/admin-feedback.js:122`) renders `<span class="badge bg-info">` — Bootstrap blue for **every** category. Detail modal (line 200) shows plain text. Stored values are lowercase/singular (`module`, `uniform`, `books`).
- **Request Management** (`public/js/requests-management.js:116-117`) renders Module/Code and Uniform Type as plain text with `-` fallbacks; there is no Category column.
- **Announcements** (`public/js/admin.js:2287-2288`) renders category as plain text; the announcement domain has its own categories (General/Enrollment/Events, free-text input) that are NOT resource categories.
- Shared utility `public/js/admin-filters.js` already exposes `SmartFilter.ITEM_CATEGORY_LABELS` (canonicalizes `module|modules`→Modules, `uniform|uniforms`→Uniforms, `book|books`→Books, plus general/service). It is declarative (no DOM init on load) and is already loaded by `admin.html`, `inventory.html`, `admin-feedback.html`, `admin-returns.html` — but **not** by `admin-requests.html`.
- Every admin page loads `/css/admin.css` (or `css/admin.css` on admin-requests), making it the single natural home for the shared badge style.

Constraints: categories map dynamically from the value (never hard-coded per record); the badge applies only to resource-category displays; unknown/other categories keep the existing neutral display; status colors (Pending/Approved/Rejected/Archived, in-stock/low-stock) are untouched.

## Goals / Non-Goals

**Goals:**
- One shared `.category-badge` CSS style and one shared mapping function, reused by all four target surfaces.
- Exact colors: Uniforms `#22C1E8`/white, Modules `#315FE8`/white, Books `#F5B800`/`#111827`, in a compact fully-rounded pill with no border/gradient/shadow.
- Dynamic normalization of `uniform`/`uniforms`, `module`/`modules`, `book`/`books` (any case) to canonical labels, reusing `ITEM_CATEGORY_LABELS`.
- Preserve every existing layout, style, filter, button, and status color.

**Non-Goals:**
- No changes to student-facing pages (`feedback.html`, `announcement.html`, `profile.html`, `returns.html`, dashboard).
- No badges invented where no category is displayed (Registration Summary item lists, registration detail modal field labels, analytics charts, inventory stat counts) — see Decisions D5.
- No color applied to announcement-domain categories (General/Enrollment/Events) or unknown values.
- No change to the inventory `Add/Edit` category select values, existing filters, sort, or export columns.
- No removal/repurposing of the dead `.cat-badge` CSS or `getCategoryClass()` (left untouched; see Risks).

## Decisions

### D1 — Reusable mapping: `SmartFilter.categoryBadge(value)` in `public/js/admin-filters.js`
Add one function to the existing shared utility:
```
SmartFilter.categoryBadge = function (value) {
  const key = String(value ?? '').trim().toLowerCase();
  const label = ITEM_CATEGORY_LABELS[key] || '';
  if (label !== 'Uniforms' && label !== 'Modules' && label !== 'Books') return null;
  return { className: 'category-badge--' + label.toLowerCase(), label };
};
```
- Reuses `ITEM_CATEGORY_LABELS` (no duplicate canonical map; single source of truth for labels).
- Returns `null` for General/Service/Electronics/Stationery/Other/empty so callers fall back to the existing neutral display.
- *Alternatives considered:* a new standalone `category-colors.js` shared file — rejected because `admin-filters.js` is already the shared helper loaded by four of five admin pages and adding it to the fifth (`admin-requests.html`) is one line; a per-file inline map — rejected (duplicates logic, violates the reuse requirement).

### D2 — Shared style: `.category-badge` in `public/css/admin.css`
```
.category-badge {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px; border: 0;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem; font-weight: 600; line-height: 1.25rem;
  white-space: nowrap;
}
.category-badge--uniforms { background-color: #22C1E8; color: #ffffff; }
.category-badge--modules  { background-color: #315FE8; color: #ffffff; }
.category-badge--books    { background-color: #F5B800; color: #111827; }
```
Sizes the pillow to the existing `text-xs` table cells (small vertical / medium horizontal padding), no gradient/shadow. Every admin page loads `admin.css`, so this is the single reusable style.
- *Alternatives considered:* activating the dead `.cat-badge.*` family in `inventory.css` — rejected: it is inventory-scoped (not loaded on all pages), uses the wrong palette (light blue/purple/amber), and would be a second home for category styling; pointing it at the new colors would make the CSS location inconsistent with the "shared" goal.

### D3 — Surface wiring
- **Inventory** (`inventory.js`, category cell ~577-584): compute `const catBadge = SmartFilter.categoryBadge(item.category)`; if non-null render `<span class="category-badge ${catBadge.className}">${catBadge.label}</span>` (escape the label), else render the existing plain `<span>${safeCategory}</span>`. Drop the now-unused `badge badge-${safeCategoryClassName}` markup (leave the `safeCategoryClass` function in place, harmless).
- **Feedback admin** (`admin-feedback.js:122` and modal `:200`): if non-null render `.category-badge`, else keep the existing `<span class="badge bg-info">…</span>` (the established neutral fallback on that page).
- **Request Management** (`requests-management.js:116-117`): Module/Code cell wraps `req.module` in a Modules badge (`category-badge('module')` is constant for this column) and Uniform Type cell wraps `req.uniformType` in a Uniforms badge, preserving the `-` / `req.moduleCode` fallbacks. The status badge stays untouched.
- **Announcements** (`admin.js:2287-2288`): only when `SmartFilter.categoryBadge(item?.category)` is non-null render a `.category-badge`, otherwise keep `categoryCell.textContent = safeText(item?.category, 'General')` (neutral).

### D4 — Load the shared helper on admin-requests
Add `<script src="/js/admin-filters.js"></script>` before `js/requests-management.js` in `admin-requests.html` (mirrors other admin pages). `admin-filters.js` is declarative and defines only globals/functions, so it initializes nothing on pages without filter bars.

### D5 — Deliberate exclusions (why some "category-ish" surfaces are left alone)
- **Registration Summary** cells and the registration **detail modal** (Modules/Books/Uniforms field labels): these display item lists/counts and data-field labels, not category badges; adding pills would invent new UI and conflict with "do not redesign". Excluded.
- **Announcement-domain** categories (General/Enrollment/Events) are a different taxonomy; only literal Uniforms/Modules/Books values get the badge (covers the free-text case the user described).
- **Analytics** category charts stay as bars/labels; **stats cards** stay as counts.

### D6 — Status isolation
The palette (#22C1E8 cyan, #315FE8 blue, #F5B800 gold) is disjoint from the existing status pill colors (emerald/red/amber registration statuses, Bootstrap `bg-success/warning/danger`, inventory stock dots). No status/action element references `.category-badge`.

## Risks / Trade-offs

- [Requests Module/Code column shows a Modules-colored badge around free-text module names] → Intentional per the requirement ("wherever request information displays a resource category"); the module column semantically represents Modules. Uniform Type → Uniforms is unambiguous.
- [Feedback unknown categories keep `bg-info` blue, which could resemble the Modules blue] → Required by "keep existing neutral/default style for other categories"; `#315FE8` and Bootstrap `bg-info` are visibly different; acceptable.
- [Dead `.cat-badge` / `getCategoryClass()` remain unreferenced] → Harmless leftovers; removing them is out of scope to keep the diff focused.
- [Regression in the four page scripts] → `node --check` each edited file + a temporary jest smoke test + manual browser verification in the tasks.
- [admin-filters.js added to admin-requests page] → it is declarative (no auto DOM init); verified at load with node/jest and a browser visit in the tasks.

## Migration Plan

Static assets only: deploy edited `admin-filters.js`, `admin.css`, `inventory.js`, `admin-feedback.js`, `requests-management.js`, `admin.js`, and `admin-requests.html`. Rollback is a git revert; no data migration, no API changes.

## Open Questions

None blocking. (Cosmetic: whether unknown categories should one day share a neutral gray badge instead of page-specific fallbacks — deferred, would require design approval and is out of scope.)