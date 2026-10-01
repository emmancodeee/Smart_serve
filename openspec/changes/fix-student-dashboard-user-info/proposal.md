## Why

When a student logs in and opens `/dashboard#dashboard`, an alert appears saying "Error loading user info". The root cause is twofold: (1) the `loadUserInfo()` function in `dashboard.js` and `profile.js` uses a single generic `catch` block that shows a vague alert for ALL failure types — network errors, 503 database-unavailable responses, 401 auth failures, and client-side JavaScript exceptions — making it impossible to diagnose or recover gracefully; (2) the error handler destructively removes the auth token and redirects to login on EVERY failure, even transient server errors where the token is still valid.

## What Changes

- Replace the single generic `catch` block in `loadUserInfo()` with differentiated error handling that distinguishes between: network/server-unreachable errors, HTTP error responses (401, 403, 404, 503), and client-side processing errors
- Stop removing the auth token on 503 (database unavailable) and server-down errors — only remove on 401 (invalid token)
- Replace the bare `alert()` calls with contextual inline status messages in the dashboard UI
- Add `console.error` logging with structured error details for developer debugging
- Apply the same fixes to `profile.js` which has the identical pattern
- Preserve all existing dashboard functionality, layout, navigation, and authentication flow

## Capabilities

### New Capabilities
- `user-info-error-handling`: Graceful, differentiated error handling for the `/api/auth/me` endpoint on the student dashboard and profile pages

### Modified Capabilities

## Impact

- **Frontend files**: `public/js/dashboard.js` (loadUserInfo function, lines 1506-1551), `public/js/profile.js` (loadUserInfo function, lines 47-76)
- **Backend files**: None — the backend `/api/auth/me` endpoint and its error responses are correct as-is
- **API endpoint involved**: `GET /api/auth/me`
- **Authentication**: Token handling logic changes (stop removing valid tokens on transient errors)
- **No database changes**: No schema or query modifications
- **No breaking changes**: Error responses from the backend remain the same; only frontend handling changes
