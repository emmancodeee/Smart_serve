## Context

The Student Returns page (`public/returns.html`) renders its title area inside `.student-main-inner`. A previous layout change introduced a second `.module-title-bar` reading "Submit Return Request" stacked directly below the page-level "Return Request" bar. Both render as full-width navy bars at the same size, producing a duplicated title treatment that no other student module uses.

The Feedback page (`public/feedback.html`) is the established pattern: one `.module-title-bar` page title. The Returns page should follow the same pattern — a single large "Return Request" title bar, with no additional "Submit Return Request" heading or section band anywhere on the page.

## Goals / Non-Goals

**Goals:**
- Keep "Return Request" as the single large navy page title bar on the Returns page.
- Remove the duplicate standalone large "Submit Return Request" title bar.
- Remove the "Submit Return Request" section heading band entirely from the form card.
- Keep the "Submit Return Request" submit button unchanged.
- Adjust vertical spacing naturally (no large empty gap) after removal.
- Match the Feedback module's heading hierarchy and spacing (single page title only).

**Non-Goals:**
- No changes to routing, form fields, validation, API calls, database logic, or return request behavior.
- No renaming of "Return Request".
- No creation of new titles or title elements.
- No changes to the header, sidebar, or Admin/Superadmin pages.

## Decisions

**D1: Remove the duplicate `.module-title-bar` element rather than restyling it.**
The second element (`<div class="module-title-bar">{{text}}</div>`) duplicates the same class and, therefore, the same full-width navy treatment as the page title. Restyling it to look "smaller" would fight the shared class styles. Deleting the element and relying on the existing `.return-card-header` band (already matched to the Feedback pattern) yields the exact Feedback-style hierarchy.

**D2: Keep the existing `.return-card-header` as the in-card section heading.**
`returns.html` already has `.return-card-header` markup inside the form card; its CSS is identical to the Feedback module's `feedback-card-header`. No new CSS or markup is needed for the section heading.

**D3: Preserve the existing `mb-5` gap on the "Return Request" bar.**
The page title bar already carries `mb-5`, which provides the standard 20px gap below the main header / above the form card. Removing only the duplicate bar lets the form card rise naturally; changing no spacing values avoids new empty gaps or misalignment with Feedback.

**D4: Do not duplicate a page title on this delta into a shared spec.**
This is UI-only markup cleanup in one file; it does not change any existing main-spec behavior, so it is captured as a new capability rather than modifying `student-sidebar-design`.

**Alternatives considered:**
- *Merge the two bars visually* — rejected: two full-width navy bars still read as duplicate titles and do not match other student modules.
- *Shrink the second bar with new CSS* — rejected: introduces a new visual variant inconsistent with the established Feedback card-header pattern.

## Risks / Trade-offs

- [A leftover second `.module-title-bar` is missed] → Mitigation: task verifies via grep that exactly one `.module-title-bar` remains, reading "Return Request".
- [Form content shifts or leaves a gap after removal] → Mitigation: the title bar keeps `mb-5`, so spacing is unchanged from the current gap; a visual check confirms no large empty gap.
- [Accidental removal of the submit button, history heading, or form fields] → Mitigation: scope tasks touch only the duplicate title element; verification greps for the submit button, `.return-card-header`, `.return-form-panel`, `.return-form-body`, and the "My Return Requests" history heading.