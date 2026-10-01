## Why

Switching to the Return Requests or Feedback Management sections in the admin panel crashes with "system not found" (HTTP 404 `{"error":"Page not found"}`). The admin pages `admin-returns.html` and `admin-feedback.html` call API endpoints under `/api/admin/...`, but the server only mounts admin API routes under `/api/auth/admin/...` (routes/auth.js:111 `router.use('/admin', adminRouter)` nested under `app.use('/api/auth', authRoutes)`), so every request 404s and the section shows no data.

## What Changes

- Fix all API calls in `public/js/admin-returns.js` to use `/api/auth/admin/returns...` instead of `/api/admin/returns...`.
- Fix all API calls in `public/js/admin-feedback.js` to use `/api/auth/admin/feedback...` instead of `/api/admin/feedback...`.
- Verify no other page references the nonexistent `/api/admin` prefix (server only mounts `/api/auth/admin`, `/api/auth`, `/api/schedule`, `/api/health`).

## Capabilities

### New Capabilities
- `admin-returns-management`: Admin Return Requests section (page loads, lists, views, approves, rejects, confirms, and updates priority of return requests).
- `admin-feedback-management`: Admin Feedback Management section (page loads, lists, views, responds to, updates status, and updates priority of feedback).

### Modified Capabilities
<!-- None - no existing specs in openspec/specs/ -->

## Impact

- `public/js/admin-returns.js` — 6 fetch call sites (list, detail, approve, reject, confirm, priority).
- `public/js/admin-feedback.js` — 5 fetch call sites (list, detail, response, status, priority).
- No server-side changes needed; the endpoints already exist at `/api/auth/admin/...`.
- Confirmed unaffected: student pages (`feedback.js`, `returns.js`) already use `/api/auth/...`, and the admin SPA (`admin.js`) already uses `/api/auth/admin`.
