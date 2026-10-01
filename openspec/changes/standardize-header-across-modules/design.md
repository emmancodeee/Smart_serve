## Context

The admin sidebar module pages are statically served HTML files (`server.js` uses `res.sendFile`/`express.static`; there is no template engine or shared header partial). The header is duplicated per file with slightly different markup:

- `admin.html` (Dashboard / Admin Accounts / Transactions / Announcements) and `inventory.html`: `header-left` = `[#headerClock][#logoutBtn]`, `header-right` = `[.header-search][.header-bell][.admin-profile]`
- `admin-returns.html` and `admin-feedback.html`: `header-left` = `[h1.admin-welcome][.header-title][.header-subtitle]`, a middle `grid` group = `[#headerClock][#logoutBtn]`, `header-right` = `[.header-search][.header-bell][.admin-profile]`

Together these produce three declared header groups, an in-header title/description, and a Notification Bell that sits before the Admin Profile on every page. The styling for the dark navy header and its components lives in `public/css/admin.css`: `.admin-header` (lines ~375, ~464), `.admin-clock` / `.admin-logout` (lines ~395-427), the shared `.header-search`, `.header-bell`, `.admin-profile` pieces (lines ~1749-1893), and the `.admin-page ...` header/`.filter-toolbar` refinements appended by the active `fix-returns-page-ui` change ("returns-page-layout" block). Client JS (`admin.js`) binds to fixed IDs/classes (`#headerClock`, `#logoutBtn`, `.header-search`, `.admin-profile`, `#profileAvatar`, `#profileName`, `#profileName`) so relocating those elements does not require JS changes.

These four files also carry uncommitted work from the active `reorder-admin-sidebar-nav` and `fix-returns-page-ui` changes; the sidebar markup/order and the returns page layout must be preserved byte-for-byte.

## Goals / Non-Goals

**Goals:**
- One canonical header markup used identically on every sidebar module page
- Exact reference structure: LEFT `[Date & Time][Logout]`, RIGHT `[Search][Admin Profile][Notification Bell]`, bell last/far-right
- No "Welcome Admin" heading, no in-header page title, no module description in the header
- Reuse existing component classes/CSS; no JS, backend, route, or data changes
- Header never overlaps and stays responsive (using existing behavior)

**Non-Goals:**
- No changes to sidebar design/order/icons/labels/colors, page content, or any module functionality
- No changes to `public/js/*`, backend, API, routes, auth, authorization, database
- No refactor to a server-side template/partial system (files are static HTML)
- No change to student-facing pages (`dashboard.html`, `announcement.html`, `schedule.html`, `profile.html`, `feedback.html`, `returns.html` — these use `student-topbar` and are not admin sidebar modules)
- No change to `admin-requests.html` (legacy white-header page, not served by any route, not in the current sidebar module list)

## Decisions

**D1. Canonical header markup: replicate `admin.html`'s skeleton on every page.**
The standard header is:

```
<header class="admin-header sticky top-0 z-20 bg-[#152c69] text-white shadow-lg" role="banner">
  <div class="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
    <div class="header-left flex items-center gap-4">
      <span id="headerClock" class="admin-clock hidden rounded-2xl border border-yellow-300/80 bg-[#1d3b86] px-4 py-2 text-[0.86rem] font-semibold text-white md:inline-flex"></span>
      <button id="logoutBtn" class="admin-logout inline-flex items-center justify-center rounded-full border border-yellow-300 bg-[#ffda47] px-6 py-3 text-[0.92rem] font-semibold text-[#183575] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffe069] hover:shadow-md active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-1">Logout</button>
    </div>
    <div class="header-right">
      <div class="header-search"><svg class="search-icon" …/><input type="text" placeholder="Search..." class="search-input"></div>
      <div class="admin-profile"><div class="profile-avatar" id="profileAvatar">A</div><div class="profile-info"><div class="profile-name" id="profileName">Admin</div><div class="profile-role">Administrator</div></div></div>
      <div class="header-bell"><svg …/><span class="bell-badge"></span></div>
    </div>
  </div>
</header>
```
*Rationale:* the classes already exist in `archive` CSS and are bound by `admin.js`; the outer group `header-left`/`header-right` produces the required LEFT/RIGHT split via `justify-content: space-between`. Replicating one proven skeleton guarantees identical rendering and styling across modules.
*Alternative considered:* a shared server-side partial — rejected because pages are static HTML and introducing templating is a cross-cutting refactor out of scope.

**D2. Bell order achieved by child order inside `header-right`.**
`header-right` is `display:flex` (`.admin-page .admin-header .header-right { display:flex; align-items:center; gap:20px }`). Ordering its children `search → profile → bell` makes the bell the last child and, because `header-right` itself is the outer container's last flex child, the bell is the far-right element. The existing 20px gap provides the required visual separation between the profile and the bell.

**D3. Rebuild the header containers on `admin-returns.html` and `admin-feedback.html`.**
Replace the header's inner content on those two pages (welcome heading, title, subtitle, and the middle clock/logout `grid`) with the canonical `header-left` (clock + logout) and `header-right` (search + profile + bell). The in-header description text is removed; the module titles already exist in the page body, and the sidebar highlights the active module.
*Rationale:* directly satisfies the "no module title/description in header" requirement and matches the reference.

**D4. CSS: small additive refinements under `.admin-page .admin-header`.**
Reuse existing shared CSS for all components. Add only narrow rules to guarantee stability:
- keep `.admin-page .admin-header .mx-auto` aligned (already added by `fix-returns-page-ui`: `align-items:center; row-gap:0.75rem`)
- ensure `.header-right .header-bell` has no extra shrink so it stays at the far end intact
- retire the now-dead rules in the `returns-page-layout` block that target `.admin-welcome` and `.header-title` inside the standard header (they apply to elements that no longer exist), leaving the useful alignment/responsive rules intact
*Alternative considered:* writing page-specific header CSS — rejected; one class set shared across all pages is the point of this change.

**D5. Responsive behavior reuses existing rules.**
The outer container already uses `flex-wrap`, and admin.css already has `@media (max-width: 1024px) { .admin-clock { min-width:0; width:100% } }` plus the `@media (max-width:640px)` rules that hide the search/bell/profile-info for `admin-page` headers. Keep the clock's existing `md:inline-flex` visibility. No new layout mechanism is introduced.

**D6. `admin.html` and `inventory.html` reorder only.**
Both already have the correct left group; only the right group's children need to become `search → profile → bell`. Nothing else on those pages changes.

## Risks / Trade-offs

- [Removing in-header titles/descriptions on returns & feedback pages could look unexpected at first] → Established as the explicit reference; module identity remains in the page body and in the highlighted sidebar item.
- [Edits to files that carry uncommitted sidebar/layout work] → Apply surgical, read-modify edits; keep the `<nav id="sidebar">` and below-header content untouched (byte-identical).
- [Modified `header-right` order could break any JS expecting node order] → `admin-filters.js`/`admin.js` bind by class/id and class-combining selectors, not sibling order; verified file-wide after edits via grep.
- [Shared CSS additions could affect other `admin-page` pages] → All additive rules are scoped to `.admin-page .admin-header` and mostly already exist; sibling `admin-page` pages use the same dark header pattern and benefit identically.
- [Dead CSS (`.admin-welcome`, `.header-title`) remains in admin.css] → Harmless; tidied only inside the `returns-page-layout` block, no broader refactor.

## Migration Plan

Static files; no data/backend migration. Deployment is the normal commit + push + Dokploy redeploy. Rollback = revert the four HTML files and the admin.css additions.

## Open Questions

- None blocking. If a future request wants the in-header module title retained, it can be re-added inside `header-left` without changing the bell position, since the bell is governed by `header-right` ordering.