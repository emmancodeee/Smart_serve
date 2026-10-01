## Why

Students cannot log in to the dashboard after registration or password reset. Several issues in the login flow block access: the login endpoint does not verify account status, the JWT secret is a placeholder causing token verification failures on server restarts, and the dashboard lacks server-side authentication checks.

## What Changes

- Add account status validation to the login endpoint to block rejected/disabled students with a clear message
- Replace the default JWT secret with a securely generated value and invalidate tokens on secret change
- Add server-side authentication guard to the `/dashboard` route
- Improve error messages on login failure to distinguish between credential errors and account status blocks
- Add account lockout after consecutive failed login attempts per email

## Capabilities

### New Capabilities
- `account-status-gate`: Validates user's `status` field (`pending`, `approved`, `rejected`) during login. Rejected accounts are blocked with a descriptive error. Pending accounts receive a notice to wait for approval.
- `login-rate-lockout`: Per-email failed attempt tracking with progressive lockout (resets on successful login or after cooldown).

### Modified Capabilities
- (none — spec-level requirements are not changing; this is implementation-level bug fixing)

## Impact

- `services/authService.js` — `loginAccount` gains status check and failed-attempt tracking
- `public/js/dashboard.js` — client-side auth check is supplemented but not replaced
- `server.js` — `/dashboard` route gets authentication middleware
- `models/User.js` — may add `failedLoginAttempts` and `lockedUntil` fields
- `.env` — JWT_SECRET must be regenerated
