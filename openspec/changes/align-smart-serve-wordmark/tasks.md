## 1. Wordmark sizing

- [x] 1.1 In `public/css/theme.css`, update the existing student-header wordmark pin (`:is(.dashboard-sidebar, .student-sidebar:not(.drawer-sidebar)) > div:first-child h2`): change `font-size` to `1.4rem !important` and add `white-space: nowrap !important`; keep weight 700, tracking 0.025em, line-height 1.16, color, margin unchanged
- [x] 1.2 Confirm the mobile (≤1023px) wordmark pin stays 1.3rem with nowrap inherited from the base rule (single line, fits ~118px)
- [x] 1.3 Confirm no other header property changed (logo box 3.5rem, glyph 24px, gap 1rem, padding 1.5rem, divider, vertical centering all untouched in this change)

## 2. Layout verification

- [x] 2.1 Confirm with the probe/browser measurement that 1.4rem "Smart Serve" fits the 150px text column with ~17px headroom
- [x] 2.2 Confirm at 1.4rem the wordmark stays on one line next to the logo at desktop width (no wrap, stack, overlap, or clip)
- [x] 2.3 Confirm at ≤1023px the 1.3rem wordmark stays one line with the Admin-matching shrink (logo 2.5rem, header padding 0.6rem)
- [x] 2.4 Confirm no layout shift or reflow is introduced in the header (dimensions still driven by the unchanged box/gap/padding values)

## 3. Regression safety

- [x] 3.1 Run `git diff` and confirm only `public/css/theme.css` changed by this change; no HTML, JS, menu, or admin/schedule CSS touched
- [x] 3.2 Confirm `schedule.html` drawer, Admin/Superadmin sidebars, menu order/labels/routes/colors, active state, and `.is-active` behavior remain unchanged (routes 200, no console errors)
- [x] 3.3 Visual pass: "Smart Serve" renders cleanly on one line beside the logo on all six student pages at desktop and mobile