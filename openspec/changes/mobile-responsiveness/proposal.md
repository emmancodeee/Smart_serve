## Why

Students and staff access SmartServe primarily on their phones — checking schedules, submitting registrations, and confirming pickups on the go. The current UI works on desktop but breaks, overflows, or feels cramped on mobile. Several pages have inconsistent breakpoints, non-functional horizontal scrolling on tables, and navigation that's hard to use on small screens.

## What Changes

- Replace the full-width static sidebar with a collapsible hamburger drawer on mobile across all student and admin pages
- Standardize breakpoint behavior so all pages transition consistently at the same viewport widths
- Make data tables horizontally scrollable with sticky headers and better cell sizing
- Fix form inputs, buttons, and modals to use full width and proper touch targets (min 44px) on mobile
- Adjust the registration workflow wizard to stack vertically and use a stepper instead of tabs on small screens
- Ensure the schedule calendar, event modals, and analytics charts render correctly on narrow viewports
- Add a shared `<meta name="viewport">` and responsive base stylesheet to prevent zoom/scale issues

## Capabilities

### New Capabilities

- `responsive-nav`: Collapsible hamburger sidebar drawer with overlay, consistent across student and admin pages
- `responsive-tables`: Horizontally scrollable tables with sticky headers and responsive cell sizing
- `responsive-forms`: Full-width form inputs, proper touch targets, stacked multi-column layouts on mobile

### Modified Capabilities

<!-- No existing specs to modify — specs directory is empty -->

## Impact

- **All 7 HTML pages** in `public/` will get updated markup for the responsive nav and viewport meta
- **CSS** — new shared `public/css/responsive.css` for common responsive rules; inline `<style>` blocks will be removed from individual pages
- **JS** — `public/js/dashboard.js`, `public/js/admin.js`, `public/js/schedule.js`, `public/js/profile.js` may need minor updates for hamburger toggle and nav state
- No backend changes required — purely frontend
