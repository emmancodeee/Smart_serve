## ADDED Requirements

### Requirement: Request OTP button shows white text in all states
The "Request OTP" button (`#sendCodeBtn`) on the Register page SHALL display its label text in white (#FFFFFF) in every state: default, hover, focus/focus-visible, active, and disabled (the disabled state is used while a verification code is being sent). No other button property (background, border radius, size, spacing, position, font, font weight) SHALL change as part of this styling.

#### Scenario: Default state is white text
- **WHEN** the Register page loads and "Request OTP" is idle
- **THEN** the button label renders in white (#FFFFFF) on the existing button background

#### Scenario: Hover state keeps white text
- **WHEN** a user hovers the "Request OTP" button
- **THEN** the label color remains white (#FFFFFF) while the existing hover background treatment is preserved

#### Scenario: Focus and active states keep white text
- **WHEN** a user tabs to the button, clicks/presses it, or releases the press
- **THEN** the label color remains white (#FFFFFF) during focus, focus-visible, and active states

#### Scenario: Disabled state keeps white text
- **WHEN** the button is disabled during OTP sending (and shows "Sending...")
- **THEN** the label color remains white (#FFFFFF) while disabled

### Requirement: Button background and layout are unchanged
The change SHALL NOT modify the "Request OTP" button's background color, dimensions, border radius, spacing, position, font, or font weight. The fix is limited to the label's text color only.

#### Scenario: Geometry and background preserved
- **WHEN** a user compares the button before and after the fix
- **THEN** the button has the identical background, bounding box, border radius, padding, position, and typography; only the label color differs

### Requirement: OTP request behavior is unchanged
The change SHALL NOT alter the button's click handling, the OTP send request, the disabled/"Sending..." lifecycle, form validation, or any other Register page behavior.

#### Scenario: OTP send still works
- **WHEN** a user clicks "Request OTP" with a valid form
- **THEN** the same OTP request is sent, the button disables and shows "Sending...", and it re-enables exactly as before the change

#### Scenario: No other page element affected
- **WHEN** the Register page renders after the change
- **THEN** every other element on the page (inputs, links, messaging, other buttons) looks and behaves identically to before