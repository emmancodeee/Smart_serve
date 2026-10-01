# student-feedback-page

## ADDED Requirements

### Requirement: Submit Feedback card
The student Feedback page SHALL present the feedback form inside a large white rounded card with a blue header band. The header SHALL show the bold white left-aligned text "Submit Feedback". The card SHALL fit within the existing student navigation shell (sidebar, topbar, light background) and MUST NOT alter the page shell.

#### Scenario: Submit Feedback card renders with blue header
- **WHEN** a student opens the Feedback page
- **THEN** the page displays a white rounded card whose top is a blue header band containing bold white left-aligned text "Submit Feedback", followed by the existing feedback form

#### Scenario: Page shell unchanged
- **WHEN** the Feedback page renders
- **THEN** the existing sidebar, topbar, and page title styling remain intact and the Feedback item is highlighted in the sidebar

### Requirement: My Feedback card
The student Feedback page SHALL show a second white rounded card, placed directly below the Submit Feedback card, with a matching blue header band containing the bold white text "My Feedback". It SHALL contain the existing feedback history table.

#### Scenario: My Feedback card placed below the form card
- **WHEN** a student views the Feedback page
- **THEN** a second white rounded card with a blue "My Feedback" header appears directly below the Submit Feedback card

#### Scenario: Card widths align
- **WHEN** both cards are rendered
- **THEN** the Submit Feedback card and the My Feedback card have the same width and the same left/right margins

### Requirement: Rounded form controls
All existing form controls on the Feedback page — the Category select, Subject input, Detailed Feedback textarea, and Priority select — SHALL have rounded corners of approximately 8 to 12 pixels, a thin light-blue/gray border, a white background, and comfortable internal padding. All fields SHALL share the same width and align flush with the same left and right edges. The Detailed Feedback textarea SHALL be taller than the other fields. No control SHALL overflow the card.

#### Scenario: All inputs use rounded corners and consistent width
- **WHEN** the feedback form is rendered
- **THEN** every select, input, and textarea displays rounded corners within the 8–12px range, a thin light-blue/gray border, white background, and identical left and right alignment matching the card padding

#### Scenario: Textarea is taller than other fields
- **WHEN** the feedback form is rendered
- **THEN** the Detailed Feedback textarea is visibly taller than the Subject input and the two selects

### Requirement: Form labels
Each form label SHALL be dark navy blue, use a medium/bold font weight, appear directly above its field, and keep consistent spacing between label and field. Required-field asterisks SHALL remain red.

#### Scenario: Labels render above fields with required markers
- **WHEN** a student views the feedback form
- **THEN** each field is labeled directly above with dark navy medium/bold text, and the required fields (Category, Subject, Detailed Feedback) display a red asterisk after the label

### Requirement: Rating selector
The feedback form SHALL preserve the existing 1–5 rating functionality, rendered as five horizontal small rounded rectangular buttons labeled 1 through 5, along with the hint text "1 = Poor, 5 = Excellent".

#### Scenario: Rating buttons render horizontally
- **WHEN** a student views the rating section of the form
- **THEN** the numbers 1, 2, 3, 4, and 5 appear horizontally as small rounded rectangles and the hint "1 = Poor, 5 = Excellent" is shown below them

#### Scenario: Rating selection still submits
- **WHEN** a student selects a rating and submits the form
- **THEN** the selected rating value is submitted with the existing rating functionality

### Requirement: Priority select
The existing Priority dropdown SHALL remain functional and SHALL use the same width, border, rounded corners, and styling as the other feedback form fields.

#### Scenario: Priority select matches other fields
- **WHEN** a student views the Priority control
- **THEN** it appears at the same width and with the same rounded corners and border style as the other form fields, and still exposes the existing Low/Medium/High/Urgent options with Medium selected by default

### Requirement: Submit button
The Submit Feedback button SHALL be full width inside the form, use a blue background with bold white text, and have rounded corners. Its click/submit behavior SHALL remain the existing submit flow.

#### Scenario: Full-width blue submit button
- **WHEN** a student views the feedback form
- **THEN** the Submit Feedback button spans the full width of the form, has a blue background, bold white text, rounded corners, and submits the feedback through the existing handler

### Requirement: History table
The My Feedback table SHALL retain its six columns (Subject, Category, Status, Rating, Date, Actions) with aligned columns, a very light blue header row, equal column spacing, and clean responsive behavior. When there is no feedback, the table SHALL show the centered text "No feedback submitted yet".

#### Scenario: Table renders with aligned columns and light blue header
- **WHEN** a student has submitted feedback and views the My Feedback card
- **THEN** the table shows the Subject, Category, Status, Rating, Date, and Actions columns with a very light blue header row, equal spacing, and existing row content

#### Scenario: Empty feedback history
- **WHEN** the student has no submitted feedback
- **THEN** the table shows the centered message "No feedback submitted yet" in place of rows

### Requirement: Responsive and aligned layout
The Feedback page SHALL remain responsive on desktop, laptop, tablet, and mobile widths with no horizontal overflow, no cut-off content, no overlapping elements, and consistent vertical spacing between the two cards.

#### Scenario: Cards and form align across breakpoints
- **WHEN** the Feedback page is viewed on desktop, laptop, tablet, or mobile widths
- **THEN** both cards remain the same width and aligned, the form fields stay inside the card, and no content is cut off or overlapping

### Requirement: Existing functionality unchanged
The restyle MUST NOT change the backend logic, database logic, API calls, routes, validation, form field names, or any existing feedback functionality (create, edit, delete, view, modal, history loading, realtime header).

#### Scenario: All feedback actions still work
- **WHEN** a student submits, edits, deletes, or views feedback from the restyled page
- **THEN** the existing backend endpoints and behaviors work exactly as before with no field-name or API changes