## ADDED Requirements

### Requirement: Consistent spacing around the Student module title bar
The system SHALL render the blue module title bar on each Student Side page (Dashboard, User Profile, Request, Announcements, Feedback, Returns) with a gap of approximately 16–24px between the top header and the title bar, and a gap of approximately 20–24px between the title bar and the first block of page content below it. Every page SHALL use this same spacing regardless of screen size, and the title bar SHALL not touch or overlap the top header or the content beneath it.

#### Scenario: Title bar clear of the top header
- **WHEN** any Student Side module page is rendered
- **THEN** the blue title bar is separated from the top header by approximately 16–24px and does not touch or overlap the header

#### Scenario: Title bar clear of the first content block
- **WHEN** any Student Side module page is rendered
- **THEN** the first content block (form, summary cards, or panels) is separated from the blue title bar by approximately 20–24px

#### Scenario: Uniform gap on every student module
- **WHEN** the student navigates between Dashboard, User Profile, Request, Announcements, Feedback, and Returns
- **THEN** each page shows the same measured gap below the title bar and the same measured gap below the top header

### Requirement: Consistent spacing between blocks below the title bar
The system SHALL keep blocks that follow the title bar evenly spaced on each Student Side page, including pages with multiple stacked panels such as Feedback and Returns, so that consecutive blocks do not touch.

#### Scenario: Feedback and Returns stacked panels stay separated
- **WHEN** the Feedback page shows the feedback form and feedback history, or the Returns page shows the return form and return history
- **THEN** the stacked panels are separated by approximately 20px and do not touch

#### Scenario: Dashboard blocks stay separated
- **WHEN** the Dashboard page shows the workspace blocks under the title bar (overview/highlights or the registration workflow)
- **THEN** each visible block is separated from the previous one by approximately 20px, including when the hidden error strip is not displayed

### Requirement: Pages without a module title bar are unaffected
The spacing rule SHALL apply only to Student module pages whose main column contains a module title bar. Admin pages and the Schedule page SHALL retain their existing layout.

#### Scenario: Schedule and Admin layouts unchanged
- **WHEN** the Schedule page or any Admin page is rendered
- **THEN** its vertical spacing is unchanged

### Requirement: No duplicate or new page titles
The shared spacing implementation SHALL not add, duplicate, or remove page titles, and SHALL preserve each page's single existing blue title box with its exact title text, color, typography, and rounded corners.

#### Scenario: Single title per page preserved
- **WHEN** any Student Side module page is rendered after the change
- **THEN** exactly one blue module title box appears with the existing title text and design