## ADDED Requirements

### Requirement: No developer-style or AI-like helper text
The student UI SHALL NOT display developer-style, AI-like, or instructional helper copy that reads as generated documentation. Only actual user-facing labels, placeholders, and feature descriptions SHALL remain visible.

#### Scenario: Helper copy removed from Feedback
- **WHEN** a student opens Feedback
- **THEN** the page SHALL NOT display text such as "Share your thoughts about modules, uniforms, books, or general service." or "View and manage your submitted feedback."

#### Scenario: Helper copy removed from Returns
- **WHEN** a student opens Returns
- **THEN** the page SHALL NOT display text such as "Return modules, uniforms, or books when you're done with them."

#### Scenario: Helper copy removed from Dashboard
- **WHEN** a student opens Dashboard
- **THEN** the secondary cards SHALL NOT display developer-style summary text such as "Track your current pickup schedule, recent changes, and confirmation status in one place." or "Keep your account details and submitted documents aligned with your registration request."

#### Scenario: Feature copy remains functional
- **WHEN** student UI copy changes are applied
- **THEN** real field labels, placeholders, empty states, and help text that describes actual user actions SHALL remain unchanged and readable