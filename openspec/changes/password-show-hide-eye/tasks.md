## 1. Shared Toggle Foundation

- [x] 1.1 Create `public/js/show-password.js`: enhancer that selects target password inputs, wraps each in a `position: relative` container, appends a `type="button"` eye button inside the input boundary, sets inline right padding (~2.75rem) on the input, and binds per-field toggle handlers with independent visibility state (start hidden). No passwords logged/stored; toggle only flips `input.type` between `password` and `text`.
- [x] 1.2 Include inline SVG icons (eye when hidden, eye-slash when visible) and swap the icon path + `aria-label`/`title` (Show password / Hide password) on each toggle.
- [x] 1.3 Add the shared styling (absolute-positioned button, neutral slate colors, hover state, `focus-visible` ring, pointer cursor) in a `<style>` block shipped with the script injection so the icon stays styled, vertically centered, and non-clickable-overlapping regardless of the containing page.

## 2. Login Page (index.html)

- [x] 2.1 Add the toggle to the Login password field (`#password`): reveal/hide independently, `type="button"`, no submit, Enter-to-login unaffected, value never modified.
- [x] 2.2 Add the toggle to the Forgot/Reset password fields (`#newPassword`, `#confirmNewPassword`) with independent per-field visibility state and no effect on reset-code send, reset, or back-to-login behavior.
- [x] 2.3 Load the shared script (and its styles) on this page; confirm login form markup/IDs/classes otherwise unchanged.

## 3. Registration Page (register.html)

- [x] 3.1 Add independent toggles to `#password` and `#confirmPassword`.
- [x] 3.2 Load the shared script/styles on this page; confirm registration OTP flow, validation, and messaging unchanged.

## 4. Profile Page (profile.html)

- [x] 4.1 Add independent toggles to `#oldPassword`, `#newPassword`, `#confirmNewPassword` (Change Password section).
- [x] 4.2 Load the shared script/styles on this page; confirm profile update and change-password validation/behavior unchanged.

## 5. Admin Page (admin.html)

- [x] 5.1 Add independent toggles to the Change My Password fields (`#adminOldPassword`, `#adminNewPassword`, `#adminConfirmNewPassword`).
- [x] 5.2 Add the toggle to the Add-Admin temporary password field (`#newAdminPassword`).
- [x] 5.3 Load the shared script/styles on this page; confirm admin change-password and create-admin flows unchanged.

## 6. Verification

- [x] 6.1 Run `node --check` on `public/js/show-password.js` and confirm no JS loads with errors on each page.
- [ ] 6.2 Browser pass: on Login, Register, Profile Change Password, Admin Change My Password, Add Admin, and Forgot Password — every password field shows an eye initially (hidden), clicking reveals (`type="text"`), clicking again hides, value is unchanged, and only the clicked field toggles (independence).
- [ ] 6.3 Behavior regression: eye click never submits a form, triggers login/reset/change, reloads the page, or clears the field; Enter key still submits login/change-password; validation and error handling still work.
- [ ] 6.4 Styling/accessibility: icon is inside the input, vertically centered, text never overlaps the icon on long values and narrow widths; button is keyboard-focusable with visible focus ring; `aria-label` flips Show/Hide; no unrelated text inputs gained toggles.