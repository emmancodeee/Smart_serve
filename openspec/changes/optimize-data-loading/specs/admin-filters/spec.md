## ADDED Requirements

### Requirement: No duplicate initial render by SmartFilter
The SmartFilter component SHALL render the data table exactly once when created with data already present, and loaders SHALL NOT trigger a second identical filter processing pass on unchanged data.

#### Scenario: Filter creation is the only initial render
- **WHEN** a module creates its SmartFilter with data already in the in-memory array
- **THEN** the table SHALL be rendered once by the filter's creation-time apply, and the loader SHALL NOT immediately call another full filter apply on the same unchanged data

#### Scenario: Option lists still refresh after data loads
- **WHEN** a loader has replaced the dataset and dynamic filter option lists must be rebuilt
- **THEN** the loader SHALL refresh the option lists without re-rendering the table a second time