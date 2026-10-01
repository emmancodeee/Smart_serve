## Why

The student User Profile page (`public/profile.html`) currently shows a blue title bar labeled "User Profile" and, directly below it inside the content, a second heading "Registration Details". The blue title bar should carry the ACTUAL page content title, not the sidebar/module name, so the page currently has a misleading and duplicated title hierarchy (module name as page title + real content title underneath).

## What Changes

- Change the blue title bar text on the student User Profile page from "User Profile" to "Registration Details".
- Remove the in-panel heading "Registration Details" so exactly ONE "Registration Details" heading remains (inside the blue title bar).
- Do NOT introduce any new "User Profile" title in the main content; "User Profile" remains only as the sidebar/navigation label.
- Keep the registration information cards, their two-column layout, and all values unchanged (Status, Course, Module, Uniform Type, Books, Pickup Day).
- Keep the "Edit Your Profile" section and its fields (Name, Email, current/new/confirm password with eye toggles) and the Update Profile button unchanged; only improve spacing/alignment if needed.
- Title bar continues to match the Admin/Super Admin style: dark navy, rounded top corners, white bold vertically-centered left-aligned text, full content-container width, small consistent gap below the main header, comfortable left padding.

## Capabilities

### New Capabilities
- `student-profile-title-header`: Defines the correct title hierarchy for the student User Profile page — a single blue title bar carrying "Registration Details" below the main header, no "User Profile" page title, and no duplicated "Registration Details" heading.

### Modified Capabilities
<!-- No existing specs in openspec/specs. -->

## Impact

- Front-end only, single page: `public/profile.html` (title bar markup and removal of the duplicate in-panel heading, plus spacing alignment). Possibly `public/profile.js` only if any element reference is affected (none expected).
- No change to functionality, data, API calls, routes, authentication, password logic, sidebar, backend, or any other page.
- Risk is low: one title bar text change, one heading removal, spacing-only tweaks.