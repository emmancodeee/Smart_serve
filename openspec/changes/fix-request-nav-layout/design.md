## Context

The Request workflow is a 5-step form (ORF, Review, Modules, Books, Uniforms/Summary) rendered inside a unified card (`.registration-workflow`) on the student dashboard. All five steps share one bottom navigation footer (`.registration-workflow-footer`) that holds `#registrationBackBtn` on the left and `.registration-workflow-actions` (Next + hidden Submit) on the right.

Today that footer is defined three times:
1. `public/dashboard.html` inline `<style>` (the active one on the page — `margin-top: 0.5rem`, `padding: 0.85rem 1rem`, sticky bottom card).
2. `public/css/theme.css` `.registration-workflow-footer` (`.margin-top: 1.5rem`, `padding: 1.4rem 0 0.4rem`).
3. `public/css/responsive.css` mobile block that restacks footer/actions to full width.

The buttons themselves (`.registration-nav-btn--back` outline white, `.registration-nav-btn--primary` dark blue filled, `min-height: 44px`) are fine. The problem is purely the footer's spacing: the ~8px `margin-top` makes the buttons touch the last form field, and the padding is thinner than a comfortable navigation card needs. The footer already uses `display: flex; justify-content: space-between; align-items: center`.

Constraint inherited from the proposal: CSS-only change. No `dashboard.js`, no backend, no API. Do not touch the overall design (colors, sidebar, header, form layout) or the buttons' visual style/sizes/function.

## Goals / Non-Goals

**Goals:**
- A consistent 28–36px gap between the last form field and the bottom navigation card on every step.
- The navigation remains a distinct card with `padding: 20px 24px` (18–24px vertical, 24–32px horizontal), existing border/radius/shadow retained.
- Back and Next stay on the same horizontal line, Back left / Next right, vertically centered, via `display: flex; justify-content: space-between; align-items: center` (no absolute positioning).
- A ~16–24px gap between the navigation card and the workflow card's bottom edge.
- Responsive: same-line layout where width allows; full-width stacked buttons on narrow screens without overlap.
- Zero timer/`animation`/layout impact on forms — pure spacing changes.

**Non-Goals:**
- No repositioning of buttons with `position: absolute`/`fixed` new fabrication.
- No change to button classes, `min-height: 44px`, sizes, colors, or handlers (Back/Next still work exactly as today; sticky footer behavior is preserved).
- No HTML restructure of `dashboard.html` markup (only its inline `<style>`).
- No refactor to de-duplicate the three CSS blocks into one file (out of scope).

## Decisions

**D1 — Apply the same targeting values to all three CSS locations.**
Edit `.registration-workflow-footer` in `dashboard.html` (inline), `theme.css`, and the mobile blocks in `dashboard.html` + `theme.css` + `responsive.css` so every screen size reads consistent values. Rationale: the inline block wins on the page today; editing only `theme.css` would not fix the rendered result. Alternative considered: moving the rule out of the inline `<style>` — rejected, too invasive for a CSS-only change and risks cascade changes.

**D2 — Spacing uses the container, not the buttons.**
`margin-top: 28px` on `.registration-workflow-footer` creates the required 28–36px breathing room (requirement 1) and is applied to the parent, not margins on `.registration-nav-btn` (requirement 11). `padding: 20px 24px` gives comfortable internal padding (requirement 4) and keeps buttons clear of the card edges (requirement 5). No per-button margins are added or changed.

**D3 — Explicit flex layout on the footer.**
Keep and make explicit: `display: flex; justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box;` with `gap: 1rem` (requirements 3, 6, 10). Back is the direct left child, Next+Submit stay in `.registration-workflow-actions` on the right — both on one horizontal line and vertically centered (matching the `min-height: 44px` buttons). No `position: absolute` anywhere.

**D4 — Bottom gap via the workflow card's bottom padding.**
The footer is `position: sticky; bottom: 0` (existing behavior, requirement 14), so the 16–24px gap between navigation and the card bottom edge is delivered by `.registration-workflow`'s bottom padding (today `padding: 1.25rem` ≈ 20px, already in range). Keep that value and verify visually; if the sticky footer is clamped tightly at the scrollport bottom, reduce nothing else and confirm the gap only appears when step content ends (requirement 8).

**D5 — Responsive: keep the same line where possible, stack full-width only when narrow.**
Desktop (≥ 769px): footer stays a row — Back left, Next right. Tablet ~640–768px: keep the row (flex allows buttons to shrink naturally; add `flex-wrap: wrap` to `.registration-workflow-actions` as a safety net so Next/Submit never overlap). Below that (the existing `@media (max-width: 768px)` in `dashboard.html` and `(max-width: 767px)` in `theme.css` / `responsive.css`): keep the established stacked, full-width buttons (requirements 9). This reuses already-shipped responsive behavior instead of inventing new breakpoints.

**D6 — Consistent across all five steps via shared markup.**
All steps render the same single footer element (`.registration-workflow-footer`), so one CSS change covers Steps 1–5 (requirement 12). No per-step styles or JS toggles are added.

## Risks / Trade-offs

- [Inline `<style>` shadows `theme.css`] → Mitigation: edit the inline block in `dashboard.html` as the primary location AND the two CSS files to keep them consistent; `node`/manual grep in verification checks all three.
- [Three duplicated blocks drift again] → Mitigation: reuse identical values (margin-top 28px, padding 20px 24px); consolidation into one file is noted as future work, not done here.
- [Sticky footer + wider padding changes perceived footprint on long steps] → Mitigation: buttons keep `min-height: 44px`, no extra media height rules; sticky `bottom: 0` behavior preserved for functionality.
- [On very narrow screens two buttons could crowd] → Mitigation: existing full-width stacked block below the mobile breakpoints prevents overlap (requirement 9).
- [Bumping padding slightly increases overall step height] → Mitigation: acceptable, it is the requested visual outcome; CSS-only and instantly revertible.

## Migration Plan

1. Edit `.registration-workflow-footer` in `dashboard.html` inline `<style>`: `margin-top: 28px; padding: 20px 24px;` (keep `display:flex; justify-content:space-between; align-items:center; gap:1rem; width:100%; box-sizing:border-box`).
2. Mirror `margin-top`/`padding` in `theme.css` `.registration-workflow-footer`, and add `flex-wrap: wrap` guard on `.registration-workflow-actions` for narrow-but-stacked widths.
3. Update mobile blocks (`dashboard.html`, `theme.css`, `responsive.css`) so stacked full-width behavior still holds and padding stays consistent.
4. Verify all five steps via the jsdom harness for layout-invariant checks and a browser hard-refresh for visual confirmation.
5. Rollback = revert the three CSS blocks (git); no data or server impact.

## Open Questions

- None blocking. Minor: whether to also bump `dashboard.html`'s mobile footer horizontal padding from `1rem` to `24px` for consistency — default yes, same values as desktop, since it keeps the card padding uniform.