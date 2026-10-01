## 1. Spacing rule

- [x] 1.1 In `public/css/theme.css`, remove the old sibling rule `:is(.dashboard-main-inner, .student-main-inner) > .module-title-bar ~ * { margin-top: 20px }` (lines 41-49 block)
- [x] 1.2 Add a uniform rule scoped to `body.theme-light :is(.dashboard-main-inner, .student-main-inner) > .module-title-bar`: `margin-top: 1.25rem !important` (20px header→title gap, matching Admin `mt-5`; set on the title itself because the shipped `tailwind.css` has no `.pt-5` rule) and `margin-bottom: 1.25rem !important` (uniform 20px below, matching Admin `mb-5`)
- [x] 1.3 Confirm the rule covers all six student modules (Dashboard, User Profile, Request, Announcements, Feedback, Returns) via the shared `dashboard-main-inner`/`student-main-inner` selector and touches nothing else

## 2. Verification

- [x] 2.1 Confirm top gap header→title = 20px and bottom gap title→content = 20px on all six pages (matches Admin `mt-5`/`mb-5`); Announcements and Profile no longer show a doubled 40px below-gap
- [x] 2.2 Confirm the title box does not touch or overlap the header at desktop and mobile widths
- [x] 2.3 Confirm title box alignment: full content-column width between `px-4`/`md:px-7` edges, consistent on every module
- [x] 2.4 Confirm no layout shift or reflow introduced; title box styling, header contents, sidebar, labels, and routing unchanged

## 3. Regression safety

- [x] 3.1 Run `git diff` and confirm only `public/css/theme.css` changed by this change; no HTML, JS, admin, schedule, or title-styling code touched
- [x] 3.2 Verify `schedule.html`, Admin/Superadmin pages render unchanged (routes 200, no console errors)
- [x] 3.3 Visual pass: clean, consistent 20px gap above and below the blue title box on all six student pages, matching the Super Admin/Admin layout