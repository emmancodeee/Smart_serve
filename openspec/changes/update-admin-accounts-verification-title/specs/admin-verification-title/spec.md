## ADDED Requirements

### Requirement: Admin Accounts verification title uses the standard module title bar
The Admin Accounts verification screen SHALL display the title "Verify to Access Admin Accounts" using the same standard module title bar design used by the Admin/Super Admin module titles (for example, "Admin Account Management"), rendered by the shared `.section-header-row` markup/component with no new or independent CSS. The title text SHALL be white on a dark navy `#152c69` background, left-aligned, and MUST NOT be a pill-shaped or fully-rounded card.

#### Scenario: Verification title matches the existing module titles
- **WHEN** a Super Admin reaches the Admin Accounts verification screen
- **THEN** the title "Verify to Access Admin Accounts" renders in the same style as "Admin Account Management" (dark navy background, white text, shared font family, font size, font weight, line height, vertical alignment, left padding, height, and corner radius)
- **AND** the title bar uses the existing shared component/CSS (no new custom title style is introduced)

#### Scenario: Verification title corner treatment matches existing module titles
- **WHEN** the verification title bar is rendered
- **THEN** it uses the same corner radius as the other module title bars (rounded top corners, square/less-rounded bottom corners) and is NOT fully rounded like a pill or with `border-radius: 50px`/`9999px`

#### Scenario: Verification title text and alignment match existing module titles
- **WHEN** the verification title is rendered
- **THEN** the text reads "Verify to Access Admin Accounts", uses white text with the same font weight, font size, line height, and left alignment as the "Admin Account Management" title, and is not centered or dark-on-navy

### Requirement: Verification content and behavior unchanged below the title
The verification screen SHALL keep its existing description, Email input, Password input with eye toggle, "Verify Access" button, and authentication logic unchanged below the standard title bar, and SHALL keep consistent spacing between the title bar, the description, and the inputs so that the description does not touch the title and the inputs do not touch the title.

#### Scenario: Verification flow works identically after the title change
- **WHEN** a Super Admin submits a valid email and password on the verification screen
- **THEN** the verification succeeds and Admin Account Management opens exactly as before
- **AND** the description text, inputs, password eye toggle, and Verify Access button remain in place with unchanged functionality

#### Scenario: Title and verification content spacing matches other module pages
- **WHEN** the verification screen is rendered after the title change
- **THEN** the description sits a normal gap below the title bar (not touching it) and the inputs sit below the description with consistent padding, following the same spacing used by other Smart Serve module pages
