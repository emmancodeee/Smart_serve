## Context

SmartServe serves static HTML pages. Headers are duplicated per file (no shared partial).

Current admin headers (4 files, `public/admin.html`, `public/inventory.html`, `public/admin-returns.html`, `public/admin-feedback.html`) share one skeleton:
- `header-left`: `#headerClock` → `#logoutBtn` → `.header-heading{ #headerGreeting, #headerPageTitle }` (the yellow module label, e.g. "Announcements")
- `header-right`: `.header-search` (decorative, never bound) → `.admin-profile` → `.header-bell`

`public/js/admin.js` (loaded on every admin page) owns: `applyHeaderGreeting()` (admin.js:307-312, "Welcome Super Admin"/"Welcome Admin" set only after `currentAdminProfile` is confirmed — no flash), `updateHeaderForView()` (admin.js:286-296; sets `#headerPageTitle` inside the SPA shell, guarded by `isSpaAdminShell()`), `startHeaderClock()`, and logout binding for `#logoutBtn` (`performLogout`, admin.js:381-384). `HEADER_TITLES` (admin.js:189-197) also feeds in-content `#headerTitle`/`#headerSubtitle`, which must keep working.

Current student headers (6 files: `dashboard.html`, `profile.html`, `schedule.html`, `announcement.html`, `feedback.html`, `returns.html`) share a `.student-topbar`/`.dashboard-topbar` pattern:
- `header-left`: `.dashboard-heading-group` → `h1` welcome (per-page id, e.g. `#dashboardWelcomeText`), `.student-page-title` (module label), optional `.student-status-pill`
- `header-right`: `.student-search` (decorative, never bound) → `.student-profile` → `.student-bell` → `#headerClock` → `#logoutBtn`

Each student page script already duplicates small helpers (`getFirstName` picks `user.firstName` → first token of `fullname`/`name`, dashboard.js:255-263; `renderHeaderProfile`; per-page `startHeaderClock`; per-page logout clearing the token and redirecting). `#announcementSearch` (announcement.js:48/317/336) and the SmartFilter toolbar search (`admin-filters.js`: search input `.filter-control__input--search`, `applySearch` at line 557) are the real search mechanisms.

Stylesheet reality (verified): admin pages load `admin.css`; student pages (except `schedule.html`) load `theme.css`; `schedule.html` loads `tailwind.css` + `responsive.css` (NO `theme.css` — it relies on the same inline topbar styles every student page duplicates). Responsive `.drawer-toggle` hamburger CSS lives in `responsive.css` (only linked by schedule.html + inventory.html).

## Goals / Non-Goals

**Goals:**
- One header markup/order everywhere: greeting + live clock (left); profile → bell → burger (right), burger = far-right final element.
- Remove every module/page name from headers (yellow `Announcements` etc.); titles stay in page content.
- Dynamic role greeting with no wrong-role flash.
- Burger menu wiring that reuses existing search + logout rather than creating duplicates.
- No overlap at any width, matching the design constraints (no negative margins / z-index / fixed heights).

**Non-Goals:**
- No sidebar changes (incl. no Pickup Confirmations for super admin) and no page-content changes (including in-page titles and the tables).
- No backend/API/route/auth/data changes; no notification-bell behavior changes.
- No global redesign — only the header is reorganized; navy header, yellow accent, fonts, avatar, bell, button styles all preserved.

## Decisions

### 1. Restructure the header markup, keep element ids stable
Rebuild the header block in each of the 10 files:

- Admin (`header-left`): `#headerGreeting.header-greeting` → `#headerClock.admin-clock` (swap: greeting first, then clock). Remove `#headerPageTitle` and the `.header-heading` wrapper's page-title.
- Admin (`header-right`): `.admin-profile` → `.header-bell` → new `.burger-btn` + `.burger-menu` (contains search input + relocated `#logoutBtn.admin-logout`). Remove `.header-search`.
- Student (`header-left`): greeting element → `#headerClock.student-clock`. Keep a single greeting element; drop `.dashboard-heading-group` context label and `.student-page-title`. Keep the functional `.student-status-pill` where present, repositioned after the clock (it is a live status chip, not a module label).
- Student (`header-right`): `.student-profile` → `.student-bell` → `.burger-btn` + `.burger-menu` (search + relocated `#logoutBtn.student-logout`). Remove `.student-search`.

Rationale: keeping `#headerClock`, `#headerGreeting`, `#logoutBtn`, `#studentProfileName`, `#studentAvatar`, `#profileName`, `#profileAvatar`, `.header-bell`, `.student-bell` ids/classes intact means every existing binding (clock tickers, `renderHeaderProfile`, `applyHeaderGreeting`, `initAdminProfile`, logout handlers) keeps working with zero JS shuffling; only the search has to be newly wired.

### 2. Greeting: keep existing no-flash flow, only normalize text
Reuse `applyHeaderGreeting()` for admins (already waits for `currentAdminProfile`, admin.js:307-312) and the per-page student "fill after `/api/auth/me`" flow (dashboard.js:1560-1565 pattern). Greeting defaults stay empty/neutral ("Welcome") until auth is confirmed — the requirement is already satisfied by those flows; we only remove the page-title text next to them. No hardcoded roles, no "Admin" default during load.

### 3. Module name removal in admin.js
`updateHeaderForView()` (admin.js:292-295) drops the `#headerPageTitle` write (element is gone). `#headerTitle`/`#headerSubtitle` writes and `HEADER_TITLES` stay — those are in-content page headings. Static pages remove their literal `#headerPageTitle` spans; nothing else to change.

### 4. Burger menu component (shared classes, per-page markup)
Add a reusable `.burger-btn`/`.burger-menu` pair with the same markup on all 10 pages:
```
<button type="button" class="burger-btn" aria-label="Open menu" aria-haspopup="true" aria-expanded="false">
  <span class="burger-icon"></span> (3-line hamburger, SVG lines reusing the header icon stroke style)
</button>
<div class="burger-menu" hidden>
  <div class="burger-search"><svg…/><input type="text" class="burger-search-input" placeholder="Search..." aria-label="Search"></div>
  <button id="logoutBtn" class="burger-logout …">Logout</button>
</div>
```
Closed by default (`hidden`); toggling adds/removes a `.is-open` class and sets `aria-expanded`. A document-click handler closes it when clicking outside. Menu opens below the button aligned to its right edge (inside the header, `position:absolute` on a `relative` wrapper is acceptable here — the constraint forbids using positioning to *fix* the overlap bug, not the dropdown itself; still, the cleaner route is an in-flow absolutely-positioned child of the burger's `relative` container, `top:100%; right:0`, `z-index` at the same level already used by the sticky header). The `hidden` attribute prevents any empty-box artifacts on load.

### 5. Burger Search reuses existing search
Admin (`admin.js`, new `initHeaderMenu()`): typing in `.burger-search-input` forwards to the page's existing search — the first visible SmartFilter search input (`.filter-toolbar .filter-control__input--search`), else `#announcementSearch`/`#searchFilter` — by setting its value and dispatching an `input` event (drives `applySearch`/announcement filtering unchanged, admin-filters.js:557, announcement.js:48). If no such input exists, fall back to a generic filter over visible `table tbody tr` cells (hide non-matching rows). This reuses real logic; no second filter system is built.

Student (see Decision 7): each page script adds `initHeaderMenu()` with the same rule: forward to the page's mechanism (`#announcementSearch` on announcement.html; SmartFilter search if a returns/filter toolbar exists; student pages with only tables get the generic row filter). `#announcementSearch` keeps its own toolbar box — the burger forwards to it rather than duplicating its logic (spec 7).

A shared design goal: identical behavior/rule on every page (search input → existing mechanism → generic row filter).

### 6. Burger Menu Logout reuses existing handler
Relocate the existing `#logoutBtn` element (same id, same classes) into the burger menu. Existing bindings (`admin.js` logout binding; per-student file bindings) still attach because the id is unchanged — confirmed by exploration (`#logoutBtn` bound on every page). `performLogout`/student logout logic, token clearing, and redirect are untouched.

### 7. Where the shared JS/CSS lives
- `admin.js` (loaded by all 4 admin pages) gets one `initHeaderMenu()` + a small exported-style shared function it calls on DOMContentLoaded.
- Student pages have no shared script, so each of the 6 page scripts (dashboard.js, profile.js, schedule.js, announcement.js, feedback.js, returns.js) receives an identical small `initStudentHeaderMenu()` following the existing per-file helper pattern already used for `getFirstName`, `startHeaderClock`, and logout. This matches the codebase's established convention (no shared student bundle exists; creating one is out of scope).
- CSS: burger/menu + header-layout support styles appended to `admin.css` (admin pages) and `theme.css` (student pages). `schedule.html` currently does NOT link `theme.css`; add the link so it inherits the shared component styles (its topbar markup otherwise stays put).

### 8. Responsive behavior without overlap hacks
Existing `.header-left`/`.header-right` and the header container already use `flex-wrap` + `gap`. Keep that and add only: `.burger-menu` sizing (min-width ~260px, full-width on ≤ 480px via `right:0; left:0` so it never clips), `.burger-search-input` width 100%, and keep the existing ≤640px rule hiding `.student-profile-info`/`profile-info` so the right side stays compact. Greeting and clock both wrap naturally; no negative margins, no fixed heights, no z-index layering new beyond the existing sticky-header stacking.

## Risks / Trade-offs

- Risk: forwarding burger search to a toolbar input inside the page's filter area could scroll/behave oddly if that toolbar is far away (e.g., SPA views). → Mitigation: only the *value+input event* is forwarded; focus stays in the burger input; result updates are identical to typing in the toolbar.
- Risk: the generic table-rows fallback duplicates behavior on pages that later gain real search. → Mitigation: it is a fallback only (rule checks for an existing mechanism first); it matches `#announcementSearch`'s proven haystack-includes pattern.
- Risk: removing `.header-search`/`.student-search` could break a page that *does* reference it. → Mitigation: verified none are bound in JS; the SmartFilter search inputs (which live in page-content filter toolbars, not the header) are untouched and continue to exist.
- Risk: schedule.html gains a `theme.css` link — could alter light-mode/`drawer-toggle` styling if file order matters. → Mitigation: place the link after `tailwind.css` with the same relative ordering other pages use; verify schedule drawer/theme styling after the change.
- Risk: `#headerPageTitle` removal interacts with SPA shells. → Mitigation: admin.js `updateHeaderForView` no longer touches it; `isSpaAdminShell` logic unaffected.
- Trade-off: six student files each get an identical header helper (duplication), because no shared student script exists. Kept small and identical to the existing convention; extracting a shared bundle is an explicit non-goal.

## Migration Plan

Full header rebuild is in-place: edit 4 admin + 6 student HTML header blocks, append CSS rules, add the admin.js function and per-student functions. Delete-and-add is atomic per file. Rollback = git revert (headers are static per-file; no server dependency). No data/schema changes; only a browser cache refresh needed. Verify with the existing logged-in accounts (`setup-admins.js`: two super admin accounts; student flows via seeded student). Logout redirects to `/`.

## Open Questions

- The `.student-status-pill` (registration status chip, live on dashboard/schedule/profile/announcement) sits in the student header-left today. This change keeps it (after greeting + clock) because it is a functional status indicator, not a module label; removing it would drop existing functionality. Confirm this is acceptable, or whether it should be moved into each page's content area instead.
- Whether the student greeting element should keep its per-page ids (`#dashboardWelcomeText` and equivalents) for minimal JS churn, or be renamed to one shared id (e.g. `#headerGreeting`). Default: keep per-page ids to reuse existing fills; the markup and CSS look identical.