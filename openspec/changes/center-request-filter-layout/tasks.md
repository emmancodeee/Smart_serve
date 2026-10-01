## 1. CSS: Center and rebalance the registrations filter (`public/css/admin.css`)

- [x] 1.1 Change the registrations grid to six equal tracks so Row 1's five equal controls occupy tracks 1-5 and Row 2 fills all six tracks with a wide Search (shared outer edges, no third row):
  ```css
  .admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
    align-items: center;
  }
  ```
- [x] 1.2 Add the desktop-wide Search rule scoped to the registrations row so Search spans two of the six tracks and its placeholder fits:
  ```css
  .admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main .filter-control--search {
    grid-column: span 2;
  }
  ```
- [x] 1.3 Keep the width/insets rule so every control fills its grid cell and can never change size on selection (unchanged from current block):
  ```css
  .admin-page .filter-toolbar[data-module="registrations"] .filter-control,
  .admin-page .filter-toolbar[data-module="registrations"] .filter-btn,
  .admin-page .filter-toolbar[data-module="registrations"] .smart-combobox__button,
  .admin-page .filter-toolbar[data-module="registrations"] .filter-control__select,
  .admin-page .filter-toolbar[data-module="registrations"] .filter-control__input {
    min-width: 0;
    width: 100%;
  }
  ```
- [x] 1.4 Keep the registrations toolbar vertically centered in its box (`margin-bottom: 0`) and the responsive ≤768px collapse with full-width Search (`grid-column: 1 / -1; max-width: none`) from the current block — update the block's header comment to describe Row 2 = All Time | Sort | Search (span 2) | Reset Filters | Export.
- [x] 1.5 Confirm the block is still purely additive and scoped: every rule stays under `.filter-toolbar[data-module="registrations"]`; no shared `.filter-toolbar*` rule, admin-page override, JS/HTML, or other module's style is modified.

## 2. Verify

- [x] 2.1 Static/harness check: confirm `#registrationsFilterContainer` still carries `filter-toolbar` + `data-module="registrations"` (admin-filters.js:707-708), the row class is `.filter-toolbar__row--main` (admin-filters.js:706), and a headless jsdom mount of the real toolbar yields exactly ten controls in DOM order `status, course, yearLevel, studentType, date-field, date-preset, sort, search, reset, export` (so auto-placement produces the intended 5+5 rows). grep admin.css to confirm `repeat(6, minmax(0, 1fr))`, the scoped `span 2` search rule, no scoped `span 3+`, and the ≤768px collapse.
- [x] 2.2 Confirm `public/js/admin.js`, `public/js/admin-filters.js`, and `public/admin.html` were not functionally modified by this change (only the `?v=` cache-buster value may change in admin.html); bump the cache-buster to the new admin.css hash so the browser is forced to fetch the updated stylesheet.
- [x] 2.3 Run `npm test` and confirm the result matches the pre-change baseline (1 failing suite `tests/admin-filters.test.js`, 1 passing suite; 5 failed, 14 passed; no new failures caused by this change).
- [ ] 2.4 Manual browser check on Admin > Request Management: the filter section spans and is centered in the content area, aligned with the Pending Registrations section edges, with equal-looking margins and no sidebar overlap; Row 1 = All Status | Year/Category | All Year Level | All Student Type | All Date (five equal controls); Row 2 = All Time | Sort | Search (wider) | Reset Filters | Export sharing the same left/right edges; Search shows the full placeholder; Export stays on Row 2; exactly two rows at desktop.
- [ ] 2.5 Manual state/behavior check: selecting each status, course, year level, student type, date/preset, sort, and search text never moves, resizes, collapses, or misaligns the filter section; Status lists only All Status/Pending/Approved/Rejected (no "Archived"); Reset and Export still work; the table, title, sidebar, header, and badges are visually unchanged.
- [ ] 2.6 Manual responsive check: narrow the window below 768px — controls wrap into centered rows with consistent spacing and no horizontal overflow, Search goes full width; return to desktop and confirm the two-row shared-edge layout returns with no third row.