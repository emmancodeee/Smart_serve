// ---------------------------------------------------------------------------
// Student sidebar
//
// Single source of truth for the student navigation, mirroring admin-nav.js.
// It replaces six hand-copied sidebars that had drifted apart: the Dashboard
// link pointed at /dashboard#dashboard on some pages, the schedule page called
// Request "Registration", and Schedule was only linked from its own page.
//
// Rendered into ul[data-student-nav] (the ul keeps its old grid classes because
// theme.css styles `aside > ul.grid`). dashboard.js still switches Dashboard /
// Request in place through the data-sidebar-view attributes kept here.
// ---------------------------------------------------------------------------

const STUDENT_NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    sidebarView: 'dashboard',
    icon: '<path d="M3 11.5 12 4l9 7.5"></path><path d="M5 10.5V20h14v-9.5"></path>'
  },
  {
    key: 'profile',
    label: 'User Profile',
    href: '/profile',
    icon: '<path d="M20 21a8 8 0 1 0-16 0"></path><circle cx="12" cy="7" r="4"></circle>'
  },
  {
    key: 'request',
    label: 'Request',
    href: '/dashboard#request',
    sidebarView: 'request',
    icon: '<path d="M4 7h16"></path><path d="M4 12h10"></path><path d="M4 17h8"></path><path d="M18 15v6"></path><path d="M15 18h6"></path>'
  },
  {
    key: 'announcement',
    label: 'Announcements',
    href: '/announcement',
    icon: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>'
  },
  {
    key: 'feedback',
    label: 'Feedback',
    href: '/feedback',
    icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>'
  },
  {
    key: 'returns',
    label: 'Returns',
    href: '/returns',
    icon: '<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>'
  },
  {
    // A clock rather than the calendar Announcements already uses.
    key: 'schedule',
    label: 'Schedule',
    href: '/schedule',
    icon: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>'
  }
];

// Preserved from the hand-copied markup so theme.css keeps styling the links.
const STUDENT_NAV_LINK_CLASS = 'dashboard-sidebar-link app-nav-link flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent px-5 py-4 text-[0.96rem] font-semibold text-white transition duration-200 hover:translate-x-1 hover:border-yellow-300 hover:bg-yellow-400/15 hover:shadow-lg';

// /announcement is also reachable as /announcement.html.
function studentNavActiveKey() {
  const path = window.location.pathname.replace(/\/+$/, '').replace(/\.html$/, '').toLowerCase() || '/';
  if (path === '/dashboard') {
    return window.location.hash.toLowerCase() === '#request' ? 'request' : 'dashboard';
  }
  const match = STUDENT_NAV_ITEMS.find(item => item.href === path);
  return match ? match.key : null;
}

function renderStudentNav() {
  const activeKey = studentNavActiveKey();

  document.querySelectorAll('[data-student-nav]').forEach(list => {
    list.innerHTML = '';
    STUDENT_NAV_ITEMS.forEach(item => {
      const li = document.createElement('li');

      const link = document.createElement('a');
      link.href = item.href;
      link.className = STUDENT_NAV_LINK_CLASS;
      if (item.sidebarView) link.setAttribute('data-sidebar-view', item.sidebarView);
      if (item.key === activeKey) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }

      const icon = document.createElement('span');
      icon.className = 'student-nav-icon app-nav-icon';
      icon.innerHTML = `<svg class="h-6 w-6 text-yellow-300" width="22" height="22" style="width:22px;height:22px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${item.icon}</svg>`;

      // Kept in the DOM when the rail is collapsed so the link keeps its
      // accessible name; app-shell.css only hides it visually.
      const label = document.createElement('span');
      label.className = 'app-nav-label';
      label.textContent = item.label;

      link.append(icon, label);
      li.appendChild(link);
      list.appendChild(li);
    });
  });
}

// Header notifications for students (rendered by app-shell.js): their own
// recent updates, read from the endpoints the pages already use — the
// registration decision and pickup date (/me), announcements, admin replies to
// their feedback and decisions on their return requests. Every item is dated,
// so app-shell marks it unread when it is newer than the last time the panel
// was opened.
const STUDENT_NOTIFICATION_WINDOW_DAYS = 30;

const RETURN_STATUS_NOTICES = {
  approved: 'Your return request was approved',
  rejected: 'Your return request was not approved',
  completed: 'Your return has been completed'
};

async function loadStudentNotifications() {
  const token = localStorage.getItem('token');
  if (!token) return [];
  const getJson = async url => {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };
  const since = Date.now() - STUDENT_NOTIFICATION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const isRecent = value => {
    const time = new Date(value).getTime();
    return Number.isFinite(time) && time >= since;
  };
  const formatDay = value => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const [me, announcements, feedbacks, returns] = await Promise.allSettled([
    getJson('/api/auth/me'),
    getJson('/api/auth/announcements'),
    getJson('/api/auth/feedback'),
    getJson('/api/auth/returns')
  ]);
  if ([me, announcements, feedbacks, returns].every(result => result.status === 'rejected')) {
    throw new Error('Notifications unavailable');
  }
  const listOf = result => (result.status === 'fulfilled' && Array.isArray(result.value) ? result.value : []);
  const items = [];

  if (me.status === 'fulfilled' && me.value && isRecent(me.value.registrationUpdatedAt)) {
    const status = String(me.value.status || '').toLowerCase();
    if (status === 'approved') {
      items.push({
        key: 'registration',
        title: me.value.pickupDate
          ? `Request approved — pickup on ${formatDay(me.value.pickupDate)}`
          : 'Your request was approved',
        meta: 'Request',
        href: '/dashboard',
        tone: 'info',
        date: me.value.registrationUpdatedAt
      });
    } else if (status === 'rejected') {
      items.push({
        key: 'registration',
        title: 'Your request was not approved',
        meta: 'Request',
        href: '/dashboard#request',
        tone: 'danger',
        date: me.value.registrationUpdatedAt
      });
    }
  }

  listOf(announcements)
    .filter(item => isRecent(item?.publishedAt))
    .slice(0, 5)
    .forEach(item => items.push({
      key: `announcement:${item._id}`,
      title: item.title || 'New announcement',
      meta: 'Announcement',
      href: '/announcement',
      tone: ['high', 'critical'].includes(String(item.priority).toLowerCase()) ? 'danger' : 'info',
      date: item.publishedAt
    }));

  listOf(feedbacks).forEach(feedback => {
    const replies = Array.isArray(feedback?.adminResponses) ? feedback.adminResponses : [];
    const latest = replies.reduce((newest, reply) =>
      (!newest || new Date(reply?.createdAt) > new Date(newest.createdAt) ? reply : newest), null);
    if (!latest || !isRecent(latest.createdAt)) return;
    items.push({
      key: `feedback:${feedback._id}`,
      title: `New reply to "${feedback.subject || 'your feedback'}"`,
      meta: 'Feedback',
      href: '/feedback',
      tone: 'info',
      date: latest.createdAt
    });
  });

  listOf(returns).forEach(request => {
    const notice = RETURN_STATUS_NOTICES[String(request?.status || '').toLowerCase()];
    if (!notice || !isRecent(request.updatedAt)) return;
    items.push({
      key: `return:${request._id}`,
      title: notice,
      meta: 'Returns',
      href: '/returns',
      tone: request.status === 'rejected' ? 'danger' : 'info',
      date: request.updatedAt
    });
  });

  return items
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
}

if (window.AppShell) {
  let studentEmail = '';
  try {
    studentEmail = JSON.parse(localStorage.getItem('smartserve_student_profile') || '{}')?.email || '';
  } catch (_) {
    // No cached profile yet; the seen state is simply shared for this browser.
  }
  window.AppShell.registerNotifications({
    title: 'Notifications',
    emptyText: 'No new updates in the last 30 days.',
    scope: `student:${studentEmail}`,
    load: loadStudentNotifications
  });
}

// Loaded from <head>, so this runs before the page scripts' own
// DOMContentLoaded handlers (dashboard.js toggles the active link then).
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderStudentNav, { once: true });
} else {
  renderStudentNav();
}
