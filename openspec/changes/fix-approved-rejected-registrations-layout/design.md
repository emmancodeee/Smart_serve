## Context

All three sections live in `public/admin.html` as sibling `section.admin-section` elements with identical markup:

- `<section id="registrationsPending" class="admin-section section-pending">` → `<table id="registrationsTable">` (Pending).
- `<section id="registrationsApproved" class="admin-section section-approved">` → `<table id="approvedRegistrationsTable">` (Approved).
- `<section id="registrationsRejected" class="admin-section section-rejected">` → `<table id="rejectedRegistrationsTable">` (Rejected).

Each table has the same 7 columns in the same order (Student Number, Full Name, Course, Registration Summary, Last Updated, Status, Actions) and each section header carries a status dot via `.section-*-h2::after` (pending amber `#f59e0b`, approved green `#22c55e`, rejected red `#ef4444`).

All rows for all three tables render through **one shared function**, `appendRegistrationRow(tbody, reg, showDecisionButtons, showSetPendingButton)` in `public/js/admin.js:2422`. Callers (`displayRegistrations` → `(true, false)`, `displayApprovedRegistrations` → `(false, true)`, `displayRejectedRegistrations` → `(false, true)`).

The renderer's current behavior:

- `const gridMode = Boolean(showDecisionButtons);` → only Pending wraps buttons in the `.action-buttons` grid; Approved/Rejected append buttons straight into the `<td>`.
- View (blue), ORF `<a>` (white outline; `ml-2` when inline), Approve (green; Pending only), Archive (blue; `ml-2` inline when outside the grid, or **blue** inside Pending's grid), Set Pending (amber outline; Approved/Rejected only, appended to the `<td>` directly).

Relevant CSS in `public/css/admin.css`:

- Shared generic table styles (lines 2345–2396): `.admin-page table` (width 100%, radius, separate borders), `thead` navy, `th`/`td` `padding: 14px 16px` — so header height, cell padding, and border radius are already identical across all three tables.
- `.admin-page .admin-section` (2030–2039) and `.admin-section + .admin-section` (2025) plus the official h2 module-title style (2046) apply to all three sections, so container width, margins, padding, and section-to-section spacing are already shared.
- Pending-only rules (2426–2440): `#registrationsTable .action-buttons` grid (`repeat(2, minmax(0,1fr))`, `gap: 6px`), `th/td:last-child { width: 170px }`, `tbody td:last-child { vertical-align: middle }`. Approved/Rejected have **none** of these.
- `.filter-toolbar { margin-bottom: 1rem }` (2874): Pending's header→table gap = h2 margin-bottom (1rem) + toolbar row (~44px) + toolbar margin-bottom (1rem). Approved/Rejected have no toolbar (no filter container in their markup — filters are out of scope).

Width math for unclipped nowrap buttons: td horizontal padding is 16px/side (generic rule). For two equal cells plus the 6px grid gap, a `240px` Actions column yields a content box of `240 − 32 = 208px`, i.e. `(208 − 6)/2 ≈ 101px` per cell — comfortable headroom for the widest label, `Set Pending` (text-xs/600 + `px-3` ≈ 86–96px), so text never clips, wraps, or overlaps.

Constraints: keep colors, labels, handlers, status logic, and data identical; do not touch the Pending reference behavior; no functionality/net-new features (e.g., no adding filter toolbars to Approved/Rejected); do not redesign the page shell.

## Goals / Non-Goals

**Goals:**
- Approved and Rejected render through the same `.action-buttons` 2-column visual system as Pending, in the explicit two-by-two shape `[View] [ORF] / [Archive] [Set Pending]` that mirrors Pending's own 2x2.
- Same column set/order and matching column proportions across all three tables; Actions cells sized and vertically aligned identically.
- Consistent row height (driven by the 2-row Actions grid), padding, and spacing; no excessive height or blank space.
- Match Pending's action-button colors exactly — View blue, ORF white/outline, Archive blue (same as Pending's Archive) — with Set Pending keeping amber/outline; Pending stays the untouched reference.

**Non-Goals:**
- No HTML markup changes (sections/tables/columns stay as-is).
- No changes to the status column logic or values, handlers, DB, auth, sidebar, header, typography, or functionality.
- No adding filter/search controls to Approved/Rejected sections.
- No changes to Pending's grid behavior, button colors, or column order.
- No changes to other tables/pages (`admin-returns`, feedback, inventory, etc.).

## Decisions

### D1 — Reuse the `.action-buttons` grid for Approved and Rejected; Pending unchanged
Change `gridMode` in `appendRegistrationRow` from `Boolean(showDecisionButtons)` to `Boolean(showDecisionButtons || showSetPendingButton)`. This makes Approved/Rejected use the same `.action-buttons` 2-column grid (6px gap, `minmax(0,1fr)`) as Pending. The Set Pending button is appended through the existing `appendAction` helper so it lands inside the grid container. Pending is unaffected (it already runs grid mode).

### D2 — Two-by-two Actions shape via natural grid auto-placement
In Approved/Rejected rows, all four buttons (View, ORF, Archive, Set Pending) are yielded into the `.action-buttons` grid in order, so CSS grid auto-placement produces exactly the Pending-shaped 2x2: View row1/col1, ORF row1/col2, Archive row2/col1, Set Pending row2/col2. No positioning helper classes are required — the previous 3-row `action-col-start` (grid-column: 1) plan is dropped. Because every button occupies one equal cell, all buttons share the same width/height/spacing in both rows, matching Pending's layout and rhythm. Rows whose record has no ID document render without ORF; auto-placement then degrades the same way Pending already does (View row1/col1, Archive row1/col2, Set Pending row2/col1) — no special handling needed.

### D3 — Button colors unified to Pending's reference
All three tables use one Archive style: Pending's blue (bg-blue-600 / white text / focus ring), identical to View's styling family. The previous per-section Archive branch (white/outline for Approved/Rejected) is removed, so the renderer no longer keys Archive's look on `showDecisionButtons`. View stays blue, ORF stays white/outline, Set Pending keeps its amber/outline style (Pending has no Set Pending button, so there is no Pending color to match and its existing style is preserved). No label, handler, or status changes.

### D4 — Actions column unified at 240px across all three tables
Extend the existing threshold selectors for last-child width and `tbody td:last-child` vertical alignment from `#registrationsTable` to also cover `#approvedRegistrationsTable` and `#rejectedRegistrationsTable`, and set the width to `width: 240px; min-width: 240px` for all three (Pending was `170px`). Rationale: with `whitespace-nowrap` buttons in two equal cells, `170px` yields ~66px cells — too narrow for `Set Pending`, risking cut-off/overlap (a stated must-not). `240px` gives ~101px cells (see Context). Unifying all three keeps the columns aligned across sections (the requirement) while eliminating clipping. All three tables change together, so proportions remain identical; the other columns (notably Registration Summary) absorb the extra ~70px proportionally.

### D5 — Header-to-table spacing matched without adding controls
Approved/Rejected have no filter toolbar by design. Add `margin-top: 1rem` to `.admin-page .section-approved .admin-table-wrap` and `.admin-page .section-rejected .admin-table-wrap` so each table starts with the same breathing room beneath the module-title header that Pending gets from its toolbar's closing margin. This is a deliberate approximation (Pending's total gap is taller because the toolbar toolbar-row exists), chosen because inventing an invisible spacer or adding controls would be worse (phantom layout or new functionality).

### D6 — Scope isolation
No changes to `public/admin.html`, the status badge logic (`registrationStatusBadgeClass`), the view logic, modals, or any other table. The `renderFilteredRegistrations` dispatch (admin.js:2019) sends all three tables through `appendRegistrationRow`, so the single renderer edit covers Approved and Rejected together — enforcing the "identical positioning" requirement automatically rather than by duplicating markup.

## Risks / Trade-offs

- [Actions column widens from 170px to 240px for all three tables] → Required so nowrap labels never clip/overlap; columns stay mutually proportional. Regression test greps confirm all three widths update together.
- [Approved/Rejected Archive changes from white/outline to Pending's blue] → Intentional per the revised requirement: buttons must match Pending's action-button colors exactly; it is the same blue family as View. Verified visually in the manual check.
- [Grid shape without ORF degrades for Approved/Rejected] → Matches how Pending already behaves for rows without an ID document; no special handling or layout hacks.
- [Inline `ml-2` fallback branches become unreachable] → Kept for safety (no current caller passes `(false)`/`(true,true)`); harmless dead-but-safe paths. No covered behavior changes.
- [Header-to-table spacing is approximate for Approved/Rejected] → Deliberate; document and confirm visually.
- [No visual/layout test harness] → Compensated with temp jest smoke assertions on CSS/JS strings plus the manual browser checkpoint; the DOM construction itself is unchanged beyond the grid container/classes.

## Migration Plan

Static assets only: `public/css/admin.css` and `public/js/admin.js`. No DB, schema, API, cache, or auth impact. Rollback is a two-file git revert.

## Open Questions

None.