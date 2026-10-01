## Context

The `#sendCodeBtn` button in `public/register.html` is the "Request OTP" submit-style action button:

```html
<button type="button" id="sendCodeBtn" class="inline-flex w-full items-center justify-center rounded-xl
  bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition
  hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1">Request OTP</button>
```

Verified compiled Tailwind state (`public/css/tailwind.css`): `.bg-amber-400` and the focus ring variants exist; `.hover\:bg-amber-300` exists at the `:hover` variant level; no `disabled:` variant is compiled. The compiled `.text-slate-900` rule gives the label its near-black color. In practice the button currently shows a dark/blue-toned background with black (slate-900) text — hard to read. `public/js/register.js` disables the button (`sendCodeBtn.disabled = true`) and swaps the label to "Sending..." while the OTP request is in flight, then re-enables it.

## Goals / Non-Goals

**Goals:**
- Make the "Request OTP" label white (#FFFFFF) in all states: default, hover, focus/focus-visible, active, disabled.
- Keep the button's background, size, border radius, spacing, position, font, and font weight exactly as they are today.
- Keep OTP send behavior, disabled/"Sending..." lifecycle, and form validation unchanged.
- Change no other Register page element.

**Non-Goals:**
- No change to background colors or hover background transitions.
- No change to the OTP functionality, backend, or APIs.
- No redesign of the button or the register page.

## Decisions

### D1. Scoped, in-page CSS rule keyed by `#sendCodeBtn`
Add a small `<style>` block in the `<head>` of `public/register.html` (or, if an inline page style already exists, extend it) containing ID-scoped rules:

```css
#sendCodeBtn,
#sendCodeBtn:hover,
#sendCodeBtn:active,
#sendCodeBtn:focus,
#sendCodeBtn:focus-visible,
#sendCodeBtn:disabled { color: #ffffff; }
```

**Why:** an ID selector `(1,0,0)` beats the `.text-slate-900` utility `(0,1,0)` and the global `button`/`button:hover` element rules `(0,0,1)/(0,0,2)`, so it wins without `!important`. It covers every state including the disabled state that class-based utilities cannot (no `disabled:` variant is compiled). Scope is page-local, so nothing outside the OTP button is affected.
**Alternatives considered:**
- Swapping Tailwind classes only (e.g., `text-slate-900` → `text-white`, adding `hover:text-white`): rejected because the compiled Tailwind file has no `disabled:` variant, so the disabled/"Sending..." state could not be guaranteed white; also relies on class availability that could change on a recompile.
- Editing the shared `public/css/style.css`: rejected — a Register-page concern belongs on the page to keep blast radius minimal and the diff easily reviewable.
- `!important` on a utility class: rejected — unnecessary given ID specificity; `!important` is avoided where a clean selector wins.

### D2. Leave background and geometry untouched
The `bg-amber-400`/`hover:bg-amber-300` background classes, padding, radius, spacing, and font utilities on `#sendCodeBtn` are not modified. Only `color` is affected by the new rules.

**Why:** the requirement is an exact single-property fix; touching anything else risks unintentional visual drift and violates the constraint.
**Alternatives considered:** none — the requirement is explicit.

## Risks / Trade-offs

- **White text on an amber/light background may reduce contrast** → The user explicitly requires white text and keeping the current background; no background change is made. Visual checks in browser verification confirm readability of the final rendered hue; if a specific hover/amber combination looks washed out, that is a separate styling change and out of scope here.
- **Existing future color rule could override the page `<style>`** → The ID-scoped page rule is more specific than any class/element rule currently present; any future higher-priority override would be caught by the verification step.
- **Disabled text color previously unset** → Now explicitly #FFF via the `#sendCodeBtn:disabled` rule; register.js only changes the label text and disabled flag, so behavior is unchanged.

## Migration Plan

- Add the scoped rule to `public/register.html` in one step; no backend, config, or data changes.
- Rollback: remove the added `<style>` block — the button returns to its current styling.
- Verify in browser: default/hover/focus/active/disabled label color, unchanged geometry/background, and unchanged OTP request behavior.

## Open Questions

- None blocking. The exact placement (new dedicated `<style>` block vs. extending an existing one in `register.html`) depends on the current head layout; both are equivalent functionally.