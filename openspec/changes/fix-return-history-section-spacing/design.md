## Context

The student Returns page (`public/returns.html`) renders two stacked cards: "Submit Return Request" (line 735) and the Return History card (line 824) containing the heading block — `<p class="student-panel-eyebrow">Return History</p>` (line 827) and `<h2 class="student-panel-title mt-1">My Return Requests</h2>` (line 828). The heading block sits in a plain `<div>` (line 826) inside the panel that has `p-6` padding. The heading reads too close to the left edge of the container; the user wants only the heading text nudged right by ~16–24px, and wants nothing else changed.

## Goals / Non-Goals

**Goals:**
- Add ~16–24px of additional left spacing to the Return History heading (eyebrow + title), keeping both lines aligned.
- Touch only the Return History heading on the student Returns page.

**Non-Goals:**
- No changes to layout structure, colors, fonts, text content, or functionality.
- No changes to the table, card, buttons, sidebar, header, or other pages.
- No CSS file or JS changes.

## Decisions

- **Add a left padding utility to the heading wrapper `<div>` rather than to each text element.** The wrapper (line 826) contains both the eyebrow and the title, so padding it moves both lines together and keeps them aligned. Alternative considered — adding left margin/padding to `.student-panel-eyebrow` and `.student-panel-title` independently — rejected because the shared `.student-panel-*` classes are also used by the Submit Return Request form (via `.student-panel` styling and other pages such as `feedback.html`), so touching them globally risks affecting other sections.
- **Use a Tailwind padding utility (`pl-5`, 20px) on the wrapper.** `pl-5` lands inside the requested 16–24px range and applies only to the heading container, adding roughly 20px of breathing room without moving the card or the table below. Alternatives considered — `pl-4` (16px, minimum of the range) and `pl-6` (24px, maximum); `pl-5` is the balanced midpoint.
- **No structural edits.** The change is limited to adding one utility class to the existing heading `<div>` at line 826.

## Risks / Trade-offs

- The additional padding stacks on top of the panel's existing `p-6`, so the total offset becomes ~44px from the card edge → Mitigation: this is deliberate per the requirement ("add small amount of left padding/margin, approximately 16–24px"); verify visually for balance before closing.
- Wrong element scoped → Mitigation: add the class to the heading wrapper only; the table (sibling of the wrapper) is unaffected.

## Migration Plan

- Single-file, frontend-only edit to `public/returns.html` (add `pl-5` to the heading wrapper at line 826). No data or server changes.
- Verify with the app running: student Returns page shows the heading with breathing room, aligned, and all other elements unchanged.
- Rollback = revert the single line.

## Open Questions

- None.