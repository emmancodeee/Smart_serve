## 1. Unified Card Structure

- [x] 1.1 In `public/dashboard.html`, restructure `#requestSection` so the card body attaches below the `module-title-bar` with a square top / `28px` bottom radius and one consistent inner padding.
- [x] 1.2 Preserve all element IDs, `data-step-panel`, `data-step-tab` attributes, and the `#completeRegistrationForm` wrapper exactly as-is.

## 2. Workflow Tabs (3x2)

- [x] 2.1 Add a base `.dashboard-step-tab` rule in `public/css/theme.css` (border, rounded, centered flex, padding, background) so tabs render consistently after JS re-skins them.
- [x] 2.2 Render `#registrationStepTabs` as a 3-column × 2-row grid (ORF/Review/Modules row 1; Books/Uniforms/Summary row 2) with equal cells and consistent gap; keep the navy active-state styling.

## 3. ORF Step Columns

- [x] 3.1 Make the ORF step panel (`data-step-panel="0"`) two equal-width, equal-height columns: ORF Upload (left) and ORF Preview (right), with matching top alignment, a consistent gap, and padding so text never touches borders.

## 4. Student Information 2-Column Grid

- [x] 4.1 Reorder the Review step fields (`data-step-panel="1"`) into a strict two-column layout: Name | Student Number, Age | Course, Year Level | Student Type.
- [x] 4.2 Remove the `md:col-span-2 xl:col-span-2` override on Course and the `xl:grid-cols-3` grid so all six fields are equal cells with aligned labels and equal-height inputs.

## 5. Step Label and Status Message

- [x] 5.1 Remove the old internal navy header bar (icon + step label) from `#requestSection` and move `#registrationStepLabel` into the card body as an aligned right-side badge.
- [x] 5.2 Move `#registrationStatusMessage` below the workflow tabs inside the card body so it shares the same left/right inset.

## 6. Footer Alignment

- [x] 6.1 Normalize `.registration-workflow-footer`: Back left-aligned, Next (and Submit on the last step) right-aligned in the same row, consistent vertical alignment, consistent button size/padding, and clear spacing above the step content.

## 7. Responsive Behavior

- [x] 7.1 Add a `@media (max-width: 767px)` block in `theme.css` so tabs and step content stack vertically on small screens (below the 768px tablet cutoff) with no horizontal scrolling or overlap, and footer buttons go full-width.
- [x] 7.2 Confirm desktop/tablet keeps the 3×2 tabs and two-column step content.

## 8. Verification

- [x] 8.1 Run `node --check public/js/dashboard.js` and confirm the app starts (`npm start`) with no console errors.
- [ ] 8.2 Open the Request module as a student and verify step 1 renders: title → message → 3×2 tabs → ORF Upload | ORF Preview → Back (left) / Next (right), all aligned.
- [ ] 8.3 Click Next and verify step 2 renders in the same card: tabs stay fixed, status message shown, Student Information 2×3 fields populate with real student data and align.
- [ ] 8.4 Walk all remaining steps (Modules, Books, Uniforms, Summary) and confirm in-place swapping with identical card position and alignment.
- [ ] 8.5 Resize to a narrow viewport and confirm vertical stacking with no horizontal scroll or overlap.
- [x] 8.6 Run `npm test` and confirm no regressions from the layout change.