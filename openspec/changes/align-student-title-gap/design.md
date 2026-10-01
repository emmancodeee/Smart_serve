# Design: Align Student Title Gap

## Context

Every student page renders its title inside `<main class="dashboard-main-inner|student-main-inner px-4 pb-8 pt-5 md:px-7">` followed by `<div class="module-title-bar [mb-5?]">…</div>`. The container's `pt-5` supplies the 20px gap between the sticky header and the title box — the same 20px Admin gives via `mt-5` on admin-requests' `module-title-bar`. The title box's visual styling is shared via `theme.css` `.module-title-bar` (variables in the `:root` block, lines 18-27).

Current spacing state:
- **Above title:** 20px on all six pages (via `pt-5`) — matches Admin `mt-5`.
- **Below title:** 20px on Dashboard, Feedback, Returns (theme.css line 47 gives the sibling `margin-top: 20px`, and these titles carry no `mb-5`), but **40px on Announcements and User Profile** because those titles also declare `mb-5` (20px) while theme.css additionally applies 20px `margin-top` to the next block.

So Announcements and Profile read as having an oversized gap below the title while the top gap stays 20px, making the title look unevenly placed. The Admin reference is symmetric `mt-5 mb-5` → 20px above + 20px below (admin-requests.html:99), and the standard admin page uses the same `pt-5` container rhythm (admin.html main).

## Goals / Non-Goals

**Goals:**
- Uniform 20px gap above the title box (header→title) and 20px below it (title→content) on all six student modules
- Title box spans the full content column between the page's `px-4`/`md:px-7` padding edges on every page
- Title box styling, header, sidebar, labels, routing, and functionality unchanged; `schedule.html`, Admin, Superadmin untouched

**Non-Goals:**
- No changes to the title box look (size, color, radius, text), header contents (Welcome, clock, profile, bell, menu button), sidebar design, or module content
- No HTML or JS edits

## Decisions

### 1. Pin the title box margins in `theme.css` and remove the double-spacing rule
Replace the current sibling rule
`body.theme-light :is(.dashboard-main-inner, .student-main-inner) > .module-title-bar ~ * { margin-top: 20px }`
with a single, uniform rule on the title box itself:
```
body.theme-light :is(.dashboard-main-inner, .student-main-inner) > .module-title-bar {
  margin-top: 1.25rem !important;    /* 20px header→title gap (matches Admin mt-5) */
  margin-bottom: 1.25rem !important; /* 20px title→content gap (matches Admin mb-5) */
}
```
**Important correction (discovered during implementation):** the container markup declares `pt-5`, but the compiled `tailwind.css` ships **no `.pt-5` rule** (nor `pb-8`, `md:px-7`; verified by rule lookup) — so the container contributes zero top padding. The title box margin must therefore provide the entire 20px header→title gap itself. An initial attempt set `margin-top: 0` (assuming the container's `pt-5` supplied the gap) and produced a 0px gap — the value was corrected to `1.25rem` after the compiled-CSS check. This also normalizes the bottom gap to exactly 20px everywhere (overriding the `mb-5` doubling on Announcements/Profile) and removes the two-source-of-truth sibling rule. Total rhythm = 20px/20px, identical to Admin `mt-5 mb-5`.

Rationale: pinning `margin` on the title box (not the sibling) makes the spacing rule one place and robust — no future `mb-*` utility on the title can reintroduce doubling. `.module-title-bar ~ *` is removed so the below-gap is owned entirely by the title margin. All six pages currently render the same container classes, so a single scoped rule yields uniformity.

### 2. Keep horizontal alignment untouched
Left/right edges already come from the page containers (`px-4 md:px-7`) and the title box is full-width, matching Admin's full-width title runway. No changes.

### Alternatives considered
- Setting `margin-top: 1.25rem` on the title box: rejected — it would stack with the container's `pt-5`, doubling the header→title gap to 40px (Admin is 20px).
- Editing `announcement.html` / `profile.html` to drop `mb-5`: rejected — CSS-only change preferred; a CSS pin beats markup edits and applies uniformly.
- Pinning per-page (`.announcements .module-title-bar`): rejected — a shared scoped rule covers all six modules uniformly, which is the requirement.

## Risks / Trade-offs

- **A page's container `pt-5`/`pb-8` utilities stay missing from the compiled Tailwind** → the title-bar margin is the sole source of the 20px top gap, so the gap is robust regardless of the compiled utility set; verified via computed style in tasks.
- **Removing the sibling rule could reduce a below-gap on a page that KNEW it** → All six pages' below-gap resolves to 20px via the new margin rule; measured pre/post identical on the non-buggy pages (Dashboard/Feedback/Returns unchanged at 20px).
- **`!important` margin could fight a layout script** → Only applies to `.module-title-bar` inside student main containers; no script sets title margins.

## Open Questions

None.