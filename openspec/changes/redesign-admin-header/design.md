## Context

The current admin header is a solid navy blue bar (#152C69 background, 0.95rem padding) shared across admin.html, inventory.html, and admin-requests.html. It contains a welcome title on the left and a large blue clock + gold logout button on the right. The header feels heavy because the sidebar already carries the navy branding. Modern admin dashboards (Microsoft 365, GitHub, Vercel, Notion, Supabase) use clean white headers with subtle shadows.

## Goals / Non-Goals

**Goals:**
- Replace navy header with white header across all 3 admin pages
- Add left section with page title (28px Bold) + subtitle (14px Medium)
- Add right section with search, notification bell with gold badge, compact clock card, admin profile, gold logout
- Use consistent 32px horizontal padding, 72-80px height, soft shadow
- Keep SMARTSERVE branding intact (navy/gold in sidebar, gold logout button)

**Non-Goals:**
- No changes to the sidebar
- No changes to the main content area below the header
- No backend or API changes
- No new npm packages or build tools

## Decisions

- **White header approach**: Use CSS class `.admin-header-white` instead of modifying existing `.admin-header` to avoid breaking other styles. Old header is overridden.
- **Title/subtitle via JS**: Dynamically update title and subtitle based on current view (admin.html SPA). Use a `data-header-title` and `data-header-subtitle` mapping in JS.
- **Admin profile**: Use first letter of admin name as avatar fallback (no image upload needed). Display name and "Administrator" role text.
- **Notification bell**: Purely decorative for now (SVG icon + gold dot). Backend notification system can be connected later.
- **Clock**: Refactor `startHeaderClock()` in admin.js to render into a compact card format instead of the old pill style.
- **Logout icon**: Add inline SVG (log-out icon) on the left side of the button text.

## Risks / Trade-offs

- [JS refactor] Changing the clock rendering will affect admin.js and inventory.js → Test both pages after changes
- [Visual regression] Old header styles might leak → Use `.admin-header-white` with sufficient specificity
- [Mobile] Header has many right-section items → Collapse search and profile into a dropdown on small screens

## Migration Plan

1. Add new CSS (`.admin-header-white` class) leaving old styles intact
2. Restructure admin.html header HTML
3. Restructure inventory.html and admin-requests.html headers
4. Update JS clock rendering
5. Remove or override old header CSS
