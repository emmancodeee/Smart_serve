# Proposal: Resource-availability based Student Announcements

## Problem Statement

The Student Announcements page today shows every non-expired student announcement regardless of whether any of the related school resources can actually be provided. A student can see "Books are now available for pickup" when the Books inventory is empty, or "Uniforms available" when no uniform stock exists, which misleads students into wasting a trip or submitting requests that cannot be fulfilled.

The same page is also cluttered: it carries a left filter panel (Category, Timeframe, Sort), a search box, a Clear Filters control, summary stat cards, a "featured" announcement slot, and a "Last synced" label — none of which the student asked for. The page should be a simple, view-only list of announcements that are actually actionable right now.

## Why Change

- **Truthful announcements.** Announcements tied to Books, Modules, or Uniforms should only be shown while that resource is actually available in inventory (`available_quantity > 0`). Hidden automatically the moment stock runs out; reappear automatically when restocked. No admin action required.
- **Better student focus.** Students just read announcements; they do not filter or manage them. Removing the filter/search/stats/featured clutter makes the page one title box and a feed.
- **No data loss.** Announcements are never deleted or unpublished — availability only controls *visibility*.
- **Admin unchanged.** Admin Announcements management (create/edit/delete, the SmartFilter toolbar) stays byte-identical.

## What Changes

### Backend (availability gateway)

`announcementService.listStudentAnnouncements()` gains a real-time inventory availability check:

1. After loading the eligible student announcements, aggregate the live inventory in one query, summing `quantity` per category for the three supported resources: `Books`, `Modules`, `Uniforms` (`Inventory.category`; `quantity` is already the running available stock — allocations decrement it on approval and restore it on revert).
2. Announcement-to-resource relationship is derived from the announcement's free-text `category`, normalized case-insensitively with singular/plural aliases (`Book`/`Books`, `Module`/`Modules`, `Uniform`/`Uniforms`) so posting as either form works.
3. A resource-related announcement is returned **only if** that resource's summed quantity is `> 0`; it is hidden entirely (not deleted) when the sum is `0`.
4. Announcements whose category is **not** related to Books/Modules/Uniforms follow the existing rules exactly (audience = students, not expired) — no invented resource relationship.

The check runs on every request, so the feed reflects inventory changes live.

### Frontend (student page only)

`public/announcement.html`:

- Keep: the "Announcements" blue title box, the announcement feed (full width), and the announcement-details modal.
- Remove: the left filter panel (Category / Timeframe / Sort / Search / Clear Filters), the four summary stat cards, the "featured announcement" slot, the "Last synced" label, and all their now-dead CSS.

`public/js/announcement.js`:

- Keep: auth checks, header/clock wiring, `loadAnnouncements` (fetching `/api/auth/announcements`, `cache: 'no-store'`), the announcement card renderer, the details modal, and the periodic real-time refresh (so availability changes appear without a manual reload).
- Remove: client-side filter/search/sort logic (`getFilteredAnnouncements`, `populateAnnouncementTypeFilter`, `resetAnnouncementFilters`), the summary/stat renderers, the "Last synced" renderer, the featured-announcement renderers, and the static listeners for the removed controls. The empty/error state renders into the feed list instead of the featured slot.

## Impact

| Area | Impact |
| --- | --- |
| Data | None. No announcements are deleted, unpublished, or edited. |
| API | `GET /api/auth/announcements` same contract (array); payload may be shorter because unavailable items are filtered out. |
| Admin | No change. Admin Announcements CRUD and the admin page are untouched. |
| Student pages other than Announcements | No change. |
| Performance | One small `Inventory.aggregate` per request — negligible at capstone scale. |

## Scope

In scope: `announcementService.listStudentAnnouncements()`, `public/announcement.html`, `public/js/announcement.js`, and their inline/resource CSS used by the student page.

Out of scope: Admin announcements UI, sidebar/header, dashboard stats, other student pages.

## Success Criteria

- An announcement for a resource with zero inventory is not returned by `/api/auth/announcements`; the same announcement reappears when inventory is restocked (re-fetch, no cache).
- Announcements not related to Books/Modules/Uniforms are returned under the existing rules regardless of inventory.
- The student page contains only: the "Announcements" title box, the list of available announcements, and the details modal — no filters, search, stats, featured slot, or "Last synced".
- Admin Announcements management is byte-identical to before.