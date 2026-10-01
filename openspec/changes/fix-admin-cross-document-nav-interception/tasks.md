## 1. Confirm the diagnosis before changing code

- [x] 1.1 Record the baseline: confirm `public/js/admin.js:5168` installs a document-level delegated click handler that matches `.sidebar-shell a[data-view], .sidebar a[data-view]`, calls `e.preventDefault()`, then `navigateToView(view)`
- [x] 1.2 Confirm the four documents that load `admin.js` (`admin.html`, `admin-feedback.html`, `admin-returns.html`, `admin-supply-stock.html`) and that `inventory.html` does not, establishing which pages are exposed
- [x] 1.3 Confirm `navigateToView` (line 5135) has no `isSpaAdminShell()` guard, that its only caller is the interceptor at line 5174, and that the boot path `applyAdminView` (line 814) already has that guard
- [x] 1.4 Confirm `server.js:288` serves the single document `admin.html` for `/admin/dashboard`, `/admin/users`, `/admin/accounts`, `/admin/announcements`, `/admin/transactions`, `/admin/registrations`, `/admin/pickup-confirmations`
- [x] 1.5 Re-verify the ownership precondition: `admin.html` contains the full registered section set for all seven shell views (including all four `registrations` ids) and no standalone page contains any shell view id
- [x] 1.6 Capture SHA-256 of every file that must not change: `public/admin-nav.js`, `public/admin-filters.js`, all five admin HTML pages, every stylesheet, and `server.js`, so the fix's blast radius can be proven at the end

## 2. Add the document-ownership predicate

- [x] 2.1 Add a single helper in `public/js/admin.js` that answers whether the current document renders a given view key as one of its own sections
- [x] 2.2 Implement it from the existing registry only: require `isSpaAdminView(viewKey)` and require every id in `SECTION_VIEWS[viewKey]` to be present in the document
- [x] 2.3 Reuse the existing `normalizeAdminPath` / `LEGACY_VIEW_ALIASES` normalisation so a view key arriving in any casing resolves
- [x] 2.4 Return `false` for a view key with no registered sections, so standalone views and unknown keys can never claim ownership
- [x] 2.5 Confirm the helper contains no module name, page filename, or URL string — ownership is structural only
- [x] 2.6 Add one short comment mirroring the existing invariant comment at `applyAdminView` (lines 813-819) so the reason the gate exists is discoverable at the call site

## 3. Gate the delegated sidebar click interceptor

- [x] 3.1 In the handler at `public/js/admin.js:5168`, resolve `view` from the link's `data-view` before any default-action handling
- [x] 3.2 Return early — without calling `preventDefault()` — when the ownership predicate is false, so the browser performs the real `href` navigation
- [x] 3.3 Move `e.preventDefault()` to after the ownership test, making "this handler takes over" the last step so any future early return fails safe toward navigation
- [x] 3.4 Keep the existing `closest()` selector, so links rendered by `admin-nav.js` after handler installation are still covered
- [x] 3.5 Keep the role denial path intact: an unauthorized target must still reach `navigateToView` → `normalizeViewForRole` → `renderAdminNotAuthorized` on the shell
- [x] 3.6 Verify the handler performs no section switch, history mutation, or data load of its own — it delegates to `navigateToView` only

## 4. Guard `navigateToView` defensively

- [x] 4.1 Add an early return at the top of `navigateToView` (line 5135) when the document is not the admin shell, before any `pushState`, `setAdminView`, or `refreshData`
- [x] 4.2 Keep the return silent with respect to the outgoing module: do not clear, hide, or alter the current module's content
- [x] 4.3 Confirm the guard cannot fire on `admin.html` for any of the six shell views, using the section-presence check
- [x] 4.4 Confirm `navigateToView`'s existing in-shell sequence is unchanged: push canonical path → apply active state → `setAdminView` → `updateHeaderForView` → `refreshData`

## 5. Static verification

- [x] 5.1 Run `node --check public/js/admin.js`
- [x] 5.2 Confirm brace and paren balance in the edited regions
- [x] 5.3 Grep the change for forbidden workarounds and confirm zero hits: `location.reload`, `window.location.href`, `location.assign`, `setTimeout` in the navigation path, CSS `display:none` concealment of modules
- [x] 5.4 Confirm no module is mounted into a document merely to be hidden — no new section markup in any standalone page
- [x] 5.5 Confirm `git diff --numstat` shows exactly one changed file, `public/js/admin.js`, and inspect the full diff line by line
- [x] 5.6 Re-hash every file from task 1.6 and confirm all are unchanged

## 6. Acceptance matrix — admin shell document

Test on `admin.html` with an Admin account. Every case must switch content with **no** document load and no refresh.

- [ ] 6.1 Dashboard → Transactions, and Transactions → Dashboard
- [ ] 6.2 Dashboard → Announcements, and Announcements → Dashboard
- [ ] 6.3 Transactions → Registrations (Request Management), and Registrations → Transactions
- [ ] 6.4 Registrations → Pickup Confirmations, and Pickup Confirmations → Registrations
- [ ] 6.5 Announcements → Registrations, and Registrations → Announcements
- [ ] 6.6 Transactions → Pickup Confirmations, and Pickup Confirmations → Transactions
- [ ] 6.7 Confirm in each case that exactly one section is visible, the previous section is hidden, and the URL is the canonical path for the new view
- [ ] 6.8 Confirm the active highlight updates in the same event turn as the click, before the data request settles

## 7. Acceptance matrix — the two reported failures

- [ ] 7.1 Feedback Management → Request Management renders Request Management; Feedback content, filters, and table are gone
- [ ] 7.2 Request Management → Feedback Management renders Feedback Management
- [ ] 7.3 Return Requests → Transactions renders Transactions; Return filters, table, and state are gone
- [ ] 7.4 Transactions → Return Requests renders Return Requests
- [ ] 7.5 In each case confirm the address bar reaches the target path and a real document request is issued

## 8. Acceptance matrix — all remaining transitions

- [ ] 8.1 Feedback Management → Transactions, and Transactions → Feedback Management
- [ ] 8.2 Feedback Management → Announcements, and Announcements → Feedback Management
- [ ] 8.3 Return Requests → Request Management, and Request Management → Return Requests
- [ ] 8.4 Return Requests → Pickup Confirmations, and Pickup Confirmations → Return Requests
- [ ] 8.5 Supply & Stock → Transactions, and Transactions → Supply & Stock
- [ ] 8.6 Supply & Stock → Request Management, and Request Management → Supply & Stock
- [ ] 8.7 Supply & Stock → Dashboard, and Dashboard → Supply & Stock
- [ ] 8.8 Supply & Stock → Announcements, and Announcements → Supply & Stock
- [ ] 8.9 Inventory Management → Transactions, and Transactions → Inventory Management — confirm `inventory.html` behaviour is unchanged, since it loads no interceptor
- [ ] 8.10 Full sweep from Dashboard through all nine Admin modules in order, then in reverse, confirming no transition needs a refresh

## 9. Super Admin and role parity

- [ ] 9.1 Repeat the sweep for Super Admin across its own module set, confirming each transition resolves without a refresh
- [ ] 9.2 Confirm Admin Accounts is reachable by Super Admin and Request Management and Pickup Confirmations are not, exactly as before
- [ ] 9.3 Confirm no Admin-only module became visible to Super Admin and vice versa
- [ ] 9.4 Confirm the fix is shared logic, with no role- or module-specific branch

## 10. Link semantics, error states, and regressions

- [ ] 10.1 Middle-click and ctrl/cmd-click a sidebar item and confirm it opens in a new tab with the current tab unchanged
- [ ] 10.2 Confirm a direct load of an unmatched admin path still renders the explicit not-found state, never another module's content
- [ ] 10.3 Confirm an unauthorized target still renders the not-authorized state, never another module's content
- [ ] 10.4 Confirm no module's filters, search text, pagination, selection, or dataset leaks into another after a transition
- [ ] 10.5 Confirm each module shows its own loading state during navigation, never the outgoing module's
- [ ] 10.6 Confirm sidebar design, header, colours, typography, buttons, filters, tables, and cards are visually unchanged
- [x] 10.7 Run `openspec validate fix-admin-cross-document-nav-interception --strict`
- [ ] 10.8 Review the final diff once more and confirm the change is confined to the navigation decision, with no per-module special case
