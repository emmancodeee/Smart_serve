## Why

The Super Admin Dashboard header currently displays redundant text elements ("Welcome Super Admin", "Dashboard", "Monitor inventory, transactions, and system activities.") that add visual clutter without functional value. Removing these creates a cleaner, more professional header while preserving all functionality.

## What Changes

- Remove "Welcome Super Admin" text from header
- Remove "Dashboard" text from header
- Remove "Monitor inventory, transactions, and system activities." subtitle text from header
- Adjust header layout to eliminate empty space left by removed elements
- Maintain all existing functionality: date/time display, logout button, search bar, notification bell, user profile section

## Capabilities

### New Capabilities

- `super-admin-header-layout`: Updated header layout and styling for the Super Admin Dashboard with streamlined text content and balanced element alignment

### Modified Capabilities

_(none — no existing spec-level behavior changes)_

## Impact

- **Files**: Super Admin Dashboard HTML template and associated CSS (header section only)
- **Scope**: Visual/CSS changes only — no API, route, or database changes
- **Risk**: Low — header-only change with no functional impact
