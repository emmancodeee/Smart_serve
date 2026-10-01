# student-feedback-layout

## ADDED Requirements

### Requirement: Feedback form container spacing
The "Submit Feedback" form SHALL render inside a single white rounded card whose navy blue title bar reads "Submit Feedback" and whose inner content area provides comfortable, consistent padding so labels and fields never touch the card borders. The form container SHALL use inner padding of approximately 28–32px, a gap of approximately 8px between each label and its field, and a gap of approximately 20–24px between consecutive fields.

#### Scenario: Form content does not touch card edges
- **WHEN** the student Feedback page is rendered
- **THEN** the form body has approximately 28–32px padding on all sides and no label or input/select/textarea touches the card border

#### Scenario: Even vertical rhythm between fields
- **WHEN** consecutive form fields are inspected
- **THEN** each field-to-field gap is approximately 20–24px and each label-to-field gap is approximately 8px, producing a clean, evenly spaced form

### Requirement: Field order and alignment
The form SHALL present fields in this exact order: Category *, Subject *, Detailed Feedback *, Rating (1-5), Priority. Every field's label SHALL use the same font size, weight, and color, SHALL share the same left starting point, and be positioned directly above its field. Every input, select, and textarea SHALL have the same width (matching the left/right edges), consistent height, consistent rounded corners, and the existing border style. Textareas SHALL have enough height for comfortable typing without being unnecessarily tall.

#### Scenario: All fields line up vertically
- **WHEN** the form is rendered
- **THEN** Category, Subject, Detailed Feedback, Rating (1-5), and Priority appear in order, each with the label's left edge aligned to the same column as all other labels and each field's left/right edges aligned to the same column as all other fields

#### Scenario: Uniform field styling
- **WHEN** input, select, and textarea controls in the form are inspected
- **THEN** they share the same width, consistent heights, identical border style, and identical rounded corners, with the Detailed Feedback textarea the only taller control

### Requirement: Rating (1-5) section
The Rating (1-5) field SHALL render its five rating buttons in a single horizontal row with equal button width and height, equal spacing of approximately 8px between buttons, and a button size of approximately 44–48px wide and 44–48px tall. The rating buttons SHALL NOT stretch across the full form width. The selected rating SHALL be visually highlighted using the existing dark navy style. The helper text "1 = Poor, 5 = Excellent" SHALL appear directly below the rating buttons.

#### Scenario: Rating buttons are equal and compact
- **WHEN** the rating section is rendered
- **THEN** exactly five equal-size rating buttons sit in one row with approximately 8px gaps, each approximately 44–48px wide and tall, and they do not span the full form width

#### Scenario: Selected rating is highlighted in navy
- **WHEN** a student selects a rating
- **THEN** the selected button is highlighted with the dark navy background/white text treatment

#### Scenario: Rating helper text stays below buttons
- **WHEN** the rating section is rendered
- **THEN** the text "1 = Poor, 5 = Excellent" is shown directly beneath the rating buttons

### Requirement: Priority field alignment
The Priority label and select SHALL follow the same alignment as every other form field: the label SHALL sit directly above the select at the common left edge, the select SHALL be full width matching the other fields, and its height SHALL match the Category select height with consistent spacing above and below.

#### Scenario: Priority select matches other fields
- **WHEN** the Priority field is rendered
- **THEN** the Priority select is full width, the same height as the Category select, its label shares the common label left edge, and spacing above and below matches the other fields

### Requirement: Submit and Cancel button row
The form actions SHALL render as a normal action-button row, not full-width buttons. In create/submit mode the row SHALL show `[ Submit Feedback ] [ Cancel ]` and in edit mode SHALL show `[ Update Feedback ] [ Cancel ]`. Both buttons SHALL sit on the same horizontal row, be aligned to the left side of the form content, be separated by approximately 16–24px, have similar heights, comfortable horizontal padding, and SHALL NOT be centered or stretched across the form width.

#### Scenario: Create mode button row
- **WHEN** the form is in create mode
- **THEN** the row renders "Submit Feedback" (dark navy background, white text) followed by "Cancel" (white/light background with a visible border) on the same row, left-aligned, with approximately 16–24px between them

#### Scenario: Edit mode button row
- **WHEN** the form is in edit mode
- **THEN** the row renders "Update Feedback" followed by "Cancel" in the same left-aligned, same-row arrangement

### Requirement: Cancel button behavior
The Cancel button SHALL NOT navigate to the Dashboard and SHALL keep the student on the Feedback page; it SHALL NOT change the sidebar module and SHALL NOT reload the application. In edit mode, Cancel SHALL discard unsaved changes, exit edit mode, clear the form fields, and return the form to create mode with the "Submit Feedback" label. In create mode, Cancel SHALL clear/close the form and return to the normal Feedback module view.

#### Scenario: Cancel in edit mode exits editing
- **WHEN** a student edits feedback and clicks Cancel
- **THEN** the form is cleared, edit mode is exited, the button label returns to "Submit Feedback", and the student remains on the Feedback page without navigating or reloading

#### Scenario: Cancel in create mode clears the form
- **WHEN** a student fills or leaves the create form and clicks Cancel
- **THEN** the form is cleared/closed and the student remains on the normal Feedback module view without navigating to the Dashboard or reloading

### Requirement: Gap between form and My Feedback sections
The "Submit Feedback" form card and the "My Feedback" section SHALL have a clear vertical gap of approximately 24–32px so the two cards never touch or look merged.

#### Scenario: Visually separated sections
- **WHEN** the Feedback page is rendered
- **THEN** there is a gap of approximately 24–32px between the bottom of the Submit Feedback card and the top of the My Feedback card

### Requirement: My Feedback section header
The "My Feedback" section SHALL render its existing dark navy blue header reading "My Feedback" with a height consistent with the "Submit Feedback" title bar, consistent left padding, and the title aligned with the other student module title bars. There SHALL be comfortable spacing between the header and the table, and the table SHALL remain inside a clean white/light container.

#### Scenario: Header matches other module title bars
- **WHEN** the My Feedback card is rendered
- **THEN** its navy header reads "My Feedback" with height, left padding, and title placement consistent with the "Submit Feedback" header and the other student modules

#### Scenario: Spacing between header and table
- **WHEN** the My Feedback card is inspected
- **THEN** comfortable spacing separates the navy header from the table, and the table sits inside the white card without touching its edges

### Requirement: My Feedback table alignment
The "My Feedback" table SHALL keep the columns SUBJECT | CATEGORY | STATUS | RATING | DATE | ACTIONS. Column headers and row content SHALL be vertically centered, with consistent horizontal padding. The table SHALL remain responsive and contained within the card. Column text alignment SHALL be: SUBJECT left-aligned; CATEGORY consistently left or centered; STATUS centered; RATING centered; DATE centered; ACTIONS centered. Content (subject text, category badge, status badge, stars, date, action buttons) SHALL NOT overlap.

#### Scenario: Column alignment matrix
- **WHEN** the My Feedback table is rendered
- **THEN** headers and rows are vertically centered with even horizontal padding, and the columns use the specified alignment (SUBJECT left; CATEGORY left-or-centered consistently; STATUS, RATING, DATE, ACTIONS centered)

#### Scenario: No overlapping content
- **WHEN** feedback rows are populated
- **THEN** subject text, category badge, status badge, rating stars, date, and action buttons do not overlap and remain within their column

### Requirement: Edit and Delete action buttons
The Actions column SHALL render Edit and Delete on the same row with approximately 8–12px gap, both buttons SHALL have similar height and not be stretched, and SHALL be vertically centered in the Actions column. Edit SHALL use the existing yellow/accent styling and Delete SHALL use the existing red/delete styling.

#### Scenario: Actions row renders Edit and Delete
- **WHEN** a feedback row with actions is rendered
- **THEN** Edit and Delete appear on the same row with an approximately 8–12px gap, similar height, no stretching, and are vertically centered; Edit uses yellow/accent styling and Delete uses red styling

### Requirement: Responsive layout
The Feedback module SHALL remain responsive. On desktop it SHALL use the available content width efficiently with consistent left/right margins, SHALL NOT make the form unnecessarily narrow, and SHALL keep the form and table aligned to the same content width. On smaller screens, form fields SHALL remain full width, action buttons SHALL wrap only when necessary, the table SHALL remain usable without breaking the layout, and sidebar/header behavior SHALL remain unchanged.

#### Scenario: Desktop layout
- **WHEN** the page is rendered at desktop width
- **THEN** the form and table share the same content width with consistent margins, the form is not unnecessarily narrow, and nothing overflows the content area

#### Scenario: Mobile layout
- **WHEN** the page is rendered at a small screen width
- **THEN** form fields stay full width, action buttons wrap only when necessary, the table remains scrollable/usable without breaking the page layout, and the sidebar/header behavior is unchanged

### Requirement: No functional changes
The layout change SHALL NOT modify feedback submission, editing, deletion, rating selection, category selection, priority selection, database/API integration, validation, authentication, or routing. All existing behaviors, API calls, and data handling SHALL continue to work unchanged.

#### Scenario: Existing functionality unaffected
- **WHEN** a student submits, edits, deletes, or views feedback after the layout change
- **THEN** every existing behavior works exactly as before using the same API calls, validation, and data, with only the visual layout changed