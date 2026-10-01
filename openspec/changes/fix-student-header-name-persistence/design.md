# Design — Fix Student Header Name Persistence

## 1. Shared student-header module (`public/js/student-header.js`)

A tiny, dependency-free IIFE exposing `window.StudentHeader` with:
- `CACHE_KEY = 'smartserve_student_profile'` — mirrors the existing
  `smartserve_admin_profile` cache pattern the Admin side already uses
  (fix-sidebar-flicker), so the two sides behave identically.
- `getFirstName(user)` / `getDisplayName(user)` — same normalization order the
  pages already use (`firstName` → `fullname` → `name`; display fallback `'Student'`).
- `cacheStudentProfile(user)` — persists a normalized copy (name, fullname,
  firstName, email, status) on successful `/api/auth/me`.
- `getCachedStudentProfile()` — synchronous, safe read/parse, `null` if absent/bad.
- `applyStudentHeader(user)` — sets ALL known header name elements if present:
  welcome ids `dashboardWelcomeText`, `profileHeaderTitle`, `scheduleHeaderTitle`,
  `feedbackWelcomeText`, `returnsWelcomeText`; profile block `studentProfileName`
  + `studentAvatar`; plus `headerProfileName` and `dashboardHeroName`
  (dashboard-only, guarded). Harmless no-op wherever an id is absent, so one
  renderer works on every page.
- `bootstrapStudentHeader({ onUser, onUnauthorized })` — (1) renders cached
  profile synchronously (fallback, never blank), (2) fetches
  `/api/auth/me` with the stored token, (3) on success updates cache + re-renders
  + calls `onUser(user)`, (4) on 401/403 calls `onUnauthorized()` (pages keep
  their own redirect policy), (5) on error keeps the cached render.

Why a new shared file: student pages currently load **no shared script** (each
page's JS is self-contained). The requirement demands the header receive the
same data consistently on every route, so a single module all pages include is
the natural shared "component." Design stays pixel-identical — this only binds
text into already-styled elements.

## 2. Page integration (6 pages)

Each student page adds `<script src=".../js/student-header.js"></script>` before
its module script, and its existing name logic is rewired to the shared path:
- Seed instantly: after the token guard, `const cached = getCachedStudentProfile();
  if (cached) applyStudentHeader(cached);`
- On `/api/auth/me` success: `cacheStudentProfile(user); applyStudentHeader(user);`
  (replacing the duplicated per-page welcome/renderHeaderProfile/headerName code).
- Page-specific behavior (status pill, currentUser for the module body,
  admin redirect, 401 redirect) is kept exactly as-is via callbacks/unchanged
  branches.

## 3. Login-time cache (app.js)

On successful student login (non-admin branch) store the returned profile fields
under the same key, so the first post-login Dashboard renders the name
immediately (no placeholder flash) even before the module fetch settles.

## 4. Fallback / failure model

- No cache yet + fetch pending → placeholder (unavoidable, same as today).
- Cache present + fetch pending → name shown (instant).
- Cache present + fetch failed/timeout → name stays (this is the fix).
- 401/403 → page's existing redirect happens; cache presence is irrelevant.
- Logout removes `token`; `smartserve_student_profile` is merely stale data and
  is never rendered without a token guard (bootstrap returns before rendering
  a fresh fetch when no token; the cached render only happens after the page's
  own token guard). A subsequent login overwrites it.

## Risks

- **Script ordering**: `student-header.js` must load before each module script
  (module scripts call its helpers at `DOMContentLoaded`). Script order in HTML
  guarantees this.
- **Element id spread across pages**: covered by the guarded element list, so a
  missing id is a no-op, never an error.
- **Double `/api/auth/me`** (helper + page body loader): both resolve to the
  same session; helper only writes cache + header text. Acceptable; no state
  conflict (helper never assigns module `currentUser`).