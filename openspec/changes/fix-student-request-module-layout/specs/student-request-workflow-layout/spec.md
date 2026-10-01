## ADDED Requirements

### Requirement: Unified card layout
The Student Request module SHALL render as one unified card with a single consistent horizontal padding for all sections, so every element — title, connection message, workflow tabs, status message, step content, and footer — shares the same left and right alignment.

#### Scenario: Request module renders as one card
- **WHEN** a student opens the Request module
- **THEN** the "Registration Workflow" title bar, connection/status messages, workflow tabs, step content, and Back/Next footer are displayed with the same left and right alignment and consistent vertical spacing

#### Scenario: No content touches edges
- **WHEN** the Request module is rendered
- **THEN** no panel content touches the card edges and there is no horizontal overflow

### Requirement: Workflow tabs are a 3x2 grid
The workflow navigation SHALL render as a 3-column × 2-row grid: "ORF", "Review", "Modules" on the first row and "Books", "Uniforms", "Summary" on the second row, with equal column widths, equal row heights, centered text, consistent borders, rounded corners, internal padding, and no overlap or contact with the outer container.

#### Scenario: Tabs render in 3x2 grid
- **WHEN** the Request module is rendered
- **THEN** the six workflow tabs appear as 3 equally-sized columns per row and 2 equally-sized rows

#### Scenario: Active tab uses Smart Serve active styling
- **WHEN** one workflow step is active
- **THEN** its tab uses the existing Smart Serve navy active-state styling and the other tabs use the inactive styling

### Requirement: Step content swaps in place
Clicking a workflow tab or the Next button SHALL swap only the step content within the same card; the title, margins, container width, and overall page position SHALL NOT change, and the page SHALL NOT navigate to a new route or page.

#### Scenario: Next moves to the next step in place
- **WHEN** a student clicks Next on the ORF step
- **THEN** the panel content changes to the Review step while the card, title, tabs, margins, and Back/Next footer stay in the same position

#### Scenario: Back returns to previous step in place
- **WHEN** a student clicks Back
- **THEN** the previous step's content is shown in the same container without any page navigation

### Requirement: ORF step has two equal columns
The ORF step SHALL display two equal-width, equal-height columns: "ORF Upload" on the left and "ORF Preview" on the right, with matching top alignment, a consistent gap, and padding that keeps text away from borders.

#### Scenario: ORF columns render balanced
- **WHEN** the ORF step is shown
- **THEN** "ORF Upload" and "ORF Preview" occupy two columns of equal width, equal height, and equal top alignment

### Requirement: Student Information is a 2-column aligned layout
The Review step's Student Information section SHALL display a two-column layout with rows: "Name"/"Student Number", "Age"/"Course", and "Year Level"/"Student Type", with equal column widths, equal input heights, aligned labels, aligned inputs, and consistent vertical and horizontal spacing.

#### Scenario: Student Information fields render aligned
- **WHEN** the Review step is shown
- **THEN** Name is aligned with Student Number, Age with Course, and Year Level with Student Type, using equal column widths and equal input heights

#### Scenario: Student data comes from the application
- **WHEN** the Review step is shown
- **THEN** all student fields (Name, Age, Year Level, Student Number, Course, Student Type) contain the actual signed-in student's data

### Requirement: Status messages align with content
The connection/status message area and the registration status message ("Your registration is approved.", etc.) SHALL use the same left and right alignment as the workflow tabs and step content.

#### Scenario: Status message is aligned
- **WHEN** the registration status message is shown
- **THEN** it shares the same horizontal alignment as the workflow tabs and step content

### Requirement: Footer buttons are aligned
The workflow footer SHALL place Back on the left and Next on the right with the same vertical alignment, consistent button size, proper padding, and clear spacing above the step content.

#### Scenario: Footer renders Back left and Next right
- **WHEN** a workflow step is shown
- **THEN** the Back button is left-aligned and the Next button is right-aligned in the same row with equal vertical alignment

### Requirement: Responsive behavior
On desktop and tablet the tabs SHALL be 3×2 and step content SHALL be two columns; on small screens the layout SHALL stack vertically without horizontal scrolling, overlap, or inaccessible controls.

#### Scenario: Desktop layout
- **WHEN** the Request module is viewed on a desktop or tablet
- **THEN** tabs render 3×2 and step content renders in two balanced columns

#### Scenario: Mobile layout
- **WHEN** the Request module is viewed on a small screen
- **THEN** sections stack vertically with no horizontal scrolling or overlap, and inputs and buttons remain readable and accessible

### Requirement: Functionality unchanged
The layout change SHALL NOT alter the request workflow logic, Next/Back/Submit behavior, ORF upload, student data, API, routes, database, authentication, header, or sidebar.

#### Scenario: Workflow still functions
- **WHEN** a student completes the workflow after the layout change
- **THEN** the ORF upload, step navigation, and submit behavior work exactly as before