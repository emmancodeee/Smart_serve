## Why

The repository is mid-merge: merging `8de26b0` (frontend improvements) into branch `dja` left 6 files with 18 unresolved conflict markers (`<<<<<<< HEAD` / `>>>>>>> 8de26b0`). The app cannot reliably run until conflicts are resolved, and any conflict resolution must preserve features from BOTH branches: the feedback/returns admin pages and nav links from `dja`, and the mobile-responsive sidebar, skip link, and standardized design tokens from `8de26b0`.

## What Changes

- Resolve all 18 conflict markers in `public/admin.html`, `public/css/admin.css`, `public/css/inventory.css`, `public/inventory.html`, `public/js/admin.js`, `public/js/inventory.js` by merging both branches' changes (union resolution where both sides add distinct features)
- Keep the mobile-responsive sidebar structure (mobile menu button, overlay, skip link, `lg:grid-cols-1` responsive nav) from `8de26b0` while retaining the feedback/returns/announcements nav items from `dja`
- Keep both CSS variable groups (design-system tokens from HEAD and standardized typography/shadows/z-index from `8de26b0`) with no duplicate variable definitions
- Keep both `initAdminProfile()` call and the super-admin welcome-title logic in `public/js/admin.js`
- Verify no conflict markers remain, then commit the merge
- **BREAKING**: none - this restores a buildable state

## Capabilities

### New Capabilities
- `merge-conflict-resolution`: All 6 conflicted files fully resolved with both branches' features preserved, no leftover conflict markers, and the merge committed

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `public/admin.html` - 3 conflict regions (layout shell, sidebar, header)
- `public/css/admin.css` - 1 conflict region (CSS variable groups)
- `public/css/inventory.css` - 1 conflict region (CSS variables)
- `public/inventory.html` - 4 conflict regions (sidebar, nav list, layout)
- `public/js/admin.js` - 2 conflict regions (DOM refs, init logic)
- `public/js/inventory.js` - 7 conflict regions (DOM refs, rendering logic)
- Git state: merge remains in progress until `git commit` completes it
