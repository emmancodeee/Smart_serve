## 1. Fix admin-returns.js API paths

- [x] 1.1 Replace `/api/admin/returns` with `/api/auth/admin/returns` in list fetch (loadReturnRequests)
- [x] 1.2 Replace `/api/admin/returns/${id}` with `/api/auth/admin/returns/${id}` in detail fetch (viewReturnRequest)
- [x] 1.3 Replace `/api/admin/returns/${currentReturnId}/approve` with `/api/auth/admin/returns/${currentReturnId}/approve`
- [x] 1.4 Replace `/api/admin/returns/${currentReturnId}/reject` with `/api/auth/admin/returns/${currentReturnId}/reject`
- [x] 1.5 Replace `/api/admin/returns/${currentReturnId}/confirm` with `/api/auth/admin/returns/${currentReturnId}/confirm`
- [x] 1.6 Replace `/api/admin/returns/${id}/priority` with `/api/auth/admin/returns/${id}/priority`

## 2. Fix admin-feedback.js API paths

- [x] 2.1 Replace `/api/admin/feedback` with `/api/auth/admin/feedback` in list fetch (loadFeedbacks)
- [x] 2.2 Replace `/api/admin/feedback/${id}` with `/api/auth/admin/feedback/${id}` in detail fetch
- [x] 2.3 Replace `/api/admin/feedback/${currentFeedbackId}/response` with `/api/auth/admin/feedback/${currentFeedbackId}/response`
- [x] 2.4 Replace `/api/admin/feedback/${currentFeedbackId}/status` with `/api/auth/admin/feedback/${currentFeedbackId}/status`
- [x] 2.5 Replace `/api/admin/feedback/${id}/priority` with `/api/auth/admin/feedback/${id}/priority`

## 3. Verification

- [x] 3.1 Grep `public/` for `/api/admin/` to confirm no stale references remain
- [x] 3.2 Start server and probe `GET /api/auth/admin/returns` and `GET /api/auth/admin/feedback` — expect 401 (route exists) instead of 404
- [x] 3.3 Run `node --check` on both edited JS files
