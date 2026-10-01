## 1. Add Error Status Container to Dashboard HTML

- [x] 1.1 Add a `<div id="userInfoError" class="hidden ...">` element to `dashboard.html` near the welcome text area (line ~884) for displaying inline error messages instead of `alert()`
- [x] 1.2 Add a retry button inside the error container that re-calls `loadUserInfo()`
- [x] 1.3 Add basic styling for the error container (red/warning background, dismissible)

## 2. Add Error Status Container to Profile HTML

- [x] 2.1 Add a `<div id="profileUserInfoError" class="hidden ...">` element to `profile.html` near the profile form area for displaying inline error messages
- [x] 2.2 Add a retry button inside the error container that re-calls `loadUserInfo()`

## 3. Refactor dashboard.js loadUserInfo Error Handling

- [x] 3.1 Replace the single `catch` block (line 1547-1551) with differentiated error handling that checks `response.status` before entering the catch
- [x] 3.2 Handle `response.status === 401`: remove token, redirect to login (keep existing behavior)
- [x] 3.3 Handle `response.status === 503`: show "Server temporarily unavailable" in the error container, keep token, do NOT redirect
- [x] 3.4 Handle other non-ok responses: show "Failed to load user info (HTTP {status})" in the error container, keep token, do NOT redirect
- [x] 3.5 Handle network/fetch errors in the catch block: show "Cannot reach server. Check your connection." in the error container, keep token, do NOT redirect
- [x] 3.6 Add `console.error` with structured error details (error type, status, message) for developer debugging
- [x] 3.7 Remove the `alert()` calls entirely — replace with inline status messages in the error container

## 4. Refactor profile.js loadUserInfo Error Handling

- [x] 4.1 Apply the same differentiated error handling pattern to `profile.js` `loadUserInfo()` (lines 47-76)
- [x] 4.2 Handle 401: remove token, redirect to login
- [x] 4.3 Handle 503 and other errors: show inline error message, keep token, do NOT redirect
- [x] 4.4 Handle network errors in catch block: show inline error message, keep token
- [x] 4.5 Add `console.error` logging for developer debugging
- [x] 4.6 Remove the `alert()` calls entirely

## 5. Add Retry Functionality

- [x] 5.1 In `dashboard.js`, wire the retry button to call `loadUserInfo()` again and clear the error message on retry start
- [x] 5.2 In `profile.js`, wire the retry button to call `loadUserInfo()` again
- [x] 5.3 Hide the error container when `loadUserInfo()` succeeds

## 6. Preserve Token on Transient Errors

- [x] 6.1 In `dashboard.js`, only call `localStorage.removeItem('token')` when `response.status === 401` — remove it from the 503 and catch block paths
- [x] 6.2 In `profile.js`, apply the same token-preservation logic
- [x] 6.3 Verify that on 401 the user is still redirected to login correctly

## 7. Verification

- [x] 7.1 Test with server running normally: verify no error message appears, user info loads correctly
- [x] 7.2 Test with server down (stop server): verify "Cannot reach server" message appears, token is preserved, no redirect
- [x] 7.3 Test with invalid token: verify 401 handling removes token and redirects to login
- [x] 7.4 Test with database down (stop MongoDB): verify 503 message appears, token is preserved, retry button works
- [x] 7.5 Verify all existing dashboard functionality still works (cards, navigation, announcements, logout)
- [x] 7.6 Verify profile page shows same error handling behavior
