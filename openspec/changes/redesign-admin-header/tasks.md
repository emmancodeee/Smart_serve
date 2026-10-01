## 1. CSS — Add white header styles

- [x] 1.1 Add `.admin-header-white` class with white background, border, shadow, height 76px, padding 0 32px
- [x] 1.2 Add left-section styles for title (28px Bold) and subtitle (14px Medium)
- [x] 1.3 Add right-section styles with flex row, gap 20px, align-items center
- [x] 1.4 Add notification bell with gold badge styles
- [x] 1.5 Add compact clock card styles (12px radius, 10px/16px padding)
- [x] 1.6 Add admin profile styles (circular avatar, name, role label)
- [x] 1.7 Add gold logout button with icon styles (12px radius, 12px/20px padding)

## 2. HTML — Restructure admin.html header

- [x] 2.1 Replace old header with new `.admin-header-white` structure: left section (title + subtitle) and right section (bell, clock, profile, logout)
- [x] 2.2 Add inline Lucide SVGs for bell, calendar, logout, user, search icons
- [x] 2.3 Wire dynamic header title/subtitle to JS view-switching logic

## 3. HTML — Restructure inventory.html header

- [x] 3.1 Replace old header with new `.admin-header-white` structure matching admin.html

## 4. HTML — Restructure admin-requests.html header

- [x] 4.1 Replace old header with new `.admin-header-white` structure matching admin.html

## 5. JS — Update clock rendering

- [x] 5.1 Refactor `startHeaderClock()` in admin.js to render into compact card format with calendar icon
- [x] 5.2 Apply same clock refactor to inventory.js if present

## 6. JS — Add header title/subtitle mapping

- [x] 6.1 Add mapping object for page titles and subtitles per view
- [x] 6.2 Update header on view switch in admin.js

## 7. Verify

- [x] 7.1 Test header on admin.html — all sections render correctly
- [x] 7.2 Test header on inventory.html — all sections render correctly
- [x] 7.3 Test header on admin-requests.html — all sections render correctly
- [x] 7.4 Test clock updates every second
- [x] 7.5 Test logout button works and is visually correct
- [x] 7.6 Remove or comment out old `.admin-header` CSS to confirm no leakage
