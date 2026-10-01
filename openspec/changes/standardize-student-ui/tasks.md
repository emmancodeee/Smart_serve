## 1. Shared Shell Standardization (theme.css)

- [x] 1.1 Append `/* === standardize-student-ui === */` block to `public/css/theme.css` overriding the `theme-light` sidebar flattening so `.student-sidebar` and `.dashboard-sidebar` keep the admin navy gradient (`#17357f → #2447a8 → #315fda`)
- [x] 1.2 In the shared block, define the ONE universal active-nav style (light/white pill, dark navy text, rounded) for `.dashboard-sidebar-link.is-active` / `.student-sidebar-link.is-active` under `body.theme-light`, with specificity that beats page inline rules
- [x] 1.3 In the shared block, add the standard card system (white cards on `#eef5ff`, consistent border/radius/shadow/heading/padding) and input/button system (consistent height, `border-slate-300` rest, blue focus ring, navy `#0b1f4d` primary buttons with white text)
- [x] 1.4 In the shared block, add reserved `min-height` to the primary async content containers to prevent layout jump

## 2. Per-Page Shell Edits

- [x] 2.1 Add `theme-light` to the `schedule.html` body class and append the same shell/active/spacing rules to the end of schedule's `<head>` (its inline `<style>` loads after `theme.css`, so it needs its own copy)
- [x] 2.2 Unify nav lists: profile.html and schedule.html nav list to `grid grid-cols-1 gap-2 p-6` with `h-6 w-6` icons; align schedule sidebar title "Scheduler" to "Smart Serve"
- [x] 2.3 dashboard.html: add static `.is-active` to the Dashboard nav link; keep the existing `[data-dashboard-nav]` hash-highlight logic in dashboard.js untouched
- [x] 2.4 feedback.html and returns.html: remove the transparent-border inline classes from the active link so the standard pill shows

## 3. Per-Module Content Layout

- [x] 3.1 dashboard.html: align Request/registration workflow spacing (step tabs, upload box, preview, back/next buttons) to the admin visual system without changing the 6-step flow
- [x] 3.2 dashboard.html: align stat cards and secondary cards' spacing/typography; remove helper copy at lines ~1092 and ~1105
- [x] 3.3 profile.html: align forms/cards spacing; verify password eye toggles still present and working on old/new/confirm password fields
- [x] 3.4 announcement.html: align search, filters, featured card, results meta, and feed spacing
- [x] 3.5 feedback.html: align form (category/subject/content/rating/priority) and history table; remove helper copy at lines ~687 and ~752
- [x] 3.6 returns.html: align return form (registration dropdown, item rows, reason/details/date/priority) and history table; remove helper copy at line ~739

## 4. Browser Verification

- [x] 4.1 Static sanity: confirm the shared block exists only in the intended places and the working-tree diff for this change is isolated (no backend/admin/auth-page edits)
- [x] 4.2 Student-mode: open Dashboard, User Profile, Request, Announcements, Feedback, Returns, and Schedule — verify shell, sidebar gradient, and ONE consistent active pill on every page
- [x] 4.3 Student-mode: on a throttled/loaded page, confirm async sections do not jump layout and each data endpoint is requested once per page load
- [x] 4.4 Responsive: at mobile width the sidebar collapses behind the burger/drawer with no horizontal overflow on all six pages
- [x] 4.5 Inspect all six pages in student mode — no developer-style/AI-like helper text is visible (all real labels/placeholders/empty states remain)