## 1. CSS — Update admin.css stat card styles

- [x] 1.1 Add `.stat-header` flexbox rule (`display: flex; justify-content: space-between; align-items: flex-start`)
- [x] 1.2 Update `.admin-page .stat-label` to use `flex: 1; padding-right: 20px; line-height: 1.4; white-space: normal; word-break: break-word`
- [x] 1.3 Remove `position: absolute` from `.admin-page .stat-icon`; set `width: 40px; height: 40px; flex-shrink: 0`
- [x] 1.4 Update `.admin-page .stat-icon svg` size from 22px to 18-20px

## 2. HTML — Add stat-header wrappers to admin.html

- [x] 2.1 Wrap `.stat-icon` + `.stat-label` in a `.stat-header` div for each of the 6 stat cards

## 3. Verify

- [x] 3.1 Start server and open admin dashboard; confirm no title text is hidden behind any icon
- [x] 3.2 Verify long titles ("Units Distributed (30 Days)", "Projected Demand (30 Days)", "Items Below Reorder Point", "Inventory Adjustments") display fully without overlap
- [x] 3.3 Verify icon containers are 40x40px and SVGs are 18-20px
- [x] 3.4 Verify card layouts remain consistent (values, descriptions, sparklines unchanged)
