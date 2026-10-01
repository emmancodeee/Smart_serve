## ADDED Requirements

### Requirement: Only The Active Module's Data Is Requested

The system SHALL request data for the active module only. Activating a module SHALL NOT wait for, or issue requests for, data belonging to any other module. This applies to every module in both the Admin and Super Admin navigation.

#### Scenario: Inventory Management does not request unrelated data
- **WHEN** a user navigates to Inventory Management
- **THEN** only inventory-related data is requested
- **AND** feedback, transactions, pickup confirmations, announcements, return requests, and request management data are not requested

#### Scenario: Pickup Confirmations does not request unrelated data
- **WHEN** a user navigates to Pickup Confirmations
- **THEN** only pickup-confirmation-related data is requested
- **AND** inventory, supply and stock, feedback, transactions, and announcements data are not requested

#### Scenario: Feedback Management does not request unrelated data
- **WHEN** a user navigates to Feedback Management
- **THEN** only feedback data is requested
- **AND** the transaction API is not requested

#### Scenario: Supply & Stock does not request unrelated data
- **WHEN** a user navigates to Supply & Stock
- **THEN** the pickup-confirmation API is not requested

#### Scenario: No eager preload of every module on boot
- **WHEN** an Admin panel page boots
- **THEN** loaders are not invoked for modules the user has not navigated to

#### Scenario: No batching behind a full-dataset endpoint
- **WHEN** a module's data is requested
- **THEN** the request does not pull every other module's dataset along with it

### Requirement: No Duplicate Or Redundant Requests Per Navigation

The system SHALL issue at most one in-flight request per module per navigation, and SHALL NOT issue the same module request more than once for a single activation of that module. The system SHALL prevent duplicates arising from effect dependencies, parent and child effects, context or provider behaviour, route changes, state changes, and repeated mounting.

#### Scenario: One request per module activation
- **WHEN** a user navigates to a module that has not been loaded
- **THEN** that module's data is requested exactly once for that activation

#### Scenario: Repeated effect runs do not multiply requests
- **WHEN** a module's initialization runs more than once for the same activation, for example because dependencies or state changed
- **THEN** the second and subsequent runs do not issue additional requests while the first is still in flight

#### Scenario: Concurrent activations of the same module do not duplicate
- **WHEN** the same module is activated again while its previous request is still in flight
- **THEN** no second request is issued and the in-flight request's result is used

#### Scenario: No new parallel data-fetching system
- **WHEN** this change is applied
- **THEN** the existing per-module loaders and endpoints are reused and corrected, and no additional or duplicate data-fetching layer is introduced alongside them

### Requirement: Dashboard Uses Lightweight Summary Data

The Admin and Super Admin Dashboard SHALL request only the data its displayed metrics require. The Dashboard SHALL NOT load every full module dataset in order to render its landing page, and SHALL use lightweight summary data where the existing backend supports it.

#### Scenario: Dashboard does not load full module datasets
- **WHEN** a user opens the Dashboard
- **THEN** the Dashboard does not fetch the full inventory, transactions, feedback, returns, requests, or pickup confirmation datasets merely to display the landing page

#### Scenario: Dashboard landing page appears before its metrics resolve
- **WHEN** a user opens the Dashboard and its metrics request is pending
- **THEN** the Dashboard page structure renders immediately and only the metrics region shows a loading state

#### Scenario: Existing summary endpoints are preferred
- **WHEN** the Dashboard needs aggregate figures
- **THEN** it uses the existing summary or analytics endpoints rather than deriving the figures by loading raw full datasets client-side

### Requirement: Inventory And Supply & Stock Share One Dataset Source

Inventory Management and Supply & Stock SHALL read from a single shared source for the real Books, Modules, and Uniforms datasets. Switching between those two modules SHALL NOT re-request or duplicate the complete dataset unnecessarily, and the two modules SHALL NOT maintain separate copies of the same data.

#### Scenario: Switching between the two modules does not refetch the full dataset
- **WHEN** a user moves from Inventory Management to Supply & Stock, or from Supply & Stock to Inventory Management
- **THEN** the already-loaded Books, Modules, and Uniforms data is reused
- **AND** the complete dataset is not re-requested

#### Scenario: No duplicate datasets
- **WHEN** either module renders
- **THEN** neither module holds an independent copy of the Books, Modules, or Uniforms dataset

#### Scenario: Both modules render the same records
- **WHEN** Inventory Management and Supply & Stock are both visited
- **THEN** both display records consistent with the same shared source
