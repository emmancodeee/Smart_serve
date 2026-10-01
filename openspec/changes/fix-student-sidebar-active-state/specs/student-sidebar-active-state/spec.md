## ADDED Requirements

### Requirement: Student sidebar active state follows the current route/view
The system SHALL highlight exactly one Student sidebar item at a time, where the highlighted item is determined by the current route/view rather than a hardcoded default. For the Dashboard page, the active sidebar item SHALL be derived from the URL hash: the Dashboard view (`#dashboard` or no hash) highlights **Dashboard**, and the Request view (`#request`, including the legacy `#registration` hash) highlights **Request**. The active item SHALL use the existing white active-pill styling, and inactive items SHALL retain the existing navy/hover styling. No sidebar item other than the matching one SHALL be highlighted.

#### Scenario: Dashboard view shows Dashboard active
- **WHEN** the student is on the Dashboard page with no hash or with hash `#dashboard`
- **THEN** the Dashboard sidebar item is the only item with the white active styling, and Request is not active

#### Scenario: Request view shows Request active
- **WHEN** the student is on the Dashboard page with hash `#request` (or legacy `#registration`)
- **THEN** the Request sidebar item is the only item with the white active styling, and Dashboard is not active

#### Scenario: Clicking Request highlights Request immediately
- **WHEN** the student clicks the Request sidebar item from the Dashboard view
- **THEN** the Request view loads and the Request sidebar item becomes the only active item without a page reload

#### Scenario: Clicking Dashboard highlights Dashboard again
- **WHEN** the student is in the Request view and clicks the Dashboard sidebar item
- **THEN** the Dashboard view loads and the Dashboard sidebar item becomes the only active item

#### Scenario: Refresh on the Request URL keeps Request active
- **WHEN** the student refreshes the page while the URL is `/dashboard#request`
- **THEN** the Request sidebar item is the only active item after reload

#### Scenario: Direct navigation to the Request URL highlights Request
- **WHEN** the student navigates directly to `/request` (which redirects to `/dashboard#request`)
- **THEN** the Request view loads and the Request sidebar item is the only active item

#### Scenario: Exactly one active sidebar item
- **WHEN** the student is on the Dashboard page in any view
- **THEN** at most one sidebar item carries the active styling

#### Scenario: Other student pages keep their per-page active item
- **WHEN** the student navigates to User Profile, Announcements, Feedback, or Returns
- **THEN** that page's own sidebar item is the only active item, and the Request item is not active on those pages