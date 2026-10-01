# Design: Redesign Student Side Sidebar

## Context

The Student Side consists of six pages: Dashboard (`dashboard.html`, which also hosts the Request view via `#request`), User Profile (`profile.html`), Announcements (`announcement.html`), Feedback (`feedback.html`), and Returns (`returns.html`). Each page has its own inline `<style>` block and its own sidebar `<aside>` markup with class `.dashboard-sidebar` (Dashboard) or `.student-sidebar` (the other four), plus shared `theme-light` overrides in `public/css/theme.css`.

Today the student sidebar uses a **white-pill active state** (white rounded rectangle, dark-navy `#10284d` text/icons) that does not match the Admin/Superadmin sidebar. The Admin/Superadmin sidebar (`admin.html`, `inventory.html`, `admin-*.html`, styled by `public/css/admin.css`) uses a distinctive gold-accent design: a glassy gold logo box, glassy gold icon boxes on every nav item, gold hover glow, and a gold-tinted active state.

The target: adopt the Admin/Superadmin sidebar's **design and style exactly** on the six student pages, while keeping the **student content** (graduation-cap logo + "Smart Serve", six modules in order Dashboard / User Profile / Request / Announcements / Feedback / Returns, per-module icons, labels, and routing including `data-sidebar-view`).

Constraints: do not touch Admin/Superadmin sidebars (`.sidebar-shell`), `schedule.html`, `index.html`, `register.html`, `inventory.html`, or any page content/functionality. No modules added or removed.

## Goals / Non-Goals

**Goals:**
- One Student sidebar design that is a visual exact copy of the Admin/Superadmin sidebar style across the six pages.
- Gold glassy icon boxes (`.student-nav-icon` matching `.admin-nav-icon`) and the admin gold active/hover styling.
- Aligned icon/text columns, even spacing, stable width, and a persistent fixed layout on desktop across all six pages.
- Active state driven by the current page (and the Request view); Request links navigate to `/dashboard#request`.
- CSS/markup changes only; no backend, API, or functionality changes.

**Non-Goals:**
- Changing the Admin/Superadmin sidebars (`.sidebar-shell`) — they are the style reference, not a target.
- Changing `schedule.html` (Scheduler module and "Registration" label stay as-is).
- Changing student content: module set, order, labels, icons per module, hrefs, or the `is-active`/`data-sidebar-view` JS mechanism.
- Changing page content, workflow logic, routing, or the mobile drawer behaviors beyond visual consistency.
- Refactoring into a shared external CSS file or shared includes (out of scope; per-page blocks are the existing pattern in this codebase).

## Decisions

1. **Per-page normalization, no new build/dependency.** Keep the existing architecture of per-page inline `<style>` + per-page `<aside>` markup. Each of the six pages gets the same markup structure, class names (`.dashboard-sidebar`/`.student-sidebar`, `.dashboard-sidebar-link`, `is-active`) and identical CSS values for width, font-size, padding, gaps, and colors. Rationale: zero dependencies, matches existing conventions, simplest path to pixel-consistent output. Alternative considered (shared `student-sidebar.css` include) was rejected as a larger refactor than needed for a visual change.

2. **Blue gradient values.** Use the Admin/Superadmin gradient verbatim: `linear-gradient(180deg, #17357f 0%, #2447a8 54%, #315fda 100%)`, `border-right: 1px solid rgba(255,255,255,0.2)`, shadow `12px 0 32px rgba(23,53,127,0.18)`. Rationale: identical shell to the Admin sidebar; no new colors.

3. **Adopt the Admin/Superadmin design language (this replaces the white pill).** Active item renders like the admin `.active` state: background `rgba(250,204,21,0.18)`, `border-color: rgba(253,224,71,0.9)`, gold glow `box-shadow: 0 8px 18px rgba(20,45,111,0.2)`, `transform: translateX(3px)`, white label, gold icon (icon stays gold — the admin sidebar never turns its icons navy). Inactive items: transparent border, white label, gold icon in the glassy box, no background fill. Hover matches the admin markup (`hover:border-yellow-300`, `hover:bg-yellow-400/15`, `hover:shadow-lg`). Rationale: the user explicitly asked for an exact copy of the Admin/Superadmin sidebar's design; the white pill and `#10284d` navy override are removed.

4. **Glassy gold icon boxes.** Every nav item wraps its icon in `<span class="student-nav-icon">` styled byte-for-byte like `.admin-nav-icon` in `admin.css`: `display:inline-flex; align-items:center; justify-content:center; width:2.35rem; height:2.35rem; border-radius:0.85rem; border:1px solid rgba(255,255,255,0.32); background:rgba(255,255,255,0.09); color:#fde047; flex-shrink:0;`. The SVG inside is 20-22px, `stroke="currentColor"`, inheriting the gold color. Rationale: replicates the admin look exactly and keeps icons uniformly sized/aligned.

5. **Consistent icons per module.** Same per-module icon on every page (Dashboard=home/grid, User Profile=person, Request=document, Announcements=calendar/announcement, Feedback=chat bubble, Returns=refresh arrow) with identical sizing and `stroke="currentColor"`. Content of icons is unchanged from the current student sidebar — only their presentation (gold box) changes. Rationale: the icon set is student information and must not change; the admin style only restyles how they are shown.

6. **Replace the theme-light white-pill overrides in `theme.css`.** Remove the `#10284d` navy active-pill rules (`body.theme-light .dashboard-sidebar-link.is-active` and the `.dashboard-sidebar-link.is-active :is(span, svg)` color overrides, plus the equivalent `.student-sidebar-link` blocks) and the white-translucent hover flattening. Add back the admin-equivalent gold active and the `.student-nav-icon` box rule so every student page inherits the admin look through the theme. Rationale: `theme.css` is the shared source of truth for the student look; replacing the overrides is the minimal, single-place change.

7. **Consistent fixed desktop layout.** The `@media (min-width:1024px)` rules already present in `dashboard.html` (`.dashboard-shell { display:flex }`, `.dashboard-sidebar { position:fixed; inset:0 auto 0 0; width:270px; overflow-y:auto }`, `.dashboard-main { margin-left:270px; width:calc(100% - 270px) }`) remain the shared pattern for all six pages so width and position never shift between pages. Rationale: user requires "consistent width, no collapse/overlap/width changes"; mirroring the proven Dashboard implementation minimizes risk.

8. **Active state mechanics stay.** Keep `is-active` + `data-sidebar-view` on the Dashboard page and `is-active` on the current page's link; `js/dashboard.js` keeps toggling `is-active`. Only the CSS that styles `is-active` changes (from white pill to gold). Rationale: zero JS risk; the existing mechanism already tracks the current page correctly including the Request view.

## Risks / Trade-offs

- [Six duplicated CSS blocks drifting apart again] → Use the same literal values everywhere and update them together; a future shared-CSS refactor is noted as a follow-up (non-goal now).
- [Breaking dashboard view switching / active state] → Keep `data-sidebar-view` attributes and the `is-active` class; only the CSS styling of `is-active` changes. Verify on the Request view.
- [Accidentally altering schedule.html or admin pages] → Do not edit those files at all; rely on `git diff --stat` to confirm the touched-file list.
- [Icon boxes change icon sizing/spacing vs. current sidebar] → Use the exact `.admin-nav-icon` dimensions so icon columns align identically to the Admin sidebar; visually compare.
- [Mobile (drawer) layout differing from desktop] → Preserve each page's existing mobile behavior (stacked full-width on Dashboard vs. drawer pattern); the change is scoped to desktop fixed sidebars and visual consistency, not the mobile interaction model.

## Migration Plan

Pure static markup/CSS change on six HTML pages plus `public/css/theme.css`. Apply, then visually verify each page at desktop (fixed 270px sidebar, gold active follows current page, gold glassy icon boxes) and confirm `git diff --stat` touches only intended files. Rollback = revert the commit; no data migration.

## Open Questions

- None blocking. (Minor: mobile icon box sizing follows `.admin-nav-icon` on desktop; responsive.css already handles small screens generically.)