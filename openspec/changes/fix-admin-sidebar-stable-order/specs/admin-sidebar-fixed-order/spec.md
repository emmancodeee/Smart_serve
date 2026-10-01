## ADDED Requirements

### Requirement: Canonical Admin Sidebar Order
Every page in the SmartServe Admin interface SHALL render the sidebar navigation `<ul>` with exactly these items in exactly this physical order:

1. Dashboard
2. Admin Accounts
3. Supply & Stock
4. Inventory Management
5. Return Requests
6. Transactions
7. Announcements
8. Feedback Management
9. Request Management
10. Pickup Confirmations

The physical order SHALL be identical in the source markup of all six admin pages: the dashboard shell, `/inventory`, `/admin/returns`, `/admin/feedback`, `/admin/registrations`, and `/admin/supply-stock`.

This order supersedes the order established by the `admin-sidebar-navigation` capability, which placed Inventory Management before Supply & Stock and Request Management, Pickup Confirmations, Transactions and Announcements in a different sequence.

#### Scenario: Order is identical on every admin page
- **WHEN** the sidebar `<ul>` of all six admin pages is inspected
- **THEN** each contains the same ten items in the same order, with no page deviating

#### Scenario: Supply & Stock is always the third item
- **WHEN** the sidebar of any admin page is inspected
- **THEN** "Supply & Stock" is the third `<li>` in the list, and "Inventory Management" is the fourth

#### Scenario: Return Requests is always the fifth item
- **WHEN** the sidebar of any admin page is inspected
- **THEN** "Return Requests" is the fifth `<li>` in the list

#### Scenario: A regular admin sees exactly the nine expected items
- **WHEN** a regular (non-super) admin views any admin page
- **THEN** the visible items in order are Dashboard, Supply & Stock, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management, Request Management, Pickup Confirmations
- **AND** Admin Accounts is hidden by its existing super-admin gate

#### Scenario: A super admin sees Admin Accounts in position two
- **WHEN** a super admin views any admin page
- **THEN** "Admin Accounts" is visible and occupies the second position, ahead of Supply & Stock

### Requirement: Order Is Independent Of The Active Route
The sidebar item order SHALL NOT vary with the current route, the active module, or which nav item was most recently clicked. Navigation between admin pages SHALL NOT move, shift, re-layer, insert, remove, or reorder any sidebar item. The only permitted difference between two admin pages' sidebars is which single link carries the active class.

#### Scenario: Order holds when Supply & Stock is active
- **WHEN** an admin is on `/admin/supply-stock`
- **THEN** the sidebar order is unchanged from the canonical order, with "Supply & Stock" highlighted in place at position three and not moved

#### Scenario: Order holds when Inventory Management is active
- **WHEN** an admin is on `/inventory`
- **THEN** the sidebar order is unchanged, with "Inventory Management" highlighted in place at position four and not moved

#### Scenario: Order holds when Return Requests is active
- **WHEN** an admin is on `/admin/returns`
- **THEN** the sidebar order is unchanged, with "Return Requests" highlighted in place at position five and not moved

#### Scenario: Order holds for every other module
- **WHEN** an admin visits the dashboard, Transactions, Announcements, Feedback Management or Request Management
- **THEN** the sidebar order is the canonical order, with only that page's link highlighted

#### Scenario: Moving between pages does not shift items
- **WHEN** an admin navigates from any admin page to any other admin page
- **THEN** every sidebar item occupies the same ordinal position it occupied on the previous page

#### Scenario: Order is stable across a full session
- **WHEN** an admin visits all admin pages in any sequence
- **THEN** the sidebar order is identical on every page visited, in the same canonical sequence

### Requirement: Active State Affects Styling Only
Selecting a module SHALL change only the active styling of that module's link. It SHALL NOT change the item's position, its DOM order, its markup, its target, or the markup or position of any other item. Active styling SHALL use the existing sidebar active styles already defined for the admin sidebar.

#### Scenario: Highlight does not relocate the item
- **WHEN** an admin activates a module
- **THEN** that module's link receives the active class and stays in its canonical position

#### Scenario: Exactly one item is highlighted
- **WHEN** an admin is on any admin page
- **THEN** exactly one sidebar link carries the active class, and it is the link for the current page

#### Scenario: No item is duplicated by activation
- **WHEN** an admin activates a module
- **THEN** the sidebar still contains exactly one link per module, with no extra or moved copy of the activated link

#### Scenario: Existing active styles are reused
- **WHEN** the active highlight is inspected
- **THEN** it is produced by the existing admin sidebar active styles, with no new active colours, border widths, or radii introduced

#### Scenario: Pre-existing hardcoded active classes are preserved
- **WHEN** a page that ships a hardcoded `active` class on its own link is reordered
- **THEN** that class travels with its own item and still marks only that page's own link
- **AND** no hardcoded `active` class is added to any other item
- **AND** no pre-existing hardcoded `active` class is removed

#### Scenario: A page without the runtime highlighter keeps its hardcoded active
- **WHEN** the Request Management page is inspected, noting that it does not load the runtime active-link script
- **THEN** its own link still carries the pre-existing hardcoded `active` class, and no other link on that page carries it

### Requirement: No Runtime Nav Reordering
No script SHALL reorder, move, insert, append, prepend, remove, or re-parent a sidebar navigation item, and SHALL NOT alter an item's ordinal position. Sidebar visibility SHALL remain limited to the existing role-based show/hide of Admin Accounts, Request Management, and Pickup Confirmations, which SHALL continue to be referenced by element ID rather than by position.

#### Scenario: No nav mutation on page load
- **WHEN** any admin page finishes loading
- **THEN** the sidebar `<li>` sequence is exactly the sequence in the source markup

#### Scenario: No nav mutation on navigation
- **WHEN** an admin navigates within the app, including SPA view switches
- **THEN** no sidebar item's position has changed

#### Scenario: Role gating still references items by ID
- **WHEN** the role-based show/hide logic runs
- **THEN** it locates Admin Accounts, Request Management and Pickup Confirmations by element ID, and no item's visibility depends on its ordinal position

### Requirement: Complete Nav Coverage
Every admin page SHALL contain a link to every module in the canonical order, so that no page's sidebar differs from another's by a missing or extra item.

#### Scenario: Return Requests is present on the Request Management page
- **WHEN** the sidebar of the Request Management page is inspected
- **THEN** it contains a "Return Requests" link to `/admin/returns`, matching the other admin pages

#### Scenario: Feedback Management is present on the Request Management page
- **WHEN** the sidebar of the Request Management page is inspected
- **THEN** it contains a "Feedback Management" link to `/admin/feedback`, matching the other admin pages

#### Scenario: No page has extra or missing items
- **WHEN** the item count of each admin page's sidebar is compared
- **THEN** every page has exactly ten items and the same set of targets, with none missing and none extra

#### Scenario: Item targets are unchanged
- **WHEN** the `href` of each sidebar item is compared before and after this change
- **THEN** every item that existed before still points at the same route it did before, and the two items added to the Request Management page point at the same routes they use on the other pages
- **AND** no existing item was retargeted or removed

### Requirement: Sidebar Visual Design Unchanged
This change SHALL alter only the order of existing navigation items and the addition of the one missing Return Requests link. It SHALL NOT change the sidebar's width, colours, gradient, icons, font, font size, border radius, active-state colours, logo block, spacing, or the page header. It SHALL NOT change any CSS file.

#### Scenario: No visual regression
- **WHEN** the sidebar is compared before and after the change
- **THEN** width, gradient, icon set, typography, border radius, spacing rhythm, active border, and logo are identical

#### Scenario: No stylesheet changes
- **WHEN** the change is applied
- **THEN** no CSS file is modified

#### Scenario: Item appearance is unchanged by reordering
- **WHEN** an item moves to a new ordinal position
- **THEN** its own markup, classes, icon, and label are unchanged, so it renders exactly as it did before

#### Scenario: Layout stability
- **WHEN** a nav item becomes active
- **THEN** the sidebar's total height, item heights, and spacing are unchanged, and no item changes size or layer
