# Design — Align Profile Title Boxes

## 1. Reuse the shared title-box class (no new CSS)

The `.module-title-bar` component (defined once in `theme.css`, identical on the
Admin side as `.section-header-row`) already provides exactly the required box:
navy `#152c69` background, white text, weight 800, `1.08rem`, letter-spacing
0.03em, padding `18px 24px`, radius `28px 28px 0 0` (CRUD-vars also drive the
Admin `.module-title-bar`). The Student Profile page's "Registration Details"
already uses it. Therefore "Edit Your Profile" gets the **same class** — the two
boxes are then identical by construction (same height, width, padding, font
size, weight, alignment, radius, color), so no bespoke CSS is authored.

## 2. Markup change in `public/profile.html`

Restructure to mirror Registration Details exactly, with the blue box as a
sibling **above** the white card (children of `.student-main-inner`):

```html
<div class="module-title-bar mb-5">Registration Details</div>
<section class="student-panel p-6">…info grid…</section>

<div class="module-title-bar mb-5">Edit Your Profile</div>
<section id="edit-profile" class="student-panel p-6">
  <div id="profileUserInfoError" …>…</div>
  <form id="editProfileForm" …>…inputs + button…</form>
</section>
```

The `<h2 class="mb-4 text-lg font-bold text-[#0b1f4d] …">Edit Your Profile</h2>`
is removed (replaced by the title box — no duplicate heading). The `#edit-profile`
id stays on the section (keeps the page's anchor/CSS hooks valid).

## 3. Spacing ownership

The shared rhythm rule in `theme.css`
`body.theme-light :is(.dashboard-main-inner, .student-main-inner) > .module-title-bar`
pins 20px above + 20px below **every** direct-child title bar on student pages.
Both new title bars are direct children, so:
- 20px gap header→Registration box, 20px box→info card, 20px card→Edit box, 20px Edit box→edit card — uniform, no doubling.

The old inline `#edit-profile { margin-top: 1.5rem }` in `profile.html`'s `<style>`
was compensating for the in-panel h2 and would now double the gap, so it is
removed. This keeps overall sizing/spacing/alignment identical across the page.

## 4. Compatibility / safety

- Full-width block divs under `.student-main-inner` — same as the current
  Registration Details title — no overlap possible; short labels never wrap; the
  flex centering matches the Admin reference.
- No other student pages are touched; the six other modules keep their existing
  single title bars.
- No JS, no form field, no sidebar/header change. `tailwind.css` classes used
  (`mb-5`, `student-panel`, `p-6`) all already exist.

## 5. Verification

Headless probe: build a static harness loading real `theme.css` + `tailwind.css`
mirroring the new profile `main` structure, then assert the two title bars have
identical computed padding/font/radius/background and uniform 20px gaps at
desktop and mobile widths; plus a browser DOM dump of `/profile` confirming the
`.module-title-bar` class on the Edit title and the removed `<h2>`.