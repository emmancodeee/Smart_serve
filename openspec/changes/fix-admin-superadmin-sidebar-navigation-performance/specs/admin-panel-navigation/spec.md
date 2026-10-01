## ADDED Requirements

### Requirement: Role-Specific Sidebar Navigation Is Preserved

The system SHALL render separate, independent sidebar configurations for the Admin and Super Admin roles using the navigation structure and module set that already exists for each role. The system SHALL NOT replace the two role configurations with a single hardcoded shared configuration, and SHALL NOT grant a role any module it does not already have. The Admin sidebar SHALL retain its existing modules in their existing order, and the Super Admin sidebar SHALL retain its existing modules and structure.

#### Scenario: Admin sidebar renders the existing Admin modules in order
- **WHEN** an authenticated Admin loads any Admin panel page
- **THEN** the sidebar lists exactly the existing Admin modules in the existing order, with no module added, removed, or reordered
- **AND** the Admin sidebar is not replaced by the Super Admin sidebar

#### Scenario: Super Admin sidebar renders the existing Super Admin modules
- **WHEN** an authenticated Super Admin loads any Admin panel page
- **THEN** the sidebar lists exactly the modules that already exist for the Super Admin role
- **AND** modules that exist only for Admin are not added to the Super Admin sidebar

#### Scenario: No Admin-only module is added to Super Admin
- **WHEN** the Super Admin sidebar is rendered
- **THEN** it does not contain Admin-only modules such as Request Management, Pickup Confirmations, Supply & Stock, or Return Requests unless the Super Admin sidebar already contained them before this change

#### Scenario: Role permissions are unchanged
- **WHEN** this change is applied
- **THEN** the set of modules, actions, and API operations each role may perform is identical to the set before this change

#### Scenario: Sidebar definition has a single source of truth
- **WHEN** an Admin panel page is served
- **THEN** the sidebar's module list, order, per-role visibility, and active-state resolution are derived from one shared definition rather than hand-copied markup that can drift between pages

### Requirement: Active Sidebar State Changes Immediately On Click

The system SHALL update the sidebar active highlight synchronously in the same event turn as the click, before any data request is issued or resolved. Exactly one item in the sidebar for the current role SHALL be marked active at any time, and every other item SHALL be marked inactive. The active state SHALL NOT depend on data loading, API responses, or role re-verification completing.

#### Scenario: Active state updates before the data request resolves
- **WHEN** a user clicks a sidebar item whose data request has not yet returned
- **THEN** the clicked item is already marked active and the previously active item is already marked inactive

#### Scenario: Exactly one active item per role sidebar
- **WHEN** a user clicks any sidebar item in the Admin sidebar
- **THEN** exactly one Admin sidebar item is marked active and all other Admin sidebar items are marked inactive
- **AND** the same holds for the Super Admin sidebar

#### Scenario: Active state is correct on direct load
- **WHEN** a user opens a module by URL or browser back/forward navigation
- **THEN** the sidebar item for that module is marked active without requiring a click

#### Scenario: Active state is correct on every page
- **WHEN** the user is on any Admin panel page, including Inventory Management, Supply & Stock, Return Requests, Feedback Management and Request Management
- **THEN** that page's own sidebar item is marked active

### Requirement: Selected Module Renders Only Its Own Content

The system SHALL render exactly one module's content at a time in the Admin panel content area. While a module is loading, its own content region SHALL be shown and no other module's content SHALL be visible. A module SHALL NEVER display another module's content as a placeholder, fallback, or intermediate state, in either role.

#### Scenario: Pickup Confirmations does not show Inventory content
- **WHEN** a user clicks Pickup Confirmations
- **THEN** the Pickup Confirmations module is rendered
- **AND** Inventory Management or Inventory Overview content is not displayed at any point

#### Scenario: Inventory Management does not show Supply & Stock content
- **WHEN** a user clicks Inventory Management
- **THEN** the Inventory Management module is rendered
- **AND** Supply & Stock content is not displayed at any point

#### Scenario: Supply & Stock does not show Inventory Management content
- **WHEN** a user clicks Supply & Stock
- **THEN** the Supply & Stock module is rendered
- **AND** Inventory Management content is not displayed at any point

#### Scenario: Feedback Management does not show other modules while loading
- **WHEN** a user clicks Feedback Management
- **THEN** neither Inventory, Supply & Stock, Dashboard, Transactions, Pickup Confirmations, Request Management nor Return Requests content is displayed while Feedback Management loads

#### Scenario: No generic module fallback
- **WHEN** the system cannot immediately identify the requested module
- **THEN** it does not substitute Inventory Management or any other module as a generic placeholder

#### Scenario: The previous module is never left visible
- **WHEN** a user clicks a different sidebar item
- **THEN** the previously rendered module's content is removed from the content area in the same event turn, before the new module's data is requested

#### Scenario: No new full reload is introduced
- **WHEN** a user navigates between modules
- **THEN** the navigation code does not add any full-reload call that did not already exist
- **AND** the only full reloads that remain are the documented auth, sign-out, and bfcache cases

### Requirement: Module Resolution Is Route-Driven With No Silent Fallback

The system SHALL resolve the active module from the current route, and every sidebar item SHALL map to exactly one route and one module. The system SHALL NOT resolve an unknown, missing, or mismatched route to a default module. A module that the current role may not access SHALL NOT be resolved to a different accessible module.

#### Scenario: Every route resolves to its own component
- **WHEN** each Admin panel route is requested
- **THEN** it renders the component that route is defined to render, with no duplicate routes, no wrong component imports, and no route shadowing another

#### Scenario: Inventory Management route resolves to Inventory Management
- **WHEN** the user navigates to the Inventory Management route
- **THEN** the Inventory Management module is resolved, not the Dashboard module

#### Scenario: Unknown route does not silently become Dashboard
- **WHEN** the requested route does not match any known module
- **THEN** the system reports an explicit not-found state rather than rendering the Dashboard or any other module's content

#### Scenario: No stale route state
- **WHEN** the user navigates from one module to another
- **THEN** the resolved module reflects only the current route and not any previously resolved module

#### Scenario: No role-based route substitution
- **WHEN** a role requests a module that is not part of that role's navigation
- **THEN** the system does not substitute an accessible module in its place

### Requirement: Sidebar Navigation Does Not Reload The Application

The system SHALL navigate between Admin and Super Admin modules using the existing client-side navigation mechanism, and SHALL NOT introduce a full application reload via `window.location.reload()`, `location.reload()`, `window.location.href` assignment, `location.assign`, or `location.replace` as a consequence of this change. Full document loads that are inherent to the current multi-page architecture are permitted, because each module already lives in its own server-rendered document. Where the existing architecture allows client-side navigation, that path SHALL be used and SHALL NOT trigger a document reload.

#### Scenario: No reload introduced by this change
- **WHEN** a user navigates between modules
- **THEN** no full application reload is triggered by the navigation code
- **AND** the auth token, cached admin profile, and already-loaded module state survive navigations that stay within a document

#### Scenario: Client-side navigation within a document
- **WHEN** a user navigates between modules that are sections of the same document
- **THEN** the switch is client-side and the document is not reloaded

#### Scenario: Cross-document navigation is a server-rendered document load
- **WHEN** a user navigates between modules that live in separate documents
- **THEN** the server returns that module's own document, and only that module's content is rendered
- **AND** this is accepted as inherent to the current architecture rather than introduced by this change

#### Scenario: Back and forward navigation
- **WHEN** the user uses browser back or forward after navigating between modules
- **THEN** the correct module renders

#### Scenario: Direct URL entry still works
- **WHEN** a user opens an Admin panel module URL directly
- **THEN** that module renders correctly on a cold load

#### Scenario: Reloads are limited to justified cases
- **WHEN** a full reload occurs
- **THEN** it is for a documented reason such as bfcache restoration of a stale page or sign-out

### Requirement: Each Module Has Its Own Loading State

The system SHALL provide a loading state for every Admin and Super Admin module, and that loading state SHALL be specific to the module being loaded. The system SHALL NOT use another module's component or content as a loading placeholder or fallback.

#### Scenario: Per-module loading state appears
- **WHEN** a user clicks a sidebar item
- **THEN** that module's own loading state is shown in its own data region

#### Scenario: Loading state is module-specific
- **WHEN** a module is loading
- **THEN** the loading indicator is that module's own, not a shared component borrowed from a different module such as Inventory Management

#### Scenario: Loading state appears immediately
- **WHEN** a user clicks a sidebar item whose data has not yet loaded
- **THEN** the loading state is visible immediately rather than after a delay

#### Scenario: No artificial delays
- **WHEN** a loading state is shown
- **THEN** it is driven by the real request lifecycle and is not extended by `setTimeout`, a fake timer, an artificial delay, or a fake progress bar

#### Scenario: Existing module-specific states are reused where present
- **WHEN** a module already renders its own loading indicator
- **THEN** that existing indicator is reused rather than replaced by a new generic one

### Requirement: Landing Page Structure Appears Before Data Resolves

The system SHALL render a module's page structure — headings, filter controls, and layout containers — before that module's data resolves. Only the data region SHALL be in a loading state while the request is in flight. The user SHALL NOT be presented with a blank screen or a fully blocked page while a module's API call is pending.

#### Scenario: Filters and structure render first
- **WHEN** a user clicks Inventory Management and the inventory request is still pending
- **THEN** the Inventory Management heading and filter controls are already visible
- **AND** the data region shows the module's loading state
- **AND** when the data arrives the loading state is replaced by the inventory records in the same region

#### Scenario: Page is not blocked by unrelated requests
- **WHEN** a module's own request is in flight
- **THEN** the page structure and the rest of the shell remain responsive and are not gated on any other module's request

### Requirement: Navigation Boot Completes Without Aborting

The system SHALL complete its navigation initialization on every Admin panel page load for both roles. An error raised while resolving the admin profile, applying role-specific UI, or deriving the active view SHALL NOT abort the rest of navigation initialization, and the active module SHALL still be resolved and rendered.

#### Scenario: Profile resolution failure does not block the active view
- **WHEN** role-specific UI setup raises an error during boot
- **THEN** the error is contained, logged, and the active module is still resolved and rendered

#### Scenario: No unresolved identifiers in navigation code
- **WHEN** navigation initialization runs
- **THEN** every identifier it reads is declared in code or present in the DOM, so no `ReferenceError` is raised

#### Scenario: Both roles reach a rendered module on cold load
- **WHEN** an Admin or a Super Admin opens any Admin panel route cold
- **THEN** that role's sidebar is rendered, the correct module is active, and that module's content is visible

#### Scenario: Session validation failure is contained
- **WHEN** the admin session check fails
- **THEN** the failure is handled by the existing sign-out or access-denied path rather than leaving the shell in a partially initialized state

### Requirement: Existing Module Behavior And Visual Design Are Preserved

The system SHALL preserve the existing sidebar, header, colors, typography, cards, tables, filters, buttons, landing page layouts, module content, and module functionality. The role-specific module sets and permissions SHALL be unchanged. This change SHALL alter only navigation resolution, module mounting, active state, loading state, and data-loading timing.

#### Scenario: Visual design is unchanged
- **WHEN** this change is applied
- **THEN** sidebar, header, colors, typography, cards, tables, filters, buttons, and landing page layouts are visually identical to before

#### Scenario: Module functionality is unchanged
- **WHEN** a user performs an existing action in any module
- **THEN** the action behaves exactly as it did before this change

#### Scenario: Pickup Confirmations implementation is not redesigned
- **WHEN** this change is applied
- **THEN** the existing Pickup Confirmations implementation is retained and is not redesigned, and Pickup Confirmations is not given a special-case workaround that other modules do not have
