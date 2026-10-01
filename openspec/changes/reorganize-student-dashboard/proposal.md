## Why

The Student Dashboard main area is a two-column layout where a right-hand "Your Student Details" card duplicates profile information, and a blue hero welcome card pushes the real content down. The Activity (Pickup Notifications) area is squeezed into a narrow column, making the overview feel cluttered instead of a clean one-page summary. Student details belong on the User Profile page, not the Dashboard.

## What Changes

- **Remove the hero welcome card** ("Hello, [Name]!") from the Dashboard so the main area reads top to bottom: Dashboard title bar, server error alert, three summary cards, Activity. No hero card.
- **Remove the right-hand "Your Student Details" (PROFILE) card and the secondary column** from the Dashboard entirely. No empty column remains; Dashboard content expands to the full available width.
- **Server error alert**: render as a full-width banner directly under the Dashboard title bar. Message on the left ("Cannot reach the server. Check your connection and try again."), Retry button on the right, vertically centered, with spacing below and no overlap. It SHALL only appear on an actual server/network error.
- **Three summary cards** (Registration, Request Items, Next Pickup) display in a single row on desktop, equal width and height, aligned tops and bottoms, equal spacing, filling the full available width. Keep the existing icon style, icon background colors, rounded corners, borders/shadows, and padding. Cards stack vertically on mobile. Their existing data logic is unchanged.
- **Activity section** becomes full-width directly below the summary cards. The section header uses the same blue section-header style and is titled "Activity". Inside it, a "Pickup Notifications" card shows a notification icon on the left, "Pickup Notifications" as the main text, a subtitle such as "No active pickup schedule", and a "Show" control aligned far right, in a clean rounded container with consistent padding and vertical alignment.
- **User Profile page** gains the Student Details content previously shown on the Dashboard:
  - Main page title: "User Profile".
  - New "Your Student Details" section with fields: Student Name, Student ID, Email, Program/Course, Year Level, Contact Number, Registration Status.
  - Two-column layout on desktop (Student Name / Student ID, Email / Program-Course, Year Level / Contact Number, Registration Status full-width), stacking to a single column on mobile.
  - Contact Number has no backing data model field, so it renders as a placeholder "Not on file" when absent. No backend/database changes.
  - Existing Registration Details panel and Edit Your Profile form remain unchanged and functional.

No routes, backend/API endpoints, database schema, sidebar design, color scheme, fonts, or branding are changed. This is a layout-only reorganization.

## Capabilities

### New Capabilities
- `student-dashboard-layout`: The Dashboard overview layout — single full-width main area ordered as title bar, error alert, three summary cards in one row, and a full-width Activity section, with the profile summary card removed.
- `student-profile-layout`: The User Profile page layout — "User Profile" page title and a "Your Student Details" section (Student Name, Student ID, Email, Program/Course, Year Level, Contact Number, Registration Status) in a responsive two-column grid.

### Modified Capabilities
<!-- No existing capability's requirements change. Student Sidebar Design is untouched. -->

## Impact

- `public/dashboard.html` — remove hero card, remove secondary profile column, restructure workspace to a single column, retitle/restructure Activity header.
- `public/js/dashboard.js` — drop references to the removed hero elements; adjust Activity section header/render for the "Activity" title and Pickup Notifications card; keep summary-card data logic intact.
- `public/profile.html` — retitle page to "User Profile", add "Your Student Details" section and field containers.
- `public/js/profile.js` — populate the new Student Details fields from the existing `/api/auth/me` payload.
- `public/css/theme.css` — shared layout/widget styles touched only as needed for the single-column dashboard, Activity card, and profile details grid.
- No server code, routes, models, or database changes.