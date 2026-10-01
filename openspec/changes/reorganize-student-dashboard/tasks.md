## 1. Dashboard markup: single-column workspace

- [x] 1.1 Remove the hero welcome card markup (`article.dashboard-hero-card` and its overlay block) from `#dashboardOverview` in `public/dashboard.html`
- [x] 1.2 Remove the entire secondary column (`aside.dashboard-secondary-column` including `#profileSummary` "Your Student Details" card) from `#dashboardWorkspace` in `public/dashboard.html`
- [x] 1.3 Convert `.dashboard-layout-grid` to a single-column layout (remove the `grid-template-columns: minmax(0,1.45fr) minmax(320px,0.75fr)` rule at ≥1024px) so the primary column spans the full width; remove the now-unused `.dashboard-profile-card` sticky rule
- [x] 1.4 Retitle the Activity section header so it reads "Activity" with the existing blue section-header style in `#pickupSummaryHeader`

## 2. Dashboard JS: tolerate removed nodes and render Activity card

- [x] 2.1 In `public/js/dashboard.js`, remove the hero status node from the required-node guard in `updateDashboardOverview` so the summary cards still update after the hero markup is gone
- [x] 2.2 Remove the `#profileSummary` reference from `setDashboardSectionVisibility` in `public/js/dashboard.js`
- [x] 2.3 Remove the now-unused `renderProfileSummary` and `statusPillClass` functions from `public/js/dashboard.js`
- [x] 2.4 Add a notification (bell) icon to the left of the Activity collapse toggle in `renderPickupSectionMode` so the Pickup Notifications card shows icon, "Pickup Notifications" main text, subtitle, and right-aligned "Show" control

## 3. Activity / error alert spacing polish

- [x] 3.1 Ensure the Activity section renders full-width directly below the summary cards with consistent spacing (no overlap, even gaps)
- [x] 3.2 Ensure the server error alert (`#userInfoError`) sits directly below the Dashboard title bar full-width, message left / Retry right, vertically centered, with spacing below and no overlap, and only shows on an actual server/network error (verify existing wiring, add margin only if missing)

## 4. Profile page: title and Student Details section

- [x] 4.1 In `public/profile.html`, rename the first `.module-title-bar` from "Registration Details" to "User Profile"
- [x] 4.2 Add a "Your Student Details" section (`.student-panel`) below the title with fields: Student Name, Student ID, Email, Program/Course, Year Level, Contact Number, Registration Status
- [x] 4.3 Give the existing Registration Details panel an internal heading so it remains identifiable now that the page title bar reads "User Profile"
- [x] 4.4 Style the Student Details section as a two-column grid on desktop (`md:grid-cols-2`), Registration Status full-width, stacking to one column on mobile with no horizontal scroll

## 5. Profile JS: populate Student Details

- [x] 5.1 In `public/js/profile.js`, extend registration-info population to fill the new fields: Student Name (`user.name`), Student ID (`user.studentNumber`), Email (`user.email`), Program/Course (`user.course`), Year Level (`user.yearLevel`), Registration Status (`user.status`), Contact Number placeholder "Not on file"

## 6. Verification

- [x] 6.1 Run `node --check` on all edited JavaScript files (`public/js/dashboard.js`, `public/js/profile.js`)
- [x] 6.2 Grep `public/dashboard.html` and `public/js/dashboard.js` to confirm no `hero-card`, `profileSummary`, or `dashboard-secondary-column` remnants remain
- [x] 6.3 Run `npm test` and confirm no new test failures beyond the pre-existing `tests/admin-filters.test.js` `blob.text is not a function` failures
- [ ] 6.4 Browser smoke test (manual): Dashboard shows title → error alert (when offline) → three summary cards in one row → Activity section, with no empty right column; User Profile shows "User Profile" title and the "Your Student Details" section in a two-column grid that stacks on mobile