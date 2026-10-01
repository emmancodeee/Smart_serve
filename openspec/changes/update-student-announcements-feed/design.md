## Context

The Smart Serve student Announcements page (`public/announcement.html`) is currently built as a dashboard: four statistics cards (Total Announcements, Active, Ending Soon, High Priority), an "Announcement Center" filter sidebar (Category, Timeframe, Sort, Search, Clear Filters), a featured "HIGHLIGHTS" banner, and a feed with a "N announcements shown" meta pill. All of this is driven client-side by `public/js/announcement.js`.

The backend serves announcements to students via `GET /api/auth/announcements`, backed by `announcementController.listStudentAnnouncements` → `announcementService.listStudentAnnouncements`. The current query filters by `audience: 'students'`, hides expired items, and applies resource-availability visibility. It does NOT filter by author role, so any `Announcement` (including ones authored by students) is eligible for the feed.

Author role is not stored as a simple enum. The `Announcement` model uses a polymorphic author reference (`createdByModel`: `'Admin' | 'User'` plus `createdById`). Real role is derived from the referenced `Admin` document's `isAdmin`/`isSuperAdmin` booleans (or legacy `User.isAdmin`). Announcements created through the admin UI always have `createdByModel: 'Admin'`.

The app is a Node.js + Express server serving static HTML under `public/`, styled with a compiled Tailwind build plus inline page CSS using the navy/blue `theme-light` shell (sticky navy topbar `#152c69`, navy sidebar gradient, light blue `#eef5ff` body, gold accents, rounded cards).

## Goals / Non-Goals

**Goals:**
- Convert the student Announcements page into a clean, read-only feed: one "Announcements" title bar followed by stacked white rounded announcement cards.
- Only Admin/Super Admin authored announcements are visible to students.
- Feed sorted newest `publishedAt` first; expired items excluded.
- Simple empty state with no management widgets.
- Reuse the existing Smart Serve visual system (Tailwind + theme classes); layout is responsive on desktop, laptop, tablet, mobile.
- Keep admin/super admin announcement management completely intact.

**Non-Goals:**
- No changes to the admin announcements page, admin API, admin filtering engine, or CSV export.
- No changes to student sidebar/header/dashboard/profile/request/feedback/returns or auth.
- No changes to the `Announcement` schema (roles are derived, not stored on the announcement).
- No pagination; the existing full-array fetch pattern is retained.

## Decisions

**Decision 1: Filter author role on the server, not just the client.**
`listStudentAnnouncements` will be extended to only return announcements whose author resolves to an Admin or Super Admin. The API response for students already JSON-serializes; we add author-role info so the client can render the badge.
- Rationale: server-side filtering keeps other clients/tests honest and matches the "system must not expose student-created announcements" requirement. Client-only filtering would still leak data.
- Alternative considered: filtering in `announcement.js` only (zero backend risk) — rejected because it would rely on the payload including student-authored items and could show stale/incorrect data on refresh; server filtering is the correct source of truth.

**Decision 2: Derive role from the polymorphic author reference.**
For each announcement authored via `createdByModel: 'Admin'` (or legacy `User.isAdmin`), resolve the role:
- Resolve `createdById` through the polymorphic ref (`Admin` or `User`).
- Admin doc with `isSuperAdmin: true` → `SUPER_ADMIN` (badge "Super Admin").
- Admin doc (or legacy user with `isAdmin`) → `ADMIN` (badge "Admin").
- `User` without `isAdmin` (or unresolved author) → excluded from student feed.
- Eagerly populate the author on the existing list query to avoid N+1 lookups.
- Rationale: matches the existing role model (`Admin.isSuperAdmin`, `User.isAdmin`) and the serializer's existing polymorphic resolution pattern.
- Alternative: adding a stored `createdByRole` field — rejected as a schema migration with backfill/two-source-of-truth risk when the model already has a referable author.

**Decision 3: Extend the announcement serializer with a role field for the client.**
`serializeAnnouncement` gains an `authorRole` value (`'admin' | 'super_admin'`, or absent) so `announcement.js` can render the badge without re-fetching. The badge text is derived: `Admin` / `Super Admin`.
- Rationale: client already receives each item as JSON; adding a small derived field is cheaper than a separate role endpoint.

**Decision 4: Rewrite the student page to a single-card feed; delete the dashboard shell.**
In `public/announcement.html`, remove the stats grid, filter sidebar, featured/highlights card, feed meta, and details modal. Keep the outer page shell (sidebar, topbar, `module-title-bar`) untouched. The main surface becomes a stacked list of `announcement-card` elements plus a state-driven empty state. In `public/js/announcement.js`, remove summary/featured/filters/search/sort functions and replace the render pipeline with a single `renderAnnouncementFeed()`.
- Rationale: minimal, surgical change consistent with "Only modify the Announcements page/content."
- Reuse existing `.announcement-card`, `student-panel`, spacing, and pill styles; clean up unused CSS only in the range scoped to the removed widgets.

**Decision 5: Preserve existing publication/visibility rules.**
Keep the existing query logic: `audience: 'students'`, exclude `expiresAt < now`, keep resource-availability filtering, sort `publishedAt: -1`. The feed therefore never shows expired/out-of-availability items while the existing status logic is preserved. The client no longer computes Expired/Ending Soon/Active state pills.
- Rationale: requirement 7 explicitly says keep publication logic; we only layer role filtering on top.

**Decision 6: Keep the realtime refresh.**
Retain the 30s polling / visibilitychange refresh in `announcement.js`. The feed re-renders on each load.
- Rationale: announcements published by admins will appear without a manual page reload; low cost, existing behavior.

## Risks / Trade-offs

- **[Legacy-user authored admins]** → Announcements created by a legacy `User` with `isAdmin: true` must still count as Admin-authored. Resolve via the same `accountType`/`isAdmin` logic used by `authenticateAdminRequest` so existing data stays visible.
- **[Author no longer an admin]** → If an admin's account is demoted, their past announcements could be hidden. Mitigate by treating unresolved `Admin` refs against the resolved model; if the ref is missing, fall back to `createdByModel === 'Admin'` → treat as Admin so historical posts are not silently lost. Document in code.
- **[Deliberately introduces a backend behavior change]** → Student API response shape changes (adds `authorRole`). No consumers outside this page use the field; additive, so backward compatible.
- **[Removed UI previously exposed student-created announcements]** → Intended; those announcements are also hidden at the API layer, so they remain in the system (and in admin view) but not visible to students.
- **[No published Admin/Super Admin announcements]** → Empty state "No announcements available." rendered inside the existing panel styling; no stats or filters return.
- **[Responsiveness regression]** → Cards are full-width stacked blocks using existing fluid layout + Tailwind responsive utilities already proven on other student pages; verified on desktop/laptop/tablet/mobile in review.