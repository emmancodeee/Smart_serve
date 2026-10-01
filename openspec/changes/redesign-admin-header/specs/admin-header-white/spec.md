## ADDED Requirements

### Requirement: Header SHALL be white with soft shadow
The admin header SHALL have a white background (#FFFFFF), bottom border (1px solid #E5E7EB), soft shadow (`0 2px 8px rgba(15,23,42,0.05)`), 72-80px height, and 32px horizontal padding.

#### Scenario: Header renders on admin dashboard
- **WHEN** user navigates to any admin page
- **THEN** the header SHALL have background `#FFFFFF`, `border-bottom: 1px solid #E5E7EB`, `height: 76px`, `padding: 0 32px`

### Requirement: Header left section SHALL display title and subtitle
The left section of the header SHALL display a page title (28px, Bold, #0F172A) with a subtitle below (14px, Medium, #64748B).

#### Scenario: Title and subtitle render
- **WHEN** user views the admin dashboard
- **THEN** the header SHALL show "Dashboard" as title and "Monitor inventory, transactions, and system activities." as subtitle

### Requirement: Header right section SHALL contain notification bell
The right section SHALL display a bell icon with a small gold notification badge.

#### Scenario: Notification bell renders
- **WHEN** user views any admin page
- **THEN** a bell SVG icon with a gold dot badge SHALL be visible in the header right section

### Requirement: Header right section SHALL contain compact clock card
The clock SHALL display in a compact white card with light gray border (#E5E7EB), 12px border-radius, 10px/16px padding, a calendar icon, and the current date with live time.

#### Scenario: Clock card renders
- **WHEN** user views any admin page
- **THEN** the clock SHALL display inside a card with `background: #FFFFFF`, `border: 1px solid #E5E7EB`, `border-radius: 12px`, `padding: 10px 16px`

### Requirement: Header right section SHALL contain admin profile
The header SHALL display the admin's name, a circular avatar (first letter fallback), and the role label "Administrator".

#### Scenario: Admin profile renders
- **WHEN** an admin user is logged in
- **THEN** the header SHALL show a circular avatar with the admin's initial, their full name, and "Administrator" below the name

### Requirement: Logout button SHALL use gold branding with icon
The logout button SHALL have gold background (#F4C542), hover (#F59E0B), 12px border-radius, 12px/20px padding, and a log-out icon on the left.

#### Scenario: Logout button renders
- **WHEN** user views any admin page
- **THEN** the logout button SHALL have `background: #F4C542`, `border-radius: 12px`, `padding: 12px 20px`, and a logout SVG icon preceding the text

### Requirement: Right section items SHALL be spaced evenly
All items in the header right section SHALL have 20px spacing between them and be vertically centered.

#### Scenario: Right section spacing
- **WHEN** user views any admin page
- **THEN** the header right section items SHALL have `gap: 20px` and `align-items: center`
