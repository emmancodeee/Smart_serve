## Why

The student Feedback page (`public/feedback.html` + `public/js/feedback.js`) works correctly but its layout is uneven: the form card padding is inconsistent, the field spacing is tight, the rating buttons are small and variable, and the Submit/Update and Cancel buttons are stacked full-width (`w-full` + `space-y-3`), making them stretch awkwardly across the entire page. The "My Feedback" section and its table are cramped and not vertically aligned with the surrounding student modules. This is a UI/UX layout and spacing improvement only — no functionality, data, API, or validation changes.

## What Changes

- **Feedback form card**: add comfortable consistent inner padding (~28–32px), even vertical spacing between fields (~20–24px), and ~8px label-to-input gap so labels/fields never touch the card borders and all fields share the same left/right edges.
- **Form fields**: keep the exact order Category *, Subject *, Detailed Feedback *, Rating (1-5), Priority; uniform label styling (same size/weight/left origin), equal field widths/heights, consistent rounded corners and borders, comfortable textarea height.
- **Rating (1-5)**: five equal-size rating buttons (~44–48px) in one horizontal row with ~8px spacing, selected rating highlighted in dark navy, helper text "1 = Poor, 5 = Excellent" directly below, no full-width stretching.
- **Priority**: full-width select matching the Category select height, aligned with the other fields, with consistent spacing above/below.
- **Submit / Cancel buttons**: normal action-button layout, no longer full-width. `[ Submit Feedback ] [ Cancel ]` (or `[ Update Feedback ] [ Cancel ]` in edit mode) on the same horizontal row, left-aligned, ~16–24px spacing, similar height; Submit/Update keeps dark navy background with white text, Cancel keeps white/light background with a visible border; not centered.
- **Gap between sections**: clear ~24–32px vertical gap so the Submit Feedback form card and the My Feedback card never touch or look merged.
- **My Feedback header**: keep the dark navy blue header "My Feedback", consistent height and left padding with the "Submit Feedback" title bar, title aligned with the other student module title bars, comfortable spacing between header and table.
- **My Feedback table**: keep columns SUBJECT | CATEGORY | STATUS | RATING | DATE | ACTIONS; vertically centered headers and rows, consistent horizontal padding, responsive, contained inside the card without touching card edges, with alignment per column (SUBJECT left; CATEGORY left or centered consistently; STATUS/RATING/DATE/ACTIONS centered).
- **Action buttons (Edit / Delete)**: same row with ~8–12px gap, similar height, not stretched, vertically centered in the Actions column; Edit keeps yellow/accent styling, Delete keeps red styling.
- **Responsiveness**: desktop uses the available content width with consistent margins; smaller screens keep fields full width, allow action buttons to wrap only when necessary, and keep the table usable; sidebar/header unchanged.
- **Cancel button**: stays on the Feedback page — no Dashboard navigation, no sidebar change, no unnecessary reload. In edit mode Cancel discards unsaved changes, exits edit mode, resets the form to create mode (clears fields, restores "Submit Feedback" label); in create mode Cancel clears/closes the form and returns to the normal Feedback module view.
- **Explicitly NOT changed**: submission logic, editing, deletion, rating, category/priority selection, DB/API integration, validation, auth, routing.

## Capabilities

### New Capabilities
- `student-feedback-layout`: The layout, spacing, alignment, sizing, and responsiveness of the student Feedback page — the Submit Feedback form card (padding, field alignment, rating buttons, Priority, and non-full-width Submit/Cancel buttons), the My Feedback section (navy header consistency, table column alignment, Edit/Delete button row) and the Cancel behavior that returns to the normal Feedback module view without navigation or reload.

### Modified Capabilities
<!-- No existing spec-level requirement changes. The student sidebar spec (student-sidebar-design) is untouched; changes are scoped to the Feedback content area. -->

## Impact

- **Frontend (student)**: `public/feedback.html` — adjust the inline scoped CSS (form-card padding, field/label spacing, rating-button sizing, button row, section gap, table alignment, responsive rules) and any class names required by those adjustments; keep the student shell, topbar, sidebar, header title bar, and theme untouched.
- **Frontend (JS)**: `public/js/feedback.js` — only the Cancel handler is adjusted to discard edit/clear state and restore create-mode without navigation; submit/edit/delete/history/modal logic unchanged (verify `renderFeedbackTable` markup still matches any new alignment classes).
- **Styling**: reuse existing tokens/classes (`student-panel`, `feedback-card`, `student-form-*`, `student-btn*`, `student-rating-*`, `student-table-*`, `student-badge-*`) and the navy/blue/yellow theme; no new dependencies, no edits to compiled `tailwind.css`, `theme.css`, or admin styling.
- **Non-goals (unchanged)**: admin/superadmin feedback management, backend routes/controllers/services/models, validation, auth, database schema, sidebar/header, dashboard/profile/request/announcements/returns pages.