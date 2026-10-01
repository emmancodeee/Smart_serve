## ADDED Requirements

### Requirement: Universal filter ordering rule
The system SHALL render the filter controls on every module or page that has filters in a fixed order: when the module has an Item Category (or Category) filter, that control SHALL be the first filter control; all other configured filter controls SHALL follow it; and the search input, when present, SHALL be the final filter control, positioned after every other filter control.

#### Scenario: Item Category renders first
- **WHEN** any admin module configures an Item Category or Category filter together with other filter controls and a search box
- **THEN** the category control SHALL render before all other filter controls in the toolbar

#### Scenario: Search renders last
- **WHEN** any admin module renders a filter toolbar that includes a search box
- **THEN** the search input SHALL render after all other filter controls (field selects, date range, sort) and immediately before the action buttons

#### Scenario: Order is preserved when the toolbar wraps
- **WHEN** the viewport is narrow so the toolbar controls wrap onto additional rows
- **THEN** the Item Category → other filters → Search ordering SHALL be preserved across rows

### Requirement: Search last on static filter pages
The system SHALL apply the ordering rule to pages with static filter markup, including the student Announcements page and the Uniform Request Management page, so that Search is the final filter control on those pages too.

#### Scenario: Student announcements search placement
- **WHEN** a student opens the Announcements page with its sidebar filter controls
- **THEN** the search input SHALL render after the Category, Timeframe, and Sort controls and before the Clear Filters button

#### Scenario: Uniform requests search placement
- **WHEN** an admin opens Uniform Request Management
- **THEN** the search input SHALL remain the final filter control after the Status and Module Code controls

### Requirement: Preserve filter identity and behavior
The reordering SHALL NOT alter any filter's label, options, or filtering behavior, and SHALL NOT add, remove, rename, or duplicate any filter control. Modules without an Item Category filter SHALL NOT gain one, and modules without a search box SHALL NOT gain one.

#### Scenario: Analytics keeps its control set
- **WHEN** an admin opens the Analytics dashboard section, which has no search box
- **THEN** the Item Category control SHALL be first among its controls and no search box SHALL be added

#### Scenario: Existing filters behave identically
- **WHEN** an admin applies any filter after the reorder
- **THEN** the filter SHALL accept the same options, display the same label, and produce the same results as before the reorder