## Why

The Returns form (`public/returns.html` → `public/js/returns.js`) renders three controls that are visible but **not functioning**: "+ Add Another Item", "Remove", and "Cancel". The app's Content Security Policy (`script-src: ['self', cdn.jsdelivr.net, cdnjs.cloudflare.com]` in `server.js`, no `unsafe-inline`) blocks the inline `onclick="addItem()"` / `onclick="removeItem(this)"` attributes, while the Cancel button's handler is an empty no-op. Students cannot build a multi-item return draft, cancel it, or trust single-item edits — the module is effectively broken.

## What Changes

- **"+ Add Another Item"** — rebind via a CSP-safe `addEventListener` on a dedicated button id (no inline `onclick`). Clicking appends a new, independent item row with the same fields (Type, Name, Condition, Quantity, Notes + Remove) without touching existing rows or the rest of the form.
- **"Remove"** — rebind via a delegated CSP-safe listener on `#itemsContainer` using each row's stable `data-item-id`. Removing deletes **only** that row; every row's Remove stays functional, and removing the last row shows an empty state with the hint "At least one item is required." until an item is added back. Never resets the form, never clears Reason/Details/Preferred Date/Priority.
- **"Cancel"** — real behavior: if the form already has entered data, show a confirmation dialog ("Cancel Return Request?" / "Are you sure you want to cancel? Your entered information will not be saved.") with **[Continue Editing]** and **[Cancel Request]**. Continue Editing keeps the draft and stays on the form; Cancel Request clears the temporary form state (no DB record, nothing submitted) and returns the student to the Returns history view on the existing `/returns` route — **never** Dashboard.
- **Per-item validation on Submit** — every visible row is validated (Type, Name, Condition required; Quantity >= 1). Incomplete rows show a clear inline message near that row and block submission; entered data is preserved. All current items are included in the `PUT /auth/returns` payload; removed/duplicate rows are not.
- Uses the existing returns API (`POST /api/auth/returns`), existing form fields, existing modal/button styling — no backend, DB, or new API changes.

## Capabilities

### New Capabilities
- `student-return-requests`: The student Returns form's dynamic item rows (add/remove with independent per-row state and stable IDs), cancellation-with-confirmation that returns to Returns history (never Dashboard), and per-item submission validation on `public/returns.html` + `public/js/returns.js`.

### Modified Capabilities
- (none)

## Impact

- `public/returns.html` — remove inline `onclick` attributes from item Remove and "+ Add Another Item"; add ids for CSP-safe binding; add the cancel-confirmation dialog markup reusing `student-modal-overlay`/`student-modal-box` styles.
- `public/js/returns.js` — CSP-safe bindings for Add/Remove/Cancel; `returnItems` state array with stable per-row ids rendered to DOM (mirroring existing `student-item-row` markup and `collectItems()` payload shape); per-item validation messages; cancel reset flow that returns to Returns history.
- `public/css/theme.css` / `public/css/tailwind.css` — reuse existing `.student-btn`, `.student-btn-danger`, `.student-btn-secondary`, modal, and badge classes; add only minimal disabled-state styling if a gap is found.
- `server.js`, `routes/auth.js`, `controllers/`, `services/` — untouched.