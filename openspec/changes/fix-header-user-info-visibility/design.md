## Context

The base admin header profile rules in `public/css/admin.css` (lines ~1866–1876) set:

```css
.profile-name { font-size: 0.9rem; font-weight: 700; color: #0F172A; }
.profile-role { font-size: 0.78rem; font-weight: 500; color: #64748B; }
```

On pages with the dark-blue header (`<body class="admin-page"> ... <header class="admin-header bg-[#152c69]">`) — Admin, Inventory, Return Requests, and Feedback Management — those dark slate colors render near-invisible against the blue background. `public/css/inventory.css` already carries the correct dark-header overrides scoped to `.admin-page .admin-header .admin-profile`, but admin/returns/feedback pages load only `admin.css`, so they lack the fix. All four pages load `css/admin.css`.

## Goals / Non-Goals

**Goals:**
- Make the user name white (`#FFFFFF`) and the role a light but clearly readable color (`#E5E7EB`) in the dark-blue admin header across all four affected pages.
- Keep the name bold (700) and the role slightly smaller and lighter weight (500, 0.78rem) — preserve the typographic hierarchy.
- No change to header layout, spacing, profile circle, dimensions, font family, displayed user/role strings, or any functionality.

**Non-Goals:**
- No change to `inventory.css` (it already handles the dark-blue header correctly).
- No change to the white header (`admin-header-white` on admin-requests.html) or student pages (`.student-profile-*`).
- No change to background, profile icon, notifications, clock, logout, or any header interaction.

## Decisions

### D1. Add the dark-blue header overrides in `admin.css`
Add two rules near the existing `.profile-name` / `.profile-role` declarations:

```css
.admin-page .admin-header .admin-profile .profile-name { color: #ffffff; }
.admin-page .admin-header .admin-profile .profile-role  { color: #E5E7EB; }
```

**Why:** the selector `.admin-page .admin-header .admin-profile` (specificity 0,3,0) overrides the base `.profile-name` / `.profile-role` (0,1,0) without `!important`. It applies to all four affected pages because they all load `admin.css` and carry both `.admin-page` and `.admin-header`. The same scoped selector in `inventory.css` (already present) produces the same outcome for inventory.html; no conflict.
**Alternatives considered:**
- Duplicating `<style>` blocks in each affected HTML page — rejected as redundant and harder to maintain.
- Editing the base `.profile-name`/`.profile-role` color values directly — rejected because those base values (`#0F172A`, `#64748B`) are correct for non-dark contexts (e.g., a white or light header in the future); the override is the clean, layer-safe approach.
- Using Tailwind utility classes — rejected because the header background is a Tailwind arbitrary value and the existing admin.css layer already controls profile typography; adding utilities would still require a dark-header override or awkward inline styles.

## Risks / Trade-offs

- **White text on #152c69 has high contrast (~8.9:1); #E5E7EB has ~7.5:1** — both pass WCAG AA for normal text. If a slightly softer white role is preferred later (e.g., `rgba(255,255,255,0.85)`), it is a one-value edit to the same rule.
- **`inventory.css` already defines the same selectors** — both rules agree (name white, role lighter), so the cascade is consistent. The `inventory.css` role uses `rgba(255,255,255,0.65)` (slightly more muted). To align all pages, `admin.css` can adopt `#E5E7EB` (clearer) and `inventory.css` can be updated later if desired, or vice-versa; the proposal's requirement is "clearly readable," which both values satisfy.
- **Any new page using `.admin-page` + `.admin-header` without loading `admin.css`** would miss the fix — but the current set of affected pages is fully covered.

## Migration Plan

- Add two scoped rules in `public/css/admin.css`; no backend, config, or HTML changes.
- Rollback: remove the two added rules — pages return to the base dark text colors.
- Verify in browser: name white, role clearly readable on Admin, Inventory, Return Requests, and Feedback headers; white header and student pages unchanged.

## Open Questions

- None blocking. The exact light-gray role value (`#E5E7EB` vs. `rgba(255,255,255,0.85)`) can be tuned to taste during review; the design locks the approach and the requirement.