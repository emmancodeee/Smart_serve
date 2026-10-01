const STUDENT_PROFILE_KEY = 'smartserve_student_profile';
let token = localStorage.getItem('token');
let currentReturnId = null;
let returnItems = [createItem()];
// Latest /api/auth/me payload and return list. Together they decide whether
// the student's registration can take a new return (see renderRegistrationOptions).
let currentStudent = null;
let studentReturns = null;

function createItem() {
    const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : 'row-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    return { id, type: '', name: '', condition: '', quantity: 1, notes: '' };
}

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Reason, details and admin notes pass through sanitize-html on the server,
// which stores them entity-encoded ("A & B" -> "A &amp; B"). Decode those
// entities before escaping so the text reads as typed instead of "&amp;".
function decodeStoredText(value) {
    return String(value == null ? '' : value)
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#0*39;|&apos;/g, "'")
        .replace(/&amp;/g, '&');
}

// Escaped text for innerHTML templates built from user or admin input.
function safeText(value) {
    return escapeHtml(decodeStoredText(value));
}

function cssEscape(value) {
    return typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(value)
        : String(value).replace(/["\\]/g, '\\$&');
}

document.addEventListener('DOMContentLoaded', () => {
    if (!String(token || '').trim()) {
        endSession();
        return;
    }
    startHeaderClock();
    setupLogout();
    initReturnForm();
    initReturnTableActions();
    initModalButtons();
    loadRegistrations();
    loadReturnHistory();
});

// Clears the session (token and the cached header profile) and returns to the
// sign-in page. Used for Logout and whenever the API rejects the token.
function endSession() {
    localStorage.removeItem('token');
    localStorage.removeItem(STUDENT_PROFILE_KEY);
    window.location.replace('/');
}

function isSessionRejected(response) {
    return response.status === 401 || response.status === 403;
}

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

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', endSession);
    }
}

// --- Modal Helpers ---
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('is-open');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('is-open');
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('student-modal-overlay')) {
        e.target.classList.remove('is-open');
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.student-modal-overlay.is-open').forEach(el => {
            el.classList.remove('is-open');
        });
    }
});

// The CSP blocks inline onclick attributes, so every modal button is bound here.
function initModalButtons() {
    document.getElementById('returnModalCloseBtn')?.addEventListener('click', () => closeModal('returnModal'));
    document.getElementById('returnModalFooterCloseBtn')?.addEventListener('click', () => closeModal('returnModal'));
    document.getElementById('feedbackModalCloseBtn')?.addEventListener('click', () => closeModal('feedbackModal'));
    document.getElementById('modalFeedbackCancelBtn')?.addEventListener('click', () => closeModal('feedbackModal'));
    const submitBtn = document.getElementById('modalFeedbackSubmitBtn');
    submitBtn?.addEventListener('click', () => submitFeedback(submitBtn));
}

// Row buttons are re-rendered on every load, so they are handled by one
// delegated listener keyed on data-return-action.
function initReturnTableActions() {
    const tbody = document.getElementById('returnTableBody');
    if (!tbody) return;

    tbody.addEventListener('click', event => {
        const retryBtn = event.target.closest('[data-return-retry]');
        if (retryBtn) {
            renderTableMessage('Loading return requests...', 'table-loading-state');
            loadReturnHistory();
            return;
        }

        const btn = event.target.closest('button[data-return-action]');
        if (!btn || !btn.dataset.id) return;
        const id = btn.dataset.id;
        if (btn.dataset.returnAction === 'view') viewReturnRequest(id, btn);
        else if (btn.dataset.returnAction === 'cancel') cancelReturnRequest(id, btn);
        else if (btn.dataset.returnAction === 'feedback') openFeedbackModal(id);
    });
}

function getDisplayName(user) {
    const fullName = String(user?.fullname || '').trim();
    if (fullName) return fullName;
    const name = String(user?.name || '').trim();
    if (name) return name;
    return 'Student';
}

function getFirstName(user) {
    const firstName = String(user?.firstName || '').trim();
    if (firstName) return firstName;
    const fullName = String(user?.fullname || '').trim();
    if (fullName) return fullName.split(/\s+/)[0] || '';
    const name = String(user?.name || '').trim();
    if (name) return name.split(/\s+/)[0] || '';
    return '';
}

function renderHeaderProfile(user) {
    const avatarEl = document.getElementById('studentAvatar');
    const nameEl = document.getElementById('studentProfileName');
    const displayName = getDisplayName(user);
    if (nameEl) nameEl.textContent = displayName;
    if (avatarEl) avatarEl.textContent = String(displayName).charAt(0).toUpperCase();
}

function renderStudentHeader(userData) {
    const greetingEl = document.getElementById('returnsWelcomeText');
    if (greetingEl) {
        const firstName = getFirstName(userData);
        greetingEl.textContent = firstName ? `Welcome, ${firstName}` : 'Welcome';
    }
    renderHeaderProfile(userData);
}

async function loadRegistrations() {
    const cached = StudentHeader.getCachedStudentProfile();
    if (cached) StudentHeader.applyStudentHeader(cached);

    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (isSessionRejected(response)) {
            endSession();
            return;
        }

        if (response.ok) {
            const userData = await response.json();
            StudentHeader.cacheStudentProfile(userData);
            StudentHeader.applyStudentHeader(userData);
            currentStudent = userData;
            renderRegistrationOptions();
        } else {
            setRegistrationHint('Your registration could not be loaded. Refresh the page to try again.', 'error');
        }
    } catch (error) {
        console.error('Error loading registrations:', error);
        setRegistrationHint('Your registration could not be loaded. Check your connection and refresh the page.', 'error');
    }
}

// A registration can take a new return only when it is approved and has no
// pending/approved return yet: the same rules createReturnRequest enforces.
// Checking them here lets the form explain why instead of failing on submit.
// /api/auth/me carries the registration status (user.status mirrors it) but
// not hasActiveReturnRequest, so the active return comes from the return list.
function getRegistrationEligibility() {
    if (!currentStudent?.registrationId) {
        return {
            ok: false,
            short: 'none on file',
            message: 'You have no registration on file yet. Submit one from the Request page first.'
        };
    }

    const status = String(currentStudent.status || '').toLowerCase();
    if (status !== 'approved') {
        const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not approved';
        return {
            ok: false,
            short: 'not approved',
            message: `Returns open once your registration is approved. Current status: ${label}.`
        };
    }

    const registrationId = String(currentStudent.registrationId);
    const activeReturn = (studentReturns || []).find(entry =>
        ['pending', 'approved'].includes(String(entry?.status || '').toLowerCase())
        && String(entry?.registrationId?._id || entry?.registrationId || '') === registrationId
    );
    if (activeReturn) {
        return {
            ok: false,
            short: `${activeReturn.status} return exists`,
            message: `This registration already has a ${activeReturn.status} return request. Cancel it or wait until it is completed before requesting another.`
        };
    }

    return { ok: true, short: '', message: '' };
}

function setRegistrationHint(text, tone = 'info') {
    const hint = document.getElementById('registrationHint');
    if (!hint) return;
    hint.textContent = text || '';
    hint.hidden = !text;
    hint.dataset.tone = tone;
}

function renderRegistrationOptions() {
    const select = document.getElementById('registrationId');
    if (!select || !currentStudent) return;

    const previousValue = select.value;
    const eligibility = getRegistrationEligibility();
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = currentStudent.registrationId ? 'Select Registration' : 'No registration on file';
    select.appendChild(placeholder);

    if (currentStudent.registrationId) {
        const option = document.createElement('option');
        option.value = currentStudent.registrationId;
        option.textContent = `${decodeStoredText(currentStudent.course) || 'Course'} - ${decodeStoredText(currentStudent.module) || 'Module'}`;
        if (!eligibility.ok) {
            // Kept visible but disabled so the student sees which registration
            // is blocked; the hint below the select says why.
            option.disabled = true;
            option.textContent += ` (${eligibility.short})`;
        }
        select.appendChild(option);
        if (eligibility.ok && previousValue === option.value) select.value = option.value;
    }

    setRegistrationHint(eligibility.message, 'warning');
}

async function loadReturnHistory() {
    try {
        const response = await fetch('/api/auth/returns', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (isSessionRejected(response)) {
            endSession();
            return;
        }

        if (response.ok) {
            const returnRequests = await response.json();
            studentReturns = Array.isArray(returnRequests) ? returnRequests : [];
            renderReturnTable(studentReturns);
            renderRegistrationOptions();
        } else {
            console.error('Failed to load return history');
            renderTableError();
        }
    } catch (error) {
        console.error('Error loading return requests:', error);
        renderTableError();
    }
}

function renderTableMessage(text, className) {
    const tbody = document.getElementById('returnTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="${className}">${escapeHtml(text)}</td></tr>`;
}

function renderTableError() {
    const tbody = document.getElementById('returnTableBody');
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="table-empty-state">
                Your return requests could not be loaded.
                <button type="button" class="student-btn student-btn-sm student-btn-secondary table-retry-btn" data-return-retry>Try again</button>
            </td>
        </tr>
    `;
}

function renderReturnTable(returnRequests) {
    const tbody = document.getElementById('returnTableBody');

    if (returnRequests.length === 0) {
        renderTableMessage('No return requests submitted yet', 'table-empty-state');
        return;
    }

    tbody.innerHTML = returnRequests.map(returnRequest => {
        const id = escapeHtml(returnRequest._id);
        const items = (returnRequest.items || []).map(item => `${safeText(item.type)}: ${safeText(item.name)}`).join(', ');
        return `
        <tr>
            <td>${items}</td>
            <td>${escapeHtml(new Date(returnRequest.requestedReturnDate).toLocaleDateString())}</td>
            <td><span class="student-badge ${getReturnStatusBadgeClass(returnRequest.status)}">${escapeHtml(returnRequest.status)}</span></td>
            <td><span class="student-badge ${getPriorityBadgeClass(returnRequest.priority)}">${escapeHtml(returnRequest.priority)}</span></td>
            <td>
                <div class="return-row-actions">
                    <button type="button" class="student-btn student-btn-sm student-btn-info" data-return-action="view" data-id="${id}">View</button>
                    ${returnRequest.status === 'pending' ? `
                        <button type="button" class="student-btn student-btn-sm student-btn-warning" data-return-action="cancel" data-id="${id}">Cancel</button>
                    ` : ''}
                    ${returnRequest.status === 'completed' && !returnRequest.studentFeedback?.rating ? `
                        <button type="button" class="student-btn student-btn-sm student-btn-success" data-return-action="feedback" data-id="${id}">Feedback</button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function getReturnStatusBadgeClass(status) {
    const classes = {
        'pending': 'student-badge-pending',
        'approved': 'student-badge-approved',
        'rejected': 'student-badge-rejected',
        'completed': 'student-badge-completed',
        'cancelled': 'student-badge-cancelled'
    };
    return classes[status] || 'student-badge-default';
}

function getPriorityBadgeClass(priority) {
    const classes = {
        'low': 'student-badge-low',
        'medium': 'student-badge-medium',
        'high': 'student-badge-high',
        'urgent': 'student-badge-urgent'
    };
    return classes[priority] || 'student-badge-default';
}

function renderItems() {
    const container = document.getElementById('itemsContainer');
    if (!container) return;

    if (returnItems.length === 0) {
        container.innerHTML = '<p class="item-empty-state">No items yet. Click &quot;+ Add Another Item&quot; to add the first item.</p>';
    } else {
        container.innerHTML = returnItems.map(item => `
            <div class="student-item-row" data-item-id="${escapeHtml(item.id)}">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="text-xs font-semibold text-[#5a6f8d]">Type *</label>
                        <select class="student-form-select text-sm mt-1 item-type" data-field="type" required>
                            <option value="">Select Type</option>
                            <option value="module" ${item.type === 'module' ? 'selected' : ''}>Modules</option>
                            <option value="uniform" ${item.type === 'uniform' ? 'selected' : ''}>Uniforms</option>
                            <option value="books" ${item.type === 'books' ? 'selected' : ''}>Books</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-[#5a6f8d]">Name *</label>
                        <input type="text" class="student-form-input text-sm mt-1 item-name" data-field="name" required placeholder="Item name" value="${escapeHtml(item.name)}">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-[#5a6f8d]">Condition *</label>
                        <select class="student-form-select text-sm mt-1 item-condition" data-field="condition" required>
                            <option value="">Condition</option>
                            <option value="excellent" ${item.condition === 'excellent' ? 'selected' : ''}>Excellent</option>
                            <option value="good" ${item.condition === 'good' ? 'selected' : ''}>Good</option>
                            <option value="fair" ${item.condition === 'fair' ? 'selected' : ''}>Fair</option>
                            <option value="poor" ${item.condition === 'poor' ? 'selected' : ''}>Poor</option>
                            <option value="damaged" ${item.condition === 'damaged' ? 'selected' : ''}>Damaged</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-[#5a6f8d]">Quantity</label>
                        <input type="number" class="student-form-input text-sm mt-1 item-quantity" data-field="quantity" value="${Number.isFinite(item.quantity) ? item.quantity : 1}" min="1">
                    </div>
                    <div>
                        <label class="text-xs font-semibold text-[#5a6f8d]">Notes</label>
                        <input type="text" class="student-form-input text-sm mt-1 item-notes" data-field="notes" placeholder="Additional notes about this item" value="${escapeHtml(item.notes)}">
                    </div>
                    <div class="return-remove-cell">
                        <button type="button" class="student-btn student-btn-sm student-btn-danger w-full" data-action="remove" data-item-id="${escapeHtml(item.id)}">Remove</button>
                    </div>
                </div>
                <p class="item-field-error hidden" data-error-for="${escapeHtml(item.id)}"></p>
            </div>
        `).join('');
    }

    const hint = document.getElementById('itemsHint');
    if (hint) {
        hint.hidden = returnItems.length > 0;
        if (returnItems.length === 0) hint.textContent = 'At least one item is required. Use &quot;+ Add Another Item&quot; to add one.';
    }
}

function initItemsInteractions() {
    const container = document.getElementById('itemsContainer');
    if (!container) return;

    container.addEventListener('click', event => {
        const btn = event.target.closest('button[data-action="remove"]');
        if (!btn) return;
        event.preventDefault();
        removeItemById(btn.getAttribute('data-item-id'));
    });

    container.addEventListener('input', event => syncItemField(event.target));
    container.addEventListener('change', event => syncItemField(event.target));
}

function syncItemField(field) {
    if (!field || !field.dataset || !field.dataset.field) return;
    const row = field.closest('.student-item-row');
    if (!row) return;
    const item = returnItems.find(entry => entry.id === row.dataset.itemId);
    if (!item) return;

    if (field.dataset.field === 'quantity') {
        const parsed = parseInt(field.value, 10);
        item.quantity = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
        field.value = item.quantity;
    } else {
        item[field.dataset.field] = field.value;
    }
    clearItemError(row.dataset.itemId);
}

function removeItemById(id) {
    returnItems = returnItems.filter(entry => entry.id !== id);
    renderItems();
}

function addItemRow() {
    returnItems.push(createItem());
    renderItems();

    const rows = document.querySelectorAll('#itemsContainer .student-item-row');
    const lastRow = rows[rows.length - 1];
    const firstField = lastRow && lastRow.querySelector('[data-field="type"]');

    if (lastRow) lastRow.classList.add('is-new');
    if (lastRow && typeof lastRow.scrollIntoView === 'function') {
        lastRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (firstField && typeof firstField.focus === 'function') firstField.focus();
}

function clearMinHint() {
    const hint = document.getElementById('itemsHint');
    if (hint) hint.hidden = true;
}

function clearItemErrors() {
    document.querySelectorAll('.item-field-error').forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
}

function clearItemError(id) {
    const el = document.querySelector(`#itemsContainer .item-field-error[data-error-for="${cssEscape(id)}"]`);
    if (el) {
        el.textContent = '';
        el.classList.add('hidden');
    }
}

function validateItems() {
    const items = [];
    const errors = [];

    returnItems.forEach(item => {
        const messages = [];
        if (!String(item.type || '').trim()) messages.push('Please select an item.');
        if (!String(item.name || '').trim()) messages.push('Item name is required.');
        if (!String(item.condition || '').trim()) messages.push('Condition is required.');
        const qty = Number(item.quantity);
        if (!Number.isFinite(qty) || qty < 1) messages.push('Quantity must be at least 1.');

        if (messages.length) {
            errors.push({ id: item.id, messages });
        } else {
            items.push({ type: item.type, name: item.name, condition: item.condition, quantity: qty, notes: String(item.notes || '') });
        }
    });

    return { items, errors };
}

function renderItemErrors(errors) {
    clearItemErrors();
    let firstInvalidField = null;

    errors.forEach(err => {
        const row = document.querySelector(`#itemsContainer .student-item-row[data-item-id="${cssEscape(err.id)}"]`);
        if (!row) return;
        const el = row.querySelector('.item-field-error');
        if (el) {
            el.textContent = err.messages.join(' ');
            el.classList.remove('hidden');
        }
        if (!firstInvalidField) firstInvalidField = row.querySelector('[data-field]');
    });

    if (firstInvalidField && typeof firstInvalidField.focus === 'function') firstInvalidField.focus();
}

function hasEnteredData() {
    if (returnItems.some(entry => {
        const rowHasValue = String(entry.type || '').trim()
            || String(entry.name || '').trim()
            || String(entry.condition || '').trim()
            || String(entry.notes || '').trim();
        return Boolean(rowHasValue) || Number(entry.quantity) !== 1;
    })) return true;

    return ['registrationId', 'reason', 'details', 'requestedReturnDate']
        .some(id => String((document.getElementById(id) || {}).value || '').trim() !== '')
        || document.getElementById('priority')?.value === 'high'
        || document.getElementById('priority')?.value === 'urgent'
        || document.getElementById('priority')?.value === 'low';
}

function resetReturnDraft() {
    returnItems = [createItem()];
    renderItems();
    const form = document.getElementById('returnForm');
    if (form) form.reset();
    clearItemErrors();
    clearMinHint();
}

function performCancel() {
    resetReturnDraft();
    loadReturnHistory();
    const panel = document.getElementById('returnHistoryPanel');
    if (panel && typeof panel.scrollIntoView === 'function') {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function onCancelClick() {
    if (hasEnteredData()) {
        openModal('cancelReturnModal');
    } else {
        performCancel();
    }
}

function initReturnForm() {
    renderItems();
    initItemsInteractions();
    document.getElementById('addItemBtn')?.addEventListener('click', addItemRow);
    document.getElementById('cancelBtn')?.addEventListener('click', onCancelClick);
    document.getElementById('cancelContinueBtn')?.addEventListener('click', () => closeModal('cancelReturnModal'));
    document.getElementById('cancelConfirmBtn')?.addEventListener('click', () => {
        closeModal('cancelReturnModal');
        performCancel();
    });
    document.getElementById('cancelModalCloseBtn')?.addEventListener('click', () => closeModal('cancelReturnModal'));
}

document.getElementById('returnForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const { items, errors } = validateItems();

    if (errors.length) {
        renderItemErrors(errors);
        return;
    }

    if (items.length === 0) {
        const hint = document.getElementById('itemsHint');
        if (hint) {
            hint.hidden = false;
            hint.textContent = 'Add at least one item before submitting.';
        }
        const addBtn = document.getElementById('addItemBtn');
        if (addBtn && typeof addBtn.focus === 'function') addBtn.focus();
        return;
    }

    const data = {
        registrationId: document.getElementById('registrationId').value,
        items: items,
        reason: document.getElementById('reason').value,
        details: document.getElementById('details').value,
        requestedReturnDate: document.getElementById('requestedReturnDate').value,
        priority: document.getElementById('priority').value
    };

    if (!data.registrationId) {
        // When the only registration is blocked, say why rather than asking
        // the student to pick an option they cannot select.
        const eligibility = currentStudent ? getRegistrationEligibility() : { ok: true };
        UIKit.toast(eligibility.ok ? 'Please select a registration to return an item' : eligibility.message, 'warning');
        document.getElementById('registrationId')?.focus();
        return;
    }
    if (String(data.reason || '').trim().length < 10) {
        UIKit.toast('Reason for return must be at least 10 characters', 'warning');
        document.getElementById('reason')?.focus();
        return;
    }
    if (!data.requestedReturnDate) {
        UIKit.toast('Preferred return date is required', 'warning');
        document.getElementById('requestedReturnDate')?.focus();
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    await UIKit.withBusy(submitBtn, async () => {
        try {
            const response = await fetch('/api/auth/returns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.status === 401) {
                endSession();
                return;
            }

            if (response.ok) {
                UIKit.toast('Return request submitted successfully', 'success');
                resetReturnDraft();
                loadReturnHistory();
                loadRegistrations(); // Reload to update available registrations
            } else {
                const error = await response.json().catch(() => ({}));
                UIKit.toast('Failed to submit return request: ' + (error.error || `status ${response.status}`), 'error');
            }
        } catch (error) {
            console.error('Error submitting return request:', error);
            UIKit.toast('Error submitting return request. Check your connection and try again.', 'error');
        }
    }, { busyText: 'Submitting…' });
});

async function viewReturnRequest(id, button) {
    await UIKit.withBusy(button, async () => {
        try {
            const response = await fetch(`/api/auth/returns/${encodeURIComponent(id)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                endSession();
                return;
            }

            if (response.ok) {
                const returnRequest = await response.json();
                showReturnModal(returnRequest);
            } else {
                UIKit.toast('Failed to load return request details', 'error');
            }
        } catch (error) {
            console.error('Error viewing return request:', error);
            UIKit.toast('Could not load the return request. Check your connection and try again.', 'error');
        }
    });
}

function renderRating(rating) {
    const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return '⭐'.repeat(value);
}

function showReturnModal(returnRequest) {
    const modalBody = document.getElementById('returnModalBody');
    modalBody.innerHTML = `
        <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
                <span class="student-badge ${getReturnStatusBadgeClass(returnRequest.status)}">${escapeHtml(returnRequest.status)}</span>
                <span class="student-badge ${getPriorityBadgeClass(returnRequest.priority)}">${escapeHtml(returnRequest.priority)}</span>
            </div>
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Registration:</strong>
                <p class="mt-1 text-sm text-slate-700">${safeText(returnRequest.registrationId?.module || 'N/A')} - ${safeText(returnRequest.registrationId?.course || 'N/A')}</p>
            </div>
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Items:</strong>
                <ul class="mt-1 space-y-1">
                    ${(returnRequest.items || []).map(item => `
                        <li class="text-sm text-slate-700">• ${safeText(item.type)}: ${safeText(item.name)} (${safeText(item.condition)}) x${escapeHtml(item.quantity)}</li>
                    `).join('')}
                </ul>
            </div>
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Reason:</strong>
                <p class="mt-1 text-sm text-slate-700">${safeText(returnRequest.reason)}</p>
            </div>
            ${returnRequest.details ? `
                <div>
                    <strong class="text-sm font-bold text-[#10284d]">Details:</strong>
                    <p class="mt-1 text-sm text-slate-700">${safeText(returnRequest.details)}</p>
                </div>
            ` : ''}
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Requested Return Date:</strong>
                <p class="mt-1 text-sm text-slate-700">${escapeHtml(new Date(returnRequest.requestedReturnDate).toLocaleDateString())}</p>
            </div>
            ${returnRequest.actualReturnDate ? `
                <div>
                    <strong class="text-sm font-bold text-[#10284d]">Actual Return Date:</strong>
                    <p class="mt-1 text-sm text-slate-700">${escapeHtml(new Date(returnRequest.actualReturnDate).toLocaleString())}</p>
                </div>
            ` : ''}
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Submitted:</strong>
                <p class="mt-1 text-sm text-slate-700">${escapeHtml(new Date(returnRequest.createdAt).toLocaleString())}</p>
            </div>
            ${returnRequest.adminDecision?.adminNotes ? `
                <div>
                    <strong class="text-sm font-bold text-[#10284d]">Admin Notes:</strong>
                    <p class="mt-1 text-sm text-slate-700">${safeText(returnRequest.adminDecision.adminNotes)}</p>
                </div>
            ` : ''}
            ${returnRequest.adminDecision?.rejectionReason ? `
                <div>
                    <strong class="text-sm font-bold text-[#10284d]">Rejection Reason:</strong>
                    <p class="mt-1 text-sm text-red-700">${safeText(returnRequest.adminDecision.rejectionReason)}</p>
                </div>
            ` : ''}
            ${returnRequest.returnConfirmation?.receivedCondition ? `
                <div>
                    <strong class="text-sm font-bold text-[#10284d]">Received Condition:</strong>
                    <p class="mt-1 text-sm text-slate-700">${safeText(returnRequest.returnConfirmation.receivedCondition)}</p>
                </div>
            ` : ''}
            ${returnRequest.returnConfirmation?.notes ? `
                <div>
                    <strong class="text-sm font-bold text-[#10284d]">Return Notes:</strong>
                    <p class="mt-1 text-sm text-slate-700">${safeText(returnRequest.returnConfirmation.notes)}</p>
                </div>
            ` : ''}
            ${returnRequest.studentFeedback?.rating ? `
                <div>
                    <strong class="text-sm font-bold text-[#10284d]">Your Feedback:</strong>
                    <p class="mt-1 text-sm text-slate-700">${renderRating(returnRequest.studentFeedback.rating)}${returnRequest.studentFeedback.comments ? ` - ${safeText(returnRequest.studentFeedback.comments)}` : ''}</p>
                </div>
            ` : ''}
        </div>
    `;
    openModal('returnModal');
}

async function cancelReturnRequest(id, button) {
    const confirmed = await UIKit.confirm({
        title: 'Cancel this return request?',
        message: 'The request will be withdrawn and the admin will no longer process it. You can submit a new return for this registration afterwards.',
        confirmText: 'Cancel Request',
        cancelText: 'Keep Request',
        tone: 'danger'
    });
    if (!confirmed) return;

    await UIKit.withBusy(button, async () => {
        try {
            const response = await fetch(`/api/auth/returns/${encodeURIComponent(id)}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                endSession();
                return;
            }

            if (response.ok) {
                UIKit.toast('Return request cancelled successfully', 'success');
                loadReturnHistory();
                loadRegistrations(); // Reload to update available registrations
            } else {
                const error = await response.json().catch(() => ({}));
                UIKit.toast('Failed to cancel return request' + (error.error ? `: ${error.error}` : ''), 'error');
            }
        } catch (error) {
            console.error('Error cancelling return request:', error);
            UIKit.toast('Error cancelling return request. Check your connection and try again.', 'error');
        }
    }, { busyText: 'Cancelling…' });
}

function openFeedbackModal(id) {
    currentReturnId = id;
    document.getElementById('feedbackForm').reset();
    openModal('feedbackModal');
}

async function submitFeedback(button) {
    const rating = document.querySelector('#feedbackForm input[name="rating"]:checked')?.value;
    const comments = document.getElementById('comments').value.trim();

    if (!rating) {
        UIKit.toast('Please select a rating', 'warning');
        return;
    }
    // Mirrors addStudentFeedback, which rejects comments shorter than 5 characters.
    if (comments && comments.length < 5) {
        UIKit.toast('Comments must be at least 5 characters, or leave them empty', 'warning');
        document.getElementById('comments')?.focus();
        return;
    }

    const data = {
        rating: parseInt(rating, 10),
        comments: comments
    };

    await UIKit.withBusy(button, async () => {
        try {
            const response = await fetch(`/api/auth/returns/${encodeURIComponent(currentReturnId)}/feedback`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.status === 401) {
                endSession();
                return;
            }

            if (response.ok) {
                UIKit.toast('Feedback submitted successfully', 'success');
                closeModal('feedbackModal');
                loadReturnHistory();
            } else {
                const error = await response.json().catch(() => ({}));
                UIKit.toast('Failed to submit feedback: ' + (error.error || `status ${response.status}`), 'error');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            UIKit.toast('Error submitting feedback. Check your connection and try again.', 'error');
        }
    }, { busyText: 'Submitting…' });
}

function logout() {
    endSession();
}

// Set minimum date to today. Built from local date parts: toISOString() is UTC,
// which is still "yesterday" before 08:00 in the Philippines (UTC+8).
const todayDate = new Date();
const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
const dateInput = document.getElementById('requestedReturnDate');
if (dateInput) dateInput.setAttribute('min', today);
