## Context

Smart Serve is a server-rendered Express.js app (vanilla JS frontend in `public/`, no React). The Student > User Profile > Edit Your Profile form is built from `public/profile.html` and `public/js/profile.js`.

An audit of the current state found:

- There is **no** `admin123` literal in any frontend source file. The string only exists in server-side secrets/seed scripts (`.env`, `setup-admins.js`), which are never sent to the browser.
- `#oldPassword` has no `value` attribute and `loadUserInfo()` only prefills `editName` and `editEmail` from `GET /api/auth/me`.
- The backend never returns passwords: `/api/auth/me` uses `.select('-password')` and `buildCurrentUserPayload()` deletes the password field. Passwords are always bcrypt-hashed and verified server-side via `comparePassword()`.
- Because the input uses `autocomplete="current-password"`, the visible stale `admin123` is most likely browser autofill of a previously saved credential, not application state.

The fix must therefore guarantee - defensively - that no stale/default password can ever be populated into the Old Password field, while keeping the existing verification flow intact.

## Goals / Non-Goals

**Goals:**
- The Old Password field must never display a hardcoded, default, fallback, or stale-saved password (specifically `admin123`).
- The field must be empty on page load and cleared after a successful password change.
- The proper current-password verification flow is retained: the student types their current password, and it is verified server-side only.
- No plaintext password is stored in, or rendered from, frontend source, initial state, localStorage, sessionStorage, or cached profile data.

**Non-Goals:**
- No backend, API, database, or login/authentication changes.
- No changes to the layout, name/email/new/confirm fields, eye-toggle buttons, Update Profile button, sidebar, or header.
- No changes to seed/`.env` configuration (server-side defaults are out of scope and never rendered to the browser).

## Decisions

**1. Never prefill password fields from any application data.**
`loadUserInfo()` keeps prefilling only `editName` and `editEmail`. Add an explicit safe-guard in the profile page logic that no code path assigns a value to `#oldPassword`, `#newPassword`, or `#confirmNewPassword`.
- Alternative considered: reading the "current password" from the backend. Rejected - the backend intentionally never returns passwords, and exposing them would violate the security requirement.

**2. Disable credential autofill on the Old Password field.**
Change the `#oldPassword` input from `autocomplete="current-password"` to `autocomplete="off"`. This stops the browser from auto-filling a stale saved credential (the old `admin123`) into the field on page load - the most likely root cause of the visible issue.
- Alternative considered: keeping `autocomplete="current-password"` and clearing via JS. Rejected as unreliable - browsers autofill after initial JS runs, so a one-shot clear can still be overridden. `autocomplete="off"` is the most robust signal we can send.
- Trade-off: password managers lose autofill hints for this one input. Acceptable because the field is only meaningful while a student is actively changing their password.

**3. Clear the password fields after a successful update.**
In the `editProfileForm` submit handler, after the password-change call and the profile-update call succeed, reset `#oldPassword`, `#newPassword`, and `#confirmNewPassword` to empty strings so no stale value remains in the DOM.

**4. Zero frontend changes to auth logic.**
`GET /api/auth/me`, `PUT /api/auth/update-profile`, and `PUT /api/auth/change-password` keep their exact behavior. Backend unchanged.

**5. Regression guard against any default-password literal.**
During implementation, scan `public/` (and the whole app source, excluding `.env`-style secrets and seed scripts) for `admin123` and other obvious plaintext default-password literals, and confirm there are no matches before the change is considered complete.

## Risks / Trade-offs

- Browser autofill behavior is browser-dependent and `autocomplete="off"` is not honored in every case → Mitigation: the field has no `value` attribute and no code assigns it a value; combined with clearing on submit, the app itself never renders a stale password, so even if a browser autofills, it is a client-side saved-credential issue outside the app's control. Optionally clear the field on `pageshow`.
- Weakened password-manager autofill for the current-password field → Mitigation: acceptable, current password is only needed when changing the password, and correctness/security takes priority.
- Risk of accidentally touching unrelated fields/logic during cleanup → Mitigation: change is scoped to `public/profile.html` (Old Password input attribute) and `public/js/profile.js` (password-field handling only).