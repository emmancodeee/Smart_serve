## Context

The student Feedback and Returns pages each have a Cancel button bound via `addEventListener` in `public/js/feedback.js` (lines 178–184) and `public/js/returns.js` (lines 118–125). The handlers were previously changed to always navigate to `/dashboard`; the student reports Cancel still taking them to the dashboard as the bug. Expected behavior is that Cancel returns to the page the student came from, staying on the current page when there is no prior page instead of jumping to the dashboard.

A secondary defect: the Cancel (`returns.html:903`) and Submit (`returns.html:904`) buttons inside the Returns page's "Return Process Feedback" modal still use inline `onclick`. The site's CSP (`server.js` helmet config at line 164, `script-src: ['self', cdn.jsdelivr.net, cdnjs.cloudflare.com]`) blocks inline handlers, so that modal Cancel silently does nothing.

## Goals / Non-Goals

**Goals:**
- Cancel on the Feedback page does not navigate anywhere — the student stays on the Feedback page.
- Cancel on the Returns page does not navigate anywhere — the student stays on the Returns page.
- The "Return Process Feedback" modal Cancel closes the modal reliably under CSP.
- Keep existing CSP-safe event-binding patterns already used on these pages.

**Non-Goals:**
- No changes to the student sidebar links or page routing in `server.js`.
- No changes to admin Feedback/Returns pages or any API/backend behavior.
- No change to the returns modal's Submit Feedback behavior beyond its wiring (it remains bound the same CSP-safe way).

## Decisions

- **Cancel does not navigate (empty handler).** Two prior behaviors were both reported as bugs: always navigating to `/dashboard`, and navigating back via `window.history.back()` (which landed on the user profile in the student's flows). The student explicitly expects Cancel to leave them exactly where the button is — "dito lang, hindi lilipat". The handler therefore performs no navigation at all:
  - `document.getElementById('cancelBtn')?.addEventListener('click', () => { /* stays on the page */ });`

- **Keep `cancelBtn` bound with `addEventListener`.** The pages already use ids (`cancelBtn`) and CSP-safe bindings (see `fix-my-feedback-actions`). Re-using the existing id and handler in `feedback.js`/`returns.js` is a one-line behavior change per file.

- **Locate and remove the inline `onclick` on the returns modal Cancel.** Move the modal-close to a CSP-safe `addEventListener` for that button's id in `public/js/returns.js`, consistent with how `feedback.js` already binds `closeModalBtn`/`closeModalFooterBtn` (lines 185–186). The Submit button is addressed only if its handler is also CSP-blocked; verify before touching it.

- **No HTML markup changes on `feedback.html`/`returns.html` beyond removing the inline `onclick`.** The buttons keep the same classes and visible text.

## Risks / Trade-offs

- A non-navigating Cancel button does nothing visible. → Mitigation: this is exactly the behavior the student confirmed ("dito lang, hindi lilipat"); the button remains a clear visual control next to Submit, and the modal Cancel still performs its real job (closing the modal).
- The returns modal Submit button may also be CSP-blocked. → Mitigation: verify both buttons; if Submit is affected, wire it identically to Cancel in `returns.js` (same scope, still within this change).
- Editing `returns.html` requires care not to disturb the modal markup. → Mitigation: touch only the Cancel/Submit button attributes; validate with `node --check` and a browser click test.

## Migration Plan

- Apply frontend-only edits to `public/js/feedback.js`, `public/js/returns.js`, and `public/returns.html`. No data migration, no server changes.
- Verify with `node --check` on the edited JS files and a manual Cancel click on both modules (from any entry point, the student stays on the same page), plus a modal Cancel click under the active CSP.
- Rollback = revert the single commit / the three files.

## Open Questions

- Does the returns modal Submit Feedback button also need rebinding? (Resolved by inspection during implementation — include it if it relies on inline `onclick`.)