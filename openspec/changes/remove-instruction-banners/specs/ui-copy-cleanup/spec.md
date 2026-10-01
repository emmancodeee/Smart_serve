## ADDED Requirements

### Requirement: No instruction or permission-description banners in the UI
The system SHALL NOT display visible user-facing text that reads like an internal system instruction, permission description, developer/implementation note, or AI-generated explanation. This includes, but is not limited to, the inventory read-only notice, the admin super-admin notice, and announcement module helper paragraphs.

#### Scenario: Super admin opens Inventory
- **WHEN** a super admin views the inventory page
- **THEN** no "read-only" notice or text beginning with "Super admin can..." is displayed
- **AND** the inventory summary cards are followed directly by the Inventory List content

#### Scenario: Admin opens the admin hub
- **WHEN** any admin views the admin hub page
- **THEN** no amber notice banner ("Only the super admin can...", "Super admin can view all operational screens...") is displayed

#### Scenario: Student opens Announcements
- **WHEN** a student views the announcements page
- **THEN** the sidebar and feed headers display no instructional paragraphs such as "Search, filter, and review...", descriptions of auto-refresh behavior, or "Open any announcement to see the full details."

### Requirement: No instructional copy on the student dashboard
The system SHALL NOT show instruction-style sentences in the dashboard hero card or registration wizard, while still conveying registration status through the existing status widgets.

#### Scenario: Student with no registration on file opens Dashboard
- **WHEN** a student without a registration record views the dashboard
- **THEN** the hero card shows the greeting only, with no instruction sentence describing profile/status/pickup tasks
- **AND** registration status continues to be shown by the dashboard stat cards

#### Scenario: Student completes a registration request
- **WHEN** a student steps through the registration wizard
- **THEN** no explanatory step chips or description notes appear (for example ORF-upload guidance, "Review the student details...", "Keep modules separate...", "List the requested books separately...", "Uniform stays in its own step...", or "Review the full registration before submitting...")
- **AND** all form labels, inputs, Add buttons, and the submission payload preview remain available

### Requirement: Live ORF-upload feedback is preserved
The system SHALL continue to show runtime feedback for ORF upload operations, but SHALL NOT show instructional default messages in the upload area.

#### Scenario: Student clears the ORF file input
- **WHEN** a student clears or resets the ORF upload control without uploading a file
- **THEN** no instructional default message is displayed in the upload message area

#### Scenario: OCR progress, success, and failure feedback
- **WHEN** a student uploads an ORF and OCR starts, succeeds, or fails
- **THEN** the corresponding progress, success, or error message is still displayed as before

### Requirement: No leftover empty containers after cleanup
The system SHALL remove or collapse any container that becomes empty after banner text removal, leaving no blank boxes or unnecessary blank areas.

#### Scenario: Banner elements that become empty are removed
- **WHEN** a banner element has had all of its text removed
- **THEN** either the empty element is removed from the page or its spacing is collapsed so no blank box remains

### Requirement: Functionality, permissions, and required system feedback are preserved
Removing instructional banners SHALL NOT change any functionality, permission, error handling, or required system feedback. Runtime access-denied and view-only alerts, empty states, validation messages, and success/confirmation messages SHALL remain exactly as before.

#### Scenario: Super admin attempts a view-only inventory mutation
- **WHEN** a super admin tries to add, edit, or delete an inventory item
- **THEN** the action is still blocked by the existing read-only permission
- **AND** the existing view-only warning message is still shown

#### Scenario: Empty announcement feed
- **WHEN** a student views the announcements page while no announcements exist
- **THEN** the existing empty-state message is still displayed