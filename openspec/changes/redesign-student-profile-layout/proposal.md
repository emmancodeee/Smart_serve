## Why

The Student User Profile page currently renders as a narrow, portrait-style stack: a page title, a "Your Student Details" panel, the full "Registration Details" information grid, and a stacked single-column "Edit Your Profile" form. On wide desktop screens the content wastes horizontal space, several panels render information in a cramped one-column strip with uneven boxes and excessive blank space, and the edit form's problem fields stretch full-width. The page should read as a clean, professional landscape dashboard that uses the available desktop width efficiently while keeping the existing Smart Serve design and functionality untouched.

## What Changes

- Convert the User Profile main content to a landscape layout that uses the full available main-area width below the fixed header.
- Keep the existing page title bar, retitled "User Profile" (already in place), positioned directly below the top header with proper padding.
- Present "Your Student Details" as one large white rounded card with a dark-blue section header and a two-column landscape grid of equal-height, equally-spaced bordered boxes (Student Name, Email, Year Level, Registration Status on the left; Student ID, Program/Course, Contact Number on the right; Contact Number shows "Not on file").
- Present "Registration Details" as a separate white rounded card with the same section-header style and its own two-column grid (Status, Module, Books on the left; Course, Uniform Type, Pickup Day on the right).
- Convert the "Edit Your Profile" form to a landscape two-column layout (Full Name + Email Address row, Old Password + New Password row, Confirm New Password row with an empty right cell), keeping labels above fields, equal-height aligned inputs, and the existing password visibility eye icons inside the inputs.
- Replace the single full-width submit button with left-aligned "Save Changes" (primary dark-blue) and "Cancel" (secondary outlined) buttons with proper spacing and top margin.
- Fix alignment/spacing problems: no content under the fixed header, no overlapping section headers, no touching info boxes, no uneven column widths, no excessive blank space, vertically centered text, no horizontal scroll on desktop.
- Responsive behavior: two columns on desktop/tablet (when width allows), one column on small screens; sidebar and header remain unchanged.

## Capabilities

### New Capabilities
- `student-profile-layout`: Layout and presentation of the Student User Profile page as a landscape two-column design — page title bar placement, "Your Student Details" card, "Registration Details" card, "Edit Your Profile" two-column form with left-aligned action buttons, and responsive stacking behavior.

### Modified Capabilities
- (none)

## Impact

- `public/profile.html` — restructure main content area: title bar spacing, three cards (Student Details, Registration Details, Edit Profile), two-column grids, aligned inputs, left-aligned action buttons.
- `public/js/profile.js` — update submit button label/handler text if needed ("Update Profile" → "Save Changes"), add Cancel behavior (reset form to saved values). No data/endpoint changes.
- `public/css/theme.css` — only if a shared rule needs adjusting for the profile layout (prefer page-local styles already inline in `profile.html`).
- No backend, routes, controllers, services, or models change. No sidebar/header/color/font changes. No new page. No data fields added (Contact Number remains "Not on file").