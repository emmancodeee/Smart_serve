## 1. CSS — Replace inventory.css with new design system

- [x] 1.1 Add 4-card summary grid styles (120-130px height, blue/orange/navy/slate gradients, 20px radius, soft shadow)
- [x] 1.2 Add toolbar styles (single row, search wide, filter/sort dropdowns 52px height, 12px radius)
- [x] 1.3 Add "+ Add Item" button styles (gold accent, 12px radius, 44px height)
- [x] 1.4 Add table styles (72px row height, 20px/24px cell padding, centered Quantity, navy header)
- [x] 1.5 Add status indicator styles (colored dot + text: green #22C55E, orange #F59E0B, red #EF4444)
- [x] 1.6 Add category badge styles (Books: #DBEAFE, Modules: #EDE9FE, Uniforms: #FEF3C7)
- [x] 1.7 Add icon action button styles (36px, 10px radius: blue edit, red delete)
- [x] 1.8 Add form input styles (52px height, 12px radius, consistent padding)
- [x] 1.9 Add soft shadow token and hover animations (0.2s ease)
- [x] 1.10 Add modal styles for add-item dialog
- [x] 1.11 Remove all old inventory.css styles

## 2. HTML — Restructure layout

- [x] 2.1 Replace 2 summary cards with 4-card grid (Total Items, Low Stock, Categories, Last Updated)
- [x] 2.2 Add section title with subtitle above inventory list
- [x] 2.3 Add toolbar row with search, category filter, sort dropdown, "+ Add Item" button
- [x] 2.4 Add add-item modal with form fields (Item Name, Category, Quantity, Reorder Level)
- [x] 2.5 Update table header row and add data attributes for new column structure

## 3. JS — Update inventory.js

- [x] 3.1 Rewrite `displayInventory()` to use new table markup (badge spans, status dots, icon buttons, formatted dates)
- [x] 3.2 Add `formatDate()` helper for "MMM DD, YYYY" format
- [x] 3.3 Add modal open/close logic for add-item dialog
- [x] 3.4 Update event listeners for new toolbar controls and icon buttons
- [x] 3.5 Add sort functionality for the sort dropdown

## 4. Verify

- [x] 4.1 Test summary cards display correct data with proper colors
- [x] 4.2 Test toolbar search filters table correctly
- [x] 4.3 Test add-item modal opens, submits, and closes
- [x] 4.4 Test edit and delete icon buttons work
- [x] 4.5 Test status and category badges render correctly
- [x] 4.6 Test responsive layout at 1024px, 768px, 640px
