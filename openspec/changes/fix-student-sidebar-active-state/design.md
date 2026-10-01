## Context

Student pages are static HTML served by Express (`server.js`): `/dashboard` → `dashboard.html`, `/profile` → `profile.html`, `/announcement` → `announcement.html`, `/feedback` → `feedback.html`, `/returns` → `returns.html`. `/request` is a 302 redirect to `/dashboard#request`.

Each page's sidebar hardcodes `is-active` on its own link in the static markup (correct for the pathname-only pages). The exception is `dashboard.html`, which hosts TWO views in one file: the Dashboard view (default) and the Request view, selected by the URL hash (`#dashboard`, `#request`, or legacy `#registration`).

The only JS on the Dashboard page is `public/js/dashboard.js`. Its `setDashboardSectionVisibility()` already switches the module title bar and toggles section visibility from the hash, but its sidebar active-state block (dashboard.js:186-189) targets `[data-dashboard-nav]` elements — a selector that matches **nothing** in any HTML file. Since `dashboard.html` hardcodes `is-active` on the Dashboard link (dashboard.html:962), the highlight stays on Dashboard whenever the Request view is open.

CSS facts (why a single class toggle is sufficient):
- `body.theme-light .dashboard-sidebar-link.is-active` (theme.css:633-640) sets `background:#fff !important`, `color:#10284d !important`, `border:1px solid #fff !important` — the white active pill.
- `body.theme-light .dashboard-sidebar-link.is-active :is(span,svg)` (theme.css:642-645) sets the icon/text color.
- The utility classes in the markup (`border-white bg-white text-blue-900`) are therefore redundant for the active look; the `is-active` class alone drives the white pill via CSS with `!important`.

Constraints: do not change Request page content, functionality, workflow, global header, sidebar order, sidebar colors/design, sidebar modules, other pages, the Dashboard page, or server routing.

## Goals / Non-Goals

**Goals:**
- Sidebar highlight is derived from the current route/view, never hardcoded to Dashboard.
- On the Dashboard page, the Request view (`#request` / legacy `#registration`) highlights **Request**; the Dashboard view highlights **Dashboard**. At most one item is active.
- Active state is correct immediately on click, on refresh, and on direct URL load (`/request`, `/dashboard#request`).
- Unchanged appearance for active and inactive sidebar items.

**Non-Goals:**
- No changes to Request page content, workflow, or functionality.
- No changes to header, sidebar order, sidebar design/colors, sidebar modules, other pages, Dashboard page content, or server routing.
- No new Dashboard item; no routing framework addition.

## Decisions

### D1: Drive the active state from the resolved view, not the raw class markup
`setDashboardSectionVisibility()` already computes a normalized view: `showRequest = isRequestView(hash)` (true for `#request` and `#registration`). We reuse that single source of truth as the active view: `showRequest ? 'request' : 'dashboard'`. This deliberately maps the legacy `#registration` hash to the Request item, matching how the content visibility already treats it.

### D2: Use `data-sidebar-view` attributes on exactly two links in `dashboard.html`
- Dashboard link (dashboard.html:962): add `data-sidebar-view="dashboard"` (keeps its default `is-active` markup — Dashboard is the default view).
- Request link (dashboard.html:974): add `data-sidebar-view="request"` (stays default-inactive).

No other page or link is touched. Because the selector is scoped to `[data-sidebar-view]`, only these two elements can ever receive the active state; the pathname-only pages are unaffected (they keep their static per-page active markup). This also guarantees a single active item: both links are processed in the same loop, and only the one whose `data-sidebar-view` matches the active view gets `is-active`.

Alternatives considered:
- Toggling a hardcoded class list (`is-active border-white bg-white text-blue-900` vs `border-transparent text-white hover:...`) on Dashboard/Request links — rejected: fragile string-class surgery that risks the "inactive appearance" constraint and adds noise.
- Deriving active from `window.location.pathname` or a helper that matches each link's `href` — rejected: `href` values like `/dashboard`, `/dashboard#request`, and `/profile` need bespoke mapping anyway; an explicit view marker is simpler and self-documenting.
- Moving Request to its own HTML page — rejected: violates non-goals (would change routing, workflow, and the existing `#request` hash navigation).

### D3: Replace the dead `[data-dashboard-nav]` block in `dashboard.js`
Lines 186-189 currently query `[data-dashboard-nav]` (matches nothing). Replace that block with an `updateSidebarActiveState(activeView)` helper that:
- iterates `document.querySelectorAll('[data-sidebar-view]')`, and
- `link.classList.toggle('is-active', link.dataset.sidebarView === activeView)`.

The `is-active` toggle alone reproduces the exact white/blue active styling via the existing theme-light CSS, so no CSS changes are needed.

`setDashboardSectionVisibility()` calls `updateSidebarActiveState(...)` every time it runs, which is on `DOMContentLoaded` (dashboard.js:1547 → `setupDashboardSectionNavigation()`) and on every `hashchange` (dashboard.js:204-207). That covers:
- initial load with no hash (→ dashboard),
- refresh / direct load of `/dashboard#request` and the `/request` redirect (→ request),
- clicking the Request or Dashboard sidebar link (hash changes on the same page).

### D4: Keep the existing visibility/title logic untouched
The module-title-bar swap, section visibility toggles, and `#registration` → `#request` normalization stay exactly as they are. The only behavioral change is which sidebar link carries `is-active`.

## Risks / Trade-offs

- The Request sidebar link markup now carries an extra `data-sidebar-view` attribute on the Dashboard page. Since it is the only other link besides Dashboard that can be active, and both are re-checked on every run, the risk of two active items is effectively nil → mitigated by the single loop + single match design.
- If `theme-light` is ever removed or the CSS `!important` rules change, the white pill might no longer be driven purely by `is-active`. → Out of scope; the visual contract is defined by the existing CSS, which this change does not modify.
- If future code reintroduces `classList.add('is-active')` elsewhere for sidebar links, there could be conflicts. → The `data-sidebar-view` scoping keeps this local; a follow-up would supersede it.
- Legacy `#registration` hash continues to be treated as the Request view in the sidebar, matching the existing content behavior. Users bookmarked with `#registration` see Request highlighted. No migration needed.