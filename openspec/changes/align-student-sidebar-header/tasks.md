## 1. Header geometry pins

- [x] 1.1 Add header container pins to `public/css/theme.css`: scoped to `body.theme-light :is(.dashboard-sidebar, .student-sidebar:not(.drawer-sidebar)) > div:first-child`, set `display:flex`, `align-items:center`, `gap:1rem`, `padding:1.5rem`, `border-bottom:1px solid rgba(253,224,71,0.5)` (all `!important` to match Admin reference `px-6 py-6 gap-4 border-b border-yellow-300/50`)
- [x] 1.2 Add logo box pins (same scope, `> div:first-child span:first-child`): `width:3.5rem`, `height:3.5rem`, `border-radius:1rem`, `border:1px solid rgba(255,255,255,0.25)`, `background:rgba(255,255,255,0.1)`, `box-shadow:inset 0 2px 6px rgba(23,53,127,0.35)`, `flex-shrink:0` (matches Admin `h-14 w-14 ... border-white/25 bg-white/10 shadow-inner`)
- [x] 1.3 Add icon glyph pins (same scope, `> div:first-child svg`): `width:24px`, `height:24px`, `flex-shrink:0` (matches Admin 24px stroke 1.8 glyph; no color change)
- [x] 1.4 Add "Smart Serve" text pins (same scope, `> div:first-child h2`): `font-size:1.9rem`, `font-weight:700`, `letter-spacing:0.025em`, `line-height:1.16`, `color:#ffffff`, `margin:0` (matches Admin `text-[1.9rem] font-bold tracking-[0.025em] leading-[1.16]`)
- [x] 1.5 Add mobile header parity: in the same breakpoint/section as Admin (`responsive.css` 264-281), pin the student header to Admin's mobile values — header `padding-top/bottom:0.6rem`, `h2 font-size:1.3rem`, logo box `2.5rem`, logo svg `1.25rem` — scoped to the same student shells

## 2. Scoping safety

- [x] 2.1 Confirm the `:not(.drawer-sidebar)` guard excludes `schedule.html`'s drawer sidebar (its aside is `student-sidebar ... drawer-sidebar`) so header pins never apply there
- [x] 2.2 Confirm no rule in the new block targets the nav `<ul>`, `.dashboard-sidebar-link`/`.student-sidebar-link`, menu icons, or `.is-active` state (header-only scoping via `> div:first-child`)
- [x] 2.3 Confirm the pins set the same values Admin already renders from markup (no visual delta on logo/text/divider; pins only guarantee parity and prevent drift)

## 3. Layout verification

- [x] 3.1 Verify on the six student pages at desktop width: logo box 3.5rem, icon 24px, 1rem gap, 1.5rem left/right + top/bottom padding, `h2` 1.9rem/700, logo and text vertically centered, divider at the header's bottom edge
- [x] 3.2 Verify at Admin-matching mobile width: header padding-top/bottom 0.6rem, `h2` 1.3rem, logo 2.5rem, svg 1.25rem (matches Admin shrinkage)
- [x] 3.3 Verify no layout shift or reflow is introduced anywhere in the student sidebar header

## 4. Regression safety

- [x] 4.1 Run `git diff` and confirm only `public/css/theme.css` changed; all student/admin/schedule HTML and menu CSS/JS are untouched by this change
- [x] 4.2 Confirm `schedule.html` drawer sidebar, Admin/Superadmin sidebars, menu ordering/labels/routes/colors, active state, and functionality render unchanged (no console errors)
- [x] 4.3 Visual pass: student header renders pixel-identical to the Super Admin/Admin header on all six student pages