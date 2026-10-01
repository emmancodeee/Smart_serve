# Tasks

## Phase 1: Implement

### Task 1.1: Convert the feedback Actions container to a 2x2 grid
- [x] In `public/admin-feedback.html`, replace line 174:
  - From: `.table-actions { display: flex; flex-wrap: wrap; gap: 0.4rem; min-width: 220px; }`
  - To: `.table-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.4rem; width: 100%; }`
- [x] Do NOT edit `public/js/admin-feedback.js` (buttons, classes, handlers stay identical).
- [x] Do NOT touch `public/admin-returns.html` (its page-local `.table-actions` rule remains flex).

### Task 1.2: Confirm governing rules are already in place (no edits needed)
- [x] `admin-feedback.html:168` — `.admin-data-table th:last-child { min-width: 250px; }` gives the Actions column enough width for the grid.
- [x] `admin-feedback.html:169` — `.admin-data-table td { vertical-align: middle; }` vertically centers the grid in each row.
- [x] `admin-feedback.html:175` — `.table-actions .btn` sizing rule is preserved for equal-height buttons.

## Phase 2: Verify

### Task 2.1: Static inspection of the changed page
- [x] Grep `public/admin-feedback.html` and confirm the new grid rule is present and the old flex-wrap is gone.
- [x] Confirm `.table-actions .btn` sizing and `.admin-data-table` rules are still present.
- [x] Confirm `admin-returns.html` still has its original flex `.table-actions` rule.

### Task 2.2: Confirm handler/color preservation in the row renderer
- [x] Grep `public/js/admin-feedback.js` and confirm the four buttons remain `btn btn-sm btn-info`, `btn btn-sm btn-primary`, `btn btn-sm btn-warning`, `btn btn-sm btn-secondary`, each with its `onclick` (`viewFeedback`, `openResponseModal`, `openStatusModal`, `updatePriority`).

### Task 2.3: Run a focused smoke test
- [x] Create a temporary jest test (outside the repo if possible; remove after) that reads `public/admin-feedback.html` and asserts: (a) the `.table-actions` rule is `display: grid` with `repeat(2, minmax(0, 1fr))`; (b) `flex-wrap` is absent from that rule; (c) the `.table-actions .btn` sizing rule is present; (d) `admin-feedback.js` still contains the four `btn btn-sm btn-*` classes and the four `onclick` handler names.
- [x] Run it, confirm all assertions pass, then delete the temporary test.

### Task 2.4: Run the existing test suite
- [x] Run `npm test` and confirm the result matches the pre-change baseline (1 failing suite `tests/admin-filters.test.js`, 1 passing suite; 5 failed, 14 passed) with no new failures.

### Task 2.5: Manual browser check (requires running app + admin login)
- [ ] Open Feedback Management and confirm the four actions render as a clean 2x2 grid: View/Respond on top, Status/Priority below, equal widths and heights, aligned edges, uniform gaps, fully inside the Actions column, vertically centered, no overlap/clipping.
- [ ] Confirm each button keeps its existing color (cyanish, blue, gold, neutral) and that clicking each runs the correct handler (open feedback detail, response modal, status modal, priority).
- [ ] Narrow the window and confirm the table scrolls horizontally while the grid stays intact.