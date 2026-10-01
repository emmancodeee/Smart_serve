# Admin Request Management Guide

## Overview

The **Uniform Request Management** module enables admins to efficiently process, approve, and track uniform distribution requests from students. This guide covers all features, workflows, and best practices.

---

## Access & Navigation

- **URL**: `/admin/requests`
- **Permission**: Admin account required
- **Sidebar**: "Request Management" menu item

---

## Request States & Table

All requests appear in a **single unified table** showing three states:

| Status | Meaning | Next Action |
|--------|---------|-------------|
| **Pending** | Awaiting admin review | Approve or Reject |
| **Approved** | Confirmed for distribution | Issue pickup #, manage returns |
| **Rejected** | Denied (with reason) | View rejection reason, feedback |

### Table Columns

- **Name Fields** (First / Middle / Last) — Student name separated for clarity
- **Module / Code** — Course module and code organized together
- **Uniform Type** — Type of uniform requested
- **Status** — Color-coded badge (yellow=pending, green=approved, red=rejected)
- **Pickup #** — Unique identifier (format: `UP-XXX`) auto-generated on approval
- **Approval Date** — Date when request was approved
- **Actions** — Context-aware buttons (Approve, Reject, Feedback, Return)

---

## Core Features

### 1. **Filter & Search**

Locate requests quickly:

```
Status Filter    → All / Pending / Approved / Rejected
Module Code      → Filter by module code (case-insensitive)
Search Box       → Search by First/Last name or Student #
```

**Actions**: `Search` button applies filters | `Reset` clears all filters

---

### 2. **Approve Requests**

#### Individual Approval
1. Click **Approve** button on a pending request
2. Confirm action
3. System auto-generates **Pickup Number** (UP-001, UP-002, etc.)
4. Student receives pickup notification
5. Request moves to "Approved" status

#### Bulk Approval (Selected)
1. Check boxes next to pending requests
2. Click **Approve Selected** button
3. Confirm to approve all selected
4. All get unique pickup numbers

#### Approve All Visible
1. Filter pending requests (optional)
2. Click **Approve All Visible** button
3. Confirms approval count
4. Instantly approves all visible pending requests

**Best Practice**: Use "Approve All Visible" during high-volume processing after filtering by module/status.

---

### 3. **Reject Requests**

1. Click **Reject** on a pending request
2. Modal appears: enter rejection reason (required)
3. Click **Reject** to confirm
4. Request marked as rejected with reason logged
5. Admin transaction recorded

**Reason Examples**:
- Out of stock for requested size
- Invalid student number
- Duplicate request
- Student eligibility issue

---

### 4. **First-Come-First-Serve (FCFS) Toggle**

Located in bulk actions bar.

- **✓ ON** (default): Sorts visible requests by creation date (oldest first)
- **✗ OFF**: Sorts by newest first

**Use Case**: Enable FCFS to enforce fair queue-based distribution. Toggle off when processing by priority.

---

### 5. **Feedback Management**

### For Approved/Rejected Requests
1. Click **Feedback** button
2. Modal opens: add feedback message
3. Save feedback (shown to student in future communications)

**Examples**:
- "Approved pending size verification"
- "Rejected: uniform out of stock, reorder in 2 weeks"
- "Approved: pickup available Mon-Fri 10am-3pm"

---

### 6. **Return Process**

Manage uniform returns after distribution.

#### Initiate Return (for approved requests)
1. Click **Initiate Return** button (appears after approval)
2. Confirm action
3. System records return start date
4. Request enters return workflow

#### Complete Return
1. Student returns uniform/admits loss/damage
2. Click **Complete Return** button
3. Admin confirms return status:
   - **Returned** — Uniform received in good condition
   - **Damaged** — Uniform damaged; may require fee/replacement
   - **Lost** — Student lost uniform; assess replacement/penalty
4. Return feedback logged
5. Request marked complete

---

## Charts & Analytics

### Uniforms Summary Chart
- **Type**: Bar chart showing request volume by uniform type
- **Updates**: Refreshes on filter changes and page reload
- **Use**: Identify popular sizes, trending requests for inventory management

### AI Insights Panel
Displays key metrics:

- **Total Requests** — Overall count
- **Approval Rate** — % of approved vs total
- **Pending / Rejected Counts** — Current queue size
- **Top Uniform Types** — Most requested (top 3)
- **Top Modules** — Busiest departments (top 3)
- **Smart Suggestions** — Context-aware tips
  - Low approval rate → Check inventory and rejection reasons
  - High approval rate → Consider bulk-approve strategy

**Generate Insights**: Click "Generate Insights" button to refresh analysis.

---

## Student Experience

### What Students See

When a request is **approved**, students receive:
- ✓ **Pickup Number** — Unique identifier for queue ordering (e.g., UP-042)
- ✓ **Pickup Date Range** — When they can collect uniform
- ✓ **Feedback/Instructions** — Special notes from admin

### Pickup Queue Order

Students pick up uniforms based on **pickup number** (first-come-first-serve).
- UP-001 picks up first, then UP-002, etc.
- Display in student dashboard shows their place in queue

### Return Instructions

Through the student dashboard:
1. See "Initiate Return" option after pickup
2. Schedule return appointment
3. Admins mark returned/damaged/lost from request management
4. Return status visible in student history

---

## Workflows & Best Practices

### Workflow 1: Bulk Processing (High Volume)
```
1. Login as admin → Request Management
2. Filter by Status: Pending
3. Filter by Module (e.g., "BSCS-101")
4. Enable FCFS toggle
5. Review chart for uniform types
6. Click "Approve All Visible"
7. Confirm bulk action
```

### Workflow 2: Individual Review & Feedback
```
1. Identify pending request
2. Click "Reject" if issues found
3. Provide rejection reason
4. For approved requests, add feedback
5. Send notification to student
```

### Workflow 3: Managing Returns
```
1. View "Approved" requests
2. Click "Initiate Return" when distribution complete
3. Wait for student to return uniform
4. Click "Complete Return" and select status (Returned/Damaged/Lost)
5. Log feedback if needed
```

### Workflow 4: Analytics & Reporting
```
1. View Uniforms Summary chart → Identify bottlenecks
2. Read AI Insights → Approval rate, top modules
3. Use suggestions → Optimize inventory or batch-approve
4. Export data (future feature) for detailed reporting
```

---

## Key Metrics & KPIs

| Metric | Purpose | Action |
|--------|---------|--------|
| **Approval Rate** | % of approved vs total | Target >80% for efficiency |
| **Pending Queue** | Active requests awaiting approval | Reduce using bulk-approve |
| **Top Uniform Types** | Most demanded sizes/styles | Update inventory accordingly |
| **Return Rate** | % of returned vs approved | Monitor for inventory loss |
| **Feedback Coverage** | % of requests with feedback | Aim for 100% communication |

---

## Troubleshooting

### Issue: "Approve All Visible" disabled
- **Cause**: No pending requests in current view
- **Fix**: Check filters; ensure status is not "Approved" or "Rejected"

### Issue: Pickup number not showing
- **Cause**: Request still pending (numbers assigned on approval only)
- **Fix**: Approve request to generate pickup number

### Issue: Return buttons not appearing
- **Cause**: Request not approved yet
- **Fix**: Approve request first, then return actions become available

### Issue: Chart not rendering
- **Cause**: No requests loaded or Chart.js library failed
- **Fix**: Refresh page; check browser console for errors

---

## API Endpoints (Admin)

_Reference for integration:_

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/auth/admin/requests` | List all requests |
| PUT | `/api/auth/admin/requests/:id/approve` | Approve single request |
| PUT | `/api/auth/admin/requests/:id/reject` | Reject with reason |
| POST | `/api/auth/admin/requests/bulk/approve` | Approve multiple requests |
| PUT | `/api/auth/admin/requests/:id/feedback` | Add feedback |
| PUT | `/api/auth/admin/requests/:id/return/initiate` | Start return process |
| PUT | `/api/auth/admin/requests/:id/return/complete` | Complete return (mark status) |

---

## Tips for Efficiency

✅ **Do's**
- Use FCFS toggle to maintain fair order
- Add feedback for every rejection (transparency)
- Batch-approve similar module requests
- Check uniforms chart monthly for trends
- Use search box for quick lookups

❌ **Don'ts**
- Skip rejection reasons (affects student trust)
- Approve without verifying student eligibility
- Ignore return workflow (inventory tracking)
- Forget to initiate returns after distribution
- Overload single batch (>500 approvals at once)

---

## Future Enhancements

- Export request data to CSV/PDF
- Email notifications to students
- Inventory integration (auto-check stock before approval)
- Advanced reporting dashboard
- QR code pickup verification
- Return deadline enforcement

---

**Last Updated**: July 2026  
**Module**: Uniform Request Management v1.0
