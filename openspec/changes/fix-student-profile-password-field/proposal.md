## Why

The Student > User Profile > Edit Your Profile section exposes the stale default password `admin123` in the Current/Old Password field. The account password has already been changed and the system authenticates with the new password, but the Old Password field still shows the outdated default. This makes the profile page look broken and misleads the student into thinking their (old) password is still in use, and it reflects a hardcoded/fallback password value that must not exist in the frontend.

## What Changes

- Remove the hardcoded `admin123` (or any default/fallback) value from the Old Password field so it can never be displayed in the Edit Your Profile form.
- Guarantee the Old Password field is always empty on page load; it must not be pre-populated from initial state, localStorage/sessionStorage, cached profile data, API response mapping, or any other source.
- Clear the Old Password, New Password, and Confirm New Password fields after a successful profile/password update.
- Prevent the browser from auto-filling a stale saved password (e.g. an old saved `admin123`) into the Current Password/autofill-enabled field.
- Keep the existing proper current-password verification flow: the student types their current password manually and it is verified server-side via `comparePassword`; no plaintext password is ever retrieved, stored, or rendered in the frontend.
- Add a guardrail (grep/scan + regression check) confirming no `admin123` or other plaintext default password remains in frontend/application source.

## Capabilities

### New Capabilities
- `student-profile-password-field`: Defines how the Edit Your Profile Current/Old Password field behaves within the student profile page - it must never be populated with a hardcoded/default/fallback password, must be empty until the student types it, must be cleared after a password change, and must rely on the backend's server-side current-password verification rather than exposing any plaintext password.

### Modified Capabilities
<!-- No existing spec covers profile/auth behavior, so no delta specs are needed. -->

## Impact

- **Frontend**: `public/profile.html` (Edit Your Profile form / Old Password input `autocomplete` handling) and `public/js/profile.js` (form prefill, password-change submit handler, post-update cleanup).
- **Frontend helper**: `public/js/show-password.js` (eye toggle only - must keep working; no password values involved).
- **Backend**: None. No API contract changes, no database changes, no authentication/login changes.
- **Config**: Do not touch `.env`/`.env.example`/`setup-admins.js` (server-side seed defaults only, not rendered to the browser).