## Why

On Admin > Request Management > Pending Registrations, focusing the "Search registrations..." field opens the browser's **native autofill/autocomplete dropdown** (previously-typed values such as course names like "BS Business Administration"). That native overlay shifts the whole filter layout while open — Sort, Reset Filters, and Export appear to move, the Search field looks separated from its row, and the container reads as misaligned. There is no custom suggestion component in the code; the search input is a plain `<input type="search">` (admin-filters.js:730). The layout must stay fixed no matter what, and the native dropdown that causes the shift must be eliminated.

## What Changes

- Suppress the browser's native autofill for the Search field so no suggestion dropdown can ever open and shift the filter layout: the SmartFilter search input gains `autocomplete="off"`, `autocorrect="off"`, and `spellcheck="false"` in `public/js/admin-filters.js`.
- Because SmartFilter builds every module's search input from the same code, this applies consistently to all admin search fields (registrations, users, transactions, pickup, accounts, announcements); no module-specific behavior changes.
- Add a `?v=` cache-buster to the `admin-filters.js` script tag in `public/admin.html` so the fix is fetched instead of a stale cached copy.
- No CSS changes are required to remove the dropdown: the layout already does not move once no native popup can render. No new suggestion/dropdown UI is added — the native autofill list is removed entirely (per decision), so nothing can overlay, reflow, or push the grid.
- No changes to filter options, search behavior, the table, position of the filter section, sidebar, header, colors, typography, or any other Request Management functionality.

## Capabilities

### New Capabilities

- `request-filter-layout`: The Request Management registrations filter toolbar's layout-stability behavior when its Search field receives focus (this extends the same capability drafted in the `fix-request-filter-alignment` / `reorganize-request-filter-layout` / `center-request-filter-layout` changes, which never reached the main specs).

### Modified Capabilities

- None.

## Impact

- `public/js/admin-filters.js` — the `build()` search input creation (admin-filters.js:730-744): add `autocomplete="off"`, `autocorrect="off"`, `spellcheck="false"`. Affects every SmartFilter consumer's search input (shared builder), all consistent with each other.
- `public/admin.html` — add `?v=<hash>` to the `admin-filters.js` script tag (line 521) to bypass stale JS caching.
- No API, data, dependency, or `admin.css` changes.
- Search/filtering/table functionality is unchanged.