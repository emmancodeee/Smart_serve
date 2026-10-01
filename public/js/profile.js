const STUDENT_PROFILE_KEY = 'smartserve_student_profile';

function redirectToLogin() {
  window.location.replace('/');
}

// Clears the session (token and the cached header profile) and returns to the
// sign-in page, so the next student on this browser never sees a stale name.
function endSession() {
  localStorage.removeItem('token');
  localStorage.removeItem(STUDENT_PROFILE_KEY);
  redirectToLogin();
}

function getStoredToken() {
  const token = String(localStorage.getItem('token') || '').trim();
  const isJwtLike = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
  if (!token || token.length > 4096 || !isJwtLike) {
    localStorage.removeItem('token');
    return '';
  }
  return token;
}

let currentProfileUser = null;

function enforceAuthOnPageShow(event) {
  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
    return;
  }
  if (event.persisted) {
    window.location.reload();
  }
}

window.addEventListener('pageshow', enforceAuthOnPageShow);

document.addEventListener('DOMContentLoaded', async () => {
  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
    return;
  }
  startHeaderClock();

  const cachedUser = StudentHeader.getCachedStudentProfile();
  if (cachedUser) StudentHeader.applyStudentHeader(cachedUser);

  await loadUserInfo();
});

async function loadUserInfo() {
  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
    return;
  }
  const errorEl = document.getElementById('profileUserInfoError');
  const errorText = document.getElementById('profileUserInfoErrorText');

  const showError = (msg) => {
    if (!errorEl || !errorText) return;
    errorText.textContent = msg;
    errorEl.classList.remove('hidden');
  };
  const clearError = () => {
    if (!errorEl || !errorText) return;
    errorEl.classList.add('hidden');
    errorText.textContent = '';
  };

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const user = await response.json();
      clearError();
      currentProfileUser = user;
      StudentHeader.cacheStudentProfile(user);
      // Prefill form
      document.getElementById('editName').value = user.name || '';
      document.getElementById('editEmail').value = user.email || '';
      setHeaderUser(user);
      setRegistrationInfo(user);
    } else if (response.status === 401) {
      console.error('Failed to load user info: 401 Unauthorized', { status: response.status });
      endSession();
    } else if (response.status === 503) {
      console.error('Failed to load user info: 503 Server unavailable', { status: response.status });
      showError('Server temporarily unavailable. Please try again shortly.');
    } else {
      console.error('Failed to load user info', { status: response.status });
      showError(`Failed to load user info (${response.status}). Please try again.`);
    }
  } catch (error) {
    console.error('Failed to load user info: network error', { error: String(error && error.message || error || 'Unknown error') });
    showError('Cannot reach the server. Check your connection and try again.');
  }
}

document.getElementById('profileUserInfoErrorRetry')?.addEventListener('click', () => {
  loadUserInfo();
});

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

function setHeaderUser(user) {
  StudentHeader.applyStudentHeader(user);
  applyProfileStatus(user?.status);
}

function setRegistrationInfo(user) {
  applyProfileStatus(user?.status);
  setText('infoStudentName', user?.name || 'N/A');
  setText('infoStudentNumber', user?.studentNumber || 'N/A');
  setText('infoStudentEmail', user?.email || 'N/A');
  setText('infoProgramCourse', user?.course || 'N/A');
  setText('infoYearLevel', user?.yearLevel || 'N/A');
  setText('infoContactNumber', 'Not on file');
  setText('infoRegistrationStatus', formatStatus(user?.status) || '-');
  setText('infoStatus', formatStatus(user?.status) || '-');
  setText('infoCourse', user?.course || 'N/A');
  setText('infoModule', user?.module || 'N/A');
  setText('infoUniformType', user?.uniformType || 'N/A');
  setText('infoBooks', user?.books || 'N/A');
  setText('infoPickupDay', formatDisplayDate(user?.pickupDate) || 'Not set');
}

function formatStatus(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function applyProfileStatus(status) {
  const badge = document.getElementById('profileStatusBadge');
  if (!badge) return;

  const normalized = String(status || '').trim().toLowerCase();
  const allowed = ['pending', 'approved', 'rejected'].includes(normalized) ? normalized : '';
  badge.className = `student-status-pill ${allowed ? `student-status-pill--${allowed}` : 'student-status-pill--default'}`;
  badge.textContent = allowed ? `Status: ${formatStatus(allowed)}` : 'Status: -';
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = String(value ?? 'N/A');
}

function clearPasswordFields() {
  ['oldPassword', 'newPassword', 'confirmNewPassword'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
}

function formatDisplayDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
}

document.getElementById('logoutBtn')?.addEventListener('click', endSession);

document.getElementById('cancelProfileButton')?.addEventListener('click', () => {
  const nameInput = document.getElementById('editName');
  const emailInput = document.getElementById('editEmail');
  if (currentProfileUser) {
    if (nameInput) nameInput.value = currentProfileUser.name || '';
    if (emailInput) emailInput.value = currentProfileUser.email || '';
  }
  clearPasswordFields();
});

// /api/auth/me reports the registration's full name ahead of the account name
// (buildCurrentUserPayload), and this form only changes the account name, so
// the header would keep showing the old name after a save. Re-apply the saved
// name to the header and to the profile cache the other student pages read.
function applySavedNameToHeader(savedName) {
  const name = String(savedName || '').trim();
  if (!name) return;
  const updated = {
    ...(currentProfileUser || {}),
    name,
    fullname: name,
    firstName: name.split(/\s+/)[0] || ''
  };
  StudentHeader.cacheStudentProfile(updated);
  StudentHeader.applyStudentHeader(updated);
}

document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('editName').value;
  const email = document.getElementById('editEmail').value;

  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
    return;
  }

  // Check the password fields before anything is sent.
  if (newPassword) {
    if (newPassword !== confirmNewPassword) {
      UIKit.toast('New passwords do not match', 'warning');
      document.getElementById('confirmNewPassword')?.focus();
      return;
    }
    if (!oldPassword) {
      UIKit.toast('Please enter your old password', 'warning');
      document.getElementById('oldPassword')?.focus();
      return;
    }
  }

  const submitBtn = e.currentTarget.querySelector('button[type="submit"]');
  await UIKit.withBusy(submitBtn, async () => {
    // If password fields are filled, change password first
    if (newPassword) {
      try {
        const response = await fetch('/api/auth/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          UIKit.toast(data.error || 'Failed to change password', 'error');
          return;
        }
        clearPasswordFields();
      } catch (error) {
        UIKit.toast('Error changing password. Check your connection and try again.', 'error');
        return;
      }
    }

    // Update profile
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (response.status === 401) {
        endSession();
        return;
      }

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        UIKit.toast(newPassword ? 'Profile and password updated successfully' : 'Profile updated successfully', 'success');
        clearPasswordFields();
        await loadUserInfo();
        applySavedNameToHeader(data?.user?.name || name);
      } else {
        const data = await response.json().catch(() => ({}));
        UIKit.toast(data.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      UIKit.toast('Error updating profile. Check your connection and try again.', 'error');
    }
  }, { busyText: 'Saving…' });
});
