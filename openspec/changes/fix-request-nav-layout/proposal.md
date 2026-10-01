## Why

The Back / Next buttons at the bottom of each Request workflow step sit almost flush against the last form field above them (`margin-top` is only ~8px), so the final textbox and the navigation feel glued together. The navigation strip also lacks the internal breathing room and bottom separation a distinct navigation card should have, making the whole step look cramped.

## What Changes

- Increase the vertical gap between the last form field/content and the navigation container to ~28–36px (change the footer `margin-top` from ~8px to 28px).
- Keep the navigation as its own separate card/section (existing `border`, `border-radius: 16px`, background, and shadow are retained) with a comfortable internal padding of `20px 24px` (top/bottom 18–24px, left/right 24–32px).
- Keep Back on the left and Next on the right on the **same horizontal line** via `display: flex; justify-content: space-between; align-items: center` on `.registration-workflow-footer` (already the layout model — preserved and made explicit), with `width: 100%; box-sizing: border-box`.
- Add a ~16–24px gap between the navigation container and the bottom edge of the workflow card (bottom padding of the workflow card).
- Keep the existing button sizes and styles unchanged: Back stays an outline/white `.registration-nav-btn--back`, Next stays the dark blue filled `.registration-nav-btn--primary` with white text. No absolute positioning is introduced.
- Apply the same spacing and alignment to **all 5 workflow steps** (ORF, Review, Modules, Books, Uniforms/Summary), which is automatic because a single shared footer is rendered for every step.
- No change to Back/Next/Submit functionality, no change to colors, sidebar, header, or the form field layout.

## Capabilities

### New Capabilities
- `request-workflow-nav-layout`: Bottom navigation (Back/Next/Submit) presentation for the multi-step Request workflow — spacing from form content, the navigation card's padding/borders/gap, button alignment on one horizontal line, and responsive behavior at tablet/mobile widths.

### Modified Capabilities
<!-- No existing main spec is changed (no main spec covers the request workflow layout). -->

## Impact

- `public/dashboard.html` — inline `<style>` block: `.registration-workflow-footer` and `.registration-workflow-actions` rules, including the `@media (max-width: 768px)` mobile block and the `min-width: 1024px`/desktop rules that size the shell.
- `public/css/theme.css` — `.registration-workflow-footer` and `.registration-workflow` (bottom padding) rules plus the `@media (max-width: 767px)` footer/actions block.
- `public/css/responsive.css` — the `@media` block that restacks `.registration-workflow-footer` / `.registration-workflow-actions` to full width on small screens.
- No JavaScript (`dashboard.js`), no server, API, or DB changes. Buttons `#registrationBackBtn` / `#registrationNextBtn` / `#registrationSubmitBtn` keep their current classes, ids, and handlers.