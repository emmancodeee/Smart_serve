## 1. Frontend Implementation

- [x] 1.1 In `public/js/admin.js` `appendRegistrationRow()`, add an `.action-buttons` grid container div and append View, ORF (when document path exists), Approve, and Archive into it when `showDecisionButtons` is true (pending path); keep Approved/Rejected inline flow unchanged
- [x] 1.2 In grid mode, strip the `ml-2` (and any `ml-3`) margin classes from ORF/Approve/Archive and add `w-full justify-center whitespace-nowrap` to all four buttons; keep existing base classes, spacing, hover/focus variants, and `items-center`
- [x] 1.3 Restyle the Archive button to the existing blue/white action style (`bg-blue-600 text-white` with matching hover `bg-blue-700` and focus ring), keeping the archive confirm prompt and handler intact
- [x] 1.4 In `public/css/admin.css`, add scoped rules for `#registrationsTable`: `.action-buttons` grid (`display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; width: 100%;`), Actions column `width: 170px` on `th:last-child`/`td:last-child`, and `vertical-align: middle` on `tbody td:last-child`

## 2. Verification

- [x] 2.1 Grep `public/js/admin.js` and `public/admin.html` to confirm no Reject/Remove/Delete button remains in the pending registrations actions and no other module's action buttons changed
- [x] 2.2 Verify scope isolation: grep that `#approvedRegistrationsTable`, `#rejectedRegistrationsTable`, and Inventory action markup are untouched and the `#registrationsTable` empty state keeps `colSpan="7"`
- [x] 2.3 Run `node --check public/js/admin.js` for syntax
- [x] 2.4 Add a temporary jest smoke test asserting the pending row renders a `.action-buttons` grid with exactly View/ORF/Approve/Archive (no Reject/Remove/Delete text) and Archive uses the blue class set; run it, then remove the temp test
- [x] 2.5 Run `npm test` and confirm no regression (baseline: 1 suite failed, 1 passed; 5 failed, 14 passed — pre-existing admin-filters failures)
- [ ] 2.6 Manual browser check (Admin → Request Management / Pending Registrations): confirm 2x2 grid alignment, equal spacing, no wrapping/overlap, Actions column width, vertical centering, Archive shows blue with working confirm prompt, and Inventory/Approved/Rejected actions unchanged