## 1. Restore section band colors

- [x] 1.1 In `public/feedback.html`, change the `background` of the `.feedback-card-header` rule from the blue gradient (`linear-gradient(180deg, #17357f 0%, #2447a8 54%, #315fda 100%)`) to the solid Smart Serve navy `#152c69`
- [x] 1.2 Confirm the change applies to BOTH section bands ("Submit Feedback" at the top of the form card and "My Feedback" at the top of the history card) since both share `.feedback-card-header`
- [x] 1.3 Leave every other `.feedback-card-header` property (margin, padding, border-radius, color, font-size, font-weight, letter-spacing, text-align) identical — no dimension changes

## 2. No scope creep

- [x] 2.1 Confirm no markup, text, layout, spacing, or JS changes were made in `public/feedback.html` or `public/js/feedback.js` (only the one `background` value)
- [x] 2.2 Confirm no new colors were introduced; `#152c69` is the existing app navy already used by the topbar and module title bars

## 3. Verification

- [x] 3.1 Run `node --check public/js/feedback.js` and confirm no syntax regressions
- [x] 3.2 Run existing tests (`npm test`) and confirm no regressions in auth/admin behavior
- [ ] 3.3 Visually verify in the running app: the "Submit Feedback" and "My Feedback" header bands render solid Smart Serve navy `#152c69` with bold white text, matching the topbar, with no layout or spacing changes anywhere else on the page