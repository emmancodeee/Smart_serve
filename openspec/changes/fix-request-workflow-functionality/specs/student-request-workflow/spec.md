## ADDED Requirements

### Requirement: Interactive step navigation
The Student Request workflow SHALL render five numbered navigation steps (1 ORF, 2 Student Information, 3 Modules, 4 Books, 5 Uniforms & Summary). Each step SHALL be an active navigation control that immediately displays its corresponding step page without reloading the page or navigating to a different URL, using the existing step steering (`setRegistrationStep`/`registrationStepIndex`). Each step SHALL also be operable via keyboard (Enter or Space).

#### Scenario: Clicking a step shows that page immediately
- **WHEN** the student clicks the numbered step "4 Books"
- **THEN** the Books page is displayed immediately and no page reload or URL change occurs

#### Scenario: Keyboard activation of a step
- **WHEN** the student focuses a numbered step and presses Enter or Space
- **THEN** the corresponding step page is displayed immediately

### Requirement: Active step highlighting
Exactly one step SHALL be visually highlighted as active at any time (blue circle, white number, blue label, yellow accent only on the active/highlighted element). Steps before the current step MAY display a check icon when the workflow's completion state supports it. Inactive steps SHALL NOT appear active simultaneously.

#### Scenario: Active step transitions on click
- **WHEN** the student is on Step 1 and clicks Step 3
- **THEN** Step 3 becomes the only highlighted (active) step and Steps 1, 2, 4, and 5 are rendered as inactive, with Steps 1–2 marked completed where completion is supported

#### Scenario: Only one active step
- **WHEN** any step is displayed
- **THEN** exactly one numbered step carries the active state styling

### Requirement: Shared workflow state preservation
The workflow SHALL keep ONE shared request state (current step; ORF file; student information; selected modules; selected books; uniform information). Entered values SHALL persist when the student moves to another step, jumps directly to a non-adjacent step, or returns to a previously visited step. The workflow SHALL NOT reset components or clear fields on step changes. Student Information MUST NOT be cleared when returning to Step 2 after visiting other steps.

#### Scenario: Data survives jumping between steps
- **WHEN** the student enters student information on Step 2, clicks Step 4, then clicks Step 2 again
- **THEN** the previously entered student information is still present

#### Scenario: Back navigation retains data
- **WHEN** the student advances from Step 1 to Step 5 and presses Back from Step 5 to Step 1
- **THEN** all previously entered information remains intact on every visited step

### Requirement: Validation before advancing via Next
The Next control SHALL validate the currently displayed step's required information before advancing. If required information is missing, the workflow SHALL show a clear inline validation message, focus the affected field where applicable, and SHALL NOT advance. Step 1 requires an ORF (either a newly uploaded file or a previously saved ORF); Step 2 requires Name, Age, and Course. This validation SHALL NOT apply to direct numbered-step clicks or to Back.

#### Scenario: Next blocked on Step 1 without ORF
- **WHEN** the student is on Step 1 without an uploaded or previously saved ORF and clicks Next
- **THEN** an inline validation message is shown and the workflow does not advance to Step 2

#### Scenario: Next blocked on Step 2 without required fields
- **WHEN** the student is on Step 2 with an empty Name, Age, or Course and clicks Next
- **THEN** an inline validation message is shown, the empty required field is focused, and the workflow does not advance to Step 3

#### Scenario: Next advances on a valid step
- **WHEN** the student is on Step 2 with Name, Age, and Course filled and clicks Next
- **THEN** the workflow advances to Step 3

### Requirement: Direct step jumping without validation gate
Clicking any numbered step SHALL immediately display that step without first validating the current or target step, while preserving all entered data.

#### Scenario: Jump to a step from an invalid state
- **WHEN** the student is on Step 2 with missing required fields and clicks Step 5
- **THEN** the workflow immediately displays Step 5 without blocking on Step 2 validation, and the Step 2 data is retained

### Requirement: ORF upload and preview
The Choose File control SHALL open the native file picker. After a file is selected, the workflow SHALL display the selected filename, preserve the selected file in the shared workflow state, and update the ORF Preview (show the preview when supported, or show the empty state when no valid ORF is present). The existing OCR flow SHALL run through the existing `/api/auth/extract-orf` endpoint when a file is selected, and ORF upload/OCR status messages SHALL be visibly styled for progress, success, warning, and error.

#### Scenario: Choosing a file reveals the filename and preview
- **WHEN** the student selects an image or PDF file in Choose File
- **THEN** the filename is displayed, the file is stored in workflow state, and the ORF Preview shows the uploaded document (or its empty state is dismissed)

#### Scenario: No selection shows the empty state
- **WHEN** no ORF has been uploaded or the previously saved ORF is absent
- **THEN** the ORF Preview displays the document-icon empty state "No ORF uploaded yet."

#### Scenario: OCR progress and result styled
- **WHEN** an ORF file is selected and OCR runs
- **THEN** the ORF status area shows visibly styled progress, then success/failure feedback tied to the existing extraction endpoint result

### Requirement: Retry reloads student data
The Retry control under the server alert SHALL re-run the existing connection/load logic (`loadUserInfo`) without a page reload and SHALL clear the alert on success.

#### Scenario: Retry after server failure
- **WHEN** the server alert is visible and the student clicks Retry
- **THEN** the workflow re-fetches student data, hides the alert on success, and shows an error message again only if the retry also fails

### Requirement: Module and book add/remove
The "+ Add Module" and "+ Add Book" controls SHALL be clickable and append a selection row backed by the existing catalog (`REQUEST_CATALOG`), and the UI SHALL update immediately. Each selection row SHALL contain a functional remove control that deletes the row immediately and updates the summary. Selected modules and books SHALL persist when moving between steps. Empty selections SHALL show the existing "No modules/books added yet." empty states.

#### Scenario: Adding a module row
- **WHEN** the student clicks "+ Add Module" on Step 3 and selects a module in the appended row
- **THEN** the module appears in the selected modules list immediately and the summary reflects it

#### Scenario: Removing a module row
- **WHEN** the student clicks Remove on a selected module row
- **THEN** the row is removed immediately and the summary no longer includes that module

#### Scenario: Selections persist across steps
- **WHEN** the student adds modules and books, moves to Step 5, then returns to Step 3
- **THEN** the previously selected modules and books are still present

### Requirement: Student information fields interactive
Name, Student Number, Age, Course, Year Level, and Student Type SHALL remain interactive (editable inputs, openable dropdowns with selectable options) when the workflow is not locked, and their values SHALL be stored in the shared state and preserved when moving to another step. Course and Year Level dropdowns SHALL be populated from the existing course and year-level catalog.

#### Scenario: Editing fields and returning
- **WHEN** the student edits Name/Course/Year Level/Student Type, moves to Step 4, and returns to Step 2
- **THEN** the edited values are present and the dropdowns show the selected options

### Requirement: Uniform fields interactive
Uniform Type and Uniform Size SHALL be functional dropdowns populated from the existing catalog, and Uniform Notes SHALL be an editable textarea. Selected values SHALL be preserved when navigating between steps.

#### Scenario: Selecting uniform values
- **WHEN** the student selects a Uniform Type and Size and enters notes on Step 5, leaves the step, and returns
- **THEN** the selected values and notes are unchanged

### Requirement: Automatic live summary
The Summary section SHALL display the current information from the shared workflow state — Name, Student Number, Course, Year Level, Student Type, Selected Modules, Selected Books, Uniform Type, Uniform Size, and Uniform Notes. The summary SHALL update automatically whenever any workflow value changes and SHALL reflect changes made after navigating back to earlier steps. The summary SHALL NOT be hardcoded.

#### Scenario: Summary reflects current selections
- **WHEN** the student selects module "IT Fundamentals", book "Programming Fundamentals", Uniform Type "AU PHINMA Shirt", and Size "Medium"
- **THEN** the Summary immediately shows those exact values

#### Scenario: Summary updates after a going-back change
- **WHEN** the student modifies a value on an earlier step and returns to Step 5
- **THEN** the Summary reflects the changed value without manual refresh

### Requirement: Submit behavior
The Submit control SHALL validate required fields (ORF present, Name/Age/Course present, at least one requested item), show a loading state while submitting, prevent duplicate submissions, and submit through the existing `PUT /api/auth/update-profile` endpoint. It SHALL show success or error feedback, and SHALL NOT clear the form or entered data unless the request completes successfully.

#### Scenario: Successful submission
- **WHEN** the student submits a valid request
- **THEN** the workflow posts to the existing update endpoint, prevents a second concurrent submission, shows success feedback, and updates the registration status UI

#### Scenario: Duplicate submission prevented
- **WHEN** the student triggers Submit while a submission is already in progress
- **THEN** the second submission is ignored and no duplicate request is sent

#### Scenario: Failed submission retains data
- **WHEN** the update request fails
- **THEN** an error is shown, the form and entered data are not cleared, and the Submit control is restored for a retry

### Requirement: Back navigation consistency
The Back control SHALL move one step backward consistently — Step 2 → Step 1, Step 3 → Step 2, Step 4 → Step 3, Step 5 → Step 4 — and SHALL retain all previously entered information. On Step 1, Back SHALL follow the existing Request behavior (disabled at the first step).

#### Scenario: Back from Step 5 to Step 1
- **WHEN** the student presses Back from Step 5, then Step 4, then Step 3, then Step 2
- **THEN** each press displays the previous step and all entered data remains intact, and Back is disabled on Step 1

### Requirement: Next navigation consistency
The Next control SHALL advance one step at a time (Step 1 → 2, Step 2 → 3, Step 3 → 4, Step 4 → 5), validating each step before advancing. On Step 5, Next SHALL be replaced by Submit.

#### Scenario: Sequential next flow
- **WHEN** the student presses Next from Step 1 through Step 4 with valid steps
- **THEN** the workflow advances to Step 5 and the Next control is replaced by Submit

### Requirement: Approved registrations remain editable and resubmittable
When the registration status is approved, all workflow inputs and controls SHALL remain interactive so the student can revise their request. Submitting an updated request through `PUT /api/auth/update-profile` SHALL reset the registration status to pending for re-review (existing backend behavior). The approved banner/pickup message SHALL remain visible for information only and SHALL NOT block interaction.

#### Scenario: Approved registration still allows editing
- **WHEN** the registration status is approved and the student opens the Request tab
- **THEN** inputs, Add/Remove controls, Next/Back/Submit, Choose File, and step navigation remain enabled and the entered information is visible

#### Scenario: Resubmitting after approval returns to pending
- **WHEN** the approved student submits an updated request
- **THEN** the workflow posts to the existing update endpoint and the registration status UI reverts to pending