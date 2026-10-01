## ADDED Requirements

### Requirement: Admin Return Requests use correct API base
The system SHALL serve the Return Requests admin section (`admin-returns.html` + `public/js/admin-returns.js`) using API endpoints under `/api/auth/admin/returns`, matching the server mount in `routes/auth.js`. All fetch calls MUST target `/api/auth/admin/returns...` and MUST NOT use the nonexistent `/api/admin/returns...` prefix.

#### Scenario: Page loads return requests
- **WHEN** an admin opens `/admin/returns`
- **THEN** the page calls `GET /api/auth/admin/returns` and renders the return request table

#### Scenario: View return request detail
- **WHEN** an admin clicks "View" on a return request
- **THEN** the page calls `GET /api/auth/admin/returns/:id` and shows the detail modal

#### Scenario: Approve return request
- **WHEN** an admin confirms an approval for return request `:id`
- **THEN** the page calls `PUT /api/auth/admin/returns/:id/approve` with the admin notes

#### Scenario: Reject return request
- **WHEN** an admin confirms a rejection for return request `:id`
- **THEN** the page calls `PUT /api/auth/admin/returns/:id/reject` with the rejection reason

#### Scenario: Confirm completed return
- **WHEN** an admin confirms a completed return for `:id`
- **THEN** the page calls `PUT /api/auth/admin/returns/:id/confirm` with the received condition

#### Scenario: Update return request priority
- **WHEN** an admin sets a new priority for return request `:id`
- **THEN** the page calls `PUT /api/auth/admin/returns/:id/priority` with the new priority

### Requirement: Admin Feedback Management uses correct API base
The system SHALL serve the Feedback Management admin section (`admin-feedback.html` + `public/js/admin-feedback.js`) using API endpoints under `/api/auth/admin/feedback`, matching the server mount in `routes/auth.js`. All fetch calls MUST target `/api/auth/admin/feedback...` and MUST NOT use the nonexistent `/api/admin/feedback...` prefix.

#### Scenario: Page loads feedback list
- **WHEN** an admin opens `/admin/feedback`
- **THEN** the page calls `GET /api/auth/admin/feedback` and renders the feedback table

#### Scenario: View feedback detail
- **WHEN** an admin clicks "View" on a feedback item
- **THEN** the page calls `GET /api/auth/admin/feedback/:id` and shows the detail modal

#### Scenario: Add admin response
- **WHEN** an admin submits a response for feedback `:id`
- **THEN** the page calls `POST /api/auth/admin/feedback/:id/response` with the response text

#### Scenario: Update feedback status
- **WHEN** an admin changes the status of feedback `:id`
- **THEN** the page calls `PUT /api/auth/admin/feedback/:id/status` with the new status

#### Scenario: Update feedback priority
- **WHEN** an admin sets a new priority for feedback `:id`
- **THEN** the page calls `PUT /api/auth/admin/feedback/:id/priority` with the new priority

### Requirement: No references to nonexistent API mount
The system MUST NOT call any endpoint under the `/api/admin` prefix, because the server only mounts admin routes at `/api/auth/admin`. No other client-side file SHALL reference the `/api/admin/` prefix.

#### Scenario: Audit for stale API prefix
- **WHEN** the codebase is searched for the string `/api/admin/`
- **THEN** no matches exist in any client-side file other than the correct `/api/auth/admin/` prefix
