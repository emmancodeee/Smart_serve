## Why

In the dark-blue header (`#152c69`) of the admin pages, the logged-in user's name ("Phinma Superadmin") and role ("Administrator") currently render with dark slate colors (`#0F172A` and `#64748B`), making both lines hard to read against the blue background. Fix only the text colors so the name and role are clearly legible without changing the header layout, functionality, or identity of the account shown.

## What Changes

- Name line (`#profileName`, e.g. "Phinma Superadmin") becomes white (`#FFFFFF`), staying bold as it is now.
- Role line (`Administrator`) becomes a lighter but clearly readable color (e.g. `#E5E7EB`), keeping its current slightly-smaller size and weight.
- Applies to the dark-blue header profile on every affected admin page: Admin (admin.html), Inventory (inventory.html), Return Requests (admin-returns.html), and Feedback Management (admin-feedback.html).
- No change to layout, spacing, profile circle, header dimensions, font family, user/role values, or any header/account functionality.
- White-header (admin-requests.html) and student-header pages are unaffected.

## Capabilities

### New Capabilities
- `admin-header-user-info-visibility`: The logged-in user's name and role in the dark-blue admin header are rendered with sufficient contrast (white name, lighter readable role) while preserving layout, typography hierarchy, and functionality.

### Modified Capabilities
- (none — no existing specs to modify)

## Impact

- **File (frontend only):** `public/css/admin.css` — add scoped color overrides for `.admin-page .admin-header .admin-profile .profile-name` (white) and `.profile-role` (light gray). `inventory.css` already carries equivalent overrides for the same dark-blue header context, so no change is needed there.
- **Backend / APIs:** none — no account, role, authentication, or header data changes.
- **No dependencies** and no breaking changes.