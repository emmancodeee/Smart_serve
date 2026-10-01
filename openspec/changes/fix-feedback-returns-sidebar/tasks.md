## 1. Investigation

- [x] 1.1 Audit sidebar markup in admin.html, admin-feedback.html, admin-returns.html (nav, logo block, nav links) and confirm they share the same structure
- [x] 1.2 Identify why the sidebar renders differently: confirm Bootstrap CSS is loaded only on admin-feedback.html / admin-returns.html and enumerate its utility-class collisions (.py-4, .px-5, .gap-4, .border) via bootstrap.min.css rule extraction
- [x] 1.3 Verify the modal dependency: confirm admin-feedback.js / admin-returns.js rely on `bootstrap.Modal` (Bootstrap cannot be removed)

## 2. Fix implementation

- [x] 2.1 Add scoped override block to public/css/admin.css (`.admin-page .sidebar-shell`): restore py-4/px-5/gap-4 padding and gap values, link border colors (transparent / gold hover / gold active), logo block gap, logo icon box border-color — all !important to beat Bootstrap

## 3. Verification

- [x] 3.1 Render dashboard, feedback, and returns in headless Edge with a valid JWT (CDP) and compare computed geometry: link height 72px, paddings 16/20px, gaps 16px, single-line title on all three pages
- [x] 3.2 Confirm sidebar screenshots no longer show the inflated layout (link rows uniform 80px pitch, title one line) and that active-link highlight behaves as on the dashboard
- [x] 3.3 Confirm no changes were made to filters, tables, content, backend, or routing (diff scope check)
