## 1. Main content structure and vertical rhythm

- [x] 1.1 In `public/profile.html`, keep the `.module-title-bar` "User Profile" directly below the header with `mb-6` spacing and confirm it spans the main-area width with the existing `px-4 md:px-7 pt-5` inner padding
- [x] 1.2 Apply 20–24px vertical rhythm between the title bar and each card (e.g., `mb-6` on the title bar and between non-last cards) so "Your Student Details", "Registration Details", and "Edit Your Profile" cards stack with even spacing
- [x] 1.3 Move the "Edit Your Profile" heading inside its `#edit-profile` card as `h2.student-panel-heading` (removing the standalone `module-title-bar` above it) so all three cards share the identical internal dark-blue section-header style

## 2. Your Student Details card

- [x] 2.1 Set the card container to a two-column landscape grid: `grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2`
- [x] 2.2 Order the boxes so the left column reads Student Name, Email, Year Level, Registration Status and the right column reads Student ID, Program/Course, Contact Number; remove `md:col-span-2` from Registration Status so it sits in the left cell of the last row
- [x] 2.3 Adjust `.student-info-pill` to `align-items: center` so box content is vertically centered; confirm grid stretch makes all boxes in a row equal height with even row/column spacing and no touching borders

## 3. Registration Details card

- [x] 3.1 Set the card container to a two-column landscape grid: `grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2`
- [x] 3.2 Order the boxes so the left column reads Status, Module, Books and the right column reads Course, Uniform Type, Pickup Day
- [x] 3.3 Confirm equal-width columns, equal-height boxes, consistent padding, and clear visual separation from the Student Details card (gap from task 1.2)

## 4. Edit Your Profile landscape form

- [x] 4.1 Convert `#editProfileForm` from `grid gap-4` to `grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2`
- [x] 4.2 Wrap each field in its own cell with a `<label>` above the `<input>` (Full Name → `editName`, Email Address → `editEmail`, Old Password → `oldPassword`, New Password → `newPassword`, Confirm New Password → `confirmNewPassword`) using `for` attributes; keep labels out of the inputs
- [x] 4.3 Arrange fields as row 1 (Full Name, Email Address), row 2 (Old Password, New Password), row 3 (Confirm New Password) with the right cell of row 3 empty
- [x] 4.4 Confirm password inputs keep their IDs and functional classes so `show-password.js` still wraps them and keeps the eye icons inside the inputs; verify all inputs share equal height, `w-full` width, and consistent border radius

## 5. Action buttons and Cancel behavior

- [x] 5.1 Change the submit button text from "Update Profile" to "Save Changes", keep `type="submit"` and the primary dark-blue rounded-xl styling
- [x] 5.2 Add a secondary outlined "Cancel" button (`type="button"`) beside Save Changes in a `mt-6 flex flex-wrap items-center gap-3` row so both stay left-aligned, unstretched, with spacing between them
- [x] 5.3 Wire Cancel in `public/js/profile.js` to reset `editName`/`editEmail` to the loaded user's saved `name`/`email` and clear the three password fields (no submit, no navigation)

## 6. Verification

- [x] 6.1 Run `node --check` on `public/js/profile.js`
- [x] 6.2 Grep `public/profile.html` to confirm no stray `module-title-bar` above the Edit card and all expected labels/ids are present
- [x] 6.3 Run `npm test` and confirm no new failures beyond the pre-existing `tests/admin-filters.test.js` `blob.text is not a function` failures
- [ ] 6.4 Browser smoke test (manual): desktop shows title bar → Student Details (left: Name/Email/Year/Status, right: ID/Program/Course/Contact) → Registration Details (left: Status/Module/Books, right: Course/Uniform/Pickup) → Edit (2-col form, labels above, eye icons inside, Save Changes + Cancel left-aligned) with no header overlap, no horizontal scroll, and one-column stacking on a small screen