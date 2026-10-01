## Context

The Returns module (`public/returns.html` → `public/js/returns.js`) renders a multi-item return form plus a Return History table on the same `/returns` page. The app's Content Security Policy (`script-src: ['self', cdn.jsdelivr.net, cdnjs.cloudflare.com]` in `server.js`, line 168 — no `unsafe-inline`) executes **only** external scripts loaded via `<script src>`. All three reported controls are dead for wiring reasons:

- "+ Add Another Item" and each "Remove" still use inline `onclick="addItem()"` / `onclick="removeItem(this)"` attributes (returns.html lines 813/818) → **blocked by the CSP**, so neither function is ever invoked.
- "Cancel" has a real listener but its body is a no-op comment ("Cancel stays on the current page: no navigation."), returns.js line 119-121.

The existing submit flow (`POST /api/auth/returns`) is intact and works; `collectItems()` currently reads Type/Name/Condition/Quantity/Notes from the DOM and **silently drops** any row missing a value, which combined with the dead controls makes the form unusable.

Constraint: client-only change. Backend (`routes/auth.js`, controllers, services, `server.js`) must not change. Existing fields, catalog options, modal/button styling, and the return API payload shape (`{ registrationId, items, reason, details, requestedReturnDate, priority }`, items as `{ type, name, condition, quantity, notes }`) are reused.

## Goals / Non-Goals

**Goals:**
- "+ Add Another Item", "Remove", and "Cancel" become fully interactive via CSP-safe binding (no inline `onclick`).
- Each item row has independent state with a stable unique id; adding/removing never touches other rows or the rest of the form.
- Remove stays functional on every row; removing the last row shows a visible empty state prompting the student to add an item back (submission is blocked until ≥ 1 item).
- Cancel asks for confirmation when the form has data ([Continue Editing] / [Cancel Request]); confirming clears the draft and returns to Returns history on `/returns` — never Dashboard, never a DB write.
- Submission validates every visible row with inline messages, blocks on invalid rows, preserves entered data, and submits all current rows.
- No parent-form side effects: Add/Remove/Cancel are `type="button"` and never submit or reload.

**Non-Goals:**
- No backend/API/DB changes, no new endpoints, no schema/migration work.
- No changes to the Return History tiles, admin side, feedback modal, or other student pages.
- No React/state library introduction; the existing vanilla-JS pattern is kept.
- No removal of existing form fields (Type, Name, Condition, Quantity, Notes; Registration; Reason; Details; Preferred Date; Priority).

## Decisions

**D1 — Fix the root cause: CSP-safe binding (no inline `onclick`).**
The inline `onclick` attributes are dead under the CSP, so `addItem()`/`removeItem()` never fire. Remedy:
- Give the "+ Add Another Item" button an id (`addItemBtn`) in `returns.html` and bind it in `returns.js` with `addEventListener('click', ...)`.
- Render item rows fully from JS (no inline handlers) with a `data-item-id` on the row and a Remove `<button type="button" data-action="remove" data-item-id="...">`; bind **one delegated** click listener on `#itemsContainer` that resolves `button[data-action="remove"]` → `closest('[data-item-id]')`.
- Cancel is already id-bound; replace the no-op body with the confirmation flow (D4).
- Alternative considered: adding `'unsafe-inline'` to the CSP → rejected, weakens security app-wide and contradicts the existing CSP-safe pattern used by `dashboard.js`/`feedback.js`.

**D2 — `returnItems` state array with stable ids as source of truth.**
Introduce module-scope `let returnItems = [ createItem() ]`, where `createItem()` returns `{ id, type, name, condition, quantity: 1, notes }` and `id = crypto.randomUUID?.() ?? 'row-' + Date.now() + '-' + Math.random().toString(36).slice(2)`. Rows are rendered from the array (`renderItems()` builds the same `student-item-row` markup that exists today). Inputs/selects carry `data-field` + `data-item-id`; a delegated `input`/`change` listener on the container syncs each change back into `returnItems` **without re-rendering** (keeps typing smooth). Re-render happens only on add/remove/cancel-reset/validation-mark, so values are never lost and rows never share state.
- Why array state: the requirement mandates stable per-row ids and "not array index as permanent id"; a single state source also makes Cancel's "clear temporary state" a one-line reset and makes removal by id trivial.
- Alternatives considered: (a) keep the current DOM-only `querySelectorAll` approach → rejected, no id model, `collectItems()` silently drops rows, and removal is row-index-based; (b) array index as id → rejected per requirement; (c) a framework → rejected, no new libraries.

**D3 — Remove always works; empty state shows when zero rows remain.**
Delegated Remove handler: `returnItems = returnItems.filter(i => i.id !== id)` and `renderItems()` — every row's Remove stays enabled. When `returnItems.length === 0`, `#itemsContainer` shows an empty-state message ("No items yet. Click '+ Add Another Item' to add the first item.") and `#itemsHint` shows "At least one item is required. Use '+ Add Another Item' to add one." Submission with zero rows is blocked with this hint and focus moves to `#addItemBtn`. Remove never touches Reason/Details/Preferred Date/Priority, never navigates, never submits.

**D4 — Cancel: confirm-when-dirty, then reset to Return History.**
Add a `#cancelReturnModal` reusing the existing `.student-modal-overlay` / `.student-modal-box.student-modal-box-sm` styles with buttons `#cancelContinueBtn` ("Continue Editing") and `#cancelConfirmBtn` ("Cancel Request"). `onCancelClick()`:
- `hasEnteredData()` → true if any item row has non-empty type/name/condition/notes or quantity ≠ 1, or Registration/Reason/Details/Preferred Date non-empty, or Priority ≠ "medium". If data exists: open the confirmation modal. Else: run the cancel flow immediately (dirty-confirm only, per requirement).
- "[Continue Editing]" → `closeModal('cancelReturnModal')`; form and data untouched.
- "[Cancel Request]" → reset temporary state: `returnItems = [ createItem() ]`, clear `registrationId`/`reason`/`details`/`requestedReturnDate`/`priority` controls, `renderItems()`, clear item validation messages and the min-hint, then `loadReturnHistory()` and smooth-scroll to the "My Return Requests" history panel (`scrollIntoView`). No fetch, no DB write, no navigation to `/dashboard` — the student stays on the existing `/returns` route and lands on the Returns history, satisfying "return to the Returns section using the existing route."
- Why same-page reset instead of `window.location.href = '/returns'`: the form and history share one route; a reset + scroll achieves the required observable result without a flashy reload, and keeps the URL/route unchanged.
- Alternative considered: navigating to Dashboard → explicitly rejected by the requirement.

**D5 — Per-item validation blocks submission without data loss.**
Replace `collectItems()`'s silent filtering with `validateItems()` returning `{ items, errors }` over `returnItems`. A row fails if Type, Name, or Condition is empty, or Quantity is missing/`< 1`. On any failure: render a `.item-field-error` message under each invalid row (e.g., "Please select an item." / "Item name is required." / "Condition is required." / "Quantity must be at least 1."), focus the first invalid field, `preventDefault()`, and submit nothing — entered data is untouched. On success, build the payload exactly as today (`{ registrationId, items: [...current rows], reason, details, requestedReturnDate, priority }`) and `POST /api/auth/returns`. Only currently visible rows are sent. Success/error `alert()` behavior is preserved.

**D6 — Styling stays in the existing design system.**
Reuse `.student-btn`, `.student-btn-secondary` (Add/Cancel), `.student-btn-danger` (Remove), and modal classes already present in `returns.html` + `theme.css`. Add minimal rules to `public/css/theme.css`: `.item-field-error` (small red text), `.item-min-hint` (muted hint), `.item-empty-state` (muted dashed placeholder), and a subtle new-row animation. No new colors conflict with Smart Serve.

## Risks / Trade-offs

- [Re-rendering rows on add/remove could discard an in-progress edit] → `returnItems` is synced from the DOM on every `input`/`change` before any add/remove, so no values are lost; focus moves to the first field of the new row after add.
- [`crypto.randomUUID` unavailable in older browsers] → fallback id generator (`Date.now()` + random suffix) in `createItem()`.
- [Native `required` browser validation vs inline messages] → both coexist; inline messages guarantee consistency with other Smart Serve validation UX and never leave the form partially submitted/silently dropped.
- [Delegated listener misfires on non-button clicks] → handler exits unless `target.closest('button[data-action="remove"]')`; container is static in markup, guaranteed present.
- [Cancel scroll target missing] → guard `getElementById('returnHistoryPanel')`; if absent, still reset state and reload history (graceful degradation).

## Migration Plan

No deployment or data migration required — a pure front-end change. Rollback: revert `public/returns.html`, `public/js/returns.js`, and the small `public/css/theme.css` additions. Normal browser refresh serves the change; no cache-busting concerns.

## Open Questions

- None blocking. Minor: exact wording of item error messages beyond the examples given (kept consistent with existing copy style).