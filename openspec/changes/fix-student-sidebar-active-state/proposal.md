## Why

When a student clicks the **Request** item in the sidebar, the Request workflow loads but the sidebar keeps **Dashboard** highlighted with the white active pill. The Student sidebar must always highlight exactly the module that matches the current route/view, and when the Request view is open only **Request** may be active.

## What Changes

- Fix the Student sidebar active-state logic so the highlight is derived from the current route/view instead of a hardcoded Dashboard default.
- On the Dashboard page (`dashboard.html`), the **Request** sidebar item (`#request` / legacy `#registration` views) becomes the white-active item; **Dashboard** returns to its normal inactive navy style whenever Request is open.
- Make the active state update immediately on click, on page refresh, and when navigating directly to the Request URL (`/request` or `/dashboard#request`).
- Guarantee at most one sidebar item is active at any time.
- **BREAKING**: none. No changes to Request page content, functionality, or workflow; no changes to the global header, sidebar order, sidebar colors/design, sidebar modules, or the Dashboard page content. No new Dashboard item is created.

## Capabilities

### New Capabilities
- `student-sidebar-active-state`: The Student sidebar highlights the sidebar item that matches the current route/view (pathname routes map to their page; the Dashboard page's Dashboard/Request views map to the `#dashboard`/`#request` hash), always with exactly one item active.

### Modified Capabilities
<!-- No existing specs; openspec/specs is empty. -->

## Impact

- `public/js/dashboard.js` — replace the dead `[data-dashboard-nav]` active-state toggle with a route/view-driven sidebar active-state updater called on load and on every `hashchange`.
- `public/dashboard.html` — mark the Dashboard and Request sidebar links with a `data-sidebar-view` attribute so JS can resolve which one is active.
- No change to `server.js`, other pages, other page JS, or CSS.