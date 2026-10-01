## ADDED Requirements

### Requirement: No hardcoded or default password in Old Password field
The Edit Your Profile Current/Old Password field SHALL NOT be populated with any hardcoded, default, or fallback password value (including `admin123`) from frontend source code, initial component state, cached profile data, localStorage, or sessionStorage. The frontend source SHALL NOT contain a plaintext default password literal intended to be displayed in this field.

#### Scenario: Profile page loads with no default value
- **WHEN** a student opens the User Profile > Edit Your Profile section
- **THEN** the Old Password field is empty and does not display any default password
- **AND** scanning the application frontend source finds no `admin123` (or similar default-password literal) used as a value for the Old Password field

#### Scenario: Field is never pre-filled from cached or stored data
- **WHEN** a student's profile loads even when a cached student profile or token exists in localStorage
- **THEN** the Old Password field remains empty because only the Name and Email fields are pre-filled from the profile

### Requirement: Current password is entered and verified by the student
The system SHALL require the student to type their current password manually and SHALL verify it server-side. The system SHALL NOT retrieve or display a stored plaintext or hashed password to populate the Current Password field.

#### Scenario: Backend profile response does not provide a password
- **WHEN** the profile page receives the `GET /api/auth/me` response
- **THEN** only the Name and Email fields are pre-filled
- **AND** the password fields are never set from the response, because the API never returns password data

#### Scenario: Incorrect current password is rejected
- **WHEN** a student submits a password change with a wrong current password
- **THEN** the backend rejects the request with an error
- **AND** the account password is unchanged

### Requirement: Password fields are cleared after a successful update
After a successful password change or profile update, the system SHALL clear the Old Password, New Password, and Confirm New Password fields so no stale or outdated value remains displayed.

#### Scenario: Password changed successfully
- **WHEN** a student changes their password to a new value and the update succeeds
- **THEN** the Old Password, New Password, and Confirm New Password fields are cleared
- **AND** the Old Password field does not revert to any previous default value such as `admin123`

#### Scenario: Authentication uses the new password afterwards
- **WHEN** the student signs out and signs back in after a successful password change
- **THEN** authentication succeeds only with the new password
- **AND** the Edit Your Profile Old Password field still shows an empty value rather than the old default password

### Requirement: Browser must not auto-fill a stale saved password
The Old Password input SHALL be configured so that browsers do not auto-fill previously saved credentials (such as an old `admin123`) into the Current Password field when the profile page loads.

#### Scenario: Page load with a saved credential present
- **WHEN** a student opens the Edit Your Profile section while their browser holds a saved older password for the site
- **THEN** the browser does not auto-fill that saved password into the Old Password field
- **AND** the field remains empty until the student types their current password

### Requirement: No plaintext password stored in the frontend
The system SHALL NOT store plaintext passwords in frontend source code, localStorage, or sessionStorage as part of the profile flow.

#### Scenario: No password persisted in storage after profile activity
- **WHEN** a student completes profile and password-change operations
- **THEN** no password value (old or new, plaintext or hashed) exists in localStorage or sessionStorage
- **AND** no plaintext password literal is added to frontend source as part of this flow