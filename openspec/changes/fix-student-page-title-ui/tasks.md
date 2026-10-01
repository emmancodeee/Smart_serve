## 1. Audit current state

- [x] 1.1 Open each student page (`public/dashboard.html`, `public/returns.html`, `public/feedback.html`, `public/announcement.html`, `public/profile.html`) and inventory the current title/header section(s): every `.module-title-bar`, every standalone `h1`/`h2` page heading, and every in-panel heading that duplicates a page title.
- [x] 1.2 Identify any heading that equals the sidebar/module label (Dashboard, User Profile, Request, Announcements, Feedback, Returns) other than the intended single title bar, and any duplicate of the real page title.

## 2. Returns page (`public/returns.html`)

- [x] 2.1 Ensure exactly one `.module-title-bar` exists directly below the main header, containing "Submit Return Request".
- [x] 2.2 Remove any standalone "Returns" heading and any in-panel heading that duplicates "Submit Return Request", keeping section headings that are different content (e.g., "My Return Requests").

## 3. Feedback page (`public/feedback.html`)

- [x] 3.1 Ensure exactly one `.module-title-bar` exists directly below the main header, containing "Submit Feedback".
- [x] 3.2 Remove any standalone "Feedback" heading and any in-panel heading duplicating "Submit Feedback" (e.g., a duplicated panel button/heading), keeping distinct section headings (e.g., "My Feedback").

## 4. Announcements page (`public/announcement.html`)

- [x] 4.1 Ensure exactly one `.module-title-bar` exists directly below the main header, containing "Announcements".
- [x] 4.2 Remove any duplicate "Announcements" heading; keep distinct content headings (e.g., "Browse all published notices", "Announcement Feed").

## 5. User Profile page (`public/profile.html`)

- [x] 5.1 Ensure exactly one `.module-title-bar` exists directly below the main header, containing "User Profile".
- [x] 5.2 Remove any duplicate "User Profile" heading; keep distinct section headings (e.g., "Registration Details", change-password headings).

## 6. Dashboard page (`public/dashboard.html`)

- [x] 6.1 Ensure exactly one `.module-title-bar` exists directly below the main header containing "Dashboard" for the default/dashboard view.
- [x] 6.2 Remove any separate/extra "Dashboard" heading above or beside the title bar; keep distinct dashboard section headings (e.g., "Pickup Notifications", "Your Student Details").

## 7. Request section (Registration Workflow, `public/dashboard.html` + `public/js/dashboard.js`)

- [x] 7.1 Update `public/js/dashboard.js` section-visibility logic so the single title bar shows "Dashboard" when the dashboard view is active and the existing section title ("Registration Workflow") when the Request view (`#request`/`#registration`) is active.
- [x] 7.2 Remove any duplicate "Registration Workflow" heading in the Request section so exactly one such heading remains on the page, preserving the step label indicator and all workflow fields/behavior.

## 8. Spacing and layout

- [x] 8.1 Verify the title bar is full-width within the content container, left/right margins match the page container, and there is comfortable padding for the title text.
- [x] 8.2 Verify consistent margin above (below the main header) and below (above the first content block), with no overlap, touching text, or unnecessary blank space; adjust only the spacing that surrounds the title section.

## 9. Verification (no regressions)

- [x] 9.1 Load every student route (Dashboard, Dashboard#request, Profile, Announcements, Feedback, Returns) and confirm exactly ONE page title/header section per view, with the correct existing title and no sidebar-label duplicate.
- [x] 9.2 Confirm content, forms, tables, filters, data, API calls, routes, sidebar behavior, the main header, and Admin/Super Admin pages are unchanged.