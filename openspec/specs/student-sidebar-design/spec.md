# Student Sidebar Design

## Purpose

Defines the design and behavior of the Student sidebar on the student pages. (Moved from change `redesign-student-sidebar`; updated when the sidebar became collapsible and shared the app shell with the Admin pages.)

## Requirements

### Requirement: Shared, collapsible layout
Every student page (Dashboard, User Profile, Request view, Announcements, Feedback, Returns, Schedule) SHALL render the same sidebar through the shared app shell (`app-shell.js`, `app-shell.css`). On desktop (≥ 1024px) the sidebar SHALL be fixed to the left edge at full viewport height as a collapsed icon rail, and SHALL expand to show icons with labels while the pointer is over it (or keyboard focus is inside it). The expanded sidebar SHALL overlay the page rather than push it, so the content keeps its position. There SHALL be no menu button on desktop. The sidebar's logo block SHALL be as tall as the header so its divider lines up with the header's bottom edge. The sidebar SHALL keep the blue gradient background.

#### Scenario: Collapsed rail
- **WHEN** a signed-in student opens any student page on desktop
- **THEN** the sidebar shows only the navigation icons and the content fills the remaining width

#### Scenario: Expand on hover
- **WHEN** the student moves the pointer over the rail
- **THEN** the sidebar widens over the page to show icons and labels, and collapses back to icons when the pointer leaves, without moving the content

### Requirement: Logo header
The sidebar SHALL show, at the top, a graduation-cap icon followed by the bold white text "Smart Serve"; in the collapsed rail only the icon is shown.

#### Scenario: Logo renders on all student pages
- **WHEN** the sidebar loads on any student page
- **THEN** the top of the sidebar displays the graduation-cap icon (and, when expanded, the "Smart Serve" text) with identical styling on every page

### Requirement: Nav module set and order
The sidebar SHALL be generated from one list (`student-nav.js`) and contain, in this order: Dashboard, User Profile, Request, Announcements, Feedback, Returns, Schedule.

#### Scenario: Same items on every page
- **WHEN** a rendered student sidebar is inspected on any student page
- **THEN** it lists exactly Dashboard (`/dashboard`), User Profile (`/profile`), Request (`/dashboard#request`), Announcements (`/announcement`), Feedback (`/feedback`), Returns (`/returns`) and Schedule (`/schedule`), in that order, each with its own icon

### Requirement: Active state
The item for the current page SHALL be marked by a gold icon tile, a gold bar on the sidebar edge and a light fill, which remain visible in the collapsed rail. The Request item SHALL be active on the Request view (`/dashboard#request`); the Dashboard item SHALL NOT stay active elsewhere.

#### Scenario: Active item follows current page
- **WHEN** the student visits any student page
- **THEN** only that page's item shows the active treatment, collapsed or expanded

### Requirement: Inactive state
Inactive items SHALL use white text and gold-on-translucent icon tiles with no background fill, with icons and labels evenly spaced and aligned.

#### Scenario: Inactive items are consistently styled
- **WHEN** a non-active item is rendered
- **THEN** it matches every other inactive item's styling and alignment

### Requirement: Below desktop
Below 1024px the sidebar SHALL be hidden off-canvas and open as a drawer (with labels) from the header menu button; tapping the overlay, choosing a link or pressing Escape SHALL close it.

#### Scenario: Mobile drawer
- **WHEN** the student presses the header menu button on a phone or tablet
- **THEN** the full sidebar slides in over a dimmed page and closes again on overlay tap, link choice or Escape

### Requirement: Scope constraints
Routes and page functionality SHALL NOT change; the sidebar SHALL share its geometry and active treatment with the Admin sidebar so both roles look like one application.

#### Scenario: No functional changes
- **WHEN** the student uses any feature on the student pages
- **THEN** existing links and views keep working, including the Dashboard/Request switch in place
