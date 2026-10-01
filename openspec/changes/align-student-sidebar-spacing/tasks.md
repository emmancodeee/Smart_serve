## 1. Pin container and list geometry

- [x] 1.1 In `public/css/theme.css`, clamp the Student sidebar container `.dashboard-sidebar` / `.student-sidebar` to `padding: 0 !important` under `theme-light` (matches admin `.sidebar-shell` padding 0, admin.css 1514-1527).
- [x] 1.2 Clamp the Student sidebar nav `<ul class="grid grid-cols-1 gap-2 p-6">` to `padding: 1.5rem !important` and `gap: 0.5rem !important` (matches admin ul padding/gap, admin.css 1550 + markup).
- [x] 1.3 Clamp every Student sidebar link (`.dashboard-sidebar-link`, `.student-sidebar-link`) to `padding: 1rem 1.25rem !important`, `gap: 1rem !important`, `border-radius: 1rem !important` (matches admin 1603-1610 + `.rounded-2xl`), keeping `border-width: 1px solid` uniform for active and inactive states so the gold border stays continuous on all four sides.

## 2. Normalize icon and label geometry

- [x] 2.1 Normalize svgs inside `.student-nav-icon` to `width: 20px; height: 20px` (admin icon glyph metrics) while keeping the `.student-nav-icon` box byte-equal to `.admin-nav-icon` (2.35rem, radius 0.85rem, border rgba(255,255,255,0.32), background rgba(255,255,255,0.09), gold #fde047, flex-shrink:0).
- [x] 2.2 Add `span:last-child { line-height: 1.25 !important }` for Student sidebar links (mirrors `.admin-nav-link span:last-child`, admin.css 364) so two-line labels keep consistent line spacing without changing item structure.
- [x] 2.3 Verify the header/logo section (`px-6 py-6`, `h-14 w-14` logo box, `border-b border-yellow-300/50`, bold white Smart Serve at 1.9rem) renders with the same 1.5rem vertical rhythm and divider as the reference — no geometry override needed beyond the existing theme-light rules.

## 3. Active state and no-layout-shift guarantee

- [x] 3.1 Confirm the active gold rule (background rgba(250,204,21,0.18), border rgba(253,224,71,0.9), translateX(3px), gold glow) still applies to `.dashboard-sidebar-link.is-active` / `.student-sidebar-link.is-active` and that active items keep identical padding and dimensions as inactive items.
- [x] 3.2 Confirm toggling the active item (via `data-sidebar-view`/page navigation) changes only background, border-color, and translate — never width, height, padding, or margin — so there is no layout shift.

## 4. Scope and visual verification

- [x] 4.1 Load all six student pages (dashboard, profile, announcement, feedback, returns, and the dashboard Request view) and verify the sidebar item spacing, padding, icon column, label column, header rhythm, and active gold border visually match the Super Admin/Admin sidebar.
- [x] 4.2 Diff-check that `public/schedule.html`, all Admin pages (`public/admin.html`, `public/admin-feedback.html`, `public/admin-returns.html`, `public/admin-requests.html`, `public/inventory.html`), and no student page `.html` were modified by this change — only `public/css/theme.css`.
- [x] 4.3 Confirm the menu order (Dashboard → User Profile → Request → Announcements → Feedback → Returns), labels, routes, colors, and functionality are unchanged; confirm no console errors.