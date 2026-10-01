## 1. Shared title-bar style

- [x] 1.1 Add CSS custom properties for the module title bar to `public/css/admin.css` `:root` (background `#152c69`, white bold text, font size `1.08rem`, letter-spacing `0.03em`, padding `18px 24px`, radius `28px 28px 0 0`) as the single source of truth
- [x] 1.2 Refactor `.admin-page .admin-section h2` (admin.css ~2036–2048) to consume the new tokens, keeping the Inventory Overview reference rendering byte-identical
- [x] 1.3 Add a reusable `.module-title-bar` rule (full-width block, flex, align-items center, negative margins to bleed to container edges where appropriate, same tokens as the reference)
- [x] 1.4 Verify `admin.html` sections, `admin-feedback.html`, `admin-returns.html`, and `inventory.html` still render the identical navy bar after the refactor

## 2. Student module title bars

- [x] 2.1 `dashboard.html` — add a "Dashboard" title bar as the first element of the main content container below the header; confirm the "Request"/Registration Workflow surface's module title follows the standard bar
- [x] 2.2 `profile.html` — add a "User Profile" title bar below the header; remove the module-level "Registration Details"/"Edit Your Profile" eyebrow-and-title pair if it acts as the module title (keep card subtitles otherwise)
- [x] 2.3 `announcement.html` — add an "Announcements" title bar below the header
- [x] 2.4 `feedback.html` — add a "Feedback" title bar below the header; replace the "Feedback Management"/"Submit Feedback" panel title with the bar
- [x] 2.5 `returns.html` — add a "Returns" title bar below the header; replace the "Return Management"/"Submit Return Request" panel title with the bar
- [x] 2.6 Ensure on every student page the bar sits directly below the main header, spans the module content width, and no panels/tables/filters touch the bar
- [x] 2.7 Verify student pages still load their data and behavior unchanged (no JS/title-text references broken)

## 3. Admin request management page

- [x] 3.1 Check whether `admin-requests.js`/`admin.js` reference `.admin-header-white` or `.header-title` before editing; confirm removal is safe
- [x] 3.2 `admin-requests.html` — render the module title ("Uniform Request Management") as the standard title bar as the first element of the main container
- [x] 3.3 Remove the now-redundant title from the white sub-header (`admin-header-white`/`header-title`), keeping it only if it carries navigation/controls; verify no layout breakage

## 4. Consistency verification

- [x] 4.1 Confirm ALL listed admin modules (Dashboard, Admin Account Management, Inventory Management/Overview, Return Management, Transaction Management, Announcement Management, Feedback Management) show the identical navy title bar
- [x] 4.2 Confirm ALL listed student modules (Dashboard, User Profile, Request, Announcements, Feedback, Returns) show the identical navy title bar below the main header
- [x] 4.3 Verify the title text is white, bold, vertically centered, left-padded, and never overlaps the header or content
- [x] 4.4 Validate responsive behavior on desktop, laptop, tablet, and mobile: bar aligned, long titles ("Admin Account Management", "Feedback Management") readable, padding preserved
- [x] 4.5 Grep pages to confirm no new title variants were introduced and no module functionality/data/routes were modified

## 5. Student title-box correction (sidebar name != extra title)

- [x] 5.1 `feedback.html` — set the title box text to the existing page title "Submit Feedback" and remove the duplicated in-card "Submit Feedback" heading
- [x] 5.2 `returns.html` — set the title box text to the existing page title "Submit Return Request" and remove the duplicated in-card "Submit Return Request" heading
- [x] 5.3 Confirm `dashboard.html` ("Dashboard"), `profile.html` ("User Profile"), and `announcement.html` ("Announcements") title boxes hold the existing page titles with no duplicate heading, and the Request/Registration Workflow surface keeps "Registration Workflow" in its navy strip
- [x] 5.4 Verify every student route renders exactly ONE title box, no sidebar/module name appears as a standalone extra title, and no page requires the Admin/Super Admin pages, header, sidebar, routes, or functionality