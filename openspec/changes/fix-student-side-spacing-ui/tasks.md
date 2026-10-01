## 1. Shared spacing rule

- [x] 1.1 Add the scoped rule to `public/css/theme.css` (after the `.module-title-bar` block): `body.theme-light :is(.dashboard-main-inner, .student-main-inner) > .module-title-bar ~ * { margin-top: 20px; }`, with a comment explaining it applies only where a module title bar exists.
- [x] 1.2 Confirm the rule matches only the six Student module main containers (contains a first-level `.module-title-bar`) and does not match `schedule.html` (no title bar) or Admin containers.

## 2. Normalize the grid-based containers

- [x] 2.1 Remove `grid gap-5` from `dashboard-main-inner` in `public/dashboard.html` (line 1041) so the container is block-centered (`dashboard-main-inner px-4 pb-8 pt-5 md:px-7`); confirm inner `dashboard-layout-grid` / `registration-workflow` grids are untouched.
- [x] 2.2 Remove `grid gap-5` from `student-main-inner` in `public/feedback.html` (line 681).
- [x] 2.3 Remove `grid gap-5` from `student-main-inner` in `public/returns.html` (line 733).
- [x] 2.4 Confirm the outer containers are still centered (`max-width` + `margin: 0 auto` from their inline styles) and keep `pt-5`.

## 3. Verify spacing and layout

- [x] 3.1 Verify the header→title-bar gap is ~16–24px (existing `pt-5`, 20px) on all six modules: Dashboard, User Profile, Request (dashboard `#request`), Announcements, Feedback, Returns.
- [x] 3.2 Verify the title-bar→first-content gap is 20px (sibling rule) on all six modules, with no double spacing from leftover title-bar `mb-5` on User Profile/Announcements (margins collapse).
- [x] 3.3 Verify the stacked panels on Feedback and Returns (form panel + history panel) are separated by ~20px, not touching.
- [x] 3.4 Verify on Dashboard that `#dashboardWorkspace` and `#requestSection` sit ~20px below the title bar (including the hidden `#userInfoError` case) in both Dashboard and Request views.
- [x] 3.5 Verify layout stays responsive: containers remain centered with unchanged edge padding (`px-4 md:px-7`) at mobile and desktop widths.
- [x] 3.6 Verify no new or duplicate page titles, no changes to title-bar color/typography/rounded corners, and no changes to sidebar, header, or page content.
- [x] 3.7 Verify the Schedule page and Admin pages are visually unchanged (rule does not apply to them).