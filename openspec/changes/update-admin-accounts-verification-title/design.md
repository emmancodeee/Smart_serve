## Context

The Admin Accounts verification screen (`#adminAccountsAccessGate` in `public/admin.html:259-295`) is shown before Admin Account Management opens (a session-scoped gate). Its title currently uses inline styles on the `<h2>`: `margin: 0 0 0.35rem; color: #0b1f4d; font-size: 1.25rem; font-weight: 800;` (`admin.html:261`), rendering as dark navy text on a white card — unlike every other Admin/Super Admin module, which draws its title as a full-width dark navy bar.

The standard module title is a single source of truth in `public/css/admin.css` (`:root` variables at `admin.css:60-68`):

- `--module-title-bg: #152c69` (dark navy), `--module-title-fg: #ffffff`
- `--module-title-font-size: 1.08rem`, `--module-title-font-weight: 800`, `--module-title-letter-spacing: 0.03em`
- `--module-title-pad-y: 18px`, `--module-title-pad-x: 24px`
- `--module-title-radius: 28px 28px 0 0` (rounded top, square bottom)

It is consumed by three equivalent components:
- `.admin-page .admin-section h2` (`admin.css:2046`) — direct-child headings (e.g., Dashboard "Inventory Overview").
- `.admin-page .admin-section .section-header-row` + `h2` reset (`admin.css:2072`, `2083`) — the wrapper used by **Admin Account Management** (`#adminAccounts`, `admin.html:298-300`), **Announcement Management** (`#announcements`), and **Users Management** (`#users`).
- `.module-title-bar` (`admin.css:2060`) — standalone pages.

The gate section (`#adminAccountsAccessGate`) sits immediately above `#adminAccounts` (the "Admin Account Management" module) inside the same `.admin-main` container, so the `.section-header-row` markup will resolve to the identical bar styling with zero new CSS.

## Goals / Non-Goals

**Goals:**
- Render "Verify to Access Admin Accounts" using the existing standard module title bar (navy `#152c69` background, white text, same typography/padding/spacing/radius as "Admin Account Management").
- Reuse the existing shared title-bar component/CSS; do not introduce a new style or component.
- Leave all verification behavior unchanged (description, email/password fields, eye toggle, Verify Access button, JS logic).
- Keep the title left-aligned and non-centered, matching the other module titles.

**Non-Goals:**
- No CSS changes, no new component.
- No JS changes; gate visibility logic and IDs stay as-is.
- No changes to the other modules, sidebar, header, colors, or charts.

## Decisions

**D1: Reuse the `.section-header-row` markup exactly as "Admin Account Management" does.**
Replace the inline-styled `<h2>` (with the `.admin-surface-block` wrapper around it) with the same structure the neighboring `#adminAccounts` section uses — a `.section-header-row` `<div>` containing a bare `<h2>` — and keep the description/form inside the white `.admin-surface-block` below the bar:

```
<section id="adminAccountsAccessGate" class="admin-section" ...>
  <div class="section-header-row">
    <h2>Verify to Access Admin Accounts</h2>
  </div>
  <div class="admin-surface-block" style="padding: 1.75rem;">
    <p ...>This area manages...</p>
    <form id="adminAccountsAccessGateForm" ...>...</form>
  </div>
</section>
```

Rationale: `.section-header-row` (`.admin-page .admin-section .section-header-row`, `admin.css:2072`) supplies `background: #152c69`, white `color`, `padding: 18px 24px`, `border-radius: 28px 28px 0 0`, `margin: 0 -1.25rem 1rem` (full-bleed bar with a 1rem gap beneath). Its inner `h2` reset (`admin.css:2083`) sets `margin/padding/background/border-radius: 0` and `color: #fff`, while the base `.admin-page .admin-section h2` rule (`admin.css:2046`) supplies the shared `--module-title-*` typography. The result is pixel-for-pixel the same bar as "Admin Account Management".

Alternatives considered:
- Using `.module-title-bar` (`admin.css:2060`) directly on the `<h2>`: rejected because it lacks the `margin: 0 -1.25rem 1rem` full-bleed behavior and the dedicated `:root` `.section-header-row` styles, so it would not match the reference modules' spacing.
- Fixing the inline styles in place (changing `color` to `#fff`, adding `background: #152c69`, etc.): rejected because it duplicates the standard bar as an independent style, violating the "reuse the existing component" requirement.

**D2: Do not touch the verification section's body markup or JS.**
Only the title heading and its surrounding wrapper change. The description `<p>`, the two inputs, the password eye toggle button, the "Verify Access" button with spinner, and `#adminGateMessage` keep their exact classes/structure so `admin.js`'s gate form handlers (submit, eye toggle, verify-access API call, success → `setAdminView('adminaccounts')` flow) continue to work unchanged.

**D3: The moved `.admin-surface-block` provides the content spacing.**
Moving the description/form out of the old title wrapper is purely structural; the `.admin-surface-block` (`padding: 1.75rem`, `border-radius: 24px`) keeps its padding, and the bar's `1rem` bottom margin is the same gap Admin Account Management uses between its title bar and the filter toolbar/content below. The `.admin-section` has `padding: 0 1.25rem 1.25rem` + `overflow: hidden` (`admin.css:2030-2039`), so the bar spans the full section width exactly like the reference modules.

## Risks / Trade-offs

- [Moving markup could break the gate's JS if it queries for structure] → Mitigation: `admin.js` toggles whole sections via `#adminAccountsAccessGate`/`#adminAccounts` ids and binds forms by id (`adminAccountsAccessGateForm`) — no structural selectors into the old title wrapper, so the move is safe. Verified by grep of `admin.js` for gate ids.
- [Verification gate could already be rolled back/changed by the in-progress `admin-accounts-verification-gate` change] → Mitigation: this change edits only the title presentation inside `#adminAccountsAccessGate`; if that gate is reverted, this change simply disappears with it. Re-verify at implementation time that the section/ids still exist.
- [Bar height/padding looks different than `.admin-section h2` modules] → Mitigation: `.section-header-row` and `.admin-section h2` both resolve from the same `--module-title-*` variables and produce identical bars; the reference modules already render this way.

## Migration Plan

Pure HTML markup change; no data or API migration. Rollback: restore the original inline-styled `<h2>` inside the gate section.

## Open Questions

None.