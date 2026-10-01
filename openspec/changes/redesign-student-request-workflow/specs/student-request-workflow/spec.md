# Student Request Workflow

## Purpose

Defines the layout and visual design of the Student Request/Registration view inside the Dashboard: the Registration Workflow title bar, the server error alert, the 5-step progress indicator, each step's content layout (ORF, Student Information, Modules, Books, Uniforms & Summary), navigation actions, spacing, alignment, responsive behavior, and the preservation of all existing functionality.

## Requirements

### Requirement: Overall page structure
The Request view SHALL render inside the existing Dashboard shell, keeping the existing sidebar (Smart Serve logo; Dashboard, User Profile, Request, Announcements, Feedback, Returns; Request stays the active item) and the existing top header (Welcome message, current date/time, student avatar, name, "STUDENT" label, notification button, menu button) unchanged. The main content SHALL be organized into, in order: a "Registration Workflow" title bar, the server connection alert, a 5-step progress indicator, the current step content card, and Back / Next or Submit navigation, all inside one clean centered container with a white background, very light blue-gray page background, navy blue headings, blue accents, thin borders, rounded corners, subtle shadows, and consistent spacing.

#### Scenario: Request page renders cleanly
- **WHEN** a student opens the Request view (`/dashboard#request`)
- **THEN** the content appears inside the main area as one centered container with the Registration Workflow title bar, server connection alert, 5-step progress indicator, current step card, and navigation, using only the Smart Serve navy/blue/white/yellow palette with consistent spacing

#### Scenario: Sidebar and header unchanged
- **WHEN** the Request view renders
- **THEN** the blue sidebar with Smart Serve logo and nav items, the active Request item, and the top header (welcome, date/time, avatar, name, STUDENT label, notification and menu buttons) are unchanged

### Requirement: Registration Workflow title bar
The top of the Request content SHALL show a compact full-width dark navy blue rounded title banner reading "Registration Workflow" with bold white text. An optional small document/request icon MAY appear inside the banner. No extra instructional descriptions SHALL be added unless already required by the application.

#### Scenario: Title banner renders once
- **WHEN** a student views the Request view
- **THEN** a single compact navy blue rounded banner titled "Registration Workflow" appears at the top of the content with bold white text and no redundant description text

### Requirement: Server connection alert
The existing "Cannot reach the server. Check your connection and try again." error SHALL render as a compact horizontal alert directly under the Registration Workflow title banner: a small warning/error icon and error text on the left, and a Retry button on the right, on a very light red/pink background with a red border. The alert SHALL remain short in vertical height and SHALL keep its existing behavior (Retry re-fetches the user's data via `loadUserInfo()`).

#### Scenario: Compact alert with retry
- **WHEN** the server connection fails while loading the Request view
- **THEN** a short horizontal red/pink alert shows the warning icon, the existing error text, and a Retry button on the right that re-triggers the user-data fetch

#### Scenario: Alert hidden on success
- **WHEN** the user data loads successfully
- **THEN** the server connection alert is hidden and the workflow renders normally

### Requirement: 5-step progress indicator
The Request view SHALL replace the current tab-bar navigation with a horizontal 5-step progress indicator showing exactly five steps labeled: 1 ORF, 2 Student Information, 3 Modules, 4 Books, 5 Uniforms & Summary. "Review" and "Summary" SHALL NOT appear as separate steps; the summary belongs inside Step 5. Each step SHALL show a circular number/icon, its label, and connecting lines between steps. The active step SHALL use a blue circle with a white number/icon and blue text with a subtle yellow accent; completed steps SHALL use a blue circle with a check icon and lighter blue label; upcoming steps SHALL use a light gray/blue circle with muted text. A "Step X of 5" badge SHALL appear at the right of the progress area. The indicator SHALL be visually consistent across all five steps and SHALL NOT render as six large rectangular buttons.

#### Scenario: Five steps display correctly
- **WHEN** the Request view renders on any step
- **THEN** the progress indicator shows exactly the five labels ORF, Student Information, Modules, Books, Uniforms & Summary with circular steps, connecting lines, and a "Step X of 5" badge, and no separate Review or Summary step

#### Scenario: Step states update as the student progresses
- **WHEN** the student advances through steps 1 to 5
- **THEN** the active step renders with a blue circle and blue text plus subtle yellow accent, every earlier step renders completed with a blue circle and check icon, later steps render as muted upcoming steps, and the "Step X of 5" badge updates to the current step

#### Scenario: Progress indicator horizontally scrollable on small screens
- **WHEN** the viewport is too narrow to fit all five steps
- **THEN** the progress indicator becomes horizontally scrollable instead of breaking layout, and it does not become six separate large rectangular buttons

### Requirement: Step 1 — ORF
Step 1 SHALL be titled "ORF" with a small document/upload icon header and SHALL use a two-column layout: a left ORF Upload card (Choose File button, selected filename, and supported-format information stating PDF, JPG, PNG and maximum 5MB) and a right ORF Preview card showing a clean empty state with a document icon and "No ORF uploaded yet." when no file exists, and preserving the existing preview functionality once a file is uploaded. The two cards SHALL have equal height and the upload area SHALL NOT be unnecessarily tall. The bottom of the step SHALL show Back on the left and Next on the right, where Next continues to Student Information.

#### Scenario: ORF upload card
- **WHEN** a student is on Step 1 with no file chosen
- **THEN** the left card shows a Choose File button, the filename area, and supported-format text (PDF, JPG, PNG, maximum 5MB)

#### Scenario: ORF preview empty state and populated state
- **WHEN** the student has not uploaded an ORF
- **THEN** the right card shows a document icon with "No ORF uploaded yet."
- **AND** once a file is uploaded the existing preview (image or PDF open card) renders in its place

#### Scenario: Step 1 navigation
- **WHEN** the student clicks Next on Step 1
- **THEN** the workflow proceeds to Step 2 (Student Information), and Back returns to the previous state as existing behavior requires

### Requirement: Step 2 — Student Information
Step 2 SHALL be titled "Student Information" and SHALL render a clean two-column form using the existing fields and values: Name and Student Number on the left column together with Age and Year Level, and on the right column Course and Student Type (exact column grouping per the existing design). Each field SHALL have a label above it with a required indicator where applicable, a consistent height, a rounded border, and proper spacing. The Course, Year Level, and Student Type fields SHALL be dropdowns with consistent arrow styling using the existing catalog values. Fields SHALL NOT be placed inside a tiny scrollable box, and the step SHALL fit naturally within the main card. Back and Next buttons SHALL appear at the bottom.

#### Scenario: Two-column form renders
- **WHEN** a student is on Step 2
- **THEN** the Student Information form shows labeled, consistently sized fields with Course, Year Level, and Student Type as styled dropdowns, without any internal scrollable box, and the existing saved values are shown

#### Scenario: Data and functionality preserved
- **WHEN** the student edits fields and presses Next
- **THEN** all entered values are retained in the existing draft state and the workflow proceeds to Modules

### Requirement: Step 3 — Modules
Step 3 SHALL be titled "Modules" and SHALL use a two-column card layout: a left Available/Module Window area and a right Selected Modules area. When no modules are selected, the selected area SHALL show "No modules added yet." A clear "+ Add Module" button SHALL be present, styled with the Smart Serve blue/yellow accent but visually secondary to the Next button. Added modules SHALL render as clean rows/cards showing the module name and any existing supporting details, with the existing remove action. No new database fields SHALL be invented. Back and Next buttons SHALL appear at the bottom.

#### Scenario: Modules window renders
- **WHEN** a student is on Step 3
- **THEN** the Module Window and Selected Modules cards render with the "+ Add Module" button, an empty state reading "No modules added yet." when none are selected, and clean rows for each added module with an existing remove action

#### Scenario: Add module behavior preserved
- **WHEN** the student clicks "+ Add Module" or removes a module row
- **THEN** rows are added/removed exactly as before using the existing catalog and draft state, and the summary updates accordingly

### Requirement: Step 4 — Books
Step 4 SHALL be titled "Books" and SHALL reuse the same two-column card layout as Step 3 so the workflow feels consistent: a left Available/Book Window area and a right Selected Books area with an empty state reading "No books added yet." and a "+ Add Book" button. Selected books SHALL render in clean rows/cards with any existing supporting details and remove action. Spacing, typography, card style, and button hierarchy SHALL match Step 3. Back and Next buttons SHALL appear at the bottom.

#### Scenario: Books window renders
- **WHEN** a student is on Step 4
- **THEN** the Book Window and Selected Books cards render matching the Modules step's layout, with the "+ Add Book" button, the "No books added yet." empty state, and clean rows for added books

#### Scenario: Add book behavior preserved
- **WHEN** the student clicks "+ Add Book" or removes a book row
- **THEN** rows are added/removed exactly as before and the summary updates accordingly

### Requirement: Step 5 — Uniforms & Summary
Step 5 SHALL be titled "Uniforms & Summary" and SHALL use a two-column layout: a left Uniform Window card with Uniform Type (dropdown; options Type A, Type B, PE), Uniform Size (dropdown; options Small, Medium, Large), and Uniform Notes (optional textarea with placeholder "Add notes (optional)"); and a right Summary card presented as a review card, not a form, listing only information that already exists in the application: Name, Student Number, Course, Year Level, Student Type, plus the selected Modules, Books, and Uniform details. Small icons MAY accompany summary labels if the existing icon library supports them. Back button on the left and a primary Submit button on the right SHALL sit at the bottom with the same button height/border radius as Next and adequate padding so Submit is not too close to the bottom edge.

#### Scenario: Uniform window renders
- **WHEN** a student is on Step 5
- **THEN** the Uniform Window card shows the Uniform Type and Uniform Size dropdowns and the optional Uniform Notes textarea with the placeholder "Add notes (optional)"

#### Scenario: Summary review card renders
- **WHEN** a student is on Step 5
- **THEN** the Summary card displays the student's Name, Student Number, Course, Year Level, Student Type, and the selected Modules, Books, and Uniform details as a compact review list

#### Scenario: Submit is the primary final action
- **WHEN** the student reaches the bottom of Step 5
- **THEN** Back appears on the left and Submit appears on the right as the primary action with the same height and border radius as Next, with adequate padding beneath it

### Requirement: Spacing and alignment
The layout SHALL NOT contain overlapping content, fields too close to card edges, unnecessary internal scrollbars, or extremely tall empty areas. Left and right columns SHALL be equal width and aligned, with approximately 16–24px between sections, 12–16px between form fields, buttons on the same horizontal baseline, Back always on the LEFT, Next/Submit always on the RIGHT, the progress indicator above the content, "Step X of 5" aligned to the right of the progress area, and no portrait-like content on a wide desktop screen.

#### Scenario: Consistent spacing and alignment
- **WHEN** the Request view renders on desktop
- **THEN** cards, columns, fields, and buttons follow the specified spacing ranges, columns are equal width, buttons align on one baseline with Back left and Next/Submit right, and no content overlaps or creates tall empty regions

### Requirement: Visual design constraints
The Request view SHALL use the existing Smart Serve palette: dark navy blue primary, medium blue secondary, yellow/gold accent used only for active/highlighted elements, very light blue-gray/white backgrounds, soft red/pink error styling, white cards, light blue-gray borders, and subtle details only (small icons, light blue section headers, subtle card shadows, small yellow accent elements, soft rounded corners). The view SHALL NOT use strong gradients everywhere, large illustrations, unnecessary animations, excessive yellow, blanket blue styling, random text or statistics, or unrelated dashboard widgets.

#### Scenario: Palette respects existing branding
- **WHEN** the Request view renders
- **THEN** only Smart Serve palette colors appear, with yellow reserved for active/highlighted elements, and no flashy gradients, large illustrations, decorative animations, or unrelated widgets

### Requirement: Responsive behavior
At desktop width the Request view SHALL use a wide two-column layout; at tablet width it SHALL reduce column spacing while keeping two columns where possible; at mobile width columns SHALL stack vertically. The 5-step progress indicator SHALL become horizontally scrollable on small screens. Buttons SHALL remain usable and the page SHALL NOT overflow horizontally.

#### Scenario: Tablet and mobile rendering
- **WHEN** the Request view renders at tablet and mobile widths
- **THEN** two-column areas reduce spacing or stack vertically without horizontal page overflow, the progress indicator becomes horizontally scrollable at mobile width, and all buttons remain usable

### Requirement: Functionality preserved
The redesign SHALL NOT alter any existing behavior: file upload, ORF preview, OCR extraction, student information loading and hydration from `/api/auth/me`, module selection and "+ Add Module", book selection and "+ Add Book", uniform selection, summary generation, Back, Next, Submit (`PUT /api/auth/update-profile`), the server Retry, existing API/database calls, existing Request routing, or the locked/approved state. All existing element ids/names/attributes referenced by `public/js/dashboard.js` (e.g., `editName`, `editStudentNumber`, `editAge`, `editCourse`, `editYearLevel`, `studentType`, `moduleRows`, `bookRows`, `editUniformType`, `uniformSize`, `uniformNotes`, `registrationDraft`, `REQUEST_CATALOG`) SHALL remain functional, and the workflow SHALL NOT replace working data with static placeholder values.

#### Scenario: All request flows work unchanged
- **WHEN** a student uploads an ORF, edits information, adds modules and books, chooses uniforms, and submits, or retries a failed server load
- **THEN** every flow works exactly as before with the same fields, records, API calls, state, and database behavior