## ADDED Requirements

### Requirement: Sidebar click resolves to the selected module
A click on a sidebar item SHALL result in the selected module's own content being displayed, with no manual browser refresh. The previously displayed module's content SHALL NOT remain visible as the result of a completed navigation.

#### Scenario: Navigation from a standalone document into a shell module
- **WHEN** an Admin or Super Admin is viewing Feedback Management and clicks the Transactions sidebar item
- **THEN** Feedback Management content is no longer displayed
- **AND** Transactions content is displayed
- **AND** no browser refresh was required

#### Scenario: Reverse navigation from a shell module into a standalone document
- **WHEN** an Admin is viewing Transactions and clicks the Return Requests sidebar item
- **THEN** Transactions content is no longer displayed
- **AND** Return Requests content is displayed
- **AND** no browser refresh was required

#### Scenario: Navigation out of Return Requests into Transactions
- **WHEN** an Admin is viewing Return Requests and clicks the Transactions sidebar item
- **THEN** Return Requests content is no longer displayed
- **AND** Transactions content is displayed
- **AND** the Return Requests filters, table, and selection state are not visible

### Requirement: Cross-document navigation is not intercepted
The application SHALL cancel a sidebar link's default navigation action only when the current document renders the target view as one of its own sections. When the current document does not render the target view, the link's real navigation SHALL proceed.

#### Scenario: Target view absent from the current document
- **WHEN** the current document does not contain the target view's registered content sections and a sidebar item for that view is clicked
- **THEN** the link's default navigation is not cancelled
- **AND** the browser navigates to the target view's own address

#### Scenario: Navigation leaves the document that would handle it
- **WHEN** a sidebar item is clicked on a document that cannot render the target view
- **THEN** the address bar reaches the target view's address
- **AND** the displayed content is the target module's content, never the module that was open before the click

### Requirement: In-shell section switching is preserved
Within the admin shell document, navigation between the views that document owns SHALL continue to switch sections without a document load, and SHALL continue to work in both directions.

#### Scenario: Switching between two shell sections
- **WHEN** an Admin viewing Transactions clicks the Announcements sidebar item
- **THEN** Announcements content is displayed
- **AND** Transactions content is hidden
- **AND** no document load occurs

#### Scenario: Returning to a previously visited shell section
- **WHEN** an Admin viewing Announcements clicks the Transactions sidebar item
- **THEN** Transactions content is displayed
- **AND** Announcements content is hidden
- **AND** no document load occurs

### Requirement: Ownership is derived from the view registry
Whether the current document can render a target view SHALL be determined from the application's existing view registry and the section elements present in the document, rather than from a hardcoded list of module names, page filenames, or URLs.

#### Scenario: Module added to the navigation later
- **WHEN** a module is added to the sidebar and its view is registered with content sections that exist in the shell document
- **THEN** navigation to it is handled without requiring any change to the navigation-decision logic

#### Scenario: No per-module special cases
- **WHEN** the navigation-decision logic is inspected
- **THEN** it contains no module-name, page-filename, or URL allowlist specific to individual modules

### Requirement: No stale content or foreign loading state during navigation
While a navigation is in progress, the outgoing module's content SHALL NOT be presented as the target module's content, and the target module SHALL NOT display the outgoing module's loading state, filters, or data.

#### Scenario: Target module shows its own loading state
- **WHEN** a navigation to a module that loads data asynchronously is started
- **THEN** any loading state shown belongs to the target module
- **AND** the outgoing module's content is not displayed in its place

#### Scenario: No data bleed between modules
- **WHEN** a user navigates between two modules that each maintain filters, search text, pagination, and table data
- **THEN** the target module's state is its own
- **AND** no filter, search text, pagination, selection, or dataset from the outgoing module is carried into it

### Requirement: Address bar, active state, and content agree
At every point after a navigation, the address bar, the sidebar's active highlight, and the displayed content SHALL all identify the same module.

#### Scenario: Highlight matches the displayed module
- **WHEN** a navigation completes
- **THEN** exactly one sidebar item is marked active
- **AND** it is the item for the module now displayed
- **AND** it matches the address bar path

#### Scenario: Active highlight updates without waiting on data
- **WHEN** a navigation is started
- **THEN** the active highlight reflects the newly selected module without waiting for its data request to settle

### Requirement: Invalid or unauthorized target is never substituted
If a navigation target cannot be resolved to a module, or the current role may not open it, the application SHALL render an explicit not-found or not-authorized state. It SHALL NOT render another module's content in its place.

#### Scenario: Unrecognized route
- **WHEN** the address bar holds a path that matches no registered module
- **THEN** an explicit not-found state is displayed
- **AND** no module's content is displayed as a substitute

#### Scenario: Module not permitted for the role
- **WHEN** a navigation targets a module the current role may not open
- **THEN** an explicit not-authorized state is displayed
- **AND** no other module's content is displayed as a substitute

### Requirement: No refresh, delay, or concealment workaround
The fix SHALL NOT rely on a browser reload, `location` assignment, `history` refresh hack, timed delay, or hiding modules with CSS, and SHALL NOT keep all modules mounted and concealed.

#### Scenario: No reload is introduced
- **WHEN** the navigation code is inspected
- **THEN** it contains no programmatic page reload or address assignment used to change modules

#### Scenario: No concealed modules
- **WHEN** a module is not selected
- **THEN** it is not retained in the document solely to be hidden with CSS

#### Scenario: Modules are switched, not delayed
- **WHEN** a navigation occurs
- **THEN** the transition is caused by removing the default link action for links the application handles itself, or by allowing real navigation
- **AND** no artificial timer participates in the transition

### Requirement: Link semantics are preserved
Sidebar items SHALL remain ordinary links so that browser link affordances continue to work, including opening a module in a new tab.

#### Scenario: Open in a new tab
- **WHEN** a user middle-clicks a sidebar item, or ctrl/cmd-clicks it
- **THEN** the module opens in a new tab
- **AND** the current tab is unchanged

### Requirement: Both roles are covered by one fix
The navigation rule SHALL apply to Admin and Super Admin alike through shared logic, and SHALL NOT alter which modules each role may open.

#### Scenario: Super Admin navigation
- **WHEN** a Super Admin navigates between the modules available to that role
- **THEN** each transition resolves to the selected module without a browser refresh

#### Scenario: Role visibility unchanged
- **WHEN** the navigation fix is applied
- **THEN** the set of modules visible to Admin and to Super Admin is unchanged
- **AND** no module is added to a role that did not previously have it

### Requirement: Existing presentation and data are unaffected
The change SHALL NOT alter sidebar design, header, colours, typography, buttons, filters, tables, cards, page layouts, permissions, functionality, or any dataset.

#### Scenario: Presentation is byte-identical outside the fix
- **WHEN** the change is applied
- **THEN** no stylesheet, page markup, or module dataset is modified
- **AND** only the navigation decision logic changes

#### Scenario: No server-side change
- **WHEN** the change is applied
- **THEN** no route, API endpoint, or server behaviour is modified
