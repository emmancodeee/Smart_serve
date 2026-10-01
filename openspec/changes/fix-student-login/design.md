## Context

The PHINMA SmartServe student portal uses JWT-based authentication with Express and MongoDB. The `loginAccount` function in `authService.js` currently only validates email/password and returns a token. It does not check the user's `status` field (`pending`/`approved`/`rejected`), leaving the dashboard accessible to rejected accounts. The JWT secret in `.env` is still the default placeholder, making token signing predictable. There is no per-account lockout for brute-force protection. The `/dashboard` route (server.js:256) serves static HTML without server-side auth verification, relying entirely on client-side `localStorage` checks.

## Goals / Non-Goals

**Goals:**
- Block login for accounts with `status: 'rejected'` with a clear error message
- Warn `pending` accounts at login to wait for admin approval
- Track failed login attempts per email and impose a temporary lockout after 5 consecutive failures
- Add server-side authentication middleware to the `/dashboard` Express route
- Replace the default JWT_SECRET with a securely generated value

**Non-Goals:**
- Email verification flow changes (broken email transport is a separate concern)
- Password complexity or rotation policies
- Session management or token refresh mechanics
- Admin approval workflow changes

## Decisions

- **Status check at login vs. at middleware layer**: Checking `user.status` in `loginAccount` (authService.js) gives the user immediate feedback at login time. A middleware-level check would only catch requests after authentication. Decision: validate during login.
- **Failed-attempt storage**: Store `failedLoginAttempts` and `lockedUntil` directly on the User document (Mongoose model) rather than in Redis or an in-memory map. This survives server restarts and avoids adding a Redis dependency for a simple counter.
- **Lockout duration**: 15-minute lockout after 5 consecutive failures. Resets on successful login or after the cooldown expires.
- **Dashboard route protection**: Use `authenticateAccount` middleware on the Express route. On failure, redirect to `/` rather than returning JSON, since the client expects HTML.
- **JWT_SECRET regeneration**: Generate a random 64-character string. No token invalidation mechanism needed (tokens expire naturally in 7 days). The previous placeholder was never used in a real deployment.

## Risks / Trade-offs

- [Failed-attempt storage on User document] → Every failed login writes to the User collection. Under brute-force attacks, this adds write pressure. Mitigation: the IP-based `loginLimiter` in server.js already rate-limits globally; per-email lockout is a secondary defense.
- [Dashboard middleware returns 302 on auth failure] → fetch/XHR calls to `/dashboard` will follow the redirect. This only affects the HTML page request; API routes are unaffected.
- [Token expiry mismatch after secret change] → Existing tokens signed with the old placeholder will become invalid. Mitigation: document the secret rotation in the migration instructions.
