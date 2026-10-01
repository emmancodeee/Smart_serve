## ADDED Requirements

### Requirement: User Profile page title
The User Profile page SHALL display "User Profile" as its main page title. The rest of the page styling — navy-blue title/header, white background, blue and yellow accents, rounded containers, typography, and spacing — SHALL remain unchanged from the existing profile design.

#### Scenario: Page title
- **WHEN** a student opens the User Profile page
- **THEN** the main page title reads "User Profile"

### Requirement: Your Student Details section
The User Profile page SHALL include a "Your Student Details" section that displays, at minimum, the fields: Student Name, Student ID, Email, Program/Course, Year Level, Contact Number, and Registration Status. The section SHALL populate these fields from the student's existing account data.

#### Scenario: Fields are displayed
- **WHEN** a student opens the User Profile page
- **THEN** the "Your Student Details" section shows Student Name, Student ID, Email, Program/Course, Year Level, Contact Number, and Registration Status filled from the student's account

#### Scenario: Contact Number placeholder
- **WHEN** the student's account has no contact number on file
- **THEN** the Contact Number field shows "Not on file" as a placeholder

### Requirement: Responsive details grid
The "Your Student Details" section SHALL render as a two-column grid on desktop with Student Name, Student ID, Email, Program/Course, Year Level, Contact Number, and Registration Status aligned cleanly, and SHALL stack into a single column on mobile with no overlap and no horizontal scroll.

#### Scenario: Desktop layout
- **WHEN** a student views the User Profile page at desktop width
- **THEN** the "Your Student Details" fields are laid out in two columns with consistent alignment and spacing

#### Scenario: Mobile layout
- **WHEN** a student views the User Profile page at mobile width
- **THEN** the "Your Student Details" fields stack vertically with no overlap and no horizontal scroll

### Requirement: Existing profile sections preserved
The existing Registration Details panel and the Edit Your Profile form on the User Profile page SHALL remain present and fully functional.

#### Scenario: Registration Details and edit form still work
- **WHEN** a student opens the User Profile page
- **THEN** the Registration Details panel and the Edit Your Profile form are still shown and functional