## Why

The Student sidebar already uses the Super Admin gold-on-navy design, but its per-item spacing, padding, icon placement, and alignment are not strictly pinned to the same geometry as the Super Admin/Admin sidebar. Layout helpers on the student pages are not clamped like they are on the admin side, so icon glyph sizes, link padding/gaps, label line-height, and the active gold border can render slightly differently than the reference — the sidebar does not look as clean and evenly spaced as the Super Admin/Admin side.

## What Changes

- Only `public/css/theme.css` is touched. No HTML, no JS, no routing, no menu order, no labels, no colors, and no new design.
- Add a shared geometry-parity block for the Student sidebar (`.dashboard-sidebar` / `.student-sidebar`) that reuses the exact spacing, padding, sizing, and alignment values already used by the Super Admin/Admin sidebar in `public/css/admin.css`:
  - menu item padding `1rem 1.25rem`, gap between icon and text `1rem`
  - menu list outer padding `1.5rem`, item-to-item spacing `0.5rem`, item border-radius `1rem`
  - icon container `2.35rem` with `0.85rem` radius, glassy white border/background, gold `#fde047` icon, `flex-shrink:0`
  - icon glyph normalized to the same `20px` metrics as the admin nav icons (removes the student-only `h-6 w-6`/inline-size inflation)
  - label line-height `1.25` so two-line labels (e.g. wrapped "Feedback Management") wrap like the reference without changing item structure
  - header/logo section keeps the `1.5rem` vertical rhythm and gold divider of the reference
- The active item keeps the same rounded-rectangle, padding, and dimensions as every other item; the gold border stays solid and continuous on all four sides; switching the active state moves only the active styling (translate + background + border color) with no layout shift.
- No color-scheme, order, route, functionality, or design changes.

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `student-sidebar-design`: add a requirement that the Student sidebar's per-item spacing, padding, icon container/glyph metrics, item heights, header rhythm, and active gold-border geometry match the Super Admin/Admin sidebar exactly, while preserving the existing menu order, labels, routing, and design.

## Impact

- **Files:** `public/css/theme.css` (add a geometry-parity block for `.dashboard-sidebar` / `.student-sidebar` descendants mirroring `public/css/admin.css` sidebar geometry).
- **No** changes to `public/css/admin.css`, any `.html` page, `public/js/*`, server routes, or permissions.
- Applies to the Student sidebar on the six student pages only (Dashboard, User Profile, Request, Announcements, Feedback, Returns). `schedule.html` and all Admin/Superadmin sidebars stay untouched.