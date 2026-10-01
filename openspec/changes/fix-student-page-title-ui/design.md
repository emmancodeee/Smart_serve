## Context

SmartServe is a vanilla static front-end (Tailwind + hand-rolled CSS in `public/css/theme.css` and per-page `<style>` blocks) served by an Express server. The student modules are `public/dashboard.html` (Dashboard + the Request/Registration Workflow section, toggled by the `#request` hash), `public/profile.html`, `public/announcement.html`, `public/feedback.html`, and `public/returns.html`.

A shared `.module-title-bar` class already exists in `public/css/theme.css` and matches the Admin "Inventory Overview" title bar: navy `#152c69`, radius `28px 28px 0 0`, bold white text at ~1.08rem with 18px/24px padding. Some student pages already carry a `.module-title-bar` element carrying the correct page title. The problem is that an extra blue bar labeled with the sidebar/module name (e.g., "Returns") can appear above the real page heading (e.g., "Submit Return Request"), producing two header sections and a misleading module-name-as-title pattern.

Constraint: no change to functionality, data, API calls, routes, sidebar behavior, the main top header, or Admin/Super Admin pages. This is a UI-only correction of the student title/header area.

## Goals / Non-Goals

**Goals:**
- Exactly one blue rounded title bar per student page/view, directly below the main header.
- The title bar always carries the existing page/module title, never the sidebar label as an extra title.
- Remove any duplicate heading (module name or repeated page title) so a single header section remains.
- Reuse the existing `.module-title-bar` design so the student pages match the Admin language with no new design tokens.

**Non-Goals:**
- No functional, data, API, route, permission, sidebar, or main-header changes.
- No title renames, no new titles, no changes to Admin/Super Admin pages.
- No restructuring of page content (cards, forms, tables, filters) beyond spacing needed for the corrected title section.

## Decisions

### Decision 1: Reuse `.module-title-bar` (do not invent a new component)
The existing `public/css/theme.css` `.module-title-bar` already encodes the Admin title-bar language (navy, rounded top corners, white bold text, padding). Student pages SHALL use this same element/class for their single title bar with the correct page title text.

- Why: zero new design tokens, guaranteed visual parity with Admin/Super Admin, minimal diff.
- Alternative considered: a student-specific class (e.g., `.student-title-bar`) duplicating the same styles — rejected because it risks visual drift and duplicates CSS.

### Decision 2: One static title bar per page, containing the page title
Each student page gets exactly one `.module-title-bar` directly below the main header:
- `dashboard.html` → "Dashboard"
- `profile.html` → "User Profile"
- `announcement.html` → "Announcements"
- `feedback.html` → "Submit Feedback"
- `returns.html` → "Submit Return Request"

Any in-panel heading that duplicated the boxed title (e.g., a panel header "Submit Return Request" / "Submit Feedback") is removed so a single header section remains. Panel sub-headings that are genuinely different content (e.g., "My Return Requests", "My Feedback", "Pickup Notifications", "Your Student Details") are left unchanged — they are section headings, not page titles.

- Why: matches the stated rule "EXISTING PAGE TITLE = BLUE TITLE BOX CONTENT" with the smallest markup change.
- Alternative considered: keep the in-panel heading and drop the bar — rejected because the required design is a blue box containing the existing page title.

### Decision 3: Request section reflects its own title when active
The Request module is a section inside `dashboard.html` (`#request` / legacy `#registration` hash) whose existing heading is "Registration Workflow". `public/js/dashboard.js` already toggles section visibility on the hash. When the Request section is active, the page SHALL show one title bar carrying that section's existing title.

- Why: the request view is a distinct module but shares the dashboard shell; leaving the bar at "Dashboard" while the request workflow is visible creates a mismatched/misleading title, and showing a separate "Request" title duplicates the sidebar label.
- Alternative considered: static title bar of "Dashboard" on the whole dashboard page and keep the inner navy "Registration Workflow" sub-bar for the request view — creates two header sections in the request view, violating the one-title rule. Rejected.

### Decision 4: No sidebar-name-as-title anywhere
The sidebar labels (Dashboard, User Profile, Request, Announcements, Feedback, Returns) SHALL never be rendered as a standalone page title. Where scripted UI or markup currently renders such a label, it is removed. The main-header greeting (e.g., "Welcome, <name>") is part of the main header and is not a page title.

- Why: this is the core anti-pattern being corrected.
- Alternative considered: leave the module-name bar and relocate the real title — rejected because that is precisely the bug.

## Risks / Trade-offs

- [Risk] A student page in the working tree may already have partial fixes (some pages already contain `.module-title-bar`). → Implementation must audit each page's current state and only add/remove the pieces needed, avoiding duplicate bars.
- [Risk] Removing an in-panel heading could leave the panel header blank or change the step-label placement in the Request section. → Keep the step label indicator in the Request section; remove only the duplicated title text so exactly one "Registration Workflow" heading remains.
- [Risk] Browser caching may show stale title markup. → Hard refresh / cache-busted asset serving should be used during verification; no server changes are required.
- [Risk] Over-tightening could affect Admin pages since `.module-title-bar` is shared. → All HTML edits are scoped to the five student files; no Admin page markup is touched.

## Migration Plan

- Apply per-page: ensure the page has exactly one `.module-title-bar` with the correct existing title, remove any extra/duplicate title heading, and adjust only the spacing that surrounds the title section.
- Update `public/js/dashboard.js` so the title bar text follows the active dashboard view (`#dashboard` → "Dashboard", `#request`/`#registration` → "Registration Workflow").
- Verify by opening each student route (Dashboard, Dashboard#request, Profile, Announcements, Feedback, Returns) and confirming exactly one title header section with the correct text and no module-name duplicate.
- Rollback: revert the five HTML files and the single JS touch; no data migration needed.

## Open Questions

- None blocking. Minor: whether the inner "Registration Workflow" sub-bar with the step label should keep its label on the far right (recommended) — a cosmetic detail for implementation.