# Fix Student Returns Module Layout

## Why

The Student Returns module page has layout issues: section titles, form field alignment, spacing, and button placement do not follow the established Smart Serve design pattern (blue rounded title boxes, clean white form card, evenly aligned fields, responsive stacking). The current page leads with a single "Submit Return Request" title bar instead of the intended two stacked sections, and the form fields/buttons are misaligned and cramped.

## What Changes

- Add a blue rounded page-title box reading "Return Request" as the top of the Returns page content area (below the header, next to the active Returns sidebar item).
- Keep a second blue title box reading "Submit Return Request" on the form card, sitting between the page title box and the form fields, so the page reads as VIEW 1 (top) → VIEW 2 (form) on one continuous scroll.
- Keep the single existing return request form and its functionality unchanged. No new route, no duplicated header/sidebar, no form behavior changes, no data/API changes.
- Keep "Registration *" as a full-width select field. Keep "Items to Return *" as a full-width field.
- Organize the item-related fields (Quantity, Condition, Additional Notes / Notes) in the item rows using an evenly aligned, equal-height grid with consistent spacing. Preserve all existing item fields (Type, Name, Condition, Quantity, Notes) and the "Add Another Item"/"Remove" behaviors.
- Place the Cancel button on the left and the Submit Request button on the right at the bottom of the form, with consistent spacing and not touching the container edges.
- Make the whole form live inside one clean white rounded container (`.student-panel`).
- Keep the existing "My Return Requests" history section and table as-is below the form.
- Ensure the page keeps the existing header, sidebar, "Returns" active state, and blue/yellow Smart Serve design tokens. Do not change unrelated modules.
- Responsive behavior: stack all fields vertically on small screens without horizontal overflow; accept fixed left/right margins on desktop.

## Capabilities

### New Capabilities
- `student-returns-layout`: Defines the layout of the single-scroll Student Returns page: top blue page-title box ("Return Request"), the "Submit Return Request" form section title on the white card, full-width Registration and Items to Return fields, an evenly aligned plugin item field grid, Cancel-left/Submit-right button row, and responsive stacking — with no changes to routing, sidebar, or existing form functionality.

### Modified Capabilities
<!-- None: the shared student sidebar design is unchanged. -->

## Impact

- **Frontend (HTML)**: `public/returns.html` — rework the title bars and form card structure (add top "Return Request" title box, add "Submit Return Request" card title bar), reorder the form buttons (Cancel left, Submit Request right), and adjust item-row field grid classes. Header, sidebar, modals, and history table markup stay structurally intact.
- **Frontend (CSS)**: `public/returns.html` inline `<style>` (and theme.css only if needed) — add/adjust rules for section title spacing, equal-height item field grid, button row layout, and small-screen stacking. Prefer existing `.student-*` tokens and Tailwind utilities already present in the page.
- **Frontend (JS)**: `public/js/returns.js` — only the `addItem()` template may need matching grid-class updates so dynamically added item rows render with the same layout. No form submission, API, or modal logic changes.
- **Templates using the same pattern**: `public/profile.html` already demonstrates the two stacked `.module-title-bar` + `student-panel` pattern to follow.
- **No changes**: server routes, data models, auth, admin module, other student modules.