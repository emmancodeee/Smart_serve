# Student Returns Title Layout

## Purpose

Defines the corrected heading hierarchy for the Student Returns page (`/returns`): exactly ONE large blue page-title box reading "Return Request", and a smaller navy in-card header band inside the form card reading "Submit Return Request" as the form's section heading. Removes the duplicate large standalone "Submit Return Request" title bar. This capability is UI-only and does NOT change routing, sidebar, header, form fields, or any return-request functionality.

## ADDED Requirements

### Requirement: Single page-level title bar
The Returns page SHALL render exactly ONE large blue rounded page-title box (`.module-title-bar`) below the main header, with text reading "Return Request", and SHALL NOT render any second large standalone title bar on the page.

#### Scenario: Only "Return Request" appears as a large title
- **WHEN** a student opens `/returns`
- **THEN** the first (and only) large blue page-title box below the header reads "Return Request"

#### Scenario: No duplicate large title bar
- **WHEN** the Returns page renders its main content
- **THEN** no second large `.module-title-bar` exists anywhere on the page

### Requirement: In-card section heading for the form
The return-request form SHALL live inside one white rounded card (`.student-panel.return-form-card`) that carries a smaller navy header band reading "Submit Return Request" at the top of the card, visually distinct from (and smaller than) the page-level "Return Request" title bar.

#### Scenario: Form card shows its section heading
- **WHEN** the form card renders
- **THEN** a navy header band reading "Submit Return Request" is displayed at the top inside the form card, below the page-level "Return Request" title bar

#### Scenario: Section heading stays inside the card
- **WHEN** the Return Request card is displayed
- **THEN** the "Submit Return Request" header band is contained within the card's borders and does not render as a page-width title bar

### Requirement: Submit button preserved
The form SHALL keep its existing "Submit Return Request" submit button, unchanged in label, styling, and behavior, at the bottom of the form.

#### Scenario: Submit button still present
- **WHEN** the student views the Returns form
- **THEN** the "Submit Return Request" submit button remains at the bottom of the form with its existing label, classes, and submit behavior

### Requirement: Consistent spacing after title removal
After removing the duplicate title bar, the vertical spacing SHALL place the form card naturally below the "Return Request" title bar with no large empty gap, and padding inside the form card SHALL remain consistent with the Feedback module and other student pages.

#### Scenario: No gap between title and form
- **WHEN** the page renders without the duplicate title bar
- **THEN** the form card follows the "Return Request" title bar with normal consistent spacing and no large empty vertical gap

#### Scenario: Card padding consistent with Feedback
- **WHEN** the form card renders
- **THEN** the in-card header band and form body use padding/spacing values consistent with the Feedback module's `feedback-card-header` / `feedback-card-body` treatment

### Requirement: No functional changes
The layout changes SHALL NOT alter the form's behavior, submission, validation, data, API calls, routing, item-row logic, or existing modal/history functionality.

#### Scenario: Layout-only scope
- **WHEN** the layout change is applied
- **THEN** no JavaScript files, server code, routing, or shared stylesheets (`tailwind.css`, `theme.css`) are changed, and all form/API behavior operates exactly as before