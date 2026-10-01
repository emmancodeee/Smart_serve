## 1. Backend: author-role filtering for students

- [x] 1.1 In `announcementService.js`, resolve the announcement author role (Super Admin / Admin / non-admin) from the polymorphic `createdByModel` reference using the `Admin.isSuperAdmin`/`isAdmin` and legacy `User.isAdmin` flags, with fallback to treat orphaned `Admin`-model refs as Admin so historical posts remain visible
- [x] 1.2 Extend `listStudentAnnouncements` in `announcementService.js` to return only announcements whose author resolves to Admin or Super Admin, while preserving the existing audience, expiry, and resource-availability query logic and `publishedAt: -1` sort
- [x] 1.3 Extend the announcement serializer used by the student endpoint to include an `authorRole` field (`admin` / `super_admin`) so the client can render the role badge without extra round-trips
- [x] 1.4 Verify the student endpoint `GET /api/auth/announcements` (`announcementController.listStudentAnnouncements`) no longer returns student-authored or non-admin-authored announcements

## 2. Frontend: strip the dashboard widgets from the student page

- [x] 2.1 In `public/announcement.html`, remove the four statistics cards (`#totalCount`, `#liveCount`, `#upcomingCount`, `#importantCount`) and the `schedule-stat-card` grid
- [x] 2.2 Remove the filter sidebar ("Announcement Center", "Browse all published notices", Category/Timeframe/Sort selects, Search input, Clear Filters, Last synced note) and its grid wrapper
- [x] 2.3 Remove the featured/HIGHLIGHTS banner (`#featuredAnnouncement`), the feed meta pill (`#announcementResultsMeta` and feed header markup), and the details modal
- [x] 2.4 Reduce the content area to the existing "Announcements" title bar (`module-title-bar`) plus a single feed container (`#announcementList`) and an empty-state element
- [x] 2.5 Remove now-unused CSS rules scoped to the deleted widgets (stat cards, filter controls, feature card, state/priority pills) while keeping the shared shell, `student-panel`, `announcement-card`, and badge styles

## 3. Frontend: rewrite the student feed rendering

- [x] 3.1 In `public/js/announcement.js`, delete summary, featured, filter, search, sort, meta, and details-modal functions (`populateAnnouncementTypeFilter`, `getFilteredAnnouncements`, `renderAnnouncementSummary`, `pickFeaturedAnnouncement`, `renderFeaturedAnnouncement`, `renderAnnouncementMeta`, `showAnnouncementDetails`, `resetAnnouncementFilters`, and related helpers)
- [x] 3.2 Add a single `renderAnnouncementFeed()` pipeline that renders the fetched Admin/Super Admin announcements as stacked white rounded cards (title, content, localised published date/time, role badge "Admin"/"Super Admin")
- [x] 3.3 Render the "No announcements available." empty state inside the page when the feed has zero eligible announcements; ensure no stats, filters, or widgets return with it
- [x] 3.4 Keep token handling, 401/403 redirects, and the existing 30s realtime refresh (`startRealtimeRefresh`) and `visibilitychange` reload behavior working with the new renderer
- [x] 3.5 Ensure the card list uses the available page width (no compressed/narrow layout) and full width on mobile

## 4. Style: badge, cards, spacing, responsiveness

- [x] 4.1 Add/extend a small "Admin"/"Super Admin" role badge style on the card using the existing navy/gold theme
- [x] 4.2 Confirm consistent spacing between the title bar, cards, and empty state; confirm cards do not touch and padding is consistent across breakpoints
- [x] 4.3 Verify no horizontal scrolling, no overlapping text, and clean stacking on desktop, laptop, tablet, and mobile widths

## 5. Verification

- [x] 5.1 Run existing tests (e.g., `npm test`) and confirm no regressions in auth/admin behavior
- [ ] 5.2 Manually verify: admin-created and super-admin-created announcements appear with correct badges/newest-first; student/user-created announcements never appear; expired announcements are hidden; empty state shows when no eligible announcements exist
- [x] 5.3 Confirm the admin announcement management page (`public/admin.html` / `public/js/admin.js`) still supports create, edit, delete, and manage/publish for Admin and Super Admin with no visual or behavior changes
- [x] 5.4 Confirm student sidebar, header, dashboard, profile, request, feedback, and returns pages are untouched