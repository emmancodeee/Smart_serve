## 1. Remove the duplicate title bar

- [x] 1.1 Open `public/returns.html` inside `.student-main-inner` and locate the two large `module-title-bar` elements: the page title `<div class="module-title-bar mb-5">Return Request</div>` and the duplicate `<div class="module-title-bar">Submit Return Request</div>` above the form card
- [x] 1.2 Remove ONLY the duplicate `<div class="module-title-bar">Submit Return Request</div>` element, leaving the "Return Request" title bar (with `mb-5`) as the single page-level title
- [x] 1.3 Confirm exactly one `.module-title-bar` remains in `returns.html`, reading "Return Request" (grep the file for `module-title-bar`)

## 2. Remove the in-card "Submit Return Request" navy band

- [x] 2.1 Remove the `<div class="return-card-header">Submit Return Request</div>` element from inside `.student-panel.return-form-card`, directly above `.return-form-body` — no in-card "Submit Return Request" heading remains
- [x] 2.2 Remove the unused `.return-card-header` CSS block from the `<style>` section of `returns.html`

## 3. Preserve form and button

- [x] 3.1 Confirm the "Submit Return Request" submit button remains at the bottom of `#returnForm`, unchanged in label, classes, and submission behavior
- [x] 3.2 Confirm the "My Return Requests" history card heading and all other headings beyond the removed elements are untouched (`grep` `return-form-panel`, `return-form-body`, `My Return Requests`)

## 4. Verify spacing

- [x] 4.1 Confirm the "Return Request" `module-title-bar` still has `mb-5`, keeping the standard gap so the form card rises naturally with no large empty gap and no new spacing CSS is needed
- [x] 4.2 Confirm the form card's top looks clean — the `student-panel` has `border-radius: 28px` which rounds the top corners, and `return-form-body` provides consistent `padding: 1.5rem` so no empty space or clipped corners appear

## 5. Final verification

- [x] 5.1 Grep `public/returns.html` to confirm: exactly one `module-title-bar` with text "Return Request", no `return-card-header` element or CSS remains, the submit button present, and no heading or text reading "Submit Return Request" anywhere in the page as a heading
- [x] 5.2 Browser smoke-test (student login): open the Returns page — single large navy "Return Request" title bar at top, form card directly below with no "Submit Return Request" section heading, all fields/items row/add-item/buttons unchanged, submit works, "My Return Requests" history renders with consistent spacing, and no large empty gap exists between the title and the form