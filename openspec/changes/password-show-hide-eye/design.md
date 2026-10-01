## Context

All auth/password flows are static HTML pages under `public/` with password inputs in four different forms: `index.html` (login `#password`; forgot/reset `#newPassword`, `#confirmNewPassword`), `register.html` (`#password`, `#confirmPassword`), `profile.html` (change password `#oldPassword`, `#newPassword`, `#confirmNewPassword`), and `admin.html` (admin change password `#adminOldPassword`, `#adminNewPassword`, `#adminConfirmNewPassword`; add-admin temporary password `#newAdminPassword`). Inputs are either bare (`index.html`, `register.html`, `profile.html`) or wrapped in a `<div>` (`admin.html`). Pages use Tailwind utility classes (e.g., `px-3.5`) for input padding and inline SVG for existing icons; there is no JS that builds password inputs dynamically. Existing auth, validation, session, and error-handling logic must remain untouched.

## Goals / Non-Goals

**Goals:**
- Add an eye/eye-slash toggle inside every auth/password-management password input listed above.
- Toggle only the input `type` between `password` and `text`; never alter value, submission, validation, or storage.
- Independent visibility state per field; buttons never submit forms or trigger actions.
- Match existing SmartServe styling; no redesign; no text/icon overlap.
- Accessible: state-aware labels, keyboard operable.

**Non-Goals:**
- No changes to backend, APIs, routes, models, sessions, or validation/hashing.
- No changes to login/registration/change-password/reset behavior.
- No new external dependencies (icons come from inline SVG).
- No redesign of any page; no modification of the sidebar/navigation.

## Decisions

### D1. Shared JS enhancer instead of per-page markup edits
Introduce one small script `public/js/show-password.js` (plus a tiny stylesheet block) and load it on the four pages `index.html`, `register.html`, `profile.html`, `admin.html`. It selects the known password-input ids, embeds each in a `position: relative` wrapper, appends a `type="button"` eye button, and binds the toggle.

**Why:** all logic and styling live in one place (DRY, single test surface), the four pages remain structurally simple, and the enhancer can be reused if a new auth/password form is added later.
**Alternatives considered:** hand-editing each HTML page to add per-field markup — rejected because it duplicates the toggle markup, icon SVGs, and handlers across four files with divergent markup, raising drift and bug risk.

### D2. Independent state via closure per field
Each wrapped input gets its own button whose "visible" flag lives in a closure owned by the enhancer for that field (initialized hidden). No shared state object across fields; page reload/re-open resets every field to hidden.

**Why:** guarantees the New/Confirm/Current password fields in a form never reveal together; each eye controls exactly one input (per spec "independent visibility state").
**Alternatives considered:** a single module-level state map keyed by id — rejected as unnecessary indirection that could accidentally couple fields.

### D3. Wrapper + absolutely positioned button; inline right-padding
Enhancer wraps the input in `<div class="pw-field">` (position: relative), appends `<button class="pw-toggle" type="button" aria-label="Show password" tabindex="0">` positioned `absolute; right: 0.5rem; top: 50%; transform: translateY(-50%)`, and sets `style.paddingRight = '2.75rem'` on the input (inline style overrides Tailwind's `px-3.5`).

**Why:** keeps the icon visually inside the input boundary regardless of page layout, guarantees the typed text stops ~2.75rem before the icon (no overlap), and works identically for bare inputs (`index/register/profile`) and already-wrapped inputs (`admin.html`).
**Alternatives considered:** making the button a flex sibling in the layout — rejected because the pages' form grids vary and a sibling would need bespoke layout per page, risking the "no redesign" constraint.

### D4. Inline SVG eye / eye-slash and neutral styling
Two inline SVG paths (eye, eye-slash) swap inside the button when toggled. Button uses slate/gray coloring (`text-slate-500 hover:text-slate-700`), `w-6 h-6` hit area with centered 18px icon, transparent background, and a visible `focus-visible` ring (`ring-2 ring-blue-400`) for keyboard users. Consistent with surrounding neutral inputs; no new icon library.

**Why:** zero dependencies; matches the muted, subtle footprint of existing form controls; standard eye/eye-slash affordance.
**Alternatives considered:** FontAwesome/Glyphicons — rejected (no icon dependency in the project); off-the-shelf text character `👁` — rejected (unreliable cross-platform rendering and inconsistent with the design system).

### D5. `type="button"` and no side effects
The button is `type="button"` (it sits inside `#loginForm`, `#forgotPasswordForm`, `#registerForm`, `#editProfileForm`, `#changeAdminPasswordForm`, `#createAdminForm`, all of which would otherwise treat it as a submit control). Its click handler calls `preventDefault()`/`stopPropagation()`, toggles only `input.type`, updates the icon and `aria-label`, and returns focus to the input (spec: toggling must not move focus). Existing submit handlers and Enter-key behavior are untouched.

**Why:** this is the only way to guarantee no form submission, no navigation, and no page reload while inside any of these forms.
**Alternatives considered:** single global click handler using event delegation — rejected; per-field bindings are simpler and guarantee independent state.

## Risks / Trade-offs

- **Wrapping changes DOM layout assumptions** → Wrappers are `display: block` hooks with the input kept full-width (`w-full` preserved); visual footprint is unchanged; verify each page renders identically (8.3/8.4 style checks).
- **Password managers/autofill may repaint the field** → They change the rendered value, not the input `type`; our toggle still works and state remains per field. No action needed; verify in manual test.
- **CSS specificity fights with Tailwind padding** → Inline `style.paddingRight` wins over the `px-3.5` class, so no `!important` or specificity hacks needed; still confirm no overlap on narrow mobile widths.
- **Button styling clashing with hover/focus transitions** → Buttons use the same `hover:`/`focus:` conventions as surrounding controls; the icon swap re-uses the same SVG element, so only `style` on the `d` path changes (no flicker/reflow).

## Migration Plan

- Frontend-only change: add `public/js/show-password.js` (and optional CSS via in-file `<style>`), add a single `<script>` tag (plus style) to the four pages.
- Rollback: remove the script tags — pure additive, no backend/migration concerns.
- No data migration, no API changes, no environment/config changes.

## Open Questions

- None blocking. Minor styling decision left to implementation review: exact icon size (16–18px) and right-offset (0.5rem–0.75rem) to be tuned to match each page's input proportions.