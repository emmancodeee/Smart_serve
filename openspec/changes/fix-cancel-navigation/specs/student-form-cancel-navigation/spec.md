## ADDED Requirements

### Requirement: Feedback page Cancel does not navigate
On the student Feedback page, selecting Cancel SHALL leave the browser on the Feedback page — Cancel performs no navigation regardless of how the student reached the Feedback page.

#### Scenario: Cancel from Feedback page
- **WHEN** a student is on the Feedback page and clicks Cancel
- **THEN** the browser stays on the Feedback page

#### Scenario: Cancel after arriving from another page
- **WHEN** a student navigates to the Feedback page via the sidebar (e.g., from the Returns page or dashboard) and clicks Cancel
- **THEN** the browser stays on the Feedback page and does not navigate to the Returns page, the dashboard, or the profile page

### Requirement: Returns page Cancel does not navigate
On the student Returns page, selecting Cancel SHALL leave the browser on the Returns page — Cancel performs no navigation regardless of how the student reached the Returns page.

#### Scenario: Cancel from Returns page
- **WHEN** a student is on the Returns page and clicks Cancel
- **THEN** the browser stays on the Returns page

#### Scenario: Cancel after arriving from another page
- **WHEN** a student navigates to the Returns page via the sidebar (e.g., from the Feedback page or dashboard) and clicks Cancel
- **THEN** the browser stays on the Returns page and does not navigate to the Feedback page, the dashboard, or the profile page

### Requirement: Return process feedback modal Cancel closes the modal
On the student Returns page, the Cancel button in the "Return Process Feedback" modal SHALL close the modal and SHALL NOT leave the Returns page.

#### Scenario: Cancel closes the return feedback modal
- **WHEN** a student opens the "Return Process Feedback" modal on the Returns page and clicks Cancel
- **THEN** the modal closes and the student remains on the Returns page

#### Scenario: Cancel works under the Content-Security-Policy
- **WHEN** a student opens the "Return Process Feedback" modal and clicks Cancel
- **THEN** the click closes the modal without relying on an inline `onclick` attribute blocked by the site's CSP