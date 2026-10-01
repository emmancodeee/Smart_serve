## ADDED Requirements

### Requirement: Canonical item category labels
The system SHALL display item categories using the canonical labels **Books**, **Modules**, and **Uniforms** in every category dropdown and filter across student-facing and admin modules. Singular variants (`Module`, `Uniform`) and mixed singular/plural duplicates of the same category SHALL NOT appear as options.

#### Scenario: Admin filters show canonical categories
- **WHEN** an admin opens any module whose filter exposes an Item Category / Category dropdown that includes module, uniform, or book categories
- **THEN** the dropdown SHALL show only the canonical labels Books, Modules, and Uniforms for those categories, with no singular `Module` or `Uniform` entries

#### Scenario: Student forms show canonical categories
- **WHEN** a student opens the return request or feedback form and selects an item type or category
- **THEN** the select SHALL display the canonical labels Modules, Uniforms, and Books instead of the singular lowercase variants

### Requirement: Stable underlying values
Category canonicalization SHALL preserve the underlying option value (`module`, `uniform`, `books`, `general`, `service`) so that filtering results, submitted form payloads, and server validation behave exactly as before the change.

#### Scenario: Filtering still matches records
- **WHEN** an admin selects the canonical "Modules" option in the Return Request or Feedback category filter
- **THEN** the underlying selected value SHALL still match records whose stored category/type is the singular lowercase form, and the filtered results SHALL be identical to the pre-change behavior

#### Scenario: Form submission unchanged
- **WHEN** a student submits a return request or feedback form using a canonical-labeled category option
- **THEN** the submitted payload SHALL contain the original value (`module`, `uniform`, `books`, ...), not the display label

### Requirement: Duplicate-free options
The system SHALL build dropdown options deduplicated by canonical label so the same category never appears twice in a single dropdown under different spellings (for example, `module` and `Modules` SHALL collapse into one **Modules** option).

#### Scenario: Singular and plural collapse
- **WHEN** source records contain both a singular and a plural spelling of the same category
- **THEN** the dropdown SHALL contain exactly one option for that category using the canonical label

### Requirement: Preserve valid distinct categories
Canonicalization SHALL NOT remove valid distinct categories. Categories that are genuinely different (such as Feedback's `General` and `Service`, and Inventory's Electronics, Stationery, and Other) SHALL remain as options.

#### Scenario: Distinct categories retained
- **WHEN** a dropdown contains General, Service, Electronics, Stationery, or Other alongside the canonical item categories
- **THEN** those distinct options SHALL remain present and unchanged