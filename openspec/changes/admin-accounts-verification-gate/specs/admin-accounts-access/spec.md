## ADDED Requirements

### Requirement: Super Admin verification gate for Admin Account Management
The system SHALL require a Super Admin to re-enter their email and password before the Admin Account Management view opens. Navigating to Admin Accounts MUST first show a verification screen and MUST NOT show admin accounts until verification succeeds.

#### Scenario: Opening Admin Accounts requires verification
- **WHEN** a logged-in Super Admin navigates to Admin Accounts (via sidebar, direct URL `/admin/accounts`, or browser back/forward)
- **THEN** the system shows the verification screen with email and password fields
- **AND** the Admin Account Management content is hidden until verification succeeds

#### Scenario: Verified Super Admin opens Admin Accounts
- **WHEN** a Super Admin has already verified successfully in this session and opens Admin Accounts again
- **THEN** the system shows the Admin Account Management content directly without the verification screen

### Requirement: Reuse existing authentication and existing account
The system SHALL validate the entered email and password against the existing Super Admin account using the existing authentication infrastructure. The system MUST NOT create a new account type, introduce hard-coded credentials, or bypass the existing password hashing.

#### Scenario: Credentials validated against existing account
- **WHEN** a Super Admin submits an email and password for verification
- **THEN** the system checks the password against the stored bcrypt hash of the existing Admin account matching that email

#### Scenario: No credential material in source or config
- **WHEN** the application is inspected
- **THEN** no Super Admin password or derivatives are hard-coded in source or configuration files

### Requirement: Server-side verification endpoint
The system SHALL provide an authenticated endpoint that verifies a Super Admin's email and password before access to Admin Account Management is granted. The endpoint SHALL require an active admin session and SHALL return success only for valid Super Admin credentials.

#### Scenario: Successful verification request
- **WHEN** an authenticated Super Admin submits valid email and password to the verification endpoint
- **THEN** the endpoint returns a success response

#### Scenario: Invalid credentials rejected
- **WHEN** an authenticated Super Admin submits an email or password that does not match an existing Super Admin account
- **THEN** the endpoint returns an error response with message "Invalid email or password. Please try again."

#### Scenario: Non-Super Admin denied
- **WHEN** an authenticated non-Super Admin (regular admin) requests verification
- **THEN** the endpoint returns a forbidden response and does not grant access

### Requirement: Session-scoped verification state
The system SHALL remember a successful verification only for the current authenticated session. Verification MUST be cleared when the Super Admin logs out, and a new login session MUST require verification again.

#### Scenario: Verification persists within the session
- **WHEN** a Super Admin verifies successfully and then navigates away from and back to Admin Accounts without logging out
- **THEN** the system does not ask for credentials again

#### Scenario: Verification cleared on logout
- **WHEN** a Super Admin logs out after verifying
- **THEN** the verification state is cleared
- **AND** the next login session requires verification before Admin Accounts opens

#### Scenario: Direct URL does not bypass verification
- **WHEN** a Super Admin opens `/admin/accounts` directly while unverified in the session
- **THEN** the system shows the verification screen instead of Admin Account Management content

### Requirement: Password never stored client-side
The system SHALL NOT store the password or any derivable credential material in localStorage, sessionStorage, source code, or logs. Only a boolean verification status may be persisted, and it SHALL be scoped to the session.

#### Scenario: Password not persisted
- **WHEN** the verification form is filled and submitted
- **THEN** no browser storage contains the password
- **AND** the stored data contains at most a session-scoped verified flag

### Requirement: Admin Account Management preserved
The system SHALL keep the existing Admin Account Management features unchanged: filters, export, Create Admin Account, Change My Password, and the admin accounts table. The verification gate MUST NOT alter these behaviors after successful verification.

#### Scenario: Features available after verification
- **WHEN** a Super Admin verifies successfully
- **THEN** the existing Admin Account Management page renders exactly as before including all filters, export, Create Admin, Change My Password, and the accounts table