## 1. CSS: Registrations filter two-row grid (`public/css/admin.css`)

- [x] 1.1 Add the scoped grid rule for the registrations main row (near the existing admin-page filter overrides, ~after line 3519), scoped to the registrations toolbar only:
  ```css
  .admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    align-items: center;
  }
  ```
- [x] 1.2 Add the width/insets rule so every control fills its grid cell and never resizes on value change:
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
- [x] 1.3 Keep every control on a single equal-width column — no `grid-column: span` — so Row 2 = Date preset (All Time) | Sort | Search | Reset Filters | Export fills exactly five tracks and can never wrap a third row:
  ```css
  /* No grid-column span: all ten controls are single-column grid items. */
  ```
- [x] 1.4 Add the scoped responsive collapse below desktop width (even reflow, no overlap, no disproportionate heights):
  ```css
  @media (max-width: 768px) {
    .admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main .filter-control--search {
      grid-column: 1 / -1;
      max-width: none;
    }
  }
  ```
- [x] 1.5 Confirm the block is purely additive and scoped: no shared `.filter-toolbar*` rule, admin-page override, or behavior was modified or removed, and no rule outside `.filter-toolbar[data-module="registrations"]` (other than comments) was added.

## 2. Verify

- [x] 2.1 Static check: confirm `#registrationsFilterContainer` receives both `filter-toolbar` and `data-module="registrations"` (admin-filters.js:707-708) and the rendered row is `.filter-toolbar__row--main` (admin-filters.js:706); grep `public/css/admin.css` for the scoped rules (`repeat(5, minmax(0, 1fr))`, `repeat(2, ...)` at ≤768px) and confirm no scoped `grid-column: span` rule exists inside the registrations scope; confirm control heights still come from the untouched `height: 44px` rules. Confirm a real toolbar mount yields exactly ten controls (headless jsdom: `status, course, yearLevel, studentType, date-field, date-preset, sort, search, reset, export`).
- [x] 2.2 Confirm `public/js/admin.js`, `public/js/admin-filters.js`, and `public/admin.html` were not modified by this change (toolbar DOM, options, and order untouched). Confirm the two distinct Date controls render as expected (field select "All Date" on Row 1; preset select "All Time" on Row 2), preserving the preset options list.
- [x] 2.3 Run `npm test` and confirm the result matches the pre-change baseline (1 failing suite `tests/admin-filters.test.js`, 1 passing suite; 5 failed, 14 passed; no new failures caused by this change).
- [ ] 2.4 Manual browser check on Admin > Request Management (requires running app + admin login; the `?v=...` cache-buster on `/css/admin.css` forces a fresh fetch, otherwise hard-refresh): Row 1 = Status | Year/Category | Year Level | Student Type | Date (All Date) as five equal columns; Row 2 = Date preset (All Time) | Sort | Search (same width as peers) | Reset Filters | Export sharing Row 1's left/right boundaries; exactly two rows with no third row; all controls 44px, vertically centered, arrows aligned right; the Year/Category control is no longer an undersized/empty box.
- [ ] 2.5 Manual state check: select Pending (and other) statuses, a course, year level, student type, date, sort, and search one at a time — controls never jump/resize/move; Status dropdown lists only All Status/Pending/Approved/Rejected (no "Archived"); changing Status preserves Year Level/Student Type/others; setting filters that yield zero results keeps the toolbar visible with the empty-state message in the table area; Reset Filters restores defaults and keeps the layout.
- [ ] 2.6 Manual responsive check: narrow the window below 768px — controls reflow as even columns with the search full-width, no overlap, no disproportionately tall/short control; return to desktop and confirm the two-row layout returns with no third row.