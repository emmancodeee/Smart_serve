## ADDED Requirements

### Requirement: User Profile landscape layout
The Student User Profile page SHALL render as a landscape layout on desktop that uses the full available width of the main content area, preserving the existing fixed left sidebar, top header, color palette, typography, icons, and all existing student information.

#### Scenario: Desktop layout
- **WHEN** a student views the User Profile page on a desktop browser
- **THEN** the main content spans the full main-area width with 24–32px outer padding and the page reads as a professional wide dashboard rather than a narrow portrait form

#### Scenario: No overlap with fixed header
- **WHEN** a student opens the User Profile page
- **THEN** no main content appears underneath the fixed header and no section header overlaps another section

### Requirement: User Profile title bar
The "User Profile" blue rounded title bar SHALL sit directly below the top header, span the full width of the main content area, have rounded corners, proper horizontal padding and vertical spacing, and keep the existing navy/blue styling.

#### Scenario: Title bar placement
- **WHEN** a student opens the User Profile page
- **THEN** the "User Profile" title bar appears at the top of the main content directly below the header with no overlap

### Requirement: Your Student Details card
The "Your Student Details" card SHALL be one large white rounded card with a dark-blue section header. Below the header it SHALL render a two-column landscape grid of individual white/light bordered text boxes. Left column: Student Name, Email, Year Level, Registration Status. Right column: Student ID, Program/Course, Contact Number.

#### Scenario: Fields are displayed in a two-column grid
- **WHEN** a student views "Your Student Details" on a desktop browser
- **THEN** left-column boxes show Student Name, Email, Year Level, and Registration Status, and right-column boxes show Student ID, Program/Course, and Contact Number

#### Scenario: Contact Number placeholder
- **WHEN** the student's account has no contact number on file
- **THEN** the Contact Number box shows "Not on file"

#### Scenario: Uniform boxes and spacing
- **WHEN** the "Your Student Details" grid is rendered
- **THEN** all boxes have equal height, equal row and column spacing, matching border radius and subtle borders, sufficient internal padding, bold labels, normal-weight values, and no text touching the borders or other boxes

### Requirement: Registration Details card
The "Registration Details" card SHALL be a separate white rounded card below "Your Student Details" with the same dark-blue section-header style. It SHALL render a two-column grid with left-column boxes Status, Module, Books and right-column boxes Course, Uniform Type, Pickup Day, using equal-width columns, equal-height boxes, consistent spacing and padding, and clear visual separation from the Student Details card.

#### Scenario: Fields are displayed
- **WHEN** a student views "Registration Details" on a desktop browser
- **THEN** Status, Module, and Books display in the left column and Course, Uniform Type, and Pickup Day display in the right column

#### Scenario: Clean two-column alignment
- **WHEN** the "Registration Details" grid is rendered
- **THEN** both columns have equal width, boxes in each row align across the columns, spacing is consistent, and there is no unnecessary empty vertical space

### Requirement: Edit Your Profile landscape form
The "Edit Your Profile" card SHALL be a white rounded card below "Registration Details" with the same section-header style. The form SHALL use a landscape two-column layout: Row 1 Full Name (left) and Email Address (right); Row 2 Old Password (left) and New Password (right); Row 3 Confirm New Password (left) with the right cell left empty unless an existing field belongs there. Labels SHALL appear above their fields, not inside them; inputs SHALL be equal height and aligned; password visibility eye icons SHALL remain inside the input boxes; the existing form functionality SHALL be preserved.

#### Scenario: Two-column form rows
- **WHEN** a student views "Edit Your Profile" on a desktop browser
- **THEN** Full Name and Email Address appear in row 1, Old Password and New Password in row 2, and Confirm New Password in row 3 with an empty right cell

#### Scenario: Labels, inputs, and eye icons
- **WHEN** the edit form is rendered
- **THEN** every field has its label above the input, all inputs have equal height and consistent border styling, and the password fields keep their visibility eye icons inside the inputs

### Requirement: Form action buttons
The "Save Changes" (primary dark-blue) and "Cancel" (secondary outlined) buttons SHALL sit below the form aligned to the left, keep the existing button styling, not stretch across the full page, have spacing between them, and have a clear top margin from the last input row.

#### Scenario: Buttons render left-aligned
- **WHEN** a student views the bottom of the edit form
- **THEN** "Save Changes" and "Cancel" buttons appear on the left below the form with spacing between them and proper top margin

#### Scenario: Cancel resets the form
- **WHEN** a student clicks "Cancel"
- **THEN** the form fields reset to the student's saved values and no changes are submitted

### Requirement: Responsive column behavior
The profile grids SHALL use two columns on desktop and tablet widths where space allows and SHALL stack into a single column on small screens, without breaking the existing sidebar or header.

#### Scenario: Two columns on desktop
- **WHEN** the viewport has desktop width
- **THEN** the Student Details, Registration Details, and Edit Profile layouts render in two columns

#### Scenario: Single column on small screens
- **WHEN** the viewport has small-screen width
- **THEN** the layouts stack into a single column with no overlap and no horizontal scroll