## Why

The six Student Side modules (Dashboard, User Profile, Request, Announcements, Feedback, Returns) do not share one consistent vertical rhythm around the blue module title bar. Some pages space the title bar from the header/content via a `grid gap-5` container, others via `mb-5` on the title bar, and none of the mechanisms are guaranteed — so the title bar can sit too close to the sticky top header or flush against the content/form directly below it. The goal is one consistent, predictable rhythm across every Student module: ~16–24px below the top header and ~20–24px above the first content block.

## What Changes

- Introduce a single shared CSS rule (scoped to Student module pages) that guarantees the title bar never touches the top header or the content/form below it, and that every block below the title bar keeps a consistent 20px gap.
- Convert the three Student containers that currently rely on `grid gap-5` (Dashboard, Feedback, Returns) to the same block-container rhythm used by the other pages, so spacing does not double or vanish when margins and grid gaps are combined.
- No title text, sidebar, header, colors, typography, or content changes. No page is added, removed, or renamed.
- **BREAKING**: none.

## Capabilities

### New Capabilities
- `student-module-title-spacing`: Student Side module pages maintain a consistent vertical rhythm where the blue module title bar sits approximately 16–24px below the top header and 20–24px above the first content block, and blocks below the title bar are evenly spaced, at all screen sizes, on Dashboard, User Profile, Request, Announcements, Feedback, and Returns.

### Modified Capabilities
<!-- No existing specs; openspec/specs is empty. -->

## Impact

- `public/css/theme.css` — one new scoped rule that spaces every first-level block following a `.module-title-bar` inside Student main containers (`custom/main-inner` selectors), without affecting Admin pages or the Schedule page (which has no module title bar).
- `public/dashboard.html` — drop the `grid gap-5` utilities from `dashboard-main-inner` (the internal two-column layouts use their own `dashboard-layout-grid` / `registration-workflow` grids and are unaffected).
- `public/feedback.html`, `public/returns.html` — drop the `grid gap-5` utilities from `student-main-inner`; the single column now spaces its blocks via the shared rule.
- No change to `public/profile.html`, `public/announcement.html`, server routes, page JS, or other CSS.