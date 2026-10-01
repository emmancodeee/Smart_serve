## 1. Inventory Read-Only Notice

- [x] 1.1 `public/inventory.html`: remove the `#inventoryReadOnlyNotice` block (lines ~135-139) so the summary cards flow straight into the Inventory List section.
- [x] 1.2 `public/js/inventory.js`: remove the `inventoryReadOnlyNotice` lookup + toggle in `applySuperAdminSidebar` (lines ~128-132); keep the `openAddModalBtn` visibility logic.

## 2. Admin Hub Super-Admin Notice

- [x] 2.1 `public/admin.html`: remove the amber `#superAdminNotice` banner block (lines ~303-310); keep the super-admin tools / Create Admin Account form.
- [x] 2.2 `public/js/admin.js`: in `applySuperAdminUI`, remove the `superAdminNotice`/`superAdminNoticeText` lookups (lines ~455-456) and the notice-write/show block (lines ~478-492); keep all sidebar/tool visibility logic.
- [x] 2.3 `public/css/admin.css`: remove the now-unused `#superAdminNotice` rule and its `slideIn` keyframes (lines ~197-212) only if `slideIn` is unreferenced elsewhere in `admin.css` (verified: yes; `schedule.css` has its own copy).

## 3. Announcements Helper Paragraphs

- [x] 3.1 `public/announcement.html`: remove the sidebar paragraph "Search, filter, and review announcements posted by admin and super-admin accounts." (line ~651); keep the "Announcement Center" / "Browse all published notices" heading.
- [x] 3.2 `public/announcement.html`: remove the auto-refresh note "Announcements refresh automatically so newly published notices appear without reopening the page." (line ~689); keep the "Last synced --" line.
- [x] 3.3 `public/announcement.html`: remove the feed hint "Open any announcement to see the full details." (line ~702); keep the "Announcement Feed" title and results meta.

## 4. Dashboard Hero Default Copy

- [x] 4.1 `public/dashboard.html`: empty the static default text in `#dashboardHeroStatus` (line ~1053) so it shows nothing until populated by script.
- [x] 4.2 `public/js/dashboard.js`: set the `updateDashboardOverview` default `heroText` to an empty string (line ~877); keep all approved/pending/rejected dynamic variants and the stat-card status copy.

## 5. Registration Wizard Instruction Copy

- [x] 5.1 `public/dashboard.html`: remove the step-0 chip "Upload the student's ORF first, then review the extracted details before submitting." (lines ~1138-1140).
- [x] 5.2 `public/dashboard.html`: remove the ORF Upload panel note "Use a clear image or screenshot." (line ~1144).
- [x] 5.3 `public/dashboard.html`: empty the static default text of `#orfUploadMessage` (lines ~1146-1148) and give the element `display:none` by default so no empty amber box shows until a real message fires.
- [x] 5.4 `public/dashboard.html`: remove the step-1 chip "Review the student details before moving to the separated module, books, and uniform windows." (lines ~1160-1162).
- [x] 5.5 `public/dashboard.html`: remove the Student Information note "Check the extracted details before moving to the next registration steps." (line ~1167).
- [x] 5.6 `public/dashboard.html`: remove the Module Window description "Keep modules separate from books and uniform. Add more rows for irregular students." (line ~1206); keep the heading and Add Module button, trimming padding so no blank strip remains.
- [x] 5.7 `public/dashboard.html`: remove the Books Window description "List the requested books separately so the student can edit them without touching the modules." (line ~1217); keep the heading and Add Book button, trimming padding.
- [x] 5.8 `public/dashboard.html`: remove the Uniform Window description "Uniform stays in its own step but remains part of the same registration panel." (line ~1227); keep the heading, trimming padding.
- [x] 5.9 `public/dashboard.html`: remove the step-5 emerald banner "Review the full registration before submitting it for admin approval." (lines ~1246-1248).
- [x] 5.10 `public/js/dashboard.js`: remove the instructional default `setOrfMessage(...)` calls (lines ~1336 and ~1394); update `setOrfMessage` (or element styling) so the message area stays hidden until real progress/success/error text is set.

## 6. Verification

- [x] 6.1 `node --check` on `admin.js`, `inventory.js`, `dashboard.js`.
- [x] 6.2 Grep: no cataloged banner strings remain (inventory read-only, super-admin notice texts, announcement paragraphs, hero/step chip/ORF instruction sentences); soft pattern pass for leftover `Super admin can` / `Admin can` / `read-only` / `review` / `manage` / `automatically` banners in headers and panels.
- [x] 6.3 Routes: `/admin.html`, `/inventory.html`, `/announcement.html`, `/dashboard.html` return 200 and their CSS/JS assets load.
- [ ] 6.4 Browser pass (super admin): Inventory flows summary → list with no notice; admin hub has no amber banner; Read Only tools still hidden; attempting an inventory mutation still shows the view-only warning and stays blocked; all tables/filters/buttons intact.
- [ ] 6.5 Browser pass (student): Dashboard hero shows greeting only; registration wizard has no step notes but all inputs/labels/Add buttons/preview/summary remain; ORF upload still shows OCR progress/result/errors; Announcements show no helper paragraphs and empty state still shows; no console errors.
- [ ] 6.6 Regression: no empty/blank boxes anywhere on the affected pages; design, spacing, and all other modules unchanged.
