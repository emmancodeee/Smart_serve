let currentUser = null;
let pickupShowActiveOnly = false;
let pickupSectionExpanded = false;
const REGISTRATION_STEPS = ['ORF', 'Student Information', 'Modules', 'Books', 'Uniforms & Summary'];
let registrationStepIndex = 0;
let registrationSubmitting = false;
let transientWorkflowMessageShown = false;
// Increments per ORF upload so a slow OCR response for an earlier file cannot
// overwrite the fields extracted from the file the student picked last.
let orfExtractionSeq = 0;
const STUDENT_PROFILE_KEY = 'smartserve_student_profile';
let registrationDraft = {
  pictureOfId: '',
  pictureOfIdFile: null,
  studentType: 'regular',
  modules: [],
  books: [],
  uniformType: '',
  uniformSize: '',
  uniformNotes: ''
};
const REQUEST_CATALOG = {
  modules: [
    'Programming Fundamentals Module Pack',
    'Networking Lab Module Set',
    'Business Analytics Module Pack',
    'Accountancy Workbook Module',
    'Tourism Operations Module Set',
    'Hospitality Service Operations Kit'
  ],
  books: [
    'General Education Reader',
    'Data Structures Handbook',
    'Business Math Workbook',
    'Financial Accounting Volume 1',
    'Hospitality Service Manual',
    'Tourism Geography Atlas'
  ],
  uniformTypes: ['AU PHINMA Shirt', 'Corporate Attire'],
  uniformSizes: ['Small', 'Medium', 'Large'],
  courses: [
    'BS Computer Science',
    'BS Information Technology',
    'BS Accountancy',
    'BS Business Administration',
    'BS Hospitality Management',
    'BS Tourism Management'
  ],
  yearLevels: ['1st Year', '2nd Year', '3rd Year', '4th Year']
};

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

function normalizeStoredAssetSource(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '';

  const anchorHrefMatch = rawValue.match(/<a\b[^>]*\bhref\s*=\s*(['"'])(.*?)\1/i);
  const raw = (anchorHrefMatch?.[2] || rawValue.replace(/<[^>]*>/g, '')).trim();
  if (!raw || raw === '#') return '';

  const lower = raw.toLowerCase();
  if (lower.startsWith('javascript:')) return '';
  if (lower.startsWith('data:image/') || lower.startsWith('data:application/pdf')) {
    return raw;
  }

  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('/')) {
    return raw;
  }

  const looksLikeBase64 = /^[A-Za-z0-9+/=\r\n]+$/.test(raw) && raw.length > 120;
  if (looksLikeBase64) {
    try {
      const sample = atob(raw.replace(/\s+/g, '').slice(0, 120));
      if (sample.startsWith('%PDF')) {
        return `data:application/pdf;base64,${raw.replace(/\s+/g, '')}`;
      }
      if (sample.includes('JFIF') || sample.includes('Exif') || sample.charCodeAt(0) === 0xff) {
        return `data:image/jpeg;base64,${raw.replace(/\s+/g, '')}`;
      }
      if (sample.startsWith('\x89PNG')) {
        return `data:image/png;base64,${raw.replace(/\s+/g, '')}`;
      }
      return `data:application/pdf;base64,${raw.replace(/\s+/g, '')}`;
    } catch (_) {
      return '';
    }
  }

  return raw.startsWith('/') ? raw : `/${raw}`;
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

function isRequestView(hashValue = window.location.hash) {
  const currentHash = String(hashValue || '').toLowerCase();
  return currentHash === '#request' || currentHash === '#registration';
}

function setDashboardSectionVisibility() {
  const dashboardWorkspace = document.getElementById('dashboardWorkspace');
  const dashboardOverviewSection = document.getElementById('dashboardOverview');
  const dashboardHighlightsSection = document.getElementById('dashboardHighlights');
  const requestSummaryCard = document.getElementById('requestSummaryCard');
  const pickupNotificationsSection = document.getElementById('pickupNotifications');
  const requestSection = document.getElementById('requestSection');
  const currentHash = String(window.location.hash || '').toLowerCase();
  const normalizedHash = isRequestView(currentHash) ? '#request' : (currentHash || '#dashboard');
  const showRequest = normalizedHash === '#request';

  const pageTitleBar = document.querySelector('.module-title-bar');
  if (pageTitleBar) {
    pageTitleBar.textContent = showRequest ? 'Registration Workflow' : 'Dashboard';
  }

  if (dashboardWorkspace) {
    dashboardWorkspace.style.display = showRequest ? 'none' : '';
  }

  if (dashboardOverviewSection) {
    dashboardOverviewSection.style.display = showRequest ? 'none' : '';
  }

  if (dashboardHighlightsSection) {
    dashboardHighlightsSection.style.display = showRequest ? 'none' : '';
  }

  if (requestSummaryCard) {
    requestSummaryCard.style.display = showRequest ? 'none' : '';
  }

  if (pickupNotificationsSection) {
    pickupNotificationsSection.style.display = showRequest ? 'none' : '';
  }

  if (requestSection) {
    requestSection.style.display = showRequest ? '' : 'none';
  }

  if (pickupNotificationsSection) {
    pickupNotificationsSection.classList.toggle('registration-collapsible', false);
  }

  updateSidebarActiveState(showRequest ? 'request' : 'dashboard');
}

function updateSidebarActiveState(activeView) {
  document.querySelectorAll('[data-sidebar-view]').forEach(link => {
    link.classList.toggle('is-active', link.dataset.sidebarView === activeView);
  });
}

function scrollToDashboardHashTarget() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupDashboardSectionNavigation() {
  const currentHash = String(window.location.hash || '').toLowerCase();
  if (!currentHash) {
    window.history.replaceState({}, '', `${window.location.pathname}#dashboard`);
  } else if (currentHash === '#registration') {
    window.history.replaceState({}, '', `${window.location.pathname}#request`);
  }
  setDashboardSectionVisibility();
  window.addEventListener('hashchange', () => {
    setDashboardSectionVisibility();
    scrollToDashboardHashTarget();
  });
}

function ensureDashboardUI() {
  const header = document.querySelector('.dashboard-topbar');
  if (!header) return;

  let headerLeft = header.querySelector('.header-left');
  if (!headerLeft) {
    headerLeft = document.createElement('div');
    headerLeft.className = 'header-left';

    const existingTitle = header.querySelector('h1');
    if (existingTitle) {
      headerLeft.appendChild(existingTitle);
    } else {
      const h1 = document.createElement('h1');
      h1.textContent = 'Dashboard';
      headerLeft.appendChild(h1);
    }
    header.insertBefore(headerLeft, header.firstChild);
  }
}

function escapeHtml(value) {
  return String(value ?? 'N/A')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugifyLabel(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

async function refreshCurrentUserSnapshot() {
  const token = getStoredToken();
  if (!token) return;
  try {
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!response.ok) return;
    const latest = await response.json().catch(() => null);
    if (latest && typeof latest === 'object') {
      currentUser = { ...(currentUser || {}), ...latest };
      StudentHeader.cacheStudentProfile(latest);
    }
  } catch (_) {
    // Keep existing snapshot if refresh fails.
  }
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function notificationMetricCard(label, value, tone = 'blue') {
  return `
    <article class="pickup-metric-card" data-tone="${escapeHtml(tone || 'slate')}">
      <p class="pickup-metric-label">${escapeHtml(label)}</p>
      <p class="pickup-metric-value">${escapeHtml(value || 'N/A')}</p>
    </article>
  `;
}

function dashboardSummaryDetailCard(label, value, tone = 'slate') {
  return `
    <div class="dashboard-detail-card" data-tone="${escapeHtml(tone || 'slate')}">
      <p class="dashboard-detail-label">${escapeHtml(label)}</p>
      <p class="dashboard-detail-value">${escapeHtml(value || 'N/A')}</p>
    </div>
  `;
}

function extractAiRecommendationText(item) {
  const description = String(item?.description || '').trim();
  if (!description) return '';

  const marker = 'AI recommendation:';
  const markerIndex = description.indexOf(marker);
  if (markerIndex >= 0) {
    return description.slice(markerIndex + marker.length).trim();
  }

  return description;
}

function getEffectivePickupStatus(item, now = new Date()) {
  const rawStatus = String(item?.status || 'Planned').trim();
  const normalized = rawStatus.toLowerCase();
  if (normalized === 'no show') return 'Failed to comply';
  if (normalized === 'planned') {
    const basis = parseDateSafe(item?.endTime) || parseDateSafe(item?.startTime);
    if (basis && basis.getTime() < now.getTime()) {
      return 'Failed to comply';
    }
    return 'Pending';
  }

  const confirmation = String(item?.rescheduleConfirmationStatus || '').toLowerCase();
  if (confirmation === 'completed') return 'Completed';

  if (normalized === 'completed') return 'Completed';

  return rawStatus || 'Pending';
}

function getEffectiveConfirmationStatus(item, now = new Date()) {
  const pickupStatus = getEffectivePickupStatus(item, now).toLowerCase();
  if (pickupStatus === 'failed to comply') return 'Failed to comply';
  return item?.rescheduleConfirmationStatus || 'Pending';
}

function isTrackedPickupRecord(item) {
  const source = String(item?.source || '').toLowerCase();
  const confirmation = String(item?.rescheduleConfirmationStatus || '').toLowerCase();
  const hasRescheduleMarker = ['pending', 'confirmed', 'adjusted'].includes(confirmation)
    || Boolean(item?.originalMissedScheduleId)
    || source === 'no_show_reschedule';

  if (hasRescheduleMarker) return true;
  return Boolean(item?.isAutoGenerated) && ['approval_auto_plan', 'no_show_reschedule'].includes(source);
}

function isPickupRowActive(item, now = new Date()) {
  const status = String(getEffectivePickupStatus(item, now) || '').toLowerCase();
  const confirmation = String(getEffectiveConfirmationStatus(item, now) || '').toLowerCase();
  if (status === 'completed' || status === 'failed to comply') return false;
  if (confirmation === 'completed' || confirmation === 'failed to comply') return false;
  return true;
}

async function loadPickupNotifications() {
  const container = document.getElementById('pickupNotificationsContent');
  if (!container) return;
  const isCompactRegistrationView = isRequestView();

  await refreshCurrentUserSnapshot();

  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
    return;
  }
  const registrationStatus = normalizeStatus(currentUser?.status);
  const suppressFailedCompliance = registrationStatus === 'pending';
  let currentPickupText = currentUser?.pickupDate
    ? formatDateTime(currentUser.pickupDate)
    : 'Not yet assigned';

  try {
    const response = await fetch(`${window.location.origin}/api/auth/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });

    if (!response.ok) {
      const msg = `Could not load pickups (status ${response.status}).`;
      container.innerHTML = `
      <div class="pickup-metrics-grid">
        ${notificationMetricCard('Current Pickup Schedule', currentPickupText, 'blue')}
        ${notificationMetricCard('Next Pickup Schedule', 'No upcoming pickup schedule', 'blue')}
        ${notificationMetricCard('Pickup Status', 'Unavailable', 'emerald')}
        ${notificationMetricCard('Pickup Updates', msg, 'slate')}
      </div>
      `;
      updateDashboardOverview(currentUser);
      renderPickupSectionMode();
      return;
    }

    const schedules = await response.json().catch(() => ([]));
    const scheduleList = Array.isArray(schedules) ? schedules : [];
    const now = new Date();
    const activityTime = (item) => new Date(
      item?.rescheduleCompletedAt ||
      item?.rescheduleAdjustedAt ||
      item?.rescheduleConfirmedAt ||
      item?.updatedAt ||
      item?.startTime ||
      0
    );
    const autoSchedules = scheduleList
      .filter(isTrackedPickupRecord)
      .filter(item => {
        if (!suppressFailedCompliance) return true;
        const effective = String(getEffectivePickupStatus(item, now) || '').toLowerCase();
        return effective !== 'failed to comply';
      })
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    const latestActivityRecord = [...autoSchedules].sort((a, b) => activityTime(b) - activityTime(a))[0] || null;

    const latestTableRecord = autoSchedules[0] || null;
    const activeSchedules = autoSchedules.filter(item => isPickupRowActive(item, now));
    const visibleRows = pickupShowActiveOnly
      ? activeSchedules
      : autoSchedules;
    const maxVisibleRows = isCompactRegistrationView ? 8 : 6;
    const rows = visibleRows.slice(0, maxVisibleRows);

    const nextPickup = [...activeSchedules]
      .filter(item => {
        const date = new Date(item?.startTime);
        return item?.status === 'Planned' && !Number.isNaN(date.getTime()) && date >= new Date();
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

    const latestActivePickup = [...activeSchedules]
      .filter(item => parseDateSafe(item?.startTime))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0] || null;

    const latestRescheduledPickup = [...autoSchedules]
      .filter(item => {
        const date = new Date(item?.startTime);
        const confirmation = String(item?.rescheduleConfirmationStatus || '').toLowerCase();
        return item?.status === 'Planned'
          && !Number.isNaN(date.getTime())
          && (
            item?.source === 'no_show_reschedule'
            || confirmation === 'pending'
            || confirmation === 'confirmed'
            || confirmation === 'adjusted'
          );
      })
      .sort((a, b) => {
        const aDate = new Date(a?.rescheduleAdjustedAt || a?.rescheduleConfirmedAt || a?.updatedAt || a?.startTime || 0);
        const bDate = new Date(b?.rescheduleAdjustedAt || b?.rescheduleConfirmedAt || b?.updatedAt || b?.startTime || 0);
        return bDate - aDate;
      })[0];

    // Keep Current Pickup Date aligned with the top row date shown in notifications table.
    const authoritativePickupDate =
      nextPickup?.startTime ||
      latestActivePickup?.startTime ||
      latestRescheduledPickup?.startTime ||
      null;
    if (nextPickup?.startTime) {
      currentUser = { ...(currentUser || {}), pickupDate: nextPickup.startTime };
    } else if (latestActivePickup?.startTime) {
      currentUser = { ...(currentUser || {}), pickupDate: latestActivePickup.startTime };
    } else if (latestRescheduledPickup?.startTime) {
      currentUser = { ...(currentUser || {}), pickupDate: latestRescheduledPickup.startTime };
    } else {
      currentUser = { ...(currentUser || {}), pickupDate: '' };
    }
    currentPickupText = authoritativePickupDate
      ? formatDateTime(authoritativePickupDate)
      : 'No active pickup schedule';
    let latestDisplayStatus = '';
    if (latestActivityRecord) {
      latestDisplayStatus = String(getEffectivePickupStatus(latestActivityRecord, now) || '').toLowerCase();
      if (latestDisplayStatus === 'failed to comply' && !suppressFailedCompliance) {
        currentPickupText = 'Failed to comply';
      }
    }
    updateHeaderStatusByCompliance(latestDisplayStatus === 'failed to comply');

    const latestPickupUpdate = latestActivityRecord
      ? getEffectiveConfirmationStatus(latestActivityRecord, now)
      : 'No recent pickup changes';
    const latestPickupStatusRecord =
      nextPickup ||
      latestActivePickup ||
      latestRescheduledPickup ||
      latestTableRecord ||
      latestActivityRecord ||
      null;
    const latestPickupStatus = latestPickupStatusRecord
      ? getEffectivePickupStatus(latestPickupStatusRecord, now)
      : 'No active pickup status';
    const recommendationSource =
      nextPickup ||
      latestActivePickup ||
      latestRescheduledPickup ||
      latestTableRecord ||
      null;
    const aiRecommendationText = extractAiRecommendationText(recommendationSource) || 'No AI recommendation yet';

    container.innerHTML = `
      <div class="pickup-metrics-grid">
        ${notificationMetricCard('Current Pickup Schedule', currentPickupText, 'blue')}
        ${notificationMetricCard('Next Pickup Schedule', nextPickup ? formatDateTime(nextPickup.startTime) : 'No upcoming pickup schedule', 'blue')}
        ${notificationMetricCard('Pickup Status', latestPickupStatus, 'emerald')}
        ${notificationMetricCard('Pickup Updates', latestPickupUpdate, 'emerald')}
        ${notificationMetricCard('AI Recommendation', aiRecommendationText, 'slate')}
      </div>
    `;

    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-base font-medium text-slate-500';
      empty.textContent = pickupShowActiveOnly
        ? 'No active pickup records.'
        : 'No pickup records yet.';
      container.appendChild(empty);
      updateDashboardOverview(currentUser);
      renderPickupSectionMode();
      return;
    }

    if (isCompactRegistrationView) {
      const latestRow = rows[0];
      const displayStatus = getEffectivePickupStatus(latestRow, now);
      const displayConfirmation = getEffectiveConfirmationStatus(latestRow, now);
      const type = latestRow?.status === 'No Show' ? 'Missed Pickup' : 'Scheduled Pickup';
      const compactItems = String(latestRow.items || latestRow.module || 'N/A')
        .split(/\s*;\s*/g)
        .filter(Boolean)
        .slice(0, 3)
        .map(entry => `<li class="truncate">${escapeHtml(entry)}</li>`)
        .join('');

      container.innerHTML += `
        <div class="pickup-compact-card">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Pickup Summary</p>
            <button type="button" id="pickupHistoryToggleBtn" class="pickup-button pickup-history-button focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1">${pickupShowActiveOnly ? 'Show All History' : 'Show Active Only'}</button>
          </div>
          <div class="pickup-compact-grid lg:grid-cols-[150px_minmax(0,1fr)_220px_auto_auto]">
            <div class="flex items-start">
              <span class="pickup-type-pill">${escapeHtml(type)}</span>
            </div>
            <div class="pickup-compact-items">
              <ul class="space-y-0.5">${compactItems || `<li>${escapeHtml('N/A')}</li>`}</ul>
            </div>
            <div class="pickup-compact-meta">${escapeHtml(formatDateTime(latestRow.startTime))}</div>
            <div><span class="${rescheduleStatusPillClass(displayStatus)}">${escapeHtml(displayStatus)}</span></div>
            <div><span class="${rescheduleConfirmationPillClass(displayConfirmation)}">${escapeHtml(displayConfirmation)}</span></div>
          </div>
        </div>
      `;

      document.getElementById('pickupHistoryToggleBtn')?.addEventListener('click', async () => {
        pickupShowActiveOnly = !pickupShowActiveOnly;
        await loadPickupNotifications();
      });
      updateDashboardOverview(currentUser);
      renderPickupSectionMode();
      return;
    }

    const controls = document.createElement('div');
    controls.className = 'pickup-controls';
    const summary = document.createElement('p');
    summary.className = 'pickup-controls-summary';
    summary.textContent = pickupShowActiveOnly
      ? `Showing active records (${rows.length})`
      : `Showing all records (${rows.length})`;
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'pickup-button pickup-toggle-button focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1';
    toggleBtn.textContent = pickupShowActiveOnly ? 'Show All History' : 'Show Active Only';
    toggleBtn.addEventListener('click', async () => {
      pickupShowActiveOnly = !pickupShowActiveOnly;
      await loadPickupNotifications();
    });
    controls.append(summary, toggleBtn);
    container.appendChild(controls);

    const tableWrap = document.createElement('div');
    tableWrap.className = 'pickup-table-wrap max-h-[420px]';
    const table = document.createElement('table');
    table.className = 'pickup-table text-sm';
    table.innerHTML = `
      <thead>
        <tr>
          <th class="w-[14%] px-5 py-4 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-[#10284d]">Type</th>
          <th class="w-[50%] px-5 py-4 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-[#10284d]">Items</th>
          <th class="w-[13%] px-5 py-4 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-[#10284d]">Date</th>
          <th class="w-[11%] px-5 py-4 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-[#10284d]">Status</th>
          <th class="w-[12%] px-5 py-4 text-left text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-[#10284d]">Confirmation</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100"></tbody>
    `;

    const tbody = table.querySelector('tbody');
    rows.forEach(item => {
      const tr = document.createElement('tr');
      const displayStatus = getEffectivePickupStatus(item, now);
      const displayConfirmation = getEffectiveConfirmationStatus(item, now);
      const type = item?.status === 'No Show' ? 'Missed Pickup' : 'Scheduled Pickup';
      const itemLabel = String(item.items || item.module || 'N/A')
        .split(/\s*;\s*/g)
        .filter(Boolean)
        .map(entry => escapeHtml(entry))
        .join('<br>');
      const cellPad = 'px-5 py-5';
      tr.innerHTML = `
        <td class="${cellPad} align-top"><span class="pickup-type-pill">${escapeHtml(type)}</span></td>
        <td class="${cellPad} align-top">
          <div class="pickup-item-box">
            ${itemLabel || escapeHtml('N/A')}
          </div>
        </td>
        <td class="${cellPad} align-top text-sm font-semibold leading-5 text-slate-700">${escapeHtml(formatDateTime(item.startTime))}</td>
        <td class="${cellPad} align-top"><span class="${rescheduleStatusPillClass(displayStatus)}">${escapeHtml(displayStatus)}</span></td>
        <td class="${cellPad} align-top"><span class="${rescheduleConfirmationPillClass(displayConfirmation)}">${escapeHtml(displayConfirmation)}</span></td>
      `;
      tbody.appendChild(tr);
    });

    tableWrap.appendChild(table);
    container.appendChild(tableWrap);
    updateDashboardOverview(currentUser);
    renderPickupSectionMode();
  } catch (_) {
    container.innerHTML = `
      <div class="pickup-metrics-grid">
        ${notificationMetricCard('Current Pickup Schedule', currentPickupText, 'blue')}
        ${notificationMetricCard('Next Pickup Schedule', 'No upcoming pickup schedule', 'blue')}
        ${notificationMetricCard('Pickup Status', 'Unavailable', 'emerald')}
        ${notificationMetricCard('Pickup Updates', 'Unavailable', 'slate')}
      </div>
    `;
    updateDashboardOverview(currentUser);
    renderPickupSectionMode();
  }
}

function renderPickupSectionMode() {
  const section = document.getElementById('pickupNotifications');
  const content = document.getElementById('pickupNotificationsContent');
  const header = document.getElementById('pickupSummaryHeader');
  if (!section || !content) return;

  const existingToggle = section.querySelector('[data-pickup-collapse-toggle]');
  if (existingToggle) existingToggle.remove();

  const isRegistrationView = isRequestView();
  const pickupPreview = currentUser?.pickupDate
    ? `Next pickup: ${formatDateTime(currentUser.pickupDate)}`
    : 'No active pickup schedule';

  if (header) header.style.display = isRegistrationView ? 'none' : '';
  section.classList.toggle('rounded-[18px]', isRegistrationView);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.setAttribute('data-pickup-collapse-toggle', 'true');
  toggle.className = 'pickup-button pickup-collapse-toggle focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1';
  toggle.innerHTML = `
    <span class="pickup-collapse-icon" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
    </span>
    <span class="min-w-0">
      <span class="pickup-collapse-title">${isRegistrationView ? 'Pickup Summary' : 'Pickup Notifications'}</span>
      <span class="pickup-collapse-subtitle">${escapeHtml(pickupPreview)}</span>
    </span>
    <span class="pickup-collapse-state" data-pickup-collapse-summary>${pickupSectionExpanded ? 'Hide' : 'Show'}</span>
  `;

  const summaryText = toggle.querySelector('[data-pickup-collapse-summary]');
  content.style.display = pickupSectionExpanded ? '' : 'none';

  toggle.addEventListener('click', () => {
    pickupSectionExpanded = !pickupSectionExpanded;
    content.style.display = pickupSectionExpanded ? '' : 'none';
    if (summaryText) summaryText.textContent = pickupSectionExpanded ? 'Hide' : 'Show';
  });

  if (header && !isRegistrationView) {
    header.insertAdjacentElement('afterend', toggle);
    return;
  }

  section.prepend(toggle);
}

function rescheduleStatusPillClass(status) {
  const value = String(status || '').toLowerCase();
  const base = 'pickup-status-pill';
  if (value === 'planned' || value === 'pending') return `${base} pickup-status-pill--pending`;
  if (value === 'no show') return `${base} pickup-status-pill--missed`;
  if (value === 'failed to comply') return `${base} pickup-status-pill--failed`;
  if (value === 'completed') return `${base} pickup-status-pill--completed`;
  return `${base} pickup-status-pill--neutral`;
}

function rescheduleConfirmationPillClass(status) {
  const value = String(status || '').toLowerCase();
  const base = 'pickup-status-pill';
  if (value === 'failed to comply') return `${base} pickup-status-pill--failed`;
  if (value === 'pending') return `${base} pickup-status-pill--pending`;
  if (value === 'confirmed') return `${base} pickup-status-pill--confirmed`;
  if (value === 'adjusted') return `${base} pickup-status-pill--adjusted`;
  if (value === 'completed') return `${base} pickup-status-pill--completed`;
  return `${base} pickup-status-pill--neutral`;
}


function normalizeStatus(status) {
  const value = String(status || '').toLowerCase();
  return ['pending', 'approved', 'rejected'].includes(value) ? value : '';
}

function titleCase(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function updateHeaderRegistrationBadge(status = currentUser?.status) {
  const badge = document.getElementById('registrationStatusBadge');
  if (!badge) return;

  const normalized = normalizeStatus(status);
  badge.className = 'dashboard-status-pill dashboard-status-pill--default';

  if (normalized === 'approved') {
    badge.className = 'dashboard-status-pill dashboard-status-pill--approved';
    badge.textContent = 'Status: Approved';
    return;
  }

  if (normalized === 'pending') {
    badge.className = 'dashboard-status-pill dashboard-status-pill--pending';
    badge.textContent = 'Status: Pending';
    return;
  }

  if (normalized === 'rejected') {
    badge.className = 'dashboard-status-pill dashboard-status-pill--rejected';
    badge.textContent = 'Status: Needs Revision';
    return;
  }

  badge.textContent = 'Status: Not Started';
}

function refreshDashboardWidgets(user = currentUser) {
  updateHeaderRegistrationBadge(user?.status);
  updateDashboardOverview(user);
}

function updateDashboardOverview(user = currentUser) {
  const registrationNode = document.getElementById('overviewRegistrationStatus');
  const registrationHintNode = document.getElementById('overviewRegistrationHint');
  const pickupNode = document.getElementById('overviewPickupValue');
  const pickupHintNode = document.getElementById('overviewPickupHint');
  const requestNode = document.getElementById('overviewRequestValue');
  const requestHintNode = document.getElementById('overviewRequestHint');

  if (!registrationNode || !registrationHintNode || !pickupNode || !pickupHintNode || !requestNode || !requestHintNode) {
    return;
  }

  const normalizedStatus = normalizeStatus(user?.status);
  const moduleCount = Array.isArray(registrationDraft.modules) ? registrationDraft.modules.length : 0;
  const bookCount = Array.isArray(registrationDraft.books) ? registrationDraft.books.length : 0;
  const hasUniform = Boolean(String(registrationDraft.uniformType || '').trim());
  const totalRequestedItems = moduleCount + bookCount + (hasUniform ? 1 : 0);
  const pickupDate = user?.pickupDate ? formatDateTime(user.pickupDate) : '';

  let registrationValue = 'Not started';
  let registrationHint = 'Registration details are not yet on file.';

  if (normalizedStatus === 'approved') {
    registrationValue = 'Approved';
    registrationHint = pickupDate
      ? 'Registration is approved and the pickup schedule is already assigned.'
      : 'Registration is approved. Pickup scheduling is being finalized.';
  } else if (normalizedStatus === 'pending') {
    registrationValue = 'Pending Review';
    registrationHint = 'Your registration is waiting for admin review.';
  } else if (normalizedStatus === 'rejected') {
    registrationValue = 'Needs Revision';
    registrationHint = 'Your registration needs revision before approval.';
  }

  const pickupValue = pickupDate || (normalizedStatus === 'approved' ? 'Awaiting assignment' : 'No active schedule');
  const pickupHint = pickupDate
    ? 'Latest pickup schedule synced from your dashboard notifications.'
    : (normalizedStatus === 'approved'
        ? 'Registration is approved, but no pickup slot is currently assigned.'
        : 'Pickup details will appear after your registration is approved.');

  const requestParts = [
    `${moduleCount} module${moduleCount === 1 ? '' : 's'}`,
    `${bookCount} book${bookCount === 1 ? '' : 's'}`,
    hasUniform ? 'uniform selected' : 'no uniform yet'
  ];

  registrationNode.textContent = registrationValue;
  registrationHintNode.textContent = registrationHint;
  pickupNode.textContent = pickupValue;
  pickupHintNode.textContent = pickupHint;
  requestNode.textContent = String(totalRequestedItems);
  requestHintNode.textContent = totalRequestedItems
    ? `${requestParts.join(', ')}.`
    : 'No requested items added yet.';
}

function updateRegistrationStatusUI(status) {
  const normalized = normalizeStatus(status);
  const message = document.getElementById('registrationStatusMessage');
  updateHeaderRegistrationBadge(status);
  refreshDashboardWidgets(currentUser);
  if (!message) return;

  if (!normalized) {
    message.className = 'dashboard-inline-message dashboard-inline-message--default';
    message.textContent = 'No registration status is available yet.';
    return;
  }

  if (normalized === 'approved') {
    message.className = 'dashboard-inline-message dashboard-inline-message--approved';
    message.textContent = currentUser?.pickupDate
      ? `Your registration is approved. Pickup is scheduled for ${formatDateTime(currentUser.pickupDate)}.`
      : 'Your registration is approved.';
    return;
  }

  if (normalized === 'rejected') {
    message.className = 'dashboard-inline-message dashboard-inline-message--rejected';
    message.textContent = 'Your registration was rejected and needs revision.';
    return;
  }

  message.className = 'dashboard-inline-message dashboard-inline-message--pending';
  message.textContent = 'Your registration is pending review.';
}

function showWorkflowMessage(text, tone = 'error') {
  const message = document.getElementById('registrationStatusMessage');
  if (!message || !text) return;
  const toneMap = {
    error: 'dashboard-inline-message dashboard-inline-message--error',
    pending: 'dashboard-inline-message dashboard-inline-message--pending',
    approved: 'dashboard-inline-message dashboard-inline-message--approved',
    rejected: 'dashboard-inline-message dashboard-inline-message--rejected',
    default: 'dashboard-inline-message dashboard-inline-message--default'
  };
  message.className = toneMap[tone] || toneMap.error;
  message.textContent = text;
  transientWorkflowMessageShown = true;
}

function clearTransientWorkflowMessage() {
  if (!transientWorkflowMessageShown) return;
  transientWorkflowMessageShown = false;
  updateRegistrationStatusUI(currentUser?.status);
}

function validateStep(index) {
  syncDraftFromForm();
  const step = Math.max(0, Math.min(index, REGISTRATION_STEPS.length - 1));

  if (step === 0) {
    const hasOrf = Boolean(
      String(registrationDraft.pictureOfId || '').trim() || String(currentUser?.pictureOfId || '').trim()
    );
    if (!hasOrf) {
      return { ok: false, message: 'Upload your ORF first so the request includes your document.', focusId: 'editPicture' };
    }
    return { ok: true };
  }

  if (step === 1) {
    const name = document.getElementById('editName')?.value.trim() || '';
    const age = document.getElementById('editAge')?.value.trim() || '';
    const course = document.getElementById('editCourse')?.value.trim() || '';
    if (!name) return { ok: false, message: 'Enter your full name before continuing.', focusId: 'editName' };
    if (!age) return { ok: false, message: 'Enter your age before continuing.', focusId: 'editAge' };
    if (!course) return { ok: false, message: 'Select your course before continuing.', focusId: 'editCourse' };
    return { ok: true };
  }

  return { ok: true };
}

function setRegistrationLocked(isLocked) {
  [
    'editPicture',
    'editName',
    'editStudentNumber',
    'editAge',
    'editCourse',
    'editYearLevel',
    'studentType',
    'editUniformType',
    'uniformSize',
    'uniformNotes',
    'addModuleRowBtn',
    'addBookRowBtn',
    'registrationBackBtn',
    'registrationNextBtn',
    'registrationSubmitBtn'
  ].forEach(id => {
    const node = document.getElementById(id);
    if (!node) return;
    node.disabled = isLocked;
    node.classList.toggle('opacity-60', isLocked);
    node.classList.toggle('cursor-not-allowed', isLocked);
  });

  document.querySelectorAll('[data-row-input], [data-row-remove]').forEach(node => {
    node.disabled = isLocked;
  });
}

function updateHeaderStatusByCompliance(isFailedToComply) {
  const message = document.getElementById('registrationStatusMessage');
  const registrationStatus = normalizeStatus(currentUser?.status);
  if (!message) {
    updateHeaderRegistrationBadge(registrationStatus || currentUser?.status);
    return;
  }
  // Registration workflow status should always drive the main registration message.
  // "Failed to comply" is a pickup-history signal and should not override
  // pending/approved/rejected registration states.
  if (registrationStatus) {
    updateRegistrationStatusUI(registrationStatus);
    return;
  }

  if (isFailedToComply) {
    message.className = 'dashboard-inline-message dashboard-inline-message--default';
    message.textContent = 'Latest pickup was missed. Status is marked as failed to comply.';
    return;
  }

  updateRegistrationStatusUI(currentUser?.status);
}

function getRequestRowOptions(type) {
  return type === 'module' ? REQUEST_CATALOG.modules : REQUEST_CATALOG.books;
}

function buildSelectOptionsMarkup(options, selectedValue, placeholder, customLabelSuffix = 'Detected from OCR') {
  const safeSelected = String(selectedValue || '').trim();
  const knownValues = new Set(options.map(option => String(option)));
  const optionMarkup = options.map(option => `
      <option value="${escapeHtml(option).replace(/"/g, '&quot;')}"${safeSelected === option ? ' selected' : ''}>${escapeHtml(option)}</option>
    `).join('');
  const customMarkup = safeSelected && !knownValues.has(safeSelected)
    ? `<option value="${escapeHtml(safeSelected).replace(/"/g, '&quot;')}" selected>${escapeHtml(`${safeSelected} (${customLabelSuffix})`)}</option>`
    : '';

  return `
    <option value="">${escapeHtml(placeholder)}</option>
    ${customMarkup}
    ${optionMarkup}
  `;
}

function createRowTemplate(type, value = '') {
  const row = document.createElement('div');
  row.className = 'dashboard-request-row grid grid-cols-1 gap-2 rounded-lg p-2.5 md:grid-cols-[130px_1fr_auto]';

  const label = type === 'module' ? 'Module' : 'Book';
  const placeholder = type === 'module'
    ? 'Select a module'
    : 'Select a book';
  const options = getRequestRowOptions(type);

  row.innerHTML = `
    <div class="dashboard-request-row-label rounded-lg px-2.5 py-1.5 text-[11px] font-semibold">${label}</div>
    <select data-row-input="${type}" class="dashboard-request-row-select w-full rounded-lg px-3 py-2 text-[13px] outline-none transition duration-200">
      ${buildSelectOptionsMarkup(options, value, placeholder)}
    </select>
    <button type="button" data-row-remove="${type}" class="dashboard-request-row-remove rounded-lg px-3 py-1.5 text-[11px] font-semibold transition duration-200 focus:outline-none">Remove</button>
  `;

  row.querySelector('button').addEventListener('click', () => {
    row.remove();
    updateRegistrationSummary();
  });
  row.querySelector('[data-row-input]')?.addEventListener('change', updateRegistrationSummary);
  return row;
}

function populateCatalogSelects() {
  const selectSets = [
    ['editCourse', REQUEST_CATALOG.courses, 'Select a course'],
    ['editYearLevel', REQUEST_CATALOG.yearLevels, 'Select year level'],
    ['editUniformType', REQUEST_CATALOG.uniformTypes, 'Select uniform type'],
    ['uniformSize', REQUEST_CATALOG.uniformSizes, 'Select size']
  ];
  selectSets.forEach(([id, options, placeholder]) => {
    const select = document.getElementById(id);
    if (!select) return;
    const optionMarkup = options.map(option =>
      `<option value="${escapeHtml(option).replace(/"/g, '&quot;')}">${escapeHtml(option)}</option>`
    ).join('');
    select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>${optionMarkup}`;
  });

  const listSets = [
    ['moduleCatalogList', REQUEST_CATALOG.modules],
    ['bookCatalogList', REQUEST_CATALOG.books]
  ];
  listSets.forEach(([id, items]) => {
    const list = document.getElementById(id);
    if (!list) return;
    list.innerHTML = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  });
}

function setDraftRows(type, values) {
  const container = document.getElementById(type === 'module' ? 'moduleRows' : 'bookRows');
  if (!container) return;
  container.innerHTML = '';

  const safeValues = (Array.isArray(values) ? values : [])
    .map(item => String(item || '').trim())
    .filter(Boolean);

  if (!safeValues.length) {
    container.innerHTML = '';
    return;
  }

  safeValues.forEach(value => {
    container.appendChild(createRowTemplate(type, value));
  });
}

function getDraftRows(type) {
  const container = document.getElementById(type === 'module' ? 'moduleRows' : 'bookRows');
  if (!container) return [];
  return [...container.querySelectorAll(`[data-row-input="${type}"]`)]
    .map(input => input.value.trim())
    .filter(Boolean);
}

function splitStoredList(rawValue) {
  return String(rawValue || '')
    .split(/\s*;\s*|\s*,\s*|\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

function renderOrfPreview(src) {
  const wrap = document.getElementById('orfPreviewWrap');
  if (!wrap) return;
  const normalizedSrc = normalizeStoredAssetSource(src);

  if (!normalizedSrc) {
    renderOrfEmptyState(wrap);
    return;
  }

  wrap.className = 'rounded-lg border border-slate-200 bg-slate-50 p-3';
  if (String(normalizedSrc).startsWith('data:application/pdf') || String(normalizedSrc).toLowerCase().includes('.pdf')) {
    const openLabel = String(normalizedSrc).startsWith('data:application/pdf') ? 'Open PDF in New Tab' : 'Open PDF';
    wrap.innerHTML = `
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#d7e0ec] bg-[#eef3f9] text-[#10284d]">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M7 3h7l5 5v13H7z"></path>
              <path d="M14 3v5h5"></path>
              <path d="M9 13h6"></path>
              <path d="M9 17h6"></path>
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[15px] font-bold text-[#10284d]">PDF uploaded successfully</p>
            <p class="mt-1 text-[12px] leading-6 text-slate-600">Your ORF file is ready. Use the button below to view the full document.</p>
          </div>
        </div>
        <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[12px] leading-6 text-slate-600">
          Check the file, then continue to the next registration step.
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <a href="${escapeHtml(normalizedSrc)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-xl bg-[#10284d] px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition duration-200 hover:bg-[#18355f] focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1">
            ${openLabel}
          </a>
        </div>
      </div>
    `;
    return;
  }

  wrap.innerHTML = `<img src="${escapeHtml(normalizedSrc)}" alt="ORF preview" class="mx-auto max-h-[60vh] rounded-lg border border-slate-200 shadow-sm">`;
}

function renderOrfEmptyState(wrap) {
  wrap.className = 'registration-orf-preview registration-orf-preview--empty';
  wrap.innerHTML = `
    <svg class="registration-orf-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M7 3h7l5 5v13H7z"></path>
      <path d="M14 3v5h5"></path>
      <path d="M9 13h6"></path>
      <path d="M9 17h6"></path>
    </svg>
    <p>No ORF uploaded yet.</p>
  `;
}

function parseUniformSelection(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) {
    return { type: '', size: '', notes: '' };
  }

  const lower = raw.toLowerCase();
  const type = REQUEST_CATALOG.uniformTypes.find(option => lower.includes(option.toLowerCase())) || '';
  const size = REQUEST_CATALOG.uniformSizes.find(option => lower.includes(option.toLowerCase())) || '';

  let notes = raw;
  if (type) {
    notes = notes.replace(new RegExp(escapeRegExp(type), 'ig'), ' ');
  }
  if (size) {
    notes = notes.replace(new RegExp(escapeRegExp(size), 'ig'), ' ');
  }
  notes = notes.replace(/[-/,]+/g, ' ').replace(/\s+/g, ' ').trim();

  if (!type && !size) {
    const parts = raw.split(/\s*[-/]\s*/).map(item => item.trim()).filter(Boolean);
    return {
      type: parts[0] || raw,
      size: parts[1] || '',
      notes: parts.slice(2).join(' / ')
    };
  }

  return { type, size, notes };
}

function setSelectValue(selectId, value, placeholderLabel) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Remove dynamic options
  const dynamicOptions = select.querySelectorAll('option[data-dynamic-option="true"]');
  for (let i = 0; i < dynamicOptions.length; i++) {
    dynamicOptions[i].remove();
  }

  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) {
    select.value = '';
    return;
  }

  // Check if option exists - handle cases where select.options might not be available
  let hasExactOption = false;
  if (select.options && typeof select.options.length === 'number') {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === normalizedValue) {
        hasExactOption = true;
        break;
      }
    }
  }
  
  if (!hasExactOption) {
    const option = document.createElement('option');
    option.value = normalizedValue;
    option.textContent = `${normalizedValue} (${placeholderLabel || 'Detected from OCR'})`;
    option.setAttribute('data-dynamic-option', 'true');
    select.appendChild(option);
  }

  select.value = normalizedValue;
}

function setOrfMessage(text, tone = 'amber') {
  const node = document.getElementById('orfUploadMessage');
  if (!node) return;

  const toneMap = {
    amber: 'dashboard-orf-message dashboard-orf-message--amber',
    blue: 'dashboard-orf-message dashboard-orf-message--blue',
    green: 'dashboard-orf-message dashboard-orf-message--green',
    red: 'dashboard-orf-message dashboard-orf-message--red'
  };

  node.className = toneMap[tone] || toneMap.amber;
  node.textContent = text;
  node.style.display = '';
}

function syncDraftFromForm() {
  registrationDraft.pictureOfId = registrationDraft.pictureOfId || String(currentUser?.pictureOfId || '').trim();
  registrationDraft.studentType = document.getElementById('studentType')?.value || 'regular';
  registrationDraft.modules = getDraftRows('module');
  registrationDraft.books = getDraftRows('book');
  registrationDraft.uniformType = document.getElementById('editUniformType')?.value.trim() || '';
  registrationDraft.uniformSize = document.getElementById('uniformSize')?.value.trim() || '';
  registrationDraft.uniformNotes = document.getElementById('uniformNotes')?.value.trim() || '';
}

function updateRegistrationSummary() {
  syncDraftFromForm();
  refreshDashboardWidgets(currentUser);

  const cards = document.getElementById('registrationSummaryCards');
  const text = document.getElementById('registrationSummaryText');
  if (!cards || !text) return;

  const uniformParts = [registrationDraft.uniformType, registrationDraft.uniformSize].filter(Boolean);
  const uniformLabel = uniformParts.length ? uniformParts.join(' / ') : 'No uniform selected';
  const pictureLabel = registrationDraft.pictureOfId ? 'Uploaded' : 'Not uploaded';

  cards.innerHTML = `
    ${notificationMetricCard('Modules', `${registrationDraft.modules.length || 0} item(s)`, 'blue')}
    ${notificationMetricCard('Books', `${registrationDraft.books.length || 0} item(s)`, 'blue')}
    ${notificationMetricCard('Uniforms', uniformLabel, 'emerald')}
    ${notificationMetricCard('ORF / ID', pictureLabel, 'slate')}
  `;

  const name = document.getElementById('editName')?.value.trim() || currentUser?.name || 'N/A';
  const studentNumber = document.getElementById('editStudentNumber')?.value.trim() || currentUser?.studentNumber || 'N/A';
  const age = document.getElementById('editAge')?.value.trim() || currentUser?.age || 'N/A';
  const course = document.getElementById('editCourse')?.value.trim() || currentUser?.course || 'N/A';
  const yearLevel = document.getElementById('editYearLevel')?.value.trim() || currentUser?.yearLevel || 'N/A';
  const studentType = registrationDraft.studentType === 'irregular' ? 'Irregular' : 'Regular';

  text.innerHTML = `
    <div class="grid gap-3 md:grid-cols-2">
      ${dashboardSummaryDetailCard('Name', name, 'blue')}
      ${dashboardSummaryDetailCard('Student Number', studentNumber, 'blue')}
      ${dashboardSummaryDetailCard('Course', course, 'emerald')}
      ${dashboardSummaryDetailCard('Year Level', yearLevel, 'emerald')}
      ${dashboardSummaryDetailCard('Age', age, 'slate')}
      ${dashboardSummaryDetailCard('Student Type', studentType, 'slate')}
      ${dashboardSummaryDetailCard('Modules Selected', registrationDraft.modules.join('; ') || 'None', 'blue')}
      ${dashboardSummaryDetailCard('Books Selected', registrationDraft.books.join('; ') || 'None', 'blue')}
      ${dashboardSummaryDetailCard('Uniforms Selected', uniformLabel, 'emerald')}
      ${dashboardSummaryDetailCard('Uniform Notes', registrationDraft.uniformNotes || 'None', 'slate')}
    </div>
  `;
}

function renderRegistrationStepper() {
  const container = document.getElementById('registrationStepper');
  if (!container) return;

  container.innerHTML = REGISTRATION_STEPS.map((label, index) => {
    const stateClass = index < registrationStepIndex
      ? 'is-completed'
      : index === registrationStepIndex ? 'is-current' : 'is-upcoming';
    const nodeInner = index < registrationStepIndex
      ? '<svg class="registration-step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 13l4 4L19 7"></path></svg>'
      : `<span class="registration-step-number">${index + 1}</span>`;
    return `
      <div class="registration-step ${stateClass}" data-step-target="${index}" role="button" tabindex="0" aria-label="Step ${index + 1}: ${escapeHtml(label)}">
        <div class="registration-step-node">${nodeInner}</div>
        <span class="registration-step-text">${escapeHtml(label)}</span>
      </div>
    `;
  }).join('');

  container.classList.remove('is-locked');
}

function setRegistrationStep(index) {
  const nextIndex = Math.max(0, Math.min(index, REGISTRATION_STEPS.length - 1));
  registrationStepIndex = nextIndex;

  syncDraftFromForm();

  document.querySelectorAll('[data-step-panel]').forEach(panel => {
    panel.style.display = Number(panel.getAttribute('data-step-panel')) === nextIndex ? '' : 'none';
  });

  renderRegistrationStepper();
  clearTransientWorkflowMessage();

  const label = document.getElementById('registrationStepLabel');
  if (label) {
    label.textContent = `Step ${nextIndex + 1} of ${REGISTRATION_STEPS.length}`;
  }

  const backBtn = document.getElementById('registrationBackBtn');
  const nextBtn = document.getElementById('registrationNextBtn');
  const submitBtn = document.getElementById('registrationSubmitBtn');
  if (backBtn) backBtn.disabled = nextIndex === 0;
  if (nextBtn) {
    nextBtn.style.display = nextIndex === REGISTRATION_STEPS.length - 1 ? 'none' : '';
  }
  if (submitBtn) submitBtn.style.display = nextIndex === REGISTRATION_STEPS.length - 1 ? '' : 'none';

  if (nextIndex === REGISTRATION_STEPS.length - 1) {
    updateRegistrationSummary();
  }
}

function reportStepError(result) {
  showWorkflowMessage(result.message, 'error');
  const focusNode = result.focusId ? document.getElementById(result.focusId) : null;
  if (focusNode && typeof focusNode.focus === 'function') focusNode.focus();
}

// Moving forward (Next, or clicking a later step in the stepper) has to pass
// the checks of every step being skipped; otherwise the stepper let students
// reach the summary without an ORF, name, age or course. Going back is free.
function goToRegistrationStep(targetIndex) {
  const target = Math.max(0, Math.min(targetIndex, REGISTRATION_STEPS.length - 1));
  for (let step = registrationStepIndex; step < target; step++) {
    const result = validateStep(step);
    if (!result.ok) {
      if (step !== registrationStepIndex) setRegistrationStep(step);
      reportStepError(result);
      return false;
    }
  }
  setRegistrationStep(target);
  return true;
}

function attachRegistrationDraftListeners() {
  ['editName', 'editStudentNumber', 'editAge', 'editCourse', 'editYearLevel', 'studentType', 'editUniformType', 'uniformSize', 'uniformNotes'].forEach(id => {
    const node = document.getElementById(id);
    if (!node) return;
    node.addEventListener('input', updateRegistrationSummary);
    node.addEventListener('change', updateRegistrationSummary);
  });

  const addModuleRowBtn = document.getElementById('addModuleRowBtn');
  if (addModuleRowBtn) {
    addModuleRowBtn.addEventListener('click', () => {
      document.getElementById('moduleRows')?.appendChild(createRowTemplate('module', ''));
      updateRegistrationSummary();
    });
  }

  const addBookRowBtn = document.getElementById('addBookRowBtn');
  if (addBookRowBtn) {
    addBookRowBtn.addEventListener('click', () => {
      document.getElementById('bookRows')?.appendChild(createRowTemplate('book', ''));
      updateRegistrationSummary();
    });
  }

  const stepper = document.getElementById('registrationStepper');
  if (stepper) {
    stepper.addEventListener('click', event => {
      const step = event.target.closest('[data-step-target]');
      if (!step) return;
      goToRegistrationStep(Number(step.getAttribute('data-step-target')));
    });
    stepper.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const step = event.target.closest('[data-step-target]');
      if (!step) return;
      event.preventDefault();
      step.click();
    });
  }

  document.getElementById('registrationBackBtn')?.addEventListener('click', () => {
    setRegistrationStep(registrationStepIndex - 1);
  });

  document.getElementById('registrationNextBtn')?.addEventListener('click', () => {
    goToRegistrationStep(registrationStepIndex + 1);
  });

  document.getElementById('editPicture')?.addEventListener('change', event => {
    const nameNode = document.getElementById('orfFileName');
    if (nameNode) {
      nameNode.textContent = event.target.files?.[0]?.name || 'No file chosen';
    }
  });

  document.getElementById('editPicture')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) {
      registrationDraft.pictureOfId = String(currentUser?.pictureOfId || '').trim();
      registrationDraft.pictureOfIdFile = null;
      renderOrfPreview(registrationDraft.pictureOfId);
      updateRegistrationSummary();
      return;
    }

    const seq = ++orfExtractionSeq;
    const dataUrl = await readFileAsDataURL(file);
    registrationDraft.pictureOfId = dataUrl;
    registrationDraft.pictureOfIdFile = file;
    renderOrfPreview(dataUrl);
    setOrfMessage('Running OCR on the uploaded ORF. This can take a few seconds.', 'blue');
    updateRegistrationSummary();

    try {
      const extracted = await extractOrfData(file);
      if (seq !== orfExtractionSeq) return;
      applyOrfExtraction(extracted.parsed, extracted.confidence, extracted.pass, extracted.rawText, extracted.score);
    } catch (error) {
      if (seq !== orfExtractionSeq) return;
      setOrfMessage(error.message || 'Failed to extract ORF. You can still complete the registration manually.', 'red');
    }
  });
}

function hydrateRegistrationDraft(user) {
  registrationDraft.pictureOfId = String(user?.pictureOfId || '').trim();
  registrationDraft.studentType = String(user?.studentType || '').toLowerCase() === 'irregular' ? 'irregular' : 'regular';
  registrationDraft.modules = splitStoredList(user?.module);
  registrationDraft.books = splitStoredList(user?.books);

  const uniformState = parseUniformSelection(user?.uniformType);
  registrationDraft.uniformType = uniformState.type || '';
  registrationDraft.uniformSize = uniformState.size || '';
  registrationDraft.uniformNotes = uniformState.notes || '';
}

function populateRegistrationForm(user) {
  const nameField = document.getElementById('editName');
  const studentNumberField = document.getElementById('editStudentNumber');
  const ageField = document.getElementById('editAge');
  const courseField = document.getElementById('editCourse');
  const yearLevelField = document.getElementById('editYearLevel');
  const studentTypeField = document.getElementById('studentType');
  const uniformNotesField = document.getElementById('uniformNotes');

  if (!nameField || !studentNumberField || !ageField || !courseField || !yearLevelField || !studentTypeField || !uniformNotesField) {
    return;
  }

  nameField.value = user?.name || '';
  studentNumberField.value = user?.studentNumber || '';
  ageField.value = user?.age || '';
  setSelectValue('editCourse', user?.course || '', 'Detected from OCR');
  setSelectValue('editYearLevel', user?.yearLevel || '', 'Detected from OCR');
  studentTypeField.value = registrationDraft.studentType || 'regular';
  setSelectValue('editUniformType', registrationDraft.uniformType, 'Detected from OCR');
  setSelectValue('uniformSize', registrationDraft.uniformSize, 'Detected from OCR');
  uniformNotesField.value = registrationDraft.uniformNotes || '';

  setDraftRows('module', registrationDraft.modules);
  setDraftRows('book', registrationDraft.books);
  renderOrfPreview(registrationDraft.pictureOfId);
  updateRegistrationSummary();
  setRegistrationLocked(false);
  setRegistrationStep(0);
}

function applyOrfExtraction(parsed, confidence = 0, pass = '', rawText = '', score = 0) {
  if (!parsed || typeof parsed !== 'object') return;

  const studentName = String(parsed.studentName || '').trim();
  const course = String(parsed.course || '').trim();
  const yearLevel = String(parsed.yearLevel || '').trim();
  const studentType = String(parsed.studentType || '').trim().toLowerCase();
  const parsedBooks = Array.isArray(parsed.books) ? parsed.books.map(item => String(item || '').trim()).filter(Boolean) : [];
  const parsedUniformItems = Array.isArray(parsed.uniformItems) ? parsed.uniformItems.map(item => String(item || '').trim()).filter(Boolean) : [];
  const subjects = Array.isArray(parsed.subjects) ? parsed.subjects : [];

  if (studentName) {
    document.getElementById('editName').value = studentName;
  }
  // The student number is not part of the registration payload (it comes from
  // the account), so the read-only field keeps the account value.
  if (course) {
    setSelectValue('editCourse', course, 'Detected from OCR');
  }
  if (yearLevel) {
    setSelectValue('editYearLevel', yearLevel, 'Detected from OCR');
  }
  if (studentType === 'regular' || studentType === 'irregular') {
    document.getElementById('studentType').value = studentType;
  }
  if (subjects.length) {
    registrationDraft.modules = subjects.map(item => item.display || [item.code, item.title].filter(Boolean).join(' - '));
    setDraftRows('module', registrationDraft.modules);
  }
  if (parsedBooks.length) {
    registrationDraft.books = parsedBooks;
    setDraftRows('book', registrationDraft.books);
  }
  if (parsedUniformItems.length) {
    const uniformState = parseUniformSelection(parsedUniformItems.join(' - '));
    registrationDraft.uniformType = uniformState.type || registrationDraft.uniformType;
    registrationDraft.uniformSize = uniformState.size || registrationDraft.uniformSize;
    registrationDraft.uniformNotes = uniformState.notes || registrationDraft.uniformNotes;
    setSelectValue('editUniformType', registrationDraft.uniformType, 'Detected from OCR');
    setSelectValue('uniformSize', registrationDraft.uniformSize, 'Detected from OCR');
    const uniformNotesField = document.getElementById('uniformNotes');
    if (uniformNotesField) {
      uniformNotesField.value = registrationDraft.uniformNotes;
    }
  }

  const detailParts = [];
  if (studentName) detailParts.push('name');
  if (course) detailParts.push('course');
  if (yearLevel) detailParts.push('year level');
  if (subjects.length) detailParts.push(`${subjects.length} module(s)`);
  if (parsedBooks.length) detailParts.push(`${parsedBooks.length} book item(s)`);
  if (parsedUniformItems.length) detailParts.push(`${parsedUniformItems.length} uniform item(s)`);

  if (detailParts.length) {
    setOrfMessage(`ORF extracted with ${Math.round(Number(confidence || 0))}% confidence using ${pass || 'ocr'} mode. Detected ${detailParts.join(', ')}. Parser score: ${score}. Review all fields before submitting.`, 'green');
  } else {
    setOrfMessage(`OCR ran with ${Math.round(Number(confidence || 0))}% confidence using ${pass || 'ocr'} mode, but it could not confidently map the ORF fields. Review and complete the form manually.`, 'amber');
  }

  updateRegistrationSummary();
}

async function extractOrfData(file) {
  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
    throw new Error('Authentication expired');
  }
  const formData = new FormData();
  formData.append('orfImage', file);

  const response = await fetch('/api/auth/extract-orf', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Failed to extract ORF');
  }

  return data;
}

document.addEventListener('DOMContentLoaded', async () => {
  startHeaderClock();
  ensureDashboardUI();
  setupDashboardSectionNavigation();
  populateCatalogSelects();
  renderRegistrationStepper();
  attachRegistrationDraftListeners();

  initOverviewCardLinks();

  // Header Dropdown Logic
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target)) {
        userDropdown.classList.remove('show');
      }
    });
  }

  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
    return;
  }

  await loadUserInfo();
  setInterval(() => {
    loadPickupNotifications();
  }, 30000);
});

async function loadUserInfo() {
  const token = getStoredToken();
  console.log('loadUserInfo: Token from localStorage:', token ? 'Found' : 'Not found');
  console.log('loadUserInfo: Token length:', token ? token.length : 0);
  
  if (!token) {
    console.error('loadUserInfo: No token found, redirecting to login');
    redirectToLogin();
    return;
  }
  const errorEl = document.getElementById('userInfoError');
  const errorText = document.getElementById('userInfoErrorText');

  const cachedUser = StudentHeader.getCachedStudentProfile();
  if (cachedUser) StudentHeader.applyStudentHeader(cachedUser);

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
    console.log('loadUserInfo: Fetching /api/auth/me...');
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    console.log('loadUserInfo: Response status:', response.status);
    console.log('loadUserInfo: Response ok:', response.ok);

    if (response.ok) {
      currentUser = await response.json();
      clearError();
      hydrateRegistrationDraft(currentUser);
      populateRegistrationForm(currentUser);
      updateRegistrationStatusUI(currentUser.status);
      await loadPickupNotifications();
      StudentHeader.cacheStudentProfile(currentUser);
      StudentHeader.applyStudentHeader(currentUser);
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

document.getElementById('userInfoErrorRetry')?.addEventListener('click', () => {
  loadUserInfo();
});

document.getElementById('logoutBtn')?.addEventListener('click', endSession);

// The three overview cards lift on hover like buttons, so they now open the
// section they summarise: Registration and Request Items go to the request
// workflow, Next Pickup expands the pickup notifications below.
function initOverviewCardLinks() {
  const highlights = document.getElementById('dashboardHighlights');
  if (!highlights) return;

  const activate = card => {
    const target = card.dataset.overviewLink;
    if (target === 'request') {
      window.location.hash = '#request';
    } else if (target === 'pickup') {
      pickupSectionExpanded = true;
      renderPickupSectionMode();
      document.getElementById('pickupNotifications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  highlights.addEventListener('click', event => {
    const card = event.target.closest('[data-overview-link]');
    if (card) activate(card);
  });
  highlights.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[data-overview-link]');
    if (!card) return;
    event.preventDefault();
    activate(card);
  });
}

document.getElementById('completeRegistrationForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Enter in any step field submits the form implicitly (the hidden Submit
  // button is still the form's default button). Before the summary step that
  // must behave like Next, so the request is only ever sent from the last step.
  if (registrationStepIndex < REGISTRATION_STEPS.length - 1) {
    goToRegistrationStep(registrationStepIndex + 1);
    return;
  }

  if (registrationSubmitting) return;

  updateRegistrationSummary();

  const name = document.getElementById('editName').value.trim();
  const age = document.getElementById('editAge').value.trim();
  const course = document.getElementById('editCourse').value.trim();
  const yearLevel = document.getElementById('editYearLevel').value.trim();
  const studentType = document.getElementById('studentType').value.trim();
  const module = registrationDraft.modules.join('; ');
  const books = registrationDraft.books.join('; ');
  const uniformType = [registrationDraft.uniformType, registrationDraft.uniformSize, registrationDraft.uniformNotes]
    .filter(Boolean)
    .join(' - ');
  const pictureOfId = registrationDraft.pictureOfId || String(currentUser?.pictureOfId || '').trim();
  const hasRequestedItems = Boolean(module || books || registrationDraft.uniformType);

  if (!name || !age || !course) {
    setRegistrationStep(1);
    showWorkflowMessage('Enter your name, age, and course before submitting.', 'error');
    return;
  }

  if (!pictureOfId) {
    setRegistrationStep(0);
    showWorkflowMessage('Upload your ORF first so the request includes your document.', 'error');
    return;
  }

  if (!hasRequestedItems) {
    setRegistrationStep(2);
    showWorkflowMessage('Select at least one module, book, or uniform before submitting.', 'error');
    return;
  }

  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
    return;
  }

  const submitBtn = document.getElementById('registrationSubmitBtn');
  registrationSubmitting = true;

  try {
    await UIKit.withBusy(submitBtn, async () => {
      try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('fullname', name);
        formData.append('age', age);
        formData.append('module', module);
        formData.append('uniformType', uniformType);
        formData.append('books', books);
        formData.append('course', course);
        formData.append('yearLevel', yearLevel);
        formData.append('studentType', studentType);
        formData.append('resubmit', 'true');

        if (registrationDraft.pictureOfIdFile instanceof File) {
          formData.append('orfImage', registrationDraft.pictureOfIdFile);
        }
        formData.append('pictureOfId', pictureOfId);

        const response = await fetch('/api/auth/update-profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.status === 401) {
          endSession();
          return;
        }

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          if (data?.status) {
            currentUser = { ...(currentUser || {}), status: String(data.status).toLowerCase() };
            updateRegistrationStatusUI(currentUser.status);
            await loadPickupNotifications();
          }
          UIKit.toast(data.message || 'Registration saved successfully', 'success');
          await loadUserInfo();
        } else {
          const data = await response.json().catch(() => ({}));
          UIKit.toast(data.error || 'Error completing registration', 'error');
        }
      } catch (error) {
        UIKit.toast('Error completing registration. Check your connection and try again.', 'error');
      }
    }, { busyText: 'Submitting\u2026' });
  } finally {
    registrationSubmitting = false;
  }
});

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

