## 1. Remove duplicate title bar (returns.html)

- [x] 1.1 Delete the second large `.module-title-bar` element (`<div class="module-title-bar">Submit Return Request</div>`) at `returns.html:757`, keeping only the first `module-title-bar` reading "Return Request" (line 756)
- [x] 1.2 Confirm exactly one `.module-title-bar` remains in the entire file, with text "Return Request"

## 2. Add in-card section heading (returns.html)

- [x] 2.1 Add a new `.return-card-header` rule in the inline `<style>` block (matching `.feedback-card-header` from `feedback.html`: `background: #152c69`, `padding: 1rem 1.5rem`, `border-radius: 28px 28px 0 0`, `margin: -1px -1px 0`, `font-size: 1.08rem`, `font-weight: 800`, `color: #ffffff`, `letter-spacing: 0.03em`, `text-align: left`)
- [x] 2.2 Insert `<div class="return-card-header">Submit Return Request</div>` as the first child inside the form's `.student-panel` card, directly above the `<form id="returnForm">` element

## 3. Fix form card padding conflict (returns.html)

- [x] 3.1 The history card (line 845) also uses `.return-form-card` which has `padding: 1.5rem`. Changing that padding to `0` would break the history card. Instead: add `.return-form-panel { padding: 0; }` to the inline `<style>` block, then change the form's card class from `return-form-card` to `return-form-panel return-form-card` so only the form card loses its padding while the history card keeps its `1.5rem`
- [x] 3.2 Add a `.return-form-body` rule in the inline `<style>` block (`padding: 1.5rem`) and wrap the `<form id="returnForm">` element (and its entire contents) in a new `<div class="return-form-body">` so the form retains its existing comfortable padding after the card's `padding: 0` takes effect
- [x] 3.3 Confirm the history card's class remains unchanged (`student-panel return-form-card`) with its `padding: 1.5rem` intact

## 4. Spacing after title removal (returns.html)

- [x] 4.1 Confirm the "Return Request" `module-title-bar` still has `mb-5` so the 20px gap between title and form card is preserved — no new spacing CSS needed after removing the duplicate bar

## 5. Verification

- [x] 5.1 Run a visual check: the "Return Request" page-level title appears once as a large blue bar, the "Submit Return Request" section heading appears as a smaller navy band inside the form card, no second large blue bar exists
- [x] 5.2 Confirm the Submit Return Request submit button at the bottom of the form is unchanged (same label, classes, position)
- [x] 5.3 Grep returns.html to confirm: `.return-card-header` present, `.return-form-panel` present, `.return-form-body` present, the removed `module-title-bar` text "Submit Return Request" is gone, exactly one `module-title-bar` remains with text "Return Request"
- [x] 5.4 Confirm no changes to `public/js/returns.js`, `tailwind.css`, `theme.css`, or any file outside `returns.html` (this session's edits are scoped solely to `returns.html`; `returns.js`/`theme.css` show as modified from earlier pre-existing working-tree changes, none containing this change's markers)
- [ ] 5.5 Smoke-test (browser): Returns page loads, single "Return Request" blue title bar at top, form card below with small navy "Submit Return Request" header band, form fields unchanged, item rows work, submit works, history card renders with correct padding, no large empty gap between title and form
