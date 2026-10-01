# Fix Student Header Name Persistence

## Why

Each Student Side module is a separate page (Dashboard, Profile, Announcements, Feedback, Returns, Schedule) that independently re-fetches `/api/auth/me` inside its own JS file to put the student's name in the header. There is **no shared header script, no student-profile cache** (the Admin side already caches `smartserve_admin_profile`; the student side never did), and every loader only renders the name **on success** — silently returning otherwise. The header markup starts with static placeholders `Welcome` (h1) and `Student` (profile name). So whenever a module's `/api/auth/me` request is slow or fails (network blip, 5xx, transient), that module's header keeps/falls back to the placeholder and the logged-in student's name "disappears" — and a later successful module load makes it "reappear." That timing-dependent behavior is exactly the inconsistent disappearance/appearance reported when clicking between sidebar modules.

## What Changes

- Add a small **shared** student-header module (`public/js/student-header.js`) loaded by every Student Side page that:
  - Renders the header synchronously from a cached student profile (`smartserve_student_profile`, same pattern as the Admin cache) so the name is visible **instantly on every module load** and **never blank while data loads**.
  - Refreshes the cache + re-rendered header from `/api/auth/me` once available; on failure it keeps the cached name visible instead of clearing it.
  - Fills every header name element shared across pages (`dashboardWelcomeText`, `profileHeaderTitle`, `scheduleHeaderTitle`, `feedbackWelcomeText`, `returnsWelcomeText`, `studentProfileName`, `studentAvatar`, `headerProfileName`, `dashboardHeroName`) so route changes never lose the name.
- Cache the logged-in student's name at login time too (`public/js/app.js`), so even the first Dashboard load right after sign-in shows the name immediately instead of the placeholder.
- Route each student page through the **same** shared helper (single source of truth for the header name), reusing the auth/session data already available from `/api/auth/me` — no new hardcoded or per-page names.
- Keep the header design, sidebar design, colors, spacing, and layout untouched; do not touch student account data or authentication logic other than reusing the existing `/api/auth/me` session payload.

## Requirements

- The logged-in student's name MUST always remain visible in the header on every Student Side module.
- Header consistently shows `Welcome, [First Name]` plus the full name beside the avatar/profile.
- Navigating between Dashboard, User Profile, Request, Announcements, Feedback, Returns (and Schedule) never clears the name.
- The same authenticated student data is reused across all pages; no per-page hardcoded names.
- A safe fallback keeps the header from going blank while data loads.