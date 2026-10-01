# Align Student Sidebar Header

## Why

On the student pages (Dashboard, User Profile, Announcements, Feedback, Returns), the Smart Serve logo/header block at the top of the sidebar is not explicitly pinned to the Super Admin/Admin header geometry. The header markup looks alike but relies on inheritance, so the logo icon size, text size/weight, icon-to-text gap, left padding, vertical positioning, header height, and divider placement can drift away from the Admin reference and are not guaranteed to render pixel-identical.

## What Changes

- Pin the student sidebar header (logo/icon + "Smart Serve" text + divider) geometry to the exact Super Admin/Admin reference values in `public/css/theme.css` via an explicit header block scoped to the student sidebar shells.
- The header SHALL match the Admin reference for: logo icon box size, icon glyph size, "Smart Serve" font size/weight/letter-spacing/line-height, icon-to-text gap, left padding from the sidebar edge, vertical centering of logo and text, header block height, spacing above/below the logo, and divider line placement/height.
- Scope the header pins to `dashboard-sidebar` and `student-sidebar:not(.drawer-sidebar)` so the `schedule.html`, Admin, and Superadmin sidebars remain untouched.
- NOTHING else in the student sidebar changes: menu items, item spacing, active state, menu colors, menu icons, and functionality stay exactly as they are today.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `student-sidebar-design`: the **Logo header** requirement is tightened from "renders identical in size, weight, and styling" to an explicit, enumerated geometry parity contract with the Super Admin/Admin header (icon/text sizes, gaps, padding, vertical centering, header height, divider placement) plus an unchanged-scope guard for the menu that follows.

## Impact

- `public/css/theme.css` — new header-parity CSS block (layout/sizing/spacing/alignment pins only; no color, menu, active-state, or functionality changes).
- Student pages' `dashboard-sidebar` / `student-sidebar` headers on the six student pages render pixel-aligned with the Admin reference.
- `schedule.html` (drawer sidebar), Admin/Super Admin sidebars (`admin.html`, `inventory.html`), all menu items, links, routes, and behaviors: unchanged.