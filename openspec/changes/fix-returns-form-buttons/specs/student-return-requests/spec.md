## ADDED Requirements

### Requirement: Add Another Item appends an independent row
The "+ Add Another Item" control SHALL append a new item row to the Items section that contains the same fields as existing rows (Type, Name, Condition, Quantity, Notes) plus a Remove control. The new row SHALL start empty (Quantity defaults to 1) and SHALL NOT alter or overwrite the values of any existing row.

#### Scenario: Adding a second item keeps the first intact
- **WHEN** the student has filled Item 1 (Type = module, Quantity = 1, Notes = "SDSDSDS") and clicks "+ Add Another Item"
- **THEN** a new empty Item 2 row appears and Item 1 keeps all of its entered values

#### Scenario: Adding multiple items
- **WHEN** the student clicks "+ Add Another Item" three times
- **THEN** four independent item rows (Item 1–4) are present, each with its own Type, Name, Condition, Quantity, and Notes fields

### Requirement: Independent item state with stable ids
Each item row SHALL hold independent state in an array-backed model (`returnItems`), where each entry has a stable unique id (not the array index). Changing one row's Type, Name, Condition, Quantity, or Notes SHALL NOT affect any other row.

#### Scenario: Rows hold distinct values
- **WHEN** the student enters different Type/Name/Quantity/Notes values in Item 1 and Item 2
- **THEN** each row retains its own values with no shared or overwritten data

### Requirement: Remove deletes only the selected row
The Remove control SHALL remove only the row it belongs to. Removing a middle row SHALL leave all other rows (and their values) intact, SHALL NOT reset the form, SHALL NOT clear Reason for Return / Additional Details / Preferred Return Date / Priority, and SHALL NOT navigate away or reload the page.

#### Scenario: Removing a middle item
- **WHEN** the student has Item 1, Item 2, and Item 3 and clicks Remove on Item 2
- **THEN** only Item 2 is removed and Item 1 and Item 3 (with their values) remain

### Requirement: Remove always works, with a visible empty state
The Remove control SHALL work on every row, including the last one. When the last row is removed, an empty state message ("No items yet. Click '+ Add Another Item' to add the first item.") SHALL be shown where the rows were, together with a hint ("At least one item is required."). Removing the last row SHALL NOT reset the form and SHALL NOT navigate away.

#### Scenario: Removing the last remaining item
- **WHEN** the student has a single item row and clicks Remove
- **THEN** the row is removed, an empty state with the "No items yet" message and the "At least one item is required." hint is shown, and submission is blocked until at least one item is added

### Requirement: Form data preserved across item edits
Adding or removing an item SHALL NOT reset the rest of the form. Reason for Return, Additional Details, Preferred Return Date, and Priority SHALL keep their entered values when rows are added or removed.

#### Scenario: Adding an item preserves the rest of the form
- **WHEN** the student entered Reason = "Damaged module", Details = "Pages are torn", Preferred Return Date = a date, and Priority = High, then clicks "+ Add Another Item"
- **THEN** the new row appears while all of those other field values remain unchanged

### Requirement: Submit includes all current items
The "Submit Return Request" control SHALL collect every currently visible item row into the existing `POST /api/auth/returns` payload. Removed rows SHALL NOT be included, and no fake data or new endpoint SHALL be introduced.

#### Scenario: Multiple items submitted together
- **WHEN** the student has multiple filled item rows and submits
- **THEN** the payload contains all current rows (each with its type, name, condition, quantity, and notes) and excludes removed rows

### Requirement: Per-item validation blocks submission
Before submitting, SHALL validate every visible item row. A row missing a required value (Type, Name, or Condition) or an invalid quantity SHALL block submission with a clear inline message near that row, and the student's entered data SHALL NOT be cleared.

#### Scenario: Incomplete item blocks submit
- **WHEN** the student submits while an item row has no Type or no Name
- **THEN** submission does not occur, an inline message ("Please select an item." / item-specific message) is shown near that row, and all entered information remains

### Requirement: Cancel asks for confirmation when data exists
The Cancel control SHALL prompt for confirmation only when the form already contains entered data. The dialog SHALL show "Cancel Return Request?" with the message "Are you sure you want to cancel? Your entered information will not be saved." and buttons **[Continue Editing]** and **[Cancel Request]**. Continue Editing SHALL close the dialog and keep the form and all entered data.

#### Scenario: Cancel with entered data shows confirmation
- **WHEN** the student has entered information and clicks Cancel, then clicks Continue Editing in the dialog
- **THEN** the dialog closes and the student remains on the Returns form with all entered information intact

### Requirement: Confirming Cancel clears the draft and returns to Returns history
Clicking **[Cancel Request]** SHALL cancel the current return draft, clear the temporary form state, NOT submit any request, NOT create a database record, and SHALL NOT redirect to Dashboard. The student SHALL be returned to the Returns section (the existing `/returns` page) showing the Returns history view.

#### Scenario: Empty form cancel returns to Returns page
- **WHEN** the student clicks Cancel on an empty form
- **THEN** the student is returned to the Returns section on the existing `/returns` route with no request submitted

#### Scenario: Confirmed cancel never submits
- **WHEN** the student enters data, clicks Cancel, then clicks Cancel Request
- **THEN** the form state is cleared and the student is returned to Returns history with no return request submitted and no database record created

### Requirement: Controls are interactive buttons without page reload
The "+ Add Another Item", Remove, and Cancel controls SHALL be actual `type="button"` interactive controls bound via CSP-safe event listeners (no inline `onclick`). Clicking Add Another Item or Remove SHALL NOT submit the parent form or reload the page; only "Submit Return Request" SHALL submit.

#### Scenario: Add/Remove do not submit or reload
- **WHEN** the student clicks "+ Add Another Item" or "Remove"
- **THEN** the form is not submitted, no page reload occurs, and no validation error is triggered by the click