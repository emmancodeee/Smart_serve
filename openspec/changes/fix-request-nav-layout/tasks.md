## 1. Desktop navigation card spacing

- [x] 1.1 In `public/dashboard.html` inline `<style>`, change `.registration-workflow-footer` `margin-top` from `0.5rem` to `28px` and `padding` from `0.85rem 1rem` to `20px 24px`; confirm `display: flex; justify-content: space-between; align-items: center; gap: 0.75rem` (or `1rem`) and `width: 100%; box-sizing: border-box` remain present — no `position: absolute` added
- [x] 1.2 Mirror the same values in `public/css/theme.css` `.registration-workflow-footer` (`margin-top: 28px; padding: 20px 24px`) so both locations agree
- [x] 1.3 Add a `flex-wrap: wrap` guard to `.registration-workflow-actions` (in both `dashboard.html` inline and `theme.css`) so Next/Submit never overlap when space narrows; buttons keep `min-height: 44px` and their existing sizes/colors

## 2. Bottom gap and card separation

- [x] 2.1 Confirm `.registration-workflow` bottom padding yields a 16–24px gap below the navigation card (today `padding: 1.25rem` ≈ 20px); if the rendered gap is out of range, adjust the card's bottom padding only
- [x] 2.2 Ensure the footer's existing `border: 1px solid #dbe6fb; border-radius: 16px; background; box-shadow` (the "separate card" look) are untouched

## 3. Responsive rules

- [x] 3.1 Keep the tablet/desktop row layout: no change to the flex row above the breakpoints; verify Back stays left and Next right on one horizontal line
- [x] 3.2 Update the mobile blocks in `dashboard.html` (`@media (max-width: 768px)`), `theme.css` (`@media (max-width: 767px)`), and `responsive.css` so stacked full-width buttons still apply (Back then Next, no overlap) and horizontal padding matches `24px`
- [x] 3.3 Confirm no fixed/absolute coordinates are introduced anywhere in the footer/actions CSS

## 4. Verification

- [x] 4.1 Grep both files: `.registration-workflow-footer` shows `margin-top: 28px` and `padding: 20px 24px` in `dashboard.html` and `theme.css`; confirm no stray button-margin overrides were added to `.registration-nav-btn`
- [ ] 4.2 Load the dashboard in a browser (hard refresh) and check all 5 steps (ORF, Review, Modules, Books, Uniforms/Summary): last field → ~28–36px gap → navigation card with ~20px vertical & 24px horizontal padding → ~16–24px gap to card bottom
- [x] 4.3 Confirm Back/Next/Submit still navigate and toggle exactly as before (no functionality change) and that Back/Next sit on the same horizontal line on desktop/tablet
- [ ] 4.4 Confirm mobile/narrow view still stacks the buttons full-width without overlap and the header/sidebar/colors/forms are visually unchanged