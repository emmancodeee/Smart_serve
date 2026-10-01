## 1. Audit existing password sourcing

- [x] 1.1 Search the entire frontend (`public/`) and application source for hardcoded password literals (`admin123`, `DemoUser123!`, etc.) and confirm none are used to populate the Old Password field in the Edit Your Profile form
- [x] 1.2 Confirm `GET /api/auth/me` response never contains a password field (check `authService.js` `buildCurrentUserPayload` and `.select('-password')`) and never pre-fills `#oldPassword` in `profile.js`
- [x] 1.3 Confirm no password value is stored in or read from localStorage/sessionStorage/cached student profile by the profile page (check `StudentHeader` cache usage in `profile.js`)

## 2. Fix the Old Password field

- [x] 2.1 In `public/profile.html`, remove any `value` attribute or default/fallback from the `#oldPassword` input so it renders empty
- [x] 2.2 In `public/profile.html`, change the `#oldPassword` input's `autocomplete="current-password"` to `autocomplete="off"` so browsers do not auto-fill a stale saved credential (e.g., old `admin123`) into the field
- [x] 2.3 In `public/js/profile.js`, ensure `loadUserInfo()` only pre-fills Name and Email and never assigns a value to `#oldPassword`, `#newPassword`, or `#confirmNewPassword`

## 3. Clear password fields after update

- [x] 3.1 In `public/js/profile.js` submit handler, after a successful password change, clear `#oldPassword`, `#newPassword`, and `#confirmNewPassword`
- [x] 3.2 In `public/js/profile.js`, ensure the same fields are cleared after a successful profile update (so no stale value remains in the DOM)
- [x] 3.3 Verify the eye/show-password toggle in `public/js/show-password.js` still works on the password fields after the changes (it only toggles `input.type`, no value logic changed)

## 4. Regression checks

- [x] 4.1 Search the codebase for `admin123` and confirm it only exists outside the frontend (e.g., `.env`/seed scripts) and can never be rendered by the browser
- [x] 4.2 Manually verify Edit Your Profile: Old Password field is empty on load, a successful password change clears the field, and authentication still works with the new password
- [x] 4.3 Confirm no changes were made to login, authentication, user profile layout, Name/Email/New/Confirm fields, Update Profile button, sidebar, header, database, or other student modules