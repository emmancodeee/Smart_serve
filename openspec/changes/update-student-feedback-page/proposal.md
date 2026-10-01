## Why

The student Feedback page (`public/feedback.html`) works correctly but its UI is not polished: the form sits in a plain white panel with the page title above it, there is no blue card-header treatment, the submit button is not full width, and the two sections (Submit Feedback / My Feedback) are not visually treated as matching cards. The page should look like a modern student portal — clean white rounded cards with blue headers, rounded form controls, consistent spacing, and proper alignment — while preserving all existing backend logic, API calls, form field names, and submission behavior.

## What Changes

- Wrap the feedback form in a large white rounded card with a blue header labeled "Submit Feedback" (bold white text, left-aligned).
- Wrap the feedback history in a separate white rounded card with a matching blue header labeled "My Feedback", placed directly below the submit card.
- Apply rounded corners (approximately 8–12px), thin light-blue/gray borders, white backgrounds, and comfortable padding to the existing select, input, and textarea controls. The Detailed Feedback textarea stays taller than other fields.
- Keep the existing form field names, ids, validation, backend routes, API calls, and submission/edit/delete/view logic unchanged.
- Style form labels dark navy, medium/bold weight, directly above each field, with the required "*" kept red and consistent label/field spacing.
- Keep the existing 1–5 rating functionality rendered as small rounded rectangular buttons with the hint "1 = Poor, 5 = Excellent".
- Keep the existing Priority select as a full-width field styled identically to the other controls.
- Make the Submit Feedback button full width inside the form, blue background, white bold text, rounded corners.
- Align the two cards to the same width with matching left/right margins; keep all form fields equal width and left/right aligned.
- Give the My Feedback table a very light blue header and keep clean, equal, responsive column alignment (SUBJECT | CATEGORY | STATUS | RATING | DATE | ACTIONS); keep the centered "No feedback submitted yet" empty state.
- Keep the student sidebar, header, topbar, and page title styling; ensure the layout is responsive with no overlap, overflow, or cut-off content.
- Do NOT change backend logic, database logic, API calls, routes, or existing functionality.

## Capabilities

### New Capabilities
- `student-feedback-page`: Student-facing Feedback page UI — two aligned white rounded cards (Submit Feedback form card and My Feedback history card) with blue headers, rounded form controls matching the existing input/select/textarea elements, full-width submit button, and a clean responsive history table, all within the existing Smart Serve navy/blue theme.

### Modified Capabilities
<!-- No existing spec-level requirement changes. The student sidebar spec (student-sidebar-design) is untouched; the changes are scoped to the feedback content area. -->

## Impact

- **Frontend (student)**: `public/feedback.html` — restructure the content area into a Submit Feedback card (blue header + form) and a My Feedback card (blue header + history table); adjust scoped CSS (rounded controls, blue card headers, full-width submit button, aligned cards, light-blue table header) while keeping the student shell, topbar, sidebar, and theme untouched.
- **Frontend (JS)**: `public/js/feedback.js` — no functional changes expected; only verify existing handlers (submit, edit, delete, view, modal, history rendering, empty state) continue to work against the new markup.
- **Backend / API**: none — the auth routes, controller, service, models, validation, and `GET/POST/PUT/DELETE /api/auth/feedback` behavior are unchanged.
- **Styling**: reuse the existing Tailwind + inline page CSS (`student-panel`, `student-form-input/select/textarea`, `student-btn`, `student-table-*`, `student-rating-*`, `module-title-bar`) and the navy/blue theme; no new dependencies.
- **Non-goals (unchanged)**: admin feedback management, backend routes/validation, student sidebar/header/dashboard/profile/request/announcements/returns, auth, database schema.