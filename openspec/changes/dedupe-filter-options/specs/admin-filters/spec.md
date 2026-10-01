## ADDED Requirements

### Requirement: Canonical category options in Return Request filter
The admin Return Request filter's Item Category dropdown SHALL display the canonical labels Modules, Uniforms, and Books for return item types, whether the options are derived from live records or from the empty-data fallback list.

#### Scenario: Return category options canonical from live data
- **WHEN** return requests with items of type `module`, `uniform`, and `books` are loaded and the Item Category dropdown is populated
- **THEN** the dropdown SHALL show the options Modules, Uniforms, and Books while the underlying selected values remain `module`, `uniform`, and `books`

#### Scenario: Return category fallback is canonical
- **WHEN** no return requests exist and the fallback option list is used
- **THEN** the Item Category dropdown SHALL show Modules, Uniforms, and Books (no singular `Module` or `Uniform` entries)

### Requirement: Canonical category options in Feedback filter
The admin Feedback filter's Category dropdown SHALL display the canonical labels Modules, Uniforms, Books, General, and Service for feedback categories, whether derived from live records or from the empty-data fallback list.

#### Scenario: Feedback category options canonical from live data
- **WHEN** feedback records are loaded and the Category dropdown is populated
- **THEN** the dropdown SHALL show Modules, Uniforms, Books, General, and Service while the underlying selected values remain the stored lowercase category values

#### Scenario: Feedback category fallback is canonical
- **WHEN** no feedback records exist and the fallback option list is used
- **THEN** the Category dropdown SHALL show Modules, Uniforms, Books, General, and Service (no singular `Module` or `Uniform` entries)