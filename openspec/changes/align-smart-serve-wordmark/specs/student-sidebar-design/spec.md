## MODIFIED Requirements

### Requirement: Logo header
The sidebar SHALL show, at the top, a graduation-cap icon followed by the bold white text "Smart Serve". The header SHALL place the wordmark and the logo exactly like the Super Admin/Admin sidebar in everything except font size. Specifically, the header SHALL render with: a logo icon box of 3.5rem × 3.5rem (same as Admin `h-14 w-14`), an icon glyph of 24px with a 1.8 stroke, a 1rem gap between the logo box and the "Smart Serve" text, 1.5rem of horizontal padding from the sidebar edge (left and right, matching Admin `px-6`), and the logo and text perfectly vertically centered. The "Smart Serve" text SHALL render on a SINGLE horizontal line beside the logo icon — it SHALL NOT wrap, stack, overlap, or clip across multiple lines — with font-weight 700, letter-spacing 0.025em, line-height 1.16, white text, and a font size small enough to fit the available horizontal space beside the logo (1.4rem on desktop and 1.3rem on screens up to 1023px). The header SHALL end with a divider line at its bottom edge identical to the Admin divider (a 1px gold line at 50% opacity). The header geometry SHALL apply only to the sidebar on the six student pages and SHALL NOT change the menu items, their spacing, the active state, menu colors, or menu icons, and SHALL NOT change the header on `schedule.html`, the Admin sidebar, or the Superadmin sidebar.

#### Scenario: Logo renders on all student pages
- **WHEN** the sidebar loads on any of the six student pages
- **THEN** the top of the sidebar displays a graduation-cap icon and bold white "Smart Serve" text identical in weight, styling, spacing, and positioning to the Super Admin/Admin sidebar branding

#### Scenario: Wordmark stays on one line
- **WHEN** a student sidebar header is rendered at desktop width and at mobile width
- **THEN** "Smart Serve" appears on a single horizontal line beside the logo box (1.4rem desktop, 1.3rem mobile), vertically centered with the logo, with the 1rem gap and 1.5rem edge padding preserved, and with no wrapping, stacking, overlapping, or clipping

#### Scenario: Header geometry matches Admin otherwise
- **WHEN** a student sidebar header is rendered next to the Super Admin/Admin sidebar header
- **THEN** the logo box size, icon glyph size, icon-to-text gap, left and right header padding, vertical centering, color, weight, tracking, line-height, header block height, and divider height and position match the Admin reference, and the wordmark fits on one line

#### Scenario: Only the header changes
- **WHEN** the student sidebar is inspected after delivery
- **THEN** every menu item, item spacing, active state, menu color, menu icon, link, and behavior is unchanged from before, and the `schedule.html` (drawer), Admin, and Superadmin sidebars are byte-identical to before the change