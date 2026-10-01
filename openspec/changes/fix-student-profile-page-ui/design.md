## Context

SmartServe is a vanilla static front-end (Tailwind + per-page `<style>` blocks plus `public/css/theme.css`) served by Express. The student User Profile page is `public/profile.html`. Its main content currently contains, directly below the header:

- Line 425: `<div class="module-title-bar mb-5">User Profile</div>` — the blue title bar carrying the sidebar/module name.
- Line 427: `<h2 class="mb-4 text-lg font-bold text-[#0b1f4d] md:text-xl">Registration Details</h2>` — the real content heading inside the first `student-panel`.

Below that are the registration info pills (`student-info-pill`) in a `grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5` two-column layout, followed by the `#edit-profile` section ("Edit Your Profile") with the profile form and password fields.

The shared `.module-title-bar` class in `public/css/theme.css` provides the Admin-matching navy bar (`#152c69`, radius `28px 28px 0 0`, bold white text, padding). The page wrapper uses `student-main-inner px-4 pb-8 pt-5 md:px-7` (not a grid), so the bar relies on its own `mb-5` spacing.

Constraint: no change to functionality, data, API calls, routes, authentication, password logic, sidebar, or other pages. This is a title-hierarchy and spacing fix on the User Profile page only.

## Goals / Non-Goals

**Goals:**
- Single blue title bar directly below the main header containing "Registration Details".
- Remove the duplicate in-panel "Registration Details" heading so exactly one remains.
- No "User Profile" heading in the main content; "User Profile" stays only as the sidebar label.
- Registration cards keep their exact values and two-column layout, spaced cleanly below the bar.
- "Edit Your Profile" section and password functionality unchanged (spacing polish only if needed).

**Non-Goals:**
- No functional, data, API, route, auth, or password changes.
- No changes to the sidebar, main header, or any other student/Admin page.
- No redesign of unrelated sections beyond minimal spacing alignment.

## Decisions

### Decision 1: Reuse `.module-title-bar` and change its text
The existing `.module-title-bar` element on the page stays in place; only its text changes from "User Profile" to "Registration Details". The duplicate in-panel `<h2>Registration Details</h2>` is removed.

- Why: reuses the Admin-matching design already in `theme.css` (navy, rounded top corners, bold white text, proper padding), minimal diff, and satisfies "single title bar carrying the content title".
- Alternative considered: add a new heading inside the panel and keep the bar as "User Profile" — rejected because it preserves the wrong hierarchy the request is fixing.

### Decision 2: Keep the registration values and layout exactly as-is
The `student-panel` wrapping the info pills stays, now directly below the title bar. The two-column grid (`md:grid-cols-2`), the pill styling, and all six field/value pairs remain untouched.

- Why: content/data must not change; only the title hierarchy and spacing around it.
- Alternative considered: restyling the pills as cards — rejected (out of scope, risks changing content presentation).

### Decision 3: Spacing via existing patterns
The page container already provides `pt-5` below the main header and the bar already has `mb-5`; the first panel's `p-6` provides interior padding. This yields a consistent gap above and below the bar matching the other student pages. Only if a spacing defect is observed should a minimal adjustment (e.g., keeping `mb-5` on the bar, aligning margins) be applied.

- Why: consistency with sibling student pages (Announcements uses the same `module-title-bar mb-5` pattern in the same container classes).
- Alternative considered: adding new margin utilities or wrapper elements — unnecessary complexity.

## Risks / Trade-offs

- [Risk] Removing the in-panel `<h2>` changes the semantic heading structure of the section. → Mitigation: the blue title bar becomes the single `h`-level title; the section still has clear visual separation. No JS references the removed `<h2>` (verified: `profile.js` reads only field/value elements).
- [Risk] The bar text change could be mistaken for the previous module-title-bar task. → Mitigation: this change is scoped strictly to `profile.html`'s title text and the duplicated heading removal plus any minimal spacing.
- [Risk] Spacing tweaks might affect responsive behavior. → Mitigation: use only existing spacing utilities (Tailwind margin classes) so behavior at small widths stays consistent with the rest of the site.
- [Risk] Stale browser cache showing old title. → Hard refresh during verification; no server change.

## Migration Plan

- Edit `public/profile.html`: change the `.module-title-bar` text to "Registration Details" and delete the in-panel `<h2>Registration Details</h2>`.
- Verify the registration values, two-column layout, "Edit Your Profile" fields, password eye toggles, and Update Profile button are unchanged.
- Optionally refine spacing between the bar and the first card panel (use existing margin utilities only).
- Rollback: restore the two markup lines; no data migration needed.

## Open Questions

- None blocking. Visual confirmation of spacing (bar-to-cards gap) happens during implementation verification.