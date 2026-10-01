## Context

Every student page (`dashboard.html`, `profile.html`, `announcement.html`, `feedback.html`, `returns.html`, `schedule.html`) already renders a navy `#152c69` topbar with the admin clock (`#1d3b86`), avatar/name/"Student" role block, bell, and burger menu, plus a static server-side sidebar. The pages already load `css/theme.css` in addition to Tailwind. As a result, this is a cosmetics-only standardization, not a rebuild:

- The **sidebar** on student pages uses the same `#17357f → #2447a8 → #315fda` gradient as admin, but the `theme-light` override in `theme.css:30-33` flattens it to a different navy family (`#10284d → #173b6d`), diverging from admin.
- The **active-nav** styling differs four ways: profile + announcement use the white pill/blue-900 style; feedback + returns have `.is-active` but render invisibly; schedule uses a yellow variant; dashboard never shows an active item (`dashboard.js:181-184` toggles `[data-dashboard-nav]` but no such attributes exist in `dashboard.html`).
- `schedule.html` is missing `theme-light` on its body, so none of the `theme-light` overrides apply there.
- Nav grids differ: profile + schedule use `grid-cols-2 lg:grid-cols-1` with `h-5 w-5` icons; the rest use `grid-cols-1` with `h-6 w-6`. Schedule's sidebar title is "Scheduler" instead of "Smart Serve".
- Content cards, forms, headings, buttons, and spacing drift per page; a few "AI-like" copy strings are visible to users (feedback.html:687/752, returns.html:739, dashboard.html:1092/1105).
- Async data loads after first paint (each page `await fetch('/api/auth/me')` then fills sections), producing layout jump / piecemeal render.

Load-order constraint discovered in research: the inline `<style>` block sits BEFORE `theme.css` on dashboard/profile/announcement/feedback/returns, so shared rules in `theme.css` win at equal specificity. On `schedule.html` the inline block loads AFTER `theme.css`, so schedule's inline rules win — schedule must be handled separately to keep identical results.

## Goals / Non-Goals

**Goals:**
- Match the student shell, header, sidebar, and active state to the Admin design system, UI-only.
- Standardize cards/forms/inputs/buttons/headings/spacing across the six student modules.
- Remove developer-style helper copy; keep all user-facing labels and features.
- Prevent navigation flicker and async layout shift; preserve single API requests per page.
- Shared, low-risk CSS: one standardization block appended to `theme.css` (already loaded by all six pages).

**Non-Goals:**
- No backend/service/API/route/permission/DB/data changes of any kind.
- No removal, renaming, or reordering of student features or fields.
- No rebuild or modification of Tailwind's compiled `tailwind.css` (plain CSS overrides only).
- No changes to admin pages, `inventory.html`, or auth pages (`index.html`, `register.html`) except where `show-password.js` already landed.
- No functional changes to the registration workflow, schedule events, or feedback/returns submissions.

## Decisions

### D1. Standardization lives in a shared block appended to `public/css/theme.css`
One clearly commented section (`/* === standardize-student-ui === */`) holds all shared student overrides. Rationale: `theme.css` is loaded by all six pages, so edits are additive and single-source. It avoids touching hundreds of lines of inline `<style>` per page and avoids Tailwind recompilation. Plain CSS selectors at the same or higher specificity than page rules win because they load later.

Alternative considered: editing each page's inline `<style>` blocks directly. Rejected — higher edit risk, duplicated logic, more diff surface.

### D2. Sidebar keeps the admin navy gradient; the `theme-light` flattening is overridden
Admin sidebar renders the `#17357f → #2447a8 → #315fda` gradient; student sidebars already carry the same gradient inline. Only `theme.css`'s `theme-light` flattening diverges. The standardization block overrides `body.theme-light` so `.student-sidebar` and `.dashboard-sidebar` keep the navy gradient — matching admin with the least change. The "Smart Serve" sidebar title stays at the top of the nav on all six pages (schedule's "Scheduler" title is aligned to "Smart Serve").

### D3. One active-nav style for all six pages
The active item SHALL be a light/white pill with dark navy text and rounded corners (the admin and profile/announcement style). The standardization block applies it to `.dashboard-sidebar-link.is-active` and `.student-sidebar-link.is-active` under `body.theme-light`, with specificity strong enough to beat page-specific inline rules (use selectors such as `body.theme-light .dashboard-sidebar-link.is-active` and the schedule-appended copies). Concretely:
- feedback + returns: neutralize the transparent/white inline classes so the pill shows;
- schedule: replace the yellow variant with the standard pill (in its appended block);
- dashboard: add a static `.is-active` to the Dashboard link. The existing `[data-dashboard-nav]` hash-highlight logic in `dashboard.js` is left untouched (attribute is not added, avoiding unverified JS behavior changes).

### D4. schedule.html divergences handled in a dedicated appended `<style>` block
Because schedule's inline `<style>` loads after `theme.css`, the same shell/active/spacing rules would lose. Decision: add `theme-light` to schedule's body class AND append a small matching `style` rule block at the end of schedule's `<head>` (after the existing inline block), so schedule honors identical rules without reordering stylesheets. Rationale: reordering stylesheets risks flipping unrelated existing precedence; appending matches the proven additive pattern with lowest blast radius.

Alternative considered: moving the `theme.css` link below schedule's inline block. Rejected — would change precedence for ALL existing rules, not just our additions.

### D5. Nav list normalization (grid and icons)
Unify all six nav lists to `grid grid-cols-1 gap-2 p-6` with `h-6 w-6` icons by editing the HTML on profile.html and schedule.html (dashboard/announcement/feedback/returns already match). Order stays: Dashboard, User Profile, Request, Announcements, Feedback, Returns. No admin modules appear.

### D6. Content/knowledge pages standardized via shared card + form rules
Shared overrides in the `theme.css` block set the card system (white `#ffffff` cards on `#eef5ff` background, `#e5e9f2`-family borders, consistent radius/shadow/heading/padding) and input system (consistent height, `border-slate-300` rest, blue focus ring, navy `#0b1f4d` primary buttons with white text). Page-specific fixes (request tabs/upload/preview in dashboard.html, feedback rating + history, returns item rows + history, announcements search/filter/feed, profile forms) are scoped per page and verified per page. The `show-password.js` eye toggles already exist on the change-password form and are verified, not re-added.

### D7. Navigation/loading stability via static shell + reserved space
The shell (header + sidebar) is static HTML — this stays. To prevent async layout shift: each async-rendering container gets a reserved `min-height` (via the shared block, applied to the primary content card wrappers) so first paint and post-fetch layout match, and the existing loading text remains until data fills. No new API fetches are introduced; each page's existing single fetch per endpoint is preserved (no duplicate calls).

### D8. Copy cleanup = remove only the flagged helper strings
Only these user-visible developer-style strings are removed: `feedback.html:687`, `feedback.html:752`, `returns.html:739`, `dashboard.html:1092`, `dashboard.html:1105`. Real labels, placeholders, empty states, and functional helper text (e.g., "1 = Poor, 5 = Excellent", "No announcements yet") stay. Where removal leaves a header/subtitle element, it is removed with its container, keeping card layout aligned.

## Risks / Trade-offs

- [Inline per-page `<style>` overrides may beat shared rules] → Use strong shared selectors, and append the standardized block after page inline styles for schedule (D4); per-page browser verification catches stragglers.
- [Changing active-state styling could make nav appear "dead" on pages with invisible toggles] → Static `.is-active` per current module plus high-specificity shared rule; verify each of the six pages visually.
- [`min-height` reservation can leave dead space on short content] → Use modest values tied to the current typical content height; verify against real data.
- [Removing helper copy may leave empty subtitle areas] → Remove the subtitle element with its container when it is the only editable text.
- [Multiple OpenSpec changes share one uncommitted working tree] → Only add standardization rules to `theme.css`; verify diffs are isolated before editing.
- [Schedule's appended block duplicates a few rules] → Accepted trade-off for guaranteeing identical visuals under schedule's unique load order; the block is small and documented.

## Migration Plan

Deploy/apply order:
1. Append the shared standardization block to `public/css/theme.css`.
2. Apply per-page HTML class/title edits (nav grids, schedule body class + appended block, dashboard active, copy removal).
3. Adjust dashboard.js only if the active-item wiring requires it (avoided by design, D3).
4. Verify each page in the browser (admin-mode and student-mode logins) against the checklist in tasks.md.

Rollback: revert the single `theme.css` block and the small HTML edits; no backend or build changes exist to unwind.

## Open Questions

- None blocking. (Ctrl-F: whether "Scheduler" title must become "Smart Serve" is resolved toward consistency per requirement R.Student sidebar; the "View Only"/"AI Plan" scheduling features are out of scope and left untouched.)