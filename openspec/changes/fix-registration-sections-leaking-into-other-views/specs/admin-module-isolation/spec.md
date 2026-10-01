## ADDED Requirements

### Requirement: A module renders only the content it owns
When a module is selected, the application SHALL display only that module's own sections. A module's sections SHALL NOT become visible as a result of another module's activity.

#### Scenario: Transactions shows only its own content
- **WHEN** an Admin or Super Admin opens Transactions
- **THEN** the User Request History section is displayed
- **AND** Pending Registrations, Approved Registrations and Rejected Registrations are not displayed
- **AND** no Request Management filter, table, status section or action button is displayed

#### Scenario: Request Management keeps all three sections
- **WHEN** an Admin opens Request Management
- **THEN** Pending Registrations, Approved Registrations and Rejected Registrations are displayed
- **AND** the User Request History section is not displayed

### Requirement: Data arriving for one module does not reveal another module's sections
When a dataset is read by a module other than the one that owns the sections it feeds, the arrival of that data SHALL NOT change section visibility anywhere.

#### Scenario: Registration data read by another module
- **WHEN** a module that reads registration data for its own widgets loads that data
- **AND** the Request Management sections are not the active module's content
- **THEN** the Pending, Approved and Rejected Registrations sections remain hidden

#### Scenario: Response arriving after the user has navigated away
- **WHEN** a data request started by one module completes after the user has navigated to a different module
- **THEN** no section belonging to the previous module becomes visible in the newly selected module

#### Scenario: Late response cannot re-open the previous module's sections
- **WHEN** a response for a module the user has already left arrives late
- **THEN** the newly selected module's content is unaffected
- **AND** the departed module's sections are not re-displayed

### Requirement: Section visibility is applied by the owning module's active view
A module's section visibility SHALL be derived from the currently active view. A visibility change SHALL be applied only while the module that owns those sections is the active view.

#### Scenario: Owner active
- **WHEN** the module that owns a set of sections is the active view
- **THEN** its section visibility may be adjusted according to its own filters

#### Scenario: Owner not active
- **WHEN** the module that owns a set of sections is not the active view
- **THEN** those sections' visibility is left to the owning module and remains hidden

#### Scenario: Visibility decisions use one notion of the active view
- **WHEN** the active view is determined for a visibility decision
- **THEN** the same resolution used to apply module ownership is used
- **AND** no separate indicator of the active module is introduced

### Requirement: The owner's own filtering behaviour is preserved
While the owning module is active, its ability to show a subset of its own sections based on its own filter state SHALL be unchanged.

#### Scenario: Status filter selects one section
- **WHEN** the owning module's status filter is set to a single status
- **THEN** only the corresponding registration section is displayed
- **AND** the other registration sections are hidden

#### Scenario: Status filter selects all
- **WHEN** the owning module's status filter is set to show all statuses
- **THEN** all of its registration sections are displayed

#### Scenario: Filters, search, reset and export still work
- **WHEN** the owning module's filter, search, reset or export control is used
- **THEN** it behaves as it did before the change

### Requirement: No concealment or removal is used to achieve isolation
Isolation SHALL be achieved by scoping visibility changes to the owning view. The application SHALL NOT conceal a module with CSS, SHALL NOT remove a module's sections from the document, and SHALL NOT rely on a reload, timer, or delayed render.

#### Scenario: No concealment added
- **WHEN** the change is applied
- **THEN** no `display:none`, `visibility:hidden` or `opacity:0` rule is added to conceal a module
- **AND** no stylesheet is modified

#### Scenario: Sections are retained
- **WHEN** the change is applied
- **THEN** the owning module's sections remain present in the document and remain registered to it
- **AND** the owning module continues to display them

#### Scenario: No reload or delay
- **WHEN** the change is applied
- **THEN** no programmatic page reload, address assignment, or timer participates in module isolation

### Requirement: Isolation holds for every module and both roles
The rule SHALL hold for all modules, and SHALL apply to Admin and Super Admin alike without altering which modules either role may open.

#### Scenario: Every module shows only its own content
- **WHEN** each module is opened in turn
- **THEN** only that module's sections are displayed
- **AND** no other module's sections are displayed

#### Scenario: Repeated navigation between modules
- **WHEN** the user switches repeatedly between two modules that read overlapping data
- **THEN** after every switch only the selected module's content is displayed
- **AND** no content from the previously selected module remains

#### Scenario: Role visibility unchanged
- **WHEN** the change is applied
- **THEN** the set of modules available to Admin and to Super Admin is unchanged

### Requirement: Unaffected behaviour is preserved
The change SHALL NOT alter the selected module's own content, layout, filters, tables, data, routes, or any dataset loading behaviour.

#### Scenario: Transactions content is untouched
- **WHEN** the change is applied
- **THEN** the Transactions title, filters, search, reset, export, table and columns are unchanged

#### Scenario: No ownership or loading configuration changes
- **WHEN** the change is applied
- **THEN** the section ownership map, the module-to-dataset map, the dataset cache, and the view resolution logic are unchanged
- **AND** no module markup is modified
