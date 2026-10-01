## Why

The "Submit Feedback" and "My Feedback" card header bands on the student Feedback page currently use a bright blue gradient (`linear-gradient(180deg, #17357f 0%, #2447a8 54%, #315fda 100%)`), which reads lighter and more saturated than every other blue section header in the Smart Serve student UI. The rest of the app — topbar, module title bars, dashboard section headers — uses the solid Smart Serve navy `#152c69`. The two Feedback sections should be restored to that same navy so the page matches the previous/original Smart Serve design. This is a colors-only fix: no layout, spacing, text, font, or functionality changes.

## What Changes

- Change the `background` of the `.feedback-card-header` rule on the student Feedback page (`public/feedback.html`) from the blue gradient to the solid Smart Serve navy `#152c69` (the `--module-title-bg` value already used by the topbar and module title bars), for BOTH the "Submit Feedback" and "My Feedback" header bands.
- Keep the exact band text ("Submit Feedback" / "My Feedback"), the white bold letter-spaced font, padding, border-radius, margins, and alignment identical — colors only.
- Keep the form controls, history table, empty state, submit button, sidebar, topbar, page shell, and all functionality unchanged.
- Do NOT introduce any new colors; reuse the existing Smart Serve navy already defined in the theme.

## Capabilities

### New Capabilities
<!-- No new capabilities. -->

### Modified Capabilities
- `student-feedback-page`: The "Submit Feedback" and "My Feedback" card header bands SHALL use the solid Smart Serve navy (`#152c69`, `--module-title-bg`) matching the rest of the student UI instead of the current blue gradient.

## Impact

- **Frontend (student)**: `public/feedback.html` — replace the `background` value in the scoped `.feedback-card-header` rule with the solid navy `#152c69`; no markup, text, layout, or JS changes. `theme.css` (loaded by the page) already defines `--module-title-bg: #152c69`.
- **Frontend (JS)**: `public/js/feedback.js` — untouched; no functional changes.
- **Backend / API**: none.
- **Styling**: no new colors or dependencies; reuses the existing Smart Serve navy.
- **Non-goals (unchanged)**: admin feedback management, backend routes/validation, sidebar/header/topbar, dashboard/profile/request/announcements/returns pages, auth, database schema.