## ADDED Requirements

### Requirement: Full-width form inputs on mobile

All form input fields SHALL expand to the full width of their container on viewports below 640px.

#### Scenario: Form input full width
- **WHEN** a form contains multiple inputs in a horizontal row and the viewport width is less than 640px
- **THEN** each input SHALL stack vertically and occupy 100% of the available width

### Requirement: Minimum touch target size

All interactive form elements (inputs, buttons, selects, checkboxes) SHALL have a minimum touch target of 44x44 CSS pixels on viewports below 1024px.

#### Scenario: Touch target meets accessibility standard
- **WHEN** a button or input is rendered on a mobile viewport
- **THEN** its clickable area SHALL be at least 44px in both height and width

### Requirement: Registration workflow vertical stepper on mobile

The 6-step registration workflow wizard SHALL display as a vertical stepper on viewports below 640px instead of the horizontal tab row.

#### Scenario: Registration steps stack vertically
- **WHEN** the viewport width is less than 640px and the user is on the registration workflow
- **THEN** the step tabs SHALL display as a vertical list with step numbers and current step highlighted

#### Scenario: Registration workflow buttons stack
- **WHEN** the viewport width is less than 640px
- **THEN** the Back, Next, and Submit buttons SHALL stack vertically and each occupy full width

### Requirement: Modals use full screen on mobile

Modal dialogs SHALL use the full viewport on narrow screens to ensure content is readable and interactive.

#### Scenario: Modal expands to full screen
- **WHEN** a modal is opened on a viewport less than 640px wide
- **THEN** the modal SHALL expand to cover the full viewport width and height, with a close button in the top-right corner

#### Scenario: Modal scrolls internally
- **WHEN** a modal's content exceeds the viewport height on mobile
- **THEN** the modal body SHALL scroll internally without scrolling the page behind it
