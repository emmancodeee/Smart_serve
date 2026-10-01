1. CSP-safe markup (`public/returns.html`)
   ==============================================================

- [x] 1.1 Remove inline `onclick` attributes from the item-row "Remove" button and the "+ Add Another Item" button in `public/returns.html`; give "+ Add Another Item" the id `addItemBtn`
- [x] 1.2 Add a `#itemsHint` element (for the "At least one item is required." hint) near the Items section
- [x] 1.3 Add a `#returnHistoryPanel` id to the "My Return Requests" history panel so Cancel can scroll to it
- [x] 1.4 Add the `#cancelReturnModal` confirmation dialog reusing `.student-modal-overlay` / `.student-modal-box.student-modal-box-sm` with buttons `#cancelContinueBtn` ("Continue Editing") and `#cancelConfirmBtn` ("Cancel Request"), title "Cancel Return Request?" and message "Are you sure you want to cancel? Your entered information will not be saved."

## 2. Item state model (`public/js/returns.js`)

- [x] 2.1 Add `createItem()` returning `{ id, type, name, condition, quantity: 1, notes }` with a stable unique id (`crypto.randomUUID?.()` with a `Date.now()` + random fallback); add module-level `let returnItems = [ createItem() ]`
- [x] 2.2 Add `renderItems()` that re-renders every row in `#itemsContainer` from `returnItems` using the existing `student-item-row` grid markup (Type, Name, Condition, Quantity, Notes, and a `<button type="button" data-action="remove" data-item-id="...">Remove</button>`); when zero rows remain it renders an empty-state message and shows the `#itemsHint` "At least one item is required." hint

## 3. Add / Remove interactions (`public/js/returns.js`)

- [x] 3.1 Bind `#addItemBtn` (CSP-safe `addEventListener`) to push a new `createItem()` into `returnItems`, re-render, show the new row smoothly, scroll it into view, and focus its first field; existing rows and rest-of-form values must remain untouched
- [x] 3.2 Bind one delegated click listener on `#itemsContainer` that removes only the row whose `data-item-id` matches (splice from `returnItems`, re-render); exit early unless `closest('button[data-action="remove"]')` is found
- [x] 3.3 Allow removing every row: removing the last row re-renders an empty state ("No items yet...") with the `#itemsHint` "At least one item is required." message; submission with zero rows is blocked (hint shown, focus moves to `#addItemBtn`) until an item is added
- [x] 3.4 Sync state from the DOM: delegated `input`/`change` listener on `#itemsContainer` writes each change back into the matching `returnItems` entry by `data-item-id` without re-rendering (keeps typing smooth)

## 4. Cancel with confirmation (`public/js/returns.js`)

- [x] 4.1 Add `hasEnteredData()` that returns true when any row has a value (Type/Name/Condition/Notes/Quantity ≠ 1) or Registration/Reason/Details/Preferred Date/priority ≠ medium is non-empty
- [x] 4.2 Replace the Cancel no-op with a handler: if `hasEnteredData()` open `#cancelReturnModal`, else immediately run the reset flow
- [x] 4.3 Bind `#cancelContinueBtn` to close the modal keeping all data; bind `#cancelConfirmBtn` to run the reset flow
- [x] 4.4 Reset flow: `returnItems = [ createItem() ]`, clear `registrationId`/`reason`/`details`/`requestedReturnDate`/`priority`, re-render items, clear validation/hint messages, `loadReturnHistory()`, and smooth-scroll `#returnHistoryPanel` into view — no fetch, no DB write, no navigation to `/dashboard`

## 5. Submission with per-item validation (`public/js/returns.js`)

- [x] 5.1 Replace `collectItems()` with `validateItems()` returning `{ items, errors }`: each row requires Type, Name, and Condition, and Quantity ≥ 1; incomplete rows produce entry errors
- [x] 5.2 In the submit handler, `preventDefault()` and render a `.item-field-error` message near each invalid row on failure — do not clear any entered data, focus the first invalid field
- [x] 5.3 On success build the existing payload `{ registrationId, items, reason, details, requestedReturnDate, priority }` from all current `returnItems` rows (removed rows excluded) and POST to `/api/auth/returns`; keep existing alert/success/reset/history-reload behavior
- [x] 5.4 Add `novalidate` to `#returnForm` so per-item inline validation messages show instead of native browser bubbles

## 6. Styling (`public/css/theme.css`)

- [x] 6.1 Add `.item-field-error` (small red text near the row), `.item-min-hint` (muted hint), and `.item-empty-state` (muted dashed placeholder) rules; hover feedback already exists on `.student-btn` variants
- [x] 6.2 Add `.student-item-row.is-new { animation: student-item-row-in ... }` keyframe so a newly added row appears smoothly

## 7. Verification

- [x] 7.1 Run `node --check public/js/returns.js` and confirm no inline `onclick` remains for the three controls in `public/returns.html`
- [x] 7.2 Harness/console test Add: opening the Returns form and clicking "+ Add Another Item" appends a second independent row (TEST 1)
- [x] 7.3 Independent state: entering distinct values in two rows keeps each row's own values (TEST 2)
- [x] 7.4 Remove-targeting: adding rows and clicking Remove on a middle row removes only that row (TEST 3-5); removing the last row shows the empty state with the hint (TEST 6)
- [x] 7.5 Data preservation: entering Reason/Details/Preferred Date/Priority then adding and removing items keeps all of those values (TEST 7)
- [x] 7.6 Cancel empty form: returns to Returns history with nothing submitted (TEST 8); Cancel with data shows the dialog; "[Continue Editing]" stays on the form with data intact; "[Cancel Request]" clears and returns to Returns history with no request submitted (TEST 9-10)
- [x] 7.7 Submit with multiple items includes all current rows in the payload; incomplete rows block submission with inline messages and no data loss (TEST 11)
- [x] 7.8 Browser console: no JavaScript errors caused by the three buttons; no page reloads on Add/Remove/Cancel (TEST 12 — 22/22 harness assertions pass, 0 console errors)