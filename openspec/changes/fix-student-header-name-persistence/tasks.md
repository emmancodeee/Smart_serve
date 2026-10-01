## 1. Shared header module

- [x] 1.1 Create `public/js/student-header.js` exposing `window.StudentHeader` with `getFirstName`, `getDisplayName`, `cacheStudentProfile`, `getCachedStudentProfile` (key `smartserve_student_profile`), `applyStudentHeader`, `bootstrapStudentHeader`
- [x] 1.2 `applyStudentHeader` fills welcome ids `dashboardWelcomeText`, `profileHeaderTitle`, `scheduleHeaderTitle`, `feedbackWelcomeText`, `returnsWelcomeText` with `Welcome, <FirstName>` (fallback `Welcome`), plus `studentProfileName`, `studentAvatar`, `headerProfileName`, `dashboardHeroName` — all guarded (`if (el)`), no-op where absent
- [x] 1.3 `bootstrapStudentHeader` renders the cached profile synchronously first, then fetches `/api/auth/me`, on success updates cache + re-renders + calls `onUser(user)`, on 401/403 calls `onUnauthorized()`, on failure keeps the cached render

## 2. Page integration

- [x] 2.1 Add `<script>` for `js/student-header.js` before the module script on dashboard.html, profile.html, announcement.html, feedback.html, returns.html, schedule.html
- [x] 2.2 dashboard.js: seed header from cache before fetch; on `/api/auth/me` success `cacheStudentProfile(currentUser); applyStudentHeader(currentUser)` and remove the duplicated welcome/renderHeaderProfile/headerName/hero block; also cache in `refreshCurrentUserSnapshot`
- [x] 2.3 profile.js: seed from cache before `loadUserInfo`; `setHeaderUser` delegates to `applyStudentHeader` + `applyProfileStatus`; cache on success
- [x] 2.4 announcement.js + schedule.js: seed from cache at start of `loadHeaderUser`; on success `cacheStudentProfile(currentUser); applyStudentHeader(currentUser)`; keep admin/401 redirects and `applyHeaderStatus`
- [x] 2.5 feedback.js + returns.js: seed from cache before fetch; on success `cacheStudentProfile(user); applyStudentHeader(user)`; keep existing 401/empty handling

## 3. Login cache

- [x] 3.1 In `app.js` successful login, non-admin branch: write `smartserve_student_profile` from the login payload (same shape as `cacheStudentProfile`)

## 4. Verification — header name stays on every module

- [x] 4.1 Headless probe: with a cached profile and a stubbed failing `/api/auth/me`, `applyStudentHeader`/`bootstrapStudentHeader` still render `Welcome, <First>` and the full name (no blank header)
- [x] 4.2 Headless probe: cached render is synchronous (name present in DOM before the fetch resolves)
- [x] 4.3 Live check: visit /dashboard → /profile → /announcement → /feedback → /returns → /schedule; confirm name stays in the header everywhere with no design change
- [x] 4.4 `git diff` confirms only the new shared file, the six page JS files, the six HTML script tags, and `app.js` changed (no design/theme files)