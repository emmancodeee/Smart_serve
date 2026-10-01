## Why

The completed `fix-student-returns-layout` change added a second `.module-title-bar` to the Returns page: a "Return Request" page-level title plus a "Submit Return Request" form-section title, both rendered as large navy bars stacked directly on top of each other. This duplicates the same visual treatment at the same size, with no differentiation between the page title and the form section heading. The Returns page should follow the same visual pattern used on the Feedback page: one large `module-title-bar` as the page title, and a smaller navy card-header band inside the form card for the section heading — not two stacked full-width bars.

## What Changes

- **Remove** the large standalone `.module-title-bar` containing "Submit Return Request" (currently at `returns.html:757`), which is the duplicate page-level title bar.
- **Keep** the large `module-title-bar` containing "Return Request" (currently at `returns.html:756`) as the only page-level title.
- **Add** a small navy card-header band inside the `.return-form-card` panel (matching the Feedback module's `feedback-card-header` treatment) displaying "Submit Return Request" as the form section heading.
- Adjust vertical spacing inside the form card after adding the header band so the form content sits naturally with consistent padding.
- No functional, routing, API, validation, or behavior changes. UI-only change scoped to `public/returns.html`.

## Capabilities

### New Capabilities

- `student-returns-title-layout`: The visual structure and heading hierarchy of the Returns page — defining the single page-level title bar and the in-card section heading pattern used inside the form panel.

### Modified Capabilities

_(none — no existing spec requirements change; the change is a correction to the structural layout introduced in `fix-student-returns-layout`)_

## Impact

- **`public/returns.html`**: HTML class/markup changes to the title area and form card header, plus a scoped `<style>` block addition for the new in-card header band.
- No JavaScript changes (`public/js/returns.js` untouched).
- No server, database, routing, or shared CSS (`tailwind.css`, `theme.css`) changes.
- No impact on the Feedback, Profile, Announcements, or Dashboard pages.
