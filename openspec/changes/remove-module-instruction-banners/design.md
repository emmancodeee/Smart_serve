## Context

The three admin modules each show a decorative one-line description beside/below their section title:

- `public/inventory.html:139` — `.section-subtitle` "Manage all inventory items, stock levels, and availability." inside the `section-header-bar` (heading + subtitle + Add Item button).
- `public/admin-returns.html:272` — `p.dashboard-panel-copy` "View and manage student return requests for modules, uniforms, and books." inside the Return Management panel header (eyebrow + title + copy, with `#returnFilterContainer` on the right).
- `public/admin-feedback.html:268` — `p.dashboard-panel-copy` "View and manage student feedback submissions." inside the Feedback Management panel header (same layout, `#feedbackFilterContainer` on the right).

The inventory read-only banner ("Super admin can review inventory data here, but inventory changes stay read-only.") was already removed by the `remove-instruction-banners` change, along with its JS toggle and CSS; it is verified absent in the current source.

Layout notes: both `dashboard-panel` pages use `.dashboard-panel-header` (flex, justified between the title block and the filter container); the feedback page additionally carries the `.feedback-management-page` header rules (flex-wrap + `row-gap`) applied by the `fix-feedback-management-layout` change, so removing the copy `<p>` cannot break its header. Removing the paragraphs leaves only the eyebrow + title in the left block; no wrapper becomes empty, so no container removal is required on the two admin panels. On inventory, the `.section-header-bar` keeps the "Inventory List" heading and the Add Item button.

Constraint ladder: remove ONLY the three description lines; keep every title, filter, button, table, empty state, error, and permission; no backend/DB/auth/route changes; preserve the SmartServe navy/yellow design; collapse spacing so no blank gap remains.

## Goals / Non-Goals

**Goals:**
- Delete the three header descriptions (inventory subtitle, returns panel copy, feedback panel copy).
- Leave the headings, filter toolbars, tables, and Add/Export buttons fully intact and functional.
- Collapse any spacing so the filter row sits naturally beneath the heading with no empty band.

**Non-Goals:**
- Not redesigning the three pages, their headers, or the SmartServe design language.
- Not touching any other module or any other subtitle/description elsewhere in the app (student pages, Announcements, Dashboard, stat-card hints, etc.).
- Not changing the read-only permission on inventory or any role permissions on returns/feedback.
- Not modifying any JS, CSS, backend, database, authentication, authorization, or routes.
- Not re-adding or relocating any instructional text.

## Decisions

- **D1 — Delete each description `<p>` in place; keep the sibling heading/eyebrow and controls.** The copy lines are plain `p` elements whose only content is the description; removing the element removes its own margins, so no leftover styled box is possible. No redesign of the parent flex rows is needed — they still hold the eyebrow/title (left) and the filter container (right / wrapped row).
- **D2 — Treat the inventory section subtitle as in-scope despite it not being explicitly quoted.** The Return Requests and Feedback Management copy ("View and manage...") were explicitly named by the request, and the inventory subtitle ("Manage all inventory items...") is the same category of decorative module description. Removing it keeps the three modules consistent. It is a one-line revert if unwanted.
- **D3 — No JS or CSS edits.** None of the removed elements are referenced by script or stylesheet selectors that would break; `.section-subtitle` and `.dashboard-panel-copy` are generic classes still used elsewhere, so no CSS rule is removed. The feedback page's wrap rules (`#feedbackFilterContainer`) are untouched.
- **D4 — Preserve functionality and feedback entirely.** Filters, search, sort, reset, export, pagination, empty states, and view-only access alerts remain exactly as they are.

## Risks / Trade-offs

- [Removing the inventory subtitle could be seen as over-removal since the request only quoted the read-only banner] → Mitigation: explicitly noted in the proposal/Decision D2; the phrase patterns in the request ("View and manage...", decorative informational banners) cover it, and a one-line revert restores it if the user disagrees.
- [The panel header could look unbalanced after removing the copy line] → Mitigation: only the eyebrow + title remain in the left block, which is the standard two-line header treatment already used across the app; filters keep their own row/column position.
- [A stray reference to a removed element elsewhere] → Mitigation: grep verification task checks that none of the three strings and no removed-element ids remain.

## Migration Plan

Static frontend only; no data or API migration. Rollback is a revert of the three touched HTML files (`inventory.html`, `admin-returns.html`, `admin-feedback.html`). Changes stay in the working tree until the user runs the app.

## Open Questions

None — the one judgment call (inventory subtitle) is documented in D2.