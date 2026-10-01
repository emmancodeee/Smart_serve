## ADDED Requirements

### Requirement: Pickup Confirmations is Admin-only
Pickup Confirmations SHALL be an Admin-only feature. The "Pickup Confirmations" sidebar item SHALL be visible to regular Admin accounts and SHALL be hidden from Super Admin accounts at all times. A Super Admin SHALL never see the item during initial render, authentication initialization, role loading, page refresh, session restoration, or navigation.

#### Scenario: Super Admin login never shows the item
- **WHEN** a Super Admin logs in and the sidebar first renders
- **THEN** the "Pickup Confirmations" item SHALL be absent
- **AND** it SHALL remain absent after the account role finishes loading

#### Scenario: Super Admin refresh shows no flash
- **WHEN** a Super Admin refreshes an admin page
- **THEN** the "Pickup Confirmations" item SHALL not appear at any point during loading or after load completes

#### Scenario: Super Admin navigation never shows the item
- **WHEN** a Super Admin navigates between Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, and Feedback Management
- **THEN** the "Pickup Confirmations" item SHALL not appear during any navigation step

#### Scenario: Admin login shows the item
- **WHEN** a regular Admin logs in and the sidebar renders
- **THEN** the "Pickup Confirmations" item SHALL be visible
- **AND** it SHALL remain visible after role confirmation and page refresh

### Requirement: Role-based navigation renders only after role confirmation
The sidebar SHALL not render Admin-only navigation items based on an assumed or default role. Navigation SHALL be calculated only from the confirmed role of the signed-in account. While authentication and role information are still loading, Admin-only items SHALL remain hidden; they SHALL be revealed only after the role is confirmed to be a regular Admin.

#### Scenario: Navigation is not pre-rendered with an assumed Admin role
- **WHEN** an admin page loads but the signed-in account's role has not yet been confirmed
- **THEN** Admin-only sidebar items (including "Pickup Confirmations") SHALL remain hidden
- **AND** no code path SHALL fall back to an Admin role default while the role is unknown

#### Scenario: Items appear only after role confirmation
- **WHEN** the role of the signed-in account is confirmed as a regular Admin
- **THEN** the "Pickup Confirmations" and "Request Management" items SHALL be revealed
- **BUT** when the role is confirmed as Super Admin, those items SHALL stay hidden and the Super Admin-only items SHALL be revealed

### Requirement: Super Admin denied manual access to Pickup Confirmations
The Pickup Confirmations route and admin endpoints SHALL enforce Admin-only access. A Super Admin who manually navigates to the Pickup Confirmations URL SHALL be denied or redirected according to the existing authorization pattern, and SHALL not gain access solely because the sidebar item is hidden.

#### Scenario: Super Admin manual URL is redirected
- **WHEN** a Super Admin manually enters `/admin/pickup-confirmations`
- **THEN** the system SHALL redirect to the Super Admin default view (Dashboard) per the existing role-aware navigation pattern

#### Scenario: Super Admin API access is rejected
- **WHEN** a Super Admin requests `/api/auth/admin/pickup-confirmations` or updates a pickup confirmation via `/api/auth/admin/pickup-confirmations/:id`
- **THEN** the backend SHALL respond with 403 and SHALL not perform the operation

#### Scenario: Admin route and API remain accessible
- **WHEN** a regular Admin opens the Pickup Confirmations view or calls the Pickup Confirmations endpoints
- **THEN** access SHALL be granted and existing functionality SHALL remain unchanged

### Requirement: Existing permissions and sidebar design preserved
The fix SHALL preserve the existing role permissions of all other modules and the existing sidebar design, ordering, styling, and behavior. Only the role-based visibility and backend authorization of Admin-only items SHALL change.

#### Scenario: Super Admin sidebar contents unchanged
- **WHEN** a Super Admin views the sidebar
- **THEN** the visible items are Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, and Feedback Management in the existing order, with no Pickup Confirmations item

#### Scenario: Other modules retain current permissions
- **WHEN** any existing Super Admin or Admin uses Dashboard, Admin Accounts, Inventory Management, Return Requests, Transactions, Announcements, or Feedback Management
- **THEN** their access and behavior SHALL be unchanged from before the fix