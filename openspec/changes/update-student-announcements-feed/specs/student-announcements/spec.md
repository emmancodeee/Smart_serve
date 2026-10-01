# student-announcements

## ADDED Requirements

### Requirement: Read-only announcement feed for students
The student Announcements page SHALL render a clean, read-only feed of announcement cards below a single page title. The page MUST NOT show statistics cards, dashboard widgets, filters, search, sort controls, featured/highlight summaries, feed metadata, or any announcement management controls to students.

#### Scenario: Page has a single title and a feed
- **WHEN** a student opens the Announcements page
- **THEN** the page displays exactly one title ("Announcements") followed by a vertical stack of announcement cards

#### Scenario: No management or analytics widgets
- **WHEN** a student views the Announcements page
- **THEN** no statistics cards, filters, search, sort controls, highlight banners, or management buttons are visible

### Requirement: Only Admin/Super Admin announcements are displayed
The student announcement feed SHALL display only announcements authored by an Admin or Super Admin. Announcements authored by students, regular users, or other unauthorized roles MUST NOT be returned or displayed.

#### Scenario: Announcements from Admin and Super Admin are shown
- **WHEN** announcements are published by an Admin and by a Super Admin
- **THEN** both announcements appear in the student feed

#### Scenario: Student-authored announcements are hidden
- **WHEN** an announcement was created by a student (non-admin `User`)
- **THEN** the announcement is not returned by the student announcements API and does not appear in the student feed

### Requirement: Announcement card content
Each announcement in the student feed SHALL be rendered as a white rounded card containing the announcement title, the announcement content/message, the published date and time, and a small role badge indicating "Admin" or "Super Admin".

#### Scenario: Card shows title, message, date, and badge
- **WHEN** a student views an announcement card published by an Admin
- **THEN** the card shows the title, message content, published date/time, and an "Admin" badge

#### Scenario: Super Admin badge
- **WHEN** a student views an announcement card published by a Super Admin
- **THEN** the card shows the title, message content, published date/time, and a "Super Admin" badge

### Requirement: Newest announcements first
The student announcement feed SHALL sort displayed announcements by published date, newest first.

#### Scenario: Feed ordering by publish date
- **WHEN** multiple Admin/Super Admin announcements exist with different published dates
- **THEN** the feed orders them from newest published date to oldest

### Requirement: Empty state
When there are no eligible published Admin/Super Admin announcements, the student Announcements page SHALL show only a simple empty state message: "No announcements available." The empty state MUST NOT reintroduce statistics, filters, or dashboard widgets.

#### Scenario: No eligible announcements
- **WHEN** no announcements are published by an Admin or Super Admin
- **THEN** the page shows "No announcements available." with no statistics, filters, or dashboard widgets

### Requirement: Published status only
The student announcement feed SHALL only include announcements that are published and not expired, consistent with the existing announcement status logic. Draft, deleted, unpublished, and expired announcements MUST NOT be displayed.

#### Scenario: Expired announcements excluded
- **WHEN** an Admin/Super Admin announcement has an expiry date in the past
- **THEN** the expired announcement is not displayed in the student feed

#### Scenario: Non-expired announcements displayed
- **WHEN** an Admin/Super Admin announcement has no expiry date or an expiry date in the future
- **THEN** the announcement is displayed in the student feed

### Requirement: Responsive layout
The student Announcements page layout SHALL remain responsive on desktop, laptop, tablet, and mobile screens with no overlapping text, no cards touching one another, no unnecessary horizontal scrolling, and consistent padding and spacing.

#### Scenario: Cards render cleanly on all screen sizes
- **WHEN** the Announcements page is viewed on desktop, laptop, tablet, or mobile widths
- **THEN** the announcement cards stack cleanly with proper spacing, no overlap, no horizontal scroll, and consistent padding

### Requirement: Admin/Super Admin management unchanged
Admin and Super Admin accounts SHALL retain the full announcement management experience (create, edit, delete, and manage/publish announcements). This change MUST NOT alter the Admin/Super Admin announcement management page or behavior.

#### Scenario: Admin management still functional
- **WHEN** an Admin opens the admin announcement management page
- **THEN** the Admin can still create, edit, delete, and manage announcements exactly as before

#### Scenario: Super Admin management still functional
- **WHEN** a Super Admin opens the admin announcement management page
- **THEN** the Super Admin can still create, edit, delete, and manage announcements exactly as before