# Design: Resource-availability based Student Announcements

## Context

- `models/Inventory.js`: `{ itemName, category, quantity (min 0), unitOfMeasure, reorderLevel, … }`. `quantity` is the running available stock: `services/registrationInventoryService.js` decrements it on registration approval (`match.quantity -= request.quantity`) and restores it on revert — there is no separate allocation field, so `quantity` is the source of truth for "available".
- Canonical inventory categories for the three supported resources are exactly `['Books', 'Modules', 'Uniforms']` (`registrationInventoryService.js:68` uses `category: { $in: [...] }` and builds requests with `category: 'Modules' | 'Books' | 'Uniforms'` at L21/L25/L30).
- `models/Announcement.js`: `{ title, content, category (free text, default 'General'), priority, audience ('students'), publishedAt, expiresAt, createdBy…, timestamps }`. No explicit resource link; the relationship is expressed via `category`.
- `announcementService.listStudentAnnouncements()` currently filters `audience: 'students'` + not expired, sorts `publishedAt desc`, and returns everything — this is where the availability gateway goes.
- Admin handoff untouched: `routes/auth.js:67-72` admin CRUD; admin page uses its own `#announcements` section and `public/js/admin-filters.js` (SmartFilter). None of those are modified.

## Design decisions

### D1. Backend availability gateway

Inside `announcementService.listStudentAnnouncements()`:

1. Fetch the eligible announcements exactly as today (`audience: 'students'`, `$or` expiresAt null/>= now, sorted `publishedAt desc`).
2. In one aggregation, group live inventory for the three supported categories and sum `quantity`:

   ```js
   const [availability] = await Inventory.aggregate([
     { $match: { category: { $in: ['Books', 'Modules', 'Uniforms'] } } },
     { $group: { _id: '$category', total: { $sum: { $ifNull: ['$quantity', 0] } } } }
   ]).then(rows => [Object.fromEntries(rows.map(r => [r._id, r.total]))]);
   ```
   `availability` = `{ Books: n, Modules: n, Uniforms: n }` (categories with no items are simply absent → treated as `0`).
3. Filter announcements: keep an announcement unless it resolves to a supported resource whose availability is `0`:

   ```js
   const visible = eligible.filter(item => {
     const resource = announceableResourceCategory(item?.category);  // 'Books' | 'Modules' | 'Uniforms' | null
     return !resource || (availability[resource] || 0) > 0;
   });
   ```

This re-aggregates on every request (no cache) → real-time visibility, matching the requirement that restock/stockout apply automatically.

### D2. Resource cateogy resolution (pure, testable)

New small pure helper (exported from `announcementService.js` so it can be unit-tested without a database):

```js
function announceableResourceCategory(value) {
  const key = String(value || '').trim().toLowerCase().replace(/s$/, '');
  if (key === 'book') return 'Books';
  if (key === 'module') return 'Modules';
  if (key === 'uniform') return 'Uniforms';
  return null;
}
```

- Case-insensitive, trims, tolerates singular/plural (`Book`/`books` → `Books`, `Module`/`modules` → `Modules`, `Uniform`/`uniforms` → `Uniforms`). Any other category → `null` → "not a resource announcement" → existing rules only. This is normalization, not relationship invention: singular/plural forms of the three actual inventory categories are the same resource.

### D3. Frontend page (`public/announcement.html`)

New body structure (replacing the stats grid + two-column filter layout):

- Keep the existing `.module-title-bar mb-5` "Announcements" title box.
- Full-width `.student-panel p-6` wrapping a single `#announcementList` started (existing feed container semantics).
- Keep the details modal markup.
- Delete: the four stat cards, the `xl:grid-cols-[320px_minmax(0,1fr)]` wrapper, the `schedule-sidebar` filter aside (Category/Timeframe/Sort/Search/Clear), the `featuredAnnouncement` slot, the `announcementUpdatedAt` label, and the inline `<style>` rules that only served those elements.

### D4. Frontend script (`public/js/announcement.js`)

Keep:
- Auth (`checkAuth`), header clock + student-header wiring, `loadAnnouncements` → `GET /api/auth/announcements` with `cache: 'no-store'`, the card renderer, `showAnnouncementDetails`/`closeDetailsModal`, priority pill + formatting helpers, `startRealtimeRefresh` (periodic refetch → live availability).
- The empty-state and error-state renderers now target `#announcementList` (error currently renders into the featured slot → rewire to the feed list).

Remove:
- `bindStaticListeners` bindings for `announcementSearch`, `announcementTypeFilter`, `announcementTimeframeFilter`, `announcementSortFilter`, `clearAnnouncementFilters`, `featuredAnnouncement`.
- `populateAnnouncementTypeFilter`, `getFilteredAnnouncements`, `resetAnnouncementFilters`, `renderAnnouncementSummary`, `renderAnnouncementUpdatedAt`, `renderFeaturedAnnouncement`, `pickFeaturedAnnouncement`, and `renderAnnouncementMeta` (page now has no meta pill).
- `renderAnnouncementExperience` collapses to just `renderAnnouncementList(allAnnouncements)`.

No client-side filtering remains — the student page renders exactly what the backend returns, so availability is enforced server-side and mirrored verbatim on the page.

## Risks / mitigations

- **Category naming drift** (admin posts a category that is a resource but misspelled, e.g., "Bookz"): documented as out of scope — visibility is derived from the free-text `category`; only the three resource categories with singular/plural aliases resolve to inventory.
- **Performance**: one tiny aggregate per request; no new indexes needed (existing `{ category: 1 }` index covers it).
- **Announcements page sidebar unaffected**: the change does not touch `sidebar.html` or any shared header CSS.

## Verification plan

1. `npx node --check` on `announcementService.js` and `public/js/announcement.js`.
2. Pure-function tests via a temporary node script driving `announceableResourceCategory` + a mocked-availability filter loop: resource @ qty 0 → hidden; resource @ qty > 0 → shown; non-resource category → shown regardless; singular/plural/case variants resolve.
3. Headless Edge DOM dump of the served student announcement page: blue title box present, `#announcementList` present, no filter controls / search / featured / stat IDs present.
4. `GET /api/auth/announcements` still returns `200` array for an authenticated student; admin announcements endpoints untouched (`routes/auth.js` diff empty).
5. `git diff` scope check: only `announcementService.js`, `public/announcement.html`, `public/js/announcement.js`.