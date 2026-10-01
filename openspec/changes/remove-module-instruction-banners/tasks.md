## 1. Description Removal

- [x] 1.1 `public/inventory.html`: remove the `section-subtitle` paragraph "Manage all inventory items, stock levels, and availability." (line ~139) so the "Inventory List" heading flows straight into the filter toolbar; keep the Add Item button and heading.
- [x] 1.2 `public/admin-returns.html`: remove the `p.dashboard-panel-copy` "View and manage student return requests for modules, uniforms, and books." (line ~272); keep the "Return Management" eyebrow, "All Return Requests" title, and the `#returnFilterContainer`.
- [x] 1.3 `public/admin-feedback.html`: remove the `p.dashboard-panel-copy` "View and manage student feedback submissions." (line ~268); keep the "Feedback Management" eyebrow, "All Feedback" title, and the `#feedbackFilterContainer`.

## 2. Verify Inventory Read-Only Banner Is Gone

- [x] 2.1 Grep: confirm no `inventoryReadOnlyNotice`, "Super admin can review inventory", or "inventory changes stay read-only" text remains anywhere in `public/`.
- [x] 2.2 Verification of permission: the read-only permission (super admin blocking inventory mutations + the view-only warning toast) remains untouched — no authorization logic changes were made.

## 3. Cleanup & Spacing

- [x] 3.1 After the removals, confirm the header rows have no empty styled elements and normal spacing on all three pages (inventory: heading → toolbar → table; returns: title block → filters → table; feedback: title block → filters → table).
- [ ] 3.2 Confirm no leftover margins, padding, or blank boxes were introduced by the edit (element-level removal leaves none; verify visually in browser).

## 4. Verification

- [x] 4.1 Grep: none of the three removed strings exist in `public/`; filters/table controls (`feedbackFilterContainer`, `returnFilterContainer`, `inventoryFilterContainer`, export/sort/reset buttons) are unchanged.
- [x] 4.2 Routes: `/inventory.html`, `/admin-returns.html`, `/admin-feedback.html` return 200 and their HTML/CSS/JS assets load.
- [ ] 4.3 Browser pass (admin): Inventory shows "Inventory List" heading directly over the toolbar, Add Item works, filters/table intact; Return Requests shows "Return Management / All Return Requests" with the filter row tight beneath and table/export/actions intact; Feedback Management shows "Feedback Management / All Feedback" with the filter row tight beneath and table/export/actions intact; no empty gaps or blank boxes on any page.
- [ ] 4.4 Browser pass (super admin): inventory mutation attempts still blocked with the view-only warning; page headers match the cleaned layout; sidebar, header, and all other modules unchanged.