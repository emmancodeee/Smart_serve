# student-feedback-page

## ADDED Requirements

### Requirement: Smart Serve navy section headers
The "Submit Feedback" and "My Feedback" card header bands on the student Feedback page SHALL render with a solid Smart Serve navy background (`#152c69`, matching the topbar and module title bars) instead of a blue gradient. No other visual property of either band SHALL change.

#### Scenario: Submit Feedback band renders in solid navy
- **WHEN** a student opens the Feedback page
- **THEN** the "Submit Feedback" header band above the feedback form shows the solid Smart Serve navy `#152c69` background with its existing bold white text

#### Scenario: My Feedback band renders in solid navy
- **WHEN** a student opens the Feedback page
- **THEN** the "My Feedback" header band above the history table shows the same solid navy `#152c69` background as the Submit Feedback band

#### Scenario: Colors only — nothing else changes
- **WHEN** the two Feedback sections render after the color fix
- **THEN** the header bands keep their existing text, font size/weight, letter-spacing, padding, border radius, margins, and alignment, and the form controls, history table, sidebar, topbar, and page shell are unchanged