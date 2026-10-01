## Context

The dashboard Request module (`public/dashboard.html` → `public/js/dashboard.js` → `public/css/theme.css`) was redesigned into a 5-step workflow (ORF, Student Information, Modules, Books, Uniforms & Summary) with a static-layout-first approach. The layout is correct, but the workflows' runtime behavior is only partially interactive:

- Step steering exists via `renderRegistrationStepper()` + `setRegistrationStep(index)` with event delegation on `#registrationStepper` (`data-step-target`), and `Next`/`Back` handlers in `attachRegistrationDraftListeners()`.
- There is **no validation** on `Next`; it advances unconditionally.
- `Submit` calls `PUT /api/auth/update-profile` but with no loading state and no double-submit guard; all feedback is `alert()`.
- `setOrfMessage()` writes `dashboard-orf-message dashboard-orf-message--{amber,blue,green,red}` classes that have **no CSS rules anywhere**, so OCR progress/result messages render unstyled.
- `REQUEST_CATALOG` (modules, books, uniform types/sizes, courses, year levels) is the app's existing catalog source; there is no backend catalog API, only `/api/auth/extract-orf` (POST) and `/api/auth/update-profile` (PUT).
- Approved users can revise their request and resubmit (status returns to `pending`); the approved banner/pickup message stays visible as information only.

This is a client-only change — no backend, DB, or API changes are allowed.

## Goals / Non-Goals

**Goals:**
- Every Request control is interactive: the 5 numbered steps (click + keyboard), Choose File, Retry, Add Module/Add Book, Remove Module/Remove Book, all selects/inputs/textarea, Back/Next/Submit.
- Per-step validation on `Next` (and Submit) with clear inline feedback; direct step jumps remain instant and unblocked.
- Shared workflow state (`registrationStepIndex` + `registrationDraft`) with no data loss when jumping between steps or going back.
- Submit shows a loading state, prevents duplicate submissions, and reports success/error without clearing the form on failure.
- ORF upload/OCR status messages visibly styled (blue/green/amber/red).

**Non-Goals:**
- No sidebar/header redesign, no global color-scheme change, no new libraries, no backend or data-model changes, no new API endpoints, and no schema/migration work.
- No new modal-based module/book picker: the existing catalog-select row template `createRowTemplate()` is the selection interface and is kept.
- Catalog `<li>` items remain informational (not converted into add-buttons) to avoid inventing UI that does not exist today.

## Decisions

**D1 — Keep event delegation for the stepper.** `#registrationStepper` re-renders its step nodes on every state change; a delegated `click`/`keydown` on the container (`closest('[data-step-target]')`) survives innerHTML replacement and avoids re-binding. `setRegistrationStep()` remains the single steering function used by step clicks, `Next`, `Back`, and initial load. Do not add per-node listeners.

**D2 — Validation only on `Next`/`Submit`, never on direct jumps.** Add a pure `validateStep(index)` helper returning `{ ok, message, focusId }`:
- Step 0 (ORF): ORF present — `registrationDraft.pictureOfId` or `currentUser.pictureOfId` non-empty (matches the existing submit rule). Focus `#editPicture`.
- Step 1 (Student Info): `editName`, `editAge`, `editCourse` non-empty (mirrors the existing submit checks). Focus the first failing field.
- Steps 2–3 (Modules/Books): optional entries are allowed; a row's select must have a non-empty value (row selects already start empty and are read by `getDraftRows()`, which filters blank → nothing to validate).
- Step 4 (Uniforms & Summary): no required fields.

`Next` calls `validateStep(currentStep)`; on failure it shows the inline message and does not advance. Stepper clicks and Back call `setRegistrationStep()` directly with no validation, per the "jump anywhere at any time, keep data" requirement.

**D3 — Inline feedback channel.** Add `showWorkflowMessage(text, tone)` writing into the existing `#registrationStatusMessage` (already styled via `.dashboard-inline-message--{pending,approved,rejected,default}`) with a `workflow`/`error` tone and auto-hide on the next successful navigation. Reuse `setOrfMessage()` for the ORF card-specific status. Keep the existing `alert()` calls on final Submit success/error to preserve current observable behavior; validation on `Next` becomes inline + field focus instead of `alert()`.

**D4 — Sync the shared draft on every step change.** `setRegistrationStep()` currently reflects values from the DOM on demand. Call `syncDraftFromForm()` at the start of `setRegistrationStep()` so `registrationDraft` is authoritative whenever the step changes, guarding against any future renderer that re-reads state instead of DOM. The single source of truth remains the mounted inputs (values survive panel hiding because panels are toggled with `display`, never re-created) plus `registrationDraft` for derived lists and ORF.

**D5 — Submit loading + duplicate guard.** Add a module-scope `let registrationSubmitting = false;`. In the submit handler, early-return if already submitting; on start, disable `#registrationSubmitBtn`, set `disabled textContent` to "Submitting…" (class names `registration-nav-btn--primary`), wrap the existing `PUT` in `try/finally`; on failure restore the button and message; on success keep existing status update + `loadUserInfo()` refresh. This satisfies loading state + duplicate-submission prevention with no library.

**D6 — Fix ORF message styling via CSS only.** Define `.dashboard-orf-message` + tone variants `--amber/--blue/--green/--red` in `theme.css` (light backgrounds, matching border/text per tone), keeping `setOrfMessage()`'s class strings unchanged so no JS contract changes.

**D7 — Approved registrations stay editable.** The approved banner/pickup message remains visible as information only, but `approved` no longer locks the workflow. The stepper click guard, `setRegistrationLocked()`, Back/Next disabling, Choose File guard, and the submit early-return are removed for the `approved` state; submitting an updated request resets the student to `pending` via the existing `PUT /api/auth/update-profile` backend behavior (rejected/users may already resubmit; approved now may too).

**Alternatives considered:** (a) A per-node stepper re-render + rebind instead of delegation → rejected, wasteful and error-prone. (b) Validation on direct jumps → rejected, contradicts the explicit "click any step at any time" requirement. (c) A new Web Component or state library → rejected, overkill for a single page and violates the no-new-libraries constraint. (d) Making catalog `<li>` quick-add buttons → rejected, not requested and risks surprising behavior; the row-select is the existing interface.

## Risks / Trade-offs

- [Repeated `syncDraftFromForm()` runs per step change] → Cheap reads of a handful of nodes; no measurable cost. Summary updates already call it.
- [Over-validation blocking the "jump anywhere" UX] → Validation is confined to `Next`/`Submit` (D2); direct jumps never validate.
- [Delegation misses clicks if a handler is removed/no container] → Container is static in markup `#registrationStepper`; guard `if (!stepper) return`.
- [ORF message tone markup diverging from CSS] → Tone classes are defined in exactly one mapping (`setOrfMessage`) and CSS now matches those exact class names (D6).
- [Submit button text/disabled state leaking if fetch throws] → `finally` restores `textContent` and `disabled`; duplicate guard prevents re-entry.
- [Approved users accidentally resubmitting an unchanged request] → Status resets to pending for re-review; this is the desired workflow so admins can re-evaluate changed requests.

## Migration Plan

No deployment/migration required — a pure front-end enhancement. Rollback: revert edits to `public/js/dashboard.js` and `public/css/theme.css`; no cache-busting concerns beyond normal browser refresh.

## Open Questions

- None blocking. Minor: whether catalog `<li>` quick-add should be added later — resolved as informational-only for now (see Non-Goals).