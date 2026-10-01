## Context

`public/returns.html` is the single Student Returns page (route `/returns`, sidebar "Returns" active). It contains a return-request form (`#returnForm`) inside a `.student-panel.return-form-card` card, and a "My Return Requests" history card below. The completed `fix-student-returns-layout` change inserted a second `.module-title-bar` element as the first child of `.student-main-inner`: a page-level blue title bar reading "Return Request" (line 756), with the existing "Submit Return Request" title bar kept immediately below (line 757) as a large blue bar. This produced **two visually identical large navy bars stacked on top of each other**, which duplicates the same treatment and does not match the Feedback module's pattern — one page-level title and one small in-card section heading.

The Feedback module (`public/feedback.html`) uses `.feedback-card-header` (a smaller navy band inside a white card: `background: #152c69`, `padding: 1rem 1.5rem`, `border-radius: 28px 28px 0 0`) for its form section heading, creating clear visual hierarchy between the large page-level `module-title-bar` and the in-card heading. The Returns page currently has no in-card header — the `.return-form-card` card starts directly with `<form>` and its fields.

The compiled `public/css/tailwind.css` is missing `flex-col`, `sm:flex-row`, `p-6`, `mt-3`, `items-end`, `gap-5`, and other responsive utilities. All spacing and responsive behavior must use explicit scoped CSS in the inline `<style>` block — the same pattern already proven across multiple changes in the working tree.

## Goals / Non-Goals

**Goals:**
- Remove the duplicate large `.module-title-bar` "Submit Return Request" (the standalone page-width bar currently at line 757).
- Keep exactly one large `module-title-bar` reading "Return Request" as the page-level title.
- Add a small navy in-card header band inside the `.return-form-card` panel, reading "Submit Return Request", matching the Feedback module's `.feedback-card-header` visual language.
- Keep the "Submit Return Request" submit button at the bottom of the form unchanged.
- Ensure no large vertical gap opens up after removing the duplicate bar; the form card moves up naturally.
- Maintain consistent spacing and alignment with the Feedback module and other student pages.

**Non-Goals:**
- No changes to form fields, item-row logic, form submission, editing, deletion, routing, API calls, validation, database schema, or authentication.
- No changes to `public/js/returns.js`.
- No changes to `public/css/tailwind.css`, `theme.css`, `admin.css`, or any shared stylesheet.
- No changes to `public/css/dashboard-theme.css`.
- No new dependencies or build steps.
- No changes to the Feedback, Profile, Announcements, Dashboard, or any admin page.

## Decisions

### 1. Reuse the Feedback module's `feedback-card-header` pattern for the in-card heading

- **Decision**: Add a new `.return-card-header` rule in the inline `<style>` block of `returns.html`, mirroring `.feedback-card-header` from `feedback.html` exactly: `background: #152c69`, `padding: 1rem 1.5rem`, `border-radius: 28px 28px 0 0`, `margin: -1px -1px 0`, `font-size: 1.08rem`, `font-weight: 800`, `color: #ffffff`, `letter-spacing: 0.03em`, `text-align: left`. Place a `<div class="return-card-header">Submit Return Request</div>` as the first child inside `.student-panel.return-form-card`, above the `<form>`.
- **Why**: Matches the established Feedback page convention exactly. The visual language (navy band at top of white rounded card, white bold text) is consistent, recognizable, and already proven in this codebase. Adding a separate class name (`.return-card-header` vs. reusing `feedback-card-header` directly) avoids cross-page CSS coupling — each page's inline style is self-contained.
- **Alternative considered**: Apply `feedback-card-header` directly — rejected, because `feedback-card-header` is only defined in `feedback.html`'s inline `<style>` block and would be undefined in `returns.html`.
- **Alternative considered**: Reuse `.module-title-bar` inside the card — rejected, because `.module-title-bar` in `theme.css` has fixed 28px top-radius and is designed as a page-width element; putting it inside a padded card creates mismatched radius and spacing.

### 2. Update `.return-form-card` padding to accommodate the header

- **Decision**: Change `.return-form-card` padding from `1.5rem` to `0` so the card no longer has top padding. The `.return-card-header` will provide the top visual band, and form body padding will be handled by wrapping the form in a `.return-form-body` div with `padding: 1.5rem`.
- **Why**: The `.feedback-card-header` in `feedback.html` sits flush at the card top (no padding between header band and card edge). Setting `.return-form-card` padding to 0 mirrors this. Adding a `.return-form-body` wrapper around the `<form>` restores the existing comfortable form padding.
- **Alternative considered**: Keep `padding: 1.5rem` on `.return-form-card` and insert the header with negative margin — works but the radius/padding math is fragile and less clean than the Feedback pattern.

### 3. Adjust vertical spacing after removing the duplicate bar

- **Decision**: The `.module-title-bar` at line 756 retains its `mb-5` class (20px gap), which is the standard spacing between a page-level title and the first content card. The theme.css rule `body.theme-light :is(.dashboard-main-inner, .student-main-inner) > .module-title-bar ~ * { margin-top: 20px }` does NOT apply here because the form card (`.return-form-card`) is no longer a direct child of `.student-main-inner` after the title bar is removed — the card is inside the `.student-main-inner` but the title bar is now the only direct `.module-title-bar` child. No additional spacing adjustment is needed; removing the duplicate bar naturally eliminates the double-height gap.
- **Why**: The existing `mb-5` on the "Return Request" title bar already provides the correct 20px gap. No new CSS is required for spacing.
- **Alternative considered**: Add `mt-3` or `mt-4` to the form card — unnecessary and would create double spacing with the theme.css rule.

### 4. All CSS changes scoped to `returns.html` inline `<style>` block

- **Decision**: Add `.return-card-header` and `.return-form-body` rules in the existing inline `<style>` block of `returns.html`. Do not edit `tailwind.css`, `theme.css`, or any other shared file.
- **Why**: Matches the pattern proven across all prior changes; keeps the change self-contained; avoids rebuilds.
- **Alternative considered**: Extend Tailwind config — rejected; adds build dependency and touches shared files.

## Risks / Trade-offs

- **Header band looks identical to `feedback-card-header` but has a different class name** → Intentional: avoids cross-page CSS dependency; each page's inline style is self-contained. Visual result is identical by construction.
- **Theme.css rule on `.module-title-bar ~ *` might affect spacing** → The form card is now a direct child of `.student-main-inner` (as before), but with only ONE title bar above it, the margin-top rule fires once (20px) which is correct. Verified against the rule definition.
- **Inline style bloat** → Minimal: two new rules (`return-card-header`, `return-form-body`), both small and scoped.
- **Removing `padding` from `.return-form-card` breaks history card layout** → The history card also uses `.return-form-card` (line 845). Fix: change the form card's class from `return-form-card` to `return-form-card return-form-panel`, and only set `padding: 0` on `.return-form-panel`. This keeps the history card's `padding: 1.5rem` intact.

## Migration Plan

- Apply edits only to `public/returns.html`: remove one HTML element, add a header band div, add/update two scoped CSS rules in the inline `<style>` block.
- Rollback: revert `returns.html` via `git checkout public/returns.html`. Trivial.
- No server restart needed; static file is served fresh on next request.
- No database, API, or shared CSS changes.

## Open Questions

None affecting implementation. All requirements are clear from the proposal and spec.