let allSchedules = [];
let currentView = 'day';
let currentDate = new Date();
let currentEventId = null;
let scheduleRefreshInterval = null;
let summaryRefreshInterval = null;
let minuteTickTimeout = null;
let currentUser = null;
const VIEW_ONLY_MODE = true;
const DISPLAY_TIMEZONE = 'Asia/Manila';
const STUDENT_PROFILE_KEY = 'smartserve_student_profile';
const DEFAULT_EVENT_COLOR = '#3498db';

function redirectToLogin() {
  window.location.replace('/');
}

// Clears the session (token and the cached header profile) and returns to the
// sign-in page. Used for Logout and whenever the API rejects the token.
function endSession() {
  localStorage.removeItem('token');
  localStorage.removeItem(STUDENT_PROFILE_KEY);
  redirectToLogin();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Schedule titles embed module names that were saved through sanitize-html,
// which stores them entity-encoded ("A & B" -> "A &amp; B"). Decode those
// entities before escaping so the text reads as typed instead of "&amp;".
function safeText(value) {
  return escapeHtml(String(value ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&amp;/g, '&'));
}

// Event colors go into style attributes, so only plain hex colors are used.
function safeColor(value) {
  const color = String(value || '').trim();
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : DEFAULT_EVENT_COLOR;
}

// YYYY-MM-DD from the local calendar date. toISOString() is UTC, so in the
// Philippines (UTC+8) it returns the previous day for local midnight, which
// put every mini-calendar date (and "today" before 08:00) one day early.
function toLocalDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// new Date('YYYY-MM-DD') is parsed as UTC midnight; read the date input as a
// local calendar date instead so day/week/month views match the picked day.
function parseDateKey(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) return new Date();
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
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

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  startHeaderClock();
  bindStaticListeners();
  loadHeaderUser();
  // Set before the first render so the mini calendar can mark the selected day.
  document.getElementById('dateSelector').value = toLocalDateKey(new Date());
  renderMiniCalendar();
  loadSchedules();
  loadSummary();
  startRealtimeScheduler();
});

function bindStaticListeners() {
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('previousMonthBtn')?.addEventListener('click', previousMonth);
  document.getElementById('nextMonthBtn')?.addEventListener('click', nextMonth);
  document.getElementById('dateSelector')?.addEventListener('change', event => {
    // Keep the mini calendar on the picked month and highlight the picked day.
    if (event.target.value) {
      const picked = parseDateKey(event.target.value);
      currentDate = new Date(picked.getFullYear(), picked.getMonth(), 1);
      renderMiniCalendar();
    }
    loadScheduleForDate();
  });
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', event => {
      switchView(button.getAttribute('data-view'), event);
    });
  });
  document.getElementById('eventStart')?.addEventListener('change', async () => {
    validateTimes();
    await checkConflicts();
  });
  document.getElementById('eventEnd')?.addEventListener('change', async () => {
    validateTimes();
    await checkConflicts();
  });
  document.getElementById('eventRecurring')?.addEventListener('change', toggleRecurrence);
  document.getElementById('eventModalCloseBtn')?.addEventListener('click', closeEventModal);
  document.getElementById('eventModalCancelBtn')?.addEventListener('click', closeEventModal);
  document.getElementById('detailsModalCloseBtn')?.addEventListener('click', closeDetailsModal);
  document.getElementById('detailsModalFooterCloseBtn')?.addEventListener('click', closeDetailsModal);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeDetailsModal();
    closeEventModal();
  });

  document.getElementById('miniCalendar')?.addEventListener('click', event => {
    const target = event.target.closest('[data-action="select-date"]');
    if (!target) return;
    selectDate(target.getAttribute('data-date'));
  });

  document.getElementById('dayView')?.addEventListener('click', handleEventCardClick);
  document.getElementById('weekView')?.addEventListener('click', handleEventCardClick);
  document.getElementById('listView')?.addEventListener('click', handleEventCardClick);
}

function handleEventCardClick(event) {
  const target = event.target.closest('[data-action="show-event-details"]');
  if (!target) return;
  showEventDetails(target.getAttribute('data-event-id'));
}

function checkAuth() {
  const token = getStoredToken();
  if (!token) {
    redirectToLogin();
  }
}

function logout() {
  endSession();
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

function formatDateTimePH(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-PH', {
    timeZone: DISPLAY_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

function formatTimePH(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleTimeString('en-PH', {
    timeZone: DISPLAY_TIMEZONE,
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
  badge.className = 'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-bold';

  if (!normalized) {
    badge.classList.add('border-slate-300', 'bg-slate-100', 'text-slate-700');
    return;
  }

  if (normalized === 'approved') {
    badge.classList.add('border-emerald-300', 'bg-emerald-100', 'text-emerald-800');
    return;
  }
  if (normalized === 'rejected') {
    badge.classList.add('border-red-300', 'bg-red-100', 'text-red-800');
    return;
  }

  badge.classList.add('border-yellow-300', 'bg-[#fef3c7]', 'text-amber-800');
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
      endSession();
      return;
    }
    if (!response.ok) return;

    currentUser = await response.json().catch(() => null);
    StudentHeader.cacheStudentProfile(currentUser);
    StudentHeader.applyStudentHeader(currentUser);
    applyHeaderStatus(currentUser?.status);
  } catch (_) {
  }
}

function renderMiniCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '';
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  const today = new Date();
  const selectedKey = document.getElementById('dateSelector')?.value || '';
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = date.toDateString() === today.toDateString();
    const dateStr = toLocalDateKey(date);
    const isSelected = dateStr === selectedKey;
    const baseClasses = 'calendar-day flex aspect-square cursor-pointer items-center justify-center rounded-md border text-sm font-semibold transition';
    // is-today / is-selected are styled in schedule.html: theme.css resets the
    // .calendar-day colors with !important, which hid the utility classes.
    const todayClasses = 'is-today border-blue-700 bg-blue-700 text-white';
    const normalClasses = 'border-blue-100 bg-blue-50 text-slate-700 hover:border-blue-300 hover:bg-blue-100';
    html += `<button type="button" class="${baseClasses} ${isToday ? todayClasses : normalClasses}${isSelected ? ' is-selected' : ''}" data-action="select-date" data-date="${dateStr}" aria-pressed="${isSelected}"${isToday ? ' aria-current="date"' : ''}>${day}</button>`;
  }

  document.getElementById('miniCalendar').innerHTML = html;
}

function previousMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderMiniCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderMiniCalendar();
}

function selectDate(dateStr) {
  document.getElementById('dateSelector').value = dateStr;
  renderMiniCalendar();
  loadScheduleForDate();
}

async function loadSchedules() {
  try {
    const token = getStoredToken();
    if (!token) {
      redirectToLogin();
      return;
    }
    const response = await fetch('/api/auth/schedule', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 401 || response.status === 403) {
      endSession();
      return;
    }

    if (!response.ok) throw new Error('Failed to load schedule');

    allSchedules = await response.json();
    refreshCurrentView();
  } catch (error) {
    console.error('Error loading schedule:', error);
  }
}

async function loadSummary() {
  try {
    const token = getStoredToken();
    if (!token) {
      redirectToLogin();
      return;
    }
    const response = await fetch('/api/auth/schedule/analytics/summary', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load summary');

    const stats = await response.json();
    document.getElementById('totalCount').textContent = stats.totalSchedules;
    document.getElementById('upcomingCount').textContent = stats.upcomingEvents;
    document.getElementById('busyHours').textContent = stats.busyHours + 'h';
  } catch (error) {
    console.error('Error loading summary:', error);
  }
}

function switchView(view, event) {
  currentView = view;

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active', 'border-[#0b1f4d]', 'bg-[#0b1f4d]', 'text-white');
    btn.classList.add('border-blue-200', 'bg-white', 'text-slate-700', 'rounded-xl', 'px-4', 'py-2.5', 'text-sm', 'font-semibold');
  });

  if (event?.currentTarget) {
    event.currentTarget.classList.add('active', 'border-[#0b1f4d]', 'bg-[#0b1f4d]', 'text-white');
    event.currentTarget.classList.remove('border-blue-200', 'bg-white', 'text-slate-700');
  }

  document.querySelectorAll('.schedule-view').forEach(v => v.classList.add('hidden'));

  switch (view) {
    case 'day':
      document.getElementById('calendarView').classList.remove('hidden');
      loadDayView();
      break;
    case 'week':
      document.getElementById('weekView').classList.remove('hidden');
      loadWeekView();
      break;
    case 'month':
      document.getElementById('monthView').classList.remove('hidden');
      loadMonthView();
      break;
    case 'list':
      document.getElementById('listView').classList.remove('hidden');
      loadListView();
      break;
  }
}

function loadScheduleForDate() {
  refreshCurrentView();
}

function displaySchedules() {
  const dateStr = document.getElementById('dateSelector').value;
  const selectedDate = parseDateKey(dateStr);

  const daySchedules = allSchedules.filter(s => new Date(s.startTime).toDateString() === selectedDate.toDateString())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const dayViewHtml = daySchedules.map(schedule => {
    const startTime = formatTimePH(schedule.startTime);
    const endTime = formatTimePH(schedule.endTime);
    const color = safeColor(schedule.color);
    return `
      <button type="button" class="schedule-item cursor-pointer rounded-xl border border-blue-100 p-4 text-left shadow-sm transition hover:translate-x-0.5 hover:shadow" style="border-left: 4px solid ${color}; background: rgba(${hexToRgb(color)}, 0.05);" data-action="show-event-details" data-event-id="${escapeHtml(schedule._id)}">
        <div class="schedule-time mb-1 text-sm font-semibold text-slate-500">${escapeHtml(startTime)} - ${escapeHtml(endTime)}</div>
        <div class="schedule-title mb-2 text-lg font-bold text-blue-900">${safeText(schedule.title)}</div>
        <div class="schedule-meta mb-2 flex flex-wrap gap-2">
          <span class="badge rounded-full px-3 py-1 text-xs font-semibold text-white" style="background: ${color}; color: white;">${safeText(schedule.type)}</span>
          <span class="priority-badge rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadgeClasses(schedule.priority)}">${safeText(schedule.priority)}</span>
        </div>
        ${schedule.location ? `<div class="schedule-location text-sm text-slate-600">Location: ${safeText(schedule.location)}</div>` : ''}
      </button>
    `;
  }).join('');

  document.getElementById('dayView').innerHTML = daySchedules.length
    ? dayViewHtml
    : '<div class="schedule-empty-state">No events scheduled for this day</div>';
}

function loadDayView() {
  displaySchedules();
}

function loadWeekView() {
  const date = parseDateKey(document.getElementById('dateSelector').value);
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  let html = '<div class="week-grid grid gap-3 md:grid-cols-3 xl:grid-cols-7">';
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const daySchedules = allSchedules.filter(s => new Date(s.startTime).toDateString() === day.toDateString());
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()];

    html += `
      <div class="week-day rounded-xl border border-blue-100 bg-slate-50 p-3">
        <div class="week-day-header mb-2 border-b border-blue-100 pb-2 font-bold text-blue-900">${dayName} ${day.getDate()}</div>
        <div class="week-day-events space-y-2">
          ${daySchedules.map(s => `
            <button type="button" class="mini-event cursor-pointer rounded-lg p-2 text-left text-sm shadow-sm transition hover:scale-[1.02]" style="background: ${safeColor(s.color)}; color: white;" data-action="show-event-details" data-event-id="${escapeHtml(s._id)}">
              <small>${escapeHtml(formatTimePH(s.startTime))}</small>
              <div>${safeText(s.title)}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }
  html += '</div>';
  document.getElementById('weekView').innerHTML = html;
}

function loadMonthView() {
  const date = parseDateKey(document.getElementById('dateSelector').value);
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '<div class="month-grid grid grid-cols-7 gap-2">';
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(dayName => {
    html += `<div class="month-day-header py-2 text-center text-sm font-bold text-blue-900">${dayName}</div>`;
  });

  for (let i = 0; i < firstDay; i++) {
    html += '<div class="month-cell empty rounded-lg border border-transparent bg-transparent"></div>';
  }

  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const isToday = cellDate.toDateString() === today.toDateString();
    const daySchedules = allSchedules.filter(s => new Date(s.startTime).toDateString() === cellDate.toDateString());

    html += `
      <div class="month-cell rounded-lg border p-2 ${isToday ? 'border-blue-600 bg-blue-50' : 'border-blue-100 bg-slate-50'}">
        <div class="month-day-number mb-1 text-sm font-bold text-blue-900">${day}</div>
        <div class="month-events flex flex-wrap gap-1">
          ${daySchedules.slice(0, 2).map(s => `<div class="month-event-dot h-2 w-2 rounded-full" style="background: ${safeColor(s.color)};" title="${safeText(s.title)}"></div>`).join('')}
          ${daySchedules.length > 2 ? `<small class="text-xs text-slate-600">+${daySchedules.length - 2}</small>` : ''}
        </div>
      </div>
    `;
  }

  html += '</div>';
  document.getElementById('monthView').innerHTML = html;
}

function loadListView() {
  const upcoming = allSchedules.filter(s => s.status !== 'Cancelled' && new Date(s.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const html = upcoming.map(s => {
    const startStr = new Date(s.startTime).toLocaleString('en-PH', {
      timeZone: DISPLAY_TIMEZONE,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `
      <button type="button" class="list-item grid w-full cursor-pointer gap-3 rounded-xl border border-blue-100 bg-slate-50 p-4 text-left transition hover:bg-white hover:shadow md:grid-cols-[160px_1fr_auto]" style="border-left: 5px solid ${safeColor(s.color)};" data-action="show-event-details" data-event-id="${escapeHtml(s._id)}">
        <div class="list-item-time text-sm font-bold text-blue-700">${escapeHtml(startStr)}</div>
        <div class="list-item-details">
          <div class="list-item-title text-base font-bold text-blue-900">${safeText(s.title)}</div>
          <div class="list-item-meta text-sm text-slate-600">${s.location ? `Location: ${safeText(s.location)}` : ''} ${s.module ? `Module: ${safeText(s.module)}` : ''}</div>
        </div>
        <div class="list-item-badges flex flex-wrap gap-2">
          <span class="badge rounded-full px-3 py-1 text-xs font-semibold text-white" style="background: ${safeColor(s.color)}; color: white;">${safeText(s.type)}</span>
          <span class="priority-badge rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadgeClasses(s.priority)}">${safeText(s.priority)}</span>
        </div>
      </button>
    `;
  }).join('');

  document.getElementById('scheduleList').innerHTML = html || '<div class="schedule-empty-state">No upcoming events</div>';
}

function openAddEventModal() {
  if (VIEW_ONLY_MODE) {
    UIKit.toast('Scheduler is in view-only mode.', 'info');
    return;
  }
  currentEventId = null;
  document.getElementById('modalTitle').textContent = 'Add New Event';
  document.getElementById('eventForm').reset();
  document.getElementById('eventId').value = '';

  const now = new Date();
  const start = new Date(now.getTime() + 60000);
  const end = new Date(start.getTime() + 3600000);

  document.getElementById('eventStart').value = formatDateTimeLocal(start);
  document.getElementById('eventEnd').value = formatDateTimeLocal(end);
  document.getElementById('eventRecurring').checked = false;
  document.getElementById('recurrenceOptions').style.display = 'none';
  document.getElementById('conflictWarning').classList.add('hidden');

  const modal = document.getElementById('eventModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeEventModal() {
  const modal = document.getElementById('eventModal');
  modal.classList.remove('flex');
  modal.classList.add('hidden');
}

function closeDetailsModal() {
  const modal = document.getElementById('detailsModal');
  modal.classList.remove('flex');
  modal.classList.add('hidden');
}

function toggleRecurrence() {
  const isRecurring = document.getElementById('eventRecurring').checked;
  document.getElementById('recurrenceOptions').style.display = isRecurring ? 'block' : 'none';
}

function validateTimes() {
  const start = new Date(document.getElementById('eventStart').value);
  const end = new Date(document.getElementById('eventEnd').value);
  if (end <= start) {
    document.getElementById('eventEnd').value = formatDateTimeLocal(new Date(start.getTime() + 3600000));
  }
}

async function checkConflicts() {
  const start = document.getElementById('eventStart').value;
  const end = document.getElementById('eventEnd').value;

  try {
    const token = getStoredToken();
    if (!token) {
      redirectToLogin();
      return false;
    }
    const response = await fetch('/api/auth/schedule/check-conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ startTime: start, endTime: end, excludeId: currentEventId })
    });

    const data = await response.json();
    document.getElementById('conflictWarning').classList.toggle('hidden', !data.hasConflicts);
    return !data.hasConflicts;
  } catch (error) {
    console.error('Error checking conflicts:', error);
    return false;
  }
}

document.getElementById('eventForm')?.addEventListener('submit', async event => {
  event.preventDefault();
  if (VIEW_ONLY_MODE) {
    UIKit.toast('Scheduler is in view-only mode.', 'info');
    closeEventModal();
    return;
  }

  await checkConflicts();

  const eventData = {
    title: document.getElementById('eventTitle').value,
    type: document.getElementById('eventType').value,
    description: document.getElementById('eventDescription').value,
    startTime: document.getElementById('eventStart').value,
    endTime: document.getElementById('eventEnd').value,
    location: document.getElementById('eventLocation').value,
    module: document.getElementById('eventModule').value,
    instructor: document.getElementById('eventInstructor').value,
    priority: document.getElementById('eventPriority').value,
    reminders: [parseInt(document.getElementById('eventReminder').value, 10) || 0],
    color: document.getElementById('eventColor').value,
    isRecurring: document.getElementById('eventRecurring').checked,
    recurrencePattern: document.getElementById('eventRecurring').checked ? document.getElementById('recurrencePattern').value : null,
    recurrenceEnd: document.getElementById('eventRecurring').checked ? document.getElementById('recurrenceEnd').value : null
  };

  try {
    const token = getStoredToken();
    if (!token) {
      redirectToLogin();
      return;
    }
    let url = '/api/auth/schedule/add';
    let method = 'POST';
    if (currentEventId) {
      url = `/api/auth/schedule/${currentEventId}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });

    if (!response.ok) throw new Error('Failed to save event');
    UIKit.toast((currentEventId ? 'Event updated' : 'Event added') + ' successfully.', 'success');
    closeEventModal();
    loadSchedules();
    loadSummary();
  } catch (error) {
    console.error('Error saving event:', error);
    UIKit.toast('Failed to save event', 'error');
  }
});

function showEventDetails(eventId) {
  const selectedEvent = allSchedules.find(s => s._id === eventId);
  if (!selectedEvent) return;

  currentEventId = eventId;
  const start = new Date(selectedEvent.startTime);
  const end = new Date(selectedEvent.endTime);
  // safeText undoes the stored entity encoding, then escapes for innerHTML.
  document.getElementById('detailsTitle').innerHTML = safeText(selectedEvent.title);
  document.getElementById('detailsContent').innerHTML = `
    <div class="event-details space-y-2">
      <div class="detail-row flex border-b border-slate-200 py-2"><span class="detail-label min-w-[120px] font-semibold text-slate-700">Type:</span><span class="badge rounded-full px-3 py-1 text-xs font-semibold text-white" style="background: ${safeColor(selectedEvent.color)}; color: white;">${safeText(selectedEvent.type)}</span></div>
      <div class="detail-row flex border-b border-slate-200 py-2"><span class="detail-label min-w-[120px] font-semibold text-slate-700">Priority:</span><span class="priority-badge rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadgeClasses(selectedEvent.priority)}">${safeText(selectedEvent.priority)}</span></div>
      <div class="detail-row flex border-b border-slate-200 py-2"><span class="detail-label min-w-[120px] font-semibold text-slate-700">Time:</span><span>${escapeHtml(formatDateTimePH(start))} - ${escapeHtml(formatDateTimePH(end))}</span></div>
      ${selectedEvent.location ? `<div class="detail-row flex border-b border-slate-200 py-2"><span class="detail-label min-w-[120px] font-semibold text-slate-700">Location:</span><span>${safeText(selectedEvent.location)}</span></div>` : ''}
      ${selectedEvent.module ? `<div class="detail-row flex border-b border-slate-200 py-2"><span class="detail-label min-w-[120px] font-semibold text-slate-700">Module:</span><span>${safeText(selectedEvent.module)}</span></div>` : ''}
      ${selectedEvent.instructor ? `<div class="detail-row flex border-b border-slate-200 py-2"><span class="detail-label min-w-[120px] font-semibold text-slate-700">Instructor:</span><span>${safeText(selectedEvent.instructor)}</span></div>` : ''}
      ${selectedEvent.description ? `<div class="detail-row flex border-b border-slate-200 py-2"><span class="detail-label min-w-[120px] font-semibold text-slate-700">Description:</span><span style="white-space: pre-line;">${safeText(selectedEvent.description)}</span></div>` : ''}
      <div class="detail-row flex py-2"><span class="detail-label min-w-[120px] font-semibold text-slate-700">Duration:</span><span>${Math.round((end - start) / 60000)} minutes</span></div>
    </div>
  `;
  const modal = document.getElementById('detailsModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function formatDateTimeLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getPriorityBadgeClasses(priority) {
  const classes = {
    Low: 'bg-emerald-100 text-emerald-700',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-700',
    Critical: 'bg-rose-200 text-rose-800'
  };
  return classes[priority] || 'bg-blue-100 text-blue-700';
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '52, 152, 219';
  return parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16);
}

document.addEventListener('click', event => {
  if (event.target === document.getElementById('eventModal')) closeEventModal();
  if (event.target === document.getElementById('detailsModal')) closeDetailsModal();
});

function refreshCurrentView() {
  switch (currentView) {
    case 'week':
      loadWeekView();
      break;
    case 'month':
      loadMonthView();
      break;
    case 'list':
      loadListView();
      break;
    case 'day':
    default:
      loadDayView();
      break;
  }
}

async function refreshRealtimeData() {
  await Promise.all([loadSchedules(), loadSummary()]);
}

function scheduleNextMinuteTick() {
  if (minuteTickTimeout) clearTimeout(minuteTickTimeout);
  const now = new Date();
  const msUntilNextMinute = ((60 - now.getSeconds()) * 1000) - now.getMilliseconds();
  minuteTickTimeout = setTimeout(() => {
    refreshCurrentView();
    loadSummary();
    scheduleNextMinuteTick();
  }, Math.max(250, msUntilNextMinute));
}

function startRealtimeScheduler() {
  stopRealtimeScheduler();
  scheduleRefreshInterval = setInterval(refreshRealtimeData, 15000);
  summaryRefreshInterval = setInterval(loadSummary, 30000);
  scheduleNextMinuteTick();
}

function stopRealtimeScheduler() {
  if (scheduleRefreshInterval) {
    clearInterval(scheduleRefreshInterval);
    scheduleRefreshInterval = null;
  }
  if (summaryRefreshInterval) {
    clearInterval(summaryRefreshInterval);
    summaryRefreshInterval = null;
  }
  if (minuteTickTimeout) {
    clearTimeout(minuteTickTimeout);
    minuteTickTimeout = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  refreshRealtimeData();
});

window.addEventListener('beforeunload', stopRealtimeScheduler);
