## Why

On the Student Feedback form, the Rating and Priority sections are currently stacked vertically inside the right column of Row 2, which wastes space and does not match the intended compact two-column form design. The layout should place Rating on the LEFT and Priority on the RIGHT, side by side in a balanced row, so the form looks clean and professional like the rest of the redesigned page.

## What Changes

- Re-arrange the Rating and Priority sections of the Student Feedback submit form into a side-by-side two-column grid (`1fr 1fr`) on desktop.
- Rating stays on the left with its five compact equal-size buttons (1–5) in one horizontal row and the "1 = Poor, 5 = Excellent" hint directly below.
- Priority moves to the right column with its select stretching across the right column's available width.
- Add the required asterisk to the "Priority" label so it reads "Priority *".
- Add a default placeholder option "Select Priority" as the first option of the priority select.
- Keep the existing priority select styling (border radius, border, height, font) consistent with the other form inputs.
- Both labels start at the same vertical position; the priority select aligns horizontally with the rating buttons.
- On tablet/mobile, the two sections stack vertically with Rating first and Priority below.
- No changes to sidebar, header, logo, colors, typography, rating functionality, priority functionality, submit/cancel/table/buttons.

## Capabilities

### New Capabilities
<!-- None - this refines the existing feedback page layout -->

### Modified Capabilities
- `student-feedback-ui-layout`: Updates the "Two-column submit form layout" and "Rating and priority controls" requirements so Rating and Priority render side by side in a balanced two-column row (Rating left, Priority right) instead of stacked in the right section.

## Impact

- `public/feedback.html`: CSS and form markup for the Rating and Priority sections in the `#feedbackForm` grid (`.feedback-right-col`, `.student-rating-group`, `.student-rating-label`, priority select).
- No JavaScript changes (`public/js/feedback.js` untouched).
- No API, database, or routing changes.