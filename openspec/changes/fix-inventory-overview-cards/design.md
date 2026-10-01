## Context

The admin dashboard (`admin.html`) displays 6 inventory overview stat cards. Each card contains an absolutely-positioned icon (`.stat-icon`) at `top: 16px; right: 16px;` with a 44x44px circular container. Long label text like "Units Distributed (30 Days)" wraps underneath the icon, making titles illegible. The fix uses flexbox to put icon and label side by side.

## Goals / Non-Goals

**Goals:**
- Prevent icon from covering card title text
- Support multi-line title wrapping without overlap
- Keep 20px minimum gap between title and icon
- Reduce icon container from 44px to 40px
- Reduce icon SVGs from 22px to 18-20px
- Preserve all existing card content (value, change, sparkline)

**Non-Goals:**
- No JS changes, API changes, or new dependencies
- No changes to non-dashboard pages
- No changes to card colors, typography, or brand styling

## Decisions

1. **Flexbox header wrapper over CSS grid** — Adding a `.stat-header` div around icon+label and using `display: flex; justify-content: space-between; align-items: flex-start` is the simplest CSS-only approach. No layout shifts for sibling elements.

2. **HTML wrapper addition** — Each of the 6 cards gets a `.stat-header` wrapper. This is a small, surgical HTML change (6 wrappers) that enables a clean flexbox solution without complex CSS hacks.

3. **Absolute positioning removal** — Switching `.stat-icon` from `position: absolute` to inline flex within the header row eliminates overlap entirely.

## Risks / Trade-offs

- [Risk] Existing cards have slightly different total height due to padding changes → Mitigation: Keep overall card padding (`24px`) unchanged
