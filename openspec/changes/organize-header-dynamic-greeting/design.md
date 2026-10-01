## Context

SmartServe has two header shells:
- **Admin shell** (`public/admin.html`, `public/admin-feedback.html`, `public/admin-returns.html`, `public/inventory.html`; header CSS in `public/css/admin.css`): left group currently holds `#headerClock` + `#logoutBtn`; right group already holds `.header-search`, `.admin-profile` (`#profileAvatar`, `#profileName`, `.profile-role`), and `.header-bell` — but there is **no greeting and no page title** in the header.
- **Student shell** (`public/dashboard.html`, `public/profile.html`, `public/schedule.html`, `public/announcement.html`, `public/feedback.html`, `public/returns.html`; per-page inline `<style>` + `theme.css`): a compact topbar with a static welcome heading (`Welcome`, `Welcome, Student`), status pill, `#headerClock`, `#logoutBtn`, and **no search bar, profile block, or bell**.

Roles are known only from the authenticated payload: admin payload = `GET /api/auth/me` → `currentAdminProfile.isSuperAdmin` (boolean); student payload = `GET /api/auth/me` → spread `...user` including `name`, `fullname`, `firstName`, `lastName`. Greeting must use the confirmed payload only — no role defaults (this app previously had exactly this bug with the sidebar).

## Goals / Non-Goals

**Goals:**
- Consistent two-group header on every page: left (greeting + page title, plus existing clock/logout), right (Search → Avatar/Name/Role → Notification Bell, bell far right).
- Dynamic greeting: `Welcome Super Admin` / `Welcome Admin` / `Welcome, [First Name]`, rendered only after the user payload is confirmed. Zero wrong-greeting flash.
- Student first names derived from existing `/api/auth/me` data; no new user records, no schema change.
- Student topbars gain the same right-side Search / Profile / Bell elements (user confirmed full parity).
- Preserve navy/yellow/blue identity, sidebar, module behavior, and existing elements.

**Non-Goals:**
- No sidebar changes (Admin-only Pickup Confirmations stays as-is).
- No auth, route, database, or API changes.
- No changes to page content or module workflows (search remains visual-functional as it is today; the admin bell is already decorative and stays so; the new student bell is a matching decorative element).
- No full redesign — only header organization and the greeting.

## Decisions

### D1 — Greeting is derived from the confirmed payload, with no default role
- Admin (`public/js/admin.js`): add `applyHeaderGreeting()` invoked from `applySuperAdminUI()` (which already runs only after `currentAdminProfile` is assigned): `isSuperAdmin` → `Welcome Super Admin`, else `Welcome Admin`.
- Student pages: each page script already fetches `/api/auth/me` before rendering; set the greeting from that payload — `Welcome, ${getFirstName(user)}`.
- **Why:** `applySuperAdminUI()` already gates on `currentAdminProfile`, so the greeting can never render before the role is known. This is the same no-default-role discipline used to fix the sidebar flash.
- **Alternative considered:** deriving the greeting from `user.role || 'Admin'`-style defaults — rejected, that is exactly the flash bug the project previously had.

### D2 — Neutral placeholders in static HTML, fill once confirmed
The greeting element in the HTML SHALL be neutral: empty for admins (no static `Welcome Admin`), and a bare `Welcome` (no name, no "Student") for student pages. JS fills the exact text only after the payload resolves.
- **Why:** reflects requirement §14 — no wrong role/name can paint before data loads, including the very first frame.
- **Alternative considered:** client-side render of the whole header after fetch — rejected (blank header flash, larger change).

### D3 — Single first-name helper per student page script; no shared bundle
Add `getFirstName(user)` to each student script (dashboard.js, profile.js, schedule.js, announcement.js, feedback.js, returns.js) with precedence: `user.firstName` → first token of `user.fullname` → first token of `user.name` → `''` (render bare `Welcome`).
- **Why:** each page already fetches and holds its own `currentUser`; a shared bundle would require touching every page's script tag order. Precedence prefers the real first name field captured at registration, then gracefully falls back to the first name token.
- **Alternative considered:** a new `public/js/header-utils.js` loaded everywhere — rejected as a heavier cross-cutting change for a small helper.

### D4 — Header markup: consistent two-group layout, bell last
- Admin pages: keep the existing right group order (`.header-search` → `.admin-profile` → `.header-bell`) — it already matches. Add a left greeting group: `[ #headerClock ] [ #logoutBtn ] | [ #headerGreeting ] [ #headerPageTitle ]`, all inside the existing header flex row.
- Student pages: rebuild the topbar inner row as: left `[ drawer toggle ] [ greeting (replaces static heading) ] [ page title ] [ status pill ]`, right `[ search ] [ profile (avatar + name + role) ] [ bell ] [ clock ] [ logout ]`, with the bell placed before clock/logout so the far-right slot stays with logout as today; right group order relative to Search/Profile/Bell is Search → Profile → Bell.
- **Why:** reuses the existing individually styled elements (search, profile, bell, clock, logout) and only restructures their containers, minimizing visual drift.
- **Alternative considered:** uniform single static header partial across all 10 pages — rejected; would duplicate markup wholesale and risk breaking the SPA/cross-page nav work already done.

### D5 — Page title element + existing titles wiring
- Admin SPA shell: add `#headerPageTitle`; `admin.js` keeps `HEADER_TITLES` and `updateHeaderForView()` (now targets the new element) and sets only the compact title (the long subtitles are dropped from the header; in-content titles remain).
- Static admin pages (`inventory.html`, `admin-feedback.html`, `admin-returns.html`) and student pages: title elements are literal per page (e.g., `Inventory Management`, `Feedback Management`, `Return Requests`, `Dashboard`, `Profile`, `Schedule`, `Announcement`, `Feedback`, `Returns`), filled by JS alongside the greeting where dynamic (student pages) or set once in markup.
- **Why:** keeps one source of truth for SPA view titles (`HEADER_TITLES`) and simple literal titles for single-purpose pages.

### D6 — CSS: reuse existing tokens, add minimal new classes
Add compact classes (`.header-greeting`, `.header-page-title`; student `.student-search`, `.student-profile`, `.student-avatar`, `.student-role`, `.student-bell`) to the existing stylesheet locations — `public/css/admin.css` for admin pages, per-page inline `<style>` (plus shared `theme.css` tokens) for student pages — reusing current navy/yellow/blue colors, radii, fonts, and spacing. Reliance on the existing flex-wrap pattern (`flex flex-wrap items-center justify-between gap-3`) provides the responsive reflow requirement.

## Risks / Trade-offs

- **[Student search/bell are decorative]** → The admin bell already has no behavior wiring; the student bell intentionally matches it. Keeping both purely presentational avoids inventing a new notification system. If notifications are wanted later, they plug into the same elements.
- **[Per-file greeting duplication]** → Accepted for locality; each file's helper is ~6 lines and mirrors the existing per-file `getDisplayName`.
- **[Header height grows on small screens]** → Mitigated by flex-wrap reflow (header groups wrap, no overlap); the sticky header tolerates added height. Verified in the 5.x responsive checks.
- **[Moving clock/logout on student pages]** → Their position changes from far-right to stay on the right but inside the new layout; functionality and styling are untouched. Explicitly noted for cross-check in verification.
- **[admin.js title wiring touches HEADER_TITLES]** → Only the target elements change (add `#headerPageTitle`), subtitle strings are not removed from `HEADER_TITLES`, so the existing map stays available if titles are reused in content.

## Migration Plan

1. Add header greeting/page-title markup + neutral placeholders to the 4 admin shells; add greeting + search/profile/bell markup to the 6 student topbars.
2. Add/update CSS classes in `public/css/admin.css` and the student pages' style blocks.
3. Wire `applyHeaderGreeting()` in `admin.js` (called from `applySuperAdminUI`), and set page titles via `updateHeaderForView`/literal per page.
4. Add `getFirstName()` + greeting/profile rendering to the 6 student scripts, replacing static welcome text.
5. Verify per role and per viewport (see tasks §5): no flash, correct text, bell far right, no overlap, existing features intact, sidebar untouched.
6. Rollback: revert the per-file header markup/CSS/JS edits; all changes are isolated to header DOM, header CSS, and greeting JS.

## Open Questions

- None blocking. (If a real student notification system is desired later, the student bell element added here becomes its host.)