## Context

The SMARTSERVE Admin Panel is a server-rendered static HTML app (Express + `public/`). The reference pages — `public/admin.html` (served at `/admin/dashboard` and `/admin/accounts`) and `public/admin-requests.html` (served at `/admin/registrations` and `/admin/pickup-confirmations`) — all share one canonical shell:

- `body.admin-page`
- `#mobileMenuBtn` hamburger button (mobile only)
- `#sidebarOverlay` (mobile drawer overlay)
- `nav#sidebar.sidebar-shell` — navy gradient (`from-[#17357f] via-[#2447a8] to-[#315fda]`), fixed `w-[270px]` on `lg`, mobile drawer `-translate-x-full` + `transition-transform`, brand block, `ul.grid.grid-cols-1.gap-2.p-6` with `a.admin-nav-link` items (each with a `data-view` attribute)
- `div#main-content.main-content-shell.w-full.min-w-0.lg:ml-[270px]`
- `header.admin-header` — sticky, `bg-[#152c69]`, white text, `shadow-lg`, with title/subtitle, `.header-clock` (date & time), `.header-search`, `.header-bell`, `.admin-profile`, `#logoutBtn.admin-logout`
- `main.admin-main.mx-auto.grid.max-w-[1280px].gap-5.px-4.pb-8.pt-5.md:px-6`
- Shared behavior in `public/js/admin.js` (sidebar toggle via `is-open`, overlay, active-link highlighting, clock, profile, logout) and shared styles in `public/css/admin.css` + Tailwind. Note: `admin.js` is the controller of `admin.html`'s single-page shell (SPA nav via `data-view` links, section show/hide, header-title updates, bulk data refresh); those behaviors are safe only on `admin.html`, so implementation adds guards (see D6).

The two broken pages — `public/admin-feedback.html` (`/admin/feedback`) and `public/admin-returns.html` (`/admin/returns`) — instead copy the student-dashboard shell: `aside.sidebar-shell.dashboard-sidebar.w-full` (full-width, no gradient, no fixed width, no drawer/overlay/hamburger), `header.admin-header.dashboard-topbar` (clock + logout only, no search/bell/profile), `main.admin-main.dashboard-main-inner` (different padding, `md:px-7`), plus an inline `<style>` block defining `.dashboard-sidebar*`, `.dashboard-topbar`, `.dashboard-main-inner`, etc. They do not load `admin.js`, so drawer, clock, profile, and active-state behavior are missing.

Constraints: no framework changes (vanilla HTML/CSS/JS), no route changes in `server.js`, reference pages must remain untouched, and both pages' content markup (tables, modals, filters) and their page scripts (`admin-feedback.js`, `admin-returns.js`) must keep working.

## Goals / Non-Goals

**Goals:**
- Make `/admin/feedback` and `/admin/returns` render inside the exact same shell as Dashboard → Pickup Confirmations (sidebar, header, content wrapper identical).
- Remove the duplicate student-dashboard layout CSS and markup from both pages.
- Preserve each page's content (tables, modals, filters) and its page-specific JS with minimal, safe changes.

**Non-Goals:**
- No changes to `server.js` routing, backend APIs, or data models.
- No refactor of `admin.html` / `admin-requests.html` (they are the standard).
- No creation of a shared partial/template system (out of scope; the shell is duplicated HTML, as already practiced by the reference pages).
- No changes to student pages (`dashboard.html`, `feedback.html`, `returns.html`, etc.).

## Decisions

### D1: Use `public/admin.html` as the single canonical shell source
Copy the shell markup from `admin.html` (hamburger, overlay, `nav#sidebar.sidebar-shell`, `#main-content.main-content-shell`, `header.admin-header`, `main.admin-main.mx-auto.grid.max-w-[1280px]`) verbatim into both pages, adjusting only the active nav item and the header title/subtitle per page.
- **Why**: `admin.html` is the Dashboard page the user designated as the primary reference and has the full shell including search, bell, profile, and logout.
- **Alternative considered**: Reusing `admin-requests.html`'s `admin-header-white` variant — rejected because the user's reference list centers on Dashboard's dark navy header.

### D2: Replace `dashboard-sidebar-link` nav items with `admin-nav-link` + static `active` class
Both pages' nav lists must use the shared `admin-nav-link` classes. The current page's item is marked with the static `active` class (the same class `admin.js` toggles and the same pattern `admin-requests.html` uses). Nav links get **no `data-view` attribute**, because `setupEventListeners` (admin.js:3355) binds `preventDefault` + `pushState` SPA navigation to `.sidebar-shell a[data-view]` — on separate-page files (feedback/returns) that would hijack every sidebar click and stop real navigation. `admin.html` itself only puts `data-view` on its in-file section links (Dashboard, Accounts, Transactions, Registrations, Pickup Confirmations) and deliberately omits it on cross-file links (Feedback, Returns, Inventory).
- **Why**: `data-view` triggers SPA behavior that only works on `admin.html`'s single-page shell; static `active` gives the identical highlight without breaking navigation.
- **Alternative considered**: `data-view` on all links (per original tasks) — rejected during implementation: sidebar navigation would stop working.
- **Alternative considered**: Keeping `dashboard-sidebar-link` + inline active styles — rejected; duplicates the look-and-feel instead of sharing it.

### D3: Strip shell-related inline CSS; keep content-only styles
Remove the inline `<style>` rules for the layout shell (`.dashboard-sidebar`, `.dashboard-sidebar-link*`, `.dashboard-topbar`, `.dashboard-main`, `.dashboard-main-inner`, `.dashboard-shell`, and their responsive/media rules). Keep inline styles that only affect page content (panel/table/controls/modal styling) — rename to content-scoped names only if they collide with the shared shell.
- **Why**: The layout must come from the shared `admin.css` + Tailwind so sidebar/header/spacing are pixel-identical; content styles are page-specific and legitimately live inline (same pattern as the reference pages).
- **Alternative considered**: Deleting all inline CSS — rejected; would alter content appearance (borders, table spacing) and break the "only the shell changes" guarantee.

### D4: Load `public/js/admin.js` with SPA guards; drop duplicate handlers
Add `<script src="/js/admin.js"></script>` before `admin-feedback.js` / `admin-returns.js`. Where the page scripts bind their own `logoutBtn`/`headerClock` handlers that conflict with `admin.js` (e.g. `admin.js` already wires `#logoutBtn`, `#headerClock`, `#profileName`, `#profileAvatar`), remove the page-level duplicates and rely on the shared wiring.
- **Why**: `admin.js` provides drawer toggle, clock, profile, logout, and auth enforcement; keeping competing handlers causes double-binding bugs.
- **Alternative considered**: Guarding `admin.js` internals — rejected; `admin.js` already null-checks elements, so safe to load on pages that contain the full shell.

### D6: Guard `admin.js` SPA-only logic behind the `#analytics` marker
`admin.js` is the controller of `admin.html`'s single-page shell and runs several admin.html-only behaviors unconditionally on load. Two guards are added, keyed on the presence of the `#analytics` section element (exists only on `admin.html`), so reference-page behavior is byte-for-byte unchanged while the two rebuilt pages get only the shared behaviors:
1. `applySuperAdminUI()`: skip the `history.replaceState` + `setAdminView` block (admin.js:408-414) on non-SPA pages — otherwise `/admin/feedback`'s URL is rewritten to `/admin/dashboard` on load. The nav role-gating and `initAdminProfile()` above it still run.
2. DOMContentLoaded init: skip `refreshData()` on non-SPA pages — it would fire ~6 admin-panel API calls and possible `alert()`s into page elements that don't exist. The auth gate (`/api/auth/me`), `startHeaderClock()`, and `setupEventListeners()` (which is inert without `data-view` links) still run.
- **Why**: The alternative — not loading `admin.js` — duplicates drawer/clock/logout/profile logic per page and contradicts the shared-behavior requirement; loading it unguarded breaks the URL, header titles (`updateHeaderForView` writes "Dashboard" into `#headerTitle`/`#headerSubtitle`), and navigation.
- **Alternative considered**: Page-local duplicate of drawer/clock/logout in `admin-feedback.js`/`admin-returns.js` (matches `admin-requests.html` precedent) — rejected: less shared behavior, more duplication; user chose the guarded shared script.
- **Note**: Header title/subtitle elements on the rebuilt pages intentionally omit the `#headerTitle`/`#headerSubtitle`/`#adminWelcomeTitle` IDs so `updateHeaderForView`/`applySuperAdminUI` cannot overwrite them with Dashboard strings; styling classes are preserved.

### D5: No server changes; verify via page comparison
`server.js` continues serving the same files for `/admin/feedback` and `/admin/returns`. Verification is manual browser comparison plus a grep audit (no `dashboard-sidebar`, `dashboard-topbar`, `dashboard-main-inner` left in admin pages; single shell per page; `data-view` present on nav items; `admin.js` loaded).
- **Why**: Zero-risk rollout — no routing, API, or data changes; purely presentational.

## Risks / Trade-offs

- [Removing `.dashboard-*` classes could break content styling if content markup reuses them] → Audit each remaining usage in the content section; keep or rename content-scoped rules before deleting shell rules.
- [`admin.js` is coupled to `admin.html`'s SPA shell (URL rewrite, `data-view` hijack, header title overwrite, bulk data refresh)] → Add `#analytics`-marker guards in D6 so those run only on `admin.html`; nav links carry no `data-view`; header title/subtitle elements omit their IDs. Regression-check `/admin/dashboard` after the admin.js edit (guards must not alter reference behavior).
- [`admin.js` binds `#logoutBtn`, `#headerClock`, `#profileName`, etc.; page scripts may bind the same IDs] → Remove duplicate bindings in `admin-feedback.js` / `admin-returns.js`; verify with a quick load test in the browser.
- [Copied shell HTML drifts from the reference over time] → Accepted; same duplication already exists between reference pages. Document `admin.html` as the canonical source in code comments.
- [Modal/table classes (`admin-section`, `admin-data-table`) may not exist in `admin.css`] → Keep the pages' existing content classes unchanged; only outer shell classes are swapped.
- [Static `active` class doesn't change when admin.js runs on these pages] → Intended; `admin.js` only toggles `data-view` links, so the static highlight on Feedback/Return items is preserved (same pattern as `admin-requests.html`).

## Migration Plan

1. Edit `admin-feedback.html`: swap shell (head CSS, body classes, sidebar, header, main wrapper), add `admin.js`, mark Feedback Management active.
2. Edit `admin-returns.html`: same, marking Return Requests active.
3. Adjust conflicting handlers in both page scripts if any.
4. Manually verify both pages side-by-side with the reference pages (desktop + mobile drawer), and run the grep audit.
5. Rollback: the change touches only two HTML files (+ optional two JS files); revert via git.
