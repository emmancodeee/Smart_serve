## ADDED Requirements

### Requirement: Admin header user name is white in dark-blue header
In the dark-blue header (`admin-header`) on every admin page with a dark-blue background (Admin, Inventory, Return Requests, Feedback Management), the user name line (`.admin-page .admin-header .admin-profile .profile-name`) SHALL render in white (`#FFFFFF`) with sufficient contrast. The name SHALL retain its current bold weight (`font-weight: 700`) and font size.

#### Scenario: Name text is white on the Admin dashboard
- **WHEN** a logged-in user views the Admin dashboard (admin.html) header
- **THEN** the user name (e.g. "Phinma Superadmin") is displayed in white text (`#FFFFFF`) on the dark blue header background

#### Scenario: Name text is white on the Inventory page
- **WHEN** a logged-in user views the Inventory Management page (inventory.html) header
- **THEN** the user name is displayed in white text (`#FFFFFF`) on the dark blue header background

#### Scenario: Name text is white on Return Requests and Feedback pages
- **WHEN** a logged-in user views Return Requests (admin-returns.html) or Feedback Management (admin-feedback.html) headers
- **THEN** the user name is displayed in white text (`#FFFFFF`) on the dark blue header background

### Requirement: Admin header user role is clearly readable in a lighter color
In the dark-blue header on every affected admin page, the role line (`.admin-page .admin-header .admin-profile .profile-role`) SHALL render in a light color that is clearly readable against the dark blue background (e.g. `#E5E7EB`), not too dark and not overly transparent. The role text SHALL remain slightly smaller than the user name (current 0.78rem) and retain its existing weight (`font-weight: 500`).

#### Scenario: Role text is readable on all dark-blue admin headers
- **WHEN** a logged-in user views any admin page with a dark-blue header
- **THEN** the role text (e.g. "Administrator") is clearly visible in a light readable color, distinct from but lighter than the white name, and does not appear dark or washed out

#### Scenario: Name and role have visual hierarchy
- **WHEN** a logged-in user views the header
- **THEN** the name is white and the role is a lighter readable color, with the role slightly smaller than the name (existing size), so the two lines are visually distinct

### Requirement: Header layout and identity are unchanged
The change SHALL NOT modify the header's layout, spacing, profile circle, dimensions, font family, the displayed user name or role strings, or any header/account functionality. Only the text colors of the name and role change.

#### Scenario: Header appearance beyond text color unchanged
- **WHEN** a logged-in user compares the header before and after the fix
- **THEN** the profile circle, spacing, layout, header background, header dimensions, and font family are identical; only the text colors of the name and role differ

#### Scenario: Account identity and header functionality unchanged
- **WHEN** the header renders after the change
- **THEN** the same user name, role, profile circle, clock, notifications, logout, and navigation controls appear and behave exactly as before