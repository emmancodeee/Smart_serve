# Align Profile Title Boxes

## Why

On the Student User Profile page, "Registration Details" is a full-width dark-navy rounded title box (`.module-title-bar`, the Admin/Superadmin design), but "Edit Your Profile" is a plain navy `<h2>` inside the white card — a fundamentally different heading treatment. The two sections don't look like parts of the same design system, breaking the visual hierarchy and consistency that the Admin/Superadmin pages have.

## What Changes

- Put "Edit Your Profile" in the exact same full-width dark-navy rounded title box as "Registration Details" by converting the section's `<h2>` heading into a `.module-title-bar` sibling placed directly above the edit card — the identical class, so height, width, padding, font size, font weight, text alignment, border-radius, and color are identical by construction.
- Keep Registration Details as the first section and Edit Your Profile directly below it (unchanged order).
- Remove the old inline `#edit-profile { margin-top: 1.5rem }` compensation (it existed to push the heading down inside the panel); the shared 20px vertical rhythm rule in `theme.css` now owns the spacing above and below each title box, so the gap between the two sections and the gap under each blue box are uniform.
- Only `public/profile.html` changes (markup + its inline style). No JS, no functionality, no sidebar/header changes; existing info fields and profile form inputs are untouched.

## Requirements

- "Registration Details" stays the first section; "Edit Your Profile" stays directly below it.
- Both section headings are identical full-width dark-navy rounded blue title boxes with white bold text (same height, width, padding, font size/weight, alignment, radius, spacing).
- Clean, consistent, responsive spacing: no overlap, no duplicate/extra headings, existing fields and design of sidebar/header unchanged.
- Zero functionality change.