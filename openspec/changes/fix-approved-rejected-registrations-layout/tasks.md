# Tasks

## Phase 1: CSS — `public/css/admin.css`

### Task 1.1: Extend the `.action-buttons` grid to all three registration tables
- [x] Replace the `.admin-page #registrationsTable .action-buttons { ... }` block (currently around line 2426) so the grid rule also applies to `#approvedRegistrationsTable` and `#rejectedRegistrationsTable`:
  ```css
  .admin-page #registrationsTable .action-buttons,
  .admin-page #approvedRegistrationsTable .action-buttons,
  .admin-page #rejectedRegistrationsTable .action-buttons {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    width: 100%;
  }
  ```
- [x] Keep the grid behavior identical to the existing Pending rule (same columns, gap, width).

### Task 1.2: Unify the Actions-column width and vertical alignment across all three tables
- [x] Replace the `#registrationsTable th:last-child`/`td:last-child` width rule (currently `170px`) with selectors covering all three table ids set to `width: 240px; min-width: 240px;`.
- [x] Extend the `tbody td:last-child { vertical-align: middle; }` rule to all three table ids.

### Task 1.3: Remove the `action-col-start` rules for the two-by-two layout
- [x] Remove the `.action-buttons .action-col-start { grid-column: 1 }` rules (added for the earlier three-row plan) so the Approved/Rejected grids render as a full 2x2.
- [x] Confirm no `action-col-start` styling remains under `#approvedRegistrationsTable` or `#rejectedRegistrationsTable` (or anywhere else).

### Task 1.4: Match header-to-table spacing for Approved/Rejected
- [x] Add:
  ```css
  .admin-page .section-approved .admin-table-wrap,
  .admin-page .section-rejected .admin-table-wrap {
    margin-top: 1rem;
  }
  ```

## Phase 2: JavaScript — `public/js/admin.js` → `appendRegistrationRow`

### Task 2.1: Enable grid mode for Approved/Rejected rows
- [x] Change `const gridMode = Boolean(showDecisionButtons);` to `const gridMode = Boolean(showDecisionButtons || showSetPendingButton);`.

### Task 2.2: Use Pending's blue Archive style in all three tables
- [x] Change the Archive branch so the button uses Pending's blue style (same body as Pending's Archive className — `bg-blue-600` white text, hover/focus) plus the grid fills, in every table; remove the white/outline Approved/Rejected variant and the `action-col-start` class.
- [x] Keep button text ('Archive'), disabled state, and `archiveRegistration` handler identical.

### Task 2.3: Move Set Pending into the grid container without positioning classes
- [x] In the Set Pending branch, when `gridMode`, add `w-full`, `justify-center`, `whitespace-nowrap` and append it via `appendAction(pendingBtn)`; do NOT add `action-col-start` (auto-placement lands it at row 2, right column).
- [x] Keep the amber/outline classes, `disabled` logic, and `updateRegistrationStatus(reg._id, 'pending')` handler identical.

## Phase 3: Verify

### Task 3.1: Static inspection
- [x] Grep `public/css/admin.css` and confirm: the `.action-buttons` grid selector lists all three table ids; the last-child width/min-width is `240px` across all three; NO `action-col-start` rule remains; the `section-approved`/`section-rejected` `.admin-table-wrap` margin-top rule exists.
- [x] Grep `public/js/admin.js` and confirm: `gridMode` uses `showDecisionButtons || showSetPendingButton`; the Archive branch uses Pending's blue classes in every table (no white/outline Approved/Rejected variant); NO `action-col-start` string remains; Set Pending appends via `appendAction`; button labels/handlers are unchanged.
- [x] Confirm `public/admin.html` was not modified.

### Task 3.2: Syntax check
- [x] Run `node --check public/js/admin.js` and confirm it passes.

### Task 3.3: Focused smoke test (temporary, outside the repo if possible)
- [x] Create a temporary jest test (plus a throwaway config with `rootDir` in the temp dir and `--config` pointing at it) that reads `public/css/admin.css` and `public/js/admin.js` and asserts: (a) CSS contains the three-table `.action-buttons` selector, `240px` for all three last-child rules, the approved/rejected `.admin-table-wrap` margin-top, and NO `action-col-start` rule; (b) JS contains `showDecisionButtons || showSetPendingButton`, `appendAction(pendingBtn)`, the blue Archive classes without a white/outline Approved/Rejected branch, and NO `action-col-start` string; (c) `public/admin.html` still contains all three titled sections (`Pending Registrations`, `Approved Registrations`, `Rejected Registrations`) and each table's 7 `<th>` set.
- [x] Run it, confirm all assertions pass, then delete the temporary test and config.

### Task 3.4: Existing test suite
- [x] Run `npm test` and confirm the result matches the pre-change baseline (1 failing suite `tests/admin-filters.test.js`, 1 passing suite; 5 failed, 14 passed) with no new failures.

### Task 3.5: Manual browser check (requires running app + admin login)
- [ ] Open Request Management and confirm Pending stays exactly as before (blue Archive, 2x2 grid).
- [ ] Confirm Approved and Rejected render `View | ORF / Archive | Set Pending` in the same two-by-two equal-width grid as Pending, vertically centered, with no overlap or cut-off, in every row including ones without an ORF document.
- [ ] Confirm colors match Pending: View blue, ORF white/outline, Archive blue (identical to Pending's Archive), Set Pending amber/outline; green dot on Approved, red dot on Rejected.
- [ ] Confirm clicking each action runs the existing behavior (View opens user modal, ORF opens document, Archive archives, Set Pending moves back to pending) and the Status column shows unmodified values.
- [ ] Confirm the three tables' columns align and the Actions columns match in width; shrink the window and confirm horizontal scroll keeps the grids intact.