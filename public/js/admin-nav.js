// ---------------------------------------------------------------------------
// Admin panel sidebar
//
// Single source of truth for the Admin and Super Admin navigation. This file
// replaces six hand-copied sidebar blocks that had drifted apart in their
// per-role visibility defaults, their data-view attributes, and their active
// class, which is what let role-inappropriate modules leak between pages and
// left pages without a correct active highlight.
//
// The module list, order, paths, and per-role visibility are read from the view
// registry in admin.js so a module cannot appear in the sidebar without a route
// that resolves to it. Icons and link classes are preserved exactly as they were
// authored, so the rendered sidebar is visually identical to the hand-copied
// markup it replaces.
// ---------------------------------------------------------------------------

// View keys, in the order the Admin sidebar lists them, with the legacy <li> ids
// that other code and stylesheets still reference. `roles` mirrors
// ROLE_VIEW_KEYS and is what keeps Admin and Super Admin navigations separate:
// neither role is given a module the other already had.
const ADMIN_NAV_ITEMS = [  {
    view: 'dashboard',
    label: 'Dashboard',
    href: '/admin/dashboard',
    dataView: 'dashboard',
    navItemId: null,
    icon: '<rect x="3" y="3" width="8" height="8" rx="2"></rect><rect x="13" y="3" width="8" height="5" rx="2"></rect><rect x="13" y="10" width="8" height="11" rx="2"></rect><rect x="3" y="13" width="8" height="8" rx="2"></rect>'
  },
  {
    view: 'adminaccounts',
    label: 'Admin Accounts',
    href: '/admin/accounts',
    dataView: 'adminaccounts',
    navItemId: 'adminAccountsNavItem',
    roles: ['superadmin'],
    icon: '<path d="M12 5v14"></path><path d="M5 12h14"></path><circle cx="12" cy="12" r="9"></circle>'
  },
  {
    view: 'supplystock',
    label: 'Supply & Stock',
    href: '/admin/supply-stock',
    dataView: null,
    navItemId: 'supplyStockNavItem',
    icon: '<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path><path d="M13 9l3-3 3 3"></path><path d="M13 15l3 3 3-3"></path>'
  },
  {
    view: 'inventory',
    label: 'Inventory Management',
    href: '/admin/inventory',
    dataView: null,
    navItemId: 'inventoryNavItem',
    icon: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path>'
  },
  {
    view: 'returns',
    label: 'Return Requests',
    href: '/admin/returns',
    dataView: null,
    navItemId: null,
    icon: '<path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>'
  },
  {
    view: 'transactions',
    label: 'Transactions',
    href: '/admin/transactions',
    dataView: 'transactions',
    navItemId: 'transactionsNavItem',
    icon: '<path d="M4 7h16"></path><path d="M4 12h10"></path><path d="M4 17h7"></path>'
  },
  {
    view: 'announcements',
    label: 'Announcements',
    href: '/admin/announcements',
    dataView: 'announcements',
    navItemId: 'announcementsNavItem',
    icon: '<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h10"></path>'
  },
  {
    view: 'feedback',
    label: 'Feedback Management',
    href: '/admin/feedback',
    dataView: null,
    navItemId: null,
    icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>'
  },
  {
    view: 'registrations',
    label: 'Request Management',
    href: '/admin/registrations',
    dataView: 'registrations',
    navItemId: 'registrationsNavItem',
    roles: ['admin'],
    icon: '<path d="M8 3h8l5 5v13H3V3h5Z"></path><path d="M8 3v5h8V3"></path>'
  },
  {
    view: 'pickupconfirmations',
    label: 'Pickup Confirmations',
    href: '/admin/pickup-confirmations',
    dataView: 'pickupconfirmations',
    navItemId: 'pickupConfirmationsNavItem',
    roles: ['admin'],
    icon: '<path d="M9 12l2 2 4-4"></path><path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9Z"></path>'
  }
];

// Preserved verbatim from the hand-copied markup so the sidebar renders
// identically to before this change.
const ADMIN_NAV_LINK_CLASS = 'admin-nav-link app-nav-link flex cursor-pointer items-center gap-4 rounded-2xl border border-transparent px-5 py-4 text-[0.96rem] font-semibold text-white transition duration-200 hover:translate-x-1 hover:border-yellow-300 hover:bg-yellow-400/15 hover:shadow-lg';

function adminNavCanShow(item, isSuperAdmin) {
  if (!item.roles) return true;
  return isSuperAdmin ? item.roles.includes('superadmin') : item.roles.includes('admin');
}

// Role comes from the profile cache admin.js writes, read directly so the
// standalone pages that do not load admin.js still render the correct nav.
// Rendered optimistically, then re-rendered by admin.js once the profile has
// been resolved authoritatively.
function adminNavIsSuperAdmin() {
  if (typeof isCurrentSuperAdmin === 'function') {
    return isCurrentSuperAdmin();
  }
  try {
    const raw = localStorage.getItem('smartserve_admin_profile');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && typeof parsed === 'object' && parsed.isSuperAdmin);
  } catch (_) {
    return false;
  }
}

function adminNavListContainers() {
  return document.querySelectorAll('[data-admin-nav]');
}

// Resolves the active module from the address bar by matching the current path
// against each item's href. Done here rather than via admin.js's resolver so the
// five standalone pages, which do not load admin.js, still get a correct
// highlight on first paint.
function adminNavActiveViewKey() {
  const current = normalizeAdminNavPath(window.location.pathname);
  if (!current) return null;
  const match = ADMIN_NAV_ITEMS.find(item => normalizeAdminNavPath(item.href) === current);
  return match ? match.view : null;
}

function normalizeAdminNavPath(pathname) {
  if (typeof pathname !== 'string' || !pathname) return '';
  const trimmed = pathname.replace(/\/+$/, '');
  return (trimmed || '/').toLowerCase();
}

// Renders the sidebar and marks the active item. Runs on first paint for every
// admin page, and again from admin.js once the profile is authoritative.
function renderAdminNav() {
  paintAdminNav();
  const viewKey = adminNavActiveViewKey();
  if (viewKey) applyAdminNavActiveState(viewKey);
}

function paintAdminNav() {
  const isSuperAdmin = adminNavIsSuperAdmin();

  adminNavListContainers().forEach(list => {
    list.innerHTML = '';
    ADMIN_NAV_ITEMS.forEach(item => {
      if (!adminNavCanShow(item, isSuperAdmin)) return;

      const li = document.createElement('li');
      if (item.navItemId) li.id = item.navItemId;

      const link = document.createElement('a');
      link.href = item.href;
      link.className = ADMIN_NAV_LINK_CLASS;
      link.setAttribute('data-nav-id', item.view);
      // data-view marks the modules that switch client-side inside the admin
      // shell. The rest are their own documents and navigate normally.
      if (item.dataView) link.setAttribute('data-view', item.dataView);

      const icon = document.createElement('span');
      icon.className = 'admin-nav-icon app-nav-icon';
      icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${item.icon}</svg>`;

      // The label stays in the DOM when the rail is collapsed, so the link keeps
      // its accessible name; app-shell.css only hides it visually.
      const label = document.createElement('span');
      label.className = 'app-nav-label';
      label.textContent = item.label;

      link.append(icon, label);
      li.appendChild(link);
      list.appendChild(li);
    });
  });
}

// Applies the active highlight. Called synchronously on click, on popstate, and
// on boot, so exactly one item is active and the highlight never waits on a
// request. Matching is by resolved view key, which the renderer writes onto every
// link as data-nav-id.
function applyAdminNavActiveState(viewKey) {
  document.querySelectorAll('.sidebar-shell a[data-nav-id], .sidebar a[data-nav-id]').forEach(link => {
    const isMatch = link.getAttribute('data-nav-id') === viewKey;
    link.classList.toggle('active', isMatch);
    if (isMatch) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAdminNav, { once: true });
} else {
  renderAdminNav();
}

// Header notifications (rendered by app-shell.js): what needs an admin's
// attention right now, read from the same list endpoints the modules use —
// limit=1 fetches only the pagination total. Pending registrations are counted
// only for regular admins, matching the sidebar (super admins cannot open that
// module). Pickup confirmations are deliberately not polled: that GET also
// marks overdue pickups as no-shows.
async function loadAdminNotifications() {
  const token = localStorage.getItem('token');
  if (!token) return [];
  const getJson = async url => {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  const sources = [
    !adminNavIsSuperAdmin() && {
      key: 'registrations',
      href: '/admin/registrations',
      meta: 'Request Management',
      tone: 'warning',
      title: n => `${plural(n, 'registration')} awaiting review`,
      // Same bucketing as the Request Management tables: anything not
      // approved or rejected is pending.
      count: async () => {
        const rows = await getJson('/api/auth/admin/registrations');
        return (Array.isArray(rows) ? rows : []).filter(reg => {
          const status = String(reg?.userId?.status || 'pending').toLowerCase();
          return status !== 'approved' && status !== 'rejected';
        }).length;
      }
    },
    {
      key: 'returns',
      href: '/admin/returns',
      meta: 'Return Requests',
      tone: 'warning',
      title: n => `${plural(n, 'return request')} pending`,
      count: async () => Number((await getJson('/api/auth/admin/returns?status=pending&limit=1'))?.pagination?.total) || 0
    },
    {
      key: 'feedback',
      href: '/admin/feedback',
      meta: 'Feedback Management',
      tone: 'info',
      title: n => `${plural(n, 'feedback item')} pending`,
      count: async () => Number((await getJson('/api/auth/admin/feedback?status=pending&limit=1'))?.pagination?.total) || 0
    },
    {
      key: 'low-stock',
      href: '/admin/inventory',
      meta: 'Inventory Management',
      tone: 'danger',
      title: n => `${plural(n, 'item')} at or below reorder level`,
      count: async () => Number((await getJson('/api/auth/inventory/analytics/summary'))?.lowStockItems) || 0
    }
  ].filter(Boolean);

  const results = await Promise.allSettled(sources.map(source => source.count()));
  if (results.every(result => result.status === 'rejected')) {
    throw new Error('Notifications unavailable');
  }
  return sources
    .map((source, index) => ({ source, result: results[index] }))
    .filter(({ result }) => result.status === 'fulfilled' && result.value > 0)
    .map(({ source, result }) => ({
      key: source.key,
      count: result.value,
      title: source.title(result.value),
      meta: source.meta,
      href: source.href,
      tone: source.tone
    }));
}

if (window.AppShell) {
  let adminEmail = '';
  try {
    adminEmail = JSON.parse(localStorage.getItem('smartserve_admin_profile') || '{}')?.email || '';
  } catch (_) {
    // No cached profile yet; the seen state is simply shared for this browser.
  }
  window.AppShell.registerNotifications({
    title: 'Needs attention',
    emptyText: 'Nothing needs your attention right now.',
    scope: `admin:${adminEmail}`,
    load: loadAdminNotifications
  });
}

// The initial render uses the cached role, which can be absent on a first visit
// or stale after a role change. admin.js calls refreshAdminNav() once the profile
// has been resolved so per-role visibility is corrected without a reload.
function refreshAdminNav() {
  renderAdminNav();
}
