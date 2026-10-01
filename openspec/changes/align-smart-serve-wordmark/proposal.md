# Align Smart Serve Wordmark

## Why

On the student sidebars, the "Smart Serve" wordmark wraps onto two lines: at 1.9rem bold over 0.025em tracking, the text needs ~178px, but the 270px sidebar leaves only ~150px after the 3.5rem logo box and 1rem gap (measured in-browser). The wrap looks broken and misaligned compared to a clean single-line branding wordmark.

## What Changes

- Ensure "Smart Serve" ALWAYS renders on a single horizontal line beside the logo on the six student pages (no wrap, no stack, no overlap).
- Reduce the wordmark font size from 1.9rem to exactly **1.4rem** (22.4px) — the small-print-fitted size that fits the 150px column with ~17px headroom (browser-measured with the real font stack).
- Add `white-space: nowrap` to the wordmark so it can never split into two lines.
- Keep the logo box at 3.5rem, the 1rem logo-to-text gap, 1.5rem header padding, weight 700, letter-spacing 0.025em, line-height 1.16, white color, and perfect vertical centering — all unchanged from the Admin reference.
- Mobile (≤1023px) wordmark stays at 1.3rem on one line (118px — fits), consistent with the Admin shrink.
- Do NOT touch the sidebar menu, colors, icons, item spacing, active state, or functionality; do NOT touch `schedule.html`, Admin, or Superadmin sidebars.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `student-sidebar-design`: the **Logo header** requirement is extended so the "Smart Serve" wordmark SHALL render on one horizontal line, with its font size set to fit the available header column (1.4rem), the nowrap guarantee, and the unchanged logo/gap/padding/alignment/weight/tracking/line-height values.

## Impact

- `public/css/theme.css` — wordmark pin in the existing student-header block: `font-size: 1.4rem` + `white-space: nowrap` (desktop), 1.3rem one-line (mobile).
- Six student pages' sidebar header renders "Smart Serve" on one clean line beside the logo.
- No HTML or JS changes; `schedule.html`, Admin/Superadmin sidebars, menu, colors, icons, spacing, and functionality unchanged.