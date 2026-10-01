## Context

SmartServe serves the Admin interface as static HTML with vanilla JS. There is no client framework and no build step, and the sidebar is **hand-duplicated markup in six separate files** — it is not rendered from a shared partial, layout template, or JS config. Each file owns its own `<ul>` of nav `<li>` blocks, and nothing at runtime builds, sorts, or re-orders them.

Current state of the six copies:

| Page | File | Current order |
| --- | --- | --- |
| Dashboard shell | `public/admin.html` | D, AA, INV, SS, RR, TR, AN, FB, RM, PC |
| Inventory | `public/inventory.html` | D, AA, INV, SS, RR, TR, AN, FB, RM, PC |
| Returns | `public/admin-returns.html` | D, AA, INV, SS, RR, TR, AN, FB, RM, PC |
| Feedback | `public/admin-feedback.html` | D, AA, INV, SS, RR, TR, AN, FB, RM, PC |
| Registrations | `public/admin-requests.html` | D, AA, INV, SS, TR, AN, RM, PC — **no Return Requests, no Feedback** |
| Supply & Stock | `public/admin-supply-stock.html` | D, AN, AA, TR, RM, PC, FB, RR, INV, SS |

(`D` Dashboard, `AA` Admin Accounts, `INV` Inventory, `SS` Supply & Stock, `RR` Return Requests, `TR` Transactions, `AN` Announcements, `FB` Feedback, `RM` Registrations/Request Management, `PC` Pickup Confirmations)

So four copies largely agree, `admin-requests.html` is missing two links entirely, and `admin-supply-stock.html` is the outlier that produces the reported symptom: the user clicks Supply & Stock, the server returns a full page load whose sidebar markup is in a different sequence, and items visibly jump. No script is involved.

Note also that the six copies differ in incidental attributes: `admin.html`, `inventory.html` and `admin-requests.html` carry `data-view` on several links, the other three do not, and three pages ship a hardcoded `active` class on their own link. Those attribute differences are pre-existing and out of scope except where noted in D5.

Constraints:

- Plain static HTML, no templating engine or build step. There is no mechanism that would let one file render the sidebar for the others.
- `admin.js` and `inventory.js` cannot be loaded together on a page without global-binding collisions (this is the pre-existing `SyntaxError` class of bug already fixed for `supply-stock.js`). So a shared runtime nav module would be actively harmful here, not merely unhelpful.
- The user requires **zero visual change** — no CSS edits, no width/typography/colour/radius changes, no new active-state styles.
- The user requires the sidebar to be identical across modules, with active state affecting styling only.

## Goals / Non-Goals

**Goals:**

- One canonical physical order, identical in all six sidebar `<ul>` blocks: Dashboard, Admin Accounts, Supply & Stock, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management, Request Management, Pickup Confirmations.
- Eliminate the per-page divergence that makes the sidebar appear to reorder itself.
- Add the one missing Return Requests link to `admin-requests.html` so all six pages are actually comparable.
- Leave the existing route-derived `active` highlighting completely untouched.
- Be provably regression-free: a cheap mechanical diff of item sequences can verify the change without running a browser.

**Non-Goals:**

- Not introducing a shared nav partial, template, or JS config. Not deduplicating the six sidebars.
- Not changing the sidebar's visual design, any CSS file, or the page header.
- Not changing any JavaScript file, route, controller, or data model.
- Not changing role-based visibility of Admin Accounts, Request Management, or Pickup Confirmations.
- Not removing Admin Accounts. Not retargeting any `href`.

## Decisions

### D1 — Normalise the six static copies in place; do not deduplicate

The real defect is six copies disagreeing, so the fix is to make the copies agree. Editing the `<li>` blocks in each file is the whole change.

*Alternative considered: extract a shared nav partial (e.g. an EJS/Nunjucks partial, or a JS module that builds the nav).* Rejected. There is no build step or templating in this project, and adding one for a sidebar reorder is disproportionate to the request, which explicitly forbids touching anything unrelated. A JS-built nav is worse still: it would need to load on pages that currently load mutually incompatible scripts, reintroducing the exact global-collision class of bug the project already hit. It would also make the nav depend on JS, whereas today the sidebar renders with JS disabled.

*Alternative considered: one canonical order defined in a comment and enforced by a test only.* Rejected as insufficient on its own — it does not fix the markup, and a comment-based order drifts immediately. It is, however, retained as the regression check in D4.

### D2 — Admin Accounts stays at position 2, super-admin gated

The user's target list has nine items and omits Admin Accounts, which exists at position 2 and is gated to super admins by inline `display:none`. The user chose to keep it. With AA at position 2 and hidden for regular admins, a regular admin's visible sidebar is *exactly* the requested nine items, in the requested order, with no further change. Super admins see AA inserted after Dashboard. This satisfies the request without deleting existing functionality or the only navigation path to `/admin/accounts`.

*Alternative considered: remove Admin Accounts.* Rejected — it would strip a working, role-gated feature and its only link, against the "don't change anything unrelated" constraint.

### D3 — Add Return Requests and Feedback Management to `admin-requests.html`

That page is missing two links, so it can never match the canonical order. The user approved adding both. Each is added as a normal `<li>` matching the corresponding item in the other five pages, at positions 5 and 8. Neither is a new feature — the page already links to every other module; these are two missing copies of existing links, and without them the "identical on every page" requirement is unreachable.

### D4 — Verify with a source-order diff, not a browser

Because the sidebar is static markup, correctness is fully decidable by parsing the six files and comparing their item sequences to the canonical one. A small throwaway Node script (`order-check.js`, no dependencies) extracts the sidebar `<ul>` label/href/id/`active`/count data per file and diffs it against the canonical list. This catches the actual failure mode (a mis-ordered, missing, or duplicated `<li>`) far more reliably than eyeballing rendered pages, and it needs no dependencies.

The script checks three things: that each file's label sequence equals the canonical list, that every file has exactly ten items, and that all six `href` sets are equal. The equality of `href` sets is what proves task 5.3 — that nothing was retargeted — while still permitting the two intentional additions.

### D5 — Leave every pre-existing hardcoded `active` class exactly where it is

`admin.js` and `inventory.js` derive the active item from `location.pathname` at load, and `admin.js:351` does `link.classList.toggle('active', isMatch)` across all `a[href]` in the sidebar. So on pages that load `admin.js`, any hardcoded `active` is overwritten at runtime and is redundant. Introducing new hardcoded classes would be redundant at best and would conflict with the runtime logic at worst, so none are added and no `active` is moved independently of its own item.

However, three pages already ship a hardcoded `active` on their own link: `admin-returns.html`, `admin-feedback.html` and `admin-requests.html`. Critically, `admin-requests.html` does **not** load `admin.js` — it loads `admin-filters.js` and `js/requests-management.js` — so on that page the hardcoded class is the *only* mechanism highlighting the active item. All three therefore must be preserved verbatim and simply travel with their own `<li>` block during the reorder. Removing them would be an unrequested behaviour change and would break highlighting on the Request Management page.

### D6 — Order work so each file's diff is a pure reordering of whole blocks

Each `<li>` is moved as an intact block — classes, `href`, icon `<i>`, and label all travel together. This is what guarantees the "item appearance unchanged" requirement: nothing inside an item is rewritten, so an item at a new ordinal position is guaranteed byte-identical to before. It also keeps each file's diff readable as a move rather than an edit.

## Risks / Trade-offs

- **Deduplication remains unaddressed** → The copies can drift again the next time someone adds a nav item to one file. This change does not fix the class of bug, only the instance. Accepted: the user scoped this to ordering and forbade unrelated structural change. The D4 order-check script is the mitigation and should be run whenever nav markup changes.
- **Manual reordering of ten blocks across six files is error-prone** → A mis-placed or duplicated `<li>` is easy to introduce by hand. Mitigated by D4 (mechanical sequence diff) and by verifying item count and `href` set are unchanged, so the check fails loudly on any accidental drop or retarget.
- **The canonical order now conflicts with three older specs** → `admin-sidebar-navigation-order` (archived), `admin-sidebar-navigation` (in flight), and this change's MODIFIED delta must be reconciled at archive time, or the project will hold contradictory orders. Flagged in the proposal; each later change explicitly supersedes the previous ordering.
- **`admin-supply-stock.html` has the largest delta** → Its sequence is nearly reversed relative to target, so it carries the most chance of error and warrants being verified first and last.
- **Six-file manual edit touches unrelated lines if done carelessly** → Constrained to the `<ul>` block only; `git diff` is reviewed to confirm no header, content, or script line moved.
- **Existing uncommitted work in the tree** → `fix-admin-sidebar-supply-stock-nav` has uncommitted edits to these same six HTML files plus three JS files. New edits stack on top. The JS files must not be touched, and `.env.example` is pre-existing dirty state unrelated to this work.

## Migration Plan

Static asset change with no data, schema, or API impact. No migration. Rollback is `git checkout` of the six HTML files; each file's sidebar returns to its prior order independently with no other consequence.

Deployment is a plain file update. Hard refresh may be needed for clients holding cached HTML, but there is no cache-busting or versioning concern beyond that.

## Open Questions

None outstanding. Admin Accounts placement and the missing Return Requests link were both resolved by the user before artifacts were written.
