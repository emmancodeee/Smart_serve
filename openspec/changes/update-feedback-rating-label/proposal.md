## Why

The Rating section label on the Student Feedback form currently reads "Rating (1-5)". Renaming it to "Ratings" keeps the label concise and matches the same short-form field-name style used across the rest of the form while still making the control's purpose clear.

## What Changes

- Change the label text of the Rating section on the Student Feedback submit form from "Rating (1-5)" to "Ratings".
- Keep the five rating buttons `[1] [2] [3] [4] [5]` in a horizontal row exactly as-is.
- Keep the helper text "1 = Poor, 5 = Excellent" exactly as-is.
- No changes to layout, styling, spacing, rating functionality, the Priority section, or any other part of the page.

## Capabilities

### New Capabilities
<!-- None - this is a wording-only refinement -->

### Modified Capabilities
- `student-feedback-ui-layout`: The "Two-column submit form layout" requirement labels the Rating control as "Rating (1-5)"; it is renamed to "Ratings" in the Student Feedback form.

## Impact

- `public/feedback.html`: the Rating section label text only (line ~812). No CSS, markup structure, ids, names, or JavaScript changes.