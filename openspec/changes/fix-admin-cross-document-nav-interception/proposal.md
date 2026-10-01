## Why

Clicking a sidebar item on Feedback Management, Return Requests, or Supply & Stock does not open the target module. The previously opened module stays on screen, the address bar changes to the target module's path anyway, and only a full document load (browser refresh) renders the correct content. This makes the admin panel's navigation non-deterministic and forces a manual refresh to complete a navigation, for both Admin and Super Admin.

The cause is a single unguarded code path, not a routing, component, or state-mapping defect:

- `server.js:288` serves **one** document, `admin.html`, for seven sidebar paths (`/admin/dashboard`, `/admin/users`, `/admin/accounts`, `/admin/announcements`, `/admin/transactions`, `/admin/registrations`, `/admin/pickup-confirmations`). Those six modules are sections *inside* `admin.html`, switched without a document load.
- `public/js/admin.js:5168` installs a **document-level delegated** click handler that matches every `a[data-view]` sidebar link, calls `e.preventDefault()`, and routes to `navigateToView(view)`.
- `admin.js` is loaded by four documents: `admin.html`, `admin-feedback.html`, `admin-returns.html`, and `admin-supply-stock.html`.
- On the three standalone documents there are no sibling sections to switch to. `navigateToView` (line 5135) pushes the target path into history and calls `setAdminView()`, which finds no matching section, so nothing is swapped. `preventDefault()` has already cancelled the real `href` navigation.

The boot path is already correct: `applyAdminView` (line 814) guards with `isSpaAdminShell()` and skips section switching on single-module documents. `navigateToView` has no such guard, and its only caller is the interceptor — so the click path is the sole defect.

`inventory.html` does not load `admin.js`, so it is unaffected. That asymmetry is a direct confirmation of the mechanism: the only pages that can get stuck are the ones that load the shell's script without being the shell.

## What Changes

- Gate the delegated sidebar click interceptor so it only claims a click when the current document actually renders the target view as one of its own sections. On any other document the click is left to the browser and the real `href` navigation proceeds.
- Add a matching defensive guard inside `navigateToView` so the function cannot push history or switch sections on a document that is not the admin shell, regardless of caller.
- Resolve view ownership from the existing view registry (`isSpaAdminShell`, `isSpaAdminView`, `SECTION_VIEWS`) rather than by hardcoded module names, so a module added to the sidebar later is classified correctly without editing the handler.
- No behaviour change on `admin.html`: its six in-shell modules keep switching client-side with no document load.
- No browser refresh, `setTimeout`, artificial delay, CSS hiding, or `location` manipulation is introduced. The fix removes a cancelled navigation; it does not simulate one.
- **No UI, data, permission, or API changes.** Sidebar design, header, colors, typography, buttons, filters, tables, cards, page layouts, per-role module visibility, and all datasets are untouched.

### Explicitly out of scope

The reported symptoms were investigated against a client-side-router model (`activePage`, `useEffect`, component maps, conditional rendering of multiple mounted components). None of those exist here: the admin panel is multi-page server-rendered HTML with plain `<a href>` navigation and DOM section toggling. There is no shared page-state variable, no component registry, no import graph, and no component reuse between Feedback/Request or Returns/Transactions — each is a separate document or a separate server-owned section. No such machinery is introduced, and no module transition is fixed individually.

## Capabilities

### New Capabilities
- `admin-module-navigation`: The rule that a sidebar click must always result in the selected module's own content and its own loading state, whether the target is a section of the current admin shell document or a separate server-rendered document. Covers cross-document navigation, in-shell section switching, active-state agreement with the address bar, and the prohibition on refresh-based or CSS-hidden workarounds.

### Modified Capabilities

None. `openspec/specs/` contains only `student-feedback-ui-layout` and `student-sidebar-design`, which cover the student-facing UI and are unaffected. No existing capability's requirements change.

## Impact

- `public/js/admin.js` — the only file modified. Changes are confined to the delegated sidebar click handler and a guard in `navigateToView`.
- Affected transitions (all previously broken, all now fixed): from Feedback Management, Return Requests, and Supply & Stock into Dashboard, Transactions, Announcements, Pickup Confirmations, Request Management, and Admin Accounts; plus reverse transitions back into the standalone documents. `inventory.html` is unaffected and must stay that way.
- Both roles: Super Admin is affected identically and gains the same fix. Per-role module visibility is unchanged; no Admin module is added to Super Admin and no permission is altered.
- No API, route, database, dataset, dependency, or server change. `server.js` is not modified.
- Adjacent open change `fix-admin-superadmin-sidebar-navigation-performance` touches the same sidebar rendering path; its conventions are preserved.
- Known sibling-spec conflicts in `redesign-inventory-page-layout` and `inventory-page-ui-cleanup` are unrelated to this change and remain open.
