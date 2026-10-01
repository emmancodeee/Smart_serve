## Why

Admin > Request Management (Request Management module in `public/admin.html`) shows Pending, Approved, and Rejected Registrations as three sibling sections, but the Approved and Rejected sections diverge from the Pending reference in several layout details:

- **Actions column organization:** Pending rows wrap their buttons in a `.action-buttons` 2-column grid, while Approved/Rejected rows append View, ORF, Archive, and Set Pending directly into the cell with `ml-2` margins, producing ragged, inconsistently positioned buttons that do not form a clean group.
- **Actions column sizing/vertical alignment:** only `#registrationsTable` has an Actions-column width and `vertical-align: middle`; the Approved/Rejected tables do not, so their Actions cell sizes and alignment differ.
- **Header-to-table spacing:** Pending has a SmartFilter toolbar between the section header and table; Approved/Rejected have nothing, collapsing that gap.
- **Column proportions/row rhythm:** because the Actions cell and action markup differ, the three sections do not read as one table design despite identical headers and shared generic table styles.

## What Changes

- Route Approved and Rejected rows through the **same `.action-buttons` 2-column grid** used by Pending, in the same compact two-by-two arrangement:
  - Row 1: `View` | `ORF`
  - Row 2: `Archive` | `Set Pending`
  achieved by giving Approved/Rejected rows the same grid wrapping Pending already uses, so Pending's existing 2x2 (`View | ORF` / `Approve | Archive`) stays untouched and no extra positioning classes are needed.
- Unify the Actions column width across all three tables at `240px` (Pending was `170px`) so two equal nowrap cells comfortably fit the widest label (`Set Pending`) — no cut-off, no overlap — and so all three columns line up.
- Extend the Actions-column `vertical-align: middle` to Approved/Rejected rows.
- Match header-to-table spacing by giving the Approved/Rejected `.admin-table-wrap` a `1rem` top margin (Pending's gap is supplied by its filter toolbar; no filter controls are added, since that would be new functionality).
- Match Pending's action-button colors exactly: View stays blue, ORF stays white/outline, and Approved/Rejected Archive becomes blue like Pending's Archive (no per-section Archive color difference); Set Pending keeps its existing amber/outline style (Pending has no equivalent button). Section header indicators keep amber/green/red dots.
- Keep all seven columns, their order, status values/logic, and all four handlers (`viewUser`, ORF link, `archiveRegistration`, `updateRegistrationStatus(reg,'pending')`) exactly as they are.

## Capabilities

### New Capabilities
- `approved-rejected-registrations-layout`: The layout contract for the Approved and Rejected Registrations sections in Request Management — matching Pending's table/section proportions, a two-by-two Actions grid identical in shape and colors to Pending's (View/ORF/Archive blue/outline styles), Actions column width/vertical alignment, header-to-table spacing, preservation of all colors/handlers/status logic, and identical alignment across all three sections.

### Modified Capabilities
<!-- None: no existing spec requirements change. -->
- (none)

## Impact

- `public/css/admin.css` — (a) generalize the `#registrationsTable` `.action-buttons` grid, `th/td:last-child` width, and `tbody td:last-child vertical-align` selectors to also cover `#approvedRegistrationsTable` and `#rejectedRegistrationsTable`; (b) set that width to `240px`/`min-width: 240px` for all three; (c) add a `1rem` `margin-top` to `.admin-page .section-approved .admin-table-wrap` and `.admin-page .section-rejected .admin-table-wrap`.
- `public/js/admin.js` — `appendRegistrationRow` only: `gridMode` becomes `Boolean(showDecisionButtons || showSetPendingButton)`; the Archive button uses Pending's blue style in all three tables (the white/outline Approved/Rejected variant and `action-col-start` additions are removed); the Set Pending button joins the grid container via `appendAction` with grid fills.
- `public/admin.html` — untouched (section/table markup, columns, and indicators already match Pending's structure).
- No backend/API/DB/auth changes, no new dependencies; only two static assets are edited.