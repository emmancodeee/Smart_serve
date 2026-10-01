## Why

The current admin header is a solid navy blue bar that feels heavy and dated. With the sidebar already using the primary navy branding, the header creates too much visual weight on the top of the page. A clean white header improves visual balance, makes the interface feel more spacious and modern, and aligns with modern design patterns from Microsoft 365, GitHub, Notion, and Supabase — while keeping the SMARTSERVE navy + gold branding in the sidebar.

## What Changes

- Replace solid navy blue header (#152C69) with a white header (#FFFFFF)
- Add bottom border (1px solid #E5E7EB) and soft shadow
- Set header height to 72-80px with 32px horizontal padding
- **Left section**: Page title (28px Bold) + subtitle (14px Medium) with vertical hierarchy
- **Right section**: Search bar, Notification bell with gold badge, Compact clock card, Admin profile (avatar + name + role), Gold logout button
- Replace large blue clock with a compact white card (light border, 12px radius, calendar icon, date + time)
- Add notification bell icon with small gold notification badge
- Add admin profile section (circular avatar + name + "Administrator" label)
- Update logout button to 12px radius with icon on the left
- Apply consistently across admin.html, inventory.html, admin-requests.html

## Capabilities

### New Capabilities
- `admin-header-white`: White header with title/subtitle, notification bell, clock card, admin profile, and gold logout button

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `public/css/admin.css` — New header styles, removal of old navy header styles
- `public/admin.html` — Restructure header HTML with new left/right sections
- `public/inventory.html` — Same header restructure
- `public/admin-requests.html` — Same header restructure
- `public/js/admin.js` — Update clock rendering to new compact format
- `public/js/inventory.js` — Update clock rendering to new compact format if applicable
