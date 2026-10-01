# Student Returns Layout

## Purpose

Defines the layout and visual structure of the Student Returns page (`/returns`), which is a single scrollable page whose top shows a blue "Return Request" page-title box and the return request form, and whose form card is titled "Submit Return Request". This capability covers section titles, form field alignment, item-row grid, button placement, spacing, and responsive behavior. It does NOT change routing, sidebar, header, or any return-request functionality.

## Requirements

### Requirement: Single-page two-section layout
The Returns page SHALL render as ONE page with the existing student header and sidebar ("Returns" active) and two stacked title sections: a top blue page-title box reading "Return Request", followed by a form card whose blue title box reads "Submit Return Request", followed by the existing "My Return Requests" history card. The page SHALL NOT create a second route or page, SHALL NOT duplicate the header or sidebar, and SHALL allow natural vertical scrolling from the top box to the form section.

#### Scenario: Page loads with top title box first
- **WHEN** a student opens `/returns`
- **THEN** the header and sidebar render as-is, the Returns sidebar item is active, the first blue rounded title box reads "Return Request", and the "Submit Return Request" form card appears below it in the same page

#### Scenario: Sections are vertically stacked and scrollable
- **WHEN** the student scrolls down on the Returns page
- **THEN** the "Submit Return Request" section is visible below the "Return Request" title, the two sections do not overlap, and no duplicate header or sidebar is rendered

### Requirement: No functional changes
The layout changes SHALL NOT alter the form's behavior, submission, validation, data, API calls, routing, or existing modal/history functionality.

#### Scenario: Form still submits a return request
- **WHEN** the student fills the form and clicks "Submit Return Request"
- **THEN** the request is posted to the same returns endpoint with the same payload shape as before the layout change

#### Scenario: Dynamic item rows keep working
- **WHEN** the student clicks "+ Add Another Item" or "Remove"
- **THEN** item rows are added/removed with the same structure and field classes (`.item-type`, `.item-name`, `.item-condition`, `.item-quantity`, `.item-notes`) so `collectItems()` continues to work

### Requirement: Blue rounded page-title box for "Return Request"
The top of the Returns main content area SHALL display a blue rounded `.module-title-bar` box whose text reads "Return Request", positioned as the first element below the header with consistent top spacing.

#### Scenario: Top title box renders correctly
- **WHEN** the Returns page's main content area renders
- **THEN** the first element is a blue rounded page-title box reading "Return Request" with the same styling as other student module title bars

### Requirement: "Submit Return Request" form card title
The return request form SHALL live inside one white rounded card (`.student-panel`) with a blue title box reading "Submit Return Request" attached directly above it.

#### Scenario: Form card title renders
- **WHEN** the "Submit Return Request" section renders
- **THEN** a blue title box reading "Submit Return Request" appears immediately above the white form card containing the return request form

### Requirement: Form field container and field widths
The form SHALL sit inside one clean white rounded container with comfortable padding such that labels, inputs, selects, and textareas never touch the container edges. The "Registration *" select and the "Items to Return *" item-container SHALL each span the full width of the form container.

#### Scenario: Full-width primary fields
- **WHEN** the return request form renders
- **THEN** "Registration *" and "Items to Return *" each occupy the full form width and keep consistent spacing from the card edges

### Requirement: Item-row field alignment
Each `.student-item-row` SHALL lay out its fields (Type, Name, Condition, Quantity, and Notes) in an evenly aligned, equal-height grid with consistent gaps between fields on desktop, and SHALL stack the fields vertically on small screens so nothing overlaps or overflows horizontally.

#### Scenario: Desktop item row alignment
- **WHEN** the viewport is desktop width
- **THEN** the item fields share aligned column widths, equal input/select heights, and an even `gap`, with Condition, Quantity, and Additional Notes fields visibly aligned

#### Scenario: Mobile item row stacking
- **WHEN** the viewport is a small (mobile) width
- **THEN** the item fields stack into a single column with no horizontal overflow and no overlapping labels, inputs, or buttons

### Requirement: Button placement
The form SHALL place the Cancel button on the LEFT and the "Submit Return Request" button on the RIGHT at the bottom of the form, with equal heights, consistent spacing, and not touching the card edges. On small screens the buttons SHALL stack full-width.

#### Scenario: Desktop buttons align left/right
- **WHEN** the form renders at desktop width
- **THEN** Cancel appears on the left, "Submit Return Request" appears on the right, on the same row, with equal heights and adequate space from the card edge

#### Scenario: Mobile buttons stack
- **WHEN** the form renders at mobile width
- **THEN** the two buttons stack vertically, each full-width, without overlapping other fields or the card edge

### Requirement: Consistent vertical spacing between cards
The top title box, the form card, and the history card SHALL be separated by consistent vertical spacing so they are distinct and do not overlap when scrolling.

#### Scenario: Separate cards with breathing room
- **WHEN** the Returns page is rendered
- **THEN** each card section has consistent margins/gaps from adjacent sections and no content overlaps another section