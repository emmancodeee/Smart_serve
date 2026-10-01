## 1. Shared Responsive CSS

- [x] 1.1 Create `public/css/responsive.css` with hamburger drawer styles (checkbox hack, overlay, slide animation, 280px max-width)
- [x] 1.2 Add responsive table wrapper styles (overflow-x auto, sticky headers, min-widths, scroll hints)
- [x] 1.3 Add responsive form styles (full-width stacking below 640px, 44px touch targets, full-screen modals)
- [x] 1.4 Add registration workflow vertical stepper styles for viewports below 640px
- [x] 1.5 Add responsive.css <link> to all 7 HTML pages and remove inline <style> blocks

## 2. Responsive Navigation — Student Pages

- [x] 2.1 Update `dashboard.html`: add hamburger toggle markup, overlay div, viewport meta, link responsive.css
- [x] 2.2 Update `profile.html`: same hamburger drawer treatment, remove inline <style>
- [x] 2.3 Update `schedule.html`: same hamburger drawer treatment, remove inline <style>
- [x] 2.4 Update `dashboard.js`, `profile.js`, `schedule.js` to close drawer on nav link click (if needed)

## 3. Responsive Navigation — Admin Pages

- [x] 3.1 Update `admin.html`: add hamburger toggle markup, overlay div, responsive.css link
- [x] 3.2 Update `inventory.html`: same hamburger drawer treatment, remove inline sidebar styling from `<style>` block
- [x] 3.3 Update `admin.js` to close drawer on nav link click (if needed)

## 4. Responsive Tables

- [x] 4.1 Wrap all tables in `admin.html` (analytics, users, registrations, transactions, pickup confirmations) with scrollable div containers
- [x] 4.2 Wrap inventory table in `inventory.html` with scrollable div container
- [x] 4.3 Add sticky header CSS to table thead elements
- [x] 4.4 Set minimum column widths on key columns (actions, name, email)
- [x] 4.5 Convert action button text to icon-only on viewports below 640px with aria-labels

## 5. Responsive Forms and Modals

- [x] 5.1 Update `dashboard.html` registration workflow: stack step tabs vertically on mobile, stack back/next/submit buttons
- [x] 5.2 Update `profile.html` edit form: ensure inputs stack and use full width on mobile
- [x] 5.3 Update `admin.html` create-admin form: stack inputs and use full width
- [x] 5.4 Update `inventory.html` add/edit forms: ensure form rows stack on mobile
- [x] 5.5 Update schedule event modal to use full screen on viewports below 640px
- [x] 5.6 Update admin user detail modal to use full screen on viewports below 640px

## 6. Responsive Schedule Calendar

- [x] 6.1 Ensure day/week/month views in `schedule.html` scale down without overflow on narrow viewports
- [x] 6.2 Hide the mini calendar sidebar on viewports below 640px to save space
- [x] 6.3 Stack view control buttons (Day, Week, Month, List) into two rows on mobile

## 7. Verification

- [ ] 7.1 Test all pages at 360px, 640px, 768px, 1024px viewport widths (manual — open DevTools and resize)
- [ ] 7.2 Verify hamburger drawer opens/closes on all student and admin pages (manual)
- [ ] 7.3 Verify tables are horizontally scrollable with sticky headers (manual)
- [ ] 7.4 Verify form inputs use full width and have 44px+ touch targets on mobile (manual)
- [ ] 7.5 Verify registration workflow is usable at 360px width (manual)
- [ ] 7.6 Verify modals display full-screen on narrow viewports (manual)
