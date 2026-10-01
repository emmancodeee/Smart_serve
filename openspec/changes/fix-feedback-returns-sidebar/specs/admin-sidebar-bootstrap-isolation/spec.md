## ADDED Requirements

### Requirement: Shared admin sidebar renders identically on Bootstrap-loaded pages

The shared admin sidebar (`nav#sidebar.sidebar-shell` with `admin-nav-link` items) SHALL render with the same layout and appearance on `admin-feedback.html` and `admin-returns.html` as it does on the dashboard (`admin.html`), even though those pages load Bootstrap CSS for their modals. Bootstrap's utility-class `!important` rules SHALL NOT distort the sidebar's spacing, title, or borders.

#### Scenario: Nav link dimensions match the dashboard

- **WHEN** `admin-feedback.html` or `admin-returns.html` is loaded at a desktop viewport (>= 1024px) with Bootstrap CSS active
- **THEN** every visible `admin-nav-link` SHALL have a computed height of 72px, padding 1rem top/bottom and 1.25rem left/right, and a 1rem gap between icon and label — identical to the dashboard sidebar

#### Scenario: Branding title stays on one line

- **WHEN** either page is loaded with Bootstrap CSS active
- **THEN** the `#sidebarSectionTitle` ("Smart Serve") SHALL occupy a single line (computed height ~35px), matching the dashboard

#### Scenario: Link border colors match the dashboard

- **WHEN** either page is loaded with Bootstrap CSS active
- **THEN** non-hovered, non-active nav links SHALL have transparent borders; hovered links SHALL show the gold border `rgba(253, 224, 71, 0.9)`; the active link SHALL show `rgba(253, 224, 71, 0.95)` — matching the dashboard

#### Scenario: Logo icon box keeps its white border

- **WHEN** either page is loaded with Bootstrap CSS active
- **THEN** the logo icon box (`h-14 w-14` span) SHALL keep the white 25% border color (`rgba(255, 255, 255, 0.25)`) instead of Bootstrap's gray `#dee2e6`

#### Scenario: Bootstrap modals remain functional

- **WHEN** the CSS overrides are applied
- **THEN** Bootstrap CSS and JS SHALL remain fully loaded and the pages' modals (feedback response/status, return approve/reject/confirm) SHALL continue to open and close normally

#### Scenario: Pages without Bootstrap are unaffected

- **WHEN** a page that does not load Bootstrap (e.g., dashboard `admin.html`, inventory) renders its sidebar
- **THEN** the override rules SHALL be a no-op — the sidebar keeps its existing values
