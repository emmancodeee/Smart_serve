## ADDED Requirements

### Requirement: Differentiated error handling for user info loading
The system SHALL differentiate between authentication failures, server unavailability, and network errors when loading user information via `GET /api/auth/me`, displaying an appropriate message for each case.

#### Scenario: Successful user info load
- **WHEN** the student dashboard loads and `GET /api/auth/me` returns 200 with valid user JSON
- **THEN** the user's name, email, status, and profile data are displayed in the dashboard
- **AND** no error message is shown

#### Scenario: Authentication failure (401)
- **WHEN** `GET /api/auth/me` returns 401 (invalid or expired token)
- **THEN** the auth token is removed from localStorage
- **AND** the user is redirected to the login page

#### Scenario: Server database unavailable (503)
- **WHEN** `GET /api/auth/me` returns 503 (database guard middleware)
- **THEN** an inline message is displayed: "Server temporarily unavailable. Please try again shortly."
- **AND** the auth token is preserved in localStorage
- **AND** the user is NOT redirected to login
- **AND** a retry button is visible

#### Scenario: Other HTTP error responses
- **WHEN** `GET /api/auth/me` returns any non-200, non-401, non-503 status code
- **THEN** an inline message is displayed showing the error
- **AND** the auth token is preserved in localStorage
- **AND** the user is NOT redirected to login

#### Scenario: Network error (server unreachable)
- **WHEN** `GET /api/auth/me` fails with a network error (fetch throws)
- **THEN** an inline message is displayed: "Cannot reach the server. Check your connection and try again."
- **AND** the auth token is preserved in localStorage
- **AND** the user is NOT redirected to login
- **AND** a retry button is visible

### Requirement: Inline error display instead of alert dialogs
The system SHALL display error messages inline in the page DOM instead of using `alert()` dialogs for user info loading failures.

#### Scenario: Error message visibility
- **WHEN** a user info loading error occurs (503, network error, or other non-401 error)
- **THEN** an error container element becomes visible near the dashboard header or profile area
- **AND** the error container shows a descriptive message appropriate to the error type
- **AND** no `alert()` dialog is shown

#### Scenario: Error message dismissal on success
- **WHEN** a user info loading error was previously shown and the user clicks retry or the page reloads successfully
- **THEN** the error container is hidden
- **AND** the normal dashboard content is displayed

### Requirement: Retry capability for transient errors
The system SHALL provide a retry mechanism for transient errors (503, network errors) that re-attempts the user info request without requiring re-authentication.

#### Scenario: Retry after server unavailable
- **WHEN** the error message for server unavailability is shown and the user clicks the retry button
- **THEN** the system re-calls `GET /api/auth/me` with the existing auth token
- **AND** if the retry succeeds, the user info is displayed and the error message is hidden
- **AND** if the retry fails, the error message is updated with the new error

#### Scenario: Retry after network error
- **WHEN** the error message for network failure is shown and the user clicks the retry button
- **THEN** the system re-calls `GET /api/auth/me` with the existing auth token
- **AND** the error message is cleared while the retry is in progress

### Requirement: Console error logging for developers
The system SHALL log structured error details to `console.error` for all user info loading failures, including error type, HTTP status code, and response body where available.

#### Scenario: Developer debugging network error
- **WHEN** `GET /api/auth/me` fails with a network error
- **THEN** `console.error` is called with the error object containing the fetch failure details

#### Scenario: Developer debugging HTTP error
- **WHEN** `GET /api/auth/me` returns a non-200 HTTP status
- **THEN** `console.error` is called with the status code and response body
