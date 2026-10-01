## ADDED Requirements

### Requirement: Authenticated admin profile is cached synchronously
Upon successful login, the system SHALL persist the authenticated admin profile (including `name`, `role`/`accountType`, and `isSuperAdmin`) to `localStorage` so that it is available synchronously on subsequent page loads without waiting for a network request.

#### Scenario: Profile cached after login
- **WHEN** an admin logs in successfully and a token is stored
- **THEN** a profile record containing `name`, `role`/`accountType`, and `isSuperAdmin` is written to `localStorage` at the same time

#### Scenario: Cached profile available on page load
- **WHEN** an admin navigates to an admin page with a cached profile present
- **THEN** the role values (`isSuperAdmin`, `accountType`) can be read synchronously from `localStorage` before any `/api/auth/me` request resolves

### Requirement: Admin sidebar renders the correct role modules on first paint
On every admin page load, the sidebar SHALL compute its role-gated module visibility from the cached profile synchronously (before network requests resolve), so the correct set of modules for the signed-in admin is visible immediately. The sidebar SHALL NOT initially hide an authorized module and reveal it later.

#### Scenario: Super Admin sidebar is correct on first paint
- **WHEN** a Super Admin loads an admin page (cached profile indicates `isSuperAdmin: true`)
- **THEN** Super Admin modules are visible immediately on first paint and stay visible; Admin-only items (Request Management, Pickup Confirmations) do not appear

#### Scenario: Regular Admin sidebar is correct on first paint
- **WHEN** a regular Admin loads an admin page (cached profile indicates `isSuperAdmin: false`)
- **THEN** Admin-only modules (Request Management, Pickup Confirmations) are visible immediately on first paint and stay visible; Admin Accounts does not appear

#### Scenario: Server remains authoritative
- **WHEN** an admin loads an admin page with a cached profile
- **THEN** the `/api/auth/me` request still runs and its authoritative response re-confirms/updates the cached role, without ever causing an authorized module to temporarily hide

### Requirement: Sidebar is visually stable during module navigation
When an admin clicks any sidebar module to navigate, the sidebar SHALL remain visually unchanged except for the active item styling. No authorized module shall disappear, collapse, jump, resize, or reflow during or after navigation.

#### Scenario: All authorized modules remain across navigation
- **WHEN** an admin navigates between module pages (e.g., Dashboard → Admin Accounts → Inventory → Return Requests → Transactions → Announcements → Feedback Management → Dashboard)
- **THEN** every authorized sidebar module remains visible, the sidebar width and layout stay fixed, and only the active-item styling reflects the current route

#### Scenario: No role refetch causes temporary item removal
- **WHEN** an admin clicks a sidebar module and the destination page loads
- **THEN** the role-dependent modules never render as "loading/empty" or hidden during the transition and the role is never treated as unknown before the cached profile is restored

### Requirement: Permissions remain unchanged
The sidebar SHALL continue to show exactly the modules currently assigned to each role. Pickup Confirmations SHALL remain ADMIN-only and SHALL never appear in the Super Admin sidebar. The fix SHALL NOT change sidebar order, labels, icons, design, width, colors, active-state design, routes, or user permissions.

#### Scenario: Pickup Confirmations stays ADMIN-only
- **WHEN** a Super Admin views their sidebar
- **THEN** Pickup Confirmations never appears, even transiently, during page loads or navigation

#### Scenario: Sidebar structure unchanged
- **WHEN** an admin views the sidebar after the fix
- **THEN** the module order, labels, icons, design, and permissions are identical to before; only the stability of visibility and the active state differ from the buggy behavior