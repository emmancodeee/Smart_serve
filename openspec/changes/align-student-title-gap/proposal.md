# Align Student Title Gap

## Why

The vertical rhythm around the student page-title box (`.module-title-bar`) is uneven. Announcements and User Profile put `mb-5` on their title box **and** `theme.css` forces `margin-top: 20px` on the block that follows it, producing **40px** below the title, while Dashboard, Feedback, and Returns sit at 20px. The Admin reference uses a clean, symmetric `mt-5 mb-5` (20px each side), so the student pages read as imbalanced and the title can appear to hug the header.

## What Changes

- Normalize the spacing around the student page-title box to a consistent **20px above and 20px below** on all six student pages, matching the Admin/Superadmin `mt-5 mb-5` rhythm.
- The gap between the sticky header and the blue title box becomes exactly the Admin value (20px). Correction found during implementation: the containers declare `pt-5` but the shipped `tailwind.css` has no `.pt-5` rule, so the 20px must be pinned on the title box itself (`margin-top: 1.25rem`), guaranteeing it never touches, overlaps, or collapses against the header.
- The gap below the title becomes exactly 20px on every module (removing the 40px doubling on Announcements and User Profile).
- Keep top, left, right, and bottom spacing consistent: title stays full-width in the content column (page `px` padding), flush with the main content edges.
- NO changes to the title box styling (size, color, radius, text), the main header (Welcome, clock, profile, bell, menu), the sidebar, labels, routing, or any functionality.
- `schedule.html`, Admin, and Superadmin pages are untouched.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `student-sidebar-design`: an **ADDED** requirement "Module title spacing" pins the 20px top gap under the header and the 20px bottom gap above content around the student `.module-title-bar`, matching the Admin/Superadmin `mt-5 mb-5` values, uniformly on all six student modules.

## Impact

- `public/css/theme.css` — module-title spacing rules: uniform `margin` on the student `.module-title-bar` (20px above via existing container `pt-5` and below via a pinned `margin-bottom`), replacing the current double-spaced below-title rule on Announcements/Profile.
- Six student pages render a clean, consistent, Admin-matching gap around their title box.
- No HTML or JS changes; sidebar, header, title styling, schedule/html, Admin, and Superadmin pages unchanged.