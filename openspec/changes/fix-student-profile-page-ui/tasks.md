## 1. Title hierarchy fix (`public/profile.html`)

- [x] 1.1 Change the blue title bar text from "User Profile" to "Registration Details" (`<div class="module-title-bar mb-5">Registration Details</div>`).
- [x] 1.2 Remove the in-panel duplicate heading `<h2>Registration Details</h2>` inside the first `student-panel` so exactly one "Registration Details" heading remains (in the blue title bar).
- [x] 1.3 Confirm no "User Profile" heading exists anywhere in the main content; "User Profile" remains only as the sidebar navigation label.

## 2. Registration information preserved

- [x] 2.1 Verify the registration information cards render directly below the blue title bar with all six fields (Status, Course, Module, Uniform Type, Books, Pickup Day) and their values unchanged.
- [x] 2.2 Verify the two-column grid layout on desktop and single-column on small screens; verify the cards do not overlap or clip the title bar.

## 3. Edit Your Profile section unchanged

- [x] 3.1 Keep the "Edit Your Profile" section below the registration details with its heading, Name, Email, and the three password fields with eye toggles, and the Update Profile button unchanged.
- [x] 3.2 Adjust spacing/alignment only if needed so the section sits cleanly below the registration cards.

## 4. Spacing and layout

- [x] 4.1 Verify the title bar is full-width within the content container with left/right margins matching the page container, comfortable left padding, and a consistent small gap below the main header.
- [x] 4.2 Verify consistent spacing between the title bar and the registration cards, with no overlap, clipping, or excessive blank space; make responsive-friendly minimal adjustments only.

## 5. Verification (no regressions)

- [x] 5.1 Load the student User Profile page and confirm exactly ONE "Registration Details" heading (inside the blue title bar) and no "User Profile" page title in the main content.
- [x] 5.2 Confirm no change to functionality, data, API calls, routes, authentication, password logic, sidebar labels/active state, or any other page.