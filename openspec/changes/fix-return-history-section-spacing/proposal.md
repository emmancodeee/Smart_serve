## Why

On the Student Returns page, the "RETURN HISTORY" eyebrow and "My Return Requests" title sit too close to the left edge of the content container, making the Return History section header look cramped. Only the heading's left spacing needs a small adjustment; everything else is fine.

## What Changes

- Add a small amount of left padding (approximately 16–24px) to the Return History heading block on the student Returns page so "RETURN HISTORY" and "My Return Requests" move slightly to the right.
- Keep both texts aligned with each other.
- Do NOT change the layout structure, colors, fonts, text content, table, buttons, sidebar, header, or any functionality.
- Do NOT move the Return History card or the table below it.

## Capabilities

### New Capabilities
- `return-history-heading-spacing`: Defines the expected left spacing of the "Return History" eyebrow and "My Return Requests" title on the student Returns page — aligned with each other and breathing room from the left edge of the container.

### Modified Capabilities
<!-- None: no existing spec-level requirements change. -->

## Impact

- `public/returns.html` — add left padding to the Return History heading wrapper (lines 826–829).
- No server, API, CSS file, JS, or other page changes.