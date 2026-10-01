## Why

The six student-facing pages (`dashboard`, `profile`, `announcement`, `feedback`, `returns`, `schedule`) already share the navy header/burger shell with the admin pages, but the theme-light layer flattens the sidebar to a different navy family, the active-nav styling differs four different ways across pages (invisible on feedback/returns, yellow on schedule, never shown on dashboard), icon sizes and nav grids differ, `schedule` misses `theme-light` entirely, page content uses uneven spacing, and a few pages expose developer-style helper copy. The student UI should read as the same Smart Serve product as the Admin/Super Admin UI — only the nav items differ.

## What Changes

- **Shared shell, not a new design system.** Extend `public/css/theme.css` (the one stylesheet already loaded by all six pages) with a standardized "student shell + active state + spacing" section, so the header, sidebar, active item, and page background match the Admin/Super Admin pages exactly.
- **Sidebar:** keep the admin-style navy gradient (remove the theme-light flattening divergence), unify the nav list to `grid-cols-1 gap-2 p-6`, unify icon sizing, and apply ONE active-state design (white/light pill, navy text, rounded) consistently on all six pages — including making feedback/returns visible and giving dashboard a working active item.
- **Header:** standardize greeting + date/time clock + avatar/name/"Student" role retention + bell + burger to mirror the admin header; ensure schedule gets `theme-light`; no module names or duplicate greetings in the header.
- **Per-module content layout:** align cards, grids, forms, inputs, buttons, and typography across dashboard, profile, request, announcements, feedback, and returns to the admin card system (white cards, `#eef5ff` content bg, navy headings, yellow accents, consistent radius/borders/padding).
- **Navigation/loading stability:** reserved stable layout (no jump/register-after-load shift) while async data renders; the sidebar never disappears, collapses, or re-renders during navigation.
- **Copy cleanup:** remove user-visible developer/helper text (e.g., "Share your thoughts about modules…", "View and manage your submitted feedback.", "Track your current pickup schedule…", "Keep your account details and submitted documents aligned…").
- **Password eye buttons:** already implemented via `show-password.js` on profile/login/register; only verify they remain present and consistent — no re-application.
- No changes to functionality, backend, APIs, routes, permissions, data, or displayed information.

## Capabilities

### New Capabilities
- `student-shell-standardization`: Student header, sidebar, colors, typography, and active-state styling match the Admin/Super Admin design system across all student pages, with the student's own nav set and stable sidebar behavior.
- `student-content-layout`: Student module content (dashboard, request, profile, feedback, announcements, returns) follows the admin card/grid/spacing/typography/button systems with consistent responsive behavior.
- `student-navigation-stability`: Sidebar modules never disappear, collapse, shift, or flicker during navigation, and async data loading does not cause layout shifts or incomplete first render.
- `student-copy-cleanup`: No developer-style or AI-like instructional text is shown in the student UI; only real user-facing labels and feature text remain.

### Modified Capabilities
- (none)

## Impact

- **Frontend only.** Primary: `public/css/theme.css` (shared standardization block), `public/js/dashboard.js` (nav-active wiring), and scoped inline-HTML tweaks on the six student pages (`dashboard.html`, `profile.html`, `announcement.html`, `feedback.html`, `returns.html`, `schedule.html`).
- **Explicitly NOT changed:** any backend/service/route/API/permission code, DB, data payloads, or the existing Admin pages. Purchase order: cosmetics first, then per-page layout, then copy, then verification.
- No dependencies and no breaking changes; everything is additive CSS/class cleanup.