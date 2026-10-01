# Tasks: Fix Student Request 5-Step Workflow Functionality

## 1. Step steering & shared state (`public/js/dashboard.js`)

- [x] 1.1 Confirm `renderRegistrationStepper()` renders the five steps (ORF, Student Information, Modules, Books, Uniforms & Summary) as active `[data-step-target]` controls (role=button, tabindex=0) with `is-current`/`is-completed`/`is-upcoming` states and exactly one active state at a time
- [x] 1.2 Keep the existing delegated click/keydown handlers on `#registrationStepper` (Enter/Space + click) that call `setRegistrationStep()`; verify direct jumps do not reload or change URL
- [x] 1.3 Call `syncDraftFromForm()` at the start of `setRegistrationStep(index)` so the shared `registrationDraft` is current on every step change; verify values survive jumps (Step 2 → 4 → 2, and Back Step 5 → 1)
- [x] 1.4 Ensure `setRegistrationStep()` keeps the existing Back-disabled (step 1), Next-hidden / Submit-shown (step 5), and `Step X of 5` label behavior; no full page reload on any navigation

## 2. Validation & inline feedback (`public/js/dashboard.js`)

- [x] 2.1 Add `showWorkflowMessage(text, tone)` that writes a clear inline message into the existing `#registrationStatusMessage` (tone classes `dashboard-inline-message--*`) and auto-hides it on the next successful navigation
- [x] 2.2 Add `validateStep(index)` returning `{ ok, message, focusId }`: Step 0 requires ORF (`registrationDraft.pictureOfId` or `currentUser.pictureOfId` non-empty, focus `#editPicture`); Step 1 requires Name/Age/Course (focus first empty field); Steps 2–4 have no required fields
- [x] 2.3 Wire `#registrationNextBtn` to run `validateStep(registrationStepIndex)` first — on failure show the inline message, focus the field, and do not advance; on success advance via `setRegistrationStep`
- [x] 2.4 Wire the submit handler to run `validateStep` for each required part (ORF, Name/Age/Course, at least one requested item) using inline messages instead of `alert()` for validation failures, keeping the existing step-redirect behavior
- [x] 2.5 Leave direct numbered-step clicks and Back free of validation gates (jump-anywhere behavior preserved)

## 3. Submit loading & duplicate prevention (`public/js/dashboard.js`)

- [x] 3.1 Add module-scope `let registrationSubmitting = false;` and early-return if already submitting (prevents duplicate submissions)
- [x] 3.2 On submit start: disable `#registrationSubmitBtn`, set its label to "Submitting…", and restore label/disabled in a `finally` block when the fetch settles
- [x] 3.3 Keep submitting through the existing `PUT /api/auth/update-profile` payload/flow, success status update + `loadUserInfo()` refresh, and alert feedback on success/error (unchanged), verifying the form is NOT cleared on failure

## 4. ORF upload & status message styling

- [x] 4.1 Verify the Choose File flow: native picker opens, filename updates `#orfFileName`, selected file preserved in `registrationDraft.pictureOfId`, preview/empty-state toggles via `renderOrfPreview`, and existing `/api/auth/extract-orf` OCR runs with `applyOrfExtraction` feedback
- [x] 4.2 Add `.dashboard-orf-message` base + `--amber/--blue/--green/--red` tone rules to `public/css/theme.css` matching the exact class strings used by `setOrfMessage()` (light background, tinted border/text per tone)
- [x] 4.3 Confirm `setOrfMessage()` messages (progress, extracted, low-confidence, failed) render visibly styled after the CSS addition; keep `#orfUploadMessage` hidden until a message is set

## 5. Modules / Books / uniforms / summary (`public/js/dashboard.js`)

- [x] 5.1 Verify `#addModuleRowBtn` / `#addBookRowBtn` append a `createRowTemplate()` selection row populated from `REQUEST_CATALOG`, update the UI immediately, and that row selects save into `registrationDraft`; confirm "No modules/books added yet." empty states still show
- [x] 5.2 Verify each row's Remove (`[data-row-remove]`) deletes the row immediately and refreshes the summary; selections persist across steps
- [x] 5.3 Verify Step 2 dropdowns (Course / Year Level / Student Type) and Step 5 Uniform Type/Size dropdowns + Uniform Notes textarea are interactive and their values persist across step changes
- [x] 5.4 Verify `updateRegistrationSummary()` pulls live DOM/draft values (Name, Student Number, Course, Year Level, Student Type, Modules, Books, Uniform Type, Uniform Size, Uniform Notes) and updates instantly when the user goes back and changes a value
- [x] 5.5 Verify Retry (`#userInfoErrorRetry`) re-runs `loadUserInfo()` and hides the server alert on success

## 6. Approved/editable mode (`public/js/dashboard.js`)

- [x] 6.1 Remove the approved-status locks: `setRegistrationLocked()` is called unlocked, the stepper click guard, Back/Next disabling, Choose File guard, and the submit early-return no longer trigger on `approved`; the approved banner/pickup message stays visible as information only

## 7. Build & manual verification

- [x] 7.1 Run `node --check public/js/dashboard.js` and `npm run build:css`; grep for any lingering `alert(` used for step validation or any orphaned `dashboard-orf-message--*` class without CSS
- [ ] 7.2 Manually test the full flow in the running app: click every step (1–5) and back; enter student info, jump steps, return, confirm data retained; test Add/Remove Module & Book; test all dropdowns; test ORF upload (image + PDF) and empty state; test Retry; test Back/Next; test Submit success AND a failed submit (data retained, button restored, no duplicate request)
- [ ] 7.3 Verify approved users can edit and resubmit (status returns to pending) and no changes leaked to the sidebar, header, or other student pages; check desktop/tablet/mobile for the workflow (no horizontal overflow)
