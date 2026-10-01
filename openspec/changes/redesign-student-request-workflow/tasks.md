# Tasks: Redesign Student Request Module into a 5-Step Registration Workflow

## 1. Request view markup rework (`public/dashboard.html`, `#requestSection`)

- [x] 1.1 Keep the existing sidebar, header, and shell markup untouched; confirm the active Request link and `/dashboard#request` routing are unchanged
- [x] 1.2 Replace the six `[data-step-tab]` buttons with a container that the JS renders the 5-step progress indicator into (steps: ORF, Student Information, Modules, Books, Uniforms & Summary; circles, labels, connecting lines) and keep the "Step X of 5" badge element aligned right of the progress area
- [x] 1.3 Ensure the compact server alert ("Cannot reach the server...") and Retry button (`#userInfoErrorRetry`) remain intact directly under the Registration Workflow title banner
- [x] 1.4 Step 1 (ORF): restructure into two equal-height cards — left ORF Upload card with `#editPicture` Choose File input, selected-filename display, and "PDF, JPG, PNG · Maximum 5MB" info; right ORF Preview card with an empty state (document icon + "No ORF uploaded yet.") toggled by existing `renderOrfPreview()`
- [x] 1.5 Step 2 (Student Information): reflow the six existing fields (`editName`, `editStudentNumber`, `editAge`, `editCourse`, `editYearLevel`, `studentType`) into a clean two-column grid with labels, required indicators where applicable, consistent height/borders, and dropdown styling for Course / Year Level / Student Type — no internal scrollable box
- [x] 1.6 Step 3 (Modules): restructure into a two-column Module Window / Selected Modules layout; keep `#moduleRows` and the `#addModuleRowBtn` "+ Add Module" button; add "No modules added yet." empty state
- [x] 1.7 Step 4 (Books): mirror Step 3 as Book Window / Selected Books; keep `#bookRows` and `#addBookRowBtn` "+ Add Book"; add "No books added yet." empty state
- [x] 1.8 Step 5 (Uniforms & Summary): keep `#editUniformType`, `#uniformSize`, `#uniformNotes` in a Uniform Window card (grouped with catalog options via existing selects) and place `#registrationSummaryCards`/summary list in a right Summary review card
- [x] 1.9 Footer: keep `#registrationBackBtn` left and `#registrationNextBtn`/`#registrationSubmitBtn` right with the same height/border radius and adequate bottom padding

## 2. Step steering logic (`public/js/dashboard.js`)

- [x] 2.1 Introduce a single stepper render function that draws the 5 circles/labels/lines and the "Step X of 5" badge from `registrationStepIndex` (active/completed/upcoming states) into the new container (no six-Button UI)
- [x] 2.2 Update `setRegistrationStep(index)` to call the stepper render and to use the 5-step labels `['ORF', 'Student Information', 'Modules', 'Books', 'Uniforms & Summary']`; keep the existing index clamping, panel visibility, Back-disabled / Next-hidden / Submit-shown-on-last-step behavior identical
- [x] 2.3 Correct the "Step X of 5" label (and remove any stale "Step 1 of 6") without changing `REGISTRATION_STEPS` length or step ordering
- [x] 2.4 Leave untouched: `loadUserInfo()`, `populateRegistrationForm()`, `hydrateRegistrationDraft()`, `setRegistrationLocked()`, `renderOrfPreview()`, `applyOrfExtraction()`, `createRowTemplate()`, `buildSelectOptionsMarkup()`, `syncDraftFromForm()`, `updateRegistrationSummary()`, add/remove module & book row handlers, and the submit handler (`PUT /api/auth/update-profile`)
- [x] 2.5 On file selection, keep the existing upload/OCR flow and ensure it toggles the ORF Preview empty state off and the existing preview on
- [x] 2.6 Ensure locked/approved mode disables any interactive stepper controls and the new step content consistently with the existing inputs-disabled rule

## 3. Styles (`public/css/theme.css`, `public/css/responsive.css`)

- [x] 3.1 Add/adjust Request module rules in the `.registration-workflow` section: compact navy "Registration Workflow" title banner, compact red/pink server alert (reuse `.user-info-error` styling), stepper circles/lines/states with the existing tokens (navy, blue, `#FACC15` accent applied only to active/highlighted elements)
- [x] 3.2 Style the two-column step cards (ORF upload/preview, student info form grid, modules/books windows, uniforms/summary) with white backgrounds, light blue-gray borders, rounded corners, subtle shadows, and equal-width equal-height columns
- [x] 3.3 Apply consistent spacing: 16–24px between sections, 12–16px between form fields, no overlaps, no unnecessary inner scrollbars, no tall empty areas
- [x] 3.4 Scope all new styles to the Request module so the Dashboard, profile, announcements, feedback, and returns pages are unaffected
- [x] 3.5 Update responsive rules (in `responsive.css` or theme mobile block): two columns on desktop, reduced spacing on tablet, stacked columns on mobile, horizontally scrollable stepper on small screens, no horizontal page overflow

## 4. Build and verification

- [x] 4.1 Run `npm run build:css` so any newly used Tailwind utility classes compile into `public/css/tailwind.css`
- [ ] 4.2 Start the app and verify all five steps render with correct active/completed/upcoming states and the "Step X of 5" badge
- [ ] 4.3 Verify Step 1 upload + OCR extraction + existing ORF preview (image and PDF) and the empty state
- [ ] 4.4 Verify Step 2 hydration from `/api/auth/me`, field editing, and dropdown options (Course / Year Level / Student Type)
- [ ] 4.5 Verify Steps 3–4 add/remove module and book rows with the existing catalog and that the summary reflects changes
- [ ] 4.6 Verify Step 5 uniforms and the Summary review card contents, then Submit posts to `PUT /api/auth/update-profile` and updates status as before
- [ ] 4.7 Verify the server-error alert Retry re-fetches data, the locked/approved state disables inputs, and Back/Next/Submit behavior on every step
- [ ] 4.8 Verify desktop, tablet, and mobile layouts (stacking + scrollable stepper, no horizontal overflow) and that sidebar/header/other student pages are unchanged