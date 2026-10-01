let token = localStorage.getItem('token');
let currentFeedbackId = null;
let allFeedbacks = [];
let feedbackFilter = null;
let feedbackFilterInit = false;

// Guards against a second activation issuing a duplicate request while the first
// is still in flight. This page's own script owns its data, so the guard lives
// here rather than in the shell's dataset registry.
let feedbacksInFlight = null;

// Student-supplied text (names, subjects, messages) and admin responses are
// rendered into innerHTML below, so every interpolated value goes through this.
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const FEEDBACK_PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

async function fetchFeedbacks() {
    const response = await fetch('/api/auth/admin/feedback?limit=1000', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Failed to load feedback (${response.status})`);
    }

    const data = await response.json();
    return Array.isArray(data.feedbacks) ? data.feedbacks : [];
}

async function loadFeedbacks() {
    // Painted before the request is awaited, into this module's own table body.
    showLoading('feedbackTableBody', 'Loading feedback...');

    if (feedbacksInFlight) {
        try {
            await feedbacksInFlight;
        } catch (error) {
            console.error('Error loading feedback:', error);
        }
        return;
    }

    feedbacksInFlight = fetchFeedbacks();
    try {
        allFeedbacks = await feedbacksInFlight;
        const filterCreated = initFeedbackFilter();
        if (feedbackFilter) {
            feedbackFilter.refreshOptions();
            if (!filterCreated) feedbackFilter.apply();
        } else if (allFeedbacks.length) {
            renderFeedbackTable(allFeedbacks);
        } else {
            showEmpty('feedbackTableBody', 'No feedback yet.');
        }
    } catch (error) {
        showError('feedbackTableBody', error.message || 'Failed to load feedback');
        console.error('Error loading feedback:', error);
    } finally {
        feedbacksInFlight = null;
    }
}

function initFeedbackFilter() {
    if (feedbackFilterInit || typeof SmartFilter === 'undefined') return false;
    const container = document.getElementById('feedbackFilterContainer');
    if (!container) return false;
    feedbackFilter = SmartFilter.create(container, FEEDBACK_FILTER_CONFIG);
    feedbackFilterInit = true;
    return true;
}

const FEEDBACK_FILTER_CONFIG = {
    moduleId: 'feedback',
    search: {
        placeholder: 'Search feedback by student, subject, or message...',
        keys: ['userName', 'userEmail', 'subject', 'content']
    },
    fields: [
        {
            key: 'category',
            label: 'Category',
            options: () => buildCategoryFilterOptions(
                allFeedbacks.map(f => f?.category),
                ['module', 'uniform', 'books', 'general', 'service']
            )
        },
        {
            key: 'status',
            label: 'Status',
            options: () => distinctFrom(allFeedbacks, f => f?.status, ['Pending', 'Reviewed', 'Resolved', 'Closed'])
        },
        {
            key: 'rating',
            label: 'Rating',
            options: () => distinctFrom(allFeedbacks, f => (f?.rating ? String(f.rating) + '/5' : null))
        },
        { key: 'dateRange', label: 'Date', presets: true, getDate: f => getFirstValidDate(f?.createdAt) }
    ],
    getRows: () => allFeedbacks,
    filter: (rows, state) => {
        const category = String(state.values.category || '').toLowerCase();
        const status = String(state.values.status || '').toLowerCase();
        const rating = String(state.values.rating || '').replace(/\/5$/, '').toLowerCase();
        return rows.filter(feedback => {
            if (category && String(feedback?.category || '').toLowerCase() !== category) return false;
            if (status && String(feedback?.status || '').toLowerCase() !== status) return false;
            if (rating && String(feedback?.rating || '') !== rating) return false;
            return true;
        });
    },
    onRender: rows => renderFeedbackTable(rows),
    sorts: [
        {
            key: 'dateDesc',
            label: 'Date (newest first)',
            compare: (a, b) => (getFirstValidDate(b?.createdAt)?.getTime() || 0) - (getFirstValidDate(a?.createdAt)?.getTime() || 0)
        },
        {
            key: 'dateAsc',
            label: 'Date (oldest first)',
            compare: (a, b) => (getFirstValidDate(a?.createdAt)?.getTime() || 0) - (getFirstValidDate(b?.createdAt)?.getTime() || 0)
        },
        { key: 'student', label: 'Student (A-Z)', getValue: f => f?.userName }
    ],
    export: {
        fileName: 'feedback',
        columns: [
            { key: 'createdAt', label: 'Date' },
            { key: 'student', label: 'Student', getValue: f => f?.userName },
            { key: 'category', label: 'Category' },
            { key: 'rating', label: 'Rating' },
            { key: 'status', label: 'Status' },
            { key: 'message', label: 'Message', getValue: f => f?.subject || f?.content }
        ]
    }
};

function renderFeedbackTable(feedbacks) {
    const tbody = document.getElementById('feedbackTableBody');
    
    if (feedbacks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center empty-table-state table-empty-state">No feedback found for the selected filters.</td></tr>';
        return;
    }

    tbody.innerHTML = feedbacks.map(feedback => {
        const catBadge = window.SmartFilter ? SmartFilter.categoryBadge(feedback.category) : null;
        const id = escapeHtml(feedback._id);
        return `
        <tr>
            <td>
                <div class="student-name">${escapeHtml(feedback.userName || 'Unknown student')}</div>
                <small class="student-email">${escapeHtml(feedback.userEmail || 'No email provided')}</small>
            </td>
            <td>${catBadge ? `<span class="category-badge ${catBadge.className}">${catBadge.label}</span>` : `<span class="badge bg-info">${escapeHtml(feedback.category)}</span>`}</td>
            <td class="subject-cell">${escapeHtml(feedback.subject || 'No subject')}</td>
            <td>${feedback.rating ? '⭐'.repeat(feedback.rating) : 'N/A'}</td>
            <td><span class="badge ${getStatusBadgeClass(feedback.status)}">${escapeHtml(feedback.status)}</span></td>
            <td><span class="badge ${getPriorityBadgeClass(feedback.priority)}">${escapeHtml(feedback.priority)}</span></td>
            <td class="date-cell">${new Date(feedback.createdAt).toLocaleDateString()}</td>
            <td>
                <div class="table-actions">
                <button type="button" class="btn btn-sm btn-info" data-feedback-action="view" data-id="${id}">View</button>
                <button type="button" class="btn btn-sm btn-primary" data-feedback-action="respond" data-id="${id}">Respond</button>
                <button type="button" class="btn btn-sm btn-warning" data-feedback-action="status" data-id="${id}">Status</button>
                <button type="button" class="btn btn-sm btn-secondary" data-feedback-action="priority" data-id="${id}">Priority</button>
                </div>
            </td>
        </tr>
        `;
    }).join('');

    // Use a plain, consistently readable score instead of relying on a font glyph.
    tbody.querySelectorAll('tr').forEach((row, index) => {
        const ratingCell = row.cells[3];
        if (ratingCell) ratingCell.textContent = feedbacks[index].rating ? `${feedbacks[index].rating}/5` : '—';
    });
}

function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'bg-warning',
        'reviewed': 'bg-info',
        'resolved': 'bg-success',
        'closed': 'bg-secondary'
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

async function viewFeedback(id) {
    const cached = findFeedback(id);
    if (cached) {
        showFeedbackModal(cached);
        return;
    }

    try {
        const response = await fetch(`/api/auth/admin/feedback/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const feedback = await response.json();
            showFeedbackModal(feedback);
        } else {
            UIKit.toast('Failed to load feedback details', 'error');
        }
    } catch (error) {
        console.error('Error viewing feedback:', error);
        UIKit.toast('Failed to load feedback details', 'error');
    }
}

function findFeedback(id) {
    return Array.isArray(allFeedbacks)
        ? allFeedbacks.find(item => item?._id === id) || null
        : null;
}

function formatDateTime(raw) {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
}

// reviewedBy is stored as the reviewing admin's id and the API does not
// populate it, so the raw ObjectId used to be printed. Use a name when one is
// available: a populated reviewer, or the admin response written by that same
// admin. Otherwise leave the name out rather than show an id.
function getReviewerName(feedback) {
    const reviewer = feedback?.reviewedBy;
    if (reviewer && typeof reviewer === 'object' && reviewer.name) return String(reviewer.name);
    const reviewerId = String(reviewer?._id || reviewer || '');
    if (!reviewerId) return '';
    const responses = Array.isArray(feedback?.adminResponses) ? feedback.adminResponses : [];
    const match = responses.slice().reverse().find(response => String(response?.adminId || '') === reviewerId && response?.adminName);
    return match ? String(match.adminName) : '';
}

function showFeedbackModal(feedback) {
    const catBadge = window.SmartFilter ? SmartFilter.categoryBadge(feedback.category) : null;
    const modalBody = document.getElementById('feedbackModalBody');
    const reviewerName = getReviewerName(feedback);
    const reviewedAt = formatDateTime(feedback.reviewedAt);
    const reviewedLine = [reviewerName, reviewedAt].filter(Boolean).map(escapeHtml).join(' - ');
    modalBody.innerHTML = `
        <div class="mb-3">
            <strong>Student:</strong> ${escapeHtml(feedback.userName || 'Unknown student')} (${escapeHtml(feedback.userEmail || 'No email provided')})
        </div>
        <div class="mb-3">
            <strong>Category:</strong> ${catBadge ? `<span class="category-badge ${catBadge.className}">${catBadge.label}</span>` : escapeHtml(feedback.category)}
        </div>
        <div class="mb-3">
            <strong>Subject:</strong> ${escapeHtml(feedback.subject)}
        </div>
        <div class="mb-3">
            <strong>Content:</strong>
            <p>${escapeHtml(feedback.content)}</p>
        </div>
        <div class="mb-3">
            <strong>Rating:</strong> ${feedback.rating ? '⭐'.repeat(Number(feedback.rating) || 0) : 'N/A'}
        </div>
        <div class="mb-3">
            <strong>Status:</strong> <span class="badge ${getStatusBadgeClass(feedback.status)}">${escapeHtml(feedback.status)}</span>
        </div>
        <div class="mb-3">
            <strong>Priority:</strong> <span class="badge ${getPriorityBadgeClass(feedback.priority)}">${escapeHtml(feedback.priority)}</span>
        </div>
        <div class="mb-3">
            <strong>Submitted:</strong> ${escapeHtml(formatDateTime(feedback.createdAt) || 'N/A')}
        </div>
        ${feedback.adminResponses && feedback.adminResponses.length > 0 ? `
            <div class="mb-3">
                <strong>Admin Responses:</strong>
                ${feedback.adminResponses.map(response => `
                    <div class="card mt-2">
                        <div class="card-body">
                            <p class="mb-1"><strong>${escapeHtml(response.adminName || 'Admin')}</strong> - ${escapeHtml(formatDateTime(response.createdAt))}</p>
                            <p>${escapeHtml(response.content)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        ${feedback.reviewedBy && reviewedLine ? `
            <div class="mb-3">
                <strong>Reviewed:</strong> ${reviewerName ? 'by ' : ''}${reviewedLine}
            </div>
        ` : ''}
        ${feedback.resolutionNotes ? `
            <div class="mb-3">
                <strong>Resolution Notes:</strong>
                <p>${escapeHtml(feedback.resolutionNotes)}</p>
            </div>
        ` : ''}
    `;

    showModal('feedbackModal');
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

function openResponseModal(id) {
    currentFeedbackId = id;
    document.getElementById('responseContent').value = '';
    showModal('responseModal');
}

async function submitResponse() {
    const content = document.getElementById('responseContent').value.trim();

    if (content.length < 5) {
        UIKit.toast('Response must be at least 5 characters', 'warning');
        document.getElementById('responseContent').focus();
        return;
    }

    try {
        const response = await fetch(`/api/auth/admin/feedback/${currentFeedbackId}/response`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            UIKit.toast('Response added successfully', 'success');
            hideModal('responseModal');
            await loadFeedbacks();
        } else {
            UIKit.toast(`Failed to add response: ${await readErrorMessage(response, 'Unknown error')}`, 'error');
        }
    } catch (error) {
        console.error('Error adding response:', error);
        UIKit.toast('Error adding response', 'error');
    }
}

function openStatusModal(id) {
    currentFeedbackId = id;
    // Start from the feedback's current status. The select used to reset to
    // "reviewed" every time, so saving without looking changed the status.
    const currentStatus = String(findFeedback(id)?.status || 'pending').toLowerCase();
    const statusSelect = document.getElementById('newStatus');
    statusSelect.value = currentStatus;
    if (statusSelect.value !== currentStatus) statusSelect.value = 'pending';
    document.getElementById('resolutionNotes').value = '';
    showModal('statusModal');
}

async function updateStatus() {
    const status = document.getElementById('newStatus').value;
    const resolutionNotes = document.getElementById('resolutionNotes').value;

    try {
        const response = await fetch(`/api/auth/admin/feedback/${currentFeedbackId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, resolutionNotes })
        });

        if (response.ok) {
            UIKit.toast('Status updated successfully', 'success');
            hideModal('statusModal');
            await loadFeedbacks();
        } else {
            UIKit.toast(`Failed to update status: ${await readErrorMessage(response, 'Unknown error')}`, 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        UIKit.toast('Error updating status', 'error');
    }
}

async function updatePriority(id, button) {
    const current = findFeedback(id);
    const currentPriority = String(current?.priority || 'medium').toLowerCase();
    const priority = await UIKit.prompt({
        title: 'Change priority',
        message: current?.subject ? `Feedback: ${current.subject}` : '',
        label: 'Priority',
        options: FEEDBACK_PRIORITY_OPTIONS,
        defaultValue: currentPriority,
        confirmText: 'Save priority'
    });
    // Cancel (or picking the current value) is not an error.
    if (priority === null || priority === currentPriority) return;

    await UIKit.withBusy(button, async () => {
        try {
            const response = await fetch(`/api/auth/admin/feedback/${id}/priority`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ priority })
            });

            if (response.ok) {
                UIKit.toast('Priority updated successfully', 'success');
                await loadFeedbacks();
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
const FEEDBACK_ROW_ACTIONS = {
    view: viewFeedback,
    respond: openResponseModal,
    status: openStatusModal,
    priority: updatePriority
};

const FEEDBACK_MODAL_SUBMITS = {
    response: submitResponse,
    status: updateStatus
};

document.addEventListener('click', event => {
    const rowButton = event.target.closest('[data-feedback-action]');
    if (rowButton) {
        FEEDBACK_ROW_ACTIONS[rowButton.dataset.feedbackAction]?.(rowButton.dataset.id, rowButton);
        return;
    }
    const submitButton = event.target.closest('[data-feedback-submit]');
    const submit = submitButton && FEEDBACK_MODAL_SUBMITS[submitButton.dataset.feedbackSubmit];
    // withBusy disables the button until the request settles, so a double
    // click can no longer post the same response twice.
    if (submit) UIKit.withBusy(submitButton, submit, { busyText: 'Saving...' });
});

// Load feedback on page load
document.addEventListener('DOMContentLoaded', loadFeedbacks);
