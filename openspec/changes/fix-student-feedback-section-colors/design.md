## Context

The student Feedback page (`public/feedback.html`) was recently restyled so its two content sections — the "Submit Feedback" form card and the "My Feedback" history card — each get a top header band. Today that band uses a bright blue gradient (`linear-gradient(180deg, #17357f 0%, #2447a8 54%, #315fda 100%)`), which does not match the rest of the Smart Serve student UI. Everywhere else blue section bars use the solid Smart Serve navy:

- `.student-topbar` background: `#152c69` (feedback.html, scoped CSS)
- `.module-title-bar` background: `var(--module-title-bg)` = `#152c69` (theme.css)
- Dashboard section headers and admin header use `bg-[#152c69]`

`theme.css` defines `--module-title-bg: #152c69` once and is loaded by the Feedback page, so the navy is already available.

## Goals / Non-Goals

**Goals:**
- Restore the "Submit Feedback" and "My Feedback" header bands to the solid Smart Serve navy `#152c69`, matching the topbar and module title bars.
- Limit the diff to a single CSS declaration so nothing else on the page changes.

**Non-Goals:**
- No layout, spacing, alignment, text, font-size/weight, letter-spacing, padding, border-radius, or margin changes.
- No changes to the form controls, history table, empty state, submit button, sidebar, topbar, or page shell.
- No backend, API, or JS changes.

## Decisions

- **Use the solid navy literal `#152c69` for the band background.** Rationale: the target `.feedback-card-header` rule lives in the page's scoped `<style>` block, which already uses literals (e.g., `.student-topbar` uses `background: #152c69` on line 39). Using the same literal keeps the page's CSS consistent and avoids any dependency on var() resolution. Alternative considered: `background: var(--module-title-bg)` (mirrors `.module-title-bar` in theme.css) — visually identical since `--module-title-bg` has a single definition, but the literal matches the page's existing pattern.
- **Replace only the `background` line; leave all other declarations untouched.** The remaining `.feedback-card-header` properties (margin, padding, border-radius, color, font-size, font-weight, letter-spacing, text-align) already match the previous/original band look and must stay as-is.
- **Do not introduce any new color values.** `#152c69` is already used throughout the app, so this satisfies the "no new colors" constraint.

## Risks / Trade-offs

- If someone later changes `--module-title-bg` in the theme, the Feedback bands would not follow. → Mitigation: bands intentionally mirror the topbar's hardcoded `#152c69`, which is the established page-local convention; a theme-driven refactor is out of scope.
- Cleaner to use a CSS variable for theme consistency. → Trade-off: the page's scoped CSS uses literals everywhere; a single var here would be inconsistent and add no current value.