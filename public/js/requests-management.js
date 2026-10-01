let allRequests = [];
let filteredRequests = [];
let selectedRequests = [];
let currentRejectId = null;
let currentFeedbackId = null;
let uniformChartInstance = null;
let fcfsEnabled = true;

const token = localStorage.getItem('token');

function startHeaderClock() {
  const clockNode = document.getElementById('headerClock');
  if (!clockNode) return;

  const renderClock = () => {
    const now = new Date();
    clockNode.textContent = now.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  renderClock();
  setInterval(renderClock, 1000);
}

document.addEventListener('DOMContentLoaded', async () => {
  startHeaderClock();
  if (!token) {
    window.location.href = '/';
    return;
  }

  // Verify admin
  try {
    const response = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Unauthorized');

    const user = await response.json();
    if (!user.isAdmin) {
      // An authenticated non-admin was pointed at the student dashboard, which
      // is not an admin landing route. Send them to the admin landing route so
      // the destination is somewhere the auth check above can actually run.
      window.location.href = '/admin/dashboard';
      return;
    }
  } catch (error) {
    localStorage.removeItem('token');
    window.location.href = '/';
    return;
  }

  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  await loadRequests();
});

// Guards against a second activation issuing a duplicate request while the first
// is still in flight. This page's own script owns its data, so the guard lives
// here rather than in the shell's dataset registry.
let requestsInFlight = null;

async function fetchRequests() {
  const res = await fetch('/api/auth/admin/requests', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to load requests');

  const data = await res.json();
  return Array.isArray(data.requests) ? data.requests : [];
}

async function loadRequests() {
  // Painted before the request is awaited, into this module's own region.
  const loadingIndicator = document.getElementById('loadingIndicator');
  loadingIndicator.style.display = 'block';
  document.getElementById('requestsTable').style.display = 'none';
  document.getElementById('noDataMessage').style.display = 'none';

  if (requestsInFlight) {
    try {
      await requestsInFlight;
    } catch (err) {
      console.error(err);
    }
    return;
  }

  try {
    requestsInFlight = fetchRequests();
    allRequests = await requestsInFlight;
    filteredRequests = [...allRequests];

    displayRequests(filteredRequests);
    renderCharts(filteredRequests);
    generateInsights();
    loadingIndicator.style.display = 'none';

  } catch (err) {
    loadingIndicator.innerHTML = `<div style="color: #dc3545;">Error: ${err.message}</div>`;
    console.error(err);
  } finally {
    requestsInFlight = null;
  }
}

function displayRequests(requests) {
  const tbody = document.querySelector('#requestsTable tbody');
  const table = document.getElementById('requestsTable');
  const noDataMsg = document.getElementById('noDataMessage');

  if (requests.length === 0) {
    table.style.display = 'none';
    noDataMsg.style.display = 'block';
    return;
  }

  tbody.innerHTML = '';
  table.style.display = 'table';
  noDataMsg.style.display = 'none';

  const moduleBadge = window.SmartFilter ? SmartFilter.categoryBadge('module') : null;
  const uniformBadge = window.SmartFilter ? SmartFilter.categoryBadge('uniform') : null;

  requests.forEach(req => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="checkbox-col">
        <input type="checkbox" class="request-checkbox" value="${req.id}" onchange="updateSelectedCount()">
      </td>
      <td>${req.firstName || '-'}</td>
      <td>${req.middleName || '-'}</td>
      <td>${req.lastName || '-'}</td>
      <td>${req.module ? (moduleBadge ? `<span class="category-badge ${moduleBadge.className}">${req.module}</span>` : `<strong>${req.module}</strong>`) : '<strong>-</strong>'}${req.moduleCode || '-' ? ' / ' + (req.moduleCode || '-') : ''}</td>
      <td>${req.uniformType ? (uniformBadge ? `<span class="category-badge ${uniformBadge.className}">${req.uniformType}</span>` : `${req.uniformType}`) : '-'}</td>
      <td>
        <span class="status-badge status-${req.status}">
          ${req.status.charAt(0).toUpperCase() + req.status.slice(1)}
        </span>
      </td>
      <td>
        ${req.pickupNumber ? `<span class="pickup-number">${req.pickupNumber}</span>` : '-'}
      </td>
      <td>
        ${req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : '-'}
      </td>
      <td>
        ${req.status === 'pending' ? `
          <button onclick="approveRequest('${req.id}')" class="btn-action btn-approve">Approve</button>
          <button onclick="openRejectModal('${req.id}')" class="btn-action btn-reject">Reject</button>
        ` : `
          <button onclick="openFeedbackModal('${req.id}')" class="btn-action" style="background: #17a2b8; color: white;">Feedback</button>
        `}
        ${req.status === 'approved' && (!req.returnStatus || req.returnStatus === null) ? `
          <button onclick="initiateReturnRequest('${req.id}')" class="btn-action" style="background:#ffc107;color:#183575;margin-left:6px;">Initiate Return</button>
        ` : ''}
        ${req.returnStatus === 'pending' ? `
          <button onclick="completeReturnRequest('${req.id}')" class="btn-action" style="background:#6f42c1;color:white;margin-left:6px;">Complete Return</button>
        ` : ''}
      </td>
    `;
    tbody.appendChild(row);
  });
}

function applyFilters() {
  const statusFilter = document.getElementById('statusFilter').value;
  const moduleFilter = document.getElementById('moduleFilter').value.toLowerCase();
  const searchFilter = document.getElementById('searchFilter').value.toLowerCase();

  filteredRequests = allRequests.filter(req => {
    const matchStatus = !statusFilter || req.status === statusFilter;
    const matchModule = !moduleFilter || (req.module && req.module.toLowerCase().includes(moduleFilter)) || (req.moduleCode && req.moduleCode.toLowerCase().includes(moduleFilter));
    const matchSearch = !searchFilter || 
      (req.firstName && req.firstName.toLowerCase().includes(searchFilter)) ||
      (req.lastName && req.lastName.toLowerCase().includes(searchFilter)) ||
      (req.userId?.studentNumber && req.userId.studentNumber.toLowerCase().includes(searchFilter));
    
    return matchStatus && matchModule && matchSearch;
  });

  displayRequests(filteredRequests);
  clearSelection();
}

function resetFilters() {
  document.getElementById('statusFilter').value = '';
  document.getElementById('moduleFilter').value = '';
  document.getElementById('searchFilter').value = '';
  filteredRequests = [...allRequests];
  displayRequests(filteredRequests);
  clearSelection();
}

function toggleSelectAll(checked) {
  const checkboxes = document.querySelectorAll('.request-checkbox');
  checkboxes.forEach(cb => cb.checked = checked);
  updateSelectedCount();
}

function toggleFcfs(checked) {
  fcfsEnabled = !!checked;
  if (fcfsEnabled) {
    // sort pending by createdAt ascending
    filteredRequests.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  displayRequests(filteredRequests);
}

function updateSelectedCount() {
  const checkboxes = document.querySelectorAll('.request-checkbox:checked');
  selectedRequests = Array.from(checkboxes).map(cb => cb.value);
  const count = selectedRequests.length;
  document.getElementById('selectionCount').textContent = count > 0 ? `${count} request${count !== 1 ? 's' : ''} selected` : '';
  document.getElementById('bulkApproveBtn').disabled = count === 0;
}

function clearSelection() {
  selectedRequests = [];
  document.getElementById('selectAll').checked = false;
  document.getElementById('selectAllHeader').checked = false;
  document.querySelectorAll('.request-checkbox').forEach(cb => cb.checked = false);
  updateSelectedCount();
}

async function approveRequest(requestId) {
  if (!confirm('Are you sure you want to approve this request?')) return;

  try {
    const res = await fetch(`/api/auth/admin/requests/${requestId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!res.ok) throw new Error('Failed to approve request');

    const data = await res.json();
    alert(`Request approved! Pickup Number: ${data.request.pickupNumber}`);
    await loadRequests();

  } catch (err) {
    alert(`Error: ${err.message}`);
    console.error(err);
  }
}

function openRejectModal(requestId) {
  currentRejectId = requestId;
  document.getElementById('rejectionReason').value = '';
  document.getElementById('rejectModal').style.display = 'block';
}

function closeRejectModal() {
  document.getElementById('rejectModal').style.display = 'none';
  currentRejectId = null;
}

async function confirmReject() {
  if (!currentRejectId) return;

  const reason = document.getElementById('rejectionReason').value.trim();
  if (!reason) {
    alert('Please provide a rejection reason');
    return;
  }

  try {
    const res = await fetch(`/api/auth/admin/requests/${currentRejectId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });

    if (!res.ok) throw new Error('Failed to reject request');

    alert('Request rejected successfully');
    closeRejectModal();
    await loadRequests();

  } catch (err) {
    alert(`Error: ${err.message}`);
    console.error(err);
  }
}

function openFeedbackModal(requestId) {
  currentFeedbackId = requestId;
  document.getElementById('feedbackText').value = '';
  document.getElementById('feedbackModal').style.display = 'block';
}

function closeFeedbackModal() {
  document.getElementById('feedbackModal').style.display = 'none';
  currentFeedbackId = null;
}

async function confirmFeedback() {
  if (!currentFeedbackId) return;

  const feedback = document.getElementById('feedbackText').value.trim();
  
  try {
    const res = await fetch(`/api/auth/admin/requests/${currentFeedbackId}/feedback`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ feedback })
    });

    if (!res.ok) throw new Error('Failed to add feedback');

    alert('Feedback added successfully');
    closeFeedbackModal();
    await loadRequests();

  } catch (err) {
    alert(`Error: ${err.message}`);
    console.error(err);
  }
}

async function bulkApprove() {
  if (selectedRequests.length === 0) {
    alert('Please select requests to approve');
    return;
  }

  if (!confirm(`Approve ${selectedRequests.length} request(s)?`)) return;

  try {
    const res = await fetch('/api/auth/admin/requests/bulk/approve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: selectedRequests })
    });

    if (!res.ok) throw new Error('Failed to approve requests');

    const data = await res.json();
    alert(data.message);
    clearSelection();
    await loadRequests();

  } catch (err) {
    alert(`Error: ${err.message}`);
    console.error(err);
  }
}

async function approveAllVisible() {
  // collect visible pending ids
  const ids = filteredRequests.filter(r => r.status === 'pending').map(r => r.id);
  if (ids.length === 0) {
    alert('No pending requests visible to approve');
    return;
  }
  if (!confirm(`Approve ${ids.length} visible request(s)?`)) return;

  try {
    const res = await fetch('/api/auth/admin/requests/bulk/approve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids })
    });

    if (!res.ok) throw new Error('Failed to approve requests');

    const data = await res.json();
    alert(data.message);
    clearSelection();
    await loadRequests();

  } catch (err) {
    alert(`Error: ${err.message}`);
    console.error(err);
  }
}

async function initiateReturnRequest(requestId) {
  if (!confirm('Initiate return process for this request?')) return;
  try {
    const res = await fetch(`/api/auth/admin/requests/${requestId}/return/initiate`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: 'Return initiated by admin' })
    });
    if (!res.ok) throw new Error('Failed to initiate return');
    const data = await res.json();
    alert(data.message);
    await loadRequests();
  } catch (err) {
    alert(`Error: ${err.message}`);
    console.error(err);
  }
}

async function completeReturnRequest(requestId) {
  if (!confirm('Mark return as completed?')) return;
  try {
    const res = await fetch(`/api/auth/admin/requests/${requestId}/return/complete`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnStatus: 'returned', feedback: 'Return completed by admin' })
    });
    if (!res.ok) throw new Error('Failed to complete return');
    const data = await res.json();
    alert(data.message);
    await loadRequests();
  } catch (err) {
    alert(`Error: ${err.message}`);
    console.error(err);
  }
}

function renderCharts(requests) {
  const ctx = document.getElementById('uniformChart').getContext('2d');
  const counts = {};
  requests.forEach(r => {
    const key = r.uniformType || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
  });
  const labels = Object.keys(counts);
  const data = labels.map(l => counts[l]);

  if (uniformChartInstance) {
    uniformChartInstance.data.labels = labels;
    uniformChartInstance.data.datasets[0].data = data;
    uniformChartInstance.update();
    return;
  }

  uniformChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Requests', data, backgroundColor: '#3b82f6' }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function generateInsights() {
  const total = allRequests.length;
  const approved = allRequests.filter(r => r.status === 'approved').length;
  const pending = allRequests.filter(r => r.status === 'pending').length;
  const rejected = allRequests.filter(r => r.status === 'rejected').length;

  // top uniform types
  const typeCounts = {};
  allRequests.forEach(r => { const k = r.uniformType || 'Unknown'; typeCounts[k] = (typeCounts[k] || 0) + 1; });
  const topTypes = Object.entries(typeCounts).sort((a,b) => b[1]-a[1]).slice(0,3).map(t=>`${t[0]} (${t[1]})`);

  // busiest modules
  const moduleCounts = {};
  allRequests.forEach(r => { const k = r.module || r.moduleCode || 'Unknown'; moduleCounts[k] = (moduleCounts[k] || 0) + 1; });
  const topModules = Object.entries(moduleCounts).sort((a,b) => b[1]-a[1]).slice(0,3).map(t=>`${t[0]} (${t[1]})`);

  const approvalRate = total ? Math.round((approved/total)*100) : 0;

  const insights = [];
  insights.push(`<strong>Total requests:</strong> ${total}`);
  insights.push(`<strong>Approval rate:</strong> ${approvalRate}% (${approved} approved)`);
  insights.push(`<strong>Pending:</strong> ${pending} · <strong>Rejected:</strong> ${rejected}`);
  insights.push(`<strong>Top uniform types:</strong> ${topTypes.join(', ') || '-'}`);
  insights.push(`<strong>Top modules:</strong> ${topModules.join(', ') || '-'}`);

  // quick suggestion
  if (approvalRate < 50) {
    insights.push('<em>Suggestion:</em> Review rejection reasons and check inventory levels for popular types.');
  } else {
    insights.push('<em>Suggestion:</em> Consider bulk-approving visible requests when workload is high.');
  }

  document.getElementById('aiInsights').innerHTML = insights.join('<br>');
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
  const rejectModal = document.getElementById('rejectModal');
  const feedbackModal = document.getElementById('feedbackModal');
  
  if (event.target === rejectModal) closeRejectModal();
  if (event.target === feedbackModal) closeFeedbackModal();
});
