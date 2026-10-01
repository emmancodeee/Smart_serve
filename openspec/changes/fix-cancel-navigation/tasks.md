## 1. Feedback Page Cancel

- [x] 1.1 In `public/js/feedback.js`, replace the `cancelBtn` handler so it does not navigate (no `window.history.back()`, no `/dashboard` jump) — the student stays on the Feedback page.
- [x] 1.2 Run `node --check public/js/feedback.js`.

## 2. Returns Page Cancel

- [x] 2.1 In `public/js/returns.js`, replace the `cancelBtn` handler so it does not navigate (no `window.history.back()`, no `/dashboard` jump) — the student stays on the Returns page.
- [x] 2.2 Run `node --check public/js/returns.js`.

## 3. Return Feedback Modal Cancel (CSP)

- [x] 3.1 In `public/returns.html`, remove the inline `onclick="closeModal('feedbackModal')"` from the modal Cancel button and give it a stable id when needed.
- [x] 3.2 In `public/js/returns.js`, bind the modal Cancel button to `closeModal('feedbackModal')` via `addEventListener`.
- [x] 3.3 Inspect the modal Submit Feedback button (`returns.html`); if it also uses an inline `onclick` blocked by CSP, rebind it with `addEventListener` in `returns.js`.
- [x] 3.4 Run `node --check public/js/returns.js`.

## 4. Verification

- [x] 4.1 Start the app and log in as a student.
- [ ] 4.2 Open the Feedback page and click Cancel → confirm the student stays on the Feedback page (no navigation to the dashboard or profile page).
- [ ] 4.3 From Feedback, use the sidebar to go to Returns and click Cancel → confirm the student stays on the Returns page.
- [ ] 4.4 From Returns, use the sidebar to go to Feedback and click Cancel → confirm the student stays on the Feedback page.
- [ ] 4.5 On the Returns page, open the "Return Process Feedback" modal and click Cancel → confirm the modal closes and the student stays on Returns.
- [x] 4.6 Run `npm test` (no regressions).