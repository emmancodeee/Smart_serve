# Design: Redesign Student Request Module into a 5-Step Registration Workflow

## Context

Smart Serve is a **server-rendered vanilla JS app** (Express + MongoDB backend, static multi-page HTML frontend in `public/`). There is no React/component framework. The Student Request module lives inside `public/dashboard.html` (`#requestSection`, lines 979–1105) with all logic in `public/js/dashboard.js` and shared styling in `public/css/theme.css` (design tokens in `:root`, Request module rules at lines 859–1168) plus inline `<style>` blocks in `dashboard.html` and a compiled Tailwind build (`public/css/tailwind.css`).

Today the module is an informal stepper: six tab buttons (ORF / Review / Modules / Books / Uniforms / Summary) with class `dashboard-step-tab`, a "Step X of 6" label, per-step panels toggled by `setRegistrationStep()`, and Back/Next/Submit in `.registration-workflow-footer`. This disagrees with the actual 5-step data model (`REGISTRATION_STEPS` has 5 entries), and the layout has overlapping/crowded content, misaligned columns, and stale compiled Tailwind classes.

Constraints from the requester: UI/UX only, no backend/schema changes, keep sidebar/header/branding/routing untouched, preserve every existing behavior (upload, OCR/preview, form hydration, module/book rows, uniform dropdowns, summary, submit via `PUT /api/auth/update-profile`, retry via `loadUserInfo()`), and honor the locked/approved state (`setRegistrationLocked`).

## Goals / Non-Goals

**Goals:**
- Deliver a clean 5-step registration workflow inside the existing Dashboard shell.
- Redesign markup/structure in `dashboard.html`, step-steering in `dashboard.js`, and styles in `theme.css`/`responsive.css` (regenerate Tailwind after any new utilities).
- Fix the 6-tabs-vs-5-steps mismatch and the layout/spacing defects.
- Make the module responsive (two columns desktop, stacked mobile, scrollable stepper).

**Non-Goals:**
- No changes to server code, routes, controllers, services, or MongoDB schema.
- No changes to the sidebar, header, authentication, or Request routing (`/dashboard#request`).
- No new features, no invented fields, no static placeholder data replacing real data.
- No new frontend frameworks, build tools, or dependencies.

## Decisions

### Decision 1: Keep the existing 5-panel data model and re-map step labels
The app already stores five conceptual steps; only the tab UI shows six. Decision: keep `registrationStepIndex` (0–4) and `setRegistrationStep(index)`, and redefine the visible labels to `['ORF', 'Student Information', 'Modules', 'Books', 'Uniforms & Summary']`. Panel 1 (currently "Review"/student info) becomes Step 2 "Student Information"; the last panel becomes Step 5 "Uniforms & Summary" and keeps `updateRegistrationSummary()` on entry. The "Step X of 5" badge, Back/Next/Submit visibility, and locked-state behavior all derive from the existing index/clamp logic.
- Rationale: avoids a risky data-model rewrite; the panel mapping and summary live in one place (`setRegistrationStep`).
- Alternative considered: splitting summary into its own 6th step — rejected because the requirement explicitly forbids a separate Summary/Review step.

### Decision 2: Replace the tab buttons with a DOM-rendered horizontal stepper
Rather than six static buttons, `dashboard.js` will render the 5-step indicator (circles, labels, connecting lines, badge "Step X of 5") into a container in `#requestSection`, re-rendered/updated by `setRegistrationStep()`. States (active/completed/upcoming) map cleanly from `registrationStepIndex`.
- Rationale: one render function keeps circles/labels/badge consistent across all five panels and lets the badge stay aligned right of the progress area; no duplication in HTML.
- Alternative considered: writing five per-step HTML blocks — rejected as repetitive and more error-prone.
- Locked/approved mode: when `setRegistrationLocked(true)` the stepper remains visible but non-interactive (following the existing disabled-inputs rule).

### Decision 3: Reorganize each step's HTML into consistent card grids
- Step 1 (ORF): two equal-height cards — `.orf-upload-card` (Choose File input `#editPicture`, filename, "PDF, JPG, PNG · Maximum 5MB") and `.orf-preview-card` (`#orfPreviewWrap` with a new empty state markup shown when no file exists; existing `renderOrfPreview()` still renders images/PDF).
- Step 2 (Student Information): existing fields re-flowed into a two-column grid (Name, Student Number | Age, Course | Year Level, Student Type), keeping ids `editName/editStudentNumber/editAge/editCourse/editYearLevel/studentType`; Course/Year Level/Student Type are selects with a shared arrow style.
- Steps 3–4 (Modules/Books): shared two-column layout — left "Available" hint/catalog context, right `#moduleRows` / `#bookRows` with the existing `createRowTemplate()` rows; empty states "No modules added yet." / "No books added yet."; existing `#addModuleRowBtn` / `#addBookRowBtn` kept as the "+ Add Module" / "+ Add Book" buttons.
- Step 5: left `.uniform-card` (`#editUniformType`, `#uniformSize`, `#uniformNotes` kept as selects/textarea fed by `REQUEST_CATALOG`), right `.summary-card` reusing `#registrationSummaryCards`/`#registrationSummaryDetailCards` content via the existing `updateRegistrationSummary()`.
- Footer: `#registrationBackBtn` (left), `#registrationNextBtn`, `#registrationSubmitBtn` (right) unchanged ids and handlers.
- Rationale: preserves all existing ids/handlers the JS references, so behavior is untouched while layout improves.
- Note: "Available" side of Steps 3–4 is a visual catalog panel; the existing additions come from `buildSelectOptionsMarkup()` catalog options, so no new data path is introduced.

### Decision 4: Style via `theme.css` design tokens + minimal new rules, and rebuild Tailwind
All new visual rules reuse the existing tokens (`--user-navy`, `--user-navy-strong`, `--user-bg-soft`, `--user-border`, `--user-muted`, `#FACC15` accent, current red/amber/pink error tones) and are scoped under the existing `.registration-workflow` section in `theme.css`, replacing/augmenting the current `.dashboard-step-tab` rules. The compact server alert reuses/stylizes `.user-info-error` / `.user-info-error-retry` so the Retry wiring is untouched. Responsive fallbacks (stacking grids, horizontally scrollable stepper) go in `responsive.css` (or the existing mobile block in `theme.css`).
- Rationale: one source of truth for tokens + module styles; matches how `student-feedback-ui-layout` and `student-sidebar-design` were styled.
- After any new Tailwind utility class is used in `dashboard.html`/`dashboard.js`, run `npm run build:css` (the compiled `tailwind.css` is currently stale for some arbitrary classes already in use).
- Alternative considered: heavy new inline `<style>` block in `dashboard.html` — rejected to keep styling centralized and consistent with the other student modules.

### Decision 5: Keep existing functions as-is; only adjust step label plumbing
`loadUserInfo()`, `populateRegistrationForm()`, `hydrateRegistrationDraft()`, `applyOrfExtraction()`, `renderOrfPreview()`, `createRowTemplate()`, `syncDraftFromForm()`, `updateRegistrationSummary()`, `setRegistrationLocked()`, and the submit handler SHALL remain unchanged. The only behavioral edits are to the step-label/stepper/badge strings and the `setRegistrationStep()` tab-swap logic (which becomes the stepper render call).
- Rationale: minimizes blast radius; all data, API calls, validation, and submit paths are unmodified.
- Alternative considered: rewriting the submit/validation flow — rejected (no requirement change).

## Risks / Trade-offs

- Stale compiled Tailwind (missing arbitrary utility classes) → Run `npm run build:css` after markup/JS edits and visually verify the Request view; prefer existing compiled utilities or plain CSS rules where possible.
- Touching `setRegistrationStep()` risks breaking Back/Next/Submit toggle and locked state → Keep the index arithmetic and clamping identical; unit-check panel visibility, badge text, and Submit-show/hide on last step.
- Panel 1 is data-critical; changing its heading/markup could perturb hydration targeting its inputs → Preserve every form id/name/select value attribute (all six fields), verify `populateRegistrationForm()` fills them after the reflow.
- ORF empty-state markup could conflict with `renderOrfPreview()` → Show the empty state by default and let `renderOrfPreview()` toggle it when a file exists (test data-URL, base64 PDF, and path sources).
- Locked/approved mode must still disable the new stepper and cards → Reuse `setRegistrationLocked()` selectors; add the same selector coverage for any new controls (e.g., stepper links).
- Regressing the mobile fallback from `responsive.css` ("Registration Vertical Stepper") → Replace that mobile block with the new horizontally scrollable stepper and verify no overlap/overflow.

## Migration Plan

1. Implement markup rework in `public/dashboard.html` `#requestSection` (title bar, alert, stepper container, five panels, footer).
2. Implement stepper render/update in `public/js/dashboard.js` alongside `setRegistrationStep()`; update labels/badge strings.
3. Add/adjust styles in `public/css/theme.css`; update responsive rules.
4. Run `npm run build:css` to compile any new Tailwind utilities.
5. Verify manually: all five steps, badge, Back/Next/Submit, upload+ORF preview, hydration, add/remove module & book rows, uniforms, summary, submit, retry, locked/approved state, desktop/tablet/mobile, and the existing Dashboard/other-module pages unaffected.
   Rollback: revert the three files (plus rebuilt `tailwind.css`) — no server/schema migration needed.

## Open Questions

- None blocking. Minor unknowns (final column pairing for Step 2 fields, exact stepper circle size) are resolved during implementation to match existing token spacing and the 16–24px / 12–16px spacing rules.