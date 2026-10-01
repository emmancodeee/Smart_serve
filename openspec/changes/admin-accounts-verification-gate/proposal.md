## Why

The Admin Account Management section allows the Super Admin to create, delete, and change passwords for administrator accounts — the most sensitive operation in the system. Today it opens with no additional step for anyone who already has an active admin session, so a logged-in Super Admin's session can be used unattended to manage admin accounts. Adding a confirmation step makes the module safer.

## What Changes

- Show a verification screen before Admin Account Management opens. The Super Admin must re-enter their email and password using the existing Super Admin account and the existing authentication system. No new account, no hard-coded credentials, no separate auth flow.
- Add a server endpoint that verifies the entered credentials against the existing Admin account while the current admin session is still active.
- Enforce a session-scoped verification state: once verified, Admin Account Management stays open for the rest of the authenticated session, and reverification is required after logging out and back in.
- Enforce role authorization so only a Super Admin can pass verification and access Admin Account Management; regular Admins and Students cannot bypass the gate.
- Protect direct URL access (`/admin/accounts`) so it still requires verification before the admin accounts view is shown.
- Never store the password in localStorage, sessionStorage, source, or logs — only a boolean "verified" flag may be persisted, and it is scoped to the session.
- Keep the existing Admin Account Management page unchanged (filters, export, Create Admin, Change My Password, admin table).

## Capabilities

### New Capabilities
- `admin-accounts-access`: gating access to the Admin Account Management page behind a Super Admin re-verification step that reuses the existing authentication system.

### Modified Capabilities
<!-- None. No existing spec covers Admin Account Management access. -->

## Impact

- `routes/auth.js` — add an auth-protected endpoint under the existing `/api/auth/admin` router that verifies a Super Admin's email + password against the existing Admin record.
- `services/authService.js` / `controllers/authController.js` — verification logic reusing the existing Admin model, bcrypt `comparePassword`, and `isSuperAdminAccount` check.
- `public/admin.html` — a verification card section shown in place of the admin accounts view until verified.
- `public/js/admin.js` — gate logic in the admin SPA view routing, session-scoped verified flag, empty-field and error messages, submit loading state, logout cleanup.
- No changes to `models/Admin.js`, the login flow, the JWT system, or existing Admin Account Management features.