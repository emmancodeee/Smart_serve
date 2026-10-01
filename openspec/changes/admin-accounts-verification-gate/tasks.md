## 1. Backend verification endpoint

- [x] 1.1 Add `verifySuperAdminAccess` to `services/authService.js` — resolve `req.admin`, reject non-Super Admins with 403, look up the submitted email via `findAccountByEmail`, require a matching Super Admin account, and return success only when `account.comparePassword(password)` matches (401 `Invalid email or password. Please try again.` otherwise); export the function
- [x] 1.2 Add `verifySuperAdminAccess` controller handler in `controllers/authController.js` using the `sendResult` pattern with try/catch
- [x] 1.3 Mount `POST /api/auth/admin/verify-access` on `adminRouter` in `routes/auth.js` (already behind `authenticateAdmin`)

## 2. Frontend markup

- [x] 2.1 Add `#adminAccountsAccessGate` section to `public/admin.html` (styled like existing admin surface blocks) with an email input, password input with an eye toggle button, a "Verify Access" submit button with a matching spinner, a message/status element, and helper copy; no inline handlers (CSP-safe)

## 3. Frontend logic

- [x] 3.1 Add session verification helpers in `public/js/admin.js`: `isAdminAccountsVerified()` reading a boolean-only `sessionStorage` key, and `setAdminAccountsVerified` used only on success
- [x] 3.2 Update `setAdminView` so the `adminaccounts` view shows `#adminAccountsAccessGate` and hides `#adminAccounts` when unverified, and shows `#adminAccounts` (hiding the gate) when verified — covering sidebar, direct URL, and `popstate` paths
- [x] 3.3 Add the gate submit handler `submitAdminAccountsGate` in `admin.js`: empty-field messages ("Please enter your email." / "Please enter your password."), loading state that disables inputs/button and prevents duplicate submits, `POST /api/auth/admin/verify-access` call, error display + password field cleared on failure, mark verified + show section on success
- [x] 3.4 Add the password eye toggle handler in `admin.js` via `addEventListener`
- [x] 3.5 Clear the verified flag (and never anything credential-related) in `performLogout`

## 4. Verification

- [x] 4.1 Run a no-test-framework harness in the temp directory that loads `admin.js` and verifies gate toggling, empty-field validation, verified-flag persistence, and logout cleanup
- [x] 4.2 Run `npm test` and confirm no regression in the existing auth test suite
- [ ] 4.3 Manual browser check: Super Admin verifies via sidebar, via direct URL `/admin/accounts`, and via back/forward; features intact after verification
- [ ] 4.4 Manual browser check: regular Admin cannot reach/verify Admin Accounts, logged-out session re-requires verification, and no credential data appears in DevTools Application/Storage
- [x] 4.5 Grep for hard-coded credentials and inline handlers in the changed files; confirm no password is written to any storage key, source file, or logger