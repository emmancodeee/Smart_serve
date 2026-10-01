## Why

The "Request OTP" button on the Register page renders with a blue background and black (near-black) label text (`text-slate-900`), making the label low-contrast and hard to read against the button background. Fix only the label color so the text is clearly visible white (#FFFFFF) in every state, without touching the background, layout, or OTP behavior.

## What Changes

- Change the "Request OTP" button's text color to white (#FFFFFF) in all states: default, hover, focus, active, and disabled (the button is disabled while a code is being sent).
- The button's background stays exactly as it is today (existing blue); its size, width, height, border radius, spacing, position, font, and font weight are unchanged.
- No other Register page element, form validation, markup, or OTP send/verify behavior changes.

## Capabilities

### New Capabilities
- `register-otp-button-styling`: The "Request OTP" button (`#sendCodeBtn`) on the Register page shows white label text in every state while its background, geometry, and OTP request behavior remain unchanged.

### Modified Capabilities
- (none — no existing specs to modify)

## Impact

- **File (frontend only):** `public/register.html` — scoped text-color styling for `#sendCodeBtn` (default + hover/focus/active/disabled states); no changes to any other element or to the shared stylesheets.
- **Backend / APIs:** none — the OTP request, verification, rate limiting, and registration flow are untouched.
- **No dependencies** and no environment/config changes.
- **No breaking changes.**