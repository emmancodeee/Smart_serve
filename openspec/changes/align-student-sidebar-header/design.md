# Design: Align Student Sidebar Header

## Context

The six student pages (dashboard.html, profile.html, announcement.html, feedback.html, returns.html) each render the Smart Serve header at the top of their sidebar with markup that is already byte-identical to the Admin reference (`public/admin.html` lines 33-42): header div `flex items-center gap-4 border-b border-yellow-300/50 px-6 py-6`, logo box `inline-flex h-14 w-14 ... rounded-2xl border border-white/25 bg-white/10 shadow-inner`, a 24px graduation-cap `svg` in gold (`text-yellow-300`, stroke 1.8), and an `h2 "Smart Serve"` with Tailwind arbitrary values `text-[1.9rem] font-bold tracking-[0.025em] leading-[1.16]`.

The Admin header, by contrast, is explicitly pinned: `public/css/admin.css` (lines 1620-1626) fixes the header `gap: 1rem` and the logo box `border-color rgba(255,255,255,0.25)`, and `public/css/responsive.css` (lines 264-281) shrinks the Admin header on small screens (padding 0.6rem, `h2` 1.3rem, logo 2.5rem, svg 1.25rem). The student header has no equivalent pins, so it relies purely on inherited/default values and is not guaranteed pixel-identical to Admin, and it does not scale down the way the Admin header does on mobile.

Both header variants live under shared shells: the sidebar on the six student pages uses `dashboard-sidebar` (dashboard.html) or `student-sidebar` (profile, announcement, feedback, returns). `schedule.html` also uses `student-sidebar` (with the extra `drawer-sidebar` class) and MUST remain untouched.

## Goals / Non-Goals

**Goals:**
- Pin student sidebar header geometry to the exact Admin reference: logo box 3.5rem × 3.5rem, radius 1rem, border/background matching; icon glyph 24px stroke 1.8; `gap: 1rem` icon-to-text; 1.5rem left/right and top/bottom padding; `h2` 1.9rem font-weight 700, tracking 0.025em, line-height 1.16, white; logo + text perfectly vertically centered; 1px gold divider (rgba(253,224,71,0.5)) at the header's bottom edge
- Scope the header pins only to the student sidebar shells; keep `schedule.html`, Admin, and Superadmin sidebars byte/behavior-identical
- Change nothing else in the student sidebar: menu items, item spacing, active state, menu colors, menu icons, links, and functionality stay as-is

**Non-Goals:**
- No menu geometry, active-state, color, icon, or functionality changes
- No HTML markup changes to any page
- No changes to Admin (`admin.css`), `responsive.css` Admin rules, inventory, or schedule sidebars

## Decisions

### 1. Pin via a dedicated header block in `public/css/theme.css`
Add one scoped block (after the existing sidebar sections) that clamps the student header values, mirroring how the completed `align-student-sidebar-spacing` change pins nav geometry there. Reuses the established pattern and keeps all student-sidebar pins in one file.

Selectors:
- `body.theme-light :is(.dashboard-sidebar, .student-sidebar:not(.drawer-sidebar)) > div:first-child` → header container: padding `1.5rem` (all sides), `gap: 1rem`, `display:flex`, `align-items:center` (guaranteed vertical centering), `border-bottom: 1px solid rgba(253,224,71,0.5)` (divider at the exact bottom edge of the header; height comes from 1.5rem padding + 3.5rem content)
- same scope `> div:first-child span:first-child` → logo box: `width/height 3.5rem`, `border-radius 1rem`, `border: 1px solid rgba(255,255,255,0.25)`, `background: rgba(255,255,255,0.1)`, `box-shadow: inset 0 2px 6px rgba(23,53,127,0.35)` (`shadow-inner`), `flex-shrink: 0`
- same scope `> div:first-child svg` → `width/height 24px`, `flex-shrink: 0` (glyph color stays `currentColor`/`text-yellow-300`; no color change)
- same scope `> div:first-child h2` → `font-size 1.9rem`, `font-weight 700`, `letter-spacing 0.025em`, `line-height 1.16`, `color #ffffff`, `margin 0`

Rationale: scoping by `div:first-child` (the header is always the first element of the student sidebar) prevents any effect on the nav `<ul>`, and `:not(.drawer-sidebar)` excludes schedule's drawer sidebar by reuse of the class overlap column established in the spacing change. `!important` is used to win over inherited/page CSS, consistent with existing pins.

### 2. Mirror the Admin mobile shrink for the student header
Replicate `responsive.css` 264-281 for the student shells inside the same `@media (max-width: ...)` breakpoint used there (student pages keep their own tablet/mobile behavior): header `padding-top/bottom 0.6rem`, `h2 font-size 1.3rem`, logo box 2.5rem, svg 1.25rem. Keeps the "exactly matches Admin at every width" contract; touches only the header.

### 3. No HTML edits
The markup already matches (verified byte-identical in dashboard/profile/announcement/feedback/returns.html). The change ships CSS only, in `public/css/theme.css`.

### Alternatives considered
- Editing each page's header markup/classes: rejected — markup is already identical; the gap is CSS-level pinning and responsive scaling.
- Pinning under `.student-sidebar` only: rejected — dashboard.html's shell is `.dashboard-sidebar`; both shells need the same clamps.
- Reusing Admin's `.sidebar-shell` rules: rejected — that class is Admin-only and applying Admin page-scoped rules would leak into Admin/inventory pages and change them.

## Risks / Trade-offs

- **`div:first-child` matching a non-header in some layout** → The student aside shells all open with the header (verified on all five pages); the block also re-scopes via `span:first-child` + `h2` so stray matches are only header elements.
- **`!important` overrides could fight lighter-weight page CSS** → Clamps only set geometry to the Admin values already present via markup; values are identical so there is no visual delta risk, and nothing outside the header is touched.
- **Mobile-header parity shrinks student header on small screens** → This is intentional (matches Admin), but if a page has custom mobile sizing it is re-targeted to Admin's values inside the same breakpoint; verified in task 4.x.
- **schedule drawer leakage** → Eyes on `:not(.drawer-sidebar)` selector, plus a byte-identical diff check for `schedule.html` (no HTML edits anyway) and a rendered inspection of the schedule drawer.

## Open Questions

None — reference values and scoping are fully determined by `admin.html`, `admin.css` (1620-1626), and `responsive.css` (264-281).