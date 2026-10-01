## 1. Profile page markup

- [x] 1.1 In `public/profile.html`, restructure the Edit Your Profile block: move the blue title box out of the edit section as a sibling of `.student-panel`, changing `<section id="edit-profile" class="student-panel p-6">…<h2 …>Edit Your Profile</h2>…` into
      `<div class="module-title-bar mb-5">Edit Your Profile</div>` followed by `<section id="edit-profile" class="student-panel p-6">` (error block + form inside, `#edit-profile` id kept)
- [x] 1.2 Remove the now-redundant inline `#edit-profile { margin-top: 1.5rem; }` rule (the shared 20px rhythm owns the spacing) so the gap above/below the Edit title box matches Registration Details exactly

## 2. Styling verification (headless)

- [x] 2.1 Confirm the Edit Your Profile element now carries the same `.module-title-bar` class as Registration Details in the served HTML (no `#edit-profile` `h2` remains)
- [x] 2.2 Probe (real `theme.css` + `tailwind.css`): computed styles — padding, font-size, font-weight, color, background, border-radius, width — of both title boxes are identical at desktop width and at ≤1023px width
- [x] 2.3 Probe: vertical gaps around the Edit title box are 20px top and 20px bottom (uniform with Registration Details), and the gap between the Registration card and the Edit title box is 20px — nothing overlaps
- [x] 2.4 `git diff` confirms only `public/profile.html` changed; the file still contains no duplicate "Edit Your Profile" heading and all form fields (`editName`, `editEmail`, `oldPassword`, `newPassword`, `confirmNewPassword`) are untouched; `/profile` route returns 200

## 3. Live sanity

- [x] 3.1 Load `/profile` in the browser: both section headers show as matching full-width navy title boxes with white bold text, sections stacked with clean spacing, sidebar + header unchanged, and the edit form still submits (no functional change)