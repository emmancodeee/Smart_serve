## 1. Backend availability gateway

- [ ] 1.1 Add pure helper `announceableResourceCategory(value)` exported from `announcementService.js`: trims, lowercase, strips trailing `s`; returns `'Books' | 'Modules' | 'Uniforms'` for `book/books`, `module/modules`, `uniform/uniforms`; otherwise `null`
- [ ] 1.2 In `listStudentAnnouncements`, after building `eligible`, aggregate live inventory: `Inventory.aggregate([{ $match: { category: { $in: ['Books','Modules','Uniforms'] } } }, { $group: { _id: '$category', total: { $sum: { $ifNull: ['$quantity', 0] } } } }])` → availability map
- [ ] 1.3 Filter the eligible list: drop an announcement only when `announceableResourceCategory(item.category)` resolves AND `(availability[resource] || 0) === 0`; non-resource announcements unchanged; return the filtered array (same shape, no deletion)
- [ ] 1.4 `require('../models/Inventory')` in `announcementService.js`; keep the admin CRUD and `listAdminAnnouncements` untouched

## 2. Student page markup

- [ ] 2.1 `public/announcement.html`: keep the `.module-title-bar mb-5` "Announcements" title box and the details modal; render the feed as a full-width `.student-panel p-6` containing `#announcementList`
- [ ] 2.2 Remove the four stat cards, the `xl:grid-cols-[320px_minmax(0,1fr)]` two-column wrapper, and the `schedule-sidebar` filter aside (Category/Timeframe/Sort/Search/Clear Filters)
- [ ] 2.3 Remove the `featuredAnnouncement` slot, `announcementUpdatedAt` label, and any inline `<style>` rules that only styled removed elements (filters/search/featured/stats)

## 3. Student page script

- [ ] 3.1 `public/js/announcement.js`: remove static listeners for `announcementSearch`, `announcementTypeFilter`, `announcementTimeframeFilter`, `announcementSortFilter`, `clearAnnouncementFilters`, `featuredAnnouncement`
- [ ] 3.2 Remove `populateAnnouncementTypeFilter`, `getFilteredAnnouncements`, `resetAnnouncementFilters`, `renderAnnouncementSummary`, `renderAnnouncementUpdatedAt`, `renderFeaturedAnnouncement` (+ featured picker), and `renderAnnouncementMeta`
- [ ] 3.3 `loadAnnouncements` keeps fetching `/api/auth/announcements` with `cache: 'no-store'` and routes success straight to `renderAnnouncementList(allAnnouncements)`; keep `startRealtimeRefresh` periodic refetch; rewire the load-error/empty renderers to `#announcementList`
- [ ] 3.4 Keep auth checks, header/clock/student-header wiring, card rendering, priority pills, and the details modal handlers unchanged

## 4. Verification

- [ ] 4.1 `npx node --check` passes on `announcementService.js` and `public/js/announcement.js`
- [ ] 4.2 Pure-logic check (node script): resource announcement hidden at qty 0, shown at qty > 0, non-resource category always shown, singular/plural/case (`book/Books/MODULES/uniforms`) resolve to the right resource
- [ ] 4.3 Headless DOM dump of the served student announcement page: title box + `#announcementList` present; no search input, no filter selects, no Clear Filters, no featured/stats/`announcementUpdatedAt` ids
- [ ] 4.4 `git diff` confirms changes are only `announcementService.js`, `public/announcement.html`, `public/js/announcement.js` (plus change artifacts) — admin files untouched