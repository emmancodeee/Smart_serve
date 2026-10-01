# Proposal: Redesign Student Request Module into a 5-Step Registration Workflow

## Why

The current Student Request page presents registration as six large tab-looking buttons (ORF / Review / Modules / Books / Uniforms / Summary), with crowded, misaligned content, overlapping layout problems, inconsistent column spacing, and a step indicator that disagrees with the five actual workflow steps (`REGISTRATION_STEPS` has 5 entries while 6 tab buttons render and the label reads "Step 1 of 6"). This makes the workflow feel unfinished and confusing for students completing registration.

## What Changes

- Replace the current six-button step tab bar with a proper horizontal 5-step progress indicator (1 ORF, 2 Student Information, 3 Modules, 4 Books, 5 Uniforms & Summary) with circular steps, connecting lines, completed/active/upcoming states, and a "Step X of 5" badge.
- Merge the current "Review" and "Summary" steps into Step 5 ("Uniforms & Summary"); the "Review / Student information" form stays as Step 2 ("Student Information").
- Redesign the page into one clean centered container: a "Registration Workflow" navy title banner, the existing server-error alert with Retry button, the 5-step progress indicator, a single step content card, and Back / Next / Submit navigation.
- Reorganize Step 1 (ORF) into a two-column equal-height layout: ORF Upload card (Choose File, filename, supported formats) and ORF Preview card (empty state + existing preview).
- Reorganize Step 2 (Student Information) as a clean two-column form (Name, Student Number, Age, Course, Year Level, Student Type), using existing fields and dropdown data.
- Reorganize Steps 3 (Modules) and 4 (Books) into a shared two-column card layout: an available/catalog area and a "Selected" area with add-row controls and empty states, alongside the existing Add Module / Add Book buttons.
- Rebuild Step 5 as "Uniforms & Summary": a Uniform Window card (Uniform Type, Uniform Size, Uniform Notes) and a Summary review card listing student details plus selected modules, books, and uniform info.
- Fix spacing/alignment problems (no overlapping content, no unnecessary inner scrollbars, equal-width columns, consistent 16–24px section and 12–16px field spacing, buttons aligned on one baseline, Back left / Next/Submit right).
- Make the workflow responsive (two columns on desktop, stacked on mobile, horizontally scrollable progress indicator on small screens, no horizontal page overflow).
- Keep the existing sidebar, header, branding, colors, routing, and all functional logic (upload, OCR extract, preview, form hydration, module/book/uniform selection, summary generation, Back/Next/Submit, retry, API/database calls) intact. No breaking changes.

## Capabilities

### New Capabilities
- `student-request-workflow`: Defines the layout and visual design of the Student Request/Registration view inside the Dashboard — the Registration Workflow title bar, server error alert, 5-step progress indicator, per-step content layouts (ORF, Student Information, Modules, Books, Uniforms & Summary), navigation actions, spacing/alignment rules, responsive behavior, and the requirement that all existing functionality is preserved.

### Modified Capabilities
- None. No existing requirement-level behavior from other specs is changing.

## Impact

- `public/dashboard.html` — Request section markup (`#requestSection`, tabs, step panels, footer actions) reworked into the 5-step layout; sidebar, header, and shell markup unchanged.
- `public/js/dashboard.js` — step navigation to drive the 5-step progress indicator (labels, circles, "Step X of 5", Back/Next/Submit visibility); all existing state, data hydration, upload/OCR, row add/remove, summary generation, submit, and retry logic retained.
- `public/css/theme.css` — new/changed Request module styles (progress indicator, title banner, compact alert, two-column step cards, uniform/summary cards, spacing); existing design tokens (`--user-navy`, `--user-navy-strong`, `--user-blue`, borders, `#FACC15` accent) reused.
- `public/css/responsive.css` — responsive rules for the new layout if needed.
- No changes to `server.js`, routes, controllers, services, or the MongoDB schema. APIs `GET /api/auth/me`, `POST /api/auth/extract-orf`, and `PUT /api/auth/update-profile` are consumed exactly as today.
- Need to regenerate Tailwind before running the app for any newly used utility classes.