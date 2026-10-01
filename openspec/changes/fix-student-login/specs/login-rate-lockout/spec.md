## ADDED Requirements

### Requirement: Lock account after consecutive failed login attempts
The system SHALL track consecutive failed login attempts per email and temporarily lock the account after a configurable threshold.

#### Scenario: Five failed attempts trigger lockout
- **WHEN** a student submits incorrect credentials to `/api/auth/login` five times consecutively for the same email
- **THEN** the system SHALL return HTTP 429 with `{ error: "Account temporarily locked due to too many failed attempts. Try again in 15 minutes." }`

#### Scenario: Lockout expires after cooldown period
- **WHEN** a student attempts to log in after the 15-minute lockout cooldown has elapsed
- **THEN** the system SHALL allow the login attempt and reset the failed-attempt counter

#### Scenario: Successful login resets counter
- **WHEN** a student with prior failed attempts successfully logs in
- **THEN** the system SHALL reset the `failedLoginAttempts` counter to zero

### Requirement: Dashboard route requires authentication
The `/dashboard` Express route SHALL verify the JWT token before serving the HTML page.

#### Scenario: Unauthenticated request to /dashboard
- **WHEN** a browser requests `/dashboard` without a valid JWT token
- **THEN** the server SHALL redirect to `/` with HTTP 302

#### Scenario: Authenticated request to /dashboard
- **WHEN** a browser requests `/dashboard` with a valid JWT token in the Authorization header
- **THEN** the server SHALL serve `public/dashboard.html`
