## Why

The Admin Accounts verification screen (`#adminAccountsAccessGate`) shows its heading "Verify to Access Admin Accounts" as a plain dark-navy-text heading inside a white card, with inline styles (`color: #0b1f4d; font-size: 1.25rem; font-weight: 800`). Every other Admin/Super Admin module (Admin Account Management, Inventory Management, Return Requests, Request Management, Announcements, Feedback Management) renders its module title as the standard dark navy title bar. The verification screen is the only admin screen with a non-standard title, so it looks inconsistent.

## What Changes

- Update the "Verify to Access Admin Accounts" heading on the Admin Accounts verification screen to render in the exact same style as the other module title bars (dark navy `#152c69` background, white text, shared typography, 18px/24px padding, `28px 28px 0 0` corner radius).
- Reuse the existing shared title-bar markup/CSS — the `.section-header-row` component already used by Admin Account Management, Announcement Management, and Users Management. No new CSS, no new component.
- Keep the verification screen's functionality unchanged: description text, email/password fields, eye toggle, "Verify Access" button, and the existing authentication logic stay as-is.
- Keep the title left-aligned and non-centered, matching all other module titles.
- Only change the title text and its presentation. No changes to the sidebar, header, colors, charts, or other cards.

## Capabilities

### New Capabilities
- `admin-verification-title`: The Admin Accounts verification ("Verify to Access Admin Accounts") screen SHALL display its title using the same standard title-bar design as the other Admin/Super Admin module titles, and SHALL keep the verification content and behavior unchanged.

### Modified Capabilities
<!-- None. No existing main spec covers the Admin Accounts verification screen title. -->

## Impact

- `public/admin.html` — restructure the `#adminAccountsAccessGate` section heading to use the existing `.section-header-row` title-bar markup (same as `#adminAccounts`, `#announcements`, `#users`), replacing the inline-styled `<h2>`; remove the inline title styles.
- `public/css/admin.css` — no changes required; the shared `.section-header-row` rules (and `--module-title-*` variables) already render the standard bar.
- `public/js/admin.js` — no changes required; gate visibility logic targets existing IDs (`#adminAccountsAccessGate`, `#adminAccounts`), which are unaffected.