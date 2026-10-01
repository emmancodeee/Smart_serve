## 1. Suppress the native autocomplete dropdown

- [x] 1.1 In `public/js/admin-filters.js`, add `autocomplete: 'off'`, `autocorrect: 'off'`, and `spellcheck: 'false'` to the search input created in `build()` (admin-filters.js:730-734, the `sfEl('input', { type: 'search', ... })` call) so the browser can never render its native autofill/autocomplete popup for any SmartFilter search field.
- [x] 1.2 Confirm the change is minimal: no other JS behavior is altered (the `input`/`keydown` handlers, placeholder, aria-label, and `filter-control__input--search` class are unchanged), and no suggestion/dropdown element is added anywhere.

## 2. Deliver the fix to the browser

- [x] 2.1 Add `?v=<sha256-prefix>` to the `<script src="/js/admin-filters.js">` tag in `public/admin.html` (line 521) so the browser fetches the updated file instead of a stale cached copy; recompute and update the hash whenever admin-filters.js changes.
- [x] 2.2 Confirm `public/request-management.html`-level legacy pages that include their own raw `type="search"` inputs are not in the admin script's runtime path (the registrations toolbar is exclusively SmartFilter-built), so no other input needs the attributes.

## 3. Verify

- [x] 3.1 Static check: grep `public/js/admin-filters.js` for `autocomplete: 'off'` / `autocorrect: 'off'` / `spellcheck: 'false'` inside the search input creation, and confirm `public/css/admin.css` was not modified by this change (no overlay/z-index rules added).
- [x] 3.2 Run `npm test` and confirm the result matches the baseline (1 failing suite `tests/admin-filters.test.js`, 1 passing suite; 5 failed, 14 passed; no new failures caused by this change).
- [ ] 3.3 Manual browser check on Admin > Request Management (reload so the `?v=` script tag fetches fresh JS): click/focus the Search field with text in it — NO native autofill/autocomplete dropdown appears; All Time, Sort, Reset Filters, Export, and all Row 1 controls do NOT move, resize, or realign; the two rows keep their shared edges; the container height/position is unchanged. Type a query and confirm the table still filters; click away and confirm no layout jump. Repeat on one other admin list with a search field (e.g., Users) to confirm consistent behavior.