# admin-record-actions Spec

## ADDED Requirements

### Requirement: Request Management action buttons

The Request Management Pending Registrations table SHALL render exactly four action buttons per row: `View`, `ORF`, `Approve`, and `Archive`. `View` opens the student detail modal, `ORF` opens the uploaded document in a new tab, `Approve` marks the registration approved through the existing status API, and `Archive` soft-archives the registration. The table SHALL NOT render a `Reject` button, a `Remove` button, or any other destructive action for any row. The buttons SHALL remain aligned and visible without overlapping.

#### Scenario: Pending table renders final action set

- **WHEN** an admin opens the Request Management view with pending registrations
- **THEN** each row shows `View`, `ORF` (when a document exists), `Approve`, and `Archive` buttons

#### Scenario: No Reject or Remove button

- **WHEN** an admin inspects the Request Management Pending Registrations table
- **THEN** no row contains a `Reject` button or a `Remove` button

#### Scenario: View and ORF remain functional

- **WHEN** an admin clicks `View` on a registration row
- **THEN** the existing student detail modal opens
- **WHEN** an admin clicks `ORF` on a row that has an uploaded document
- **THEN** the document opens in a new browser tab

#### Scenario: Approve remains functional

- **WHEN** an admin clicks `Approve` on a pending registration
- **THEN** the registration is approved through the existing `PUT /admin/registrations/:id/status` flow and is removed from the pending table

### Requirement: Inventory Management action buttons

The Inventory Management table SHALL render exactly two action buttons per row: `Edit` and `Archive`. `Edit` opens the existing edit modal and `Archive` soft-archives the inventory item. The table SHALL NOT render a `Delete` button, a `Remove` button, or any other destructive action for any row. The buttons SHALL remain aligned and visible without overlapping.

#### Scenario: Inventory table renders final action set

- **WHEN** an admin opens the Inventory Management table
- **THEN** each row shows `Edit` and `Archive` buttons

#### Scenario: No Delete or Remove button

- **WHEN** an admin inspects the Inventory Management table
- **THEN** no row contains a `Delete` button or a `Remove` button

#### Scenario: Edit remains functional

- **WHEN** an admin clicks `Edit` on an inventory row
- **THEN** the existing edit modal opens with the item's current values

### Requirement: Archive confirmation

The `Archive` action SHALL ask for confirmation before any change is made. When the admin clicks `Archive`, a confirmation prompt with the exact message "Are you sure you want to archive this record?" SHALL be shown. Only the selected record is affected. If the admin cancels, no change is made and the table is unchanged.

#### Scenario: Cancel archive

- **WHEN** an admin clicks `Archive` on a row and then cancels the confirmation
- **THEN** the record is not modified and the table is unchanged

#### Scenario: Confirm archive

- **WHEN** an admin clicks `Archive` on a row and confirms the prompt
- **THEN** only that record is archived

### Requirement: Archive is a non-destructive soft-archive

Archiving a registration or inventory item SHALL mark the record as archived on its existing document using the `isArchived` flag set to `true` and an `archivedAt` timestamp, matching the soft-archive pattern already used by the Feedback module. The record SHALL remain stored in its existing collection and SHALL NOT be permanently deleted. Archived registrations and inventory items SHALL be excluded from the active table listings. After a successful archive, the active table SHALL refresh immediately so the archived record disappears without a page reload.

#### Scenario: Archiving an inventory item keeps the record

- **WHEN** an admin confirms archiving an inventory item
- **THEN** the item's `isArchived` is `true`, `archivedAt` is set, the item remains in the `Inventory` collection, and the Inventory table refreshes and no longer lists it

#### Scenario: Archiving a registration keeps the record

- **WHEN** an admin confirms archiving a registration
- **THEN** the registration's `isArchived` is `true`, `archivedAt` is set, the registration remains in the `Registration` collection, and the Request Management table refreshes and no longer lists it

#### Scenario: Archived records absent from active listings

- **WHEN** the admin Requests list or Inventory list is fetched
- **THEN** records with `isArchived: true` are not returned in the active listing

### Requirement: Archive respects admin permissions

The `Archive` action SHALL be unavailable to super admin view-only accounts, consistent with existing admin approval/reject and inventory mutation behavior. Super admin accounts SHALL NOT be able to archive registrations or inventory items.

#### Scenario: Super admin cannot archive

- **WHEN** a super admin in view-only mode attempts to archive a registration or inventory item
- **THEN** the action is blocked and no archive is performed

### Requirement: Admin interface is not redesigned

The Admin interface SHALL keep its existing sidebar, header, colors, typography, table design, spacing, and button styling. Only the Actions column buttons and their behavior may change. New buttons SHALL reuse the existing button styling patterns and SHALL be aligned, visible, and non-overlapping.

#### Scenario: Existing UI preserved

- **WHEN** an admin loads the Request Management or Inventory Management views after this change
- **THEN** all layout, styling, and non-action UI remain identical to the prior design, and only the Actions column differs