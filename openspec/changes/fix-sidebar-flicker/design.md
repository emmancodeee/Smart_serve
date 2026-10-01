## Context

SmartServe is an Express, server-rendered static app: the admin panel shells (`public/admin.html`, `public/admin-feedback.html`, `public/admin-returns.html`, `public/inventory.html`) ship the full sidebar in HTML, and client JS makes navigation role-aware after an async `GET /api/auth/me`.

Today the role-gated items (`#adminAccountsNavItem`, `#registrationsNavItem`, `#pickupConfirmationsNavItem`) are **hidden by default** in every shell (`style="display:none;"`). Only `applySuperAdminUI()` in `admin.js:451` (admin SPA + admin-returns + admin-feedback) and `applySuperAdminSidebar()` in `inventory.js:113` reveal/hide the right set — and both run **after** `/api/auth/me` resolves. On every page load the sidebar first paints with an incomplete/wrong item set, then jumps when the network request finishes. During module navigation (which is full-page navigation between these static shells) the sidebar visibly flickers, collapses, or reflows.

A prior change (`fix-superadmin-pickup-confirmation`) already moved the reveal earlier in the init sequence, but the fundamental sync/async gap remains: correct role is only known after a network round-trip.

## Goals / Non-Goals

**Goals:**
- Render the correct role-based sidebar synchronously on every page load — no post-paint reveal toggling.
- Keep the sidebar visually stable across module navigation (only the active item changes).
- Preserve existing order, labels, icons, design, width, colors, active state, routes, and permissions. Pickup Confirmations stays ADMIN-only.
- Keep `/api/auth/me` authoritative for session validation and role confirmation.

**Non-Goals:**
- No API-route or permission changes. No CSS animations.
- No change to student pages or the admin-requests (white-header) page flow.

> **Amendment (apply):** the login response originally returned `isAdmin`, `accountType`, `name`, `email`, `token` but not `isSuperAdmin`. To satisfy task 1.1 (cache must include `isSuperAdmin` from the login response, so the Super Admin sidebar is correct on the first load right after login), `services/authService.js` `loginAccount` now also returns `isSuperAdmin: Boolean(account.isSuperAdmin)` — a strictly additive, non-breaking field. `/api/auth/me` is unchanged and remains authoritative.

## Decisions

### D1. Cache the authenticated admin profile in `localStorage` at login

In `public/js/app.js` (`handleLogin`, line ~70 where `token` is stored), also persist a `localStorage` key containing the authenticated profile used for role display. The login response already carries `data.isAdmin` and the profile fields returned by `/api/auth/me` shape (`name`, `accountType`, `isSuperAdmin`, etc.). We store only what the sidebar needs (`name`, `isSuperAdmin`, `accountType`, `isAdmin`) under a dedicated key, e.g. `smartserve_admin_profile`.

**Why:** the role must be available synchronously on the next page render. A `localStorage` round-trip is instant, requires no cache/gateway, and persists across the full-page navigations this app uses.
**Alternatives considered:**
- **Server-side render the role** (e.g., a small inline `<script data-role="superadmin">` injected by the Express route by decoding the token): eliminates the cache entirely, but touches the server and every shell, and changes page-serving behavior. Rejected as heavier than needed; client cache is a display hint only and the server remains authoritative.
- **Web Storage-less default-visible-then-hide**: reverts `fix-superadmin-pickup-confirmation` and would flash Admin-only items to Super Admins — violates requirement #13. Rejected.

### D2. Apply cached role synchronously before/at first render

Add one tiny shared helper (used by both `admin.js` and `inventory.js`) that, on `DOMContentLoaded`, first reads `localStorage.smartserve_admin_profile` and immediately sets the three nav items' `style.display` — **before** fetching `/api/auth/me`. Both `applySuperAdminUI()` and `applySuperAdminSidebar()` call this sync function first, then proceed to reveal/hide based on the cached role.

Concretely: a shared `getCachedAdminProfile()` read at the top of `applySuperAdminUI()`/`applySuperAdminSidebar()`, so the DOM is corrected with the cached role the instant the handler runs (which is at DOMContentLoaded, before the async auth fetch). This means the sidebar paints correct on the very first frame.

**Why:** minimal, contained change to exactly the two functions that already own this logic; no new script tags, no CORS/security surface.
**Alternatives considered:**
- Add an inline `<script>` in each HTML shell to read the cache before body renders — marginally earlier than DOMContentLoaded but duplicates logic across 4 files and creates ordering hazards. Rejected; DOMContentLoaded + immediate apply is indistinguishable perceptually (DOMContentLoaded fires as soon as HTML is parsed; a fetch cannot resolve before it on a normal connection).

### D3. Keep `/api/auth/me` authoritative; cache is a hint

After the async fetch, `currentAdminProfile = await fetch('/api/auth/me')` still runs and, on success, overwrites the cache (`localStorage.setItem`) and re-applies `applySuperAdminUI()`/`applySuperAdminSidebar()`. If the profile differs from the cache (e.g., role changed on the server), the authoritative value wins. On failure/401, keep existing logout/redirect behavior.

**Why:** the spec requires the server to remain authoritative; also keeps SSO/multi-tab and role-change scenarios correct. The cache is never trusted for authorization — only the server enforces permissions.

### D4. Cache lifecycle

- **Write:** on successful login (`app.js`) and after every successful `/api/auth/me` in admin.js/inventory.js.
- **Clear:** only on logout/redirect (existing `localStorage.removeItem('token')` paths in admin.js `performLogout`, inventory.js `logout`, and the 401 catch in admin.js). Add `removeItem` of the profile key in those same spots.
- No expiry needed: the server still validates the token each request; a stale cache is self-correcting on the next authoritative fetch.

## Risks / Trade-offs

- **Stale cached role briefly shown** (role changed while the page is cached/bfcache) → `/api/auth/me` immediately corrects it; the sidebar updates only if the role actually changed server-side, which is out of scope for "navigation stability".
- **Cache spoofing (non-security)**: a user could edit localStorage to force a different sidebar. Since permissions are enforced only server-side, this has no security impact — noted as a display-only hint.
- **Login first visit only**: on the very first load after login (no cache yet), there is still one async reveal. After a fresh login the response is in hand (we populate the cache from it on page receive), and every subsequent navigation has the cache → flicker gone for all steady-state navigation, which is exactly the reported bug.

## Migration Plan

1. Add cache write in `app.js` login success.
2. Add shared cached-profile read + profile cache write/clear helpers (small, duplicated or shared constants in `admin.js`/`inventory.js`).
3. Make `applySuperAdminUI()`/`applySuperAdminSidebar()` apply cached role first, then authoritative re-sync.
4. Reuse existing auth flows; no HTML/route/design changes.
5. **Rollback:** revert the 3 JS edits (app.js + admin.js + inventory.js) — prior behavior returns. No migration needed.

## Open Questions

- None blocking. Whether the two profile-cache helpers are shared via a tiny util vs. replicated per file is an implementation detail for apply (two call sites across two files both need them; either is acceptable — decide at apply time).