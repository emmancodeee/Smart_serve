const STUDENT_PROFILE_KEY = 'smartserve_student_profile';
let token = localStorage.getItem('token');
// Last list response; the View action reads admin replies from it.
let feedbackList = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!String(token || '').trim()) {
        endSession();
        return;
    }
    startHeaderClock();
    setupLogout();
    loadFeedbackHistory();
    loadHeaderUser();
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

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Subject, content and admin replies pass through sanitize-html on the server,
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

function renderRating(rating) {
    const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return value ? '⭐'.repeat(value) : 'N/A';
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

async function loadHeaderUser() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const cached = StudentHeader.getCachedStudentProfile();
    if (cached) StudentHeader.applyStudentHeader(cached);

    try {
        const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        });
        if (isSessionRejected(response)) {
            endSession();
            return;
        }
        if (!response.ok) return;

        const currentUser = await response.json().catch(() => null);
        if (!currentUser) return;

        StudentHeader.cacheStudentProfile(currentUser);
        StudentHeader.applyStudentHeader(currentUser);
    } catch (_) {
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

// CSP-safe delegated click handling for My Feedback row actions (no inline onclick)
document.getElementById('feedbackTableBody')?.addEventListener('click', function(e) {
    if (e.target.closest('[data-feedback-retry]')) {
        renderTableMessage('Loading feedback...', 'table-loading-state');
        loadFeedbackHistory();
        return;
    }
    const btn = e.target.closest('button[data-action]');
    if (!btn || !btn.dataset.id) return;
    if (btn.dataset.action === 'view') {
        viewFeedback(btn.dataset.id, btn);
    } else if (btn.dataset.action === 'edit') {
        editFeedback(btn.dataset.id, btn);
    } else if (btn.dataset.action === 'archive') {
        openArchiveConfirm(btn.dataset.id);
    }
});

// Bind header/modal controls (CSP-safe: inline onclick attributes are blocked by the policy)
document.getElementById('cancelBtn')?.addEventListener('click', () => {
    // Cancel stays on the current page: no navigation.
    resetForm();
});
document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('feedbackModal'));
document.getElementById('closeModalFooterBtn')?.addEventListener('click', () => closeModal('feedbackModal'));

// Archive confirmation modal: track pending feedback id
let pendingArchiveId = null;

function openArchiveConfirm(id) {
    pendingArchiveId = id;
    openModal('archiveConfirmModal');
}

function closeArchiveConfirm() {
    pendingArchiveId = null;
    closeModal('archiveConfirmModal');
}

document.getElementById('closeArchiveModalBtn')?.addEventListener('click', closeArchiveConfirm);
document.getElementById('cancelArchiveBtn')?.addEventListener('click', closeArchiveConfirm);
document.getElementById('confirmArchiveBtn')?.addEventListener('click', event => {
    if (pendingArchiveId) {
        archiveFeedback(pendingArchiveId, event.currentTarget);
    }
});

async function loadFeedbackHistory() {
    try {
        const response = await fetch('/api/auth/feedback', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (isSessionRejected(response)) {
            endSession();
            return;
        }

        if (response.ok) {
            const feedbacks = await response.json();
            feedbackList = Array.isArray(feedbacks) ? feedbacks : [];
            renderFeedbackTable(feedbackList);
        } else {
            console.error('Failed to load feedback history');
            renderTableError();
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
        renderTableError();
    }
}

function renderTableMessage(text, className) {
    const tbody = document.getElementById('feedbackTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" class="${className}">${escapeHtml(text)}</td></tr>`;
}

function renderTableError() {
    const tbody = document.getElementById('feedbackTableBody');
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="table-empty-state">
                Your feedback could not be loaded.
                <button type="button" class="student-btn student-btn-sm student-btn-secondary table-retry-btn" data-feedback-retry>Try again</button>
            </td>
        </tr>
    `;
}

function renderFeedbackTable(feedbacks) {
    const tbody = document.getElementById('feedbackTableBody');
    
    if (feedbacks.length === 0) {
        renderTableMessage('No feedback submitted yet', 'table-empty-state');
        return;
    }

    tbody.innerHTML = feedbacks.map(feedback => {
        const id = escapeHtml(feedback._id);
        const replyCount = Array.isArray(feedback.adminResponses) ? feedback.adminResponses.length : 0;
        return `
        <tr>
            <td>${safeText(feedback.subject)}</td>
            <td><span class="student-badge student-badge-default">${escapeHtml(feedback.category)}</span></td>
            <td><span class="student-badge ${getStatusBadgeClass(feedback.status)}">${escapeHtml(feedback.status)}</span></td>
            <td>${renderRating(feedback.rating)}</td>
            <td>${escapeHtml(new Date(feedback.createdAt).toLocaleDateString())}</td>
            <td>
                <div class="flex justify-center gap-2">
                    <button type="button" class="student-btn student-btn-sm student-btn-secondary" data-action="view" data-id="${id}" aria-label="View feedback details${replyCount ? ` and ${replyCount} admin ${replyCount === 1 ? 'reply' : 'replies'}` : ''}">View${replyCount ? ` <span class="feedback-reply-count">${replyCount}</span>` : ''}</button>
                    <button type="button" class="student-btn student-btn-sm student-btn-warning" data-action="edit" data-id="${id}">Edit</button>
                    <button type="button" class="student-btn student-btn-sm student-btn-info" data-action="archive" data-id="${id}">Archive</button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'student-badge-pending',
        'reviewed': 'student-badge-reviewed',
        'resolved': 'student-badge-resolved',
        'closed': 'student-badge-closed'
    };
    return classes[status] || 'student-badge-default';
}

// The list response already carries adminResponses, so the details modal opens
// from it; the single-item endpoint is only a fallback for a stale list.
async function viewFeedback(id, button) {
    const cached = feedbackList.find(entry => String(entry._id) === String(id));
    if (cached) {
        showFeedbackModal(cached);
        return;
    }

    await UIKit.withBusy(button, async () => {
        try {
            const response = await fetch(`/api/auth/feedback/${encodeURIComponent(id)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                endSession();
                return;
            }

            if (response.ok) {
                const feedback = await response.json();
                showFeedbackModal(feedback);
            } else {
                UIKit.toast('Failed to load feedback details', 'error');
            }
        } catch (error) {
            console.error('Error viewing feedback:', error);
            UIKit.toast('Could not load the feedback. Check your connection and try again.', 'error');
        }
    });
}

function showFeedbackModal(feedback) {
    const modalBody = document.getElementById('feedbackModalBody');
    modalBody.innerHTML = `
        <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
                <span class="student-badge ${getStatusBadgeClass(feedback.status)}">${escapeHtml(feedback.status)}</span>
                <span class="student-badge student-badge-default">${escapeHtml(feedback.category)}</span>
            </div>
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Subject:</strong>
                <p class="mt-1 text-sm text-slate-700">${safeText(feedback.subject)}</p>
            </div>
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Content:</strong>
                <p class="mt-1 text-sm text-slate-700 feedback-multiline">${safeText(feedback.content)}</p>
            </div>
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Rating:</strong>
                <p class="mt-1 text-sm text-slate-700">${renderRating(feedback.rating)}</p>
            </div>
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Priority:</strong>
                <p class="mt-1 text-sm text-slate-700">${escapeHtml(feedback.priority)}</p>
            </div>
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Submitted:</strong>
                <p class="mt-1 text-sm text-slate-700">${escapeHtml(new Date(feedback.createdAt).toLocaleString())}</p>
            </div>
            <div>
                <strong class="text-sm font-bold text-[#10284d]">Admin Responses:</strong>
                ${feedback.adminResponses && feedback.adminResponses.length > 0 ? `
                    <div class="mt-2 space-y-2">
                        ${feedback.adminResponses.map(response => `
                            <div class="p-3 border border-[#d9e6fb] rounded-xl bg-[#f8fbff]">
                                <p class="text-xs font-bold text-[#10284d]">${safeText(response.adminName || 'Admin')} - ${escapeHtml(new Date(response.createdAt).toLocaleString())}</p>
                                <p class="mt-1 text-sm text-slate-700 feedback-multiline">${safeText(response.content)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="mt-1 text-sm text-slate-500">No replies from the admin yet.</p>'}
            </div>
            ${feedback.resolutionNotes ? `
                <div>
                    <strong class="text-sm font-bold text-[#10284d]">Resolution Notes:</strong>
                    <p class="mt-1 text-sm text-slate-700 feedback-multiline">${safeText(feedback.resolutionNotes)}</p>
                </div>
            ` : ''}
        </div>
    `;
    openModal('feedbackModal');
}

// The update endpoint (feedbackService.updateFeedback) only saves content and
// rating, so the other fields are locked while editing instead of letting the
// student change values that would be silently discarded.
const EDIT_LOCKED_FIELDS = ['category', 'subject', 'priority'];

function setEditMode(isEditing) {
    EDIT_LOCKED_FIELDS.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.disabled = isEditing;
    });
    const hint = document.getElementById('feedbackEditHint');
    if (hint) hint.hidden = !isEditing;
}

async function editFeedback(id, button) {
    await UIKit.withBusy(button, async () => {
        try {
            const response = await fetch(`/api/auth/feedback/${encodeURIComponent(id)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                endSession();
                return;
            }

            if (response.ok) {
                const feedback = await response.json();
                const form = document.getElementById('feedbackForm');
                form.reset();
                // Populate form with existing data
                document.getElementById('category').value = feedback.category;
                document.getElementById('subject').value = decodeStoredText(feedback.subject);
                document.getElementById('content').value = decodeStoredText(feedback.content);
                if (feedback.rating) {
                    const ratingInput = document.querySelector(`input[name="rating"][value="${Number(feedback.rating)}"]`);
                    if (ratingInput) ratingInput.checked = true;
                }
                document.getElementById('priority').value = feedback.priority;
                setEditMode(true);

                // Change form to update mode (the existing handleFormSubmit routes
                // the save to updateFeedback via dataset)
                form.dataset.mode = 'update';
                form.dataset.feedbackId = id;

                // Change submit button label
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Update Feedback';

                // Bring the form into view so the student sees the loaded data
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
                document.getElementById('content')?.focus({ preventScroll: true });
            } else {
                UIKit.toast('Failed to load feedback for editing', 'error');
            }
        } catch (error) {
            console.error('Error editing feedback:', error);
            UIKit.toast('Could not load the feedback. Check your connection and try again.', 'error');
        }
    });
}

async function updateFeedback(id, submitBtn) {
    const form = document.getElementById('feedbackForm');
    const formData = new FormData(form);
    
    const data = {
        content: formData.get('content'),
        rating: formData.get('rating') ? parseInt(formData.get('rating'), 10) : null
    };

    const saved = await UIKit.withBusy(submitBtn, async () => {
        try {
            const response = await fetch(`/api/auth/feedback/${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.status === 401) {
                endSession();
                return false;
            }

            if (response.ok) {
                UIKit.toast('Feedback updated successfully', 'success');
                return true;
            }
            const error = await response.json().catch(() => ({}));
            UIKit.toast('Failed to update feedback: ' + (error.error || `status ${response.status}`), 'error');
        } catch (error) {
            console.error('Error updating feedback:', error);
            UIKit.toast('Error updating feedback. Check your connection and try again.', 'error');
        }
        return false;
    }, { busyText: 'Updating…' });

    // Reset only after withBusy has restored the button, otherwise it would put
    // the "Update Feedback" label back on a form that is in create mode again.
    if (saved) {
        resetForm();
        loadFeedbackHistory();
    }
}

async function archiveFeedback(id, button) {
    await UIKit.withBusy(button, async () => {
        try {
            const response = await fetch(`/api/auth/feedback/${encodeURIComponent(id)}/archive`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            closeArchiveConfirm();

            if (response.status === 401) {
                endSession();
                return;
            }

            if (response.ok) {
                UIKit.toast('Feedback archived successfully', 'success');
                // Archiving the entry being edited would leave the form
                // pointing at a record that no longer shows in the list.
                const form = document.getElementById('feedbackForm');
                if (form?.dataset.feedbackId === String(id)) resetForm();
                loadFeedbackHistory();
            } else {
                UIKit.toast('Failed to archive feedback', 'error');
            }
        } catch (error) {
            closeArchiveConfirm();
            console.error('Error archiving feedback:', error);
            UIKit.toast('Error archiving feedback. Check your connection and try again.', 'error');
        }
    }, { busyText: 'Archiving…' });
}

function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // If in update mode, redirect to updateFeedback
    if (form.dataset.mode === 'update' && form.dataset.feedbackId) {
        updateFeedback(form.dataset.feedbackId, submitBtn);
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        category: formData.get('category'),
        subject: formData.get('subject'),
        content: formData.get('content'),
        rating: formData.get('rating') ? parseInt(formData.get('rating'), 10) : null,
        // Optional: the server defaults to medium when none is chosen.
        priority: formData.get('priority') || undefined
    };

    UIKit.withBusy(submitBtn, async () => {
        try {
            const response = await fetch('/api/auth/feedback', {
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
                UIKit.toast('Feedback submitted successfully', 'success');
                resetForm();
                loadFeedbackHistory();
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

function resetForm() {
    const form = document.getElementById('feedbackForm');
    form.reset();
    form.dataset.mode = 'create';
    delete form.dataset.feedbackId;
    setEditMode(false);
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Submit Feedback';
}

// Attach submit handler (use onsubmit to avoid duplicates)
document.getElementById('feedbackForm').onsubmit = handleFormSubmit;

function logout() {
    endSession();
}
