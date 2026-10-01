## Context

The SMARTSERVE Admin Panel is a vanilla HTML/CSS/JS app (Express static files) — there is no React, no React Router, and no `AdminLayout`/`Sidebar`/`SidebarItem` component library. The "shared layout" is a convention: the same shell markup copied into each HTML file (`public/admin.html`, `public/admin-requests.html`, `public/admin-feedback.html`, `public/admin-returns.html`), styled by the single `public/css/admin.css`, with shared behavior in `public/js/admin.js`.

**Root cause of the divergence:** `admin-feedback.html` and `admin-returns.html` were originally built by copying the *student-dashboard* shell (`dashboard.html`'s `dashboard-sidebar w-full`, `dashboard-topbar`, `dashboard-main-inner`) instead of the admin shell — a different sidebar layout and styling. The `unify-admin-layout` change already replaced that shell on both pages with the canonical admin shell (fixed 270px navy gradient sidebar, `#sidebar` + `#sidebarOverlay` + `#mobileMenuBtn` drawer, `admin-header`, `admin-main max-w-[1280px]`), removed the page-local shell CSS, wired `admin.js`, and added `#analytics`-marker guards to `admin.js` so its SPA-only behavior never runs on these pages. Nav links use `admin-nav-link` with a static `active` class (no `data-view`), matching the `admin-requests.html` precedent.

Current shared active style (`admin.css`): gold-tinted background `rgba(250,204,21,0.2)`, yellow border `rgba(253,224,71,0.95)`, white text, `translateX(3px)` — identical across all pages.

## Goals / Non-Goals

**Goals:**
- Verify (and fix if needed) that all seven admin pages render the sidebar pixel-identically: 270px width, navy gradient, same item dimensions/spacing/icons/typography, same active/hover states, same brand block.
- Remove any remaining duplicated sidebar/layout markup or CSS used only by Feedback Management / Return Request.
- Document the root cause and confirm the single shared shell.

**Non-Goals:**
- No restyle of the active state to gray (the request's "gray background" description conflicts with "identical to Dashboard"; Dashboard's shared style is gold-tinted and wins — changing only two pages would break identity).
- No changes to `public/css/admin.css`, `public/js/admin.js`, `server.js`, or the reference pages unless the audit finds an actual deviation.
- No React conversion, no new shared components — the project is vanilla HTML/CSS/JS.

## Decisions

### D1: Verify-first; change only on deviation
Run a static audit (grep for `dashboard-sidebar`-family classes, per-page sidebar shell counts, class-string comparison of nav items) plus manual browser comparison. Only if a deviation is found, edit the offending file — otherwise this change is verification + documentation.
- **Why**: The shell work from `unify-admin-layout` is complete; inventing edits would risk regressing identical pages.
- **Alternative considered**: Re-implementing the shell again from scratch — rejected; duplicate work, higher regression risk.

### D2: Keep the gold-tinted active style shared
All seven pages keep the existing shared `.active` rule (gold background, yellow border, white text). "Gray active background + thin yellow outline" was treated as a misremembered description of Dashboard's style; honoring it per-page would make the two pages differ from Dashboard, violating the primary requirement.
- **Why**: Requirement 3's "identical to Dashboard" and requirement 7's "don't change reference pages" dominate; Dashboard's real active style is gold-tinted.
- **Alternative considered**: Restyling the shared `.active` to gray for all pages — rejected because the user explicitly said not to change the reference pages, and the current style is already uniform.

### D3: No new components — reuse the existing shared shell
"AdminLayout / Sidebar / SidebarItem" in the request map to the existing HTML+CSS+JS convention: shell markup per page (same classes), `admin.css` (styles), `admin.js` (behavior). No new files are created.
- **Why**: The project has no component framework; introducing one is out of scope.
- **Alternative considered**: Extracting the sidebar into an EJS/include partial — rejected; would require a templating engine change and touching all pages.

### D4: Audit criteria for "no duplicate sidebar"
A page is compliant when: (a) it has exactly one `nav#sidebar.sidebar-shell` and one `#main-content` shell, (b) zero occurrences of `dashboard-sidebar`, `dashboard-topbar`, `dashboard-main-inner` or any sidebar `<style>` block, (c) nav items use `admin-nav-link` with the same class string as the reference pages, (d) `admin.js` is loaded.

## Risks / Trade-offs

- [Manual browser verification remains user-side] → The tasks split: automated audits are done during implementation; visual checks (5.4–5.6-style) are explicit manual tasks.
- [Edit temptation without a real deviation] → Guardrail: tasks are check-verify-fix; no task mandates a diff, only a verification result.
- [`unify-admin-layout` not yet archived; overlap in spec naming] → `sidebar-visuals` is additive (visual standard + no-duplicate rule); archive `unify-admin-layout` first when its manual checks pass.

## Migration Plan

1. Run the static audit (grep + class comparisons) over all four admin HTML files.
2. Fix any deviation found (none expected); otherwise no code changes.
3. Manual browser pass on `/admin/feedback`, `/admin/returns`, and `/admin/dashboard` for visual identity and drawer/active behavior.
4. Document findings in the change (root cause, files inspected, duplicate-removal status).
5. Rollback: no code changes expected; if a fix was applied, it is contained to the offending HTML file.

## Open Questions

- None blocking; the gray-vs-gold active-style conflict was resolved in D2 (gold shared style wins).
