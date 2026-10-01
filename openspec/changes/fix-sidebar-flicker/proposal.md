## Why

During admin navigation, a sense of role-disambiguation requires fetching `/api/auth/me` on every page load. Because the role-gating JS (`applySuperAdminUI()` / `applySuperAdminSidebar()`) only runs after that network round-trip completes, the role-dependent sidebar items start in their **hidden-by-default** state and then "appear" once the request resolves. When moving between pages the sidebar visibly jumps/resizes (higher menu jumps down, lower items appear late and shift the fixed-width column) — the sidebar does not stay visually stable across navigation.

## What Changes

- **Cache the authenticated admin profile (name + role + `isSuperAdmin`) in `localStorage` at login time** so it is available synchronously on the very next page render — no empty/undefined role gap, no waiting on `/api/auth/me` before the correct sidebar items render.
- **Read the cached profile synchronously** to compute the Sidebar's role visibility immediately on DOMContentLoaded, painting the correct menu before any network request resolves.
- **Still validate the session on the server**: keep the existing `/api/auth/me` fetch and `applySuperAdminUI()`/`applySuperAdminSidebar()` as the authoritative re-sync — they now just confirm/refresh the cache instead of being the first thing that reveals or hides items.
- No change to sidebar order, labels, icons, design, width, colors, active state, routes, or permissions. Pickup Confirmations remains ADMIN-only; it never appears for Super Admin.
- Students and non-admin users are unaffected (they never reach these admin pages).

## Capabilities

### New Capabilities
- `stable-admin-sidebar`: The admin sidebar renders the correct role-based set of navigation modules synchronously on every page load and stays visually stable across module navigation — items never temporarily disappear, collapse, jump, or resize; only the active state changes on navigation.

### Modified Capabilities
- (none)

## Impact

- **Files:** `public/js/app.js` (persist authenticated profile on login), `public/js/admin.js` (read cached role synchronously during `applySuperAdminUI`/role setup) and `public/js/inventory.js` (`applySuperAdminSidebar`).
- **Backend/API:** none — `/api/auth/me` is unchanged and remains authoritative.
- **No dependencies** and no breaking changes. Cache is a non-sensitive display hint only (role is still enforced server-side).