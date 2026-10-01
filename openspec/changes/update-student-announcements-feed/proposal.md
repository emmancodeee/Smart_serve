## Why

The student Announcements page currently presents an analytics/dashboard experience (statistics cards, category/timeframe/sort filters, search, "Announcement Center", highlights, and a featured banner) that is not appropriate for students. Students should only read announcements published by the Admin or Super Admin. The page hides this real purpose behind management-like widgets, clutter, and even exposes student-created announcements to other students. This change simplifies the page into a clean, read-only announcement feed that shows only Admin/Super Admin published announcements in the existing Smart Serve visual theme.

## What Changes

- Replace the student Announcements dashboard (stats cards, filter sidebar, highlights, featured banner, feed meta) with a single clean feed of announcement cards.
- Keep exactly one page title: "Announcements", using the existing blue title bar style (`module-title-bar`).
- Restrict the content shown to students to announcements published by an **Admin** or **Super Admin** creator only. Student-created (or other unauthorized role) announcements are never shown.
- Continue to respect the existing publication semantics: expired announcements (per `expiresAt`), and any announcement not visible under the current audience/resource visibility rules, are not shown.
- Sort displayed announcements by newest `publishedAt` first.
- Render each announcement as a white rounded card containing: title, content/message, published date/time, and a small role badge ("Admin" or "Super Admin").
- Show a simple empty state — "No announcements available." — when there are no eligible Admin/Super Admin published announcements.
- Do NOT change any Admin/Super Admin announcement management capability (create, edit, delete, publish, filters) or the admin announcements page.
- Do NOT change the student sidebar, header, dashboard, or any other student page.

## Capabilities

### New Capabilities
- `student-announcements`: Read-only student-facing announcement feed — a clean, responsive list of announcement cards restricted to Admin/Super Admin published announcements, with the existing Smart Serve blue/navy theme.

### Modified Capabilities
<!-- No existing spec-level requirement changes. The student sidebar spec (student-sidebar-design) is untouched; this change is scoped to the announcements content area. -->

## Impact

- **Frontend (student)**: `public/announcement.html` — remove stats cards, filter sidebar, "Announcement Center", highlights/featured card, feed meta, and details modal; reduce layout to title bar + announcement cards + empty state.
- **Frontend (JS)**: `public/js/announcement.js` — rewrite rendering logic to build the read-only feed; remove summary/featured/filter/search/sort functions; keep token handling, realtime refresh, and API fetch.
- **API**: `GET /api/auth/announcements` (`announcementController.listStudentAnnouncements` → `announcementService.listStudentAnnouncements`) — add author/role filtering so only Admin/Super Admin authored announcements are returned, while preserving the existing audience + expiry + resource-visibility logic.
- **Model**: `models/Announcement.js` — no schema change expected; role is derived from the polymorphic author (`createdByModel`/`createdByModel` resolver against `Admin` and `User` collections, using `isAdmin`/`isSuperAdmin` flags).
- **Styling**: reuse existing Tailwind classes, `theme-light` shell, `student-panel`, `module-title-bar`, and `announcement-card` styles. No new dependencies.
- **Non-goals (unchanged)**: admin announcement page (`public/admin.html`, `public/js/admin.js`), admin API routes, student sidebar/header/dashboard/profile/request/feedback/returns, auth.