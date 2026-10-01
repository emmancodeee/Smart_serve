## MODIFIED Requirements

### Requirement: Admin Sidebar Link Set
Every page in the SmartServe Admin interface SHALL render the same set of sidebar navigation links, in the same relative order. The canonical physical order in the sidebar `<ul>` SHALL be: Dashboard, Admin Accounts, Supply & Stock, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management, Request Management, Pickup Confirmations.

This revises the order introduced alongside this capability, which placed Inventory Management before Supply & Stock and sequenced the three management items (Request Management, Pickup Confirmations) ahead of Transactions and Announcements. The revised order puts Supply & Stock ahead of Inventory Management and moves Request Management and Pickup Confirmations to the end, so that a regular admin's visible sidebar reads Dashboard, Supply & Stock, Inventory Management, Return Requests, Transactions, Announcements, Feedback Management, Request Management, Pickup Confirmations. The invariant that no page deviates from this order is normative and is specified by the `admin-sidebar-fixed-order` capability.

The links that are role-gated (Admin Accounts, Request Management, Pickup Confirmations) MAY be hidden based on the signed-in account's role; the remaining links SHALL be visible to every authenticated Admin account regardless of role. Because Admin Accounts occupies position two, a regular admin's visible items begin at Dashboard, and a super admin's second item is Admin Accounts ahead of Supply & Stock.

This applies to all Admin pages: the dashboard shell served at `/admin` and `/admin/dashboard`, `/admin/users`, `/admin/accounts`, `/admin/announcements`, `/admin/transactions`, `/admin/registrations`, `/admin/pickup-confirmations`, plus `/admin/feedback`, `/admin/returns`, `/admin/supply-stock`, and `/inventory`.

#### Scenario: Nav links are present on every admin page
- **WHEN** an authenticated Admin loads any Admin page
- **THEN** the sidebar contains the full shared link set, with Inventory Management and Supply & Stock both present

#### Scenario: Role-gated links are the only ones that may be hidden
- **WHEN** a non-super Admin loads any Admin page
- **THEN** Admin Accounts, Request Management and Pickup Confirmations are hidden per role rules, and Inventory Management and Supply & Stock remain visible

#### Scenario: Link ordering is consistent across pages
- **WHEN** the sidebar of two different Admin pages is compared
- **THEN** the relative order of the shared links is identical, with Supply & Stock appearing immediately before Inventory Management on both

#### Scenario: Revising the order does not change the link set
- **WHEN** the set of sidebar links is compared before and after the order revision
- **THEN** the same links are present, and no link was added, removed, or retargeted
- **AND** the only difference is the relative order of the items
