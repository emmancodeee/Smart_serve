## ADDED Requirements

### Requirement: Export filtered rows to CSV
The system SHALL provide an Export button in every admin module's filter toolbar that downloads a CSV file containing exactly the rows currently visible after applying all active filters and the current sort order.

#### Scenario: Export respects active filters
- **WHEN** an admin applies filters and clicks Export
- **THEN** the downloaded CSV SHALL contain only the filtered rows, in the current sort order

#### Scenario: Export with no filters
- **WHEN** an admin clicks Export with no filters active
- **THEN** the downloaded CSV SHALL contain all rows of the module's dataset

### Requirement: Consistent export file naming
The system SHALL name exported files using the pattern `<module>-export-YYYY-MM-DD.csv` (e.g., `inventory-export-2026-08-02.csv`).

#### Scenario: File name format
- **WHEN** an admin exports any module
- **THEN** the downloaded file SHALL follow the `<module>-export-YYYY-MM-DD.csv` naming pattern

### Requirement: Column mapping per module
The system SHALL map each module's displayed columns to CSV columns: inventory (Item Name, Category, Quantity, Unit of Measure, Status, Last Updated), registrations (Student Name, Student ID, Course, Year Level, Status, Date), transactions (Date, Student, Type, Details), feedback (Date, Student, Category, Rating, Status, Message), returns (Date, Student, Item, Status, Reason, Quantity), pickup confirmations (Date, Student, Module, Status, Confirmation), admin accounts (Name, Email, Role, Department, Status, Date Created), and announcements (Title, Category, Priority, Created By, Date).

#### Scenario: CSV columns match module
- **WHEN** an admin exports a module
- **THEN** the CSV header row SHALL contain that module's mapped column names

### Requirement: Export handles empty and large datasets
The system SHALL export a CSV with the header row only when no rows match the active filters, and SHALL handle datasets larger than the visible page without truncation.

#### Scenario: Empty export
- **WHEN** filters match no rows and the admin clicks Export
- **THEN** the CSV SHALL contain only the header row

#### Scenario: Full dataset export
- **WHEN** the module's dataset exceeds the pagination or display limit
- **THEN** the CSV SHALL contain all matching rows, not just the visible page
