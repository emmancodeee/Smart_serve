## Why

The Cancel buttons on the student Feedback and Returns pages kept navigating the student somewhere — first to `/dashboard`, then to whatever page they found in the history stack (e.g., the user profile). The student expects Cancel to leave them exactly where they are: on the form page with the button. No destination is correct; Cancel should not navigate at all.

## What Changes

- Change the Cancel button on the student Feedback page (`public/js/feedback.js`) so it does not navigate anywhere — the student stays on the Feedback page.
- Change the Cancel button on the student Returns page (`public/js/returns.js`) the same way.
- Keep the CSP-safe event-binding approach already in place (no inline `onclick`).
- Add ids/rebinding for the Returns page "Return Process Feedback" modal Cancel so it closes the modal reliably (currently an inline `onclick` blocked by the CSP).

## Capabilities

### New Capabilities
- `student-form-cancel-navigation`: Defines the expected Cancel-button behavior on the student Feedback and Returns pages — Cancel does not navigate; the student stays on the current page, and modal Cancel buttons close their modal without leaving the page.

### Modified Capabilities
<!-- None: no existing spec-level requirements change. -->

## Impact

- `public/js/feedback.js` — Cancel handler rewired.
- `public/js/returns.js` — Cancel handler rewired + modal Cancel rebound.
- `public/returns.html` — remove inline `onclick` on the modal Cancel (CSP compliance).
- No server, API, database, or admin-page changes.