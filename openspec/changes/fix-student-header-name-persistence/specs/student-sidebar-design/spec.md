## ADDED Requirements

### Requirement: Header name persistence
On every Student Side module header (Dashboard, User Profile, Request, Announcements, Feedback, Returns, and Schedule), the logged-in student's name SHALL always remain visible: the header welcome element SHALL show `Welcome, <FirstName>` and the profile block (avatar + name beside it) SHALL show the student's full name. Navigating between modules SHALL NOT clear, reset, or blank the displayed name. The name SHALL be sourced from the same authenticated/session user data (`/api/auth/me`) on every module — never from hardcoded or page-specific names — and SHALL be implemented through a single shared header renderer reused by all student pages. A cached copy of the student profile SHALL be rendered synchronously before any network round-trip so the header is never blank while data loads, and SHALL be retained when a refresh fails. The header and sidebar design, colors, spacing, and layout SHALL remain unchanged.

#### Scenario: Name visible on every module after login
- **WHEN** a student logs in and opens any of Dashboard, User Profile, Request, Announcements, Feedback, Returns, or Schedule
- **THEN** the header shows `Welcome, <First Name>` and the student's full name beside the profile/avatar on every module

#### Scenario: Name survives slow or failing refresh
- **WHEN** a module's `/api/auth/me` refresh is slow or fails after a successful login
- **THEN** the header still shows the student's cached name (never the static placeholder), because the cached profile is rendered synchronously before the fetch and retained on failure

#### Scenario: Same data reused across pages
- **WHEN** the student navigates between modules
- **THEN** every page renders the header name from the same authenticated session data via the shared `student-header` module, with no per-page hardcoded names and the header/sidebar design unchanged