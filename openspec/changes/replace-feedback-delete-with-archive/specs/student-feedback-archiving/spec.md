## ADDED Requirements

### Requirement: Archive feedback action
The My Feedback table Actions column SHALL provide an "Archive" button for each feedback row, placed beside the existing "Edit" button. The button text SHALL be exactly "Archive". No "Delete" button or "Delete" text SHALL appear anywhere in the My Feedback section.

#### Scenario: Archive button visible
- **WHEN** a student views their feedback history
- **THEN** each row's Actions column shows an "Edit" button and an "Archive" button
- **AND** no Delete button or Delete text appears in the My Feedback section

### Requirement: Archive confirmation
Before archiving feedback, the system SHALL show a confirmation dialog reading "Are you sure you want to archive this feedback?" with two buttons: "Cancel" and "Archive". Selecting "Cancel" SHALL close the dialog and leave the feedback unchanged. Selecting "Archive" SHALL archive only the selected feedback.

#### Scenario: Cancel keeps feedback unchanged
- **WHEN** a student clicks "Archive" on a feedback row and then clicks "Cancel" in the confirmation dialog
- **THEN** the dialog closes and the feedback remains unchanged in the active list

#### Scenario: Confirm archives the feedback
- **WHEN** a student clicks "Archive" on a feedback row and confirms in the dialog
- **THEN** only that feedback is archived, the active My Feedback table refreshes, and the archived feedback no longer appears in the active list

### Requirement: Soft archive persistence
Archiving feedback SHALL NOT permanently delete the record. The system SHALL mark the feedback as archived and set an archive timestamp while keeping the document stored so it can be retrieved or managed as archived data. Archiving one feedback SHALL NOT affect any other feedback records.

#### Scenario: Record retained after archive
- **WHEN** a student archives a feedback record
- **THEN** the record remains stored in the database with an archived flag and timestamp
- **AND** no other feedback records are modified

### Requirement: Archived records excluded from active list
The active My Feedback list SHALL exclude archived feedback. Archived records remain retrievable via the stored archived flag/timestamp.

#### Scenario: Archived feedback not shown
- **WHEN** the My Feedback list loads after feedback has been archived
- **THEN** archived feedback does not appear in the active list while non-archived feedback still appears