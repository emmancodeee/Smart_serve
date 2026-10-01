## 1. Section titles and page structure (returns.html)

- [x] 1.1 Insert a new `<div class="module-title-bar mb-5">Return Request</div>` as the FIRST element inside `.student-main-inner` (above the existing "Submit Return Request" title bar), giving the page a top blue rounded page-title box reading "Return Request"
- [x] 1.2 Keep the existing `<div class="module-title-bar">Submit Return Request</div>` immediately above the form card so the form section keeps its blue title box reading "Submit Return Request"
- [x] 1.3 Confirm the main content container keeps `px-4 pb-8 pt-5 md:px-7` (or the theme-provided spacing) and that header, sidebar, and Returns active state are untouched
- [x] 1.4 Verify the two `.module-title-bar`s match the `profile.html` stacked-pattern styling (blue rounded box, consistent 20px spacing from theme.css header rules)

## 2. White form card and full-width fields (returns.html)

- [x] 2.1 Ensure the return request form remains inside one `.student-panel` white rounded container with comfortable padding (`p-6` or equivalent verified utility) so labels/fields never touch the card edges
- [x] 2.2 Confirm "Registration *" select is full-width inside the card
- [x] 2.3 Confirm the "Items to Return *" wrapper (`#itemsContainer`) is full-width inside the card

## 3. Item-row field alignment (returns.html)

- [x] 3.1 Rework the `.student-item-row` field grid to use VERIFIED Tailwind utilities present in `public/css/tailwind.css` (e.g. `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3`) so Type, Name, Condition, Quantity, and Notes share aligned columns and equal input/select heights, with an even `gap`
- [x] 3.2 For any required layout detail whose utility is MISSING (verify: `mt-3`, `items-end`, `md:grid-cols-4`, `sm:flex-row`), add a small explicit rule in the page's inline `<style>` block (prefixed `.return-*`, e.g. `@media` for stacking) instead of relying on missing classes or editing `tailwind.css`
- [x] 3.3 Keep all field classes intact: `.item-type`, `.item-name`, `.item-condition`, `.item-quantity`, `.item-notes`, and the row wrapper `.student-item-row` plus Remove/Add buttons

## 4. Keep dynamic item rows consistent (returns.js)

- [x] 4.1 Update the `addItem()` template in `public/js/returns.js` grid/class attributes to exactly match the static `.student-item-row` layout from task 3.1/3.2
- [x] 4.2 Confirm `collectItems()` still reads `.item-type`, `.item-name`, `.item-condition`, `.item-quantity`, `.item-notes` (no field removal or rename)
- [x] 4.3 Confirm `removeItem()`, the submit handler, `loadRegistrations()`, and modals are unchanged

## 5. Button row placement (returns.html)

- [x] 5.1 Reorder the form buttons so the Cancel button is FIRST (LEFT) and the "Submit Return Request" button is SECOND (RIGHT) in DOM order
- [x] 5.2 Give the button wrapper a flex layout with `justify-content: space-between` (verified utility present) so Cancel sits left and Submit sits right on desktop, away from card edges
- [x] 5.3 Keep `id="cancelBtn"`, the existing `student-btn` / `student-btn-secondary` / `student-btn-primary` classes, and `w-full sm:w-auto` (verified present) so behavior is unchanged
- [x] 5.4 Add a small-screen rule (inline `<style>` media query ~640px) stacking the two buttons full-width vertically without overlap

## 6. Responsive and spacing (returns.html)

- [x] 6.1 Confirm the item grid and form fields stack to a single column on mobile with NO horizontal overflow (rule/utilities from task 3.2)
- [x] 6.2 Confirm consistent vertical separation between the top "Return Request" title box, the form card, and the "My Return Requests" history card so sections never overlap
- [x] 6.3 Verify the history card, return-details modal, and feedback modal render unchanged

## 7. Verification

- [x] 7.1 Run `node --check public/js/returns.js` to confirm no syntax errors after the `addItem()` edit
- [x] 7.2 Grep that `module-title-bar` appears exactly twice in returns.html with texts "Return Request" and "Submit Return Request" respectively, and that `.student-form-*`/`item-*` class references are all intact
- [x] 7.3 Confirm no changes to routing, sidebar markup, header markup, admin pages, or `theme.css`/`tailwind.css`
- [x] 7.4 Smoke-test (browser or DOM inspection): form submits, "+ Add Another Item" adds a matching row, "Remove" keeps at least one row, Cancel button present on the left, history table loads