## Context

SmartServe renders the sidebar as static markup in each admin/student page shell. The Super Admin and Admin sides share the same `.sidebar-shell` markup (`header px-6 py-6` + `<ul class="grid grid-cols-1 gap-2 p-6">` + `.admin-nav-link` items) and pin their geometry in `public/css/admin.css`:

- `.sidebar a` / `.admin-page .sidebar-shell a`: `padding: 12px 20px; gap: 14px; border-radius: 12px` (admin.css 318-325) and, for the Bootstrap-colliding shells, the `!important` clamp at 1603-1610: `padding: 1rem 1.25rem !important; gap: 1rem !important`.
- `.admin-page .sidebar-shell ul`: `padding: 1.5rem` (1550).
- `.admin-nav-icon` (351-362): fixed `2.35rem` box, `0.85rem` radius, `border: 1px solid rgba(255,255,255,0.32)`, `background: rgba(255,255,255,0.09)`, `color: #fde047`, `flex-shrink: 0`.
- `.admin-nav-link span:last-child`: `line-height: 1.25` (364). Icons are `width="20" height="20"` svgs, no Tailwind size classes.
- Active (1587-1594): `border-color: rgba(253,224,71,0.95)`, `background: rgba(250,204,21,0.2)`, `translateX(3px)`.

The Student sidebar (`.dashboard-sidebar` / `.student-sidebar`) already received the gold admin design via `public/css/theme.css` (`.student-nav-icon` byte-matches `.admin-nav-icon` at theme.css 649-665). Remaining parity gaps:

1. **Icon glyph metrics differ.** Student items use `h-6 w-6` + inline `width/height:22px` svgs inside the 2.35rem box; admin icons are 20px with no size classes. The visible icon placement/size inside the matching 2.35rem container therefore differs.
2. **No `!important` geometry clamp on student links.** The admin side clamps `padding/gap` for every shell (1603-1610); the student side has no equivalent, so any page-level or future utility drift can inflate item padding/gaps and break parity.
3. **No label line-height rule.** `.admin-nav-link span:last-child { line-height: 1.25 }` has no student counterpart, so two-line labels wrap with different line spacing.
4. **Container padding not pinned.** Admin shells render with `padding: 0` on the shell (1514-1527); the student `.dashboard-sidebar`/`.student-sidebar` has no equivalent `padding: 0` clamp.

## Goals / Non-Goals

**Goals:**
- Pin Student sidebar item geometry to the exact admin reference numbers via `theme.css`, so all six student pages render identical spacing, padding, icon placement, and alignment to the Super Admin/Admin sidebar.
- Keep item-to-item rhythm, header/divider rhythm, icon columns, and label columns byte-consistent with the reference.
- Preserve the gold-on-navy design, active gold pill, menu order (Dashboard → User Profile → Request → Announcements → Feedback → Returns), labels, routing, and functionality exactly as they are.

**Non-Goals:**
- No changes to `schedule.html` (its sidebar SHALL remain byte-identical), Admin/Superadmin pages, `inventory.html`, markup, JS, routes, colors, or menu content.
- No redesign and no new design language — only reuse of the existing admin geometry rules.

## Decisions

### D1. Reuse the admin geometry values, applied to the Student sidebar in `theme.css`

Add one parity block in `public/css/theme.css` scoped to the Student sidebar (`.dashboard-sidebar` / `.student-sidebar` descendants) that hard-pins geometry to the same numbers admin uses:

```css
body.theme-light :is(.dashboard-sidebar, .student-sidebar) {
  padding: 0 !important;
}
body.theme-light :is(.dashboard-sidebar, .student-sidebar) ul.grid {
  padding: 1.5rem !important;          /* matches admin ul padding */
  gap: 0.5rem !important;              /* grid-cols-1 gap-2 */
}
body.theme-light :is(.dashboard-sidebar-link, .student-sidebar-link) {
  padding: 1rem 1.25rem !important;    /* admin 1604-1607 */
  gap: 1rem !important;                /* admin gap-4 */
  border-radius: 1rem !important;      /* rounded-2xl */
}
body.theme-light .student-nav-icon {
  /* already exists; keep byte-equal to .admin-nav-icon */
}
body.theme-light .student-nav-icon svg {
  width: 20px !important;
  height: 20px !important;
}
body.theme-light :is(.dashboard-sidebar-link, .student-sidebar-link) span:last-child {
  line-height: 1.25 !important;        /* admin 364 */
}
```

**Why:** a single CSS clamp block mirrors the exact mechanism admin already uses (admin.css 1603-1626), avoids editing six HTML shells, and keeps the change to one file. Numbers are copied verbatim from the reference so parity is objective.
**Alternatives considered:**
- Edit each of the six `.html` shells' inline classes: touches six files, repeats the same values, and does not protect against page-level CSS drift — rejected.
- Reuse `.sidebar-shell`/`.admin-nav-link` classes on student pages: would pull in admin-only rules (Bootstrap-neutralize, `.active` semantics) and entangle the two systems — rejected.

### D2. Normalize student icon glyphs to the admin 20px metrics

Clamp svgs inside `.student-nav-icon` to `20px × 20px` (admin's `width="20" height="20"`, admin.css 351-362 use-case). The 2.35rem container keeps identical box and centering, so icon placement inside each item matches the reference.

**Why:** glyph size is the one measurable student-vs-admin markup difference inside the icon box; the `h-6 w-6`/inline-size classes are leftover from the previous larger icon look.
**Alternatives considered:** edit the six shell svgs' classes/attrs — touches six files for the same result; CSS clamp is single-file and uniform. Rejected.

### D3. Active item keeps full continuous gold border with zero geometry change

Keep the existing active rule (theme.css 639-660: `border: 1px solid rgba(253,224,71,0.9)`, `background: rgba(250,204,21,0.18)`, `translateX(3px)`). Ensure `border-width` is applied uniformly (1px solid) to both inactive (`border-color: transparent !important` at 81-85 already) and active items so toggling only swaps `background-color`/`border-color`/translate — never padding, margin, or width. Verify no `overflow` clips the border on the wrapper.

**Why:** the spec requires the gold border visible and continuous on all four sides and no layout shift on click; the current rule set already does this — this decision is about verifying/locking it rather than redesigning it.
**Alternatives considered:** none — redefining the active pill would violate the "no redesign" constraint.

### D4. Preserve the existing design tokens untouched

No color, gradient, icon, label, or order values change anywhere. The parity block only pins geometry (padding, gap, size, radius, line-height, glyph metrics) to values already present in the markup (px-5/py-4/gap-4/rounded-2xl/p-6/gap-2) so it is behavior-neutral on pages whose CSS is already correct and corrective where drift exists.

**Why:** minimizes risk; the clamp only makes the render deterministic.
**Alternatives considered:** none.

## Risks / Trade-offs

- **[Icon glyphs shrink 22px → 20px]** → Intended parity with admin (admin icons are already 20px); no layout impact since the container is fixed at 2.35rem and centered.
- **[`!important` clamp conflicts with a future intentional resize]** → The clamp lives in one clearly-named block in `theme.css`; removing it restores previous behavior. Rollback is a single-file revert.
- **[`schedule.html` uses `.student-sidebar` too]** → The clamp is scoped to the reference values but schedule's student sidebar intentionally stays byte-identical; the block must only bind where the blue-nav shell is used, and apply task verification checks `schedule.html` is unchanged.
- **[Stale main spec wording for active state (white pill)]** → Out of scope for this change; re-syncing `student-sidebar-design` with the current gold active style is tracked separately.

## Migration Plan

1. Add the parity clamp block in `public/css/theme.css`.
2. Load each of the six student pages and compare item spacing, padding, icon column, label column, header rhythm, and the active gold border against the Super Admin reference.
3. Confirm `schedule.html`, Admin pages, and `inventory.html` are byte-identical.
4. **Rollback:** remove the single parity block from `theme.css`; prior behavior returns. No HTML/JS/route/migration changes.

## Open Questions

- None blocking. Whether the two-line label scenario occurs at the fixed 270px width for the existing labels ("Feedback Management" fits on one line at 0.96rem) is measured during apply; the line-height clamp covers it either way.