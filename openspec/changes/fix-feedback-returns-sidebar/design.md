## Context

All admin pages embed the same sidebar markup inline (there is no shared component file): a `nav#sidebar.sidebar-shell` with `admin-nav-link` items, styled by `public/css/admin.css` (rules at lines ~318-371 and the newer block at ~1533-1613, plus the `@media (min-width: 1024px)` layout at ~2407-2425 that fixes the sidebar at 280px).

`admin.html` (Dashboard SPA shell) loads only `tailwind.css` + `admin.css`. `admin-feedback.html` and `admin-returns.html` additionally load **Bootstrap 5.3.8** CSS + JS (required for their modals — `new bootstrap.Modal(...)` in `admin-feedback.js`/`admin-returns.js`).

Bootstrap's utility classes use `!important` and collide with same-named Tailwind classes used by the sidebar:

| Bootstrap rule | Value | Tailwind class it breaks | Tailwind value |
|---|---|---|---|
| `.py-4{...!important}` | 1.5rem | `py-4` on nav links | 1rem |
| `.px-5{...!important}` | 3rem | `px-5` on nav links | 1.25rem |
| `.gap-4{...!important}` | 1.5rem | `gap-4` on links + logo block | 1rem |
| `.border{...!important}` | `1px solid #dee2e6` (gray) | `border` + `border-transparent` / `border-white/25` | transparent / white 25% |

**Verified via headless Edge + CDP** (computed styles): on feedback/returns, links were 88px tall (vs 72px), paddings 24/48px (vs 16/20px), gaps 24px (vs 16px), the title wrapped to two lines, and all link/icon borders were gray.

The filter work never touched the sidebar; the difference is purely this stylesheet collision.

## Goals / Non-Goals

**Goals:**
- Sidebar on `admin-feedback.html` and `admin-returns.html` renders pixel-equivalent in layout to the Dashboard sidebar (same heights, paddings, gaps, title, border colors).
- Keep Bootstrap fully loaded — the modals must keep working.

**Non-Goals:**
- No changes to sidebar HTML, filters, tables, content, backend, or routing.
- No changes to the header/topbar (it is also affected by Bootstrap collisions but is out of scope).
- No removal of Bootstrap.

## Decisions

1. **Fix via scoped CSS overrides in `admin.css` (not by removing/reordering Bootstrap).**
   Bootstrap's utilities are `!important`; reordering stylesheets cannot beat them (important > specificity). Removing the Bootstrap CSS link would break the modals (`.modal` display:none, `.modal-dialog`, etc. are Bootstrap CSS). The pages' inline styles do not define modal styles.
2. **Overrides use `!important` + higher specificity, scoped to `.admin-page .sidebar-shell`**, placed after the existing sidebar blocks in `admin.css`. Specificity (0,3,1) beats Bootstrap's (0,1,0); source order after bootstrap.min.css guarantees the win. Because the values replicate Tailwind's, the rules are no-ops on pages without Bootstrap (dashboard, inventory, etc.).
3. **Explicit hover/active border colors** are re-asserted (gold `rgba(253,224,71,0.9/0.95)`) because Bootstrap's `.border{...!important}` would otherwise also override the yellow hover/active borders.
4. **Logo icon box** (`span.h-14.w-14`) border-color is restored to `rgba(255,255,255,0.25)` (Tailwind `border-white/25`).
5. **Verification approach:** headless Edge (CDP) — compare computed styles and element geometry of `#sidebar` across the three pages; confirm link height 72px, paddings 16/20px, gaps 16px, single-line title, and correct border colors on all three.

## Risks / Trade-offs

- [Bootstrap utility names may change in future upgrades] → overrides are scoped and only restore explicit values; a Bootstrap upgrade that removes the collision leaves harmless identical-value rules.
- [Overrides affect any future page that loads Bootstrap and uses `.sidebar-shell`] → that is precisely the intent (isolation); the scoping to `.admin-page .sidebar-shell` limits blast radius.
- [Active/hover states could be overridden] → re-asserted explicitly in the same block, ordered hover before active to preserve the cascade.
