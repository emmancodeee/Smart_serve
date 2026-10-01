## ADDED Requirements

### Requirement: Return History heading has extra left spacing
On the student Returns page, the "RETURN HISTORY" eyebrow and the "My Return Requests" title in the Return History section SHALL have approximately 16–24px of additional left spacing from the left edge of the content container, while remaining aligned with each other.

#### Scenario: Heading text has breathing room from the left edge
- **WHEN** the student Returns page is rendered
- **THEN** the "RETURN HISTORY" eyebrow and "My Return Requests" title are shifted to the right by approximately 16–24px relative to their current position

#### Scenario: Both heading texts stay aligned with each other
- **WHEN** the Student Returns page is rendered
- **THEN** the "RETURN HISTORY" eyebrow and "My Return Requests" title share the same left alignment

### Requirement: Return History table position unchanged
Adding left spacing to the Return History heading SHALL NOT move the Return History card, its table, the Submit Return Request form, the Cancel button, the sidebar, or the header.

#### Scenario: Other elements remain in place
- **WHEN** the Return History heading gains left spacing
- **THEN** the return history table, the Submit Return Request and Cancel buttons, the sidebar, and the header stay in their original positions

#### Scenario: No layout structure changes
- **WHEN** the Student Returns page is rendered after the change
- **THEN** the page uses the same layout structure, colors, fonts, text content, and behavior as before