## Context

The Announcement/Request Management page (`public/admin.html`) renders three registration tables. The first, `#registrationsTable` (Pending Registrations), is populated by `displayRegistrations()` → `appendRegistrationRow()` (`public/js/admin.js:2414`), which appends action controls directly into the `<td>`: View (blue, `bg-blue-600`), an optional ORF `<a>` (white/bordered), Approve (green, `bg-emerald-600`), and Archive (currently white/bordered). Each button carries `ml-2` leading margins, there is no wrapper element, and the base table rule sets `table td { vertical-align: top }` (`admin.css:613`). As the Actions column width is content-driven, buttons wrap/overflow unpredictably, gaps are uneven (no margin before View/Approve), and rows misalign across the table.

Constraints from the request: this change applies **only** to Pending Registrations' Actions column; no new colors or button redesigns; functionality, event handlers, and the rest of the module (Approved/Rejected tables, Inventory `[ Edit ] [ Archive ]`) remain untouched; the table keeps its 7-column structure including the empty-state `colSpan="7"`.

Existing responsive safety: `.admin-page .admin-table-wrap { overflow-x: auto; }` (`admin.css:2330`) scrolls the table horizontally on narrow screens, so a fixed-size grid cannot overflow the page.

## Goals / Non-Goals

**Goals:**
- Render every pending registration row's actions as an exact `[ View ][ ORF ]` / `[ Approve ][ Archive ]` 2x2 grid named `.action-buttons`.
- Equal button widths, uniform 6px gaps (rows and columns), no wrapping, no overlap, vertical centering within the row when neighbors are shorter/taller.
- Give the Actions column a stable, balanced width without squeezing adjacent columns.
- Keep all existing handlers and the existing blue/green/white button color vocabulary (View blue, ORF white, Approve green, Archive blue/white).

**Non-Goals:**
- No changes to Approved or Rejected registrations tables, Inventory Management Actions, or any other module.
- No page/sidebar/header/filter/typography/color-scheme changes.
- No API/backend changes; no new dependencies.
- No change to the 7-column structure, headers, or `colSpan` values.

## Decisions

### D1 — Wrap pending-row actions in a shared `.action-buttons` grid container
In `appendRegistrationRow`, add a `<div class="action-buttons">` container and append View/ORF/Approve/Archive into it whenever `showDecisionButtons` is true (the Pending path only; `displayRegistrations` calls with `true`). Approved/Rejected call with `false`, so their current inline flow is untouched.

- *Alternative considered:* Apply the grid to every registrations table for uniformity. Rejected — the change is explicitly scoped to Pending Registrations, and Approved/Rejected use a different button set (View/ORF/Archive/Set Pending) where a 2x2 grid is a poor fit.
- *Alternative considered:* Inline Tailwind classes on the wrapper (`grid grid-cols-2 gap-1.5`). Rejected — the request specifies a reusable named `.action-buttons` class, and a single CSS rule keeps per-button utility classes short and uniform.

### D2 — Grid config: `repeat(2, minmax(0, 1fr))`, `gap: 6px`, `width: 100%`
CSS scoped via `.admin-page #registrationsTable .action-buttons` (or `.admin-page .action-buttons` — see D4 scoping): `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; width: 100%;`. Two equal `minmax(0,1fr)` columns force View/ORF and Approve/Archive to align in exact pairs; a uniform 6px gap replaces the old piecemeal `ml-2` spacing in both directions. Grid auto-placement guarantees Row 2 sits directly under Row 1.

### D3 — Button sizing in grid mode: drop `ml-2`, add `w-full justify-center whitespace-nowrap`
Inside the grid, each button must fill its cell. Build button classNames from the current base classes, and in grid mode (a) strip the leading `ml-2`/`ml-3` margin classes (they would skew grid cells), (b) append `w-full justify-center whitespace-nowrap` (fill the cell, center the label, prevent "Archive"/"View" wrapping). `items-center text-xs font-semibold` and hover/focus variants stay. At the sized column (D4), each cell is ~80px — ample for the longest label ("Approve") on one line.

### D4 — Scope grid + column sizing to `#registrationsTable`; Actions column `width: 170px`; `vertical-align: middle`
Add to `admin.css`:
```
.admin-page #registrationsTable .action-buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; width: 100%; }
.admin-page #registrationsTable th:last-child, .admin-page #registrationsTable td:last-child { width: 170px; }
.admin-page #registrationsTable tbody td:last-child { vertical-align: middle; }
```
Rationale: content-driven width makes the column unpredictable; a fixed 170px balances enough room for two 80px buttons + gap without starving other columns. Scoping by table id guarantees Approved/Rejected tables and Inventory remain unchanged. `vertical-align: middle` centers the button stack against taller neighbor cells (overriding the base `table td { vertical-align: top }`).

- *Alternative considered:* `table-layout: fixed` to stabilize column widths. Rejected — it reflows all columns and risks clipping long Registration Summaries.
- *Alternative considered:* `min-width` only — rejected, it does not prevent the browser from growing the column.

### D5 — Archive restyled to the existing blue/white action button
Per the request, Archive becomes `bg-blue-600 text-white` (hover `bg-blue-700`, ring `ring-blue-400`) — the same existing blue style as View. No new color is introduced. Although this deviates from the neutral Archive style introduced in the earlier `update-admin-action-buttons` change, the request explicitly specifies "existing blue button style … white text", which takes precedence. The Archive confirm prompt and `archiveRegistration()` handler are unchanged.

### D6 — Super-administrator view-only mode
When `isSuperAdminViewOnlyMode()` is true, approve/archive buttons are suppressed and a "View only" label is rendered; the grid then contains only View (+ ORF if present), with the label appended outside the grid. This is acceptable and keeps code churn minimal; the 2x2 applies to the normal action-enabled path. Rows missing a document path render a 3-button grid (View/Approve/Archive); grid auto-placement leaves one cell empty in row 2 — rare and visually consistent.

## Risks / Trade-offs

- [Archive now visually identical to View (blue/white)] → Position (row 1 vs row 2) distinguishes them, the Archive confirm prompt still guards deletes, and this matches the explicit styling instruction. Acceptable by request.
- [Uniform-width buttons look more "boxy" than content-fit] → Consistency across rows and alignment are the stated goals; boxy is acceptable.
- [Pending table no longer matches Approved/Rejected action styling, which keep inline flow] → Intentional scope; can be revisited as a separate change if desired.
- [3-button rows (no ORF document) or view-only mode produce a non-2x2 grid] → Visually fine (auto-placement); documented in D6.
- [Regression risk in existing handlers/tests] → Node `--check` + a jest smoke test (grid present, no Reject/Remove/Delete strings, Archive uses blue class) + manual browser verification in the tasks.

## Migration Plan

Static assets only — no data migration. Deploy by shipping the edited `admin.js`/`admin.css`. Rollback is a git revert of the two files; browser cache-bust already applies (new asset requests).

## Open Questions

None blocking. (Minor: whether Approved/Rejected should eventually adopt the grid — deferred, out of scope.)