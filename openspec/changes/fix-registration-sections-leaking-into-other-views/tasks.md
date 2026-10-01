## 1. Confirm the defect and its single unguarded writer

- [x] 1.1 Confirm `syncRegistrationSectionVisibility` (`public/js/admin.js:2553`) sets `display` on `registrationsPending`, `registrationsApproved` and `registrationsRejected` from the status value alone, with no reference to the active view
- [x] 1.2 Confirm it is reached only via the data path `loadRegistrations` → `registrationsFilter.apply()` → `renderRegistrationsWithFilter` → `renderFilteredRegistrations` → `syncRegistrationSectionVisibility`
- [x] 1.3 Confirm `ADMIN_VIEW_LOADERS` lists `registrations` for the `dashboard` and for the `registrations` view, and **not** for `transactions` — so the dashboard is the trigger
- [x] 1.4 Confirm `setAdminView` (`:704`) already hides every non-owned section id, so it is correct and must not be modified
- [x] 1.5 Confirm the `refreshData` late-response guard (`:2142`) runs after `await Promise.all(...)` and therefore cannot prevent the side effect inside the loader
- [x] 1.6 Confirm `syncRegistrationSectionVisibility` is the only writer of `display` on a shell section id besides `setAdminView` (`:723`) and `clearAdminModuleSections` (`:878`), so no other module needs a parallel fix
- [x] 1.7 Confirm `public/admin.html` needs no change: the sections are siblings, carry inline `display:none`, and are registered to the `registrations` view
- [x] 1.8 Capture SHA-256 of every file that must not change (`server.js`, `public/admin.html`, `public/js/admin-nav.js`, `public/js/admin-filters.js`, all stylesheets, all other admin page scripts) so blast radius can be proven

## 2. Add the active-view guard

- [x] 2.1 Add an early return at the top of `syncRegistrationSectionVisibility` when the resolved active view is not `registrations`
- [x] 2.2 Resolve the active view through the existing `resolveViewFromLocation()` and `normalizeViewForRole()`, the same pair `setAdminView`, `refreshData` and `updateSidebarActiveLink` already use — introduce no second notion of the active module
- [x] 2.3 Do not gate on role: a super admin on Transactions must also be protected, so the deciding factor is the active view alone
- [x] 2.4 Add one short comment stating the invariant, matching the file's existing commentary style
- [x] 2.5 Leave the per-status visibility map and the write loop completely unchanged below the guard

## 3. Preserve Request Management behaviour

- [x] 3.1 Confirm `setAdminView('registrations')` still shows all four registration ids and still delegates the three status sections to the guarded function
- [x] 3.2 Confirm the status filter still shows only the matching section, and still shows all three for the "all" value
- [x] 3.3 Confirm the registration filters, search, reset and export are untouched — no change to the filter config or `renderRegistrationsWithFilter`
- [x] 3.4 Confirm no dataset, loader, cache or `ADMIN_VIEW_LOADERS` entry was modified

## 4. Static verification

- [ ] 4.1 Run `node --check public/js/admin.js`
- [ ] 4.2 Confirm the diff adds only the guard and its comment — no other statement altered
- [ ] 4.3 Grep the change for forbidden workarounds and confirm zero hits: `location.reload`, `location.href`, `location.assign`, `setTimeout`, and any added `display:none` / `visibility:hidden` / `opacity:0`
- [ ] 4.4 Confirm no stylesheet and no HTML file was modified
- [ ] 4.5 Confirm `SECTION_VIEWS`, `ADMIN_VIEW_LOADERS`, `ADMIN_DATASETS`, `setAdminView` and `resolveViewFromLocation` are byte-identical to baseline
- [ ] 4.6 Re-hash every file from task 1.8 and confirm all are unchanged; confirm `public/js/admin.js` is the only modified source file

## 5. Live acceptance — the reported case

Start the server, sign in as **Admin**, and hard-reload (Ctrl+F5) because `admin.js` is
served with a fixed `?v=` query string.

- [ ] 5.1 Open Transactions: "User Request History" with its filters, search, reset, export and table, and **nothing** below it
- [ ] 5.2 Confirm Pending, Approved and Rejected Registrations are all absent
- [ ] 5.3 Confirm no Request Management filter, table, status section or action button is present

## 6. Live acceptance — Request Management still works

- [ ] 6.1 Open Request Management: all three sections displayed, and the Transactions section absent
- [ ] 6.2 Set the status filter to each of pending / approved / rejected and confirm only the matching section is shown
- [ ] 6.3 Set the status filter to "all" and confirm all three are shown
- [ ] 6.4 Exercise the registration filters, search, reset and export and confirm they work as before

## 7. Live acceptance — the race and the Dashboard

- [ ] 7.1 Land on Dashboard, then click Transactions **while the dashboard is still loading**, and confirm no registration section appears
- [ ] 7.2 Repeat 7.1 several times, and again on a throttled/slow connection — the trigger is timing dependent, so a single quick pass is not evidence
- [ ] 7.3 Open Dashboard and let it finish loading, then scroll the full page and confirm no registration section appears beneath the dashboard's own content
- [ ] 7.4 Confirm the dashboard's own charts, KPIs and counts still render, since it legitimately reads registration data

## 8. Live acceptance — isolation across modules

- [ ] 8.1 Switch Transactions → Request Management → Transactions → Request Management → Transactions, confirming only the selected module's content after every click
- [ ] 8.2 Do the same between Dashboard and Request Management
- [ ] 8.3 Open each remaining module in turn — Announcements, Admin Accounts (Super Admin), Pickup Confirmations — and confirm only its own content is shown
- [ ] 8.4 Confirm no module from a previous visit remains visible after switching away and back

## 9. Super Admin and regressions

- [ ] 9.1 Repeat 5.1, 5.2, 6.1, 7.1 and 8.1 as **Super Admin**, confirming the same isolation
- [ ] 9.2 Confirm Super Admin's module list is unchanged and Request Management remains unavailable to that role
- [ ] 9.3 Confirm no layout, colour, typography, button, table or card changed anywhere
- [ ] 9.4 Run `openspec validate fix-registration-sections-leaking-into-other-views --strict`
- [ ] 9.5 Review the final diff and confirm it is confined to the guard in `syncRegistrationSectionVisibility`
