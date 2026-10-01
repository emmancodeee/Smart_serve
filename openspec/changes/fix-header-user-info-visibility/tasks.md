## 1. Implementation

- [x] 1.1 In `public/css/admin.css`, immediately after the existing `.profile-role` rule block (~line 1876), add two scoped overrides for the dark-blue header: `.admin-page .admin-header .admin-profile .profile-name { color: #ffffff; }` and `.admin-page .admin-header .admin-profile .profile-role { color: #E5E7EB; }`. Do not modify any existing rules, HTML, layout, spacing, or functionality.

- [x] 1.2 Confirm via `git diff -- public/css/admin.css` that the change adds only the two new override rules and touches nothing else.

## 2. Verification

- [x] 2.1 Browser pass on the four dark-blue header pages (Admin dashboard, Inventory Management, Return Requests, Feedback Management): user name is white (`#FFFFFF`), role text is a clearly readable lighter color (e.g. `#E5E7EB`), both lines are legible, profile circle and all spacing/layout are unchanged, white-header and student pages are unaffected.

- [x] 2.2 Confirm no regressions: user name and role strings displayed are still the correct logged-in account's values, header clock/notifications/logout/navigation all work normally.