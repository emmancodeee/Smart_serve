# Announcement Archive Action

## ADDED Requirements

### Requirement: Delete button removed from announcements

The Actions column in the Admin > Announcements table MUST NOT show a Delete button, and no Delete affordance (button, icon-only action, or link) SHALL appear anywhere in the Announcements module UI for admins.

#### Scenario: No delete button in the Actions column
- **WHEN** an announcement row is rendered in the Admin > Announcements table
- **THEN** the Actions cell contains only `Edit` and `Archive`, with no Delete button or delete-style icon present

#### Scenario: No delete affordance anywhere in the module
- **WHEN** the Admin > Announcements page is fully rendered
- **THEN** no element labeled Delete (or performing a delete action) exists anywhere on the page

### Requirement: Archive button replaces Delete

The Actions column SHALL show `[ Edit ] [ Archive ]` beside each announcement row. The Archive button label SHALL be exactly `Archive`, it SHALL use the same Smart Serve action-button styling and sizing as the surrounding action buttons (with the `Edit` button unchanged), and it SHALL occupy the same column position the Delete button occupied.

#### Scenario: Archive button rendered beside Edit
- **WHEN** an announcement row is rendered
- **THEN** an `Archive` button appears in the Actions column, the same size and position as the `Edit` button beside it, and the `Edit` button is unchanged

#### Scenario: Label and styling match module conventions
- **WHEN** the Archive button is inspected
- **THEN** its visible label is exactly `Archive` and it uses the same button styling/sizing as the module's other action buttons

### Requirement: Archive is functional (soft archive via confirmation)

Selecting Archive SHALL show the confirmation dialog with the exact message `Are you sure you want to archive this announcement?`. Cancelling SHALL do nothing. Confirming SHALL soft-archive the announcement through the existing authenticated admin API in the existing `Announcement` collection/state: the record is marked archived and MUST NOT be permanently deleted or duplicated. Archiving SHALL NOT affect any other announcement's fields, visibility, or expiration behavior.

#### Scenario: Confirmation before archiving
- **WHEN** Archive is clicked
- **THEN** a confirmation dialog shows the exact message "Are you sure you want to archive this announcement?"

#### Scenario: Cancel is a no-op
- **WHEN** the confirmation is cancelled
- **THEN** no API call is made and the announcements list is unchanged

#### Scenario: Confirm soft-archives
- **WHEN** the confirmation is accepted
- **THEN** the announcement is marked as archived (retained in the existing store, not deleted, not duplicated) through the existing authenticated admin API

#### Scenario: Other announcements unaffected
- **WHEN** one announcement is archived
- **THEN** every other announcement's fields, visibility, and expiration behavior remain unchanged

### Requirement: Reuse existing mechanisms

The archive action SHALL go through the existing admin authentication, admin service (`resolveAuthenticatedAdmin`), the existing `Announcement` model/collection, and the existing transaction-logging mechanism used by the previous delete flow. No new database, collection, field duplication, hard-coded data, or separately stored archive list SHALL be introduced.

#### Scenario: Archive uses the existing announcement store and services
- **WHEN** an announcement is archived
- **THEN** the action is performed against the existing `Announcement` collection via the authenticated admin service and an admin transaction is logged, reusing the module's existing mechanisms

#### Scenario: No parallel store
- **WHEN** the archive action is implemented
- **THEN** no new database, archive-specific collection, or duplicate record is created

### Requirement: Hidden from active lists and immediately refreshed

After archiving, the announcement SHALL disappear immediately from the active Admin > Announcements list (table refresh triggered right after the action) and from the student announcements feed. Existing (non-archived) announcements SHALL continue to appear unchanged in both lists. The archived record SHALL remain stored so it can still be handled by any existing archive functionality later.

#### Scenario: Admin table refreshes and hides the archived row
- **WHEN** an archive succeeds
- **THEN** the admin announcements table refreshes and that row no longer appears, while all non-archived announcements still appear

#### Scenario: Student feed hides archived announcements
- **WHEN** the student announcements feed is loaded
- **THEN** an announcement that has been archived no longer appears, while non-archived announcements appear unchanged

#### Scenario: Record retained
- **WHEN** an announcement has been archived
- **THEN** the record remains stored in the existing collection for any existing archive functionality to handle

### Requirement: No UI redesign

Sidebar, header, colors, typography, spacing, filters, form, and table structure of the Announcements module SHALL remain unchanged except for the Actions-column button replacement specified above.

#### Scenario: Page appearance preserved
- **WHEN** the Admin > Announcements page is rendered
- **THEN** every element other than the Actions-column `Delete → Archive` replacement is identical to its prior presentation