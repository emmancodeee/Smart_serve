## Why

The Inventory Management, Return Requests (admin), and Feedback Management (admin) pages still show one-line explanatory descriptions that read like decorative AI/developer-style notes ("View and manage student return requests for modules, uniforms, and books."). They add noise and make the modules look less like finished production screens.

## What Changes

- **Inventory Management**: Remove the remaining `section-subtitle` description "Manage all inventory items, stock levels, and availability." under the "Inventory List" heading so the heading flows straight into the filter toolbar and table. The previously removed read-only banner ("Super admin can review inventory data here, but inventory changes stay read-only.") is verified as already gone (removed by the `remove-instruction-banners` change) — no reintroduction, no permission change.
- **Return Requests**: Remove the `dashboard-panel-copy` description "View and manage student return requests for modules, uniforms, and books." from the Return Management panel header; keep the "Return Management" eyebrow, "All Return Requests" title, all filters, export, table, and actions, and let the filter row sit closer to the title (no blank gap).
- **Feedback Management**: Remove the `dashboard-panel-copy` description "View and manage student feedback submissions." from the Feedback Management panel header; keep the "Feedback Management" eyebrow, "All Feedback" title, all filters, export, table, and actions, and collapse the resulting spacing.
- Spacing cleanup only — trim/remove the removed text's own margins/padding; no empty boxes or large blank areas remain.
- No page content, data, filters, buttons, tables, errors, empty states, permissions, or security messaging are touched. **No backend, database, authentication, authorization, or route changes.**

## Capabilities

### New Capabilities
- `module-banner-cleanup`: Requires that the Inventory, Return Requests, and Feedback Management admin pages display no decorative instructional/description text in their headers beyond the page/section title, while every functional element (filters, toolbar, table, buttons, export, empty states, permissions) stays intact and no empty or oversized gaps result.

### Modified Capabilities
<!-- No existing capability requirements change; presentational copy removal only. -->

## Impact

- `public/inventory.html` — remove the `section-subtitle` line under "Inventory List"; confirm the read-only notice is gone.
- `public/admin-returns.html` — remove the `dashboard-panel-copy` description in the Return Management panel header.
- `public/admin-feedback.html` — remove the `dashboard-panel-copy` description in the Feedback Management panel header.
- No JavaScript, CSS, backend, or DB files change.