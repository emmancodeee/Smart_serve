## Why

On the student-side pages, a new blue title bar is being rendered above the actual page title, and it carries the sidebar/module name instead of the page title itself. For example, the Returns page currently shows a blue box labeled "Returns" and, below it, the real heading "Submit Return Request". This produces a duplicate, misleading header: the sidebar/module name (e.g., "Returns") is shown as if it were the page title, while the actual page title appears as a second heading underneath. The student modules (Dashboard, User Profile, Request, Announcements, Feedback, Returns) need exactly ONE title/header section directly below the main top header, and that section must contain the existing page title.

## What Changes

- Each student-side module page renders exactly ONE blue rounded title/header box directly below the main top header.
- The blue title box contains the EXISTING page/module title text (e.g., "Submit Return Request", "Submit Feedback", "Announcements", "User Profile", "Registration Workflow", "Dashboard"). It MUST NOT introduce new titles.
- The sidebar/module name (Dashboard, User Profile, Request, Announcements, Feedback, Returns) is NEVER rendered again as a standalone page title above or beside the blue title box.
- Any extra heading that duplicates the page title is removed so only one header section exists per page/view.
- The blue box matches the existing Admin/Super Admin design language: dark navy (`#152c69`), rounded top corners, clean bold white text, horizontal/vertical padding, full width within the content container, consistent margin below the main header and above the content, with no overlapping content.
- Content, data, APIs, routes, sidebar behavior, main header layout, forms, tables, filters, and Admin/Super Admin pages are NOT changed. This is a UI-only presentational correction of the student page title/header section.

## Capabilities

### New Capabilities
- `student-page-title-header`: Defines the single page title/header section for student-side modules — one blue rounded title bar directly below the main header containing the existing page title, with no duplicate sidebar/module-name heading anywhere on the page.

### Modified Capabilities
<!-- No existing specs in openspec/specs. -->

## Impact

- Front-end only: the student static HTML pages under `public/` (`dashboard.html`, `profile.html`, `announcement.html`, `feedback.html`, `returns.html`) and, where the Request section title needs to reflect the active dashboard view, `public/js/dashboard.js`. Shared CSS already provides `.module-title-bar` in `public/css/theme.css`.
- No server API, route, data, permission, or behavior changes. No page titles are renamed or removed as content; the duplicate module-name heading is removed.
- Risk is low: markup changes are limited to the title/header area of the listed pages; CSS is additive/override.