## Why

The filter controls on the Admin Account Management and Announcements sections sit flush against the bottom edge of the dark-blue section header (`.section-header-row`), with no visible vertical gap. The same pattern exists on other admin sections (Users, Transactions, Registrations, Pickup Confirmations) and on Inventory Management, making the design feel cramped and inconsistent.

## What Changes

- Add a small, consistent vertical gap (8–16px) between the blue section header and the filter toolbar where a `section-header-row` is immediately followed by a filter container.
- Apply the same spacing rule on the Announcement page (student-facing `announcement.html`) whose sidebar filter controls sit directly below the navy header area.
- Fix the spacing at the shared CSS level (`.admin-page .filter-toolbar` / the section wrapper) so all affected sections inherit the same value rather than being patched page-by-page.
- No functional, color, typography, or content changes.

## Capabilities

### New Capabilities
<!-- No new capabilities; this is a pure layout/visual fix. -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation). -->
- `admin-filters`: Add a layout requirement that filter toolbars rendered below a section header must maintain a consistent vertical gap (8–16px) from that header, so the filter controls never touch the header and stay responsive (wrap) on smaller screens.

## Impact

- `public/css/admin.css`: Add/adjust the shared header-to-filter gap within the admin section/.filter-toolbar rules.
- `public/announcement.html`: Ensure the student announcement page's filter sidebar respects the same header-to-filter spacing.
- Applies to all admin sub-sections that use the `.section-header-row` + filter container pattern (Admin Accounts, Announcements, Users, Transactions, Registrations, Pickup Confirmations) and Inventory Management where the same structure appears.
- No JS, API, database, or markup changes unless a target element needs a class for the spacing rule to apply.
