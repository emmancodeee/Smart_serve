## Context

SmartServe's admin sections in `public/admin.html` render a dark-blue section bar followed by a SmartFilter toolbar. Two distinct header markup patterns exist, styled in `public/css/admin.css`:

- Plain heading: `<h2>` → `.admin-page .admin-section h2` (admin.css:2027) uses `margin: 0 -1.25rem 1rem; padding: 18px 24px;`. The `1rem` bottom margin already creates a 16px gap between the blue bar and the filter toolbar below it. Used by: Analytics, Transactions, Registrations, Pickup Confirmations.
- Wrapped heading: `<div class="section-header-row"><h2>…</h2></div>` → `.admin-page .admin-section .section-header-row` (admin.css:2041) uses `margin: 0 -1.25rem;` with **no bottom margin**, and its inner `h2` resets margins to `0`. The full-bleed blue bar therefore sits flush against the filter toolbar right below it. Used by: **Admin Account Management** (`#adminAccounts`), **Announcement Management** (`#announcements`), and **Users Management** (`#users`).

This is the root cause of the reported bug: the blue header touches the filter/search boxes on Admin Accounts and Announcements.

## Goals / Non-Goals

**Goals:**
- Create a consistent 8–16px vertical gap between the blue section header and the filter toolbar on every section that uses the `.section-header-row` pattern.
- Use one shared rule/value so Admin Accounts, Announcements, and Users all inherit the same spacing.
- Preserve all existing styling: navy header, white background, rounded corners, borders, shadows, filter/button styling, typography.
- Keep spacing correct when filters wrap on laptop/tablet/mobile.

**Non-Goals:**
- No color, typography, content, or functionality changes.
- No changes to filter behavior, search, export, reset, buttons, or their labels.
- No redesign of any page or layout structure.
- No changes to backend, API, database, authentication, or authorization.
- No negative margins and no absolute positioning to force placement.

## Decisions

### D1 — Add the gap via the shared `.section-header-row` rule (source of fix)

Change `.admin-page .admin-section .section-header-row` from `margin: 0 -1.25rem;` to `margin: 0 -1.25rem 1rem;`. The inner `h2` already resets to `margin: 0; padding: 0;`, so only the row's bottom margin drives the gap.

**Why this over alternatives:**
- Aligns the wrapped-heading sections with the plain-heading sections that already use `1rem` bottom margin on the `h2` (admin.css:2027). One value, one rule.
- Fixes all three `section-header-row` sections (Admin Account Management, Announcement Management, Users Management) in a single shared edit — no per-page patches.
- `margin-top` on `.filter-toolbar` was rejected: `.admin-page .filter-toolbar` is shared with the Feedback and Returns pages, where the toolbar sits inside a `dashboard-panel-header` **flex row beside** the title (not below a header bar). A `margin-top` there would push the toolbar down relative to the title and misalign those pages.
- A sibling selector like `.section-header-row + * { margin-top: … }` was rejected: it duplicates what a bottom margin expresses directly and is more fragile.

**Value:** `1rem` (16px). This is the existing design token already used for the same purpose on the plain-heading sections and falls within the requested 8–16px range.

### D2 — Do not touch the shared `.filter-toolbar` block-level margins

The `.admin-page .filter-toolbar` rule (admin.css:3127) already provides `margin-bottom: 20px` for the space under the toolbar. It requires no change, and adding `margin-top` there would affect Feedback/Returns as described in D1.

### D3 — Inventory verification-only

Inventory Management (`public/inventory.html`) uses `<div class="section-header-bar">` around its `h2`; the `h2` still matches `.admin-page .admin-section h2`, so it inherits the existing `1rem` bottom margin and should already have the correct gap. This is a **verify-only** target: confirm the gap renders, and do not add new CSS unless the verification shows the gap missing.

### D4 — Feedback / Returns verification-only

`admin-feedback.html` and `admin-returns.html` place filters beside the title in a `dashboard-panel-header` flex row, never immediately under a blue bar. The Feedback page already has `row-gap: 1.1rem` for wrap. Verify-only, no CSS change expected.

### D5 — Student Announcements page (`public/announcement.html`) verification

The announcement page's filter sidebar sits below the navy "Browse all published notices" heading inside a `space-y-4` container, which guarantees a 1rem gap between the heading block and each filter control. Verify the gap renders; a code change is only needed if verification finds controls touching the header, and any fix must use the same `1rem` token rather than a bespoke value.

## Risks / Trade-offs

- [Adding bottom margin to `.section-header-row` could shift layout of sections that do NOT render a filter toolbar below it] → Mitigation: all three `.section-header-row` sections (announcements, adminAccounts, users) are followed by a SmartFilter container immediately, so the added `1rem` is the desired gap; nothing else follows the header.
- [Feedback/Returns pages could be affected if a loose `.filter-toolbar` margin were applied] → Mitigation: D1 scopes the change to the `.section-header-row` selector only; the toolbar's own margins are untouched (D2).
- [Margins on a full-bleed bar (negative horizontal margins) could amplify spacing quirks] → Mitigation: only the bottom margin changes; left/right `-1.25rem` values are preserved exactly.
- [Wrapped filters on small screens could still feel tight] → Mitigation: the gap is block-level, so it holds regardless of how many rows the toolbar wraps into; `.filter-toolbar` already wraps with `flex-wrap` and consistent `gap`.