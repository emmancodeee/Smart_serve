## ADDED Requirements

### Requirement: Overall page structure
The Student Feedback page SHALL render its content inside the existing main content area beside the Student sidebar and below the existing top header, using rounded white containers with subtle borders and shadows and the existing Smart Serve navy blue / blue / white / yellow palette. Content SHALL be separated from the sidebar and browser edges by consistent horizontal and vertical spacing. No unrelated colors SHALL be introduced.

#### Scenario: Feedback page renders cleanly
- **WHEN** a student opens the Feedback page
- **THEN** the content appears inside the main area with consistent padding, rounded white cards, and only Smart Serve palette colors

#### Scenario: Sidebar and header unchanged
- **WHEN** the Feedback page renders
- **THEN** the blue sidebar, Smart Serve logo, nav items (Dashboard, User Profile, Request, Announcements, Feedback, Returns), active Feedback state, and the top header (welcome, clock, avatar/name/role, bell, menu) are unchanged

### Requirement: Submit Feedback card header
The Submit Feedback form SHALL live in one large rounded white card whose top carries a full-width dark navy blue title bar ("Submit Feedback") with bold white text and rounded top corners. This SHALL be the only "Submit Feedback" heading on the page; no duplicate "Feedback" or "Submit Feedback" title shall appear above the card.

#### Scenario: Card header renders once
- **WHEN** a student views the Submit Feedback card
- **THEN** the card shows a full-width dark navy header reading "Submit Feedback" in bold white text with rounded top corners
- **AND** no duplicate "Submit Feedback" or "Feedback" page-level title appears above the card

### Requirement: Two-column submit form layout
The submit form SHALL use a responsive grid rather than a single stacked column. On desktop: Row 1 places "Category *" (select, placeholder "Select Category") and "Subject *" (text input, placeholder "Brief subject of your feedback") side by side. Row 2 places "Detailed Feedback *" (textarea placeholder "Please provide detailed feedback...", approximately 110–140px tall) in a wider left section and the "Rating (1-5)" and "Priority *" controls stacked in a right section. On tablet/mobile the grid SHALL collapse to one column with full-width fields.

#### Scenario: Desktop two-column layout
- **WHEN** a desktop-width student viewport renders the form
- **THEN** Category and Subject share a row, and Detailed Feedback and the Rating/Priority section share a row with the textarea wider than the right controls

#### Scenario: Tablet/mobile single-column layout
- **WHEN** a tablet or mobile viewport renders the form
- **THEN** all fields collapse to a single full-width column

### Requirement: Rating and priority controls
Rating SHALL render as five compact, equal-size square/rounded buttons labeled 1–5 in a horizontal row, with a selected rating using the dark navy active style and unselected buttons using white/light styling with a subtle blue border, and helper text "1 = Poor, 5 = Excellent" directly below. Priority SHALL render as a full-width plain select (no excess height), aligned with the rating section.

#### Scenario: Rating buttons render compactly
- **WHEN** a student views the Rating control
- **THEN** five equal-size compact buttons 1–5 are shown in one horizontal row with the helper text below, dark navy highlighting the selected rating and blue-bordered white styling for unselected ratings

#### Scenario: Priority select is compact and aligned
- **WHEN** a student views the Priority control
- **THEN** it is a normal-height full-width select aligned with the rating section

### Requirement: Form action buttons
The Submit Feedback card SHALL place two buttons below the form fields on the SAME horizontal row, not full-width and not stacked: "Submit Feedback" (dark navy background, white bold text, rounded corners) and "Cancel" (white background, dark navy text, thin light-blue border, rounded corners), with reasonable spacing between them.

#### Scenario: Buttons sit side by side
- **WHEN** a student reaches the bottom of the form
- **THEN** "Submit Feedback" and "Cancel" appear side by side on one row, compact width, with spacing between them

### Requirement: My Feedback card and table
Below the Submit Feedback card, a separate rounded white card SHALL have the same full-width dark navy header reading "My Feedback" (bold white text, same height/style as the Submit Feedback header). Inside, the feedback table SHALL show columns Subject, Category, Status, Rating, Date, Actions with uppercase small bold column headings, a light blue table header, white/light rows, subtle borders, vertically centered content, and no excess height when few records exist.

#### Scenario: My Feedback card renders
- **WHEN** the feedback history card is displayed
- **THEN** it shows the "My Feedback" navy header and a table with the six columns Subject, Category, Status, Rating, Date, Actions in crisp light-blue-header styling with centered vertically aligned cells

### Requirement: Editing actions in the table
The Actions column SHALL contain exactly two compact equal-height buttons per row, horizontally aligned and centered: "Edit" (white/light background, yellow/gold accent, dark/yellow text) and "Delete" (white background, red border, red text). No View/Details/Open or other actions SHALL be added.

#### Scenario: Only Edit and Delete actions
- **WHEN** a feedback row's actions are inspected
- **THEN** only compact "Edit" and "Delete" buttons appear, equal in height, spaced apart, vertically centered

### Requirement: Spacing and alignment
Spacing SHALL be tightened: approximately 24–32px between major cards, 16–20px between form fields, 8–10px between labels and their inputs, and 12–16px between buttons. Labels SHALL NOT overlap inputs, text SHALL NOT touch borders, buttons SHALL NOT touch each other, table content SHALL NOT touch card edges, and the Submit Feedback card SHALL contain the complete form without excessive empty space.

#### Scenario: Compact consistent spacing
- **WHEN** the Feedback page renders after the change
- **THEN** cards, fields, labels, and buttons follow the specified spacing ranges with no overlaps, no text touching borders, and no excessive empty vertical space

### Requirement: Functionality preserved
The redesign SHALL NOT alter category selection, subject input, detailed feedback textarea, rating selection, priority selection, Submit Feedback, Cancel, Edit, Delete, existing feedback records, statuses, or the supporting API/database behavior. All existing ids/names/attributes referenced by `public/js/feedback.js` SHALL remain functional.

#### Scenario: Submit and manage feedback unchanged
- **WHEN** a student submits, cancels, edits, or deletes feedback and reloads history
- **THEN** every flow works exactly as before with the same fields, records, statuses, and API/database behavior