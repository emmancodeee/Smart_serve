## Why

Users often mistype long or complex passwords during login and password changes and have no way to verify what they entered. Add a show/hide eye toggle to every auth and password-management password field so users can confirm their input at a glance — without altering any existing authentication, validation, or security behavior.

## What Changes

- Add a clickable eye / eye-slash button inside (right side of) every password input used for authentication and password management.
- The toggle switches the input `type` between `password` and `text`, nothing more; the password value, validation, submission, and API behavior are unchanged.
- Each password field gets its own independent visibility state (no shared toggle across fields).
- Buttons are `type="button"`, never submit forms, never trigger login/reset/change, never clear or alter the value, and are keyboard accessible with "Show password" / "Hide password" labels.
- Applies to: Login, Forgot/Reset Password, Registration, Profile Change Password, Admin Change My Password, and the Add-Admin temporary-password field.
- Copy/behavioral styling matches the existing SmartServe design (input border-radius, colors, spacing); no page redesign.

## Capabilities

### New Capabilities
- `password-field-visibility`: Show/hide toggle (eye / eye-slash button) injected into password inputs across the login, reset-password, registration, change-password and admin password forms; independent per-field state, no change to underlying auth/validation/security behavior.

### Modified Capabilities
- (none — no existing specs to modify)

## Impact

- **Files (frontend only):**
  - `public/index.html` — Login `#password`; Forgot/Reset `#newPassword`, `#confirmNewPassword`
  - `public/register.html` — `#password`, `#confirmPassword`
  - `public/profile.html` — Change Password `#oldPassword`, `#newPassword`, `#confirmNewPassword`
  - `public/admin.html` — Change My Password `#adminOldPassword`, `#adminNewPassword`, `#adminConfirmNewPassword`; Add Admin `#newAdminPassword`
  - Shared CSS/JS (page-specific inline styles or shared asset) for the eye-button styling and toggling logic
- **APIs / backend:** none — no API, route, model, or auth-logic changes; passwords are never logged or stored client-side and are transmitted exactly as before.
- **No dependencies** added: icons/styling implemented with existing assets/inline SVG so no new libraries.
- **No breaking changes.**