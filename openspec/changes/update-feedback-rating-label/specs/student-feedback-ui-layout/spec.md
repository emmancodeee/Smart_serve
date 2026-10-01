## MODIFIED Requirements

### Requirement: Two-column submit form layout
The submit form SHALL use a responsive grid rather than a single stacked column. On desktop: Row 1 places "Category *" (select, placeholder "Select Category") and "Subject *" (text input, placeholder "Brief subject of your feedback") side by side. Row 2 places "Detailed Feedback *" (textarea placeholder "Please provide detailed feedback...", approximately 110–140px tall) in a wider left section and a right section containing "Ratings" and "Priority *" rendered side by side as a balanced two-column row (Ratings on the left, Priority on the right). On tablet/mobile the grid SHALL collapse to one column with full-width fields.

#### Scenario: Desktop two-column layout
- **WHEN** a desktop-width student viewport renders the form
- **THEN** Category and Subject share a row, and Detailed Feedback and the Ratings/Priority section share a row with the textarea wider than the right controls
- **AND** within the right section, the "Ratings" control sits in the LEFT column and "Priority *" sits in the RIGHT column of a balanced two-column row

#### Scenario: Tablet/mobile single-column layout
- **WHEN** a tablet or mobile viewport renders the form
- **THEN** all fields collapse to a single full-width column, with the Ratings section stacked above the Priority section

### Requirement: Rating and priority controls
Rating SHALL render as five compact, equal-size square/rounded buttons labeled 1–5 in a horizontal row, with a selected rating using the dark navy active style and unselected buttons using white/light styling with a subtle blue border, and helper text "1 = Poor, 5 = Excellent" directly below. The Rating section SHALL display the label "Ratings". Rating SHALL occupy the LEFT column of the two-column row, with no overlap onto other fields. Priority SHALL render in the RIGHT column with its label reading "Priority *", a default placeholder option reading "Select Priority", and a full-width plain select (no excess height) that is horizontally aligned with the rating buttons and uses the same border radius, border, height, font, and styling as the other form inputs.

#### Scenario: Ratings buttons render compactly on the left
- **WHEN** a student views the Ratings control
- **THEN** the section displays the label "Ratings" with five equal-size compact buttons 1–5 shown in one horizontal row on the LEFT with equal spacing and the helper text "1 = Poor, 5 = Excellent" directly below, dark navy highlighting the selected rating and blue-bordered white styling for unselected ratings
- **AND** the Ratings section does not overlap with the Priority section or any other field

#### Scenario: Priority select renders on the right
- **WHEN** a student views the Priority control
- **THEN** it appears in the RIGHT column below the "Priority *" label, stretching across the right column's available width, with a "Select Priority" placeholder option, styled consistently with the other form inputs
- **AND** it starts at the same vertical position as the rating buttons

#### Scenario: Responsive stacking
- **WHEN** the form renders on a tablet or mobile viewport
- **THEN** the Ratings section appears first and the Priority section stacks below it, full-width, with no overlap or horizontal overflow