## Context

The SmartServe portal is a set of static HTML pages under `public/` sharing CSS from `public/css/admin.css`, `theme.css`, `dashboard.css`, and per-page `<style>` blocks. The Admin/Super Admin side is an SPA shell (`admin.html`) whose module sections live inside `.admin-section` white cards; the CSS selector `.admin-page .admin-section h2` (admin.css ~2036–2048) already produces the reference navy title bar (`#152c69`, white bold `1.08rem`/`800` text, padding `18px 24px`, radius `28px 28px 0 0`, full-bleed via negative margins). `admin-feedback.html`, `admin-returns.html`, and `inventory.html` already inherit this bar because their titles are `<h2>` inside `.admin-section`.

The gaps are:

1. **Student pages** (`dashboard.html`, `profile.html`, `announcement.html`, `feedback.html`, `returns.html`, `schedule.html`) — titles are `dashboard-panel-title` / `student-panel-title` + eyebrow headings inside white cards, with no navy bar (student pages never use `.admin-section`).
2. **`admin-requests.html`** — module title ("Uniform Request Management") lives in a white `.admin-header-white` sub-header, not in a content title bar.

Constraint: UI-only. No data, API, route, permission, sidebar, header, or functionality changes; no title text renamed/reordered.

## Goals / Non-Goals

**Goals:**
- One shared CSS rule that renders the standard module title bar.
- Every listed Admin/Student module title renders through that rule, visually identical to the Inventory Overview reference.
- Title bars placed directly below the main header, spanning content width, with consistent spacing above/below.
- Consistent on desktop, tablet, and small screens.

**Non-Goals:**
- No redesign of sidebar, main header, cards, tables, filters, buttons, or forms.
- No content changes, data or logic changes.
- No new color palette, fonts, or visual style.

## Decisions

**D1 — Reuse the existing `.admin-section h2` approach and extract a shared title-bar rule.**
The reference bar is produced by `.admin-page .admin-section h2`. Rather than duplicating values per page, define the canonical tokens in one place (CSS custom properties on `:root` in `admin.css`, e.g. `--module-title-bg: #152c69`, `--module-title-pad`, `--module-title-radius`, `--module-title-font`) and have `.admin-page .admin-section h2` plus a new `.module-title-bar` class both consume them. New pages (admin-requests + all student pages) use the `.module-title-bar` class.
Rationale: keeps the reference byte-identical while making the style reusable for pages without `.admin-section`. Alternative considered: copy the exact `h2` rule into each page's `<style>` — rejected because it invites drift and violates "no different design per module".

**D2 — Student pages get one title box directly under the main header, containing the EXISTING page title.**
Each student page currently opens its main container with `<div class="student-main w-full min-w-0">` → `student-main-inner px-4 pb-8 pt-5 ...`. Add a `<div class="module-title-bar">` as the first child of `student-main-inner`, then remove the module eyebrow/title headings inside the individual white panels for that module. The box text is the EXISTING page heading, not the sidebar label: Feedback box reads "Submit Feedback", Returns box reads "Submit Return Request", Announcements reads "Announcements", User Profile reads "User Profile", Dashboard reads "Dashboard", and the Request surface (Dashboard `#request` section) keeps its existing "Registration Workflow" heading in its already-navy strip. Removing the duplicated in-card heading is required so each page renders exactly one title. The bar spans the content width (full-width row inside the padded container) and the container's existing top padding provides the required gap below the header.
Rationale: matches the rule "sidebar module name ≠ extra page title; existing page title = title box content". Alternative considered: leaving module-name boxes — rejected because it duplicates the heading and violates the single-title rule.

**D3 — Scope headings to card-level labels; only the page-level heading goes in the box.**
Card-level headings that are not the page title and do not duplicate it (e.g. "Your Student Details", "Registration Details", "Edit Your Profile", "Feedback History"/"My Feedback", "Return History"/"My Return Requests", "Browse all published notices", "Announcement Feed") stay inside their cards. Any card heading that duplicates the boxed page title ("Submit Feedback", "Submit Return Request") is removed. For admin.html the existing per-section titles ("Inventory Overview", "Announcement Management", "Admin Account Management", "User Request History", etc.) already work; no heading text changes.
Rationale: the requirement is about the single page title below the main header, not every card label. This keeps the change minimal while eliminating duplicate page titles.

**D4 — `admin-requests.html` title bar replaces the white sub-header title.**
Move the module title out of `.admin-header-white` content and render the standard bar as the first element of the page's main container. Keep the white sub-header element itself only if it carries controls/navigation; if it carries nothing but the title, remove it so the page does not keep a "title inside a random white card". No log-out links or nav controls are touched.
Rationale: matches the explicit "title must not be inside a random white card" constraint.

**D5 — Responsive handling is inherent.**
`.module-title-bar` is a block-level flex row with `padding: 18px 24px` and `align-items: center`, inside the existing responsive main containers. At small sizes the container's own horizontal padding (`px-4`/`16px`) still applies, so the bar never touches screen edges and long titles wrap within the bar. No additional media queries needed beyond verifying on each breakpoint.
Rationale: the reference bar has no responsive-specific rules either; behaving identically preserves "same responsive behavior".

## Risks / Trade-offs

- **Drift between admin.css tokens and per-page overrides** → Single source of truth via CSS variables plus one shared `.module-title-bar` rule; do not hand-tune per page.
- **Removing the in-card panel titles changes layout inside white cards** → The page heading moves into the title box above; cards keep their other non-duplicate headings; verify visually per page.
- **`admin-requests.html` white sub-header removal could affect lookups in JS** → Confirm no JS references `.admin-header-white`/`.header-title` in `admin-requests.js`/`admin.js` before editing; if referenced, keep the element and only relocate the title.
- **Scope creep into card subtitle redesign** → Remind implementer: only module-level titles get bars; card subtitles stay.

## Migration Plan

1. Add the shared `.module-title-bar` rule + CSS variables to `admin.css`.
2. Apply `.module-title-bar` markup on the affected non-`admin-section` pages (student pages + `admin-requests.html`); the box text is the existing page heading, and duplicated in-card/page headings and the white-sub-header title are removed.
3. Verify admin SPA and `admin-section` pages still render via the existing selector (reference unchanged).
4. Manual verification across page list and breakpoints; no data/API contact.
5. Rollback: revert markup/CSS changes only; no build step or server dependency.

## Open Questions

- Whether the student "Request" module maps to the dashboard `#requestSection` (Registration Workflow) or a dedicated page — confirm during implementation and apply the bar to that surface as the module title.
- Whether `schedule.html` (Scheduler) is in scope; it is not in the requested list, so it is treated as out of scope unless the implementer confirms otherwise.