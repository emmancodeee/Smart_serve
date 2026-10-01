## 1. Design Tokens

- [x] 1.1 Add CSS custom properties (`:root`) to `admin.css` for all color tokens (navy, sidebar blue, gold accent, gold hover, bg, card bg, border, text colors, success, warning, danger)
- [x] 1.2 Add spacing tokens (`--spacing-page: 32px`, `--spacing-section: 24px`, `--spacing-card: 20px`)
- [x] 1.3 Add border-radius tokens (`--radius-card: 20px`, `--radius-button: 12px`, `--radius-input: 12px`, `--radius-table: 18px`)
- [x] 1.4 Add shadow token (`--shadow-card: 0 8px 24px rgba(15,23,42,.08)`)

## 2. Sidebar Polish

- [x] 2.1 Add sidebar CSS tokens and styles to `admin.css` (280px width, 12px/20px padding, 14px gap, active state with gold border, hover with 0.2s transition)
- [x] 2.2 Update admin.html sidebar to use new spacing classes (280px width, simplified inline classes)
- [x] 2.3 Update inventory.html sidebar to use same sidebar classes (already done by previous change)
- [x] 2.4 Update admin-requests.html sidebar to use same sidebar classes (already done by previous change)

## 3. Header Polish

- [x] 3.1 Add header CSS styles to `admin.css` (flexbox layout, centered items, 16px radius for clock/logout, equal height 44px, 20px gap)
- [x] 3.2 Update admin.html header structure to use new header classes
- [x] 3.3 Update inventory.html header to use same header classes
- [x] 3.4 Update admin-requests.html header to use same header classes

## 4. Statistic Cards

- [x] 4.1 Add card CSS styles to `admin.css` (24px padding, 20px radius, shadow, hover lift, icon circle style, typography for title/value/description)
- [x] 4.2 Add responsive grid CSS for cards (5 cols desktop, 3 tablet, 1 mobile)
- [x] 4.3 Update admin.html statistic cards to use new card classes with Lucide SVGs and icon circles
- [x] 4.4 Remove emoji-based icons from admin.html statistic cards

## 5. Section Headers & Filters

- [x] 5.1 Add section header CSS to `admin.css` (18px vertical / 24px horizontal padding, Flexbox with title left and filters right)
- [x] 5.2 Update admin.html section headers (analytics, announcements, adminAccounts, users) to use section-header-row with filters beside titles

## 6. Tables

- [x] 6.1 Add table CSS styles to `admin.css` (18px radius, navy header with white text, white rows, hover #F8FAFC, increased row height)
- [x] 6.2 Update admin.html tables to use new table classes (via CSS cascade, .admin-page table)
- [x] 6.3 Update inventory.html table to use new table classes (via CSS cascade, .inventory-page table)
- [x] 6.4 Update admin-requests.html table to use new table classes (via CSS cascade, .admin-requests-page table)

## 7. Form Controls

- [x] 7.1 Add button CSS styles to `admin.css` (12px radius, 14px/22px padding, darker hover, 0.2s transition)
- [x] 7.2 Add input/dropdown CSS styles to `admin.css` (12px radius, 44px height, 16px horizontal padding)
- [x] 7.3 Update buttons across admin.html to use new button classes (via CSS cascade)
- [x] 7.4 Update inputs and dropdowns across admin.html to use new input classes (via CSS cascade)
- [x] 7.5 Update buttons and inputs on inventory.html to match (via CSS cascade)
- [x] 7.6 Update buttons and inputs on admin-requests.html to match (via CSS cascade)

## 8. Analytics Section

- [x] 8.1 Add analytics chart layout CSS to `admin.css` (two-column responsive grid, equal height/width, white cards, proper padding)
- [x] 8.2 Update admin.html analytics section to use new chart layout classes

## 9. Layout & Spacing

- [x] 9.1 Add page-level layout CSS to `admin.css` (32px page padding for main content, 24px section spacing, 20px card gap)
- [x] 9.2 Apply consistent page padding and spacing to admin.html
- [x] 9.3 Apply consistent page padding and spacing to inventory.html
- [x] 9.4 Apply consistent page padding and spacing to admin-requests.html

## 10. Responsive Behavior

- [x] 10.1 Add responsive sidebar collapse CSS (drawer pattern for mobile, always visible on desktop at 280px)
- [x] 10.2 Add responsive table overflow styles (horizontal scroll on small screens)
- [ ] 10.3 Verify all admin pages at desktop, tablet, and mobile breakpoints (manual - run app and test)
