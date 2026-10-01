# Tasks: Redesign Student Side Sidebar

## 1. Remove the legacy dark theme-sidebar override

- [x] 1.1 Confirm `public/css/dashboard-theme.css` is removed from the repo and no page loads it (the dark near-black `#060f1f` Student sidebar override no longer applies)
- [x] 1.2 Confirm every student page renders the blue gradient from shared rules (no leftover `dashboard-theme.css` reference remains)

## 2. Restyle sidebar markup on the six student pages (admin design, student content)

- [x] 2.1 Dashboard (`public/dashboard.html`): wrap each `.dashboard-sidebar-link` icon in `<span class="student-nav-icon">` (glassy gold icon box), keep the blue gradient shell + admin logo header (gold graduation-cap box, `border-b border-yellow-300/50`, bold white "Smart Serve"), keep the six links in order Dashboard, User Profile, Request, Announcements, Feedback, Returns with `data-sidebar-view`/`is-active` intact and no white-pill classes
- [x] 2.2 User Profile (`public/profile.html`): same restyle, active on Profile
- [x] 2.3 Announcements (`public/announcement.html`): same restyle, active on Announcements
- [x] 2.4 Feedback (`public/feedback.html`): same restyle, active on Feedback
- [x] 2.5 Returns (`public/returns.html`): same restyle, active on Returns
- [x] 2.6 Keep the Request link label "Request" on all six pages, `href="/dashboard#request"` on non-dashboard pages and `data-sidebar-view="request"` on the Dashboard page — student content/routing unchanged

## 3. Apply the admin gold styling in the shared theme

- [x] 3.1 In `public/css/theme.css`, remove the white-pill `theme-light` overrides for `.dashboard-sidebar-link.is-active` / `.student-sidebar-link.is-active` (the white `#ffffff` pill and `#10284d` navy icon/text colors) and the white-translucent hover flattening
- [x] 3.2 Add the admin-equivalent gold active rule (background `rgba(250,204,21,0.18)`, border `rgba(253,224,71,0.9)`, gold glow shadow, `translateX(3px)`, white text, gold icon) for both `.dashboard-sidebar-link.is-active` and `.student-sidebar-link.is-active`
- [x] 3.3 Add the `.student-nav-icon` rule byte-matching `.admin-nav-icon` (2.35rem, radius 0.85rem, `border rgba(255,255,255,0.32)`, `background rgba(255,255,255,0.09)`, gold `#fde047` icon, `flex-shrink:0`) applicable on all six pages
- [x] 3.4 Keep the admin gold hover on links (`hover:border-yellow-300 hover:bg-yellow-400/15 hover:shadow-lg`) for `.dashboard-sidebar-link`/`.student-sidebar-link` under `theme-light`

## 4. Verify layout, scope, and behavior

- [x] 4.1 Confirm all six pages share the fixed 270px `@media (min-width:1024px)` sidebar layout with `margin-left:270px` main offset and no width/position shift between pages
- [x] 4.2 Diff-check that `public/schedule.html`, all Admin pages, `public/inventory.html`, `public/index.html`, and `public/register.html` are byte-identical after the change
- [x] 4.3 Confirm `public/js/dashboard.js` active-state toggle still works, including the Request view (`data-sidebar-view` toggles `is-active`); verify no JS changes were needed