# student-feedback-page

## ADDED Requirements

### Requirement: Actions column shows only Edit and Delete
The "My Feedback" table SHALL display an Actions column containing exactly two working buttons — "Edit" and "Delete" — for every feedback row. The "View" button SHALL NOT be rendered. Edit and Delete SHALL be visible, clickable, spaced apart, non-overlapping, and inside the Actions column for rows in any status.

#### Scenario: No View button
- **WHEN** a student with submitted feedback views the "My Feedback" table
- **THEN** each row's Actions column contains only "Edit" and "Delete", with no View button

#### Scenario: Actions shown for every status
- **WHEN** a feedback row has status pending, reviewed, resolved, or closed
- **THEN** the row still shows clickable Edit and Delete buttons

### Requirement: Edit updates the existing feedback
When a student clicks "Edit" on a feedback row, the system SHALL load that feedback's data into the existing form, switch the form to update mode, and on submit SHALL update that same feedback record via the existing update endpoint. The update SHALL NOT create a duplicate feedback record, SHALL NOT alter the student's other records, and the form SHALL be usable for a new submission afterward.

#### Scenario: Edit loads and saves the selected feedback
- **WHEN** a student clicks "Edit" on a feedback row, modifies the loaded form, and submits
- **THEN** the selected feedback is updated in place (same record, no duplicate), the history table reloads, and the form returns to its normal create state

#### Scenario: Edits can be repeated
- **WHEN** a student edits one feedback, saves it, then edits another (or the same) feedback
- **THEN** every subsequent edit loads, saves, and reloads correctly without lingering update state

### Requirement: Delete removes only the selected feedback
When a student clicks "Delete" on a feedback row, the system SHALL show a confirmation ("Are you sure you want to delete this feedback?"); if confirmed, it SHALL delete only that feedback record via the existing delete endpoint and remove the row from the "My Feedback" table immediately.

#### Scenario: Confirmed delete removes the row
- **WHEN** a student clicks "Delete" and confirms
- **THEN** only that feedback record is deleted and its row disappears from the table on reload

#### Scenario: Cancelled delete keeps the row
- **WHEN** a student clicks "Delete" and cancels the confirmation
- **THEN** no record is deleted and the row remains in the table

### Requirement: Editing and deleting work for any status
For the student's own feedback, the update and delete actions SHALL succeed regardless of the feedback's status. The owning student SHALL be able to edit and delete feedback that is pending, reviewed, resolved, or closed, without affecting other students' feedback or admin-managed records.

#### Scenario: Edit and delete non-pending feedback
- **WHEN** a student edits or deletes their own feedback that is not pending
- **THEN** the operation succeeds and the record is updated or removed as expected