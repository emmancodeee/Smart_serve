## 1. CSS: Registrations filter two-row grid (`public/css/admin.css`)

- [x] 1.1 Add the scoped grid rule for the registrations main row (placed near the existing admin-page filter overrides, ~after line 3519):
  ```css
  .admin-page .filter-toolbar[data-module="registrations"] .filter-toolbar__row--main {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    align-items: center;
  }
  ```
- [x] 1.2 Add the width/insets rule so every control fills its grid cell and can never change size on value change:
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
- [x] 1.3 Keep Search on a single equal-width column like every other control (no `grid-column: span`, no `max-width` reset) so Row 2 = Date preset (All Time) | Sort | Search | Reset Filters | Export fills exactly five tracks and can never wrap a third row:
  ```css
  /* No grid-column span: all ten controls are single-column grid items. */
  ```
- [x] 1.4 Add the scoped responsive collapse so controls reflow evenly (never overlap or skew) below desktop width:
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
- [x] 1.5 Confirm the block is purely additive: no existing `.filter-toolbar*` rules or admin-page overrides were modified or removed, and no rules outside `.filter-toolbar[data-module="registrations"]` were added.

## 2. Verify

- [x] 2.1 Static check: with `Registrations` the only `SmartFilter` instance on the Request Management page, confirm `#registrationsFilterContainer` carries both `filter-toolbar` and `data-module="registrations"`; grep `public/css/admin.css` to confirm all new rules are scoped under `.filter-toolbar[data-module="registrations"]` and reference `repeat(5, minmax(0, 1fr))` with **no** scoped `grid-column: span` (heights still come from the untouched admin-page `height: 44px` rules). Confirm a headless jsdom mount of the real toolbar yields exactly ten controls in DOM order `status, course, yearLevel, studentType, date-field, date-preset, sort, search, reset, export`.
- [x] 2.2 Confirm `public/js/admin.js`, `public/js/admin-filters.js`, and `public/admin.html` were not modified by this change (the toolbar DOM, options, and order are untouched).
- [x] 2.3 Run `npm test` and confirm the result matches the pre-change baseline (1 failing suite `tests/admin-filters.test.js`, 1 passing suite; no new failures caused by this change).
- [ ] 2.4 Manual browser check on Admin > Request Management (requires running app + admin login; the `?v=...` cache-buster on `/css/admin.css` forces a fresh fetch, otherwise hard-refresh): Row 1 = Status | Course | Year Level | Student Type | Date (All Date) as five equal columns; Row 2 = Date preset (All Time) | Sort | Search (same width as peers) | Reset Filters | Export sharing the same left/right boundaries; all controls 44px tall and vertically centered; the Course control is no longer an oddly sized/empty box. Confirm exactly two rows render and that Reset Filters / Export never wrap onto a third row at desktop width.
- [ ] 2.5 Manual behavior check: select Pending (and other) statuses, a course, year level, student type, date, sort, and search text one at a time — the toolbar never jumps, resizes, or moves a control; Reset and Export still work; the white rounded container is unchanged.
- [ ] 2.6 Manual responsive check: narrow the window below desktop width — controls reflow as even columns without overlap, and no control becomes disproportionately tall or short; return to desktop width and confirm the two-row layout returns with no third row.