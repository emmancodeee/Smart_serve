## Context

The Student Dashboard (`public/dashboard.html` + `public/js/dashboard.js`) currently renders a two-column workspace. The primary column contains a hero welcome card (`#dashboardOverview .dashboard-hero-card`, already hidden by `theme.css` but still in the DOM), three summary cards (`#dashboardHighlights`), and the Activity section (`#pickupNotifications`). The secondary column holds the `#profileSummary` "Your Student Details" card. The User Profile page (`public/profile.html` + `public/js/profile.js`) shows a "Registration Details" panel and an "Edit Your Profile" form.

Key constraints: layout-only change. No backend/API/database changes, no sidebar or color-scheme changes. All student profile data already flows through `GET /api/auth/me` via `buildCurrentUserPayload` (`services/authService.js`), which merges `User` + `Registration` fields (`name`, `email`, `studentNumber`, `course`, `yearLevel`, `age`, `studentType`, `status`, `module`, `books`, `uniformType`, `pickupDate`, `pictureOfId`). There is no phone/contact field in either model — Contact Number will render "Not on file".

The server error alert already exists (`#userInfoError` in `dashboard.html`, `.user-info-error` in `theme.css`, wired in `dashboard.js#loadUserInfo`), so the error-alert requirement is mostly satisfied already.

## Goals / Non-Goals

**Goals:**
- Dashboard main area becomes a single full-width column: title bar → error alert → three summary cards → Activity.
- Remove the hero card markup and the `#profileSummary` secondary column entirely.
- Activity section header titled "Activity"; its expandable Pickup Notifications card carries a notification icon, main text, subtitle, and a right-aligned "Show" control.
- User Profile page titled "User Profile" with a new "Your Student Details" section (7 fields, 2-col desktop / 1-col mobile), while the existing Registration Details panel and Edit Profile form stay intact.
- Keep all existing summary-card data logic and pickup-notifications logic working unchanged.

**Non-Goals:**
- No server, route, controller, service, or model changes.
- No sidebar / header / color / font / branding changes.
- No new data fields; Contact Number is a placeholder because no model field exists.
- No change to the Request (`#request`) registration workflow UI beyond what the single-column workspace requires.

## Decisions

### Decision 1: Remove hero card and secondary profile column from the Dashboard markup
Delete `article.dashboard-hero-card` from `#dashboardOverview` and delete the entire `<aside class="dashboard-secondary-column">` (`#profileSummary`) from `#dashboardWorkspace`. Convert `.dashboard-layout-grid` from the two-column template (`minmax(0,1.45fr) minmax(320px,0.75fr)` at ≥1024px) to a single-column stack so the primary column spans the full width.

- **Alternative considered:** keeping the DOM and only hiding via CSS. Rejected — leftover dead markup adds weight and conflicts with the "no hero, no profile column" requirement.
- **Rationale:** minimal structural change; the remaining content (`#dashboardOverview`, `#pickupNotifications`) already sits in the primary column and needs no re-parenting.

### Decision 2: Make the dashboard JS tolerate the removed nodes
`updateDashboardOverview` in `dashboard.js` currently returns early if `#dashboardHeroStatus` is missing, and `setDashboardSectionVisibility` references `#profileSummary`. Remove the hero node from `updateDashboardOverview`'s required-node guard (no hero status text is rendered anymore), drop the `#profileSummary` reference, and remove the now-unused `renderProfileSummary` + `statusPillClass` helpers from `dashboard.js`.

- **Rationale:** without this, removing the hero markup silently breaks summary-card updates (early-return on `null`).
- **Alternative considered:** leaving the dead code with optional-chaining guards. Rejected — leaves confusing no-op code and the hero guard is an actual functional hazard.

### Decision 3: Retitle the Activity section header and reuse the existing collapse control
The Activity section (`#pickupNotifications`) already renders an expandable "Pickup Notifications" toggle via `renderPickupSectionMode()` that shows a title, a subtitle (e.g., "No active pickup schedule"), and a right-aligned "Show"/"Hide" state. Change `#pickupSummaryHeader` so the section header reads "Activity" (same `.dashboard-panel-eyebrow`/`.dashboard-panel-title` style as other sections), then add a small notification (bell) icon to the left of the existing collapse toggle so the card satisfies the "icon on left, main text, subtitle, Show on right" requirement.

- **Rationale:** reuses proven collapse/expand behavior instead of building a second card; keeps the metrics/table content intact behind the toggle.
- **Alternative considered:** rewriting the Activity content into a new static card. Rejected — would duplicate or discard the existing dynamic pickup notifications.

### Decision 4: Add "Your Student Details" as a new section on the User Profile page
In `profile.html`, rename the first `.module-title-bar` from "Registration Details" to "User Profile". Add a new `.student-panel` section headed "Your Student Details" directly below it with seven fields: Student Name, Student ID, Email, Program/Course, Year Level, Contact Number, Registration Status. Give the existing Registration Details panel an internal heading so it stays identifiable now that the page title bar is repurposed. Keep the "Edit Your Profile" title bar and form untouched.

- **Alternative considered:** replacing the Registration Details panel with the new section. Rejected — the user explicitly requires the existing Registration Details panel to remain.
- **Rationale:** additive change; all existing features preserved per the non-goals.

### Decision 5: Populate the new profile fields from the existing payload
Extend `setRegistrationInfo` (or a small sibling function) in `profile.js` to fill `user.name` → Student Name, `user.studentNumber` → Student ID, `user.email` → Email, `user.course` → Program/Course, `user.yearLevel` → Year Level, `user.status` → Registration Status, and Contact Number → "Not on file" (no data source). Use the existing two-column grid pattern (`md:grid-cols-2`) already used by the Registration Details panel, with Registration Status full-width, stacking to one column under `768px`.

- **Rationale:** zero backend surface; mirrors the responsive pattern already on the page.
- **Alternative considered:** adding a `contact`/`phone` field to the schema. Rejected per user decision — UI-only change.

## Risks / Trade-offs

- [Removing the hero markup breaks `updateDashboardOverview`'s early-return guard, freezing the summary cards] → Decision 2 removes the hero from the guard as part of the same change; verified via code review and a browser smoke test.
- [The already-hidden hero card (`display:none` in `theme.css`) is removed from DOM, changing nothing visually on the Dashboard] → Low risk; confirmed the hero has no other behavior besides hosting status text that moves nowhere else and is only descriptive.
- [Renaming the page title bar could orphan the "Registration Details" label] → Decision 4 adds an internal heading to that panel so the label survives.
- [Contact Number always shows "Not on file"] → Accepted trade-off; visible placeholder rather than an empty field, until a real field exists.
- [Single-column grid change could affect the Request (#request) view spacing] → `.dashboard-layout-grid` is dashboard-only and `setDashboardSectionVisibility` hides the workspace on `#request`; verified no shared class.

## Migration Plan

No data migration. Deploy by updating `public/dashboard.html`, `public/js/dashboard.js`, `public/profile.html`, `public/js/profile.js`, and only necessary shared CSS in `public/css/theme.css`. Rollback is a revert of those files; no server restart or state change required.

## Open Questions

None.