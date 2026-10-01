## ADDED Requirements

### Requirement: Password fields have a show/hide toggle button
Every password input used for authentication and password management SHALL have an eye toggle button rendered inside the input area (on the right side). This includes the login password field, forgot/reset password fields (new + confirm), registration fields (password + confirm), profile change-password fields (current + new + confirm), and admin change-my-password fields (current + new + confirm), as well as the add-admin temporary-password field.

#### Scenario: Toggle present on every targeted field
- **WHEN** a user opens the Login, Registration, Profile Change Password, Admin Change My Password, Add Admin, or Forgot/Reset Password form/field
- **THEN** every password input in that form has a visible eye button inside its input boundary on the right side

#### Scenario: No unrelated inputs affected
- **WHEN** a non-password text input is rendered on any of these pages
- **THEN** it has no eye button and no visibility-toggle behavior

### Requirement: Toggle switches only the input type
The eye button SHALL toggle the associated input between `type="password"` (hidden) and `type="text"` (visible). Toggling SHALL NOT modify the input value, placeholders, name, id, autocomplete, or any other attribute, and SHALL NOT change how the value is transmitted, validated, or stored.

#### Scenario: Reveal password
- **WHEN** a user clicks an eye button whose field is hidden
- **THEN** the input becomes `type="text"`, the password text is visible, and the value is unchanged

#### Scenario: Conceal password
- **WHEN** a user clicks an eye button whose field is visible
- **THEN** the input returns to `type="password"`, the password text is masked, and the value is unchanged

#### Scenario: Password value preserved across toggles
- **WHEN** a user toggles a field multiple times
- **THEN** the input value is exactly the same as before the first toggle

### Requirement: Each password field has independent visibility state
Each password input SHALL control ONLY its own visibility. Toggling one field SHALL NOT change the visibility of any other password field, and every password field SHALL reset to hidden when its containing page/form is opened or re-rendered.

#### Scenario: Independent toggles in Change Password form
- **WHEN** a user reveals "New Password" in a change-password form
- **THEN** "Current Password" and "Confirm Password" remain hidden until their own eye buttons are clicked

#### Scenario: Independent toggles in Forgot Password form
- **WHEN** a user reveals "New password" in the reset form
- **THEN** "Confirm new password" remains hidden until its own eye button is clicked

### Requirement: Toggle button does not disturb form behavior
The eye button SHALL be a `type="button"` element when inside a form. Clicking it SHALL NOT submit the form, trigger login/reset/change-password, reload the page, navigate away, clear the field, or move focus away from the field. All existing form behavior (Enter key submission, validation, error handling, session flow) SHALL remain unchanged.

#### Scenario: Clicking eye does not submit form
- **WHEN** a user clicks an eye button inside a form with entered values
- **THEN** the form is not submitted, no request is sent, and the page does not reload

#### Scenario: Enter key still submits
- **WHEN** a user presses Enter while focused in a password field on the login form
- **THEN** login proceeds exactly as before this change

### Requirement: Accessible toggle button
Each eye button SHALL have an accessible label reflecting state: "Show password" when the field is hidden and "Hide password" when the field is visible. The button SHALL be keyboard-focusable (focusable via Tab) and its state SHALL update the accessible label and visible icon consistently.

#### Scenario: State-labeled button
- **WHEN** a field is hidden
- **THEN** its eye button exposes the label "Show password" and shows an eye icon
- **WHEN** the same field is visible
- **THEN** its eye button exposes the label "Hide password" and shows an eye-slash icon

#### Scenario: Keyboard access
- **WHEN** a user Tabs to an eye button and presses Enter or Space
- **THEN** the field visibility toggles the same way a mouse click does

### Requirement: Styling matches existing design without overlap
The eye button SHALL match the existing SmartServe input styling, border radius, colors, and spacing, and sit inside the input boundary vertically centered. The input SHALL reserve right-side padding so typed text never runs underneath the icon, and the button SHALL have a clickable target of adequate size.

#### Scenario: No text/icon overlap
- **WHEN** a user types a long password into a toggle-enabled field
- **THEN** the text does not overlap or run underneath the eye icon and remains fully readable up to the icon boundary

#### Scenario: Consistent look
- **WHEN** the pages render
- **THEN** the eye buttons use the existing iconography/color scheme and input geometry of each page, with no redesign of the surrounding form or page

### Requirement: No change to password security
The feature SHALL only toggle the input `type`. It SHALL NOT log passwords, store passwords in localStorage/sessionStorage/cookies, send passwords anywhere other than the existing auth or change-password API calls, or alter the existing server-side validation and hashing behavior.

#### Scenario: No insecure storage
- **WHEN** a user toggles passwords and performs login/registration/reset/change-password
- **THEN** no password is written to localStorage, sessionStorage, cookies, or console output, and each password is transmitted only through its existing API request as before