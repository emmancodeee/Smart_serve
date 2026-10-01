## ADDED Requirements

### Requirement: Single page-level "Return Request" title bar
The Student Returns page (`/returns`) SHALL render exactly ONE large dark navy rounded page-title bar (`.module-title-bar`) directly below the main header, with text reading "Return Request". The page SHALL NOT render any second large standalone page-width title bar, navy section heading band, or heading text containing "Submit Return Request".

#### Scenario: Only "Return Request" appears as the page title
- **WHEN** a student opens the Returns page
- **THEN** the one large navy page-title bar below the header reads "Return Request"
- **AND** no second large page-width navy title bar or navy heading band exists anywhere on the page
- **AND** no heading or text reading "Submit Return Request" is rendered as a heading or section title inside the page

### Requirement: Preserved submit button
The form SHALL keep its existing "Submit Return Request" submit button at the bottom of the form, unchanged in label, styling, and submit behavior.

#### Scenario: Submit button unchanged
- **WHEN** a student reaches the bottom of the return-request form
- **THEN** the "Submit Return Request" submit button remains present with its existing label, styling, and behavior

### Requirement: Consistent vertical spacing after removal
After removing the duplicate title bar and the "Submit Return Request" section heading, the form card SHALL follow the "Return Request" title bar with normal consistent spacing (no large empty vertical gap), and the padding and alignment SHALL remain consistent with the Feedback module and other student pages.

#### Scenario: No large empty gap below the page title
- **WHEN** the Returns page renders after the change
- **THEN** the form card sits directly below the "Return Request" title bar with consistent spacing and no large empty vertical gap

### Requirement: UI-only scope
This change SHALL NOT alter routing, API calls, database logic, validation, form fields, or return request behavior. The Smart Serve navy blue / white / yellow design SHALL be preserved.

#### Scenario: Functionality unchanged
- **WHEN** a student submits a return request after the change
- **THEN** all existing behaviors, fields, validation, and API calls work exactly as they did before