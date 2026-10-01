## ADDED Requirements

### Requirement: Login blocks rejected accounts
The system SHALL reject login attempts for accounts with `status` set to `'rejected'` and return a descriptive error message.

#### Scenario: Rejected student attempts to log in
- **WHEN** a student with `status: 'rejected'` submits valid credentials to `/api/auth/login`
- **THEN** the system SHALL return HTTP 401 with `{ error: "Your account has been rejected. Please contact the administrator." }`

#### Scenario: Rejected student password is never compared
- **WHEN** a student with `status: 'rejected'` submits any credentials to `/api/auth/login`
- **THEN** the system SHALL NOT invoke password comparison against that account

### Requirement: Login warns pending accounts
The system SHALL allow login for accounts with `status: 'pending'` but return a warning message.

#### Scenario: Pending student logs in
- **WHEN** a student with `status: 'pending'` submits valid credentials to `/api/auth/login`
- **THEN** the system SHALL return HTTP 200 with a token and include `{ warning: "Your registration is pending review. Some features may be limited." }`

### Requirement: Approved students log in normally
The system SHALL allow login for accounts with `status: 'approved'` without any additional restrictions.

#### Scenario: Approved student logs in
- **WHEN** a student with `status: 'approved'` submits valid credentials to `/api/auth/login`
- **THEN** the system SHALL return HTTP 200 with a token and no status warning
