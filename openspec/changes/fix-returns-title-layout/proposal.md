## Why

The Student Returns page currently shows two large dark navy title bars stacked on top of each other: a page-level "Return Request" title and a second full-width "Submit Return Request" bar. This duplicates the same visual treatment at the same size with no differentiation between the page title and the form section heading, unlike the Feedback module which uses one large title bar plus a smaller navy band inside the form card.

## What Changes

- **Keep** the single large dark navy page-title bar reading "Return Request" as the only page-level title at the top of the Returns page.
- **Remove** the standalone "Submit Return Request" navy band/title bar entirely — no in-card "Submit Return Request" heading remains.
- **Keep** the "Submit Return Request" submit button at the bottom of the form, unchanged in label, styling, and behavior.
- After removing the duplicate title bar, the form card moves up naturally with consistent spacing; no large empty gap remains between the page title and the form.
- Preserve the existing Smart Serve navy blue / white / yellow design and keep padding and alignment consistent with the Feedback module and other student pages.

## Capabilities

### New Capabilities
- `student-returns-title-layout`: Defines the heading hierarchy of the Student Returns page — exactly one large page-title bar reading "Return Request", a smaller navy section heading "Submit Return Request" inside the form card, a preserved submit button, and consistent vertical spacing with no duplicate or empty layout.

### Modified Capabilities
<!-- None - no existing spec-level behavior is changing; this introduces a new UI-only capability. -->

## Impact

- `public/returns.html` — remove the duplicate "Submit Return Request" `.module-title-bar` element; confirm exactly one `.module-title-bar` (reading "Return Request") remains with the smaller `.return-card-header` band inside the form card.
- No changes to routing, form fields, validation, API calls, database logic, or return request behavior.