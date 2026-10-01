## Why

The inventory overview stat cards on the admin dashboard have absolutely-positioned icons in the top-right corner that overlap long card titles like "Units Distributed (30 Days)", "Projected Demand (30 Days)", "Items Below Reorder Point", and "Inventory Adjustments". This makes the titles difficult to read and looks unprofessional.

## What Changes

- Add a `.stat-header` flexbox wrapper around each card's icon and label to prevent overlap
- Restyle `.stat-icon` from absolute positioning to a fixed 40x40px container in the flex row
- Reduce icon SVGs from 22px to 18-20px
- Apply flexible title container (`flex: 1`) with `padding-right: 20px`, wrapping enabled
- Remove `position: absolute` from icon styling
- Keep all existing card structure (value, change, sparkline) unchanged

## Capabilities

### New Capabilities
- `stat-card-layout`: Flexbox-based card header layout that prevents icon/text overlap while preserving all existing card content and branding

### Modified Capabilities
*(None — this is a UI-only layout fix, no spec-level behavior changes)*

## Impact

- `public/css/admin.css`: `.admin-page .stat-icon`, `.admin-page .stat-label`, and new `.stat-header` styles
- `public/admin.html`: Wrap each `.stat-icon` + `.stat-label` pair in a `.stat-header` div (6 cards)
- No JS, API, or dependency changes
