## Why

The SMARTSERVE Admin Dashboard has functional but dated UI — cramped spacing, inconsistent alignment, mixed border radii, no visual hierarchy, and a lack of modern UI polish. This hurts readability, perceived quality, and admin user productivity. A design system refresh is needed to bring it to a professional, enterprise-level standard while preserving the existing Navy Blue + Gold branding.

## What Changes

- **Design system tokens**: Define CSS custom properties for colors, spacing, border-radius, shadows, and typography
- **Sidebar**: 280px width, improved spacing, centered icons, active item with lighter blue + gold border + shadow, 0.2s hover transitions
- **Header**: Proper alignment of title/clock/logout, equal-height buttons, 16px border-radius, 20px spacing
- **Section headers**: Reduced height, ~18px vertical / 24px horizontal padding, filters beside titles using Flexbox
- **Statistic cards**: Equal height/width, 24px padding, 20px border-radius, soft shadow, hover lift animation, Lucide/Heroicons in blue circles, improved typography hierarchy
- **Typography**: Card titles 14px semi-bold navy, values ~48px bold dark navy, descriptions 15px gray
- **Analytics charts**: Two-column responsive layout, equal height/width, white cards, consistent padding
- **Tables**: Navy header with white text, white rows, 18px border-radius, hover highlight (#F8FAFC), increased row height
- **Buttons**: 12px border-radius, 14px×22px padding, darker hover, smooth transitions
- **Inputs/dropdowns**: 12px border-radius, equal heights, consistent padding and spacing
- **Responsiveness**: 5/3/1 cards per row (desktop/tablet/mobile), collapsible sidebar
- **Cross-page consistency**: Apply design system to all admin pages (admin.html, inventory.html, admin-requests.html)

## Capabilities

### New Capabilities
- `design-system-tokens`: Centralized CSS custom properties for colors, spacing, border-radius, shadows, and typography
- `admin-sidebar`: Modernized sidebar with improved spacing, active states, hover effects, and responsive collapse
- `admin-header`: Polished header with aligned title, clock, and logout button
- `admin-statistic-cards`: Redesigned cards with consistent sizing, icons, shadows, hover animations, and typography
- `admin-tables`: Unified table styling with navy headers, white rows, rounded corners, and hover states
- `admin-form-controls`: Consistent button, input, and dropdown styling across all pages
- `admin-responsive-layout`: Responsive grid layouts for cards, analytics, and sidebar collapse

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `public/css/admin.css` — New design system tokens and component styles
- `public/css/inventory.css` — Updated to use shared design tokens
- `public/admin.html` — Updated class references and structure
- `public/inventory.html` — Updated class references and structure
- `public/admin-requests.html` — Updated class references and structure
- `public/js/admin.js` — Potential minor adjustments for sidebar active state
- `public/js/inventory.js` — Minor adjustments for responsive behavior
