## Context

The admin panel's Return Requests (`/admin/returns`) and Feedback Management (`/admin/feedback`) sections render as standalone pages (`admin-returns.html`, `admin-feedback.html`) with their own scripts (`admin-returns.js`, `admin-feedback.js`). These scripts fetch from `/api/admin/...`, but the server never mounts that prefix:

- `server.js:269` mounts `app.use('/api/auth', authRoutes)`
- `routes/auth.js:111` nests `router.use('/admin', adminRouter)`
- Result: the only valid admin API base is `/api/auth/admin`

Every fetch from these two pages therefore returns `404 {"error":"Page not found"}` — the "system not found" crash reported. The main admin SPA (`admin.js`) already uses `API_BASE = '/api/auth/admin'` (admin.js:166) and works correctly. Student pages (`feedback.js`, `returns.js`) use `/api/auth/...` and are unaffected.

## Goals / Non-Goals

**Goals:**
- Make the Return Requests and Feedback Management sections load and operate correctly (list, view, approve, reject, confirm, respond, status, priority).
- Keep the fix minimal and consistent with the existing working pattern (`/api/auth/admin`).

**Non-Goals:**
- No server-side route changes — the endpoints already exist under `/api/auth/admin`.
- No UI restyle of these Bootstrap-based pages (out of scope; separate concern).
- No changes to the student-facing feedback/returns flows.

## Decisions

- **Fix the client, not the server.** The API endpoints already exist at `/api/auth/admin/...` (auth.js:82-94). Adding a second `/api/admin` mount would duplicate routing, split middleware behavior, and diverge from the pattern every other working page uses. Updating the 11 fetch call sites is lower-risk and consistent.
- **Exact string replacement.** Replace the literal prefix `/api/admin/` with `/api/auth/admin/` in both files. No refactoring of the scripts' structure; minimal diff, easy to review.
- **Verification via live requests.** After editing, start the server and confirm `GET /api/auth/admin/returns` returns 401 (auth gate, route exists) instead of 404, and that `/api/admin/returns` is no longer referenced anywhere in `public/`.

## Risks / Trade-offs

- [Token/auth behavior on the standalone pages] → The pages already send `Authorization: Bearer <token>` headers; route existence is the only change needed. Verify with an unauthenticated request (expect 401, not 404) and, if possible, a real admin token.
- [Regression if future code reintroduces `/api/admin/`] → The audit task greps `public/` for `/api/admin/` and the spec records the constraint.
- [Cosmetic inconsistency of Bootstrap pages] → Explicitly out of scope; noted so it is not silently "fixed" during this change.

## Migration Plan

1. Edit `public/js/admin-returns.js` (6 call sites).
2. Edit `public/js/admin-feedback.js` (5 call sites).
3. Grep `public/` to confirm no stale `/api/admin/` references remain.
4. Start server; probe `/api/auth/admin/returns` and `/api/auth/admin/feedback` (expect 401 without token, proving the route exists and the previous 404 is gone).
5. Optionally verify the page end-to-end in a browser with an admin login.

Rollback: revert the two JS files; no schema or server changes exist to roll back.

## Open Questions

None.
