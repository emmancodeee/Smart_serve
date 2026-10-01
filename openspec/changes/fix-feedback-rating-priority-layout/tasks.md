## 1. Two-column Rating / Priority layout (CSS)

- [x] 1.1 In `public/feedback.html`, change `.feedback-right-col` (currently `grid-template-columns: 1fr; align-content: start`) to a two-column grid on desktop: `grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;` so Rating (existing first child) sits LEFT and Priority (existing second child) sits RIGHT
- [x] 1.2 Add a responsive media query so below the existing 1024px breakpoint `.feedback-right-col` collapses back to a single column (`grid-template-columns: 1fr; gap: 1.25rem;`) so Rating stacks above Priority on tablet/mobile with no overlap or horizontal overflow

## 2. Priority select label and placeholder

- [x] 2.1 In `public/feedback.html`, change the Priority label text to read "Priority *" (keep `for="priority"` and the `.student-form-label feedback-label` classes)
- [x] 2.2 Add a default disabled placeholder option as the first `<option>` of `#priority`: `<option value="" disabled selected>Select Priority</option>` while keeping the existing Low/Medium/High/Urgent options unchanged
- [x] 2.3 Confirm the priority select keeps its `student-form-select` class (same border radius, border, height, font, and styling as the other form inputs) and stretches across the right column's available width

## 3. Verify layout and alignment

- [x] 3.1 Confirm both "Rating (1-5)" and "Priority *" labels start at the same vertical position, and the priority select aligns horizontally with the rating buttons (no offset below the buttons)
- [x] 3.2 Confirm the Rating section keeps five compact equal-size buttons in one horizontal row with the "1 = Poor, 5 = Excellent" hint directly below and the existing navy selected/blue-border unselected styling; no overlap with any other field
- [x] 3.3 Confirm spacing stays consistent: same gap to the Detailed Feedback textarea above and to the Submit Feedback/Cancel buttons below (existing `.feedback-form` gap)

## 4. Preserve everything else

- [x] 4.1 Confirm no changes to sidebar, header, Smart Serve logo, colors, or typography, and no changes to the Category/Subject/Detailed Feedback fields, the My Feedback table, or the Submit Feedback/Cancel buttons
- [x] 4.2 Grep `public/feedback.js` references and confirm `rating` name + `rating1..5` ids and `priority` id remain unchanged so rating/priority functionality, submit, and history reload are unaffected

## 5. Final verification

- [ ] 5.1 Browser smoke-test (student login): on desktop, Rating appears LEFT and Priority RIGHT with a "Select Priority" placeholder in the right column, both labels aligned; submit feedback with a selected rating and priority still works
- [ ] 5.2 Narrow the window to tablet/mobile width to confirm Rating stacks above Priority with no overlap or horizontal overflow; cross-check the section matches the compact spacing of the rest of the form