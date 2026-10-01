## Why

The SmartServe portal renders module titles inconsistently across pages. The Admin Inventory Overview uses a dark navy title bar with bold white text, but the student modules (Dashboard, Profile, Feedback, Returns, Announcements) still use plain colored headings inside white cards, and the admin "Uniform Request Management" page places its title in a white sub-header. This makes the interface feel unpolished and inconsistent.

## What Changes

- Standardize every module/page title directly below the main header into a single reusable title-bar design using the existing "Inventory Overview" as the reference.
- The bar is a full-width dark navy (`#152c69`) header with rounded top corners, white bold left-aligned title text, vertically centered, spanning the content width, with consistent spacing above (below main header) and below (above content).
- Apply the bar to all listed pages/modules:
  - Admin / Super Admin: Dashboard, Admin Account Management, Inventory Management / Inventory Overview, Return Management, Transaction Management, Announcement Management, Feedback Management (all already inside `.admin-section` cards; standardized via shared CSS) and the standalone `admin-requests.html` "Uniform Request Management" title (currently in a white sub-header).
  - Student: Dashboard, User Profile, Request (Registration Workflow), Announcements, Feedback, Returns.
- Add a shared CSS rule that renders the title bar, and apply the corresponding title markup in each page; for student pages the bar replaces the in-panel panel-titles/eyebrows.
- No colors, fonts, weights, sizes, padding, radius, or spacing beyond the existing Inventory Overview reference are introduced.

## Capabilities

### New Capabilities
- `module-title-bars`: Defines the single consistent title-bar (navy bar, rounded top corners, white bold text, spacing) used for every module/page title below the main header, and the requirement that all module pages comply with it.

### Modified Capabilities
<!-- No existing capabilities in openspec/specs. -->

## Impact

- Front-end only: static HTML pages under `public/` (`admin.html`, `admin-feedback.html`, `admin-returns.html`, `admin-requests.html`, `inventory.html`, `dashboard.html`, `profile.html`, `announcement.html`, `feedback.html`, `returns.html`, `schedule.html` as applicable) and shared CSS (`public/css/admin.css`, plus the page `theme.css`/`dashboard.css` files).
- No server API, route, data, permission, or behavior changes. No title text is renamed or reordered; existing section headings remain the module titles.
- Risk is low: markup changes are limited to title containers; CSS is additive/overrides existing selectors.