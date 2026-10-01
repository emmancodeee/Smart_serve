let token = localStorage.getItem('token');
let currentReturnId = null;
let allReturnRequests = [];
let returnFilter = null;
let returnFilterInit = false;

// Guards against a second activation issuing a duplicate request while the first
// is still in flight. This page's own script owns its data, so the guard lives
// here rather than in the shell's dataset registry.
let returnRequestsInFlight = null;

// Student-supplied text (names, item names, notes, reasons) is rendered into
// innerHTML below, so every interpolated value goes through this first.
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const RETURN_PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

async function fetchReturnRequests() {
    const response = await fetch('/api/auth/admin/returns?limit=1000', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Failed to load return requests (${response.status})`);
    }

    const data = await response.json();
    return Array.isArray(data.returnRequests) ? data.returnRequests : [];
}

async function loadReturnRequests() {
    // Painted before the request is awaited, into this module's own table body.
    showLoading('returnTableBody', 'Loading return requests...');

    if (returnRequestsInFlight) {
        try {
            await returnRequestsInFlight;
        } catch (error) {
            console.error('Error loading return requests:', error);
        }
        return;
    }

    returnRequestsInFlight = fetchReturnRequests();
    try {
        allReturnRequests = await returnRequestsInFlight;
        const filterCreated = initReturnFilter();
        if (returnFilter) {
            returnFilter.refreshOptions();
            if (!filterCreated) returnFilter.apply();
        } else if (allReturnRequests.length) {
            renderReturnTable(allReturnRequests);
        } else {
            showEmpty('returnTableBody', 'No return requests yet.');
        }
    } catch (error) {
        showError('returnTableBody', error.message || 'Failed to load return requests');
        console.error('Error loading return requests:', error);
    } finally {
        returnRequestsInFlight = null;
    }
}

function initReturnFilter() {
    if (returnFilterInit || typeof SmartFilter === 'undefined') return false;
    const container = document.getElementById('returnFilterContainer');
    if (!container) return false;
    returnFilter = SmartFilter.create(container, RETURN_FILTER_CONFIG);
    returnFilterInit = true;
    return true;
}

function returnCategoriesOf(record) {
    return (record?.items || []).map(item => String(item?.type || '').trim()).filter(Boolean);
}

const RETURN_FILTER_CONFIG = {
    moduleId: 'returns',
    search: {
        placeholder: 'Search return requests by student, item, or reason...',
        keys: ['userName', 'userEmail', 'reason', 'details']
    },
    fields: [
        {
            key: 'category',
            label: 'Item Category',
            options: () => buildCategoryFilterOptions(
                allReturnRequests.flatMap(record => returnCategoriesOf(record)),
                ['module', 'uniform', 'books']
            )
        },
        {
            key: 'status',
            label: 'Status',
            options: () => distinctFrom(allReturnRequests, r => r?.status, ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'])
        },
        {
            key: 'reason',
            label: 'Return Reason',
            options: () => distinctFrom(allReturnRequests, r => r?.reason)
        },
        { key: 'dateRange', label: 'Date', presets: true, getDate: r => getFirstValidDate(r?.requestedReturnDate) }
    ],
    getRows: () => allReturnRequests,
    filter: (rows, state) => {
        const status = String(state.values.status || '').toLowerCase();
        const category = String(state.values.category || '').toLowerCase();
        const reason = String(state.values.reason || '').toLowerCase();
        return rows.filter(record => {
            if (status && String(record?.status || '').toLowerCase() !== status) return false;
            if (category && !returnCategoriesOf(record).some(value => value.toLowerCase() === category)) return false;
            if (reason && String(record?.reason || '').trim().toLowerCase() !== reason) return false;
            return true;
        });
    },
    onRender: rows => renderReturnTable(rows),
    sorts: [
        {
            key: 'dateAsc',
            label: 'Requested return date (soonest first)',
            compare: (a, b) => (getFirstValidDate(a?.requestedReturnDate)?.getTime() || 0) - (getFirstValidDate(b?.requestedReturnDate)?.getTime() || 0)
        },
        { key: 'student', label: 'Student (A-Z)', getValue: r => r?.userName },
        { key: 'status', label: 'Status (A-Z)', getValue: r => r?.status }
    ],
    export: {
        fileName: 'returns',
        columns: [
            { key: 'requestedReturnDate', label: 'Date' },
            { key: 'student', label: 'Student', getValue: r => r?.userName },
            { key: 'item', label: 'Item', getValue: r => (r?.items || []).map(item => `${item?.type}: ${item?.name}`).join(', ') },
            { key: 'status', label: 'Status' },
            { key: 'reason', label: 'Reason' },
            { key: 'quantity', label: 'Quantity', getValue: r => (r?.items || []).reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0) }
        ]
    }
};

function renderReturnTable(returnRequests) {
    const tbody = document.getElementById('returnTableBody');
    
    if (returnRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center empty-table-state table-empty-state">No return requests found for the selected filters.</td></tr>';
        return;
    }

    tbody.innerHTML = returnRequests.map(returnRequest => {
        const items = Array.isArray(returnRequest.items) ? returnRequest.items : [];
        const id = escapeHtml(returnRequest._id);
        return `
        <tr>
            <td>
                <div class="student-name">${escapeHtml(returnRequest.userName || 'Unknown student')}</div>
                <small class="student-email">${escapeHtml(returnRequest.userEmail || 'No email provided')}</small>
            </td>
            <td>
                <div class="item-summary">${items.map(item => `${escapeHtml(item.type)}: ${escapeHtml(item.name)}`).join(', ')}</div>
                <small class="item-count">${items.length} item${items.length === 1 ? '' : 's'}</small>
            </td>
            <td class="date-cell">${new Date(returnRequest.requestedReturnDate).toLocaleDateString()}</td>
            <td><span class="badge ${getReturnStatusBadgeClass(returnRequest.status)}">${escapeHtml(returnRequest.status)}</span></td>
            <td><span class="badge ${getPriorityBadgeClass(returnRequest.priority)}">${escapeHtml(returnRequest.priority)}</span></td>
            <td class="date-cell">${new Date(returnRequest.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="table-actions">
                <button type="button" class="btn btn-sm btn-info" data-return-action="view" data-id="${id}">View</button>
                ${returnRequest.status === 'pending' ? `
                    <button type="button" class="btn btn-sm btn-success" data-return-action="approve" data-id="${id}">Approve</button>
                    <button type="button" class="btn btn-sm btn-danger" data-return-action="reject" data-id="${id}">Reject</button>
                ` : ''}
                ${returnRequest.status === 'approved' ? `
                    <button type="button" class="btn btn-sm btn-primary" data-return-action="confirm" data-id="${id}">Confirm</button>
                ` : ''}
                <button type="button" class="btn btn-sm btn-secondary" data-return-action="priority" data-id="${id}">Priority</button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function getReturnStatusBadgeClass(status) {
    const classes = {
        'pending': 'bg-warning',
        'approved': 'bg-info',
        'rejected': 'bg-danger',
        'completed': 'bg-success',
        'cancelled': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
}

function getPriorityBadgeClass(priority) {
    const classes = {
        'low': 'bg-secondary',
        'medium': 'bg-info',
        'high': 'bg-warning',
        'urgent': 'bg-danger'
    };
    return classes[priority] || 'bg-secondary';
}

async function viewReturnRequest(id) {
    const cached = Array.isArray(allReturnRequests)
        ? allReturnRequests.find(item => item?._id === id)
        : null;
    if (cached) {
        showReturnModal(cached);
        return;
    }

    try {
        const response = await fetch(`/api/auth/admin/returns/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const returnRequest = await response.json();
            showReturnModal(returnRequest);
        } else {
            UIKit.toast('Failed to load return request details', 'error');
        }
    } catch (error) {
        console.error('Error viewing return request:', error);
        UIKit.toast('Failed to load return request details', 'error');
    }
}

function formatDateTime(raw, dateOnly = false) {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return dateOnly ? date.toLocaleDateString() : date.toLocaleString();
}

function showReturnModal(returnRequest) {
    const modalBody = document.getElementById('returnModalBody');
    const items = Array.isArray(returnRequest.items) ? returnRequest.items : [];
    modalBody.innerHTML = `
        <div class="mb-3">
            <strong>Student:</strong> ${escapeHtml(returnRequest.userName || 'Unknown student')} (${escapeHtml(returnRequest.userEmail || 'No email provided')})
        </div>
        <div class="mb-3">
            <strong>Registration:</strong> ${escapeHtml(returnRequest.registrationId?.module || 'N/A')} - ${escapeHtml(returnRequest.registrationId?.course || 'N/A')}
        </div>
        <div class="mb-3">
            <strong>Items:</strong>
            <ul>
                ${items.map(item => `
                    <li>${escapeHtml(item.type)}: ${escapeHtml(item.name)} (${escapeHtml(item.condition)}) x${escapeHtml(item.quantity)} ${item.notes ? `- ${escapeHtml(item.notes)}` : ''}</li>
                `).join('')}
            </ul>
        </div>
        <div class="mb-3">
            <strong>Reason:</strong>
            <p>${escapeHtml(returnRequest.reason)}</p>
        </div>
        ${returnRequest.details ? `
            <div class="mb-3">
                <strong>Details:</strong>
                <p>${escapeHtml(returnRequest.details)}</p>
            </div>
        ` : ''}
        <div class="mb-3">
            <strong>Requested Return Date:</strong> ${formatDateTime(returnRequest.requestedReturnDate, true)}
        </div>
        ${returnRequest.actualReturnDate ? `
            <div class="mb-3">
                <strong>Actual Return Date:</strong> ${formatDateTime(returnRequest.actualReturnDate)}
            </div>
        ` : ''}
        <div class="mb-3">
            <strong>Status:</strong> <span class="badge ${getReturnStatusBadgeClass(returnRequest.status)}">${escapeHtml(returnRequest.status)}</span>
        </div>
        <div class="mb-3">
            <strong>Priority:</strong> <span class="badge ${getPriorityBadgeClass(returnRequest.priority)}">${escapeHtml(returnRequest.priority)}</span>
        </div>
        ${returnRequest.adminDecision?.adminNotes ? `
            <div class="mb-3">
                <strong>Admin Notes:</strong>
                <p>${escapeHtml(returnRequest.adminDecision.adminNotes)}</p>
            </div>
        ` : ''}
        ${returnRequest.adminDecision?.rejectionReason ? `
            <div class="mb-3">
                <strong>Rejection Reason:</strong>
                <p class="text-danger">${escapeHtml(returnRequest.adminDecision.rejectionReason)}</p>
            </div>
        ` : ''}
        ${returnRequest.returnConfirmation?.receivedCondition ? `
            <div class="mb-3">
                <strong>Received Condition:</strong> ${escapeHtml(returnRequest.returnConfirmation.receivedCondition)}
            </div>
        ` : ''}
        ${returnRequest.returnConfirmation?.notes ? `
            <div class="mb-3">
                <strong>Return Notes:</strong>
                <p>${escapeHtml(returnRequest.returnConfirmation.notes)}</p>
            </div>
        ` : ''}
        <div class="mb-3">
            <strong>Inventory Restored:</strong> ${returnRequest.inventoryRestored ? 'Yes' : 'No'}
        </div>
        ${returnRequest.studentFeedback?.rating ? `
            <div class="mb-3">
                <strong>Student Feedback:</strong> ${escapeHtml(returnRequest.studentFeedback.rating)}/5 - ${escapeHtml(returnRequest.studentFeedback.comments || 'No comment provided')}
            </div>
        ` : ''}
        <div class="mb-3">
            <strong>Submitted:</strong> ${formatDateTime(returnRequest.createdAt)}
        </div>
    `;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('returnModal')).show();
}

// Reuses the modal's single Bootstrap instance. Creating a new instance on
// every open stacked instances (and backdrops) on the same element.
function showModal(modalId) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId)).show();
}

function hideModal(modalId) {
    bootstrap.Modal.getInstance(document.getElementById(modalId))?.hide();
}

// Reads the server's { error } body when there is one.
async function readErrorMessage(response, fallback) {
    const data = await response.json().catch(() => ({}));
    return data?.error || fallback;
}

function openApproveModal(id) {
    currentReturnId = id;
    document.getElementById('adminNotes').value = '';
    showModal('approveModal');
}

async function approveReturn() {
    const adminNotes = document.getElementById('adminNotes').value;

    try {
        const response = await fetch(`/api/auth/admin/returns/${currentReturnId}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ adminNotes })
        });

        if (response.ok) {
            UIKit.toast('Return request approved successfully', 'success');
            hideModal('approveModal');
            await loadReturnRequests();
        } else {
            UIKit.toast(`Failed to approve return request: ${await readErrorMessage(response, 'Unknown error')}`, 'error');
        }
    } catch (error) {
        console.error('Error approving return request:', error);
        UIKit.toast('Error approving return request', 'error');
    }
}

function openRejectModal(id) {
    currentReturnId = id;
    document.getElementById('rejectionReason').value = '';
    // The reject modal has its own notes field. Both modals used to share
    // id="adminNotes", so this read the approve modal's (always empty) field
    // and the notes typed here were never sent.
    document.getElementById('rejectAdminNotes').value = '';
    showModal('rejectModal');
}

async function rejectReturn() {
    const rejectionReason = document.getElementById('rejectionReason').value.trim();
    const adminNotes = document.getElementById('rejectAdminNotes').value;

    if (rejectionReason.length < 10) {
        UIKit.toast('Rejection reason must be at least 10 characters', 'warning');
        document.getElementById('rejectionReason').focus();
        return;
    }

    try {
        const response = await fetch(`/api/auth/admin/returns/${currentReturnId}/reject`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rejectionReason, adminNotes })
        });

        if (response.ok) {
            UIKit.toast('Return request rejected successfully', 'success');
            hideModal('rejectModal');
            await loadReturnRequests();
        } else {
            UIKit.toast(`Failed to reject return request: ${await readErrorMessage(response, 'Unknown error')}`, 'error');
        }
    } catch (error) {
        console.error('Error rejecting return request:', error);
        UIKit.toast('Error rejecting return request', 'error');
    }
}

function openConfirmModal(id) {
    currentReturnId = id;
    document.getElementById('receivedCondition').value = '';
    document.getElementById('notes').value = '';
    showModal('confirmModal');
}

async function confirmReturn() {
    const receivedCondition = document.getElementById('receivedCondition').value;
    const notes = document.getElementById('notes').value;

    if (!receivedCondition) {
        UIKit.toast('Please select the received condition', 'warning');
        document.getElementById('receivedCondition').focus();
        return;
    }

    try {
        const response = await fetch(`/api/auth/admin/returns/${currentReturnId}/confirm`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ receivedCondition, notes })
        });

        if (response.ok) {
            UIKit.toast('Return confirmed successfully. Inventory has been restored.', 'success');
            hideModal('confirmModal');
            await loadReturnRequests();
        } else if (response.status === 409) {
            // Already confirmed (another tab or admin got there first). The
            // server did not restore inventory again; refresh the stale row.
            UIKit.toast(await readErrorMessage(response, 'This return has already been confirmed.'), 'warning');
            hideModal('confirmModal');
            await loadReturnRequests();
        } else {
            UIKit.toast(`Failed to confirm return: ${await readErrorMessage(response, 'Unknown error')}`, 'error');
        }
    } catch (error) {
        console.error('Error confirming return:', error);
        UIKit.toast('Error confirming return', 'error');
    }
}

async function updatePriority(id, button) {
    const current = allReturnRequests.find(item => item?._id === id);
    const currentPriority = String(current?.priority || 'medium').toLowerCase();
    const priority = await UIKit.prompt({
        title: 'Change priority',
        message: current?.userName ? `Return request from ${current.userName}.` : '',
        label: 'Priority',
        options: RETURN_PRIORITY_OPTIONS,
        defaultValue: currentPriority,
        confirmText: 'Save priority'
    });
    // Cancel (or picking the current value) is not an error.
    if (priority === null || priority === currentPriority) return;

    await UIKit.withBusy(button, async () => {
        try {
            const response = await fetch(`/api/auth/admin/returns/${id}/priority`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ priority })
            });

            if (response.ok) {
                UIKit.toast('Priority updated successfully', 'success');
                await loadReturnRequests();
            } else {
                UIKit.toast(`Failed to update priority: ${await readErrorMessage(response, 'Unknown error')}`, 'error');
            }
        } catch (error) {
            console.error('Error updating priority:', error);
            UIKit.toast('Error updating priority', 'error');
        }
    });
}

function logout() {
    localStorage.removeItem('token');
    if (typeof clearCachedAdminProfile === 'function') clearCachedAdminProfile();
    window.location.href = '/';
}

// Row and modal buttons are wired here instead of with onclick="" attributes:
// the server's Content-Security-Policy sets script-src-attr 'none', so inline
// handlers never ran and every action on this page was dead.
const RETURN_ROW_ACTIONS = {
    view: viewReturnRequest,
    approve: openApproveModal,
    reject: openRejectModal,
    confirm: openConfirmModal,
    priority: updatePriority
};

const RETURN_MODAL_SUBMITS = {
    approve: approveReturn,
    reject: rejectReturn,
    confirm: confirmReturn
};

document.addEventListener('click', event => {
    const rowButton = event.target.closest('[data-return-action]');
    if (rowButton) {
        RETURN_ROW_ACTIONS[rowButton.dataset.returnAction]?.(rowButton.dataset.id, rowButton);
        return;
    }
    const submitButton = event.target.closest('[data-return-submit]');
    const submit = submitButton && RETURN_MODAL_SUBMITS[submitButton.dataset.returnSubmit];
    // withBusy disables the button until the request settles, so a double
    // click can no longer send a second approve / reject / confirm. A second
    // confirm used to restore the returned items to inventory twice.
    if (submit) UIKit.withBusy(submitButton, submit, { busyText: 'Saving...' });
});

// Load return requests on page load
document.addEventListener('DOMContentLoaded', loadReturnRequests);
