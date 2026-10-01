# Student Sidebar Design

## ADDED Requirements

### Requirement: Resource-based announcement visibility
`GET /api/auth/announcements` (`announcementService.listStudentAnnouncements`) SHALL return only the announcements that a student should currently see: all announcements that follow the existing student rules (audience `students`, not expired) and, for announcements tied to one of the supported resources — Books, Modules, Uniforms — that the resource is currently available in inventory.

The announcement-to-resource relationship SHALL be derived from the announcement's free-text `category`, normalized case-insensitively with singular/plural aliases (`Book`/`Books`, `Module`/`Modules`, `Uniform`/`Uniforms` derive from `Inventory.category`). The availability SHALL be the live sum of `Inventory.quantity` grouped by that category, re-aggregated on every request so changes apply immediately without caching.

An announcement whose category is a supported resource SHALL be returned only while the summed quantity for that resource is greater than zero, and SHALL be hidden entirely (never deleted or unpublished) while the sum is zero.

An announcement whose category is NOT related to Books, Modules, or Uniforms SHALL follow the existing announcement rules and SHALL NOT be related to any inventory category.

#### Scenario: Announcement hidden while resource is out of stock
- **WHEN** a student requests the student announcements and a "Books" announcement exists while the summed quantity of all `Inventory` items with `category: 'Books'` is `0`
- **THEN** that announcement is absent from the response, and the announcement document is still stored (not deleted, not unexpired)

#### Scenario: Announcement reappears after restocking
- **WHEN** the same "Books" announcement exists and an admin later restocks the Books category so its summed quantity becomes greater than `0`
- **THEN** the next request for student announcements includes that announcement without any modifications to the announcement record

#### Scenario: Non-resource announcements unaffected
- **WHEN** a student requests the student announcements and an announcement's category is something other than a Books/Modules/Uniforms form (for example "General" or "Events") regardless of inventory state
- **THEN** the announcement is returned under the existing student announcement rules and is never filtered by inventory availability

#### Scenario: Case and singular/plural normalization
- **WHEN** an announcement uses a category such as "book", "Books", "module", "Uniforms", or "uniform"
- **THEN** the category resolves to the matching resource (Books, Modules, or Uniforms respectively) and the availability rule for that resource applies

### Requirement: Student announcements page contents
The Student Announcements page SHALL contain exactly: the "Announcements" blue title box, the list of announcements returned by the backend, and the announcement-details modal. The page SHALL be view-only.

#### Scenario: Page has no management controls
- **WHEN** the rendered Student Announcements page is inspected
- **THEN** there is no create/edit/delete control and no way for the student to modify an announcement

#### Scenario: Filters and search removed
- **WHEN** the rendered Student Announcements page is inspected
- **THEN** there is no Category, Timeframe, or Sort filter, no search box, and no "Clear Filters" control anywhere on the page

#### Scenario: Extraneous sections removed
- **WHEN** the rendered Student Announcements page is inspected
- **THEN** there are no summary stat cards, no "featured announcement" slot, and no "Last synced" label

#### Scenario: Feed reflects the backend response only
- **WHEN** the student opens the announcements page
- **THEN** every announcement card rendered is exactly one of the announcements returned by `GET /api/auth/announcements`, and cards for resources whose summed inventory quantity is `0` never render

### Requirement: Real-time availability on the page
The feed SHALL refresh the announcement list without requiring a manual page reload so availability changes propagate live.

#### Scenario: Sidebar unchanged
- **WHEN** the change is delivered
- **THEN** the Student sidebar on the Announcements page is identical to its pre-change rendering, and no other student page is altered

#### Scenario: Admin announcements unchanged
- **WHEN** an admin opens the Admin announcements management UI after this change
- **THEN** it is byte-identical to before the change, including the SmartFilter toolbar and create/edit/delete behavior