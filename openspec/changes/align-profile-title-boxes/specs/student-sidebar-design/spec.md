## ADDED Requirements

### Requirement: Matching blue title boxes on the profile page
On the Student User Profile page, the "Registration Details" and "Edit Your Profile" section headings SHALL use the exact same full-width dark-navy rounded title box design (`.module-title-bar`): identical height, width, padding, font size, font weight, text alignment, border-radius, background color, and white bold text. "Registration Details" SHALL remain the first section with "Edit Your Profile" directly below it. The vertical spacing around and between the two title boxes SHALL be consistent (uniform), with no overlap and no extra or duplicated headings; the existing registration info fields, profile form fields, sidebar, header, and all functionality SHALL remain unchanged.

#### Scenario: Both sections render identical title boxes
- **WHEN** the Student User Profile page is rendered at desktop and mobile widths
- **THEN** the computed styles (padding, font-size, font-weight, color, background, border-radius, width) of the "Registration Details" and "Edit Your Profile" title boxes are identical, and both sit full-width with white bold text on the dark-navy background

#### Scenario: Order and spacing preserved
- **WHEN** the page is rendered
- **THEN** "Registration Details" is first, "Edit Your Profile" is directly below it, the two title boxes are separated by a consistent uniform gap, no content overlaps, and no extra/duplicate heading is introduced

#### Scenario: No functional or other-visual regression
- **WHEN** the page is rendered and interacted with
- **THEN** all existing registration info and profile form fields, the sidebar, the header, and all behavior are unchanged, with styling changes confined to the profile page title boxes