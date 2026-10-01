# Report: Feedback Management & Return Request — Links and Sidebar Consistency

Change: `fix-admin-links-and-sidebar` · Schema: spec-driven · Implemented: static audit + live HTTP verification + layout verification. No code changes were required.

## What caused the "broken links" / sidebar divergence

- **Historical root cause:** `admin-feedback.html` and `admin-returns.html` were originally built by copying the *student-dashboard* shell (`dashboard-sidebar w-full`, `dashboard-topbar`, `dashboard-main-inner`) instead of the shared admin shell. That produced a different-looking sidebar and a layout where sidebar links could fail to map cleanly to the admin routes.
- **Prior fix (this change's alias):** The `unify-admin-layout` change rebuilt both pages on the canonical admin shell (shared markup + `public/css/admin.css` + `public/js/admin.js`), removed the page-local shell CSS, and added SPA guards (`isSpaAdminShell()`) so admin.js's view-switching never hijacks these standalone pages.
- **What re-verification found:** All 34 admin nav `href`s across the four admin HTML files (`admin.html`, `admin-feedback.html`, `admin-returns.html`, `admin-requests.html`) already point to served routes. Live HTTP checks returned **200 for every route**: `/admin`, `/admin/dashboard`, `/admin/feedback`, `/admin/returns`, `/admin/registrations`, `/admin/pickup-confirmations`, `/inventory`. **Zero broken links or 404s.**

## Routes verified (all resolve)

| Link target | Route | Served file |
|---|---|---|
| `/admin/dashboard` | `app.get(['/admin','/admin/dashboard'], adminPageHandler)` | `admin.html` |
| `/admin/accounts` | `adminPageHandler` | `admin.html` |
| `/admin/announcements`, `/admin/transactions`, `/admin/registrations`, `/admin/pickup-confirmations` | `app.get([...], adminPageHandler)` | `admin.html` (SPA sections) |
| `/admin/feedback` | dedicated route | `admin-feedback.html` |
| `/admin/returns` | dedicated route | `admin-returns.html` |
| `/inventory` | dedicated route | `inventory.html` |

`admin-requests.html` is **no longer served** by `server.js` — it is dead code carrying an older 280px `aside` variant. It has no user-facing impact and was left untouched (informational finding).

## Sidebar / Layout verification

- **Shared shell confirmed** on Feedback and Return: exactly one `nav#sidebar.sidebar-shell` (`lg:w-[270px]`, navy gradient `#17357f → #2447a8 → #315fda`), one `#main-content` (`lg:ml-[270px]`), one header — identical to `admin.html`.
- **Zero duplicates:** greps found no `dashboard-sidebar`, `dashboard-topbar`, `dashboard-main-inner`, `dashboard-shell` on any admin page. Page-local `<style>` blocks contain only card/content styling, no sidebar/layout CSS.
- **Nav items identical:** same `admin-nav-link` class string (`px-5 py-4 rounded-2xl`, `gap-4` icon spacing, `text-[0.96rem] font-semibold`, 20px icons, `p-6` nav padding, `gap-2` spacing), identical "Smart Serve" logo block.
- **Active style shared gold-tinted:** both pages mount `public/js/admin.js`; the shared `.admin-page .sidebar-shell a.active` rule (gold `rgba(250,204,21,0.2)` background, yellow border, white text, `translateX(3px)`) applies — matching Dashboard. No per-page gray restyle, per user decision.
- **Cross-file links are plain `<a>`** (no `data-view`) so SPA navigation never hijacks them; each page marks its own entry with the static `active` class.

## Files modified

**None.** This change was verification + documentation. The visual/shell work was completed by `unify-admin-layout` and verified visually by `unify-sidebar-visuals` (12/15). No edits to `server.js`, `public/css/admin.css`, `public/js/admin.js`, or the reference pages (`admin.html`, `admin-requests.html`).

## Duplicate components removed

Removed earlier by `unify-admin-layout` (completed before this change): page-local `dashboard-sidebar*` shell CSS/markup and duplicate page-local `startHeaderClock`/`setupLogout` handlers on `admin-feedback.js`/`admin-returns.js`. This change's search confirms nothing remains — a single shared shell, one shared `admin.css`, one shared `admin.js`.

## Confirmation

- Feedback Management and Return Request render the **exact same layout/sidebar as Dashboard** — same 270px width, padding, spacing, item height, radiuses, gold-tinted active styling, hover animation, icon size/spacing, typography, colors, gradient, borders, shadows, and brand block.
- **All broken links are fixed** — in fact zero broken links remained at audit time; every nav route returns HTTP 200. No 404s.

## Remaining

The task still lists 4.1–4.3 and 5.2 for the user's final visual regression pass on the running app — once the user confirms the sidebar matches Dashboard in a real browser, mark them complete and run `/opsx-archive`.