## Context

A merge of `8de26b0` (frontend improvements: mobile-responsive sidebar, skip link, mobile menu, standardized design tokens) into branch `dja` (feedback/returns features, admin improvements) is in progress (`git merge` state, `MERGE_HEAD` = `8de26b0`). 18 conflict markers remain in 6 files. The branches diverged at `0ea030b`; both sides independently evolved the same admin/inventory pages, so most conflicts are additive feature changes that a simple "take ours" or "take theirs" would lose.

## Goals / Non-Goals

**Goals:**
- Remove all 18 conflict markers with a resolution that preserves every feature from both branches
- Keep the app functional: pages render, JS has no syntax errors, nav works
- Finish the merge with a clean commit (with `--no-edit` to keep the default merge message)

**Non-Goals:**
- Refactoring or redesigning pages beyond conflict resolution
- Resolving unrelated behavioral bugs (e.g., role-gating logic) unless they are direct consequences of a conflict region
- Changing server/routes or adding new features

## Decisions

**1. Union-resolution as the default strategy for every conflict**
Each conflict is examined independently: if both sides add distinct features, keep both (merged). Only remove content that is strictly superseded (e.g., HEAD's `grid-cols-1` nav replaced by theirs' responsive `grid-cols-2 lg:grid-cols-1` while keeping HEAD's extra nav items).
- Alternative: `git checkout --ours/theirs` per file - rejected because it would drop either the feedback/returns nav links or the mobile responsive work.
- Alternative: restart merge with `git merge -X ours/theirs` - rejected for the same reason, plus it cannot be selectively applied.

**2. HTML conflicts (admin.html, inventory.html): theirs' shell + ours' nav items**
The `8de26b0` shell (skip link, mobile menu button, overlay, slide-in sidebar classes, `lg:grid-cols-1` responsive nav grid) is the newer layout; the `dja` side's nav items (Feedback Management, Return Requests, Announcements, correct `data-view` attributes and `id`s) are preserved by merging the item lists.
- Rationale: layout/accessibility improvements come from `8de26b0`; page coverage/features come from `dja`.

**3. CSS conflicts: merge both variable groups, drop exact duplicates**
Both sides defined different token families (`--color-primary-navy`, `--radius-card`, etc. on HEAD vs standardized `--text-*`/`--shadow-*`/`--z-*` on theirs). Keep every unique variable; when the same variable name is defined with different values (e.g., `--text-xs`), keep them all but as distinct names if they collide in one rule set, prefer theirs' standardized values for shared names.
- Rationale: existing components across pages reference both families; deleting one set breaks styling.

**4. JS conflicts: concatenate both sides, resolve duplicate declarations**
`admin.js`/`inventory.js` conflicts are mostly added DOM refs and initialization calls (e.g., `superAdminNoticeText`/`welcomeTitle` refs, `initAdminProfile()`, welcome-title update). Keep both sides' statements in a sensible order (refs declared before use, both init calls executed).
- Alternative: reordering/refactoring shared logic - rejected, out of scope.

**5. Verification before committing**
After resolving, run `git diff --check` (whitespace/marker check), grep for `<<<<<<<`, then `npm test`, then `git add` the 6 files and `git commit --no-edit`.

## Risks / Trade-offs

- [Duplicate JS identifier declarations if both sides define the same const] → Grep for duplicate `const` names per block after resolution; rename the later one if needed.
- [CSS variable name collisions with different values break styling expectations] → Keep both families; for shared names prefer theirs' standardized values, spot-check `:root` parse.
- [Merged nav lists may contain stale ids/DOM refs (e.g., `adminAccountsNavItem`) that JS expects] → Keep `id`s from `dja` side that `admin.js` references (see JS refs list in `admin.js:350-361`).
- [A wrong resolution silently drops a feature] → Diff each resolved region against both branches' versions before staging.
- [Merge commit conflicts with future uncommitted work] → The working tree is already fully staged/committed before finishing the merge; nothing else is left uncommitted.
