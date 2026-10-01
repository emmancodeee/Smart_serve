## Context

Admin Account Management (`public/admin.html` → `#adminAccounts`, driven by `public/js/admin.js`) lets a Super Admin create/delete administrators and change their own password. It is routed through the admin SPA using `setAdminView('adminaccounts')`, reached by clicking the sidebar item or by opening `/admin/accounts` directly. The SPA resolves the active view from `window.location.pathname` on boot and on `popstate`, and sidebar clicks call `history.pushState` + `setAdminView`.

The backend already protects admin endpoints: `routes/auth.js` mounts `adminRouter.use(authenticateAdmin)`, so every `/api/auth/admin/*` route requires a valid admin JWT and populates `req.admin`. Super Admin-only endpoints are gated with `isSuperAdminAccount(admin)` (e.g. `listAdmins`). `models/Admin.js` exposes a bcrypt `comparePassword`, the same mechanism `authService.login` uses. Server CSP blocks inline handlers, so all UI wiring must use `addEventListener`.

Today nothing re-verifies credentials when Admin Account Management is opened, so any active Super Admin session can manage admin accounts without further confirmation.

## Goals / Non-Goals

**Goals:**
- Require the Super Admin to re-enter their existing email + password before Admin Account Management opens.
- Perform the check server-side against the existing Admin record using the existing bcrypt verification, behind the existing admin auth middleware.
- Session-scoped verified state: persists for the authenticated session, cleared on logout.
- Protect all entry paths: sidebar navigation, direct URL `/admin/accounts`, back/forward navigation.
- Never persist the password anywhere client-side; only a boolean verified flag.

**Non-Goals:**
- No new account types, no hard-coded credentials, no changes to the login flow, JWT payload, or `models/Admin.js`.
- No changes to the Admin Account Management UI (filters, export, Create Admin, Change My Password, table).
- No new rate-limiting system (the endpoint is only reachable with a valid admin JWT).

## Decisions

**D1: Dedicated verification endpoint reused existing auth primitives.**
Add `POST /api/auth/admin/verify-access` to `adminRouter` in `routes/auth.js`, which is already behind `authenticateAdmin`. Handler delegates to `authService.verifySuperAdminAccess(req)` exposed through `authController`.

- First checks `isSuperAdminAccount(req.admin)` — if the requester is not a Super Admin, respond 403.
- Loads the existing `Admin` document by the submitted email (via the existing `findAccountByEmail` lookup used by login).
- If the account does not exist or is not a Super Admin, respond 401 `Invalid email or password. Please try again.`
- Otherwise compares the submitted password with `account.comparePassword(password)`. Match → 200 `{ verified: true }`; mismatch → 401 with the same error message.

Rationale: reuses the same DB records, bcrypt hash check, JWT session, and role helper as the existing system — meeting the "no new authentication system, no hard-coded credentials" constraint.

Alternatives considered:
- Reusing `POST /login` — rejected: creates a fresh session/token, bypasses the active session, and is rate-limited for login use.
- Client-side check against cached profile — rejected: unsafe and doesn't validate the password against the server hash.
- Hard-coding a password — rejected explicitly by requirements.

**D2: Session-scoped verified flag in `sessionStorage`, never the password.**
Store only a boolean `smartserve_admin_verified` in `sessionStorage`. It survives SPA navigation and back/forward within the tab, and it is automatically discarded when the tab closes. `performLogout()` explicitly removes it, so a fresh login always requires re-verification. The entered password is held only in the form field's memory and the `fetch` body; nothing sensitive is written to storage, source, or console.

**D3: Gate hooks into the existing view router.**
`setAdminView('adminaccounts')` in `admin.js` is the single choke point for every entry path (sidebar click, direct URL via `applyViewFromLocation`, and `popstate`). A small guard runs there: when the view is `adminaccounts` and the verified flag is absent, hide `#adminAccounts` and show a new `#adminAccountsAccessGate` section; otherwise show `#adminAccounts` and hide the gate. This keeps the existing Admin Account Management markup and all its handlers untouched.

**D4: Reuse existing admin UI patterns for the gate card.**
The gate is a new `<section id="adminAccountsAccessGate" class="admin-section">` in `admin.html` styled like the existing admin surface blocks. It contains email + password fields, a password eye toggle button, a "Verify Access" submit button with spinner, and a message area for empty-field/error feedback. All wiring uses `addEventListener` to respect the CSP. Client validations mirror the exact messages spec'd, and on server error the password field is cleared and refocused.

## Risks / Trade-offs

- [Gate is a security-in-depth layer, not a substitute for real auth] → Mitigation: server-side check on every access attempt plus the existing Super Admin-only guards on `listAdmins`/`deleteAdmin` etc. remain.
- [Brute force on the verify endpoint] → Mitigation: only reachable with a valid admin JWT; reuses the bcrypt compare; existing auth logging covers admin actions. Extended attempt-limiting is out of scope.
- [Tab left open stays verified] → Matches the requirement (verified for the authenticated session); cleared on logout, and `sessionStorage` dies with the tab.
- [CSP blocks inline handlers] → Mitigation: gate wiring exclusively via `addEventListener` in `admin.js`.
- [Regression in view routing while toggling the gate] → Mitigation: guard is additive; `#adminAccounts` visibility only changes when the gate is active, and all other section keys keep their current behavior.

## Migration Plan

- No schema migrations; no new environment variables; no seeders. The endpoint and gate are additive.
- Rollback: remove the gate section handling and the verify-access endpoint; Admin Account Management returns to its prior behavior with no data migration needed.