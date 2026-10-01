## 1. Remove the two dashboard cards

- [x] 1.1 Remove the Inventory Adjustments `.stat-card` block (`admin.html` ~136-144) from `.analytics-grid` — label, icon, `stat-value#inventoryAdjustments`, hint, and `adjustmentsSparkline` svg
- [x] 1.2 Remove the Active Cohorts `.stat-card` block (`admin.html` ~145-153) — label, icon, `stat-value#cohortsServed`, hint, and `cohortsServedSparkline` svg

## 2. Reflow the four-card grid

- [x] 2.1 Update the effective `.admin-page .analytics-grid` rule in `admin.css` (~3176) from `repeat(5, minmax(0, 1fr))` to `repeat(4, minmax(0, 1fr))`
- [x] 2.2 Update the ≤1023px rule in the same block from `repeat(3, ...)` to `repeat(2, minmax(0, 1fr))` so the four cards form a balanced 2×2

## 3. Verification

- [x] 3.1 Grep `public/admin.html` to confirm exactly four `.stat-card` blocks remain in `.analytics-grid` and no "Inventory Adjustments" / "Active Cohorts" references remain
- [x] 3.2 Run a computed-style / headless check on `.analytics-grid` at desktop, ≤1023, ≤639, and ≤480 widths confirming columns resolve to 4 / 2 / 2 / 1 with no empty trailing column for four cards
- [x] 3.3 Run a jsdom smoke check that `admin.js`'s analytics render path no-ops for the removed card ids (setText / renderSparkline null guards) and does not throw
- [ ] 3.4 Manual browser check: Super Admin dashboard shows only the four cards aligned in one even row on desktop, reflowing to 2×2 then 1 column on smaller widths; retained cards show correct values; charts/sidebar/header unchanged