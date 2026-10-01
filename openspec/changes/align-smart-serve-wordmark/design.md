# Design: Align Smart Serve Wordmark

## Context

The student sidebar is 270px wide. Its header (pinned in `theme.css` by the completed `align-student-sidebar-header` change) reserves 1.5rem → left/right padding (24px each side), a 3.5rem logo box, and a 1rem gap, leaving a 150px text column for "Smart Serve". At the current 1.9rem/700/0.025em the wordmark measures ~178px and wraps onto a second line.

A headless-Edge measurement of the real font stack (`"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif` — inherited from Tailwind's preflight) measured bold "Smart Serve" at 0.025em tracking:
- 1.9rem → 178.3px (overflows the 150px column by 28.3px → wraps)
- 1.6rem → 150.8px (borderline)
- 1.5rem → 141.7px (8.3px headroom)
- **1.4rem → 132.5px (17.5px headroom)**
- 1.3rem → 123.4px (mobile value, fits)

The user's hard requirements: single horizontal line, no wrap/stack/overlap, logo size unchanged, same gap and left padding, consistent vertical centering, and only the wordmark size changing. Do not touch menu, colors, icons, spacing, active state, or functionality.

## Goals / Non-Goals

**Goals:**
- "Smart Serve" renders on exactly one line beside the logo on all six student pages (and stays one line at mobile, where it is 1.3rem and fits at ~118px)
- Keep the logo box 3.5rem, 24px glyph, 1rem gap, 1.5rem padding, center alignment, weight 700, tracking 0.025em, line-height 1.16, white color, and the header divider as-is
- Change only the `theme.css` wordmark pin (font-size) plus the nowrap guarantee

**Non-Goals:**
- No changes to the sidebar menu, colors, icons, item spacing, active state, or functionality
- No HTML/JS edits; no changes to `schedule.html`, Admin, or Superadmin sidebars
- Not re-adding IBM Plex Sans font files or changing the font family

## Decisions

### 1. Set the desktop wordmark to `font-size: 1.4rem` and add `white-space: nowrap`
Update the existing wordmark pin in the `align-student-sidebar-header` block of `public/css/theme.css` (`> div:first-child h2` rule): replace `font-size: 1.9rem !important` with `font-size: 1.4rem !important`, keep `font-weight: 700` / `letter-spacing: 0.025em` / `line-height: 1.16` / `color: #ffffff` / `margin: 0`, and add `white-space: nowrap !important`. Rationale: 1.4rem fits with 17.5px headroom even at the exact measured fallback widths; nowrap is a hard guarantee that no future CSS or text change can re-introduce two lines. Chosen over 1.5rem (8px headroom, less safe) and over leaving it at 1.9rem (guaranteed wrap).

### 2. Keep the mobile (≤1023px) wordmark at 1.3rem
Already pinned by the `align-student-sidebar-header` change; measured 118px → fits the column with ample margin, and nowrap carries over via the shared base rule. No source change needed; verified in tasks.

### 3. Do not change fonts; rely on measured fallback widths
The app ships no IBM Plex font files, so the wordmark renders in the system fallback (≈ Segoe UI) on student and admin pages alike. The measurement was taken with exactly this stack, so 1.4rem is grounded in what users actually see. No alternative considered — changing the font family (e.g., bundling IBM Plex) is out of scope.

### Alternatives considered
- `transform: scale()` the wordmark: rejected — scales descenders unevenly and is fragile; a real font size is cleaner.
- Shrinking padding/gap or logo to make room: rejected — user explicitly said keep logo size, gap, and padding.
- `text-overflow: ellipsis`: rejected — it would truncate "Smart Serve", and the user requires the full wordmark on one line.
- Wider sidebar: rejected — would change the whole layout, out of scope.

## Risks / Trade-offs

- **Different installed fonts can widen the wordmark** (e.g., if IBM Plex IS installed, it is narrower, so safe; a super-wide system font could exceed 150px at 1.4rem) → nowrap prevents any re-wrap; the text column cannot shrink below 150px anyway because logo/gap/padding are fixed. Worst case is cosmetic overflow, not wrapping.
- **1.4rem diverges numerically from the Admin header's 1.9rem** → the user's primary requirement (single line, brand-like wordmark) governs; weight/tracking/positioning still match the Admin branding. Admin's own 1.9rem exceeds the same 150px column.
- **The h2 is used by JS (`sidebarSectionTitle`)** → JS only swaps text content; font-size and nowrap are CSS-only and don't affect the script.
- **Text zoom or OS rendering differences** → margin between 132px and 150px (18px, ~13%) absorbs the realistic variance.

## Open Questions

None — the fitted size and nowrap guarantee are determined by the browser measurement of the actual font stack.