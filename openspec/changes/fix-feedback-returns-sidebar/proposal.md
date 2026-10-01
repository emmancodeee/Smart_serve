## Why

After the admin-filters work, the sidebar on **Feedback Management** (`admin-feedback.html`) and **Return Requests** (`admin-returns.html`) renders with a visibly different layout and appearance than the Dashboard sidebar: taller nav items (88px vs 72px), inflated paddings, a two-line "Smart Serve" title, and gray link borders instead of transparent/gold. The sidebar markup itself is identical to the dashboard's — the distortion comes from Bootstrap CSS loaded by those two pages colliding with Tailwind utility classes used by the shared sidebar.

## What Changes

- Add a scoped CSS override block in `public/css/admin.css` that restores the Tailwind sidebar values inside the shared `.sidebar-shell` on `.admin-page` pages:
  - Nav links: `padding: 1rem` top/bottom (Tailwind `py-4`) and `1.25rem` left/right (Tailwind `px-5`), `gap: 1rem` (`gap-4`).
  - Link borders: transparent at rest, gold on hover/active (matching the dashboard's `.admin-page .sidebar-shell a` rules).
  - Logo block: `gap: 1rem` so the "Smart Serve" title fits on one line.
  - Logo icon box: `border-color: rgba(255, 255, 255, 0.25)` instead of Bootstrap's gray `#dee2e6`.
- No HTML, filters, tables, content, backend, or routing changes. Bootstrap stays fully loaded (the pages' modals depend on it).
- Document the root cause (see `design.md`).

## Capabilities

### New Capabilities

- `admin-sidebar-bootstrap-isolation`: ensures the shared admin sidebar renders identically to the dashboard even on pages that load Bootstrap (utility-class collision isolation).

### Modified Capabilities

- (none — no existing OpenSpec capability changes at the requirement level)

## Impact

- **Files:** `public/css/admin.css` (one additive CSS block, ~45 lines).
- **Pages affected (visually):** `admin-feedback.html`, `admin-returns.html` — sidebar only, restored to match `admin.html` (dashboard).
- **No effect on** other pages: the overrides are scoped to `.admin-page .sidebar-shell` and replicate the Tailwind values that already apply everywhere Bootstrap is not loaded.
- **No effect on** Bootstrap's behavior for modals/tables on those pages.
