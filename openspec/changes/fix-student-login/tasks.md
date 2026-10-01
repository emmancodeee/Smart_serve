## 1. Account Status Gate

- [ ] 1.1 Add `failedLoginAttempts` (Number, default 0) and `lockedUntil` (Date, nullable) fields to the User Mongoose schema
- [ ] 1.2 In `loginAccount` (authService.js), add status check before password comparison: reject with 401 if `status === 'rejected'`, warn if `status === 'pending'`
- [ ] 1.3 Import `loginAccount` changes into `authController.login` route handler
- [ ] 1.4 Update `app.js` (frontend) to display the warning message for pending accounts on the login success response

## 2. Login Rate Lockout

- [ ] 2.1 In `loginAccount`, before password comparison, check if `lockedUntil` is in the future; if so, return 429
- [ ] 2.2 On failed password match, increment `failedLoginAttempts`; if count reaches 5, set `lockedUntil` to 15 minutes from now
- [ ] 2.3 On successful login, reset `failedLoginAttempts` to 0 and clear `lockedUntil`
- [ ] 2.4 Handle concurrent failed-attempt writes (use `findOneAndUpdate` with `$inc` for atomicity)

## 3. Dashboard Route Protection

- [ ] 3.1 Add `authenticateAccount` middleware to the `GET /dashboard` route in `server.js`
- [ ] 3.2 On auth failure, redirect to `/` with HTTP 302 instead of returning a JSON error (wrap middleware or add a conditional redirect)

## 4. JWT Secret Hardening

- [ ] 4.1 Generate a new 64-character JWT_SECRET and update `.env`
- [ ] 4.2 Verify that `authSupportService.js` and `authenticateAccount.js` use the env var via `process.env.JWT_SECRET` (no hardcoded fallbacks)

## 5. Verification

- [ ] 5.1 Start the server and confirm a rejected account receives 401 with descriptive error
- [ ] 5.2 Confirm a pending account logs in successfully and receives the warning
- [ ] 5.3 Confirm 5 failed logins lock the account for 15 minutes
- [ ] 5.4 Confirm unauthenticated requests to `/dashboard` redirect to `/`
