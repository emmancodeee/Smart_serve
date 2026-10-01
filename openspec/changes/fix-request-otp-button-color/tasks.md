## 1. Implementation

- [x] 1.1 Add an ID-scoped `<style>` block in `public/register.html` (in the page `<head>`) setting `#sendCodeBtn` color to `#ffffff` for default, `:hover`, `:active`, `:focus`, `:focus-visible`, and `:disabled` states. Do not modify the button's background, size, border radius, spacing, position, font, font weight, or any other element on the page.
- [x] 1.2 Confirm `register.html` diff touches only the OTP button text-color addition (no other markup, scripts, or styling changed).

## 2. Verification

- [ ] 2.1 In the browser on the Register page: "Request OTP" label is white (#FFFFFF) on the existing (blue) background in default, hover, focus/click, active, and disabled ("Sending...") states; background and geometry are identical to before.
- [ ] 2.2 Regression: clicking "Request OTP" still sends the code, disables the button with "Sending...", re-enables it, and form validation/registration flow behave exactly as before; no console errors.