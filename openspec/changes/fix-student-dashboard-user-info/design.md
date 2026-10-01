## Context

The SmartServe student dashboard (`/dashboard#dashboard`) calls `GET /api/auth/me` on page load to fetch the authenticated user's profile. The `loadUserInfo()` function in `dashboard.js` (lines 1506-1551) and `profile.js` (lines 47-76) handles this call. Both implementations have identical flaws:

1. A single `catch` block catches ALL errors — network failures, HTTP error responses processed inside the `try`, and client-side JavaScript exceptions — and shows the same generic `alert('Error loading user info')`
2. On ANY failure (including transient 503 database-unavailable), the token is removed from `localStorage` and the user is redirected to login, even when the token is still valid
3. The `alert()` is a blocking modal dialog that provides no actionable information

The backend `/api/auth/me` endpoint (`routes/auth.js:27` → `authController.js:89` → `authService.js:430`) is correctly implemented. It returns:
- `200` with a flat user JSON object on success
- `401` for invalid/missing tokens
- `404` if the user account is not found
- `503` when the database guard middleware blocks the request (`server.js:240-249`)
- `500` for unexpected server errors

The error logs (`logs/error.log`) show persistent MongoDB connectivity issues (remote at `45.85.146.21:27017` timing out, local fallback not running), which cause the 503 database-guard responses.

## Goals / Non-Goals

**Goals:**
- Differentiate error types so users get meaningful feedback instead of a generic alert
- Preserve valid auth tokens during transient server/database errors (503, network failures)
- Remove auth tokens and redirect only on genuine auth failures (401)
- Provide developer-visible error details via `console.error` for debugging
- Apply identical fixes to both `dashboard.js` and `profile.js`
- Maintain all existing dashboard functionality, layout, and navigation

**Non-Goals:**
- Changing the backend API, database schema, or authentication mechanism
- Fixing the MongoDB connectivity issues (infrastructure concern, not code)
- Adding new UI components or redesigning the dashboard layout
- Implementing retry logic or offline caching
- Changing how the backend `sendResult` or error response format works

## Decisions

### 1. Replace `alert()` with inline status messages

**Decision:** Replace `alert('Error loading user info')` and `alert('Failed to load user info')` with a visible inline status element in the dashboard DOM.

**Rationale:** `alert()` is a blocking modal that provides no context. An inline status message can show the specific error type (network error vs auth failure vs server error) and can be dismissed or retried without losing page state.

**Alternative considered:** Keep `alert()` but with better messages. Rejected because `alert()` blocks the UI, is not styled consistently, and cannot show rich content.

### 2. Differentiate error handling by HTTP status code

**Decision:** Structure the error handling to check `response.status` explicitly:
- `401` → remove token, redirect to login (genuine auth failure)
- `503` → show "Server temporarily unavailable" message, keep token, offer retry
- Other non-ok → show "Failed to load user info (HTTP {status})", keep token
- Network/fetch error (catch block) → show "Cannot reach server", keep token

**Rationale:** Different failures require different user actions. A 503 means the server is temporarily down — redirecting to login wastes the user's time. A 401 means the token is genuinely invalid — redirecting is correct.

### 3. Preserve auth token on transient errors

**Decision:** Only call `localStorage.removeItem('token')` when `response.status === 401`. For all other errors (503, network, 500), keep the token.

**Rationale:** The token has a 7-day expiry. Removing it on a transient 503 forces the user to re-login even though their credentials are still valid. When the server recovers, the existing token will work.

### 4. Add console.error with structured details

**Decision:** Log detailed error information to `console.error` in development, including the error type, status code, and response body.

**Rationale:** The generic alert provides no debugging information. `console.error` gives developers the details they need without exposing anything to end users.

### 5. Apply same pattern to both files

**Decision:** Extract the error handling pattern into a consistent structure applied to both `dashboard.js:loadUserInfo()` and `profile.js:loadUserInfo()`.

**Rationale:** Both files have the identical bug. Fixing only one would leave the other broken.

## Risks / Trade-offs

- **[Risk] User sees stale data if token was invalidated server-side but not detected** → Mitigation: The 401 check handles this. If the token is revoked, the server returns 401 and the user is redirected to login.
- **[Risk] User stuck on dashboard with persistent 503** → Mitigation: Show a clear "server unavailable" message with a visible retry button so the user can try again when the server recovers.
- **[Trade-off] Keeping token on 503 means user may see error again on next navigation** → Acceptable because the alternative (forced re-login) is worse UX for a transient issue.
