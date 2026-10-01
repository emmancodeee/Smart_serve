## Why

The Student Request module (the `#requestSection` inside `public/dashboard.html`) has inconsistent spacing and alignment across its workflow steps: the workflow tabs are a single cramped row, ORF Upload/Preview and the Student Information fields are uneven, and the sections do not share a common left/right alignment. The result looks disjointed rather than one unified card, and the layout shifts between workflow states.

## What Changes

- Restructure the Request module into ONE unified white card that attaches to the existing full-width navy "Registration Workflow" title bar.
- Replace the single-row workflow tab bar with a clean 3-column × 2-row grid: ORF | Review | Modules (row 1), Books | Uniforms | Summary (row 2) — equal widths, equal heights, centered text, rounded corners, consistent spacing, no overlap, no tabs touching the container edge; the active tab uses the existing Smart Serve navy active-state styling.
- Make the ORF step content two equal, equal-height columns: ORF Upload (left) and ORF Preview (right), with proper padding and gap.
- Restructure the Review step's Student Information into a strictly 2-column aligned layout: Name/Student Number (row 1), Age/Course (row 2), Year Level/Student Type (row 3) — equal column widths, equal input heights, aligned labels and inputs, consistent spacing. Student data keeps being filled from the actual application data (no hardcoding).
- Move the status message slot so status text ("Your registration is approved.", etc.) sits below the workflow tabs, using the same horizontal alignment as the tabs and content.
- Keep the step label badge but place it inside the card with the same alignment as other sections.
- Standardize the footer: Back left-aligned, Next (and Submit on the last step) right-aligned, same vertical alignment, consistent sizing/padding, clear spacing above.
- Apply one consistent horizontal padding to ALL sections inside the card (title, connection message, tabs, status message, panel content, footer) so every state renders as ONE unified card with no content touching edges and no horizontal overflow.
- Keep responsive behavior: 3×2 tabs / 2-column step content on desktop and tablet; vertical stacking on small screens with no horizontal scroll.

## Capabilities

### New Capabilities
- `student-request-workflow-layout`: Defines the unified-card layout, 3×2 workflow tab grid, equal ORF columns, 2-column aligned Student Information, message alignment, footer alignment, and responsive behavior for the Student Request module.

### Modified Capabilities
<!-- None: no existing spec-level behavior changes; this is presentation-only. -->

## Impact

- `public/dashboard.html` — `#requestSection` markup restructure (ids, data attributes, and workflow JS hooks preserved).
- `public/css/theme.css` — base styles for `.dashboard-step-tab`, the unified card sections, and the Student Information grid; mobile rules.
- `public/js/dashboard.js` — only if required to keep the layout functional; existing step logic/A-IDs are preserved (no behavioral changes).
- No API, route, database, auth, header/sidebar, or other student module changes.