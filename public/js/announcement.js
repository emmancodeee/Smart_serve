let allAnnouncements = [];
let currentUser = null;
let announcementRefreshInterval = null;
let announcementsRequestInFlight = false;
let announcementsRequestSeq = 0;
const DISPLAY_TIMEZONE = 'Asia/Manila';

function redirectToLogin() {
  window.location.replace('/');
}

function redirectToAdmin() {
  window.location.replace('/admin/announcements');
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
  checkAuth();
  startHeaderClock();
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  Promise.all([loadHeaderUser(), loadAnnouncements()]).finally(startRealtimeRefresh);
});

function checkAuth() {
  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
  }
}

// Clears the session (token and the cached header profile) and returns to the
// sign-in page, so the next student on this browser never sees a stale name.
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('smartserve_student_profile');
  redirectToLogin();
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

function normalizeStatus(status) {
  const value = String(status || '').toLowerCase();
  return ['pending', 'approved', 'rejected'].includes(value) ? value : '';
}

function titleCase(value) {
  return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Announcement text is saved through sanitize-html, which stores it
// entity-encoded ("A & B" -> "A &amp; B"). Decode those entities before
// escaping, otherwise the cards show a literal "&amp;".
function decodeStoredText(value) {
  return String(value ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
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

function parseDateSafe(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTimePH(value, fallback = 'N/A') {
  const date = parseDateSafe(value);
  if (!date) return fallback;
  return date.toLocaleString('en-PH', {
    timeZone: DISPLAY_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function applyHeaderStatus(status) {
  const badge = document.getElementById('scheduleStatusBadge');
  if (!badge) return;

  const normalized = normalizeStatus(status);
  badge.textContent = normalized ? `Status: ${titleCase(normalized)}` : 'Status: -';
  badge.className = `student-status-pill ${normalized ? `student-status-pill--${normalized}` : 'student-status-pill--default'}`;
}

async function loadHeaderUser() {
  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
    return;
  }

  const cached = StudentHeader.getCachedStudentProfile();
  if (cached) StudentHeader.applyStudentHeader(cached);

  try {
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });

    if (response.status === 401 || response.status === 403) {
      logout();
      return;
    }

    if (!response.ok) return;

    currentUser = await response.json().catch(() => null);
    if (currentUser?.isAdmin || currentUser?.accountType === 'admin') {
      redirectToAdmin();
      return;
    }

    StudentHeader.cacheStudentProfile(currentUser);
    StudentHeader.applyStudentHeader(currentUser);
    applyHeaderStatus(currentUser?.status);
  } catch (_) {
  }
}

async function loadAnnouncements() {
  if (announcementsRequestInFlight) return;
  announcementsRequestInFlight = true;
  const requestSeq = ++announcementsRequestSeq;
  try {
    const token = getStoredToken();
    if (!token) {
      redirectToLogin();
      return;
    }

    const response = await fetch('/api/auth/announcements', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });

    if (response.status === 403) {
      redirectToAdmin();
      return;
    }

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) throw new Error('Failed to load announcements');

    const payload = await response.json().catch(() => []);
    if (requestSeq !== announcementsRequestSeq) return;
    allAnnouncements = Array.isArray(payload) ? payload : [];
    renderAnnouncementFeed();
  } catch (error) {
    if (requestSeq !== announcementsRequestSeq) return;
    console.error('Error loading announcements:', error);
    renderAnnouncementLoadError();
  } finally {
    if (requestSeq === announcementsRequestSeq) announcementsRequestInFlight = false;
  }
}

function renderAnnouncementFeed() {
  const container = document.getElementById('announcementList');
  if (!container) return;

  if (!allAnnouncements.length) {
    container.innerHTML = '<div class="schedule-empty-state">No announcements available.</div>';
    return;
  }

  container.innerHTML = allAnnouncements.map(item => renderAnnouncementCard(item)).join('');
}

function renderAnnouncementCard(item) {
  const role = item?.authorRole === 'super_admin' ? 'Super Admin' : 'Admin';
  const badgeClass = item?.authorRole === 'super_admin'
    ? 'announcement-role-badge announcement-role-badge--super'
    : 'announcement-role-badge';
  const content = decodeStoredText(item?.content).trim() || 'No description provided.';
  const publishedLabel = formatDateTimePH(item?.publishedAt);

  return `
    <div class="announcement-card">
      <h3 class="announcement-card-title">${escapeHtml(decodeStoredText(item?.title) || 'Untitled announcement')}</h3>
      <p class="announcement-card-copy">${escapeHtml(content)}</p>
      <div class="announcement-card-meta">
        <span>${escapeHtml(publishedLabel)}</span>
        <span class="${badgeClass}">${escapeHtml(role)}</span>
      </div>
    </div>
  `;
}

function renderAnnouncementLoadError() {
  const container = document.getElementById('announcementList');
  if (!container) return;
  container.innerHTML = '<div class="schedule-empty-state">Announcements could not be loaded right now.</div>';
}

function startRealtimeRefresh() {
  stopRealtimeRefresh();
  announcementRefreshInterval = setInterval(loadAnnouncements, 30000);
}

function stopRealtimeRefresh() {
  if (announcementRefreshInterval) {
    clearInterval(announcementRefreshInterval);
    announcementRefreshInterval = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  loadAnnouncements();
});

window.addEventListener('beforeunload', stopRealtimeRefresh);