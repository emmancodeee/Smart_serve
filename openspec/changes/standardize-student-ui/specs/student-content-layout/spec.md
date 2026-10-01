## ADDED Requirements

### Requirement: Student content cards match Admin card system
Student module content SHALL use white cards on the `#eef5ff` background with the Admin design system's borders, radius, shadow, section headers, heading typography, and spacing. Cards SHALL not have divergent border colors, shadows, or spacing across pages.

#### Scenario: Cards render consistently across student modules
- **WHEN** a student views Dashboard, Request, Profile, Announcements, Feedback, or Returns
- **THEN** every card SHALL use the same white background, border color, radius, and padding
- **AND** section headings SHALL use the same navy heading style and size

### Requirement: Student forms and inputs match Admin style
Student forms (profile edit, change password, feedback, returns, request) SHALL use the Admin input styling: consistent height, `border-slate-300` resting border, blue-400 hover and blue focus ring, consistent label styling, and primary submit buttons using the navy (`#0b1f4d`) background with readable white text. All password fields SHALL retain their eye visibility toggle.

#### Scenario: Inputs and buttons are consistent
- **WHEN** a student fills any student form
- **THEN** all inputs SHALL share the same border, hover, and focus-ring styling
- **AND** primary buttons SHALL use the navy background with white text

#### Scenario: Password fields keep eye toggles
- **WHEN** a student views the change-password form
- **THEN** every password field SHALL show the eye visibility toggle and toggle the field's visibility when clicked

### Requirement: Request workflow follows the Admin layout system
The request (registration) workflow on Dashboard SHALL keep its current six-step flow and fields but align its card, tabs, buttons, upload area, and preview spacing with the Admin visual system.

#### Scenario: Request section uses standard spacing
- **WHEN** a student opens the Request section
- **THEN** the step tabs, upload box, preview, and navigation buttons SHALL use the Admin consistent padding, radius, and button styling
- **AND** the registration flow and fields SHALL remain unchanged

### Requirement: Student announcements align to shared layout
Announcements SHALL use the standard card layout for search, filters, the featured announcement, results meta, and the announcement feed, with even spacing between controls.

#### Scenario: Announcement view is aligned
- **WHEN** a student opens Announcements
- **THEN** the search field, filters, and announcement cards SHALL share the standard spacing and card styling
- **AND** no layout element is misaligned with the Admin design system

### Requirement: Student feedback aligns to shared layout
Feedback SHALL use the standard card layout for the submit form, category select, star rating, priority select, and feedback history table, with even spacing and no instructional helper paragraphs.

#### Scenario: Feedback view is aligned
- **WHEN** a student opens Feedback
- **THEN** the form fields and history table SHALL use the standard card spacing and input styling

### Requirement: Student returns aligns to shared layout
Returns SHALL use the standard card layout for the return form (registration dropdown, item rows, reason, details, date, priority) and the return requests table, with even spacing and no instructional helper paragraphs.

#### Scenario: Returns view is aligned
- **WHEN** a student opens Returns
- **THEN** the return form fields and history table SHALL use the standard card spacing and input styling

### Requirement: Responsive behavior matches Admin
Student pages SHALL retain the fixed sidebar at desktop sizes and the burger/drawer at smaller widths, with no horizontal overflow, matching the Admin responsive system.

#### Scenario: Layout holds at smaller widths
- **WHEN** a student resizes the browser to a mobile width
- **THEN** the sidebar collapses behind the burger/drawer control and no horizontal scroll appears
- **AND** the layout does not overflow or overlap