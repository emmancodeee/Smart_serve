## Context

The SMARTSERVE Admin Dashboard is a multi-page Express-served HTML app (`admin.html`, `inventory.html`, `admin-requests.html`) with Tailwind CSS + custom CSS. Each page has its own layout structure with inline styles. There is no shared CSS design system — spacing, colors, border-radii, and shadows are inconsistent across pages. The UI feels cramped with tight padding, mixed border radii, and no visual hierarchy.

The existing branding uses Navy Blue (#17357F sidebar gradient, #152C69 header) with Gold (#FFDA47) accents for logout buttons and icons. This identity must be preserved.

## Goals / Non-Goals

**Goals:**
- Define CSS custom properties (design tokens) for colors, spacing, border-radius, shadows, and typography
- Apply consistent spacing (32px page padding, 24px section spacing, 20px card spacing)
- Standardize border-radius: 20px cards, 12px buttons/inputs, 18px tables
- Use consistent shadow: `0 8px 24px rgba(15,23,42,.08)`
- Improve sidebar to 280px width with better spacing, hover/active states, and 0.2s transitions
- Polish header with aligned title/clock/logout, equal heights, 16px radius
- Move filters beside section titles using Flexbox
- Redesign statistic cards with icons, proper typography, hover animation
- Improve tables with navy header, white rows, 18px radius, hover highlight
- Standardize buttons (12px radius, 14×22 padding) and inputs (12px radius, consistent height)
- Responsive: 5/3/1 cards, collapsible sidebar
- Apply consistently across admin.html, inventory.html, admin-requests.html

**Non-Goals:**
- No redesign of the application from scratch
- No color theme replacement (keep Navy + Gold)
- No changes to server-side code or routing
- No new JavaScript frameworks or build tools
- No changes to student-facing pages (dashboard.html, profile.html, etc.)
- No functional changes to the data or API layer

## Decisions

- **CSS custom properties**: Define tokens in `admin.css` as `:root` variables. This is the simplest approach with no build step required.
- **No Tailwind config changes**: Use utility classes in HTML and token-based CSS for shared styles. Tailwind's current config stays as-is.
- **Lucide Icons via SVG**: Inline SVGs from Lucide (similar approach to current admin.html icons). No new JS dependency needed since icons are decorative — plain SVGs work.
- **Statistic card icon placement**: Icon in a soft blue circular background positioned in the upper-right of each card, defined as a CSS class.
- **Responsive grid**: CSS Grid with `grid-template-columns: repeat(5, 1fr)` on desktop, `repeat(3, 1fr)` on tablet, `1fr` on mobile using media queries.
- **Sidebar collapse**: Keep existing drawer pattern (`drawer-checkbox` + `drawer-sidebar`) for mobile. On desktop the sidebar is always visible at 280px width.
- **Font**: IBM Plex Sans remains the typeface (already used project-wide via Google Fonts).
- **Gold accent**: Keep existing gold (#FFDA47 → #F4C542). The logout button and sidebar icons stay gold. Update to slightly warmer gold where appropriate.

## Risks / Trade-offs

- [CSS bloat] Adding many new CSS rules may increase file size → Mitigated by consolidating existing redundant styles
- [Visual regression] Changing existing classes may break layout on some pages → Test all three admin pages after changes
- [Inconsistent gold] Old code uses #FFDA47, new palette suggests #F4C542 → Use #F4C542 as primary gold, keep old hex as fallback
- [Tailwind conflict] New CSS may conflict with Tailwind utility classes → Use more specific selectors or `:where()` for low-specificity tokens
