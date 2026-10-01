## Context

SmartServe has 7 HTML pages in `public/` — login, register, dashboard, admin, profile, schedule, inventory. Each student page (dashboard, profile, schedule) duplicates ~200 lines of identical sidebar/topbar CSS in inline `<style>` blocks. The admin and inventory pages use a separate `admin.css` file. Breakpoints are inconsistent: dashboard uses 1024px+768px, schedule/profile match, admin uses `lg:` Tailwind breakpoints. On mobile, the sidebar takes the full viewport height before any content, tables overflow horizontally without scroll wrappers, and form inputs have inconsistent widths.

## Goals / Non-Goals

**Goals:**
- Single collapsible hamburger drawer sidebar that works identically on all pages
- Standard breakpoint: sidebar fixed at 1024px+, hamburger drawer below 1024px
- All data tables wrap in horizontal scroll containers with sticky headers
- All forms use full-width inputs with 44px+ touch targets on mobile
- Registration workflow wizard collapses to a vertical stepper on small screens
- Schedule calendar views scale down without overflow
- Shared `public/css/responsive.css` for all responsive rules — no more inline `<style>` blocks

**Non-Goals:**
- No visual redesign or color scheme changes
- No backend changes
- No JavaScript framework migration
- No changes to the login/register pages (they already work reasonably on mobile)

## Decisions

- **Hamburger drawer over bottom nav**: Bottom navigation bars work well for 3-5 items. Admin has 6 nav items plus sub-views. A slide-out drawer keeps all navigation accessible without overcrowding.
- **CSS-only toggle where possible**: The hamburger open/close can use a hidden checkbox + `:checked` + sibling selector for the drawer animation. This avoids JS dependency for the core toggle. JS is only needed for closing the drawer on route navigation.
- **Single `responsive.css` file over per-page CSS**: All responsive rules in one file loaded on every page. Deduplication makes maintenance easier and guarantees consistent behavior.
- **Min-width breakpoint at 1024px**: Matches the existing dashboard and admin page breakpoints. No reason to change what already works on desktop.
- **No CSS framework swap**: Tailwind is already in use. The responsive styles will use Tailwind classes where possible, with minimal custom CSS for the drawer animation and scroll containers.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Hamburger toggle won't work without JS if using pure CSS approach | Use hidden checkbox + label for the toggle — no JS required for open/close. Use JS only for nav link click → close. |
| Tables with many columns may still be unusable on very narrow phones | Set `min-width` on table wrappers to ensure at least 480px scrollable area. Add a "scroll hint" indicator. |
| Admin page has complex analytics charts that may not render well on small screens | Charts will stack to single column on mobile; individual chart SVGs already adapt to container width. |
| Registration workflow has 6 steps with dynamic content — hardest page to make responsive | Keep step panels full-width on mobile, use a vertical stepper indicator instead of tab row, stack the back/next/submit buttons. |

## Open Questions

- Should the admin sidebar include a separate "Back to site" link on mobile?
- Should the schedule page's mini calendar be hidden on mobile to save space?
