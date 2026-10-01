## Context

The SmartServe frontend (static pages under `public/` + scripts under `public/js/`) includes several visible blocks of explanatory copy that read like internal instructions, permission descriptions, or AI-generated implementation notes. Discovery produced an exact catalog:

- **Inventory (super admin view)** — `public/inventory.html:135-139` `#inventoryReadOnlyNotice` banner: "Super admin can review inventory data here, but inventory changes stay read-only.", toggled by `public/js/inventory.js:128-132`.
- **Admin hub (admin/super admin)** — `public/admin.html:303-310` amber `#superAdminNotice` banner; text written by `public/js/admin.js:455-456, 478-492` ("Super admin can view all operational screens, but student-management and inventory actions stay read-only..." / "Only the super admin can create new admin accounts."); styled by `public/css/admin.css:197-212`.
- **Announcements (student)** — `public/announcement.html:651` ("Search, filter, and review announcements posted by admin and super-admin accounts."), `:689` (auto-refresh behavior note), `:702` ("Open any announcement to see the full details.").
- **Dashboard (student)** — `public/dashboard.html:1053` hero `#dashboardHeroStatus` default sentence ("Review your profile, check your registration status, and keep your pickup details current."), also produced dynamically at `public/js/dashboard.js:877`.
- **Registration wizard (student)** — `public/dashboard.html:1138-1140, 1144, 1146-1148, 1160-1162, 1167, 1206, 1217, 1227, 1246-1248` step chips/notes; plus instructional default ORF messages at `public/js/dashboard.js:1336, 1394`.

Kept intentionally (out of scope): runtime access-denied/view-only alerts (`alert()`/`showToast()` on mutation attempts), empty-state messages, status/validation/success/error messages, status pills and meta lines, the ratings hint, and module-level subtitle copy under page titles (e.g. "Manage all inventory items, stock levels, and availability.").

Constraint ladder from the request: remove ONLY explanatory instruction/permission/implementation banners; keep all page content, user data, notifications, errors, validation, empty states, access-denied messages; do NOT change backend, database, authentication, authorization, or existing permissions; preserve the SmartServe navy/yellow design and clean up leftover spacing with no empty boxes.

## Goals / Non-Goals

**Goals:**
- Delete every identified instruction/permission- description banner from a normal production view (inventory, admin hub, announcements, dashboard hero, registration wizard).
- Remove the JavaScript wiring that targeted deleted elements and the instructional default copy, without leaving `null` references or runtime errors.
- Collapse spacing so no empty bordered/colored box remains after text removal.
- Keep the exact design language (navy/yellow, padding, radii) intact everywhere else.

**Non-Goals:**
- NOT redesigning pages, headers, or the registration wizard.
- NOT rewording, softening, or rewording the status/error/empty-state copy — it stays verbatim.
- NOT changing the read-only permission, super-admin visibility rules, or any backend/DB/auth logic.
- NOT removing the module-level subtitle lines under page titles (kept as standard product subheadings).
- NOT touching the dead `HEADER_TITLES` subtitle writes in `admin.js` (never rendered, invisible).
- NOT converting banners into collapsed/hidden elements for later reuse.

## Decisions

- **D1 — Delete banners wholesale (element + wiring), do not hide or rewrite.** Every identified banner element is removed from the HTML, and the JS that populated/toggled it is removed with it. Rewriting would just add new prose the user asked to remove; hiding keeps dead, confusing code. Applied to: `#inventoryReadOnlyNotice` (+ `inventory.js` toggle lines, `admin.js` `superAdminNotice` block + `admin.html` banner, and the announcements helper paragraphs.
- **D2 — Keep live status elements, strip only instructional defaults.** `#dashboardHeroStatus` and `#orfUploadMessage` are populated at runtime by real status/feedback logic, so the elements stay. Their static instructional defaults are emptied (`dashboard.html:1053`, `dashboard.html:1147`) and the status message area defaults to hidden until a real message fires (`dashboard.js:877` empty default, remove `setOrfMessage` calls at `1336` and `1394`, hide-by-default styling). The dynamic approved/pending/rejected hero text and OCR progress/result/error messages are untouched.
- **D3 — Preserve runtime access control and feedback entirely.** Every `alert()`/`toast` that fires when a super admin (or unauthorized user) attempts a view-only/mutating action remains, because it is required system feedback, not a banner.
- **D4 — Keep module subtitle copy.** One-line subheadings under section titles (`.section-subtitle`, `.dashboard-panel-copy`, `.student-panel-copy`, `.header-subtitle`) are legitimate product subheadings and stay.
- **D5 — Empty-container cleanup by case.** After removals, any wrapper whose only content was the removed text is deleted as part of the same edit (e.g. the step chips and the emerald review banner); wrappers that still carry visible content (headings, buttons, inputs) simply drop the paragraph and, where needed, have their padding/margin trimmed so no blank strip remains.
- **D6 — CSS hygiene limited to rules unique to removed elements.** Remove `#superAdminNotice` and its `slideIn` keyframes only if nothing else in `admin.css` references `slideIn` (verified: nothing does; `schedule.css` has its own copy). A general utility class like `.admin-alert` (unused after removal, defined in `admin.css` with no active rule) is left alone to avoid scope creep.

## Risks / Trade-offs

- [Removing wizard step copy reduces point-in-time guidance for first-time users] → Mitigation: labels, placeholders, Add buttons, and headers remain; the ORF preview panel and "No ORF uploaded yet." empty state remain. The removed text is purely explanatory, matching the requested "production system" look.
- [A removed element is still referenced by JS and throws] → Mitigation: the referencing lines are removed in the same change (`inventory.js:128-132`, `admin.js:455-492`); every lookup in this codebase is null-guarded anyway; `node --check` plus a browser pass follows.
- [An empty colored/bordered box is left after a text removal] → Mitigation: per-case cleanup (delete container or trim padding) in the same task; the verification pass scrolls each affected page.
- [A stray instructional string is missed in JS-generated content] → Mitigation: a verification grep for the cataloged exact strings plus a soft pattern pass (`Super admin can`, `Admin can`, `read-only`, `review`, `manage`, `automatically`) is included in tasks.
- [Over-broad greps flag legitimate status/error lines] → Mitigation: keeplist documented in the spec (empty states, errors, alerts, subtitle copy) and cross-checked by the browser pass.

## Migration Plan

Static frontend change; no data or API migration. Rollback is a simple revert of the touched files (`inventory.html`, `admin.html`, `announcement.html`, `dashboard.html`, `admin.js`, `inventory.js`, `dashboard.js`, `admin.css`). Changes are local edits to the working tree; nothing is deployed until the user runs the app.

## Open Questions

None — decisions are documented above.