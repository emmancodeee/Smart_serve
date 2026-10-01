## Context

The Student Request module is a hash-view section inside `public/dashboard.html` (`#requestSection`, lines 1112–1247) shown when the sidebar "Request"/"Registration" link is active. `public/js/dashboard.js` controls it: `setDashboardSectionVisibility` toggles the section, `setRegistrationStep` swaps step panels by `data-step-panel` and re-skins tabs with `dashboard-step-tab` / `dashboard-step-tab is-active` classes, and `populateRegistrationForm` fills the student fields (`editName`, `editAge`, `editYearLevel`, `editStudentNumber`, `editCourse`, `studentType`, etc.) from the signed-in user. The dashboard loads `tailwind.css` (compiled utilities) and `css/theme.css` (theme-aware card/button/tab rules) only — `dashboard.css`/`responsive.css` are not linked.

Current problems: the title is a standalone navy `module-title-bar` (already full-width, top-rounded), then a separate navy bar holding the step label, then a slate tab strip with tabs laid out `grid-cols-2 md:grid-cols-3 lg:grid-cols-6` (six in one row on desktop), then the status message, then panels, then a footer whose layout relies on existing `justify-between`/margins. Section insets are inconsistent (status message padded at `px-2.5`, panels at `p-1.5`/`p-2.5`, tabs at `px-3`), so the page does not read as one aligned card. Student Information uses an `md:grid-cols-2 xl:grid-cols-3` grid with a col-span for Course and different field shapes.

## Goals / Non-Goals

**Goals:**
- One unified card: `module-title-bar` (navy, top-rounded, full width) + `#requestSection` card body, both spanning the same width with one consistent inner horizontal padding.
- 3×2 workflow tab grid with equal cells, centered text, rounded corners, navy active state.
- ORF step: two equal/equal-height columns.
- Review step Student Information: strict 2-column aligned layout (Name/Student Number, Age/Course, Year Level/Student Type).
- Status message re-aligned below the tabs with the same inset.
- Footer Back left / Next right with consistent sizing.
- `data-*` hooks, element IDs, and JS behavior untouched.

**Non-Goals:**
- No change to workflow logic, Next/Back/Submit handlers, ORF upload, student data handling, APIs, routes, database, auth.
- No change to header, sidebar, colors, or fonts.
- No changes to other modules or the module-title-bar theme variables.

## Decisions

- **Restructure `#requestSection` only, keeping every JS hook.** Decision: rewrite the markup inside `#requestSection` (and reuse the existing `module-title-bar` as the card header) while preserving all IDs (`registrationStepLabel`, `registrationStepTabs`, `registrationStatusMessage`, `completeRegistrationForm`, `registrationStepPanels`, `registrationBackBtn`, `registrationNextBtn`, `registrationSubmitBtn`, `editPicture`, `orfUploadMessage`, `orfPreviewWrap`, `editName`, `editAge`, `editYearLevel`, `editStudentNumber`, `editCourse`, `studentType`, `moduleRows`, `bookRows`, `editUniformType`, `uniformSize`, `uniformNotes`, `registrationSummaryCards`, `registrationSummaryText`, etc.), `data-step-panel`/`data-step-tab` attributes, and the `form` wrapping structure. Alternative considered — CSS-only overlay — rejected: aligning every section consistently is cleaner as a card restructure and remains JS-safe.

- **Unified card via one inset.** Add a single component wrapper pattern: the card body gets `border-t-0 rounded-b-[28px]` (squares up to the title bar) and a consistent `py-5 px-5 md:px-6` padding; every child section (step label row, status message, tabs, panels, footer) inherits that inset, guaranteeing identical left/right alignment. The `#userInfoError` connection banner stays where it is (full content width, matching alignment) and the `#registrationStatusMessage` moves below the tabs into the card body.

- **3×2 tabs with a base `.dashboard-step-tab` rule.** Keep the six `data-step-tab` buttons but render them as `grid grid-cols-3` (equal cells by default). Add a base `.dashboard-step-tab` rule in `theme.css` (border, radius, centered flex, padding, background) and reuse the existing `body.theme-light .dashboard-step-tab.is-active` navy styling. Rationale: `setRegistrationStep` rewrites each tab's `className` to `dashboard-step-tab [is-active] px-2.5 py-1.5 text-[10px]`, so the appearance must come from the class (Tailwind utilities can't carry border/radius reliably once JS overwrites them).

- **Student Information as a strict 2-column grid.** Change the field grid to `grid-cols-1 md:grid-cols-2` and order fields Name, Student Number, Age, Course, Year Level, Student Type (label + input pairs as equal cells with identical inner padding), removing the `md:col-span-2 xl:col-span-2` override on Course and the `xl:grid-cols-3`. All inputs keep `w-full` and equal heights via uniform min-height/computed height through the shared input classes already applied.

- **Move step label into the card.** Keep `#registrationStepLabel` (JS writes its text) but relocate it to a right-aligned badge on its own aligned row inside the card body top, instead of the old navy bar, and drop the old internal navy header bar (icon + label). This keeps "Registration Workflow" as the only navy header (the `module-title-bar`) as required.

- **Footer.** Keep the existing structure (Back + right-aligned `.registration-workflow-actions` containing Next/Submit) but normalize it with the card inset, `justify-between`, fixed-height/consistent-padding buttons, and margin-top spacing from content. Mobile (stacked, full-width buttons) handled by a small `@media` block in `theme.css` mirroring the existing responsive intent.

- **Mobile.** Add a `@media (max-width: 639px)` block in `theme.css`: tabs `grid-cols-3` → stack (or keep readable), step grids → 1 column, footer stacks and buttons go full width. Leverage existing Tailwind `md:`/`sm:` responsive prefixes in markup where possible to avoid new CSS.

## Risks / Trade-offs

- JS rewrites tab `className`, wiping Tailwind utility classes → Mitigation: define appearance on `.dashboard-step-tab` in `theme.css`; keep only `px-2.5 py-1.5 text-[10px]` utilities in the JS class string as today.
- Any `id`/`data-*` rename breaks the workflow → Mitigation: strictly preserve IDs and attributes; verify with `node --check` and a browser click-through of all 6 steps.
- Card attachment (square bottom corners on title bar already matches) needs the card body to have `rounded-t-none` so it doesn't fight the title bar → Mitigation: card uses `rounded-b-[28px]` only.
- `#registrationStatusMessage` moving below tabs changes where status text appears → Mitigation: matches the required section order (title → message → tabs → status → content); JS only sets `textContent`/`className` on the element, so relocation is safe.
- Dark vs light theme variants → Mitigation: all new styling lives in `theme.css` following the existing `body.theme-light` pattern; dashboard body is always `theme-light`.

## Migration Plan

- Frontend-only edits: `public/dashboard.html` (`#requestSection` restructure), `public/css/theme.css` (`.dashboard-step-tab` base + card/mobile rules). No data/server changes.
- Verify: `node --check public/js/dashboard.js` (if touched), serve the app, walk all 6 steps as a student, confirm in-place swapping, alignment consistency, equal columns, and mobile stack. Re-run `npm test` for regressions.
- Rollback = revert the two files.

## Open Questions

- None.