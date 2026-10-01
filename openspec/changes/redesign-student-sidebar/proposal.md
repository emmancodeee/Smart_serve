# Proposal: Redesign Student Side Sidebar

## Why

The Student Side sidebar currently uses a "white pill" active style that differs from the Admin/Superadmin sidebar. The goal is to make the Student sidebar's **design and style an exact copy of the Admin/Superadmin sidebar** (blue gradient shell, gold glassy logo box, glassy gold icon boxes, gold hover glow, gold-tinted active state) across all six student pages — while keeping the **student navigation contents unchanged** (Smart Serve logo, six modules, labels, and routing).

## What Changes

- Restyle the Student sidebar on all six pages (Dashboard, User Profile, Request, Announcements, Feedback, Returns) to the Admin/Superadmin design language:
  - Full-height, fixed, left-aligned sidebar with the same blue gradient background (`#17357f` → `#2447a8` → `#315fda`), right border, drop shadow, and consistent 270px width across pages.
  - Logo header: gold graduation-cap icon in a glassy `bg-white/10` icon box + bold white "Smart Serve" text, divided by a gold hairline (`border-yellow-300/50`), exactly like `admin.html`.
  - Every nav item wraps its icon in a glassy gold icon box matching `.admin-nav-icon` (rounded box, translucent white fill/border, gold `#fde047` icon); label is white, semibold, aligned in a single icon/text column with even spacing.
  - Hover: same gold glow treatment as the admin sidebar (`hover:border-yellow-300 hover:bg-yellow-400/15`).
  - Active item: gold-tinted background + gold border + gold glow + subtle right-shift, identical to the admin `.active` state; active follows the current page (never stuck on Dashboard). Request is active on `/dashboard#request`.
  - No collapsing, overlapping, or width shift between pages; responsive behavior stays stable.
- Keep the six student modules/labels/hrefs (`Dashboard`, `User Profile`, `Request`, `Announcements`, `Feedback`, `Returns`) and the `is-active`/`data-sidebar-view` active-state mechanism exactly as they are today — only the design/style changes.
- Remove the white-pill `theme-light` overrides in `public/css/theme.css` (the `#10284d` navy active pill rules) and replace them with the admin gold active style; add a `.student-nav-icon` box rule replicating `.admin-nav-icon`.
- **Do NOT** modify the Admin/Superadmin sidebars (`.sidebar-shell`, admin pages) or `schedule.html`. No content or functionality changes. No modules added or removed.

## Capabilities

### New Capabilities
- `student-sidebar-design`: The visual design and consistency of the Student Side navigation sidebar across the six student pages (layout, logo header, gold glassy icon boxes, nav items/icons, gold active/inactive states, and responsive behavior).

### Modified Capabilities
<!-- No existing main specs exist yet (openspec/specs is empty); nothing to modify. -->

## Impact

- Markup: `public/dashboard.html`, `public/profile.html`, `public/announcement.html`, `public/feedback.html`, `public/returns.html` (Student sidebar `<aside>` blocks; Request is a view inside `dashboard.html`). Only the inner link styling changes — each `<a>` keeps its `is-active`/`data-sidebar-view` attributes and existing hrefs; icons get wrapped in a `.student-nav-icon` span.
- Styles: `public/css/theme.css` (replace the `theme-light` white-pill active/hover overrides for `.dashboard-sidebar-link`/`.student-sidebar-link`, add the `.student-nav-icon` gold box rule).
- Scripts: none — `public/js/dashboard.js` already drives active state via `data-sidebar-view` → `is-active`; no JS changes needed.
- Out of scope (must remain untouched): `public/schedule.html` (Scheduler module, "Registration" label), all Admin/Superadmin sidebars (`public/admin.html`, `admin-returns.html`, `admin-feedback.html`, `admin-requests.html`), `public/index.html`, `public/register.html`, `public/inventory.html`.
- No backend, API, or dependency changes.