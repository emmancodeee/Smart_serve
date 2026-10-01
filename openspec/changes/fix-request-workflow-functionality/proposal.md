## Why

The redesigned 5-step Request workflow looks correct but is not yet a dependable multi-step form: `Next` advances without validating the current step, `Submit` has no loading state or double-submit guard, validation feedback is browser `alert()` only, and the ORF upload status message references CSS classes (`dashboard-orf-message--*`) that are not defined anywhere so the OCR progress/result feedback renders unstyled. The numbered steps exist but the workflow must be audited end-to-end so every control is genuinely interactive and no state is lost while jumping between steps.

## What Changes

- **Guarantee clickable step navigation**: the five numbered steps (ORF, Student Information, Modules, Books, Uniforms & Summary) are active navigation controls; clicking one shows that step immediately without a page reload or URL change, using the existing `setRegistrationStep()`/`registrationStepIndex` steering. Keyboard access (Enter/Space) preserved. State entered in any step must survive jumping to other steps and coming back.
- **Per-step validation on `Next`**: before advancing, validate the current step's required fields (Step 1 ORF present; Step 2 Name/Age/Course required) and show a clear inline validation message instead of only `alert()`; do not advance when validation fails.
- **Direct step jumps stay unblocked**: clicking a step jumps immediately to that page regardless of incomplete validation (per the requested UX), while `Next`/`Submit` continue to validate.
- **Working `Submit` with feedback**: validate required fields + required ORF + at least one requested item, disable the button and show a loading state during the existing `PUT /api/auth/update-profile` call, prevent duplicate submissions, show success/error feedback, and do not clear the form on failure. Keep the existing API endpoint and payload.
- **Fix ORF status-message styling**: add real tone styles for the upload/OCR message (blue progress, green success, amber warning, red error) so OCR feedback is visibly styled.
- **Confirm + fix every Request control**: Choose File (native picker, filename shown, file preserved, preview/empty-state update), Retry (re-runs `loadUserInfo()`), Add Module / Add Book (append the existing catalog-select row), Remove Module / Remove Book, Category selects, Uniform dropdowns + notes, Back/Next/Submit navigation, and locked/approved behavior — no decorative buttons.
- **Shared workflow state**: keep one shared `registrationDraft` object (student fields, ORF, modules, books, uniforms) plus `registrationStepIndex`; do not reset components on step changes.
- No backend behavior changes; no new libraries; no redesign of sidebar/header or the global color scheme.

**BREAKING**: none.

## Capabilities

### New Capabilities
- `student-request-workflow`: the 5-step student request/registration workflow (ORF, Student Information, Modules, Books, Uniforms & Summary) — interactive step navigation, per-step validation on Next, live shared-draft persistence across steps, functional ORF upload/OCR feedback, add/remove module & book rows, live automatic summary, and a guarded Submit flow posting to the existing `PUT /api/auth/update-profile` endpoint.

### Modified Capabilities
<!-- No existing main specs cover the request workflow (openspec/specs only has student-feedback-ui-layout and student-sidebar-design), so no delta is required against main specs. -->

## Impact

- `public/js/dashboard.js` — the request workflow controller: step steering, validation, summary, ORF message classes, submit flow.
- `public/css/theme.css` — add tone styles for the ORF upload/OCR message (`dashboard-orf-message--amber/blue/green/red`) and any inline validation message style; minor disabled/loading state styling for `#registrationSubmitBtn`.
- `public/dashboard.html` — no markup changes expected except possibly a small inline validation message node under the Request footer/ORF card if needed.
- No backend/API changes; no database changes; no changes to sidebar, header, other student pages, or the existing `/api/auth/extract-orf` and `/api/auth/update-profile` endpoints.