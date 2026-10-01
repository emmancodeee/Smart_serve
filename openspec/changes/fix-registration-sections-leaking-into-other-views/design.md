## Context

`admin.html` is a single document containing every shell module as a sibling `<section>`, each authored with inline `display:none`:

| line | section | owning view |
|---|---|---|
| 84–177 | `analytics` | `dashboard` |
| 179–247 | `announcements` | `announcements` |
| 289–360 | `adminAccounts` | `adminaccounts` |
| 362–383 | `users` | (orphaned, see below) |
| 385–405 | `transactions` — "User Request History" | `transactions` |
| 407–409 | `registrationsFilterWrap` | `registrations` |
| 411–430 | `registrationsPending` | `registrations` |
| 432–451 | `registrationsApproved` | `registrations` |
| 453–472 | `registrationsRejected` | `registrations` |
| 474–497 | `pickupConfirmations` | `pickupconfirmations` |

`SECTION_VIEWS` (`admin.js:296`) is the ownership map, and `setAdminView()` (`:704`) is the single place that applies it: it shows the resolved view's ids and sets `display:none` on every other id. **That function is correct.** The markup is correct. The ownership map is correct.

The defect is a second writer. `syncRegistrationSectionVisibility()` (`:2553`) also sets `display` on three of those ids, driven only by the status filter value:

```js
const visibility = {
  registrationsPending:  normalized === 'all' || normalized === 'pending',
  registrationsApproved: normalized === 'all' || normalized === 'approved',
  registrationsRejected: normalized === 'all' || normalized === 'rejected'
};
Object.entries(visibility).forEach(([id, visible]) => {
  const section = document.getElementById(id);
  if (section) section.style.display = visible ? '' : 'none';
});
```

It has no notion of the active view, so with the default status (`all`) it makes all three visible regardless of which module is open.

The call chain that reaches it is a *data* path, not a *navigation* path:

```
refreshData(view)            :2128
  └─ ensureDataset('registrations')   :2074   (memoised on dataset.loaded)
       └─ loadRegistrations()         :2202
            └─ await fetch('/registrations')
            └─ registrationsFilter.apply()      :2220
                 └─ onRender -> renderRegistrationsWithFilter()  :5143
                      └─ renderFilteredRegistrations()          :2537
                           └─ syncRegistrationSectionVisibility()  :2538
```

`ADMIN_VIEW_LOADERS` (`:2036`) lists `registrations` for the **dashboard** and for the `registrations` view only:

```js
dashboard:       ['inventory','users','registrations','transactions','pickupConfirmations'],
transactions:    ['transactions'],
registrations:   ['registrations','users'],
```

So the dashboard reads registration data for its charts and counts, and that read is what drags the three sections into view. The dashboard is the default landing module and loads five datasets, so its registration request is in flight for a comparatively long window.

`refreshData` already tries to defend against this. Line 2142 re-checks the resolved view after the loaders settle and returns early if the user has navigated away. It cannot help: the guard runs *after* `await Promise.all(...)`, and the visibility change has already happened inside `loadRegistrations`.

Resulting sequence for the reported symptom:

1. Landing on Dashboard starts a registration request.
2. User clicks Transactions. `setAdminView('transactions')` correctly hides all four registration ids.
3. The registration response lands. `loadRegistrations()` runs `apply()`, which makes all three sections visible.
4. No further `setAdminView` call occurs, so the three sections stay visible beneath "User Request History" until the next navigation.

Two properties of the defect shape the fix:

- It is **trigger-agnostic**. Any caller of `renderFilteredRegistrations` — the race above, a future caller, a manual filter interaction, a cache invalidation — can show the sections in any module. Guarding one caller leaves the others.
- It is **isolated**. `syncRegistrationSectionVisibility` is the only writer of `display` on a shell section id besides `setAdminView` (`:723`) and `clearAdminModuleSections` (`:878`). Every other filter's `onRender` only writes table rows, so no other module has this defect and none needs a parallel fix.

## Goals / Non-Goals

**Goals:**

- Transactions shows "User Request History" and nothing else.
- Request Management keeps all three sections, with its status filter still able to show one or all of them.
- No module can have its sections made visible by another module's data arriving.
- Fix the defect where it lives, so it cannot recur through a different caller.
- Cover the Dashboard, which has the same defect and was not reported.
- Touch one function in one file.

**Non-Goals:**

- No change to `setAdminView()`, `SECTION_VIEWS`, or `ADMIN_VIEW_LOADERS`. They are correct.
- No change to the Transactions module: title, filters, search, reset, export, table, columns, or data.
- No change to the registration filters, tables, status tabs, or actions.
- No removal of the sections, and no `display:none`, `visibility:hidden` or `opacity:0` added as a workaround.
- No sequencing, cancellation or generation change to the dataset or fetch layer. The leak is a visibility decision, not a transport problem.
- No layout, style, route, API, dataset, permission, or role change.

## Decisions

### D1 — Gate `syncRegistrationSectionVisibility` on the active view

Make the function a no-op unless the resolved active view is `registrations`.

*Rationale:* This is the invariant the function was missing. It is the only unguarded writer of section visibility, so guarding it closes the class of defect, not one instance. It is also the smallest correct change: one early return, one file, no behaviour change for Request Management.

*Alternatives rejected:*
- *Reorder so `setAdminView` runs after `refreshData`* — makes navigation wait on the network, and the response can still land after the next navigation. Treats timing, not the missing guard.
- *Abort or ignore the fetch when the view changed* — the dashboard legitimately reads this data, so the request must complete; only its side effect is wrong. Adds transport complexity for a presentation bug.
- *Re-check the view inside `loadRegistrations` after the fetch* — fixes this one caller only. The function stays able to corrupt any other module, and a manual filter change on the registrations view would still be the one legitimate path.
- *Have `setAdminView` run on every dataset arrival* — re-implements ownership application and would fight legitimately hidden sub-sections (a single selected status tab).

### D2 — Resolve the active view through the existing resolver, not a new lookup

Use `resolveViewFromLocation()` / `normalizeViewForRole()` to decide, the same way `setAdminView`, `refreshData` and `updateSidebarActiveLink` already do.

*Rationale:* One notion of "which module is open" means the guard cannot disagree with the function that applied visibility. A second lookup — reading a variable, a DOM marker, or a hash — is a new source of truth that can drift.

*Note:* the guard is a *view* check, not a *role* check, and not a section-presence check. Request Management is admin-only, but a super admin who navigates to Transactions must not see these sections either, so the deciding factor is which module is open.

### D3 — Treat the request-management sub-sections as the owner's business only

While the registrations view is active, the function keeps its current per-status behaviour, including hiding sections that the selected status does not match.

*Rationale:* `setAdminView('registrations')` shows all four ids and then delegates the three status sections to this function. Preserving that split keeps the status filter working exactly as it does now. The change is strictly additive protection around existing behaviour.

### D4 — Verify Request Management by behaviour, not by markup

The acceptance check for Request Management is that its three sections respond to the status filter and its filters, search, reset and export still work.

*Rationale:* The tempting verification is "the three ids are still in `SECTION_VIEWS` and still in the document", but that was already true while the bug existed. Only observable behaviour distinguishes fixed from broken here.

### D5 — Note the orphaned `users` section without acting on it

`SECTION_VIEWS` maps `users: ['users']` and `#users` exists at line 362, but `LEGACY_VIEW_ALIASES` (`:367`) maps `users → adminaccounts`, so the resolver never returns `users` and that section is never shown. It is also the reason the Users module renders admin accounts.

*Rationale:* It is adjacent dead configuration, not part of this defect, and it changes no visible behaviour. Flagging it beats silently expanding scope; it is a candidate for a separate change.

## Risks / Trade-offs

- **The guard could suppress a legitimate render** → only when the registrations view is not active, which is exactly when its sections must be hidden. The registrations view itself is unaffected, and this is verified by switching into and out of it repeatedly.
- **Role denial vs. view guard ordering** → a super admin opening Transactions resolves the view to `transactions`, so the guard engages and the sections stay hidden. Verified for both roles rather than assumed.
- **A filter interaction on the registrations view still re-renders** → that is correct and must keep working; the status-driven hiding of the two non-matching sections is required behaviour, not a leak.
- **The Dashboard path is fixed by the same change but is easy to forget** → it gets its own acceptance task, because it is the view most likely to trigger the race and the one a tester would otherwise skip.
- **The race is timing-dependent, so a passing manual test is weak evidence** → the fix removes the trigger rather than the timing, so verification deliberately includes repeated navigation and a deliberately slow response, not a single quick click.
- **A one-line-looking guard can hide a deeper coupling** → the guard is placed at the single unguarded writer, and the change is verified not to alter any dataset, loader or transport behaviour.

## Migration Plan

Single-function, front-end-only change. No data, schema, or server migration.

1. Add the active-view guard to `syncRegistrationSectionVisibility()`.
2. Verify Transactions and Dashboard show no registration sections, including after a slow response.
3. Verify Request Management still shows and filters all three sections.
4. Rollback is reverting one function; no restart, cache purge, or data repair.

## Open Questions

None blocking. The Dashboard manifestation and the orphaned `users` mapping are recorded above as in-scope verification and out-of-scope follow-up respectively.
