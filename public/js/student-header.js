(function (global) {
  'use strict';

  const CACHE_KEY = 'smartserve_student_profile';

  function getStoredToken() {
    return String(localStorage.getItem('token') || '').trim();
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

  function getDisplayName(user) {
    const fullName = String(user?.fullname || '').trim();
    if (fullName) return fullName;
    const name = String(user?.name || '').trim();
    if (name) return name;
    const firstName = String(user?.firstName || '').trim();
    if (firstName) return firstName;
    return 'Student';
  }

  function normalizeUser(user) {
    if (!user || typeof user !== 'object') return null;
    const name = String(user.name || user.fullname || '').trim();
    const fullname = String(user.fullname || user.name || '').trim();
    const firstName = String(user.firstName || '').trim();
    if (!name && !fullname && !firstName) return null;
    return {
      name,
      fullname,
      firstName,
      email: String(user.email || '').trim(),
      status: String(user.status || '').trim()
    };
  }

  function cacheStudentProfile(user) {
    const normalized = normalizeUser(user);
    if (!normalized) return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
    } catch (_) {
      // Storage unavailable — the header still renders from the fetch below.
    }
  }

  function getCachedStudentProfile() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed.name || parsed.fullname || parsed.firstName ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  const WELCOME_IDS = [
    'dashboardWelcomeText',
    'profileHeaderTitle',
    'scheduleHeaderTitle',
    'feedbackWelcomeText',
    'returnsWelcomeText'
  ];

  function applyStudentHeader(user) {
    const normalized = normalizeUser(user);
    if (!normalized) return;

    const firstName = getFirstName(normalized);
    const welcomeText = firstName ? `Welcome, ${firstName}` : 'Welcome';
    WELCOME_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = welcomeText;
    });

    const displayName = getDisplayName(normalized);

    const avatarEl = document.getElementById('studentAvatar');
    if (avatarEl) avatarEl.textContent = String(displayName).charAt(0).toUpperCase();

    const profileNameEl = document.getElementById('studentProfileName');
    if (profileNameEl) profileNameEl.textContent = displayName;

    const headerProfileName = document.getElementById('headerProfileName');
    if (headerProfileName) headerProfileName.textContent = displayName;

    const heroName = document.getElementById('dashboardHeroName');
    if (heroName) heroName.textContent = displayName;
  }

  async function bootstrapStudentHeader(options) {
    const { onUser, onUnauthorized } = options || {};

    const cached = getCachedStudentProfile();
    if (cached) applyStudentHeader(cached);

    const token = getStoredToken();
    if (!token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });

      if (response.status === 401 || response.status === 403) {
        if (typeof onUnauthorized === 'function') onUnauthorized();
        return null;
      }
      if (!response.ok) return cached;

      const user = await response.json().catch(() => null);
      if (!user || typeof user !== 'object') return cached;

      cacheStudentProfile(user);
      applyStudentHeader(user);
      if (typeof onUser === 'function') onUser(user);
      return user;
    } catch (_) {
      return cached;
    }
  }

  global.StudentHeader = {
    getFirstName,
    getDisplayName,
    cacheStudentProfile,
    getCachedStudentProfile,
    applyStudentHeader,
    bootstrapStudentHeader
  };
})(window);