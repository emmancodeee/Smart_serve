## MODIFIED Requirements

### Requirement: Logo header
The sidebar SHALL show, at the top, a graduation-cap icon followed by the bold white text "Smart Serve". The logo/header block SHALL match the Super Admin/Admin sidebar header exactly in sizing, spacing, and alignment. Specifically, the header SHALL render with: a logo icon box of 3.5rem × 3.5rem (same as Admin `h-14 w-14`), an icon glyph of 24px with a 1.8 stroke, a 1rem gap between the logo box and the "Smart Serve" text, 1.5rem of horizontal padding from the sidebar edge (left and right, matching Admin `px-6`), "Smart Serve" at 1.9rem font size, font-weight 700, letter-spacing 0.025em, and line-height 1.16, white text, the logo and text perfectly vertically centered within the header, a header height driven by 1.5rem of padding above and below the content (matching Admin `py-6`), and a divider line at the bottom edge of the header identical to the Admin divider (a 1px gold line at 50% opacity). The header geometry SHALL apply only to the sidebar on the six student pages and SHALL NOT change the menu items, their spacing, the active state, menu colors, or menu icons, and SHALL NOT change the header on `schedule.html`, the Admin sidebar, or the Superadmin sidebar.

#### Scenario: Logo renders on all student pages
- **WHEN** the sidebar loads on any of the six student pages
- **THEN** the top of the sidebar displays a graduation-cap icon and bold white "Smart Serve" text identical in size, weight, and styling to the Super Admin/Admin sidebar

#### Scenario: Header geometry matches Admin exactly
- **WHEN** a student sidebar header is rendered next to the Super Admin/Admin sidebar header at desktop width
- **THEN** the logo box size, icon glyph size, icon-to-text gap, left and right header padding, text font size and weight, vertical centering, header block height including spacing above and below the logo, and the divider line height and position are all visually identical

#### Scenario: Only the header changes
- **WHEN** the student sidebar is inspected after delivery
- **THEN** the header geometry matches the Admin reference while every menu item, item spacing, active state, menu color, menu icon, link, and behavior is unchanged from before, and the `schedule.html` (drawer), Admin, and Superadmin sidebars are byte-identical to before the change