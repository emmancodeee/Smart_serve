## Context

The six Student Side modules render through shared main-column containers but space their title bars inconsistently:

| Page | Main container | Title-bar spacing mechanism | Result |
|---|---|---|---|
| Dashboard | `dashboard-main-inner grid gap-5 px-4 pb-8 pt-5 md:px-7` | grid row `gap-5` | 20px below header, 20px to first block |
| User Profile | `student-main-inner px-4 pb-8 pt-5 md:px-7` | `mb-5` on `.module-title-bar` | 20px below header, 20px below bar |
| Request | same container as Dashboard (hash view) | grid `gap-5` | same as Dashboard |
| Announcements | `student-main-inner px-4 pb-8 pt-5 md:px-7` | `mb-5` on `.module-title-bar` | 20px / 20px |
| Feedback | `student-main-inner grid gap-5 px-4 pb-8 pt-5 md:px-7` | grid `gap-5` | 20px / 20px |
| Returns | `student-main-inner grid gap-5 px-4 pb-8 pt-5 md:px-7` | grid `gap-5` | 20px / 20px |

Two different mechanisms (CSS grid `gap` vs. `mb-5` margin) currently produce the same ~20px values, but they are not interchangeable: a grid `gap` stacks additively with margins, while sibling margins collapse. Removing the grid container would collapse spacing to 0px unless a rule supplies it, and a future editor adding `margin-top` to a child would silently create ~40px gaps on one page and not another. The top header is sticky (`position: sticky; z-index: 20`) with `box-shadow` and `#152c69` background, so any spacing defect shows immediately as the title bar "touching" the header.

Constraints: no changes to sidebar design/colors/labels/icons/functionality, no new or duplicate titles, no page content or functionality changes, must remain responsive, and Admin pages plus the Schedule page (site amounts to pages without a module title bar) must be unaffected.

## Goals / Non-Goals

**Goals:**
- Exactly one shared mechanism that guarantees the module title bar sits on every Student module page ~16–24px below the top header and ~20–24px above the first content/first block.
- Consistent even spacing between the blocks below the title bar (e.g., the form and history panels on Feedback/Returns stay separated after the grid is removed).
- One-line diff footprint per page; no title, header, sidebar, or design changes anywhere.
- Works at all breakpoints (layout stays centered, edge padding unused).

**Non-Goals:**
- No change to the content rhythm inside cards/forms (existing `space-y-*` / internal grids are untouched).
- No change to the `.module-title-bar` look (blue `#152c69`, rounded top corners, white bold text) or its padding.
- No change to the top header or its sticky behavior.
- No change to the Schedule page or Admin pages.

## Decisions

### D1: Space everything after the title bar with one general-sibling CSS rule
Add to `public/css/theme.css`:

```css
/* Student side: unified vertical rhythm for module pages.
   Applies only inside main containers that contain a module title bar,
   so Admin and the Schedule page (no title bar) are unaffected. */
body.theme-light :is(.dashboard-main-inner, .student-main-inner) > .module-title-bar ~ * {
  margin-top: 20px;
}
```

Why: the selector keys off the presence of a first-level `.module-title-bar`, which exists only on the six Student modules. It gives every first-level block that follows the title bar a 20px `margin-top`. Adjacent sibling margins collapse (20px stays 20px), so existing child utilities like `mb-5` on an Announcements summary card do not stack into larger gaps. This single rule replaces the need for per-page `mb-5`/`grid` fiddling and makes the type bar → first content gap (and all downstream block gaps) uniform. No `:has()` dependency; the general sibling combinator is supported everywhere.

### D2: Drop `grid gap-5` from the three grid-based containers only
Change `dashboard-main-inner` (dashboard.html:1041), Feedback (`student-main-inner`, feedback.html:681), and Returns (`student-main-inner`, returns.html:733) from `grid gap-5 ...` to plain block containers. Their internal two-column layouts live in nested grids (`dashboard-layout-grid`, `registration-workflow`, `schedule-container`, `grid` utilities inside panels) and are unaffected by removing the outer one-column `grid`. Grid `gap` does not collapse with the new margin rule — keeping the grid would produce a 40px first gap — so this removal is required, not cosmetic.

Alternative considered: convert all containers to `flex flex-col gap-5`. Rejected — flex/grid `gap` still does not collapse with child margins and would leave two spacing mechanisms in play, and it changes the outer container's box model for pages that currently rely on block flow.

### D3: Keep the header→title-bar gap as the containers' existing `pt-5`
Every one of the six containers already sets `pt-5` (20px), which lands inside the requested 16–24px window. The shared rule does not need to touch it; implementation verifies it on all six rather than restating it in CSS. If a future shrink occurs, the same rule area is the single place to adjust.

### D4: Request view inherits the Dashboard rhythm automatically
The Request module is the `#request` view inside `dashboard.html`. Because spacing comes from the container + rule (not Request-specific markup), the Dashboard/Request toggle needs zero changes and stays evenly spaced in both views, including the hidden `#userInfoError` error strip (margin-top on a `display:none` sibling renders nothing; the following `#dashboardWorkspace` still gets its 20px).

## Risks / Trade-offs

- Removing the outer `grid gap-5` changes the space between the Feedback/Returns form panel and their history panels only in mechanism (gap → sibling margin), with the same 20px result. If a panel ever gains its own top margin, margins collapse so spacing stays 20px. → Low risk; verified in task 3.3.
- The rule uses `body.theme-light`; if the app ever drops theme-light these pages' custom styling (theme.css) already depends on it, so behavior stays consistent with the rest of the student skin. → Out of scope.
- `.module-title-bar` exists in `admin.css` too, but the rule's container selectors (`student-main-inner`/`dashboard-main-inner`) never match Admin markup. → Confirmed unaffected.
- No build/serve steps change; the fix is static HTML + CSS. Rollback = revert the four files.

## Migration Plan

- Deploy CSS + the three HTML edits together (they are interdependent: rule without grid removal leaves 40px; grid removal without rule leaves 0px).
- Rollback single file-set revert via git; no data or route impact.

## Open Questions

- None.