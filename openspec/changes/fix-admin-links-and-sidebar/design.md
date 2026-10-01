## Context

The SMARTSERVE Admin Panel is a vanilla HTML/CSS/JS app (Express static files) — there is no React, no React Router, and no `AdminLayout`/`Sidebar` component library. The "shared layout" is a convention: the same shell markup copied into each HTML page (`admin.html`, `admin-feedback.html`, `admin-returns.html`), styled by the single `public/css/admin.css`, with shared behavior in `public/js/admin.js`.

Current routing (`server.js:285-299`):
- `admin.html` served for `/admin`, `/admin/dashboard`, `/admin/accounts`, `/admin/announcements`, `/admin/transactions`, `/admin/registrations`, `/admin/pickup-confirmations` via the role-aware `adminPageHandler` (SPA shell; its in-file section links carry `data-view`).
- `admin-feedback.html` served for `/admin/feedback`; `admin-returns.html` served for `/admin/returns`. These are full static pages, loaded directly, and their sidebar nav has no `data-view` (so `admin.js`'s SPA navigation doesn't hijack them).

Prior work: `unify-admin-layout` rebuilt the two pages' shell (sidebar, header, content wrapper) onto the canonical `admin.html` shell and added `isSpaAdminShell()` guards to `admin.js`; `unify-sidebar-visuals` (12/15) audited the visual standard. `admin-requests.html` is no longer served by `server.js` (dead file, out of scope). Home base for the report: verify no 404 links remain and that the two pages still match Dashboard.

## Goals / Non-Goals

**Goals:**
- Audit every nav link on all admin pages against real Express routes; fix any dead/outdated `href`; confirm zero 404s for the admin nav.
- Confirm (and fix if needed) that Feedback Management and Return Request share the Dashboard sidebar standard: 270px width, navy gradient (`#17357f → #2447a8 → #315fda`), 20px icons, `gap-4`, same item classes, gold-tinted `.active` (no gray restyle), same hover animation, same logo block, one `#sidebar`/`#main-content` per page, no duplicate Sidebar/Header/Layout.
- Produce the final report in the change: root cause, routes corrected, files modified, duplicates removed, final confirmation.

**Non-Goals:**
- No React/Router conversion, no new components — the project is vanilla HTML/CSS/JS.
- No restyle of the active state (user decision: keep gold, matching Dashboard as-is).
- No changes to `server.js` routes unless a link can only be fixed by a route (unexpected; current routes already serve everything referenced).
- No changes to `admin-requests.html` (dead file) or Inventory Management page internals.

## Decisions

### D1: "Router verification" = link-vs-route mapping (no React Router exists)
Find every `href` in the four admin HTML files, compare against `server.js` route definitions (`app.get` paths), and confirm each resolves. Only fix pages that point at a route that doesn't exist.
- **Why**: The user assumed React Router; the codebase has none, so the correct verification is Express route existence.
- **Alternative**: Treating "router" as SPA internals — rejected; `admin.js` only switches in-file sections, not routes.

### D2 — One shared shell; no per-page restructure
Feedback/Return stay full HTML pages that reuse the shell markup + `admin.css` + `admin.js` (the non-React equivalent of a shared AdminLayout). The link audit/fixes land only in the nav `<li><a href=...>` lines; no page restructure.
- **Why**: Already implemented by `unify-admin-layout`; re-restructuring would regress identical pages.
- **Alternative**: Extracting EJS includes — rejected: requires a templating engine change, touches all pages.

### D3 — Shared gold-tinted `active` style (per user decision)
The `.admin-page .sidebar-shell a.active` rule in `admin.css` (gold background `rgba(250,204,21,0.2)`, yellow border, white text, `translateX(3px)`) is the one active style; Feedback/Return take it as-is. No gray restyle anywhere.
- **Alternative**: Per-page gray — rejected by user; would break "identical to Dashboard".

### D4 — Link audit targets
Audit all links on `admin.html`, `admin-feedback.html`, `admin-returns.html` (incl. `admin-requests.html` for thoroughness, treated as informational). Reference routes come from `server.js` `app.get(...)` patterns. Any `href` not covered is a candidate fix (e.g., `/inventory` from sidebar — check it resolves; `server.js` has `/inventory` route).

### D5 — Inventory Management included only as a verification target
`/inventory` (Inventory Management) is one of the user's "all admin pages" list. It is verified to resolve and share the sidebar look; no modifications.

## Risks / Trade-offs

- [Overlap with in-progress unadmin changes] → Scope this as the final link audit + verification + report; do not re-verify every pixel, defer to `unify-sidebar-visuals`' pending 4.1–4.3.
- [Link fixes could assume a route that doesn't exist] → Each `href` is only rewritten to a path proven to exist in `server.js`; otherwise flagged for the report.
- [User expected visual/react-router changes that don't exist] → The report explicitly explains the vanilla setup and why "gray/gray layers" were not applied.

## Migration Plan

1. Extract all nav/link `href`s from the four admin pages.
2. Enumerate `server.js` routes; cross-reference; classify each link as OK / fix-needed.
3. Apply any fixes (nav `<li>` only).
4. Re-run the link audit; confirm zero 404 routes; re-confirm sidebar shell = Dashboard (structural grep).
5. Write final report section in the change (root cause, routes corrected, files modified, duplicates removed, confirmation).
6. Rollback: link fixes are single-line `href` edits; any single line can be reverted independently.

## Open Questions
- None blocking. The gray-vs-gold conflict was resolved via user decision (keep gold, D3).