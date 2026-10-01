## Context

The SmartServe admin panel is a multi-page server-rendered application, not a client-side router. It is a hybrid of two navigation mechanisms sharing one sidebar:

**One shell document with client-side sections.** `server.js:288` routes `/admin`, `/admin/dashboard`, `/admin/users`, `/admin/accounts`, `/admin/announcements`, `/admin/transactions`, `/admin/registrations`, and `/admin/pickup-confirmations` all to the single file `admin.html`. `admin.js` owns six section elements in that document and toggles their visibility. `admin.js` calls this a "SPA shell" (`SPA_ADMIN_VIEWS`, `isSpaAdminShell()`), and switching between these six is deliberately done without a document load.

**Four standalone documents.** `server.js:291-302` serve `inventory.html`, `admin-feedback.html`, `admin-returns.html`, and `admin-supply-stock.html` on their own paths (`STANDALONE_ADMIN_VIEWS`). Each contains exactly one module.

`admin-nav.js` builds one shared sidebar for all five documents from `ADMIN_NAV_ITEMS`. Each item carries an `href` (its real URL) and, for the six shell views, a `data-view` attribute. `data-view` is the marker that tells the shell "this link switches a section instead of loading a document."

The defect is a scope leak between those two mechanisms. `admin.js:5168` installs a document-level delegated click handler on all four documents that load it, and it fires for any sidebar link carrying `data-view` regardless of whether the current document contains the corresponding section:

```js
// public/js/admin.js:5168 — present on admin.html, admin-feedback.html,
// admin-returns.html, admin-supply-stock.html
const link = e.target.closest('.sidebar-shell a[data-view], .sidebar a[data-view]');
if (!link) return;
e.preventDefault();                 // cancels the real navigation
const view = link.getAttribute('data-view');
if (!view) return;
navigateToView(view);               // switches a section that does not exist here
```

On a standalone document, `navigateToView` pushes the target path into history, `setAdminView` finds no matching section, `refreshData` loads nothing relevant, and the previously opened module remains fully visible. The address bar now shows the target module's path while the content shows the old module. A refresh issues a real document request, the server returns `admin.html`, and the section appears — which is why the bug is reported as "needs a refresh."

Two facts constrain the fix:

- The **boot** path is already correct. `applyAdminView` (line 814) checks `isSpaAdminShell()` and deliberately skips section switching and history rewriting on single-module documents, with a comment explaining that rewriting history there would navigate the user off the module they opened.
- `navigateToView` (line 5135) has **exactly one caller**, the interceptor above. The intended guard exists on the boot path and was never mirrored onto the click path.

`inventory.html` does not load `admin.js` and so has no interceptor, which is why it is absent from the reported failures. That asymmetry is a useful confirmation: the broken pages are precisely the ones that load the shell's script without being the shell.

## Goals / Non-Goals

**Goals:**

- A sidebar click always results in the selected module's own content and its own loading state, with no browser refresh.
- Restore the rule that a click is claimed client-side only when the current document genuinely renders the target view as one of its sections; otherwise the browser performs the real navigation.
- Fix every affected transition globally — from Feedback Management, Return Requests, and Supply & Stock into any shell view, and from any shell view back into a standalone document — for both Admin and Super Admin.
- Keep the address bar, the sidebar highlight, and the rendered content in agreement at all times.
- Derive the ownership decision from the existing view registry so a module added later is classified without editing navigation code.
- Touch exactly one file.

**Non-Goals:**

- No UI, layout, style, typography, colour, button, filter, table, or card change.
- No data, dataset, API, route, database, or dependency change.
- No permission or per-role module-visibility change; no Admin module is exposed to Super Admin.
- No redesign of the navigation architecture, and no move toward a client-side router.
- No per-module workarounds for individual transitions.
- No programmatic reload, `location.href` assignment, `history` refresh hack, `setTimeout` delay, CSS hiding, or simultaneous mounting of all sections.
- Not removing `admin.js` from the standalone pages, even though they arguably should not need the shell's script.

## Decisions

### D1 — Gate the interceptor on document ownership, not on a module list

The handler claims a click only when the current document actually contains the target view's sections. Ownership is computed from the existing registry rather than a hand-maintained list.

*Rationale:* The failure is precisely a mismatch between the link's declared navigation mode (`data-view`) and the current document's actual capability. Testing actual capability fixes every transition at once, including ones not yet reported, and cannot drift when a module is added.

*Alternatives rejected:*
- *Per-module special cases* — exactly the pattern the report forbids, and it would not cover the untested transitions.
- *A hardcoded list of standalone page filenames* — a second source of truth that duplicates `STANDALONE_ADMIN_VIEWS` and rots on the next new page.
- *`if (window.location.pathname === '/admin/feedback') return;`* — hardcodes URLs, ignores `/admin` and legacy aliases, and grows with every page.

### D2 — Define ownership as "the registry's section ids for this view are present in this document"

A single predicate, e.g. `documentRendersView(viewKey)`, that is true when `isSpaAdminView(viewKey)` and the document contains the section element ids registered for that view in `SECTION_VIEWS`. The click handler uses it before touching `preventDefault()`.

*Rationale:* This is the same condition `setAdminView` needs in order to do anything. A test derived from the target of the operation cannot be more permissive than the operation itself, so the gate cannot wrongly claim a click that the switcher would have ignored. It reuses `SPA_ADMIN_VIEWS` and `SECTION_VIEWS` rather than introducing a new table.

*Note on strictness — resolved by inspection:* the **full** registered section set is required (e.g. all four `registrations` ids), not any single id, so an unrelated element sharing one id cannot claim ownership. Verified against the markup: `admin.html` contains every registered id for all seven shell views, including all four `registrations` ids, and **no** standalone page contains any shell view id. The strict test therefore separates the two document kinds with no ambiguity and no fallback needed.

The registry also lists region ids for the standalone views (`inventoryContent`, `supplyStockContent`, `returnsContent`, `feedbackContent`) that exist in no document. This is intentional and matches the registry's own comment; those views carry `dataView: null`, so they never reach the interceptor and are unaffected by the ownership test.

### D3 — Call `preventDefault()` last, after the ownership test

The default browser action is cancelled only once the handler has committed to handling the click itself.

*Rationale:* Cancelling first and testing second is the bug. Making "I take over" the last step means any future early return fails safe — the link navigates — instead of trapping the user. This is the whole fix in one reordering.

### D4 — Add a matching early return inside `navigateToView`

`navigateToView` returns without pushing history, switching sections, or loading data when the current document is not the admin shell.

*Rationale:* Two guards that express the same invariant, at the boundary and at the operation. The history mutation at line 5143 is a side effect that is awkward to unwind once done; refusing before it is written is cheaper than repairing it. "Exactly one caller today" is an observation, not a contract.

### D5 — Do not add `location.assign(viewPath)` or any programmatic fallback

*Rationale:* The `href` on each link is already correct. The defect is that the code cancels it. Re-adding navigation programmatically would be the "reproduce the refresh behaviour in code" anti-pattern the report explicitly rules out, and it would break middle-click, ctrl/cmd-click, and "open in new tab" on every sidebar link — a real regression in exchange for nothing. Restoring the default is strictly better than emulating it.

### D6 — Leave active-state handling untouched

On a real navigation the incoming document applies its own highlight from `location.pathname` through `renderAdminNav`/`updateSidebarActiveLink`, so setting it in the outgoing document is pointless. Inside the shell, `navigateToView` already applies active state synchronously before awaiting data.

*Rationale:* The reported "active state changes immediately" behaviour is a symptom of the bug, not a separate requirement: the highlight moved because history was rewritten while the content did not. Fixing the navigation makes the highlight and content agree, so no active-state code needs to change.

### D7 — Reject the delay/hide/mount-all alternatives explicitly

*Alternatives rejected, with reasons:*
- *`setTimeout` before switching* — hides the race rather than removing it and reintroduces the "artificial delay" the report prohibits.
- *Hiding all sections with CSS on click* — leaves every module mounted and does nothing for a document that lacks the target section.
- *Mounting all six shell sections on every standalone page* — duplicates the shell into pages that deliberately do not need it, and multiplies startup cost and cross-module state bleed for no benefit.
- *Awaiting `refreshData()` before switching* — ordering data before the swap is what produces a stale-content frame; the shell already swaps first and loads after.

## Risks / Trade-offs

- **A stray element id could claim ownership** → require the view's full registered section set, not any single id. A false claim would mean `setAdminView` on a view the document cannot render, which is the current bug; a false release merely falls back to a real navigation, which is always correct.
- **`isSpaAdminShell()` keys off `#analytics`, a dashboard-specific id** → it is pre-existing and already load-bearing in `applyAdminView`, so it is reused rather than duplicated. The ownership predicate must not rely on it alone, so a future dashboard rename degrades to real navigation instead of a frozen page.
- **The `registrations` view owns four section ids** → verify `admin.html` actually contains all four before choosing the strict test, so the shell is never mistaken for a standalone page (which would cost an in-shell navigation its document-free switch and add a load).
- **Only one file changes, so a reviewer may expect a broader diff** → the narrowness is the finding. The bug is one unconditional `preventDefault()`; a larger diff would be adding the indirection the report asked to avoid.
- **Regression risk on the shell's document-free switching** → the gate must be proven not to fire on `admin.html`. The acceptance matrix covers every in-shell pair in both directions, not only the reported failures.
- **Sibling OpenSpec changes touch the sidebar** (`fix-admin-superadmin-sidebar-navigation-performance`, `fix-sidebar-flicker`, `fix-sidebar-inconsistency`, `reorder-admin-sidebar-nav`) → this change edits only `admin.js` and leaves `admin-nav.js`, sidebar markup, and ordering untouched, so those changes do not conflict.

## Migration Plan

Single-file, front-end-only change with no data or schema migration.

1. Land the ownership predicate and the reordered handler in `admin.js`.
2. Verify the shell's six modules still switch without a document load.
3. Verify each standalone page now performs a real navigation into every shell view and back.
4. Rollback is reverting one file; no server restart, cache purge, or data repair is involved.

## Open Questions

None blocking implementation. The ownership test's strictness was settled by inspecting the markup (see D2) rather than left open.
