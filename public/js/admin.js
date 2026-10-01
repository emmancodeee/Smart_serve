document.addEventListener('click', (e) => {
  const link = e.target.closest('.drawer-sidebar a');
  if (link) {
    const cb = document.getElementById('drawerCheckbox');
    if (cb) cb.checked = false;
  }
});

// The sidebar toggle, drawer and header profile menu live in app-shell.js,
// which every signed-in page loads.

// Loading / error / empty states for a module's own data region.
//
// Each accepts either an element id or the element itself, and works for a table
// (spanning row) or a block region such as a card grid or list (spanning block).
// A module renders these into its own data region only -- never into another
// module's region, and never as a stand-in for the module's content.
function getDataRegion(target) {
  if (!target) return null;
  if (typeof target !== 'string') return target;
  return document.getElementById(target);
}

function getDataRegionColumnSpan(region) {
  if (!region) return 1;
  // A tbody region takes its span from the table it belongs to, since a tbody
  // has no header row of its own.
  const table = region.tagName === 'TBODY' ? region.closest('table') : region;
  if (table && table.tagName === 'TABLE') {
    // Cells in the header row. This previously read `thead th`, whose child
    // count is 0, so every loading/error/empty row spanned a single column.
    return table.querySelector('thead tr')?.childElementCount || 1;
  }
  return region.dataset?.columns ? Number(region.dataset.columns) || 1 : 1;
}

function showLoading(target, message = 'Loading...') {
  const region = getDataRegion(target);
  if (!region) return;
  region.setAttribute('aria-busy', 'true');

  if (region.tagName === 'TABLE' || region.tagName === 'TBODY') {
    const tbody = region.tagName === 'TBODY' ? region : region.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="${getDataRegionColumnSpan(region)}" class="table-loading-state">${message}</td>
      </tr>
    `;
    return;
  }

  region.innerHTML = `
    <div class="flex items-center justify-center py-8" data-region-loading>
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-hidden="true"></div>
      <span class="ml-3 text-slate-600">${message}</span>
    </div>
  `;
}

function showError(target, message = 'An error occurred. Please try again.') {
  const region = getDataRegion(target);
  if (!region) return;
  region.removeAttribute('aria-busy');

  if (region.tagName === 'TABLE' || region.tagName === 'TBODY') {
    const tbody = region.tagName === 'TBODY' ? region : region.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="${getDataRegionColumnSpan(region)}">
          <div class="text-center py-8 text-red-600">
            <svg class="w-12 h-12 mx-auto mb-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>${message}</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  region.innerHTML = `
    <div class="text-center py-8 text-red-600">
      <svg class="w-12 h-12 mx-auto mb-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p>${message}</p>
    </div>
  `;
}

function showEmpty(target, message = 'No data available') {
  const region = getDataRegion(target);
  if (!region) return;
  region.removeAttribute('aria-busy');

  if (region.tagName === 'TABLE' || region.tagName === 'TBODY') {
    const tbody = region.tagName === 'TBODY' ? region : region.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td colspan="${getDataRegionColumnSpan(region)}" class="table-empty-state">${message}</td>
      </tr>
    `;
    return;
  }

  region.innerHTML = `
    <div class="text-center py-8 text-slate-500">
      <p>${message}</p>
    </div>
  `;
}


// Debounce function for search inputs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

let allUsers = [];
let allRegistrations = [];
let allTransactions = [];
let allPickupConfirmations = [];
let allInventory = [];
let allAdminAccounts = [];
let allAnnouncements = [];
let currentUserId = null;
let currentAdminProfile = null;

const ADMIN_PROFILE_CACHE_KEY = 'smartserve_admin_profile';

function readCachedAdminProfile() {
  try {
    const raw = localStorage.getItem(ADMIN_PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_) {
    return null;
  }
}

function cacheAdminProfile(profile) {
  if (!profile || typeof profile !== 'object') return;
  try {
    localStorage.setItem(ADMIN_PROFILE_CACHE_KEY, JSON.stringify({
      name: profile.name || profile.fullname || 'Admin',
      email: profile.email || '',
      accountType: profile.accountType,
      isAdmin: Boolean(profile.isAdmin),
      isSuperAdmin: Boolean(profile.isSuperAdmin)
    }));
  } catch (_) {
    // localStorage unavailable (private mode etc.) — cache is a display hint only.
  }
}

function clearCachedAdminProfile() {
  try {
    localStorage.removeItem(ADMIN_PROFILE_CACHE_KEY);
  } catch (_) {
    // ignore
  }
}

const ADMIN_VERIFIED_SESSION_KEY = 'smartserve_admin_verified';

function isAdminAccountsVerified() {
  try {
    return sessionStorage.getItem(ADMIN_VERIFIED_SESSION_KEY) === '1';
  } catch (_) {
    return false;
  }
}

function setAdminAccountsVerified(verified) {
  try {
    if (verified) {
      sessionStorage.setItem(ADMIN_VERIFIED_SESSION_KEY, '1');
    } else {
      sessionStorage.removeItem(ADMIN_VERIFIED_SESSION_KEY);
    }
  } catch (_) {
    // ignore
  }
}
let usersFilter = null;
let registrationsFilter = null;
let transactionsFilter = null;
let pickupFilter = null;
let adminAccountsFilter = null;
let announcementsFilter = null;
let analyticsFilter = null;
let probedUsersLoaded = false;
let chartGeneration = 0;
let lastChartRenderKey = null;
let lastChartRenderGeneration = -1;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;
const API_BASE = '/api/auth/admin';
// ---------------------------------------------------------------------------
// View registry
//
// Single source of truth for Admin panel navigation. Every module that either
// role can reach has exactly one entry here with a canonical path, the set of
// sections it owns, and the roles allowed to open it. `admin-nav.js` reads the
// same registry to build the sidebar, so a module can never appear in the
// sidebar without a route that resolves to it, or vice versa.
//
// `sections` is only meaningful for views that live inside admin.html. Views in
// STANDALONE_ADMIN_VIEWS are their own server-rendered document and carry the
// id of their content root so the registry stays complete for future use.
// ---------------------------------------------------------------------------

// Views rendered as sections inside admin.html, switched without a document load.
const SPA_ADMIN_VIEWS = [
  'dashboard',
  'announcements',
  'adminaccounts',
  'transactions',
  'registrations',
  'pickupconfirmations'
];

// Views that are their own document in the current multi-page architecture.
const STANDALONE_ADMIN_VIEWS = ['inventory', 'supplystock', 'returns', 'feedback'];

// Section ids owned by each view. Only the SPA shell views (dashboard,
// announcements, adminaccounts, users, transactions, registrations,
// pickupconfirmations) have sibling sections inside admin.html. The four
// standalone views are listed so they participate in the role allowlist below,
// but their region ids do not exist: each of those modules is its own document
// and setAdminView() is never called for it (see applyAdminView and refreshData).
const SECTION_VIEWS = {
     dashboard: ['analytics'],
     announcements: ['announcements'],
     adminaccounts: ['adminAccounts'],
     users: ['users'],
     transactions: ['transactions'],
     registrations: ['registrationsFilterWrap', 'registrationsPending', 'registrationsApproved', 'registrationsRejected'],
     pickupconfirmations: ['pickupConfirmations'],
     inventory: ['inventoryContent'],
     supplystock: ['supplyStockContent'],
     returns: ['returnsContent'],
     feedback: ['feedbackContent']
   };


// Role visibility, unchanged from the pre-existing per-page sidebar gating:
// Admin Accounts is super-admin only; Request Management and Pickup Confirmations
// are admin only; everything else is reachable by both roles.
const ROLE_VIEW_KEYS = {
  superadmin: ['dashboard', 'inventory', 'supplystock', 'returns', 'transactions', 'announcements', 'feedback', 'adminaccounts'],
  admin: ['dashboard', 'inventory', 'supplystock', 'returns', 'transactions', 'announcements', 'feedback', 'registrations', 'pickupconfirmations']
};

// Canonical path per view. The reverse map below is what the resolver reads, so
// a legacy path such as /inventory can alias onto /admin/inventory without
// creating a second view.
const ADMIN_VIEW_PATHS = {
  dashboard: '/admin/dashboard',
  announcements: '/admin/announcements',
  users: '/admin/users',
  adminaccounts: '/admin/accounts',
  transactions: '/admin/transactions',
  registrations: '/admin/registrations',
  pickupconfirmations: '/admin/pickup-confirmations',
  inventory: '/admin/inventory',
  supplystock: '/admin/supply-stock',
  returns: '/admin/returns',
  feedback: '/admin/feedback'
};

// Additional paths that resolve to an existing view. These are aliases, not
// separate modules: /admin is the bare landing route. /inventory is the
// pre-consolidation Inventory URL, which the server now answers with a real 301
// to /admin/inventory; it stays here as a second line of defence so the resolver
// still resolves it if that redirect is ever bypassed.
const ADMIN_VIEW_PATH_ALIASES = {
     '/admin': 'dashboard',
     '/inventory': 'inventory'
   };


const HEADER_TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Monitor inventory, transactions, and system activities.' },
  announcements: { title: 'Announcements', subtitle: 'Create and manage system-wide announcements.' },
  adminaccounts: { title: 'Admin Accounts', subtitle: 'Manage administrator accounts and permissions.' },
  users: { title: 'Users', subtitle: 'View and manage registered users.' },
  transactions: { title: 'Transactions', subtitle: 'Review user request history and system activity.' },
  registrations: { title: 'Registrations', subtitle: 'Process student registration requests.' },
  pickupconfirmations: { title: 'Pickup Confirmations', subtitle: 'Manage pickup schedules and confirmations.' },
  inventory: { title: 'Inventory Management', subtitle: 'Manage books, modules, and uniforms.' },
  supplystock: { title: 'Supply & Stock', subtitle: 'Manage supply and stock levels.' },
  returns: { title: 'Return Requests', subtitle: 'Review and process return requests.' },
  feedback: { title: 'Feedback Management', subtitle: 'Review student feedback.' }
};
const USER_REQUEST_STATUS_LABELS = {
  registration_approved: 'Approved',
  registration_rejected: 'Rejected',
  registration_pending: 'Pending',
  pickup_confirmation_approve: 'Completed',
  pickup_confirmation_reject: 'Not Completed'
};
// Pill colour per status label above; anything else falls back to neutral.
const USER_REQUEST_STATUS_PILLS = {
  Approved: 'reg-status-approved',
  Completed: 'reg-status-reset',
  Pending: 'reg-status-pending',
  Rejected: 'reg-status-rejected',
  'Not Completed': 'reg-status-rejected'
};
const LEGACY_VIEW_ALIASES = {
  users: 'adminaccounts'
};
const analyticsCriteria = {
  preset: 'last30',
  customFrom: '',
  customTo: '',
  course: '',
  yearLevel: '',
  itemCategory: '',
  inventoryStatus: ''
};

// The period each preset is compared against in the "Units Distributed" hint.
// All Time and open-ended custom ranges have no earlier period and are absent.
const ANALYTICS_PREVIOUS_PERIOD_LABEL = {
  today: 'yesterday',
  yesterday: 'the day before',
  last7: 'the previous 7 days',
  last30: 'the previous 30 days',
  thismonth: 'last month',
  lastmonth: 'the month before',
  thisyear: 'last year',
  custom: 'the previous period of the same length'
};

const ANALYTICS_PRESET_SUMMARY = {
  all: 'all time',
  today: 'today',
  yesterday: 'yesterday',
  last7: 'the last 7 days',
  last30: 'the last 30 days',
  thismonth: 'this month',
  lastmonth: 'last month',
  thisyear: 'this year',
  custom: 'the selected range'
};

function normalizeAdminPath(pathname) {
  return String(pathname || '').replace(/\/+$/, '').toLowerCase() || '/admin';
}

// Reverse index of the view registry: normalized path -> view key. Built once so
// the resolver never has to scan the table, and so adding a path in one place is
// enough to make it resolvable.
const ADMIN_VIEW_BY_PATH = Object.freeze(
  Object.entries(ADMIN_VIEW_PATHS).reduce((accumulator, [viewKey, path]) => {
    accumulator[normalizeAdminPath(path)] = viewKey;
    return accumulator;
  }, { ...ADMIN_VIEW_PATH_ALIASES })
);

// Resolves the active view for the current route.
//
// Returns `{ viewKey: null }` for a route that matches nothing. This is
// deliberately not a fallback to `dashboard`: an unrecognised route must produce
// an explicit not-found state, because the previous behaviour of returning
// 'dashboard' is what let a broken route silently render Dashboard content in
// place of the module the user actually asked for.
function resolveViewFromLocation() {
  const currentPath = normalizeAdminPath(window.location.pathname);
  const matchedView = ADMIN_VIEW_BY_PATH[currentPath];
  if (!matchedView) {
    return { viewKey: null, path: currentPath };
  }
  return { viewKey: LEGACY_VIEW_ALIASES[matchedView] || matchedView, path: currentPath };
}

// The genuine default: used only when there is no route to resolve at all (the
// first paint of the bare landing document), never as a substitute for a route
// that failed to match.
function getDefaultAdminView() {
  return 'dashboard';
}

function isSpaAdminView(viewKey) {
  return SPA_ADMIN_VIEWS.includes(viewKey);
}

function isStandaloneAdminView(viewKey) {
  return STANDALONE_ADMIN_VIEWS.includes(viewKey);
}

// Whether this document can render `viewKey` as one of its own sections.
//
// The same sidebar is shared by the admin shell, which owns several modules as
// sections, and by the single-module documents. A `data-view` link is only a
// section switch on the shell; on a single-module document it is ordinary
// cross-document navigation. Ownership is decided structurally, from the section
// ids the view registers, so it stays correct for a module added later and
// needs no list of module names, page filenames, or URLs.
function documentRendersAdminView(viewKey) {
  const normalizedViewKey = LEGACY_VIEW_ALIASES[String(viewKey || '').toLowerCase()] || viewKey;
  if (!isSpaAdminView(normalizedViewKey)) return false;
  const sectionIds = SECTION_VIEWS[normalizedViewKey];
  if (!Array.isArray(sectionIds) || sectionIds.length === 0) return false;
  return sectionIds.every(sectionId => document.getElementById(sectionId));
}

function normalizeSidebarPath(pathname) {
  const normalized = String(pathname || '').toLowerCase();
  if (!normalized || normalized === '/') return '/';
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

function normalizeSidebarHash(hash) {
  return String(hash || '').toLowerCase();
}

// Derives the active sidebar link from the current route. Sidebar links are
// matched on their resolved href, which is the module's path from the view
// registry. When no href matches exactly -- the bare /admin landing route -- the
// resolved view key is used instead.
function updateSidebarActiveLink() {
  const links = document.querySelectorAll('.sidebar-shell a[href], .sidebar a[href]');
  if (!links.length) return;

  const resolved = resolveViewFromLocation();
  const currentKey = `${normalizeSidebarPath(window.location.pathname)}${normalizeSidebarHash(window.location.hash)}`;

  let hasExactMatch = false;
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') {
      link.classList.remove('active');
      return;
    }

    const url = new URL(href, window.location.origin);
    const linkKey = `${normalizeSidebarPath(url.pathname)}${normalizeSidebarHash(url.hash)}`;
    const isMatch = linkKey === currentKey;
    link.classList.toggle('active', isMatch);
    if (isMatch) hasExactMatch = true;
  });

  if (hasExactMatch || !resolved.viewKey) return;

  document.querySelectorAll('.sidebar-shell a[data-view], .sidebar a[data-view]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-view') === resolved.viewKey);
  });
}

// Marks exactly one sidebar item active for a view. Applied synchronously on
// click so the highlight never waits on a request. Delegates to admin-nav.js, the
// single owner of the sidebar, so the highlight rule is not defined twice.
function applyActiveNavView(viewKey) {
  if (typeof applyAdminNavActiveState === 'function') {
    applyAdminNavActiveState(viewKey);
    return;
  }
  document.querySelectorAll('.sidebar-shell a[data-view], .sidebar a[data-view]').forEach(link => {
    const isMatch = link.getAttribute('data-view') === viewKey;
    link.classList.toggle('active', isMatch);
    if (isMatch) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function getAdminViewPath(viewKey) {
  return ADMIN_VIEW_PATHS[viewKey] || ADMIN_VIEW_PATHS[getDefaultAdminView()];
}

function getRoleAwareSectionViews() {
  const allowedViews = isCurrentSuperAdmin() ? ROLE_VIEW_KEYS.superadmin : ROLE_VIEW_KEYS.admin;
  return allowedViews.reduce((accumulator, viewKey) => {
    accumulator[viewKey] = SECTION_VIEWS[viewKey];
    return accumulator;
  }, {});
}

function getAllowedViews() {
  return Object.keys(getRoleAwareSectionViews());
}

function isSpaAdminShell() {
  return Boolean(document.getElementById('analytics'));
}

// Returns the view key when the role may open it, or null when it may not.
// A role that cannot open a view gets an explicit denial rather than being
// quietly redirected to a different module, which is what previously made
// Inventory Management appear as a stand-in for other modules.
function normalizeViewForRole(viewKey) {
  const normalizedViewKey = LEGACY_VIEW_ALIASES[String(viewKey || '').toLowerCase()] || viewKey;
  return getAllowedViews().includes(normalizedViewKey) ? normalizedViewKey : null;
}

function updateHeaderForView(viewKey) {
  const config = HEADER_TITLES[viewKey] || HEADER_TITLES[getDefaultAdminView()];
  const titleEl = document.getElementById('headerTitle');
  const subtitleEl = document.getElementById('headerSubtitle');
  if (titleEl) titleEl.textContent = config.title;
  if (subtitleEl) subtitleEl.textContent = config.subtitle;
}

function initAdminProfile() {
  if (!currentAdminProfile) return;
  const name = currentAdminProfile.name || 'Admin';
  const avatarEl = document.getElementById('profileAvatar');
  const nameEl = document.getElementById('profileName');
  if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
  if (nameEl) nameEl.textContent = name;
}

function applyHeaderGreeting() {
  if (!currentAdminProfile) return;
  const roleEl = document.getElementById('profileRole');
  if (roleEl) roleEl.textContent = isCurrentSuperAdmin() ? 'Super Admin' : 'Administrator';
  const greetingEl = document.getElementById('headerGreeting');
  if (!greetingEl) return;
  greetingEl.textContent = isCurrentSuperAdmin() ? 'Welcome Super Admin' : 'Welcome Admin';
}

function applyViewFromLocation() {
  const resolved = resolveViewFromLocation();
  if (!resolved.viewKey) {
    renderAdminNotFound(resolved.path);
    updateSidebarActiveLink();
    return;
  }
  setAdminView(resolved.viewKey);
  updateSidebarActiveLink();
  updateHeaderForView(normalizeViewForRole(resolved.viewKey) || resolved.viewKey);
}

function redirectToLogin() {
  window.location.replace('/');
}

// Restores a bfcache-restored page. A page served from the back/forward cache
// has stale JS state, so it must be re-booted rather than reused. This is the one
// full reload the Admin panel navigation keeps: it is triggered by the browser's
// own page-restore, not by clicking a sidebar item.
function enforceAuthOnPageShow(event) {
  const token = localStorage.getItem('token');
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

// Id of the host element used to render the not-found and not-authorized states.
// Declared here, before setAdminView() which clears it, so it is never read
// while still in its temporal dead zone.
const ADMIN_NOT_FOUND_HOST_ID = 'adminNotFound';

// Shows exactly the sections belonging to the resolved view and hides every
// other section. When the view is unknown to the role, nothing is shown: there
// is deliberately no fallback section set, because falling back to another
// module's sections is what made the wrong module appear on navigation.
function setAdminView(viewKey) {
  const roleSectionViews = getRoleAwareSectionViews();
  const normalizedViewKey = normalizeViewForRole(viewKey);
  const roleAllowsView = Boolean(normalizedViewKey);
  const gateVisible = normalizedViewKey === 'adminaccounts' && !isAdminAccountsVerified();
  const visibleIds = roleAllowsView && Array.isArray(roleSectionViews[normalizedViewKey])
    ? [...roleSectionViews[normalizedViewKey]]
    : [];

  if (gateVisible) {
    const accountsIndex = visibleIds.indexOf('adminAccounts');
    if (accountsIndex !== -1) visibleIds.splice(accountsIndex, 1);
  }

  const allSectionIds = [...new Set(Object.values(SECTION_VIEWS).flat())];

  allSectionIds.forEach(id => {
    const section = document.getElementById(id);
    if (!section) return;
    section.style.display = visibleIds.includes(id) ? '' : 'none';
  });

     const gateSection = document.getElementById('adminAccountsAccessGate');
     if (gateSection) {
       gateSection.style.display = gateVisible ? '' : 'none';
     }

     // A resolved module supersedes any previously rendered not-found or
     // not-authorized notice, so the notice must not linger above it.
     const noticeHost = document.getElementById(ADMIN_NOT_FOUND_HOST_ID);
     if (noticeHost) {
       noticeHost.style.display = 'none';
       noticeHost.innerHTML = '';
     }


  if (normalizedViewKey === 'registrations' && registrationsFilter) {
    syncRegistrationSectionVisibility(registrationsFilter.getState().values.status || 'all');
  }

  updateSidebarActiveLink();

  updateHeaderForView(normalizedViewKey);
}

function performLogout() {
  localStorage.removeItem('token');
  clearCachedAdminProfile();
  setAdminAccountsVerified(false);
  redirectToLogin();
}

function isCurrentSuperAdmin() {
  const profile = currentAdminProfile || readCachedAdminProfile();
  return Boolean(profile?.isSuperAdmin);
}

function isSuperAdminViewOnlyMode() {
  return isCurrentSuperAdmin();
}

// Role-specific page chrome (super admin tools, profile, greeting). Split from
// the view resolution below so a failure in either half is contained: a throw
// here must never stop the active module from being resolved and rendered, which
// is what silently broke navigation before.
//
// Per-role sidebar visibility is deliberately NOT handled here. admin-nav.js
// renders the list for the resolved role; a second owner toggling the same items
// is how the six hand-copied sidebars drifted apart in the first place.
function applyRoleChrome() {
  const tools = document.getElementById('superAdminTools');
  const deleteBtn = document.getElementById('deleteUserBtn');
  const canManageAdmins = isCurrentSuperAdmin();

  if (tools) {
    tools.style.display = canManageAdmins ? '' : 'none';
    tools.setAttribute('aria-hidden', !canManageAdmins);
  }

  // The Pickup Completion widget reads the pickup-confirmations dataset, which the
  // server rejects for a super admin (see canLoadDataset). Hiding the widget keeps
  // the super admin dashboard from showing a permanently empty KPI and an
  // "Unable to load data" chart, without granting or removing any permission.
  const pickupBox = document.getElementById('pickupCompletionBox');
  if (pickupBox) {
    pickupBox.style.display = canManageAdmins ? 'none' : '';
  }

  if (deleteBtn) {
    deleteBtn.style.display = 'none';
  }
  initAdminProfile();
  applyHeaderGreeting();
}

function applySuperAdminUI() {
  try {
    applyRoleChrome();
  } catch (error) {
    console.error('Failed to apply role chrome:', error);
  }
  try {
    applyAdminView();
  } catch (error) {
    console.error('Failed to resolve the active admin view:', error);
  }
}

// Resolves the module for the current route and renders it. Never substitutes a
// different module: an unresolvable route or a route the role may not open
// produces an explicit state rather than another module's content.
function applyAdminView() {
  const resolved = resolveViewFromLocation();
  if (!resolved.viewKey) {
    renderAdminNotFound(resolved.path);
    updateSidebarActiveLink();
    return;
  }

  const roleViewKey = normalizeViewForRole(resolved.viewKey);
  if (!roleViewKey) {
    renderAdminNotAuthorized(resolved.viewKey);
    updateSidebarActiveLink();
    return;
  }

  if (!isSpaAdminShell()) {
    // This document is itself a single module (Inventory Management, Supply &
    // Stock, Return Requests, Feedback Management). There are no sibling
    // sections to switch between, so only the header and active nav state need
    // applying. Rewriting history here would navigate the user off the module
    // they opened.
    updateSidebarActiveLink();
    updateHeaderForView(roleViewKey);
    return;
  }

  // A bare /admin or a legacy alias path is rewritten to the canonical route for
  // the resolved view so the address bar, the sidebar, and the section state all
  // agree.
  const nextPath = getAdminViewPath(roleViewKey);
  if (normalizeAdminPath(window.location.pathname) !== normalizeAdminPath(nextPath)) {
    window.history.replaceState({}, '', nextPath);
  }
  setAdminView(roleViewKey);
  updateSidebarActiveLink();
  updateHeaderForView(roleViewKey);
}

function ensureAdminNoticeHost() {
  const existing = document.getElementById(ADMIN_NOT_FOUND_HOST_ID);

  if (existing) return existing;
  const host = document.createElement('div');
  host.id = ADMIN_NOT_FOUND_HOST_ID;
  host.className = 'admin-section';
  host.setAttribute('role', 'status');
  const anchor = document.getElementById('analytics')
    || document.querySelector('.sidebar-shell')?.parentElement
    || document.body;
  anchor.insertBefore(host, anchor.firstChild);
  return host;
}

// Hides every module section and clears the active sidebar highlight. Used before
// rendering a not-found or not-authorized state, so the previous module's content
// is never left on screen behind the notice.
function clearAdminModuleSections() {
     const allowedSections = getRoleAwareSectionViews();
     const allSectionIds = new Set(
       Object.values(allowedSections).flat().filter(Boolean)
     );
     allSectionIds.forEach(sectionId => {
       const element = document.getElementById(sectionId);
       if (element) element.style.display = 'none';
     });
     applyActiveNavView(null);
   }

   // Explicit state for a route that matches no module. Renders no module content.
   function renderAdminNotFound(path) {
     clearAdminModuleSections();
     const host = ensureAdminNoticeHost();
     host.style.display = '';
     host.innerHTML = `
       <div class="flex flex-col items-center justify-center py-16 text-center">
         <h2 class="text-xl font-semibold">Section not found</h2>
         <p class="mt-2 text-slate-600">No SmartServe admin module is registered for this address.</p>
         <p class="mt-1 text-sm text-slate-500">${safeText(path, 'unknown path')}</p>
         <a href="/admin/dashboard" class="mt-6 inline-flex items-center justify-center rounded-xl bg-[#0b1f4d] px-4 py-2.5 text-sm font-semibold text-white">Back to Dashboard</a>
       </div>
     `;
   }

   // Explicit state for a module the current role may not open. Renders no module
   // content, so an Admin-only module never surfaces in the Super Admin panel.
   function renderAdminNotAuthorized(viewKey) {
     clearAdminModuleSections();
     const host = ensureAdminNoticeHost();
     host.style.display = '';
     host.innerHTML = `
       <div class="flex flex-col items-center justify-center py-16 text-center">
         <h2 class="text-xl font-semibold">Section unavailable</h2>
         <p class="mt-2 text-slate-600">Your role does not have access to this section.</p>
         <a href="/admin/dashboard" class="mt-6 inline-flex items-center justify-center rounded-xl bg-[#0b1f4d] px-4 py-2.5 text-sm font-semibold text-white">Back to Dashboard</a>
       </div>
     `;
   }


function safeText(value, fallback = 'N/A') {
  if (value === null || value === undefined) return fallback;
  const raw = String(value).trim();
  if (!raw) return fallback;

  const normalized = raw.replace(/<[^>]*>/g, '').trim();
  return normalized || fallback;
}

function safeImagePath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return null;
  const trimmed = rawPath.trim();
  const anchorHrefMatch = trimmed.match(/<a\b[^>]*\bhref\s*=\s*(['"'])(.*?)\1/i);
  const normalized = (anchorHrefMatch?.[2] || trimmed.replace(/<[^>]*>/g, '')).trim();
  const lowered = normalized.toLowerCase();
  if (!normalized || lowered.startsWith('javascript:')) {
    return null;
  }
  if (lowered.startsWith('data:image/')) {
    return normalized;
  }
  if (lowered.startsWith('data:')) {
    return null;
  }
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function safeDocumentPath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return null;
  const trimmed = rawPath.trim();
  const anchorHrefMatch = trimmed.match(/<a\b[^>]*\bhref\s*=\s*(['"'])(.*?)\1/i);
  const normalized = (anchorHrefMatch?.[2] || trimmed.replace(/<[^>]*>/g, '')).trim();
  const lowered = normalized.toLowerCase();
  if (!normalized || lowered.startsWith('javascript:')) return null;
  if (lowered.startsWith('data:image/') || lowered.startsWith('data:application/pdf')) {
    return normalized;
  }
  if (lowered.startsWith('data:')) return null;
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function splitRegistrationItems(value) {
  return String(value || '')
    .split(';')
    .map(item => item.trim())
    .filter(Boolean);
}

function summarizeRegistrationItems(value, emptyLabel = 'None') {
  const items = splitRegistrationItems(value);
  if (!items.length) return emptyLabel;
  if (items.length === 1) return items[0];
  return `${items.length} items`;
}

function createDetailCard(container, title) {
  const card = document.createElement('section');
  card.className = 'detail-card';

  const heading = document.createElement('h3');
  heading.textContent = title;
  card.appendChild(heading);

  container.appendChild(card);
  return card;
}

function createDetailGrid(card) {
  const grid = document.createElement('div');
  grid.className = 'detail-grid';
  card.appendChild(grid);
  return grid;
}

function appendDetail(detailsDiv, label, value) {
  const p = document.createElement('div');
  p.className = 'detail-item';
  const strong = document.createElement('strong');
  strong.textContent = label;
  p.appendChild(strong);
  p.appendChild(document.createTextNode(safeText(value)));
  detailsDiv.appendChild(p);
}

function appendDetailList(detailsDiv, label, value, emptyLabel = 'None') {
  const wrap = document.createElement('div');
  wrap.className = 'detail-item';
  const title = document.createElement('div');
  const strong = document.createElement('strong');
  strong.textContent = label;
  title.appendChild(strong);
  wrap.appendChild(title);

  const items = splitRegistrationItems(value);
  if (!items.length) {
    const empty = document.createElement('p');
    empty.textContent = emptyLabel;
    wrap.appendChild(empty);
    detailsDiv.appendChild(wrap);
    return;
  }

  const list = document.createElement('ul');
  list.style.margin = '0.35rem 0 0 1.1rem';
  list.style.padding = '0';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
  wrap.appendChild(list);
  detailsDiv.appendChild(wrap);
}

function getDocDate(doc) {
  if (!doc) return null;

  if (doc.createdAt) {
    const created = new Date(doc.createdAt);
    if (!Number.isNaN(created.getTime())) return created;
  }

  const rawId = doc._id;
  const idStr = typeof rawId === 'string' ? rawId : rawId?.toString?.();
  if (idStr && /^[a-fA-F0-9]{24}$/.test(idStr)) {
    const ts = parseInt(idStr.slice(0, 8), 16) * 1000;
    const fromId = new Date(ts);
    if (!Number.isNaN(fromId.getTime())) return fromId;
  }

  return null;
}

function getFirstValidDate(...candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;

    if (candidate instanceof Date) {
      if (!Number.isNaN(candidate.getTime())) return candidate;
      continue;
    }

    if (typeof candidate === 'object') {
      const docDate = getDocDate(candidate);
      if (docDate) return docDate;
    }

    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function countRecordsInWindow(records, fromMs, toMs, getDate) {
  return records.filter(record => {
    const date = typeof getDate === 'function' ? getDate(record) : null;
    if (!date) return false;
    const timestamp = date.getTime();
    return timestamp >= fromMs && timestamp < toMs;
  }).length;
}

function getUserActivityDate(user) {
  return getFirstValidDate(user?.lastLoginAt, user?.createdAt, user);
}

function getAdminAccountActivityDate(account) {
  return getFirstValidDate(account?.lastLoginAt, account?.createdAt, account);
}

function getRegistrationActivityDate(registration) {
  return getFirstValidDate(registration?.updatedAt, registration?.createdAt, registration?.pickupDate, registration);
}

function getTransactionDate(transaction) {
  return getFirstValidDate(transaction?.createdAt, transaction);
}

function getAnnouncementActivityDate(announcement) {
  return getFirstValidDate(announcement?.updatedAt, announcement?.publishedAt, announcement?.createdAt, announcement);
}

function getPickupConfirmationDate(item) {
  return getFirstValidDate(item?.pickupDate, item?.date, item?.createdAt, item);
}

function countInWindow(items, fromMs, toMs) {
  return items.filter(item => {
    const date = getDocDate(item);
    if (!date) return false;
    const time = date.getTime();
    return time >= fromMs && time < toMs;
  }).length;
}

function formatPercentChange(current, previous) {
  if (previous === 0) return current === 0 ? '0%' : '+100%';
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.round(pct);
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
}

const CHART_EMPTY_ICONS = {
  chart: '<polyline points="2 20 6 12 10 15 14 7 18 9 22 4"/><line x1="2" y1="20" x2="22" y2="20"/>',
  timeline: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>'
};

function renderChartEmptyState(containerId, iconKey = 'chart', message = 'Data will appear once transactions are recorded.') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', 'No data available');

  const wrap = document.createElement('div');
  wrap.className = 'chart-empty';

  const icon = document.createElement('span');
  icon.className = 'chart-empty-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CHART_EMPTY_ICONS[iconKey] || CHART_EMPTY_ICONS.chart}</svg>`;

  const title = document.createElement('p');
  title.className = 'chart-empty-title';
  title.textContent = 'No data available';

  const hint = document.createElement('p');
  hint.className = 'chart-empty-hint';
  hint.textContent = message;

  wrap.append(icon, title, hint);
  container.appendChild(wrap);
}

function renderEmptyChart(containerId) {
  renderChartEmptyState(containerId, 'chart');
}

function ensureChartHoverTooltip() {
  let tooltip = document.getElementById('chartHoverTooltip');
  if (tooltip) return tooltip;

  tooltip = document.createElement('div');
  tooltip.id = 'chartHoverTooltip';
  tooltip.className = 'chart-hover-tooltip';
  tooltip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tooltip);
  return tooltip;
}

function positionChartHoverTooltip(event, tooltip) {
  if (!event || !tooltip) return;

  const offset = 14;
  const tooltipWidth = tooltip.offsetWidth || 220;
  const tooltipHeight = tooltip.offsetHeight || 60;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

  let left = event.clientX + offset;
  let top = event.clientY + offset;

  if ((left + tooltipWidth) > (viewportWidth - 12)) {
    left = Math.max(12, event.clientX - tooltipWidth - offset);
  }
  if ((top + tooltipHeight) > (viewportHeight - 12)) {
    top = Math.max(12, event.clientY - tooltipHeight - offset);
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function showChartHoverTooltip(content, event) {
  const tooltipText = String(content || '').trim();
  if (!tooltipText || !event) return;

  const tooltip = ensureChartHoverTooltip();
  tooltip.textContent = tooltipText;
  tooltip.classList.add('is-visible');
  tooltip.setAttribute('aria-hidden', 'false');
  positionChartHoverTooltip(event, tooltip);
}

function hideChartHoverTooltip() {
  const tooltip = document.getElementById('chartHoverTooltip');
  if (!tooltip) return;
  tooltip.classList.remove('is-visible');
  tooltip.setAttribute('aria-hidden', 'true');
}

// Hover tooltip for one chart mark (bar, legend entry, point, timeline entry or
// KPI card). Marks used to be styled and announced as buttons (pointer cursor,
// tabindex, role="button") and clicking them wrote into a #chartDetailsPanel
// that no page renders, so they looked actionable and did nothing. They are
// plain marks now: the tooltip is the whole interaction, and each chart
// container keeps its own role="img" summary for assistive technology.
function bindChartInteraction(target, title, text, tooltipText = '') {
  if (!target) return;

  const normalizedText = safeText(text, 'No details available.');
  const tooltip = String(tooltipText || normalizedText).trim();

  target.classList.add('chart-interactive');
  if (tooltip) {
    target.setAttribute('title', tooltip);
  }

  target.addEventListener('mouseenter', event => {
    showChartHoverTooltip(tooltip, event);
  });
  target.addEventListener('mousemove', event => {
    showChartHoverTooltip(tooltip, event);
  });
  target.addEventListener('mouseleave', hideChartHoverTooltip);
}

function renderDonutChart(containerId, segments, detailLabel = 'Course', centerLabel = '') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    renderEmptyChart(containerId);
    return;
  }

  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', `${detailLabel} distribution chart. ${total} total requests across ${segments.length} segments.`);

  const wrap = document.createElement('div');
  wrap.className = 'donut-wrap';

  const donut = document.createElement('div');
  donut.className = 'donut-chart';

  let cursor = 0;
  const stops = segments.map(segment => {
    const start = cursor;
    cursor += (segment.value / total) * 100;
    return `${segment.color} ${start}% ${cursor}%`;
  });
  donut.style.background = `conic-gradient(${stops.join(', ')})`;

  const totalNode = document.createElement('div');
  totalNode.className = 'donut-total';
  totalNode.textContent = String(total);
  totalNode.setAttribute('aria-hidden', 'true');
  donut.appendChild(totalNode);

  if (centerLabel) {
    const centerLabelNode = document.createElement('span');
    centerLabelNode.className = 'donut-total-label';
    centerLabelNode.textContent = centerLabel;
    centerLabelNode.setAttribute('aria-hidden', 'true');
    donut.appendChild(centerLabelNode);
  }

  const legend = document.createElement('div');
  legend.className = 'donut-legend';

  segments.forEach(segment => {
    const item = document.createElement('div');
    item.className = 'legend-item';

    const dot = document.createElement('span');
    dot.className = 'legend-dot';
    dot.style.backgroundColor = segment.color;

    const pct = total > 0 ? ((segment.value / total) * 100).toFixed(1) : '0.0';
    const text = document.createElement('span');
    text.textContent = `${safeText(segment.label)} — ${segment.value} (${pct}%)`;

    item.append(dot, text);
    bindChartInteraction(
      item,
      `${detailLabel}: ${safeText(segment.label)}`,
      `Requests: ${segment.value}. Share: ${pct}% of total requests.`,
      `${safeText(segment.label)}: ${segment.value} requests (${pct}%)`
    );
    legend.appendChild(item);
  });

  wrap.append(donut, legend);
  container.appendChild(wrap);
}

function buildWeeklySeries(items, weeks = 8) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const series = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const from = now - ((i + 1) * weekMs);
    const to = now - (i * weekMs);
    series.push(countInWindow(items, from, to));
  }
  return series;
}

function buildWeeklyRegistrationsByStatus(status, weeks = 8) {
  const normalizedStatus = String(status || '').toLowerCase();
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const series = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const from = now - ((i + 1) * weekMs);
    const to = now - (i * weekMs);
    series.push(allRegistrations.filter(item => {
      const date = getDocDate(item);
      if (!date) return false;
      const time = date.getTime();
      const itemStatus = String(item?.userId?.status || 'pending').toLowerCase();
      return time >= from && time < to && itemStatus === normalizedStatus;
    }).length);
  }

  return series;
}

function buildSmoothPath(coords) {
  if (coords.length < 2) {
    return coords.map(point => `M ${point.x} ${point.y}`).join(' ');
  }

  let path = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const midX = (prev.x + curr.x) / 2;
    path += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return path;
}

// Y-axis ceiling for the line charts, rounded up to an even whole number so the
// three tick labels (max, max / 2, 0) are distinct integers. Rounding the raw
// ceiling printed "1, 1, 0" whenever the busiest bucket held a single item.
function evenAxisMax(values) {
  return Math.max(2, Math.ceil(Math.max(0, ...values) / 2) * 2);
}

function renderLineChart(containerId, points, labels = [], color = '#2563eb', detailTitle = 'Trend', areaColor = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!points.length) {
    renderEmptyChart(containerId);
    return;
  }

  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', `${detailTitle}. ${points.length} data points across ${labels.length} time buckets.`);

  const width = 520;
  const height = 230;
  const padding = { top: 18, right: 18, bottom: 38, left: 42 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const max = evenAxisMax(points);
  const svgNs = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'line-chart-svg');

  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (plotHeight / 4) * i;
    const line = document.createElementNS(svgNs, 'line');
    line.setAttribute('x1', String(padding.left));
    line.setAttribute('x2', String(width - padding.right));
    line.setAttribute('y1', String(y));
    line.setAttribute('y2', String(y));
    line.setAttribute('class', 'line-chart-grid');
    svg.appendChild(line);
  }

  [0, 2, 4].forEach(i => {
    const y = padding.top + (plotHeight / 4) * i;
    const text = document.createElementNS(svgNs, 'text');
    text.setAttribute('x', String(padding.left - 8));
    text.setAttribute('y', String(y + 4));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('class', 'line-chart-label');
    text.textContent = String(Math.round(max * (1 - i / 4)));
    svg.appendChild(text);
  });

  const coords = points.map((value, index) => {
    const x = padding.left + (plotWidth * index) / Math.max(points.length - 1, 1);
    const y = padding.top + plotHeight - ((value / max) * plotHeight);
    return { x, y, value, label: labels[index] || `Point ${index + 1}` };
  });

  const pathData = buildSmoothPath(coords);
  const areaData = `${pathData} L ${coords[coords.length - 1].x} ${padding.top + plotHeight} L ${coords[0].x} ${padding.top + plotHeight} Z`;

  const area = document.createElementNS(svgNs, 'path');
  area.setAttribute('d', areaData);
  area.setAttribute('class', areaColor ? 'line-chart-area line-chart-area--soft' : 'line-chart-area');
  area.setAttribute('fill', areaColor || color);
  svg.appendChild(area);

  const path = document.createElementNS(svgNs, 'path');
  path.setAttribute('d', pathData);
  path.setAttribute('class', 'line-chart-path');
  path.setAttribute('stroke', color);
  svg.appendChild(path);

  coords.forEach(point => {
    const hitCircle = document.createElementNS(svgNs, 'circle');
    hitCircle.setAttribute('cx', String(point.x));
    hitCircle.setAttribute('cy', String(point.y));
    hitCircle.setAttribute('r', '10');
    hitCircle.setAttribute('fill', '#ffffff');
    hitCircle.setAttribute('opacity', '0.001');
    bindChartInteraction(hitCircle, detailTitle, `${point.label}: ${point.value} units`, `${point.label}: ${point.value} units`);
    svg.appendChild(hitCircle);

    const circle = document.createElementNS(svgNs, 'circle');
    circle.setAttribute('cx', String(point.x));
    circle.setAttribute('cy', String(point.y));
    circle.setAttribute('r', '5');
    circle.setAttribute('class', 'line-chart-point');
    circle.setAttribute('fill', color);
    svg.appendChild(circle);
  });

  labels.forEach((label, index) => {
    const text = document.createElementNS(svgNs, 'text');
    const x = padding.left + (plotWidth * index) / Math.max(labels.length - 1, 1);
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(height - 10));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'line-chart-label');
    text.textContent = label;
    svg.appendChild(text);
  });

  container.appendChild(svg);
}

function incrementMapCounts(map, items) {
  items.forEach(item => {
    map[item] = (map[item] || 0) + 1;
  });
}

function buildTopRegistrationItems(fieldName, limit = 6) {
  const counts = {};
  allRegistrations.forEach(reg => {
    incrementMapCounts(counts, splitRegistrationItems(reg?.[fieldName]));
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function normalizeInventoryKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getRegistrationInventoryDate(registration) {
  const candidates = [
    registration?.updatedAt,
    registration?.pickupDate,
    registration?.createdAt
  ];

  for (const candidate of candidates) {
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return getDocDate(registration);
}

function getInventoryUsageEntries() {
  const entries = [];

  allRegistrations.forEach(registration => {
    const date = getRegistrationInventoryDate(registration);
    if (!date) return;

    const allocations = Array.isArray(registration?.inventoryAllocations)
      ? registration.inventoryAllocations
      : [];

    allocations.forEach(allocation => {
      const quantity = Math.max(0, Number(allocation?.quantity) || 0);
      if (quantity <= 0) return;

      const itemName = safeText(allocation?.itemName || allocation?.requestedLabel, 'Unnamed item');
      const requestedLabel = safeText(allocation?.requestedLabel || allocation?.itemName, itemName);
      const category = safeText(allocation?.category, 'Uncategorized');
      const course = safeText(registration?.course, 'Unassigned cohort');
      const yearLevel = safeText(registration?.yearLevel, '');
      const cohort = yearLevel && yearLevel !== 'N/A'
        ? `${course} - ${yearLevel}`
        : course;

      entries.push({
        date,
        quantity,
        itemName,
        itemKey: normalizeInventoryKey(itemName),
        requestedLabel,
        category,
        course,
        cohort
      });
    });
  });

  return entries;
}

function sumUsageInWindow(entries, fromMs, toMs) {
  return entries.reduce((sum, entry) => {
    const timestamp = entry?.date instanceof Date ? entry.date.getTime() : Number.NaN;
    if (!Number.isFinite(timestamp) || timestamp < fromMs || timestamp >= toMs) {
      return sum;
    }
    return sum + Math.max(0, Number(entry?.quantity) || 0);
  }, 0);
}

function buildWeeklyUsageSeries(entries, weeks = 8) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const series = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const from = now - ((i + 1) * weekMs);
    const to = now - (i * weekMs);
    series.push(sumUsageInWindow(entries, from, to));
  }

  return series;
}

function buildWeeklyTransactionSeries(transactions, weeks = 8) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const series = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const from = now - ((i + 1) * weekMs);
    const to = now - (i * weekMs);
    const count = transactions.filter(transaction => {
      const date = new Date(transaction?.createdAt);
      if (Number.isNaN(date.getTime())) return false;
      const timestamp = date.getTime();
      return timestamp >= from && timestamp < to;
    }).length;
    series.push(count);
  }

  return series;
}

function buildWeeklyLabels(weeks = 8) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const labels = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const from = new Date(now - ((i + 1) * weekMs));
    labels.push(from.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    }));
  }

  return labels;
}

// Trend-chart buckets covering [fromMs, toMs). The layout follows the length of
// the selected window rather than a fixed rolling period, so the chart plots the
// same window as the KPIs: 3-hour buckets for a single day, daily buckets up to
// a week, six equal buckets up to two months, and calendar months beyond that.
function buildAnalyticsBuckets(fromMs, toMs) {
  const spanMs = Math.max(1, toMs - fromMs);
  const equalBuckets = (count, formatLabel) => {
    const size = spanMs / count;
    return Array.from({ length: count }, (_, index) => {
      const bucketFrom = fromMs + (index * size);
      return {
        fromMs: bucketFrom,
        toMs: index === count - 1 ? toMs : bucketFrom + size,
        label: formatLabel(new Date(bucketFrom))
      };
    });
  };

  if (spanMs <= DAY_MS + (60 * 60 * 1000)) {
    return equalBuckets(8, date => date.toLocaleTimeString(undefined, { hour: 'numeric' }));
  }
  if (spanMs <= 8 * DAY_MS) {
    return equalBuckets(Math.max(2, Math.round(spanMs / DAY_MS)), date => date.toLocaleDateString(undefined, { weekday: 'short' }));
  }
  if (spanMs <= 62 * DAY_MS) {
    return equalBuckets(6, date => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  }

  const start = new Date(fromMs);
  const months = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor.getTime() < toMs && months.length <= 12) {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    months.push({
      fromMs: Math.max(fromMs, cursor.getTime()),
      toMs: Math.min(toMs, next.getTime()),
      label: cursor.toLocaleDateString(undefined, { month: 'short' })
    });
    cursor = next;
  }
  if (months.length <= 12) return months;
  return equalBuckets(12, date => date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }));
}

function buildUsageSeriesForBuckets(entries, buckets) {
  return buckets.map(bucket => sumUsageInWindow(entries, bucket.fromMs, bucket.toMs));
}

function buildTransactionSeriesForBuckets(transactions, buckets) {
  return buckets.map(bucket => countRecordsInWindow(transactions, bucket.fromMs, bucket.toMs, getTransactionDate));
}

function aggregateUsageEntries(entries, getLabel, limit = 6) {
  const counts = {};

  entries.forEach(entry => {
    const label = safeText(getLabel(entry), 'Unknown');
    counts[label] = (counts[label] || 0) + Math.max(0, Number(entry?.quantity) || 0);
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function getInventoryTransactions() {
  return allTransactions.filter(transaction => String(transaction?.action || '').startsWith('inventory_'));
}

function classifyInventoryTransaction(action) {
  const normalized = String(action || '').toLowerCase();
  if (normalized === 'inventory_added') return 'Added';
  if (normalized === 'inventory_updated') return 'Adjusted';
  if (normalized === 'inventory_deleted') return 'Removed';
  return 'Other';
}

function buildInventoryOperationEntries(transactions) {
  const counts = { Added: 0, Adjusted: 0, Removed: 0 };

  transactions.forEach(transaction => {
    const label = classifyInventoryTransaction(transaction?.action);
    if (!counts[label] && label !== 'Other') counts[label] = 0;
    if (label !== 'Other') counts[label] += 1;
  });

  return Object.entries(counts);
}

function buildInventoryHealthEntries(limit = 6) {
  const atRisk = allInventory
    .map(item => {
      const quantity = Math.max(0, Number(item?.quantity) || 0);
      const reorderLevel = Math.max(0, Number(item?.reorderLevel) || 0);
      const gap = reorderLevel > 0 ? Math.max(0, reorderLevel - quantity) : 0;
      return {
        label: safeText(item?.itemName, 'Unnamed item'),
        quantity,
        reorderLevel,
        value: gap
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value || a.quantity - b.quantity)
    .slice(0, limit)
    .map(item => [item.label, item.value]);

  if (atRisk.length) return atRisk;

  return allInventory
    .map(item => ({
      label: safeText(item?.itemName, 'Unnamed item'),
      quantity: Math.max(0, Number(item?.quantity) || 0)
    }))
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, limit)
    .map(item => [item.label, Math.max(1, item.quantity)]);
}

function buildPlanningForecastEntries(usageEntries, limit = 6, fromMs = Date.now() - MONTH_MS) {
  const usageByItem = new Map();

  usageEntries.forEach(entry => {
    const timestamp = entry?.date instanceof Date ? entry.date.getTime() : Number.NaN;
    if (!Number.isFinite(timestamp) || timestamp < fromMs) return;
    usageByItem.set(entry.itemKey, (usageByItem.get(entry.itemKey) || 0) + Math.max(0, Number(entry?.quantity) || 0));
  });

  const rows = allInventory
    .map(item => {
      const itemName = safeText(item?.itemName, 'Unnamed item');
      const itemKey = normalizeInventoryKey(itemName);
      const currentStock = Math.max(0, Number(item?.quantity) || 0);
      const projectedDemand = Math.max(0, Number(usageByItem.get(itemKey) || 0));
      const shortage = Math.max(0, projectedDemand - currentStock);

      return {
        label: itemName,
        projectedDemand,
        currentStock,
        shortage,
        value: shortage > 0 ? shortage : projectedDemand
      };
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.shortage - a.shortage || b.projectedDemand - a.projectedDemand || a.currentStock - b.currentStock)
    .slice(0, limit)
    .map(item => [item.label, item.value]);

  return rows;
}

function countSlowMovingItems(usageEntries, days = 90) {
  const cutoff = Date.now() - (days * DAY_MS);
  const recentlyMoved = new Set(
    usageEntries
      .filter(entry => (entry?.date instanceof Date ? entry.date.getTime() : Number.NaN) >= cutoff)
      .map(entry => entry.itemKey)
  );

  return allInventory.filter(item => !recentlyMoved.has(normalizeInventoryKey(item?.itemName))).length;
}

function formatInteger(value) {
  return new Intl.NumberFormat().format(Math.round(Number(value) || 0));
}

function formatStockCoverage(totalStockUnits, weeklyUsageSeries) {
  const totalUsage = weeklyUsageSeries.reduce((sum, value) => sum + value, 0);
  const averageWeeklyUsage = weeklyUsageSeries.length > 0 ? totalUsage / weeklyUsageSeries.length : 0;

  if (!averageWeeklyUsage || averageWeeklyUsage <= 0) {
    return 'Stable';
  }

  const weeks = totalStockUnits / averageWeeklyUsage;
  if (!Number.isFinite(weeks)) return 'Stable';
  if (weeks >= 52) return '52+ weeks';
  return `${weeks.toFixed(1)} weeks`;
}

function getPickupStatusSummary(item) {
  const value = String(resolvePickupDisplayConfirmation(item) || '').toLowerCase();
  if (value === 'completed') return 'Completed';
  if (value === 'failed to comply') return 'No Show';
  return 'Pending';
}

function isSameLocalDate(rawDate, compareDate = new Date()) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === compareDate.getFullYear()
    && date.getMonth() === compareDate.getMonth()
    && date.getDate() === compareDate.getDate();
}

function renderSparkline(svgId, points, color) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  const width = 120;
  const height = 28;
  svg.innerHTML = '';
  if (!points.length) return;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);

  const coords = points.map((point, idx) => {
    const x = (idx / (points.length - 1 || 1)) * (width - 2) + 1;
    const y = height - (((point - min) / range) * (height - 6) + 3);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', color);
  polyline.setAttribute('stroke-width', '2');
  polyline.setAttribute('points', coords);
  svg.appendChild(polyline);
}

// Each boot step is contained on its own. A failure anywhere must not prevent
// the remaining steps from running, because the active view is resolved and
// rendered by one of them and skipping it leaves every module section visible at
// once.
function runBootStep(label, step) {
  try {
    const result = step();
    if (result && typeof result.catch === 'function') {
      result.catch(error => console.error(`Admin boot step failed: ${label}`, error));
    }
  } catch (error) {
    console.error(`Admin boot step failed: ${label}`, error);
  }
}

async function validateAdminSession(token) {
  const meRes = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (meRes.ok) {
    const me = await meRes.json().catch(() => ({}));
    currentAdminProfile = me && typeof me === 'object' ? me : null;
    if (currentAdminProfile) cacheAdminProfile(currentAdminProfile);
    if (me?.isAdmin === true || me?.accountType === 'admin') {
      return { ok: true };
    }
  } else if (meRes.status !== 401 && meRes.status !== 403) {
    throw new Error('Unable to validate session');
  }

  // Backward-compatible fallback for sessions that predate the /api/auth/me
  // admin flags: prove access with an admin-scoped endpoint.
  const adminProbeRes = await fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (adminProbeRes.ok) {
    const probed = await adminProbeRes.json().catch(() => []);
    if (Array.isArray(probed)) {
      allUsers = probed;
      probedUsersLoaded = true;
    }
    return { ok: true };
  }
  if (adminProbeRes.status === 403) {
    return { ok: false, reason: 'forbidden' };
  }
  throw new Error('Invalid or expired session');
}

document.addEventListener('DOMContentLoaded', async () => {
  runBootStep('header clock', startHeaderClock);
  runBootStep('event listeners', setupEventListeners);
  window.addEventListener('popstate', applyViewFromLocation);
  window.addEventListener('hashchange', updateSidebarActiveLink);

  const token = localStorage.getItem('token');
  if (!token) {
    redirectToLogin();
    return;
  }

  // Paint the cached role and the resolved view synchronously, before the async
  // session round-trip, so the correct module is on screen without waiting for
  // the network. The authoritative re-sync below confirms or overrides it.
  runBootStep('role chrome and initial view', applySuperAdminUI);

  let session;
  try {
    session = await validateAdminSession(token);
  } catch {
    localStorage.removeItem('token');
    clearCachedAdminProfile();
    redirectToLogin();
    return;
  }

  if (!session.ok) {
    // Authenticated but not an admin. Rendered in place rather than redirecting:
    // every admin route would fail this same check, so navigating anywhere else in
    // the panel would just repeat the bounce.
    clearCachedAdminProfile();
    renderAdminNotAuthorized('admin access');
    return;
  }

  // Re-apply now that the authoritative role is known, then load only the data
  // the resolved module actually needs.
  runBootStep('role resync', applySuperAdminUI);
  // The sidebar first rendered from the cached role, which can be absent or stale.
  // Rebuild it now that the profile is authoritative, then reapply the active state.
  runBootStep('admin nav', () => {
    if (typeof refreshAdminNav === 'function') refreshAdminNav();
  });
  runBootStep('filters', initAdminFilters);
  runBootStep('active module data', () => refreshData());
});

// ---------------------------------------------------------------------------
// Per-view data loading
//
// Each admin.html view declares only the loaders its own widgets read. Opening a
// module no longer issues requests for unrelated modules, and a second
// activation while a request is still in flight reuses that request instead of
// issuing another. Datasets are shared deliberately where several views need the
// same one; see ADMIN_VIEW_LOADERS.
// ---------------------------------------------------------------------------

const ADMIN_VIEW_LOADERS = {
     // The dashboard's own widgets read inventory (KPIs, at-risk, changes),
     // registrations (series, counts), users (pickup attribution, admin
     // operations) and transactions (inventory movement series). It also renders a
     // Pickup Completion KPI and chart, which read pickup confirmations; that
     // request is skipped for a super admin by canLoadDataset, and the widget is
     // hidden by applyRoleChrome. Announcements and admin accounts are absent
     // because no dashboard widget reads them.
     dashboard: ['inventory', 'users', 'registrations', 'transactions', 'pickupConfirmations'],
     announcements: ['announcements'],
     adminaccounts: ['adminAccounts'],
     users: ['adminAccounts'],
     transactions: ['transactions'],
     registrations: ['registrations', 'users'],
     pickupconfirmations: ['pickupConfirmations']
   };


// Datasets keyed by name. Inventory and Supply & Stock read the same real
// Books/Modules/Uniforms data, so `inventory` is a single shared cache rather
// than one copy per module.
const ADMIN_DATASETS = {
  inventory: { state: 'idle', inFlight: null, loaded: false, generation: 0, load: () => loadInventory() },
  users: { state: 'idle', inFlight: null, loaded: false, generation: 0, load: () => loadUsers() },
  registrations: { state: 'idle', inFlight: null, loaded: false, generation: 0, load: () => loadRegistrations() },
  transactions: { state: 'idle', inFlight: null, loaded: false, generation: 0, load: () => loadTransactions() },
  pickupConfirmations: { state: 'idle', inFlight: null, loaded: false, generation: 0, load: () => loadPickupConfirmations() },
  announcements: { state: 'idle', inFlight: null, loaded: false, generation: 0, load: () => loadAdminAnnouncements() },
  adminAccounts: { state: 'idle', inFlight: null, loaded: false, generation: 0, load: () => loadAdminAccounts() }
};

// Load guards the pickup confirmations request, which is admin-only on the
// server. A super admin's request is rejected, so it is skipped entirely rather
// than attempted on every dashboard load.
function canLoadDataset(name) {
  if (name === 'pickupConfirmations') return !isCurrentSuperAdmin();
  return true;
}

// Issues a dataset request at most once while one is in flight, and skips it
// entirely when the dataset is already loaded. A second activation during flight
// reuses the in-flight promise rather than starting a duplicate request.
//
// The generation counter handles an in-module write that invalidates the dataset
// while its previous request is still running: that request's result is
// discarded instead of being marked fresh.
function ensureDataset(name) {
  const dataset = ADMIN_DATASETS[name];
  if (!dataset) return Promise.resolve();
  if (!canLoadDataset(name)) return Promise.resolve();
  if (dataset.inFlight) return dataset.inFlight;
  if (dataset.loaded) return Promise.resolve();

  const generation = dataset.generation;
  const pending = Promise.resolve()
    .then(dataset.load)
    .then(() => {
      if (dataset.generation !== generation) return;
      dataset.state = 'ready';
      dataset.loaded = true;
    })
    .catch(error => {
      if (dataset.generation !== generation) return;
      dataset.state = 'error';
      dataset.loaded = false;
      throw error;
    })
    .finally(() => {
      if (dataset.inFlight === pending) dataset.inFlight = null;
    });

  dataset.state = 'loading';
  dataset.inFlight = pending;
  return pending;
}

// Marks a dataset stale so the next read refetches it. Used by in-module write
// actions that change the underlying data.
function invalidateDataset(name) {
  const dataset = ADMIN_DATASETS[name];
  if (!dataset) return;
  dataset.generation += 1;
  dataset.loaded = false;
  dataset.state = 'idle';
}

function invalidateAllDatasets() {
  Object.keys(ADMIN_DATASETS).forEach(invalidateDataset);
}

// Refetches specific datasets after a write. Scoped by name rather than by view
// because a write in one module can change data another module also reads.
function reloadDatasets(...names) {
  names.forEach(invalidateDataset);
  return Promise.all(names.map(name => ensureDataset(name).catch(() => {})));
}

// Loads only the datasets the resolved view needs, then renders. Standalone
// module documents load their own data from their own page scripts, so they have
// nothing to fetch here.
async function refreshData() {
  if (!isSpaAdminShell()) return;

  const resolved = resolveViewFromLocation();
  if (!resolved.viewKey) return;
  const viewKey = normalizeViewForRole(resolved.viewKey);
  if (!viewKey) return;

  const datasetNames = ADMIN_VIEW_LOADERS[viewKey] || [];
  await Promise.all(datasetNames.map(ensureDataset));

  // Only meaningful once this view's own datasets are present. A response that
  // arrives after the user has navigated away is dropped rather than rendered
  // into whatever module is now on screen.
  if (resolveViewFromLocation().viewKey !== resolved.viewKey) return;

  if (viewKey === 'dashboard') {
    invalidateChartCache();
    loadAnalytics();
  }
}

// Re-runs the active module's loaders from scratch. Kept callable by in-module
// refresh actions, which is why it invalidates rather than relying on the cache.
async function reloadActiveModuleData() {
  const resolved = resolveViewFromLocation();
  if (!resolved.viewKey) return;
  const viewKey = normalizeViewForRole(resolved.viewKey);
  (ADMIN_VIEW_LOADERS[viewKey] || []).forEach(invalidateDataset);
  await refreshData();
}

function slugifyLabel(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function loadUsers() {
  if (probedUsersLoaded) {
    probedUsersLoaded = false;
    if (usersFilter) {
      usersFilter.refreshOptions();
      usersFilter.apply();
    }
    return;
  }

  const token = localStorage.getItem('token');

  // Only the sections that render a user list own a data region here. The
  // dashboard reads users for the pickup-completion chart and has no user table,
  // so it is left untouched.
  showLoading('usersTable', 'Loading users...');

  const res = await fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    showError('usersTable', data.error || 'Failed to load users');
    return;
  }

  allUsers = Array.isArray(data) ? data : [];
  if (usersFilter) {
    usersFilter.refreshOptions();
    usersFilter.apply();
  }
}

async function loadRegistrations() {
  const token = localStorage.getItem('token');

  showLoading('registrationsTable', 'Loading registration requests...');

  const res = await fetch(`${API_BASE}/registrations`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    showError('registrationsTable', data.error || 'Failed to load registrations');
    return;
  }

  allRegistrations = Array.isArray(data) ? data : [];
  if (registrationsFilter) {
    registrationsFilter.refreshOptions();
    registrationsFilter.apply();
  }
  refreshAnalyticsFilterOptions();
}

async function loadAdminAccounts() {
  const token = localStorage.getItem('token');
  
  showLoading('adminAccountsTable', 'Loading admin accounts...');

  const res = await fetch(`${API_BASE}/admins`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    allAdminAccounts = [];
    showError('adminAccountsTable', 'Failed to load admin accounts');
    return;
  }

  allAdminAccounts = Array.isArray(data) ? data : [];
  if (adminAccountsFilter) {
    adminAccountsFilter.refreshOptions();
    adminAccountsFilter.apply();
  }
}

function renderAdminAccounts(accounts) {
  const tbody = document.querySelector('#adminAccountsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!accounts.length) {
    showEmpty('adminAccountsTable', 'No admin accounts match the current filters.');
    return;
  }
  
  accounts.forEach(account => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-slate-50 transition-colors';

    const nameCell = document.createElement('td');
    nameCell.textContent = safeText(account?.name);

    const emailCell = document.createElement('td');
    emailCell.textContent = safeText(account?.email);

    const roleCell = document.createElement('td');
    if (account?.isSuperAdmin) {
      const roleBadge = document.createElement('span');
      roleBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
      roleBadge.innerHTML = `
        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
        Super Admin
      `;
      roleCell.appendChild(roleBadge);
    } else {
      const roleBadge = document.createElement('span');
      roleBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
      roleBadge.textContent = 'Admin';
      roleCell.appendChild(roleBadge);
    }

    const lastLoginCell = document.createElement('td');
    lastLoginCell.textContent = formatOptionalDate(account?.lastLoginAt);

    const actionCell = document.createElement('td');
    if (canDeleteAdminAccount(account)) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteAdminAccount(account._id, safeText(account?.name || account?.email, 'this admin account'), deleteBtn));
      actionCell.appendChild(deleteBtn);
    } else if (account?.isSuperAdmin) {
      const protectedBadge = document.createElement('span');
      protectedBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
      protectedBadge.innerHTML = `
        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
        </svg>
        Protected
      `;
      actionCell.appendChild(protectedBadge);
    } else {
      const viewOnlyBadge = document.createElement('span');
      viewOnlyBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800';
      viewOnlyBadge.textContent = 'View only';
      actionCell.appendChild(viewOnlyBadge);
    }

    row.append(nameCell, emailCell, roleCell, lastLoginCell, actionCell);
    tbody.appendChild(row);
  });
}

async function loadTransactions() {
  const token = localStorage.getItem('token');

  showLoading('transactionHistoryTable', 'Loading transactions...');

  const res = await fetch(`${API_BASE}/transactions`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    showError('transactionHistoryTable', data.error || 'Failed to load transactions');
    return;
  }

  allTransactions = Array.isArray(data) ? data : [];
  if (transactionsFilter) {
    transactionsFilter.refreshOptions();
    transactionsFilter.apply();
  }
}

async function loadPickupConfirmations() {
  const token = localStorage.getItem('token');

  showLoading('pickupConfirmationsTable', 'Loading pickup confirmations...');

  const res = await fetch(`${API_BASE}/pickup-confirmations`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    allPickupConfirmations = [];
    showError('pickupConfirmationsTable', data.error || 'Failed to load pickup confirmations');
    if (pickupFilter) pickupFilter.apply();
    return;
  }

  allPickupConfirmations = Array.isArray(data)
    ? data.map(item => ({
        ...item,
        date: item?.pickupDate ?? item?.date ?? null,
        pickupDate: item?.pickupDate ?? item?.date ?? null,
        rescheduleConfirmationStatus: item?.confirmationStatus ?? item?.rescheduleConfirmationStatus ?? 'Pending',
        confirmationStatus: item?.confirmationStatus ?? item?.rescheduleConfirmationStatus ?? 'Pending'
      }))
    : [];
  if (pickupFilter) {
    pickupFilter.refreshOptions();
    pickupFilter.apply();
  }
}

async function loadInventory() {
  const token = localStorage.getItem('token');

  // Block region, not a table: the dashboard renders inventory KPIs and charts.
  showLoading('analyticsKpis', 'Loading inventory overview...');

  const res = await fetch('/api/auth/inventory', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    allInventory = [];
    return;
  }

  allInventory = Array.isArray(data) ? data : [];
  refreshAnalyticsFilterOptions();
}

// The dashboard's Item Category, Course and Year Level lists are read from the
// inventory and registration datasets. The filter is created before either has
// loaded, and nothing rebuilt its lists afterwards, so all three dropdowns only
// ever offered "All". Rebuilding them never re-renders the charts.
function refreshAnalyticsFilterOptions() {
  if (analyticsFilter) analyticsFilter.refreshOptions();
}

function formatTransactionTime(rawDate) {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
}

function formatOptionalDate(rawDate) {
  if (!rawDate) return 'Never';
  const date = new Date(rawDate);
  if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  return 'Never';
}

function formatAiSchedulePreview(schedule) {
  if (!schedule?.startTime) return '';

  const start = new Date(schedule.startTime);
  const end = new Date(schedule.endTime);
  const timeRange = Number.isNaN(start.getTime())
    ? 'N/A'
    : `${start.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}${!Number.isNaN(end.getTime()) ? ` to ${end.toLocaleTimeString('en-PH', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })}` : ''}`;

  return [
    `AI pickup schedule: ${timeRange}`,
    schedule.location ? `Location: ${schedule.location}` : '',
    schedule.decisionSource ? `Decision source: ${schedule.decisionSource}` : '',
    schedule.decisionReason ? `AI reason: ${schedule.decisionReason}` : ''
  ].filter(Boolean).join('\n');
}

function formatActionLabel(action) {
  const label = String(action || '').replace(/_/g, ' ').trim();
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : 'N/A';
}

function isUserRequestTransaction(transaction) {
  const action = String(transaction?.action || '').toLowerCase();
  return Object.prototype.hasOwnProperty.call(USER_REQUEST_STATUS_LABELS, action);
}

function getUserRequestStatusLabel(transaction) {
  const action = String(transaction?.action || '').toLowerCase();
  return USER_REQUEST_STATUS_LABELS[action] || formatActionLabel(action);
}

function getTransactionUserLabel(transaction) {
  const name = String(transaction?.targetUserName || '').trim();
  const email = String(transaction?.targetUserEmail || '').trim();
  if (name && email) return `${name} (${email})`;
  if (name) return name;
  if (email) return email;
  return 'User';
}

// Name on one line with the email muted beneath it, instead of one
// "Name (email)" string that narrow columns had to break mid-word.
function appendPersonLines(cell, name, email) {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim();
  const primary = document.createElement('span');
  primary.className = 'cell-primary';
  primary.textContent = cleanName || cleanEmail || 'User';
  cell.appendChild(primary);
  if (cleanName && cleanEmail) {
    const secondary = document.createElement('span');
    secondary.className = 'cell-secondary';
    secondary.textContent = cleanEmail;
    cell.appendChild(secondary);
  }
}

function getUserRequestDetailText(transaction) {
  const details = String(transaction?.details || '').trim();
  if (details) return details;

  const action = String(transaction?.action || '').toLowerCase();
  if (action === 'registration_approved') return 'Registration request approved.';
  if (action === 'registration_rejected') return 'Registration request rejected.';
  if (action === 'registration_pending') return 'Registration request set to pending.';
  if (action === 'pickup_confirmation_approve') return 'Pickup request completed.';
  if (action === 'pickup_confirmation_reject') return 'Pickup request not completed.';
  return '-';
}

function normalizeRegistrationStatusForDisplay(rawStatus) {
  const value = String(rawStatus || 'pending').toLowerCase();
  if (value === 'approved' || value === 'rejected' || value === 'pending') return value;
  return 'pending';
}

function registrationStatusBadgeClass(status) {
  const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold';
  if (status === 'approved') return `${base} border-emerald-300 bg-emerald-100 text-emerald-700`;
  if (status === 'rejected') return `${base} border-red-300 bg-red-100 text-red-700`;
  return `${base} border-yellow-300 bg-yellow-100 text-amber-800`;
}

function rescheduleStatusPillClass(statusValue) {
  const value = String(statusValue || '').toLowerCase();
  const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold';
  if (value === 'completed') return `${base} border-emerald-300 bg-emerald-100 text-emerald-700`;
  if (value === 'no show' || value === 'failed to comply') return `${base} border-red-300 bg-red-100 text-red-700`;
  return `${base} border-blue-200 bg-blue-50 text-blue-700`;
}

function rescheduleConfirmationPillClass(statusValue) {
  const value = String(statusValue || '').toLowerCase();
  const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold';
  if (value === 'completed') return `${base} border-emerald-300 bg-emerald-100 text-emerald-700`;
  if (value === 'rejected' || value === 'failed to comply') return `${base} border-red-300 bg-red-100 text-red-700`;
  if (value === 'pending') return `${base} border-yellow-300 bg-yellow-100 text-amber-800`;
  return `${base} border-blue-200 bg-blue-50 text-blue-700`;
}

function resolvePickupDisplayStatus(item) {
  const rawStatus = String(item?.status || '').trim();
  if (!rawStatus) return 'N/A';

  const normalizedStatus = rawStatus.toLowerCase();
  if (normalizedStatus === 'no show') return 'Failed to comply';

  if (normalizedStatus === 'planned') {
    const pickupDate = new Date(item?.date);
    if (!Number.isNaN(pickupDate.getTime()) && pickupDate.getTime() < Date.now()) {
      return 'Failed to comply';
    }
    return 'Pending';
  }

  const confirmation = String(item?.rescheduleConfirmationStatus || '').trim().toLowerCase();
  if (confirmation === 'completed') return 'Completed';

  return rawStatus;
}

function resolvePickupDisplayConfirmation(item) {
  const status = String(resolvePickupDisplayStatus(item) || '').toLowerCase();
  const confirmation = String(item?.rescheduleConfirmationStatus || '').trim();
  if (confirmation.toLowerCase() === 'rejected') return 'Rejected';
  if (status === 'failed to comply') return 'Rejected';
  return safeText(confirmation, 'Pending');
}

function canManagePickupConfirmation(item) {
  const status = String(resolvePickupDisplayStatus(item) || '').toLowerCase();
  const confirmation = String(resolvePickupDisplayConfirmation(item) || '').toLowerCase();
  return status === 'pending' && confirmation === 'pending';
}

function pickupStatusOf(item) {
  return resolvePickupDisplayStatus({
    status: item?.status,
    date: item?.pickupDate,
    rescheduleConfirmationStatus: item?.confirmationStatus
  });
}

// Status narrows the rows in the filter pipeline, so by the time this runs every
// row already matches the selection. The tables still have to be separated, and
// the key has to be the same normalized value the row badge is built from, or a
// record could sit in one table while its badge reads another status. Every table
// is therefore written on every render with its own subset: under a specific
// status the other two are hidden anyway, and under All Status each record lands
// in exactly one table instead of all three. Section visibility stays a separate
// concern, owned by syncRegistrationSectionVisibility.
function renderFilteredRegistrations(rows, status = 'all') {
  syncRegistrationSectionVisibility(status);
  const pending = [];
  const approved = [];
  const rejected = [];
  rows.forEach(reg => {
    const statusOfRow = normalizeRegistrationStatusForDisplay(reg?.userId?.status);
    if (statusOfRow === 'approved') approved.push(reg);
    else if (statusOfRow === 'rejected') rejected.push(reg);
    else pending.push(reg);
  });
  displayRegistrations(pending);
  displayApprovedRegistrations(approved);
  displayRejectedRegistrations(rejected);
}

// Shows or hides the three registration status sections to match the selected
// status. These sections belong to the registrations view alone, and the view
// that owns them is the only one entitled to decide their visibility: the
// dashboard reads registration data for its own charts, and that data arriving
// after the user has navigated elsewhere must not re-open sections belonging to
// a module that is no longer on screen. Resolved through the same helpers
// setAdminView uses, so this cannot disagree with the view that applied
// ownership in the first place.
function syncRegistrationSectionVisibility(status) {
  const resolved = resolveViewFromLocation();
  if (!resolved.viewKey || normalizeViewForRole(resolved.viewKey) !== 'registrations') return;

  const normalized = String(status || 'all').toLowerCase();
  const visibility = {
    registrationsPending: normalized === 'all' || normalized === 'pending',
    registrationsApproved: normalized === 'all' || normalized === 'approved',
    registrationsRejected: normalized === 'all' || normalized === 'rejected'
  };
  Object.entries(visibility).forEach(([id, visible]) => {
    const section = document.getElementById(id);
    if (section) section.style.display = visible ? '' : 'none';
  });
}

function renderPickupConfirmationsTable(pickupItems) {
  const tbody = document.querySelector('#pickupConfirmationsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!pickupItems.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'table-empty-state';
    cell.textContent = 'No pickup confirmations match the current filters.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  pickupItems.slice(0, 200).forEach(item => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-slate-50/60';


    const typeCell = document.createElement('td');
    typeCell.className = 'px-3 py-3 whitespace-nowrap';
    const typeValue = item?.source === 'no_show_reschedule' ? 'Rescheduled Pickup' : 'Scheduled Pickup';
    typeCell.innerHTML = `<span class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">${safeText(typeValue)}</span>`;

    const itemsCell = document.createElement('td');
    itemsCell.className = 'px-3 py-3 text-slate-700';
    itemsCell.textContent = safeText(item?.module);

    const dateCell = document.createElement('td');
    dateCell.className = 'px-3 py-3 whitespace-nowrap text-slate-700';
    dateCell.textContent = formatTransactionTime(item?.pickupDate);

    const statusCell = document.createElement('td');
    statusCell.className = 'px-3 py-3';
    const statusValue = resolvePickupDisplayStatus({
      status: item?.status,
      date: item?.pickupDate,
      rescheduleConfirmationStatus: item?.confirmationStatus
    });
    const statusLower = String(statusValue || '').toLowerCase();
    const statusClass = statusLower === 'completed'
      ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
      : statusLower === 'failed to comply'
        ? 'border-red-300 bg-red-100 text-red-700'
        : 'border-blue-200 bg-blue-50 text-blue-700';
    statusCell.innerHTML = `<span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}">${safeText(statusValue)}</span>`;

    const confirmCell = document.createElement('td');
    confirmCell.className = 'px-3 py-3';
    const confirmationValue = resolvePickupDisplayConfirmation({
      status: item?.status,
      date: item?.pickupDate,
      rescheduleConfirmationStatus: item?.confirmationStatus
    });
    const confirmationLower = String(confirmationValue || '').toLowerCase();
    const confirmationClass = rescheduleConfirmationPillClass(confirmationValue);
    confirmCell.innerHTML = `<span class="${confirmationClass}">${confirmationValue}</span>`;

    const studentCell = document.createElement('td');
    studentCell.className = 'px-3 py-3';
    appendPersonLines(studentCell, item?.studentName, item?.studentEmail);

    const actionsCell = document.createElement('td');
    actionsCell.className = 'px-3 py-3';
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'flex flex-wrap items-center gap-2';
    const pickupRow = {
      status: item?.status,
      date: item?.pickupDate,
      rescheduleConfirmationStatus: item?.confirmationStatus
    };

    if (!isSuperAdminViewOnlyMode() && canManagePickupConfirmation(pickupRow)) {
      const approveBtn = document.createElement('button');
      approveBtn.type = 'button';
      approveBtn.className = 'inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1';
      approveBtn.textContent = 'Approve';
      approveBtn.addEventListener('click', () => applyPickupConfirmationAction(item?.id, 'approve', approveBtn, item));

      const rejectBtn = document.createElement('button');
      rejectBtn.type = 'button';
      rejectBtn.className = 'inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1';
      rejectBtn.textContent = 'Reject';
      rejectBtn.addEventListener('click', () => applyPickupConfirmationAction(item?.id, 'reject', rejectBtn, item));

      actionsWrap.append(approveBtn, rejectBtn);
    } else {
      actionsWrap.innerHTML = `<span class="text-xs font-medium text-slate-500">${isSuperAdminViewOnlyMode() ? 'View only' : 'No action'}</span>`;
    }
    actionsCell.appendChild(actionsWrap);

    row.append(typeCell, itemsCell, dateCell, statusCell, confirmCell, studentCell, actionsCell);
    tbody.appendChild(row);
  });
}

// Both outcomes are final on the server: the confirmation leaves the Pending
// state and cannot be decided again, and a rejection records a no-show.
const PICKUP_CONFIRMATION_ACTIONS = {
  approve: {
    title: 'Mark this pickup as completed?',
    message: 'Confirms that the student collected their items. This cannot be undone.',
    confirmText: 'Mark completed',
    tone: 'primary',
    busyText: 'Saving...',
    success: 'Pickup marked as completed.'
  },
  reject: {
    title: 'Mark this pickup as a no-show?',
    message: 'Records that the student did not collect their items. This cannot be undone.',
    confirmText: 'Mark no-show',
    tone: 'danger',
    busyText: 'Saving...',
    success: 'Pickup marked as a no-show.'
  }
};

async function applyPickupConfirmationAction(id, action, button = null, item = null) {
  if (isSuperAdminViewOnlyMode()) {
    UIKit.toast('Super admin has view-only access on pickup confirmations.', 'warning');
    return;
  }
  const copy = PICKUP_CONFIRMATION_ACTIONS[action];
  if (!id || !copy) {
    UIKit.toast('Invalid pickup confirmation item', 'error');
    return;
  }

  const student = String(item?.studentName || item?.studentEmail || '').trim();
  const confirmed = await UIKit.confirm({
    title: copy.title,
    message: student ? `${student}: ${copy.message}` : copy.message,
    confirmText: copy.confirmText,
    tone: copy.tone
  });
  if (!confirmed) return;

  const token = localStorage.getItem('token');
  await UIKit.withBusy(button, async () => {
    try {
      const res = await fetch(`${API_BASE}/pickup-confirmations/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply pickup confirmation action');
      }

      UIKit.toast(copy.success, 'success');
      await reloadDatasets('pickupConfirmations', 'transactions', 'users');
      invalidateChartCache();
      loadAnalytics();
    } catch (err) {
      UIKit.toast(err.message || 'Action failed', 'error');
    }
  }, { busyText: copy.busyText });
}

function displayTransactions(transactions) {
  const tbody = document.querySelector('#transactionHistoryTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!transactions.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.className = 'table-empty-state';
    cell.textContent = 'No user request history matches the current filters.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  transactions.forEach(tx => {
    const row = document.createElement('tr');

    const timeCell = document.createElement('td');
    timeCell.textContent = formatTransactionTime(tx?.createdAt);

    const userCell = document.createElement('td');
    appendPersonLines(userCell, tx?.targetUserName, tx?.targetUserEmail);

    const statusCell = document.createElement('td');
    const statusLabel = getUserRequestStatusLabel(tx);
    const statusPill = document.createElement('span');
    statusPill.className = `reg-status ${USER_REQUEST_STATUS_PILLS[statusLabel] || 'reg-status-neutral'}`;
    statusPill.textContent = statusLabel;
    statusCell.appendChild(statusPill);

    const detailsCell = document.createElement('td');
    detailsCell.textContent = safeText(getUserRequestDetailText(tx), '-');

    row.append(timeCell, userCell, statusCell, detailsCell);
    tbody.appendChild(row);
  });
}

async function loadAdminAnnouncements() {
  const token = localStorage.getItem('token');

  showLoading('announcementsTable', 'Loading announcements...');

  const res = await fetch(`${API_BASE}/announcements`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    allAnnouncements = [];
    showError('announcementsTable', data.error || 'Failed to load announcements');
    if (announcementsFilter) announcementsFilter.apply();
    return;
  }


  allAnnouncements = Array.isArray(data) ? data : [];
  if (announcementsFilter) {
    announcementsFilter.refreshOptions();
    announcementsFilter.apply();
  }
}

function formatAnnouncementPriority(value) {
  const normalized = String(value || 'medium').trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatAnnouncementDate(rawDate, fallback = 'No expiry') {
  if (!rawDate) return fallback;
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function renderFilteredAnnouncements(items) {
  const tbody = document.querySelector('#announcementsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!items.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'table-empty-state';
    cell.textContent = 'No announcements found.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  items.forEach(item => {
    const row = document.createElement('tr');

    const titleCell = document.createElement('td');
    const titleWrap = document.createElement('div');
    const titleText = document.createElement('div');
    titleText.textContent = safeText(item?.title);
    titleText.style.fontWeight = '700';
    const contentPreview = document.createElement('div');
    const previewText = safeText(item?.content, '').replace(/\s+/g, ' ').trim();
    contentPreview.textContent = previewText ? previewText.slice(0, 110) + (previewText.length > 110 ? '...' : '') : 'No content';
    contentPreview.style.color = '#64748b';
    contentPreview.style.marginTop = '0.25rem';
    contentPreview.style.fontSize = '0.85rem';
    titleWrap.append(titleText, contentPreview);
    titleCell.appendChild(titleWrap);

    const categoryCell = document.createElement('td');
    const categoryBadge = window.SmartFilter ? SmartFilter.categoryBadge(item?.category) : null;
    if (categoryBadge) {
      const badgeEl = document.createElement('span');
      badgeEl.className = 'category-badge ' + categoryBadge.className;
      badgeEl.textContent = categoryBadge.label;
      categoryCell.appendChild(badgeEl);
    } else {
      categoryCell.textContent = safeText(item?.category, 'General');
    }

    const priorityCell = document.createElement('td');
    priorityCell.textContent = formatAnnouncementPriority(item?.priority);

    const publishedCell = document.createElement('td');
    publishedCell.textContent = formatAnnouncementDate(item?.publishedAt, 'Not published');

    const expiresCell = document.createElement('td');
    expiresCell.textContent = item?.isExpired
      ? `Expired ${formatAnnouncementDate(item?.expiresAt, '')}`
      : formatAnnouncementDate(item?.expiresAt, 'No expiry');

    const authorCell = document.createElement('td');
    authorCell.textContent = safeText(item?.createdByName, 'Admin');

    const actionCell = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.className = 'inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1';
    editBtn.type = 'button';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startAnnouncementEdit(item));

    const archiveBtn = document.createElement('button');
    archiveBtn.className = 'ml-2 inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1';
    archiveBtn.type = 'button';
    archiveBtn.textContent = 'Archive';
    archiveBtn.addEventListener('click', () => archiveAnnouncement(item?._id, item?.title || 'this announcement', archiveBtn));

    actionCell.append(editBtn, archiveBtn);
    row.append(titleCell, categoryCell, priorityCell, publishedCell, expiresCell, authorCell, actionCell);
    tbody.appendChild(row);
  });
}

function startAnnouncementEdit(item) {
  const idInput = document.getElementById('announcementId');
  const titleInput = document.getElementById('announcementTitle');
  const categoryInput = document.getElementById('announcementCategory');
  const priorityInput = document.getElementById('announcementPriority');
  const expiresAtInput = document.getElementById('announcementExpiresAt');
  const contentInput = document.getElementById('announcementContent');
  const submitButton = document.getElementById('announcementSubmitBtn');
  const cancelButton = document.getElementById('cancelAnnouncementEditBtn');
  const messageNode = document.getElementById('announcementFormMessage');

  if (idInput) idInput.value = item?._id || '';
  if (titleInput) titleInput.value = item?.title || '';
  if (categoryInput) categoryInput.value = item?.category || '';
  if (priorityInput) priorityInput.value = String(item?.priority || 'medium').toLowerCase();
  if (expiresAtInput) {
    const expiresAt = item?.expiresAt ? new Date(item.expiresAt) : null;
    expiresAtInput.value = expiresAt && !Number.isNaN(expiresAt.getTime())
      ? new Date(expiresAt.getTime() - (expiresAt.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
      : '';
  }
  if (contentInput) contentInput.value = item?.content || '';
  if (submitButton) submitButton.textContent = 'Update Announcement';
  if (cancelButton) cancelButton.style.display = '';
  if (messageNode) {
    messageNode.textContent = `Editing "${item?.title || 'announcement'}".`;
    messageNode.className = 'text-sm font-medium text-blue-700';
  }
  document.getElementById('announcements')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetAnnouncementForm() {
  const form = document.getElementById('announcementForm');
  const idInput = document.getElementById('announcementId');
  const priorityInput = document.getElementById('announcementPriority');
  const submitButton = document.getElementById('announcementSubmitBtn');
  const cancelButton = document.getElementById('cancelAnnouncementEditBtn');
  const messageNode = document.getElementById('announcementFormMessage');

  form?.reset();
  if (idInput) idInput.value = '';
  if (priorityInput) priorityInput.value = 'medium';
  if (submitButton) submitButton.textContent = 'Create Announcement';
  if (cancelButton) cancelButton.style.display = 'none';
  if (messageNode) {
    messageNode.textContent = '';
    messageNode.className = 'text-sm font-medium text-slate-600';
  }
}

function displayUsers(users) {
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = '';

  if (!users.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'table-empty-state';
    cell.textContent = 'No users match the current filters.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  users.forEach(user => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = safeText(user?.name);

    const emailCell = document.createElement('td');
    emailCell.textContent = safeText(user?.email);

    const ageCell = document.createElement('td');
    ageCell.textContent = safeText(user?.age);

    const statusCell = document.createElement('td');
    statusCell.textContent = safeText(user?.status, '-');

    const lastLoginCell = document.createElement('td');
    lastLoginCell.textContent = formatOptionalDate(user?.lastLoginAt);

    const actionCell = document.createElement('td');
    const viewBtn = document.createElement('button');
    viewBtn.className = 'inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => viewUser(user?._id, { showRegistration: false }));
    actionCell.appendChild(viewBtn);

    row.append(nameCell, emailCell, ageCell, statusCell, lastLoginCell, actionCell);
    tbody.appendChild(row);
  });
}

function appendRegistrationRow(tbody, reg, showDecisionButtons, showSetPendingButton = false) {
  const userId = reg.userId?._id;
  const rawStatus = (reg.userId?.status || 'pending').toLowerCase();
  const status = normalizeRegistrationStatusForDisplay(rawStatus);

  const row = document.createElement('tr');
  const studentNumberCell = document.createElement('td');
  studentNumberCell.textContent = safeText(reg.userId?.studentNumber);

  const fullNameCell = document.createElement('td');
  fullNameCell.textContent = safeText(reg.fullname);

  const courseCell = document.createElement('td');
  courseCell.textContent = safeText(reg.course);

  const moduleCell = document.createElement('td');
  moduleCell.textContent = summarizeRegistrationItems(reg.module);

  const updatedAtCell = document.createElement('td');
  updatedAtCell.textContent = formatTransactionTime(reg?.updatedAt || reg?.createdAt);

  const statusCell = document.createElement('td');
  const statusBadge = document.createElement('span');
  statusBadge.className = registrationStatusBadgeClass(status);
  statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  statusCell.appendChild(statusBadge);

  const actionCell = document.createElement('td');
  const gridMode = Boolean(showDecisionButtons || showSetPendingButton);
  const actionContainer = document.createElement('div');
  if (gridMode) {
    actionContainer.className = 'action-buttons';
  }
  const appendAction = (el) => (gridMode ? actionContainer : actionCell).appendChild(el);

  const viewBtn = document.createElement('button');
  viewBtn.className = 'inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1';
  if (gridMode) {
    viewBtn.classList.add('w-full', 'justify-center', 'whitespace-nowrap');
  }
  viewBtn.textContent = 'View';
  if (userId) {
    viewBtn.addEventListener('click', () => viewUser(userId, { showRegistration: true }));
  } else {
    viewBtn.disabled = true;
  }
  appendAction(viewBtn);

  const documentPath = safeDocumentPath(reg?.pictureOfId || reg?.userId?.pictureOfId);
  if (documentPath) {
    const docBtn = document.createElement('a');
    docBtn.className = 'inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1';
    if (gridMode) {
      docBtn.classList.add('w-full', 'justify-center', 'whitespace-nowrap');
    } else {
      docBtn.classList.add('ml-2');
    }
    docBtn.textContent = 'ORF';
    docBtn.href = documentPath;
    docBtn.target = '_blank';
    docBtn.rel = 'noopener noreferrer';
    appendAction(docBtn);
  }

  if (!isSuperAdminViewOnlyMode()) {
    if (showDecisionButtons) {
      const approveBtn = document.createElement('button');
      approveBtn.type = 'button';
      approveBtn.className = 'inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1';
      if (gridMode) {
        approveBtn.classList.add('w-full', 'justify-center', 'whitespace-nowrap');
      }
      approveBtn.textContent = 'Approve';
      approveBtn.disabled = status === 'approved' || !reg?._id;
      approveBtn.addEventListener('click', () => updateRegistrationStatus(reg._id, 'approved', approveBtn));
      appendAction(approveBtn);

      // The server only moves a registration to rejected from pending, and it
      // reads the registration's own status for that, not the user's.
      if (String(reg?.status || 'pending').toLowerCase() === 'pending') {
        const rejectBtn = document.createElement('button');
        rejectBtn.type = 'button';
        rejectBtn.className = 'inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1';
        if (gridMode) {
          rejectBtn.classList.add('w-full', 'justify-center', 'whitespace-nowrap');
        }
        rejectBtn.textContent = 'Reject';
        rejectBtn.disabled = !reg?._id;
        rejectBtn.addEventListener('click', () => updateRegistrationStatus(reg._id, 'rejected', rejectBtn));
        appendAction(rejectBtn);
      }
    }

    const archiveBtn = document.createElement('button');
    archiveBtn.type = 'button';
    archiveBtn.className = 'inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1';
    if (gridMode) {
      archiveBtn.classList.add('w-full', 'justify-center', 'whitespace-nowrap');
    } else {
      archiveBtn.classList.add('ml-2');
    }
    archiveBtn.textContent = 'Archive';
    archiveBtn.disabled = !reg?._id;
    archiveBtn.addEventListener('click', () => archiveRegistration(reg._id, archiveBtn));
    appendAction(archiveBtn);
  }

  if (gridMode) {
    actionCell.appendChild(actionContainer);
  }

  if (showSetPendingButton && !isSuperAdminViewOnlyMode()) {
    const pendingBtn = document.createElement('button');
    pendingBtn.type = 'button';
    pendingBtn.className = 'inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1';
    if (gridMode) {
      pendingBtn.classList.add('w-full', 'justify-center', 'whitespace-nowrap');
    }
    pendingBtn.textContent = 'Set Pending';
    pendingBtn.disabled = status === 'pending' || !reg?._id;
    pendingBtn.addEventListener('click', () => updateRegistrationStatus(reg._id, 'pending', pendingBtn));
    appendAction(pendingBtn);
  }

  if (isSuperAdminViewOnlyMode()) {
    const readOnlyLabel = document.createElement('span');
    readOnlyLabel.className = 'ml-2 text-xs font-medium text-slate-500';
    readOnlyLabel.textContent = 'View only';
    actionCell.appendChild(readOnlyLabel);
  }

  row.append(studentNumberCell, fullNameCell, courseCell, moduleCell, updatedAtCell, statusCell, actionCell);
  tbody.appendChild(row);
}

function displayRegistrations(registrations) {
  const tbody = document.querySelector('#registrationsTable tbody');
  tbody.innerHTML = '';

  if (!registrations.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'table-empty-state';
    cell.textContent = 'No pending registrations match the current filters.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }
  registrations.forEach(reg => appendRegistrationRow(tbody, reg, true));
}

function displayApprovedRegistrations(registrations) {
  const tbody = document.querySelector('#approvedRegistrationsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!registrations.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'table-empty-state';
    cell.textContent = 'No approved registrations match the current filters.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }
  registrations.forEach(reg => appendRegistrationRow(tbody, reg, false, true));
}

function displayRejectedRegistrations(registrations) {
  const tbody = document.querySelector('#rejectedRegistrationsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!registrations.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'table-empty-state';
    cell.textContent = 'No rejected registrations match the current filters.';
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }
  registrations.forEach(reg => appendRegistrationRow(tbody, reg, false, true));
}

// Wording per target status. "Set Pending" used to share the reject copy
// ("Are you sure you want to reject this registration?") because every
// non-approve status fell through to 'reject'.
const REGISTRATION_STATUS_ACTIONS = {
  approved: {
    title: 'Approve this registration?',
    message: 'The requested items are deducted from inventory, a pickup schedule is generated and the student is emailed.',
    confirmText: 'Approve',
    busyText: 'Approving...',
    success: 'Registration approved.',
    failure: 'Failed to approve registration'
  },
  rejected: {
    title: 'Reject this registration?',
    message: 'The student is emailed this reason.',
    confirmText: 'Reject registration',
    busyText: 'Rejecting...',
    success: 'Registration rejected.',
    failure: 'Failed to reject registration'
  },
  pending: {
    title: 'Set this registration back to pending?',
    message: 'The registration returns to the pending queue for a new decision. If it was approved, its items are returned to inventory.',
    confirmText: 'Set to pending',
    busyText: 'Updating...',
    success: 'Registration set back to pending.',
    failure: 'Failed to set registration to pending'
  }
};

async function updateRegistrationStatus(registrationId, status, button = null) {
  if (isSuperAdminViewOnlyMode()) {
    UIKit.toast('Super admin has view-only access on registration decisions.', 'warning');
    return;
  }
  const copy = REGISTRATION_STATUS_ACTIONS[status];
  if (!registrationId || !copy) {
    UIKit.toast('Invalid registration', 'error');
    return;
  }

  // Rejecting needs a reason (the server requires at least 10 characters), so
  // its dialog asks for one; its danger-styled button is the confirmation.
  const payload = { status };
  if (status === 'rejected') {
    const rejectionReason = await UIKit.prompt({
      title: copy.title,
      message: copy.message,
      label: 'Reason for rejection',
      placeholder: 'Explain why this registration is being rejected...',
      minLength: 10,
      multiline: true,
      confirmText: copy.confirmText,
      tone: 'danger'
    });
    if (rejectionReason === null) return;
    payload.rejectionReason = rejectionReason;
  } else {
    const confirmed = await UIKit.confirm({
      title: copy.title,
      message: copy.message,
      confirmText: copy.confirmText,
      tone: status === 'pending' ? 'danger' : 'primary'
    });
    if (!confirmed) return;
  }

  const token = localStorage.getItem('token');

  await UIKit.withBusy(button, async () => {
    try {
      const res = await fetch(`${API_BASE}/registrations/${encodeURIComponent(registrationId)}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || copy.failure);

      // A toast has no line breaks, so the schedule preview's lines are joined.
      const approvalSummary = status === 'approved'
        ? formatAiSchedulePreview(data.generatedSchedule).split('\n').filter(Boolean).join(' · ')
        : '';
      UIKit.toast(
        [data.message || copy.success, approvalSummary].filter(Boolean).join(' '),
        'success',
        { duration: approvalSummary ? 10000 : 4200 }
      );
      if (status === 'approved') {
        const pickupConfirmationsPath = getAdminViewPath('pickupconfirmations');
        if (normalizeAdminPath(window.location.pathname) !== normalizeAdminPath(pickupConfirmationsPath)) {
          window.history.pushState({}, '', pickupConfirmationsPath);
        }
        setAdminView('pickupconfirmations');
      }
      // Approving a registration changes the registration, the user record, the
      // generated pickup confirmation, and the transaction log, so all four are
      // refetched rather than only the datasets of whichever view is now active.
      await reloadDatasets('registrations', 'users', 'pickupConfirmations', 'transactions');
    } catch (err) {
      UIKit.toast(err.message || copy.failure, 'error');
    }
  }, { busyText: copy.busyText });
}

async function archiveRegistration(registrationId, button = null) {
  if (isSuperAdminViewOnlyMode()) {
    UIKit.toast('Super admin has view-only access on registration decisions.', 'warning');
    return;
  }
  if (!registrationId) {
    UIKit.toast('Invalid registration', 'error');
    return;
  }

  const confirmed = await UIKit.confirm({
    title: 'Archive this registration?',
    message: 'The record is removed from the registration lists.',
    confirmText: 'Archive',
    tone: 'danger'
  });
  if (!confirmed) return;

  const token = localStorage.getItem('token');

  await UIKit.withBusy(button, async () => {
    try {
      const res = await fetch(`${API_BASE}/registrations/${encodeURIComponent(registrationId)}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to archive registration');

      UIKit.toast(data.message || 'Registration archived successfully', 'success');
      await reloadDatasets('registrations', 'users');
    } catch (err) {
      UIKit.toast(err.message || 'Archive failed', 'error');
    }
  }, { busyText: 'Archiving...' });
}

async function viewUser(userId, options = {}) {
  if (!userId) {
    UIKit.toast('Invalid user selected', 'error');
    return;
  }

  const token = localStorage.getItem('token');
  currentUserId = userId;

  try {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to load details');

    const user = data.user || data;
    const registration = data.registration || data;
    displayUserDetails(user, registration, options);
    document.getElementById('userDetailModal').style.display = 'block';

  } catch (err) {
    UIKit.toast(err.message || 'Failed to load details', 'error');
  }
}

function displayUserDetails(user, reg, options = {}) {
  const showRegistration = options.showRegistration === true;
  const detailsDiv = document.getElementById('userDetails');
  detailsDiv.innerHTML = '';

  const accountCard = createDetailCard(detailsDiv, 'Account Info');
  const accountGrid = createDetailGrid(accountCard);
  appendDetail(accountGrid, 'Name', user?.name);
  appendDetail(accountGrid, 'Email', user?.email);
  appendDetail(accountGrid, 'Student Number', user?.studentNumber);
  appendDetail(accountGrid, 'Age', reg?.age ?? user?.age);
  appendDetail(accountGrid, 'Status', user?.status || '-');
  appendDetail(accountGrid, 'Role', user?.isAdmin ? 'Admin' : 'Student');
  appendDetail(accountGrid, 'Last Login', formatOptionalDate(user?.lastLoginAt));
  appendDetail(accountGrid, 'Last Login IP', user?.lastLoginIp || 'N/A');

  if (showRegistration) {
    const regCard = createDetailCard(detailsDiv, 'Student Registration');
    const regGrid = createDetailGrid(regCard);
    appendDetail(regGrid, 'Full Name', reg?.fullname);
    appendDetail(regGrid, 'Course', reg?.course);
    appendDetail(regGrid, 'Year Level', reg?.yearLevel || user?.yearLevel);
    appendDetail(regGrid, 'Student Type', reg?.studentType || user?.studentType);

    const moduleCard = createDetailCard(detailsDiv, 'Requested Items');
    const itemGrid = createDetailGrid(moduleCard);
    appendDetailList(itemGrid, 'Modules', reg?.module, 'No modules submitted');
    appendDetailList(itemGrid, 'Books', reg?.books, 'No books submitted');
    appendDetail(itemGrid, 'Uniforms', reg?.uniformType);

    const docPath = safeDocumentPath(reg?.pictureOfId || user?.pictureOfId);
    const imagePath = safeImagePath(reg?.pictureOfId || user?.pictureOfId);
    const documentCard = createDetailCard(detailsDiv, 'ORF / ID Document');
    if (imagePath) {
      const img = document.createElement('img');
      img.src = imagePath;
      img.style.maxWidth = '300px';
      img.style.borderRadius = '8px';
      img.alt = 'Student document';
      documentCard.appendChild(img);
      if (docPath) {
        const actions = document.createElement('div');
        actions.className = 'detail-actions';
        const link = document.createElement('a');
        link.href = docPath;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Open full document';
        link.className = 'inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1';
        actions.appendChild(link);
        documentCard.appendChild(actions);
      }
    } else if (docPath) {
      const link = document.createElement('a');
      link.href = docPath;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Open uploaded document';
      link.className = 'inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1';
      const actions = document.createElement('div');
      actions.className = 'detail-actions';
      actions.appendChild(link);
      documentCard.appendChild(actions);
    } else {
      const emptyPic = document.createElement('p');
      emptyPic.style.color = 'gray';
      emptyPic.textContent = 'No document uploaded.';
      documentCard.appendChild(emptyPic);
    }
  }
}

async function deleteUser() {
  if (isSuperAdminViewOnlyMode()) {
    UIKit.toast('Super admin has view-only access on users.', 'warning');
    return;
  }
  if (!currentUserId) {
    UIKit.toast('No user selected', 'error');
    return;
  }

  const confirmed = await UIKit.confirm({
    title: 'Delete this user?',
    message: 'The account is removed permanently. This cannot be undone.',
    confirmText: 'Delete user',
    tone: 'danger'
  });
  if (!confirmed) return;

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(currentUserId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Delete failed');

    UIKit.toast('User deleted', 'success');
    document.getElementById('userDetailModal').style.display = 'none';
    await reloadDatasets('users');
    invalidateChartCache();
    loadAnalytics();

  } catch (err) {
    UIKit.toast(err.message || 'Delete failed', 'error');
  }
}

async function submitAnnouncementForm(event) {
  event.preventDefault();

  const id = String(document.getElementById('announcementId')?.value || '').trim();
  const title = String(document.getElementById('announcementTitle')?.value || '').trim();
  const category = String(document.getElementById('announcementCategory')?.value || '').trim();
  const priority = String(document.getElementById('announcementPriority')?.value || 'medium').trim().toLowerCase();
  const expiresAtValue = String(document.getElementById('announcementExpiresAt')?.value || '').trim();
  const content = String(document.getElementById('announcementContent')?.value || '').trim();
  const messageNode = document.getElementById('announcementFormMessage');
  const submitButton = document.getElementById('announcementSubmitBtn');
  const cancelButton = document.getElementById('cancelAnnouncementEditBtn');
  const token = localStorage.getItem('token');

  if (messageNode) {
    messageNode.textContent = '';
    messageNode.className = 'text-sm font-medium text-slate-600';
  }

  if (!title || !content) {
    if (messageNode) {
      messageNode.textContent = 'Title and content are required.';
      messageNode.className = 'text-sm font-medium text-rose-600';
    }
    return;
  }

  if (!token) {
    redirectToLogin();
    return;
  }

  const payload = {
    title,
    category,
    priority,
    content,
    expiresAt: expiresAtValue ? new Date(expiresAtValue).toISOString() : null
  };

  try {
    if (submitButton) submitButton.disabled = true;
    if (cancelButton) cancelButton.disabled = true;

    const res = await fetch(id ? `${API_BASE}/announcements/${encodeURIComponent(id)}` : `${API_BASE}/announcements`, {
      method: id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save announcement');
    }

    resetAnnouncementForm();
    if (messageNode) {
      messageNode.textContent = data.message || (id ? 'Announcement updated successfully.' : 'Announcement created successfully.');
      messageNode.className = 'text-sm font-medium text-emerald-700';
    }
    await reloadDatasets('announcements', 'transactions');
  } catch (err) {
    if (messageNode) {
      messageNode.textContent = err.message || 'Failed to save announcement';
      messageNode.className = 'text-sm font-medium text-rose-600';
    } else {
      UIKit.toast(err.message || 'Failed to save announcement', 'error');
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
    if (cancelButton) cancelButton.disabled = false;
  }
}

async function archiveAnnouncement(announcementId, label, button = null) {
  if (!announcementId) return;
  const confirmed = await UIKit.confirm({
    title: 'Archive this announcement?',
    message: `"${safeText(label, 'This announcement')}" will no longer be shown to students.`,
    confirmText: 'Archive',
    tone: 'danger'
  });
  if (!confirmed) return;

  const token = localStorage.getItem('token');
  if (!token) {
    redirectToLogin();
    return;
  }

  await UIKit.withBusy(button, async () => {
    try {
      const res = await fetch(`${API_BASE}/announcements/${encodeURIComponent(announcementId)}/archive`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to archive announcement');
      resetAnnouncementForm();
      UIKit.toast(data.message || 'Announcement archived.', 'success');
      await reloadDatasets('announcements', 'transactions');
    } catch (err) {
      UIKit.toast(err.message || 'Failed to archive announcement', 'error');
    }
  }, { busyText: 'Archiving...' });
}

async function createAdminAccount(event) {
  event.preventDefault();
  if (!isCurrentSuperAdmin()) {
    UIKit.toast('Super admin access required', 'warning');
    return;
  }
  
  const nameInput = document.getElementById('newAdminName');
  const emailInput = document.getElementById('newAdminEmail');
  const passwordInput = document.getElementById('newAdminPassword');
  const messageEl = document.getElementById('createAdminMessage');
  const submitBtn = document.getElementById('createAdminBtn');
  const btnText = submitBtn.querySelector('.create-admin-btn-text');
  const btnSpinner = submitBtn.querySelector('.create-admin-btn-spinner');
  
  const name = nameInput?.value?.trim();
  const email = emailInput?.value?.trim();
  const password = passwordInput?.value?.trim();
  
  if (!name || !email || !password) {
    if (messageEl) {
      messageEl.textContent = 'Please fill in all fields';
      messageEl.className = 'text-sm font-medium text-red-600';
    }
    return;
  }
  
  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Creating...';
    if (btnSpinner) btnSpinner.classList.remove('hidden');
  }
  
  if (messageEl) {
    messageEl.textContent = 'Creating admin account...';
    messageEl.className = 'text-sm font-medium text-slate-600';
  }

  const token = localStorage.getItem('token');
  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create admin account');
    }

    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (messageEl) {
      messageEl.textContent = data.message || 'Admin account created successfully.';
      messageEl.className = 'text-sm font-medium text-emerald-700';
    }
    await reloadDatasets('adminAccounts', 'transactions');
  } catch (err) {
    if (messageEl) {
      messageEl.textContent = err.message || 'Failed to create admin account';
      messageEl.className = 'text-sm font-medium text-rose-600';
    } else {
      UIKit.toast(err.message || 'Failed to create admin account', 'error');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Create Admin';
      if (btnSpinner) btnSpinner.classList.add('hidden');
    }
  }
}

async function changeAdminPassword(event) {
  event.preventDefault();

  const oldPasswordInput = document.getElementById('adminOldPassword');
  const newPasswordInput = document.getElementById('adminNewPassword');
  const confirmPasswordInput = document.getElementById('adminConfirmNewPassword');
  const messageNode = document.getElementById('changeAdminPasswordMessage');
  const submitButton = event.currentTarget?.querySelector('button[type="submit"]');

  const oldPassword = String(oldPasswordInput?.value || '');
  const newPassword = String(newPasswordInput?.value || '');
  const confirmNewPassword = String(confirmPasswordInput?.value || '');

  if (messageNode) {
    messageNode.textContent = '';
    messageNode.className = 'text-sm font-medium text-slate-600';
  }

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    if (messageNode) {
      messageNode.textContent = 'Complete all password fields.';
      messageNode.className = 'text-sm font-medium text-rose-600';
    }
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    if (submitButton) submitButton.disabled = true;
    const res = await fetch(`${API_BASE}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword, confirmNewPassword })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to change admin password');
    }

    if (oldPasswordInput) oldPasswordInput.value = '';
    if (newPasswordInput) newPasswordInput.value = '';
    if (confirmPasswordInput) confirmPasswordInput.value = '';
    if (messageNode) {
      messageNode.textContent = data.message || 'Admin password changed successfully.';
      messageNode.className = 'text-sm font-medium text-emerald-700';
    }
  } catch (err) {
    if (messageNode) {
      messageNode.textContent = err.message || 'Failed to change admin password';
      messageNode.className = 'text-sm font-medium text-rose-600';
    } else {
      UIKit.toast(err.message || 'Failed to change admin password', 'error');
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

async function submitAdminAccountsGate(event) {
  event.preventDefault();

  const emailInput = document.getElementById('adminGateEmail');
  const passwordInput = document.getElementById('adminGatePassword');
  const messageEl = document.getElementById('adminGateMessage');
  const submitBtn = document.getElementById('adminGateVerifyBtn');
  const btnText = submitBtn?.querySelector('.admin-gate-btn-text');
  const btnSpinner = submitBtn?.querySelector('.admin-gate-btn-spinner');

  const email = String(emailInput?.value || '').trim();
  const password = passwordInput?.value || '';

  if (messageEl) {
    messageEl.textContent = '';
    messageEl.className = 'text-sm font-medium text-slate-600';
  }

  if (!email) {
    if (messageEl) {
      messageEl.textContent = 'Please enter your email.';
      messageEl.className = 'text-sm font-medium text-rose-600';
    }
    emailInput?.focus();
    return;
  }

  if (!password) {
    if (messageEl) {
      messageEl.textContent = 'Please enter your password.';
      messageEl.className = 'text-sm font-medium text-rose-600';
    }
    passwordInput?.focus();
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    redirectToLogin();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Verifying...';
    if (btnSpinner) btnSpinner.classList.remove('hidden');
  }

  try {
    const res = await fetch(`${API_BASE}/verify-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password. Please try again.');
    }

    setAdminAccountsVerified(true);
    if (messageEl) {
      messageEl.textContent = '';
      messageEl.className = 'text-sm font-medium text-slate-600';
    }
    if (passwordInput) passwordInput.value = '';
    applyAdminView();
  } catch (err) {
    if (messageEl) {

      messageEl.textContent = err.message || 'Invalid email or password. Please try again.';
      messageEl.className = 'text-sm font-medium text-rose-600';
    }
    passwordInput?.focus();
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Verify Access';
      if (btnSpinner) btnSpinner.classList.add('hidden');
    }
  }
}

function initAdminAccountsGateToggle() {
  const toggle = document.getElementById('adminGatePasswordToggle');
  const input = document.getElementById('adminGatePassword');
  const eyeIcon = document.getElementById('adminGateEyeIcon');
  const eyeOffIcon = document.getElementById('adminGateEyeOffIcon');
  if (!toggle || !input) return;

  toggle.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(show));
    toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    if (eyeIcon) eyeIcon.classList.toggle('hidden', show);
    if (eyeOffIcon) eyeOffIcon.classList.toggle('hidden', !show);
    input.focus();
  });
}

// Mirrors deleteAdmin in services/adminService.js: only a super admin may
// delete, and never their own account or another super admin's. Rows the
// server would refuse keep their "Protected" / "View only" badge instead.
function canDeleteAdminAccount(account) {
  if (!account?._id || account?.isSuperAdmin || !isCurrentSuperAdmin()) return false;
  const self = currentAdminProfile || readCachedAdminProfile();
  if (self?._id && String(self._id) === String(account._id)) return false;
  const selfEmail = String(self?.email || '').trim().toLowerCase();
  if (selfEmail && selfEmail === String(account?.email || '').trim().toLowerCase()) return false;
  return true;
}

async function deleteAdminAccount(adminId, label, button = null) {
  if (!adminId) return;
  if (!isCurrentSuperAdmin()) {
    UIKit.toast('Super admin access required', 'warning');
    return;
  }
  const confirmed = await UIKit.confirm({
    title: 'Delete this admin account?',
    message: `${label} will lose access to the admin panel immediately. This cannot be undone.`,
    confirmText: 'Delete account',
    tone: 'danger'
  });
  if (!confirmed) return;

  const token = localStorage.getItem('token');
  if (!token) {
    redirectToLogin();
    return;
  }

  await UIKit.withBusy(button, async () => {
    try {
      const res = await fetch(`${API_BASE}/admins/${encodeURIComponent(adminId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete admin account');
      UIKit.toast(data.message || 'Admin account deleted.', 'success');
      await reloadDatasets('adminAccounts', 'transactions');
    } catch (err) {
      UIKit.toast(err.message || 'Failed to delete admin account', 'error');
    }
  }, { busyText: 'Deleting...' });
}

const chartCache = {};

function invalidateChartCache() {
  chartGeneration += 1;
  Object.keys(chartCache).forEach(key => {
    delete chartCache[key];
  });
}

function parseInventoryTransactionDetails(transaction) {
  const details = safeText(transaction?.details, '');
  const qtyMatch = details.match(/qty=(-?\d+)/i);
  const quantity = qtyMatch
    ? Math.max(0, Number(qtyMatch[1]) || 0)
    : Math.max(0, Number(transaction?.quantity) || 0);
  const nameMatch = details.match(/^([^(\n]+)/);
  const itemName = nameMatch ? nameMatch[1].replace(/^\[[^\]]*\]\s*/, '').trim() : '';
  return {
    quantity,
    itemName: itemName || safeText(transaction?.itemLabel || transaction?.entityId, 'Unnamed item')
  };
}

function buildTimelineEntries(transactions, limit = 8) {
  return transactions
    .map(transaction => {
      const date = getTransactionDate(transaction);
      if (!date) return null;
      const action = classifyInventoryTransaction(transaction?.action);
      const parsed = parseInventoryTransactionDetails(transaction);
      return {
        date,
        timestamp: date.getTime(),
        action,
        label: parsed.itemName,
        quantity: parsed.quantity,
        admin: safeText(transaction?.adminName, 'Admin')
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

function buildInventoryHealthRows(limit = 10, pool) {
  const source = Array.isArray(pool) ? pool : allInventory;
  const atRisk = source
    .map(item => {
      const quantity = Math.max(0, Number(item?.quantity) || 0);
      const reorderLevel = Math.max(0, Number(item?.reorderLevel) || 0);
      return {
        label: safeText(item?.itemName, 'Unnamed item'),
        quantity,
        reorderLevel
      };
    })
    .filter(item => item.quantity === 0 || (item.reorderLevel > 0 && item.quantity <= item.reorderLevel))
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, limit);

  if (atRisk.length) return atRisk;

  return source
    .map(item => ({
      label: safeText(item?.itemName, 'Unnamed item'),
      quantity: Math.max(0, Number(item?.quantity) || 0),
      reorderLevel: Math.max(0, Number(item?.reorderLevel) || 0)
    }))
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, limit);
}

function signedInventoryDelta(transaction) {
  const action = classifyInventoryTransaction(transaction?.action);
  const quantity = Math.max(0, Number(transaction?.quantity) || 0);
  const parsed = parseInventoryTransactionDetails(transaction);
  const value = parsed.quantity || quantity;
  if (action === 'Added') return value;
  if (action === 'Removed') return -value;
  return 0;
}

function buildNetStockSeries(transactions, buckets) {
  return buckets.map(bucket => {
    let net = 0;
    transactions.forEach(transaction => {
      const date = getTransactionDate(transaction);
      if (!date) return;
      const timestamp = date.getTime();
      if (timestamp >= bucket.fromMs && timestamp < bucket.toMs) net += signedInventoryDelta(transaction);
    });
    return net;
  });
}

function buildRemovalsSeries(transactions, buckets) {
  return buckets.map(bucket => {
    let count = 0;
    transactions.forEach(transaction => {
      if (classifyInventoryTransaction(transaction?.action) !== 'Removed') return;
      const date = getTransactionDate(transaction);
      if (!date) return;
      const timestamp = date.getTime();
      if (timestamp >= bucket.fromMs && timestamp < bucket.toMs) count += 1;
    });
    return count;
  });
}

function buildCohortSeries(entries, buckets) {
  return buckets.map(bucket => {
    const cohortSet = new Set();
    entries.forEach(entry => {
      const timestamp = entry?.date instanceof Date ? entry.date.getTime() : Number.NaN;
      if (Number.isFinite(timestamp) && timestamp >= bucket.fromMs && timestamp < bucket.toMs) {
        cohortSet.add(entry.cohort);
      }
    });
    return cohortSet.size;
  });
}

function buildForecastSeries(usageEntries, bucketsAhead = 4) {
  const weekMs = 7 * DAY_MS;
  const now = Date.now();
  const pastCount = 6;
  const series = [];

  for (let i = pastCount - 1; i >= 0; i--) {
    const from = now - ((i + 1) * weekMs);
    const to = now - (i * weekMs);
    series.push({
      label: new Date(from).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: sumUsageInWindow(usageEntries, from, to),
      forecast: false
    });
  }

  const x = Array.from({ length: pastCount }, (_, i) => i);
  const y = series.map(point => point.value);
  const xMean = x.reduce((sum, value) => sum + value, 0) / pastCount;
  const yMean = y.reduce((sum, value) => sum + value, 0) / pastCount;
  let numerator = 0;
  let denominator = 0;
  x.forEach((xi, i) => {
    numerator += (xi - xMean) * (y[i] - yMean);
    denominator += (xi - xMean) * (xi - xMean);
  });
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;
  const project = index => Math.max(0, Math.round(intercept + slope * index));

  for (let i = 0; i < bucketsAhead; i++) {
    const from = now + (i * weekMs);
    const value = project(pastCount + i);
    const spread = Math.max(1, Math.round(value * 0.15));
    series.push({
      label: new Date(from).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value,
      forecast: true,
      lower: Math.max(0, value - spread),
      upper: value + spread
    });
  }

  return series;
}

const DONUT_PALETTE = ['#2563eb', '#1e3a8a', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

const KPI_ICONS = {
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  gauge: '<path d="M12 21a9 9 0 1 1 9-9"/><path d="M12 12l5.5-3.5"/>',
  alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>'
};

function buildKpiItems(data) {
  const topItem = data.topIssuedItems[0];
  const topCohort = data.cohortEntries[0];
  const coverageValue = data.stockCoverage;
  const coverageWeeks = Number.parseFloat(coverageValue);
  let coverageStatusColor = '#10b981';
  let coverageStatusLabel = 'Stable';
  if (Number.isFinite(coverageWeeks)) {
    if (coverageWeeks < 13) {
      coverageStatusColor = '#ef4444';
      coverageStatusLabel = 'Low';
    } else if (coverageWeeks < 52) {
      coverageStatusColor = '#f59e0b';
      coverageStatusLabel = 'Moderate';
    } else {
      coverageStatusColor = '#10b981';
      coverageStatusLabel = 'Healthy';
    }
  }

  return [
    {
      label: 'Units Distributed',
      value: formatInteger(data.unitsIssuedInWindow),
      iconKey: 'box',
      color: 'blue',
      change: data.issuedChange || undefined,
      detail: data.previousPeriodLabel
        ? `Units distributed in the selected period. ${data.issuedChange} compared with ${data.previousPeriodLabel}.`
        : 'Units distributed in the selected period.'
    },
    {
      label: 'Highest Utilization Item',
      value: topItem ? `${topItem[0]} (${formatInteger(topItem[1])})` : '—',
      iconKey: 'trend',
      color: 'gold',
      detail: topItem
        ? `Most-requested item in the selected period: ${topItem[0]} with ${formatInteger(topItem[1])} requests.`
        : 'No recorded activity in the selected period.'
    },
    {
      label: 'Most Active Course',
      value: topCohort ? `${topCohort[0]} (${formatInteger(topCohort[1])})` : '—',
      iconKey: 'users',
      color: 'navy',
      detail: topCohort
        ? `Course with the most requests: ${topCohort[0]} with ${formatInteger(topCohort[1])} requests.`
        : 'No recorded activity in the selected period.'
    },
    {
      label: 'Estimated Stock Coverage',
      value: coverageValue,
      iconKey: 'gauge',
      color: 'green',
      statusColor: coverageStatusColor,
      statusLabel: coverageStatusLabel,
      detail: `Estimated stock remaining based on current usage. ${coverageStatusLabel}.`
    },
    {
      label: 'Critical Low Stock Items',
      value: formatInteger(data.criticalLowStockItems.length),
      iconKey: 'alert',
      color: 'red',
      detail: `${formatInteger(data.criticalLowStockItems.length)} items at or below half their reorder level, or fully out of stock.`
    },
    {
      label: 'Slow Moving Items',
      value: formatInteger(data.slowMovingItems),
      iconKey: 'clock',
      color: 'amber',
      detail: `${formatInteger(data.slowMovingItems)} items with no recorded distribution in the slow-moving window.`
    }
  ];
}

function renderRankedBarChart(containerId, entries, detailLabel = 'Item', limit = 10) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!entries.length) {
    renderEmptyChart(containerId);
    return;
  }

  const ranked = entries.slice(0, limit);
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', `${detailLabel} ranking chart. Top ${ranked.length} items by count.`);

  const list = document.createElement('div');
  list.className = 'bar-list';
  const max = Math.max(...ranked.map(([, value]) => value), 1);

  ranked.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'bar-row';

    const labelNode = document.createElement('div');
    labelNode.className = 'bar-label';
    labelNode.textContent = safeText(label);
    labelNode.title = safeText(label);

    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill bar-fill--gradient';
    fill.style.width = `${Math.max(4, Math.round((value / max) * 100))}%`;
    track.appendChild(fill);

    const valueNode = document.createElement('div');
    valueNode.className = 'bar-value';
    valueNode.textContent = String(value);

    row.append(labelNode, track, valueNode);
    bindChartInteraction(
      row,
      `${detailLabel}: ${safeText(label)}`,
      `Request count: ${value}.`,
      `${safeText(label)}: ${value} requests`
    );
    list.appendChild(row);
  });

  container.appendChild(list);
}

function renderVerticalBarChart(containerId, entries, detailLabel = 'Pickup Status') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!entries.length) {
    renderEmptyChart(containerId);
    return;
  }

  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', `${detailLabel} distribution chart. ${entries.length} segments shown.`);

  const grid = document.createElement('div');
  grid.className = 'bar-grid';

  const max = Math.max(...entries.map(([, value]) => value), 1);

  entries.forEach(([label, value]) => {
    const col = document.createElement('div');
    col.className = 'vbar-col';

    const valueNode = document.createElement('div');
    valueNode.className = 'vbar-value';
    valueNode.textContent = formatInteger(value);

    const track = document.createElement('div');
    track.className = 'vbar-track';
    const fill = document.createElement('div');
    fill.className = 'vbar-fill';
    fill.style.height = `${Math.max(3, Math.round((value / max) * 100))}%`;
    track.appendChild(fill);

    const labelNode = document.createElement('div');
    labelNode.className = 'vbar-label';
    labelNode.textContent = safeText(label);
    labelNode.title = safeText(label);

    col.append(valueNode, track, labelNode);
    bindChartInteraction(
      col,
      `${detailLabel}: ${safeText(label)}`,
      `Count: ${value}. Share: ${((value / total) * 100).toFixed(1)}% of total pickups.`,
      `${safeText(label)}: ${value} pickups`
    );
    grid.appendChild(col);
  });

  container.appendChild(grid);
}

function renderStatusBarChart(containerId, rows) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!rows.length) {
    renderEmptyChart(containerId);
    return;
  }

  const sorted = [...rows].sort((a, b) => a.quantity - b.quantity);
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', 'Low stock status chart. Items sorted by remaining quantity.');

  const list = document.createElement('div');
  list.className = 'bar-list';
  const max = Math.max(...sorted.map(row => row.quantity), 1);

  sorted.forEach(row => {
    const { label, quantity, reorderLevel } = row;
    let status = 'safe';
    if (quantity === 0) {
      status = 'critical';
    } else if (reorderLevel > 0 && quantity <= reorderLevel) {
      status = 'warning';
    }
    const isCritical = status === 'critical';

    const rowNode = document.createElement('div');
    rowNode.className = isCritical ? 'bar-row bar-row--critical' : 'bar-row';

    const labelNode = document.createElement('div');
    labelNode.className = 'bar-label';
    labelNode.textContent = safeText(label);
    labelNode.title = safeText(label);

    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = `bar-fill bar-fill--${status}`;
    fill.style.width = `${Math.max(4, Math.round((quantity / max) * 100))}%`;
    track.appendChild(fill);

    const valueNode = document.createElement('div');
    valueNode.className = 'bar-value';
    valueNode.textContent = String(quantity);

    rowNode.append(labelNode, track, valueNode);
    const thresholdText = reorderLevel > 0 ? `Reorder threshold: ${reorderLevel}` : 'No reorder threshold set';
    bindChartInteraction(
      rowNode,
      `Low stock item: ${safeText(label)}`,
      `Remaining quantity: ${quantity}. ${thresholdText}.`,
      `${safeText(label)}: ${quantity} remaining (${thresholdText})`
    );
    list.appendChild(rowNode);
  });

  container.appendChild(list);
}

const TIMELINE_ACTION_CLASS = {
  Added: 'timeline-item--added',
  Adjusted: 'timeline-item--adjusted',
  Removed: 'timeline-item--removed',
  Other: 'timeline-item--other'
};

function renderTimeline(containerId, entries) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!entries.length) {
    renderChartEmptyState(containerId, 'timeline', 'No inventory changes recorded.');
    return;
  }

  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', `Inventory changes timeline. ${entries.length} recent changes.`);

  const list = document.createElement('ul');
  list.className = 'timeline';

  entries.forEach(entry => {
    const item = document.createElement('li');
    item.className = `timeline-item ${TIMELINE_ACTION_CLASS[entry.action] || TIMELINE_ACTION_CLASS.Other}`;

    const dot = document.createElement('span');
    dot.className = 'timeline-dot';
    dot.setAttribute('aria-hidden', 'true');

    const body = document.createElement('div');
    body.className = 'timeline-body';

    const title = document.createElement('div');
    title.className = 'timeline-title';
    const action = document.createElement('span');
    action.className = 'timeline-action';
    action.textContent = entry.action;
    title.append(action, ` ${safeText(entry.label)} (${formatInteger(entry.quantity)})`);

    const meta = document.createElement('div');
    meta.className = 'timeline-meta';
    const dateText = `${entry.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · ${entry.date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    meta.textContent = `${dateText} · ${safeText(entry.admin)}`;

    body.append(title, meta);
    item.append(dot, body);
    bindChartInteraction(
      item,
      `Inventory change: ${entry.action}`,
      `${safeText(entry.label)} ${entry.action.toLowerCase()} ${formatInteger(entry.quantity)} unit(s) by ${safeText(entry.admin)} on ${dateText}.`,
      `${entry.action}: ${safeText(entry.label)} (${formatInteger(entry.quantity)})`
    );
    list.appendChild(item);
  });

  container.appendChild(list);
}

function renderForecastChart(containerId, series) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!series.length || !series.some(point => !point.forecast)) {
    renderEmptyChart(containerId);
    return;
  }

  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', 'Upcoming demand forecast chart. Historical requests with a four week projected trend.');

  const width = 520;
  const height = 230;
  const padding = { top: 18, right: 18, bottom: 38, left: 42 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const allValues = series.reduce((values, point) => {
    values.push(point.value, point.upper || point.value);
    return values;
  }, []);
  const max = evenAxisMax(allValues);
  const svgNs = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'line-chart-svg');

  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (plotHeight / 4) * i;
    const line = document.createElementNS(svgNs, 'line');
    line.setAttribute('x1', String(padding.left));
    line.setAttribute('x2', String(width - padding.right));
    line.setAttribute('y1', String(y));
    line.setAttribute('y2', String(y));
    line.setAttribute('class', 'line-chart-grid');
    svg.appendChild(line);
  }

  [0, 2, 4].forEach(i => {
    const y = padding.top + (plotHeight / 4) * i;
    const text = document.createElementNS(svgNs, 'text');
    text.setAttribute('x', String(padding.left - 8));
    text.setAttribute('y', String(y + 4));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('class', 'line-chart-label');
    text.textContent = String(Math.round(max * (1 - i / 4)));
    svg.appendChild(text);
  });

  const coords = series.map((point, index) => ({
    x: padding.left + (plotWidth * index) / Math.max(series.length - 1, 1),
    y: padding.top + plotHeight - ((point.value / max) * plotHeight),
    ...point
  }));

  const forecastCoords = coords.filter(point => point.forecast);
  const lastPastIndex = coords.findIndex(point => point.forecast) - 1;
  const solidCoords = lastPastIndex >= 0 ? coords.slice(0, lastPastIndex + 1) : coords;

  if (forecastCoords.length > 1) {
    const upperPath = forecastCoords.map((point, index) => {
      const upperY = padding.top + plotHeight - ((point.upper / max) * plotHeight);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${upperY}`;
    }).join(' ');
    const lowerReversed = [...forecastCoords].reverse().map(point => {
      const lowerY = padding.top + plotHeight - ((point.lower / max) * plotHeight);
      return `L ${point.x} ${lowerY}`;
    }).join(' ');
    const band = document.createElementNS(svgNs, 'path');
    band.setAttribute('d', `${upperPath} ${lowerReversed} Z`);
    band.setAttribute('class', 'forecast-band');
    svg.appendChild(band);
  }

  const solidPath = buildSmoothPath(solidCoords);
  const pastLine = document.createElementNS(svgNs, 'path');
  pastLine.setAttribute('d', solidPath);
  pastLine.setAttribute('class', 'line-chart-path');
  pastLine.setAttribute('stroke', '#2563eb');
  svg.appendChild(pastLine);

  if (forecastCoords.length > 1) {
    const segment = [solidCoords[solidCoords.length - 1], ...forecastCoords];
    const forecastLine = document.createElementNS(svgNs, 'path');
    forecastLine.setAttribute('d', buildSmoothPath(segment));
    forecastLine.setAttribute('class', 'forecast-path');
    forecastLine.setAttribute('stroke', '#f59e0b');
    svg.appendChild(forecastLine);
  }

  coords.forEach(point => {
    const hitCircle = document.createElementNS(svgNs, 'circle');
    hitCircle.setAttribute('cx', String(point.x));
    hitCircle.setAttribute('cy', String(point.y));
    hitCircle.setAttribute('r', '10');
    hitCircle.setAttribute('fill', '#ffffff');
    hitCircle.setAttribute('opacity', '0.001');
    const tooltipText = point.forecast
      ? `Projected: ${point.value} units (range ${point.lower}–${point.upper})`
      : `${point.label}: ${point.value} units`;
    bindChartInteraction(hitCircle, 'Upcoming Demand', `${point.label}: ${tooltipText}.`, tooltipText);
    svg.appendChild(hitCircle);

    const circle = document.createElementNS(svgNs, 'circle');
    circle.setAttribute('cx', String(point.x));
    circle.setAttribute('cy', String(point.y));
    circle.setAttribute('r', '5');
    if (point.forecast) {
      circle.setAttribute('class', 'forecast-point');
      circle.setAttribute('fill', '#f59e0b');
    } else {
      circle.setAttribute('class', 'line-chart-point');
      circle.setAttribute('fill', '#2563eb');
    }
    svg.appendChild(circle);
  });

  series.forEach((point, index) => {
    const text = document.createElementNS(svgNs, 'text');
    const x = padding.left + (plotWidth * index) / Math.max(series.length - 1, 1);
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(height - 10));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'line-chart-label');
    text.textContent = point.label;
    svg.appendChild(text);
  });

  container.appendChild(svg);
}

function renderKpiCards(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<p class="chart-empty">No summary data available.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'kpi-grid';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'kpi-card';

    const icon = document.createElement('span');
    icon.className = `kpi-icon kpi-icon--${item.color || 'blue'}`;
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${KPI_ICONS[item.iconKey] || KPI_ICONS.box}</svg>`;

    const body = document.createElement('div');
    body.className = 'kpi-body';

    const label = document.createElement('div');
    label.className = 'kpi-label';
    label.textContent = item.label;

    const value = document.createElement('div');
    value.className = 'kpi-value';
    value.textContent = item.value;

    body.append(label, value);
    card.append(icon, body);

    if (item.statusColor) {
      const dot = document.createElement('span');
      dot.className = 'kpi-status-dot';
      dot.style.backgroundColor = item.statusColor;
      dot.setAttribute('aria-hidden', 'true');
      card.appendChild(dot);
    } else if (item.change) {
      const change = document.createElement('div');
      change.className = `kpi-change ${String(item.change).startsWith('-') ? 'kpi-change--down' : 'kpi-change--up'}`;
      change.textContent = item.change;
      card.appendChild(change);
    }

    bindChartInteraction(card, item.label, item.detail || item.value, `${item.label}: ${item.value}`);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

const chartAnimationSeen = new Set();
const lazyChartInitialized = new Set();
// Latest render requested for each chart still waiting to scroll into view.
const pendingLazyChartRenders = new Map();

function addChartAnimation(containerId) {
  const container = document.getElementById(containerId);
  if (!container || chartAnimationSeen.has(containerId)) return;
  chartAnimationSeen.add(containerId);
  const firstChild = container.firstElementChild;
  if (firstChild) firstChild.classList.add('chart-animate-in');
}

function renderChartWhenVisible(containerId, renderFn) {
  const container = document.getElementById(containerId);
  if (!container) return renderFn();
  if (lazyChartInitialized.has(containerId)) {
    renderFn();
    return;
  }
  if (!('IntersectionObserver' in window)) {
    lazyChartInitialized.add(containerId);
    renderFn();
    addChartAnimation(containerId);
    return;
  }
  // The dashboard renders once before its datasets arrive (the filter's first
  // apply) and again once they have. Each call used to add its own observer,
  // and the first one to fire, holding the empty pre-data render, won the
  // race and marked the chart initialized, so a chart below the fold kept
  // showing "No data" after the data had loaded. One observer per chart now
  // runs whichever render was requested last.
  const alreadyObserving = pendingLazyChartRenders.has(containerId);
  pendingLazyChartRenders.set(containerId, renderFn);
  if (alreadyObserving) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || lazyChartInitialized.has(containerId)) return;
      lazyChartInitialized.add(containerId);
      observer.disconnect();
      const latestRender = pendingLazyChartRenders.get(containerId);
      pendingLazyChartRenders.delete(containerId);
      if (latestRender) latestRender();
      addChartAnimation(containerId);
    });
  }, { rootMargin: '120px 0px' });
  observer.observe(container);
}

function analyticsCriteriaHash() {
  return [
    analyticsCriteria.preset,
    analyticsCriteria.customFrom,
    analyticsCriteria.customTo,
    analyticsCriteria.course,
    analyticsCriteria.yearLevel,
    analyticsCriteria.itemCategory,
    analyticsCriteria.inventoryStatus
  ].join('|');
}

function applyAnalyticsCriteriaFromFilter() {
  if (!analyticsFilter) return;
  const state = analyticsFilter.getState();
  analyticsCriteria.preset = state.preset || 'last30';
  analyticsCriteria.customFrom = state.customFrom || '';
  analyticsCriteria.customTo = state.customTo || '';
  analyticsCriteria.course = state.values.course || '';
  analyticsCriteria.yearLevel = state.values.yearLevel || '';
  analyticsCriteria.itemCategory = state.values.itemCategory || '';
  analyticsCriteria.inventoryStatus = state.values.inventoryStatus || '';
}

function getAnalyticsRangeLabel() {
  if (typeof SmartFilter !== 'undefined' && SmartFilter.DATE_RANGE_PRESETS) {
    const preset = SmartFilter.DATE_RANGE_PRESETS.find(item => item.key === analyticsCriteria.preset);
    if (preset) return preset.label;
  }
  return 'Last 30 Days';
}

function getAnalyticsSummaryLabel() {
  return ANALYTICS_PRESET_SUMMARY[analyticsCriteria.preset] || 'the selected range';
}

// The window chosen in the dashboard's Date Range control, resolved with the
// same helpers SmartFilter applies to every admin table. Presets used to be
// squeezed through a day/week/month/year mapping, so All Time and This Month
// both meant "the last 30 days"; now each preset means what its label says
// and a Custom range with only one end is open on the other.
//
// An open end is -Infinity / Infinity. Every consumer tests
// `timestamp < fromMs || timestamp >= toMs`, which handles both.
function getAnalyticsBounds() {
  const now = Date.now();
  if (typeof SmartFilter === 'undefined') {
    return { fromMs: now - MONTH_MS, toMs: now, now };
  }
  const resolved = analyticsCriteria.preset === 'custom'
    ? SmartFilter.getCustomRangeBounds(analyticsCriteria.customFrom, analyticsCriteria.customTo)
    : SmartFilter.getDateRangePresetBounds(analyticsCriteria.preset, new Date(now));
  return {
    fromMs: Number.isFinite(resolved?.fromMs) ? resolved.fromMs : -Infinity,
    toMs: Number.isFinite(resolved?.toMs) ? resolved.toMs : Infinity,
    now
  };
}

// The earlier window the selected one is compared against, or null when there
// is none (All Time, or a range open at either end). Calendar presets compare
// with the previous calendar month / year; the rest with the equally long
// window that ends where the selected one starts.
function getPreviousAnalyticsWindow(bounds) {
  if (!Number.isFinite(bounds.fromMs) || !Number.isFinite(bounds.toMs)) return null;
  const start = new Date(bounds.fromMs);
  if (analyticsCriteria.preset === 'thismonth' || analyticsCriteria.preset === 'lastmonth') {
    return { fromMs: new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime(), toMs: bounds.fromMs };
  }
  if (analyticsCriteria.preset === 'thisyear') {
    return { fromMs: new Date(start.getFullYear() - 1, 0, 1).getTime(), toMs: bounds.fromMs };
  }
  return { fromMs: bounds.fromMs - (bounds.toMs - bounds.fromMs), toMs: bounds.fromMs };
}

// The finite span the trend chart plots. An open start begins at the earliest
// recorded activity and an open end stops at now, since nothing is recorded in
// the future. Calendar windows that run past today (This Month, This Year) keep
// their full length so the axis reads as the whole month or year.
function getAnalyticsChartSpan(bounds, usageEntries, transactions) {
  let fromMs = bounds.fromMs;
  if (!Number.isFinite(fromMs)) {
    fromMs = Infinity;
    usageEntries.forEach(entry => {
      const timestamp = entry?.date instanceof Date ? entry.date.getTime() : Number.NaN;
      if (Number.isFinite(timestamp) && timestamp < fromMs) fromMs = timestamp;
    });
    transactions.forEach(transaction => {
      const timestamp = getTransactionDate(transaction)?.getTime();
      if (Number.isFinite(timestamp) && timestamp < fromMs) fromMs = timestamp;
    });
    if (!Number.isFinite(fromMs)) fromMs = bounds.now - MONTH_MS;
  }
  const toMs = Number.isFinite(bounds.toMs) ? bounds.toMs : bounds.now;
  return { fromMs, toMs: Math.max(toMs, fromMs + DAY_MS) };
}

function getUsageEntryYearLevel(entry) {
  const cohort = String(entry?.cohort || '');
  const separatorIndex = cohort.indexOf(' - ');
  return separatorIndex > 0 ? cohort.slice(separatorIndex + 3).trim() : '';
}

function getUsageEntryCategory(entry) {
  const itemKey = String(entry?.itemKey || '').trim();
  if (itemKey) {
    const match = allInventory.find(item => normalizeInventoryKey(item?.itemName) === itemKey);
    if (match && safeText(match?.category)) return safeText(match.category);
  }
  return safeText(entry?.category, '');
}

function applyAnalyticsCriteriaToUsage(entries) {
  const course = String(analyticsCriteria.course || '').trim().toLowerCase();
  const yearLevel = String(analyticsCriteria.yearLevel || '').trim().toLowerCase();
  const itemCategory = String(analyticsCriteria.itemCategory || '').trim().toLowerCase();
  if (!course && !yearLevel && !itemCategory) return entries;
  return entries.filter(entry => {
    if (course && String(entry?.course || '').trim().toLowerCase() !== course) return false;
    if (yearLevel && String(getUsageEntryYearLevel(entry) || '').trim().toLowerCase() !== yearLevel) return false;
    if (itemCategory && String(getUsageEntryCategory(entry) || '').trim().toLowerCase() !== itemCategory) return false;
    return true;
  });
}

function getInventoryStatusLabel(item) {
  const quantity = Math.max(0, Number(item?.quantity) || 0);
  const reorderLevel = Math.max(0, Number(item?.reorderLevel) || 0);
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= reorderLevel) return 'Low Stock';
  return 'In Stock';
}

function applyAnalyticsStatusToInventory(items) {
  const status = String(analyticsCriteria.inventoryStatus || '').trim().toLowerCase();
  if (!status) return items;
  return items.filter(item => getInventoryStatusLabel(item).toLowerCase() === status);
}

function buildRequestStatusDistribution() {
  const bounds = getAnalyticsBounds();
  const course = String(analyticsCriteria.course || '').trim().toLowerCase();
  const yearLevel = String(analyticsCriteria.yearLevel || '').trim().toLowerCase();
  const counts = {};

  allRegistrations.forEach(registration => {
    if (course && String(registration?.course || '').trim().toLowerCase() !== course) return;
    if (yearLevel && String(registration?.yearLevel || registration?.userId?.yearLevel || '').trim().toLowerCase() !== yearLevel) return;
    const date = getRegistrationActivityDate(registration);
    if (!date) return;
    const timestamp = date.getTime();
    if (timestamp < bounds.fromMs || timestamp >= bounds.toMs) return;
    const status = String(registration?.status || '').trim().toLowerCase();
    if (!status) return;
    counts[status] = (counts[status] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => [status.charAt(0).toUpperCase() + status.slice(1), count]);
}

function buildCategoryRequestEntries(filteredUsageEntries) {
  return aggregateUsageEntries(filteredUsageEntries, entry => getUsageEntryCategory(entry), 8);
}

function buildPickupCompletionData() {
  const bounds = getAnalyticsBounds();
  const course = String(analyticsCriteria.course || '').trim().toLowerCase();
  const yearLevel = String(analyticsCriteria.yearLevel || '').trim().toLowerCase();

  const userByEmail = new Map();
  allUsers.forEach(user => {
    const email = String(user?.email || '').trim().toLowerCase();
    if (email) userByEmail.set(email, user);
  });

  const registrationByUser = new Map();
  allRegistrations.forEach(registration => {
    const userId = String(registration?.userId?._id || registration?.userId || '').trim();
    if (userId) registrationByUser.set(userId, registration);
  });

  const counts = {};
  let total = 0;

  allPickupConfirmations.forEach(pickup => {
    const date = getFirstValidDate(pickup?.pickupDate, pickup?.date, pickup);
    if (!date) return;
    const timestamp = date.getTime();
    if (timestamp < bounds.fromMs || timestamp >= bounds.toMs) return;

    if (course || yearLevel) {
      const user = userByEmail.get(String(pickup?.studentEmail || '').trim().toLowerCase());
      const registration = user ? registrationByUser.get(String(user?._id || user?.id || '').trim()) : null;
      const regCourse = String(registration?.course || '').trim().toLowerCase();
      const regYearLevel = String(registration?.yearLevel || registration?.userId?.yearLevel || '').trim().toLowerCase();
      if (course && regCourse !== course) return;
      if (yearLevel && regYearLevel !== yearLevel) return;
    }

    const status = resolvePickupDisplayStatus(pickup);
    if (!status || status === 'N/A') return;
    counts[status] = (counts[status] || 0) + 1;
    total += 1;
  });

  const completionRate = total > 0 ? Math.round(((counts.Completed || 0) / total) * 100) : 0;
  return { counts, total, completionRate };
}

function getChartData() {
  const cacheKey = analyticsCriteriaHash();
  if (chartCache[cacheKey]) return chartCache[cacheKey];

  const usageEntries = getInventoryUsageEntries();
  const inventoryTransactions = getInventoryTransactions();
  const bounds = getAnalyticsBounds();
  const { now } = bounds;
  const chartSpan = getAnalyticsChartSpan(bounds, usageEntries, inventoryTransactions);
  const buckets = buildAnalyticsBuckets(chartSpan.fromMs, chartSpan.toMs);
  const labels = buckets.map(bucket => bucket.label);
  // Course, year level and item category narrow every usage figure. The date
  // window only narrows the figures that describe the selected period: the
  // previous-period comparison, the forecast and the slow-moving count each
  // look at their own window, so they read from the criteria-only set. The
  // comparison used to read from the already windowed set, where the previous
  // period is always empty, so it reported +100% whenever anything was issued.
  const criteriaUsageEntries = applyAnalyticsCriteriaToUsage(usageEntries);
  const filteredUsageEntries = criteriaUsageEntries.filter(entry => {
    const timestamp = entry?.date instanceof Date ? entry.date.getTime() : Number.NaN;
    return Number.isFinite(timestamp) && timestamp >= bounds.fromMs && timestamp < bounds.toMs;
  });
  const filteredInventoryTransactions = inventoryTransactions.filter(transaction => {
    const date = getTransactionDate(transaction);
    if (!date) return false;
    const timestamp = date.getTime();
    return timestamp >= bounds.fromMs && timestamp < bounds.toMs;
  });

  const inventoryPool = applyAnalyticsStatusToInventory(allInventory);
  const totalStockUnits = inventoryPool.reduce((sum, item) => sum + Math.max(0, Number(item?.quantity) || 0), 0);
  const categoriesTracked = new Set(
    inventoryPool
      .map(item => safeText(item?.category, ''))
      .filter(Boolean)
  ).size;
  const usageSeries = buildUsageSeriesForBuckets(filteredUsageEntries, buckets);
  const adjustmentSeries = buildTransactionSeriesForBuckets(filteredInventoryTransactions, buckets);
  const unitsIssuedInWindow = sumUsageInWindow(filteredUsageEntries, bounds.fromMs, bounds.toMs);
  const previousWindow = getPreviousAnalyticsWindow(bounds);
  const unitsIssuedInPreviousWindow = previousWindow
    ? sumUsageInWindow(criteriaUsageEntries, previousWindow.fromMs, previousWindow.toMs)
    : null;
  const issuedChange = previousWindow ? formatPercentChange(unitsIssuedInWindow, unitsIssuedInPreviousWindow) : '';
  const previousPeriodLabel = previousWindow ? (ANALYTICS_PREVIOUS_PERIOD_LABEL[analyticsCriteria.preset] || 'the previous period') : '';
  // Days of the window that have already happened, for daily rates.
  const observedDays = Math.max(1, (Math.min(chartSpan.toMs, now) - chartSpan.fromMs) / DAY_MS);
  const projectedThirtyDayDemand = Math.round((unitsIssuedInWindow / observedDays) * 30);
  const lowStockItems = inventoryPool.filter(item => Number(item?.quantity) <= Number(item?.reorderLevel || 0));
  const criticalLowStockItems = inventoryPool.filter(item => Number(item?.quantity) === 0 || Number(item?.quantity) <= Math.max(1, Math.floor(Number(item?.reorderLevel || 0) / 2)));
  const outOfStockItems = inventoryPool.filter(item => Number(item?.quantity) === 0);
  const operationEntries = buildInventoryOperationEntries(filteredInventoryTransactions);
  const topOperation = [...operationEntries].sort((a, b) => b[1] - a[1])[0];
  const totalCohortsServed = new Set(filteredUsageEntries.map(entry => entry.cohort)).size;
  const topIssuedItems = aggregateUsageEntries(filteredUsageEntries, entry => entry.requestedLabel, 10);
  const cohortEntries = aggregateUsageEntries(filteredUsageEntries, entry => entry.cohort, 6);
  const inventoryHealthRows = buildInventoryHealthRows(10, inventoryPool);
  const planningForecastSeries = buildForecastSeries(criteriaUsageEntries, 4);
  const slowMovingItems = countSlowMovingItems(criteriaUsageEntries, Math.max(30, Math.round(observedDays)));
  // Coverage is expressed in weeks, so it is fed one weekly usage rate. The
  // buckets are no longer always about a week long.
  const stockCoverage = formatStockCoverage(totalStockUnits, [(unitsIssuedInWindow / observedDays) * 7]);
  const timelineEntries = buildTimelineEntries(filteredInventoryTransactions, 8);

  const data = {
    now,
    bounds,
    previousWindow,
    previousPeriodLabel,
    buckets,
    labels,
    usageEntries,
    inventoryTransactions,
    filteredUsageEntries,
    filteredInventoryTransactions,
    usageSeries,
    adjustmentSeries,
    unitsIssuedInWindow,
    unitsIssuedInPreviousWindow,
    issuedChange,
    projectedThirtyDayDemand,
    totalStockUnits,
    categoriesTracked,
    lowStockItems,
    criticalLowStockItems,
    outOfStockItems,
    operationEntries,
    topOperation,
    totalCohortsServed,
    topIssuedItems,
    cohortEntries,
    inventoryHealthRows,
    planningForecastSeries,
    slowMovingItems,
    stockCoverage,
    timelineEntries,
    cohortSeries: buildCohortSeries(filteredUsageEntries, buckets),
    removalsSeries: buildRemovalsSeries(filteredInventoryTransactions, buckets),
    netStockSeries: buildNetStockSeries(filteredInventoryTransactions, buckets),
    requestStatusEntries: buildRequestStatusDistribution(),
    categoryRequestEntries: buildCategoryRequestEntries(filteredUsageEntries),
    pickupCompletion: buildPickupCompletionData()
  };

  chartCache[cacheKey] = data;
  return data;
}

function loadAnalytics() {
  const cacheKey = analyticsCriteriaHash();
  if (lastChartRenderKey === cacheKey && lastChartRenderGeneration === chartGeneration) {
    return;
  }
  lastChartRenderKey = cacheKey;
  lastChartRenderGeneration = chartGeneration;
  const data = getChartData();
  const {
    labels,
    usageSeries,
    adjustmentSeries,
    unitsIssuedInWindow,
    issuedChange,
    projectedThirtyDayDemand,
    totalStockUnits,
    categoriesTracked,
    lowStockItems,
    criticalLowStockItems,
    outOfStockItems,
    topOperation,
    totalCohortsServed,
    topIssuedItems,
    cohortEntries,
    inventoryHealthRows,
    planningForecastSeries,
    timelineEntries,
    cohortSeries,
    removalsSeries,
    netStockSeries,
    requestStatusEntries,
    categoryRequestEntries,
    pickupCompletion
  } = data;

  const setText = (id, value) => {
    const node = document.getElementById(id);
    if (node) {
      node.textContent = value;
    }
    return node;
  };
  const hasAdvancedInventoryAnalytics =
    document.getElementById('totalStockUnits') &&
    document.getElementById('issuedTrendChart');

  if (!hasAdvancedInventoryAnalytics) {
    return;
  }

  setText('totalStockUnits', formatInteger(totalStockUnits));
  setText('totalStockUnitsHint', `${formatInteger(categoriesTracked)} inventory categories currently tracked`);
  setText('unitsIssuedLabel', `Units Distributed (${getAnalyticsRangeLabel()})`);
  setText('forecastedDemandLabel', 'Projected Demand (30 Days)');

  const unitsIssuedChangeNode = setText(
    'unitsIssuedChange',
    data.previousPeriodLabel
      ? `${issuedChange} compared with ${data.previousPeriodLabel}`
      : 'No earlier period to compare with'
  );
  setText('unitsIssued', formatInteger(unitsIssuedInWindow));
  if (unitsIssuedChangeNode) {
    unitsIssuedChangeNode.style.color = !data.previousPeriodLabel
      ? ''
      : issuedChange.startsWith('-') ? '#b91c1c' : '#0f766e';
  }

  setText('forecastedDemand', formatInteger(projectedThirtyDayDemand));
  setText('forecastedDemandHint', `Projected units for the next 30 days using ${getAnalyticsSummaryLabel()} activity`);

  setText('lowStockItems', formatInteger(lowStockItems.length));
  setText('lowStockItemsHint', `${formatInteger(criticalLowStockItems.length)} critical and ${formatInteger(outOfStockItems.length)} currently out of stock`);

  setText('inventoryAdjustments', formatInteger(data.filteredInventoryTransactions.length));
  setText(
    'inventoryAdjustmentsHint',
    topOperation && topOperation[1] > 0
      ? `Primary action recorded: ${topOperation[0]}`
      : `No inventory adjustments recorded in ${getAnalyticsSummaryLabel()}`
  );

  setText('cohortsServed', formatInteger(totalCohortsServed));
  setText('cohortsServedHint', `${formatInteger(totalCohortsServed)} cohorts with activity in ${getAnalyticsSummaryLabel()}`);

  renderLineChart('issuedTrendChart', usageSeries, labels, '#2563eb', 'Items Given Out', '#eff6ff');
  renderRankedBarChart('productComparisonChart', topIssuedItems, 'Requested Item', 10);
  renderStatusBarChart('inventoryHealthChart', inventoryHealthRows);
  renderDonutChart('cohortDistributionChart', cohortEntries.map(([label, value], index) => ({
    label,
    value,
    color: DONUT_PALETTE[index % DONUT_PALETTE.length]
  })), 'Course');
  renderKpiCards('analyticsKpis', buildKpiItems(data));
  renderChartWhenVisible('adminOperationsChart', () => renderTimeline('adminOperationsChart', timelineEntries));
  renderChartWhenVisible('planningForecastChart', () => renderForecastChart('planningForecastChart', planningForecastSeries));

  const pickupKpiNode = setText('pickupCompletionRateValue', pickupCompletion.total > 0 ? `${pickupCompletion.completionRate}%` : '—');
  if (pickupKpiNode && pickupCompletion.total > 0) {
    pickupKpiNode.style.color = '#0f766e';
  }

  renderChartWhenVisible('requestStatusChart', () => {
    try {
      renderDonutChart('requestStatusChart', requestStatusEntries.map(([label, value], index) => ({
        label,
        value,
        color: DONUT_PALETTE[index % DONUT_PALETTE.length]
      })), 'Request Status', 'Total Requests');
    } catch (error) {
      renderChartEmptyState('requestStatusChart', 'chart', 'Unable to load data');
    }
  });
  renderChartWhenVisible('categoryRequestsChart', () => {
    try {
      renderRankedBarChart('categoryRequestsChart', categoryRequestEntries, 'Category', 8);
    } catch (error) {
      renderChartEmptyState('categoryRequestsChart', 'chart', 'Unable to load data');
    }
  });
  renderChartWhenVisible('pickupCompletionChart', () => {
    try {
      // Completed is always listed, even at zero, so a run of failures is shown
      // against it instead of as one bar stretched across the whole card.
      renderVerticalBarChart(
        'pickupCompletionChart',
        pickupCompletion.total > 0 ? Object.entries({ Completed: 0, ...pickupCompletion.counts }) : [],
        'Pickup Status'
      );
    } catch (error) {
      renderChartEmptyState('pickupCompletionChart', 'chart', 'Unable to load data');
    }
  });

  renderSparkline('usageSparkline', usageSeries, '#2563eb');
  renderSparkline('adjustmentsSparkline', adjustmentSeries, '#0f766e');
  renderSparkline('totalStockUnitsSparkline', netStockSeries, '#1e3a8a');
  renderSparkline('forecastedDemandSparkline', planningForecastSeries.map(point => point.value), '#d97706');
  renderSparkline('lowStockItemsSparkline', removalsSeries, '#dc2626');
  renderSparkline('cohortsServedSparkline', cohortSeries, '#0891b2');

  addChartAnimation('issuedTrendChart');
  addChartAnimation('productComparisonChart');
  addChartAnimation('inventoryHealthChart');
  addChartAnimation('cohortDistributionChart');
}

function initAdminFilters() {
  if (typeof SmartFilter === 'undefined') return;

  const usersContainer = document.getElementById('usersFilterContainer');
  if (usersContainer) {
    usersFilter = SmartFilter.create(usersContainer, {
      moduleId: 'users',
      search: {
        placeholder: 'Search users by name, email, or student number...',
        keys: ['name', 'fullname', 'firstName', 'lastName', 'email', 'studentNumber', 'status']
      },
      fields: [
        { key: 'status', label: 'Status', options: () => distinctFrom(allUsers, user => user?.status) },
        { key: 'dateRange', label: 'Date', presets: true, getDate: getUserActivityDate }
      ],
      getRows: () => allUsers,
      filter: (rows, state) => {
        const status = String(state.values.status || '').toLowerCase();
        return status ? rows.filter(user => String(user?.status || '').toLowerCase() === status) : rows;
      },
      onRender: rows => displayUsers(rows),
      sorts: [
        { key: 'name', label: 'Name (A-Z)', getValue: user => user?.name || user?.fullname },
        {
          key: 'lastLogin',
          label: 'Last login (newest first)',
          compare: (a, b) => (getFirstValidDate(b?.lastLoginAt, b?.createdAt)?.getTime() || 0) - (getFirstValidDate(a?.lastLoginAt, a?.createdAt)?.getTime() || 0)
        }
      ],
      export: {
        fileName: 'users',
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'studentNumber', label: 'Student Number' },
          { key: 'status', label: 'Status' },
          { key: 'lastLoginAt', label: 'Last Login' }
        ]
      }
    });
  }

  const registrationsContainer = document.getElementById('registrationsFilterContainer');
  if (registrationsContainer) {
    registrationsFilter = SmartFilter.create(registrationsContainer, {
      moduleId: 'registrations',
      search: {
        placeholder: 'Search registrations by name, email, course, module, books, or uniform...',
        keys: [
          'userId.name', 'userId.fullname', 'userId.firstName', 'userId.lastName',
          'userId.email', 'userId.studentNumber', 'fullname', 'course', 'yearLevel',
          'studentType', 'module', 'uniformType', 'books', 'userId.status'
        ]
      },
      fields: [
        {
          key: 'status',
          label: 'Status',
          options: [
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' }
          ]
        },
        { key: 'course', label: 'Course', options: () => distinctFrom(allRegistrations, reg => reg?.course) },
        { key: 'yearLevel', label: 'Year Level', options: () => distinctFrom(allRegistrations, reg => reg?.yearLevel || reg?.userId?.yearLevel) },
        { key: 'studentType', label: 'Student Type', options: ['Regular', 'Irregular'] },
        { key: 'dateRange', label: 'Date', presets: true, getDate: getRegistrationActivityDate }
      ],
      getRows: () => allRegistrations,
      filter: (rows, state) => {
        const status = String(state.values.status || '').trim().toLowerCase();
        const course = String(state.values.course || '').trim().toLowerCase();
        const yearLevel = String(state.values.yearLevel || '').trim().toLowerCase();
        const studentType = String(state.values.studentType || '').trim().toLowerCase();
        return rows.filter(reg => {
          if (status && normalizeRegistrationStatusForDisplay(reg?.userId?.status) !== status) return false;
          if (course && String(reg?.course || '').trim().toLowerCase() !== course) return false;
          if (yearLevel && String(reg?.yearLevel || reg?.userId?.yearLevel || '').trim().toLowerCase() !== yearLevel) return false;
          if (studentType && String(reg?.studentType || reg?.userId?.studentType || '').trim().toLowerCase() !== studentType) return false;
          return true;
        });
      },
      onRender: renderRegistrationsWithFilter,
      sorts: [
        { key: 'name', label: 'Student (A-Z)', getValue: reg => reg?.userId?.name || reg?.fullname },
        {
          key: 'date',
          label: 'Last updated (newest first)',
          compare: (a, b) => (getFirstValidDate(b?.updatedAt, b?.createdAt)?.getTime() || 0) - (getFirstValidDate(a?.updatedAt, a?.createdAt)?.getTime() || 0)
        }
      ],
      export: {
        fileName: 'registrations',
        columns: [
          { key: 'studentId', label: 'Student ID', getValue: reg => reg?.userId?.studentNumber },
          { key: 'studentName', label: 'Student Name', getValue: reg => reg?.userId?.name || reg?.fullname },
          { key: 'course', label: 'Course', getValue: reg => reg?.course },
          { key: 'yearLevel', label: 'Year Level', getValue: reg => reg?.yearLevel || reg?.userId?.yearLevel },
          { key: 'status', label: 'Status', getValue: reg => reg?.userId?.status },
          { key: 'date', label: 'Date', getValue: reg => reg?.updatedAt || reg?.createdAt }
        ]
      }
    });
  }

  const transactionsContainer = document.getElementById('transactionsFilterContainer');
  if (transactionsContainer) {
    transactionsFilter = SmartFilter.create(transactionsContainer, {
      moduleId: 'transactions',
      search: {
        placeholder: 'Search request history by user, status, or details...',
        keys: ['targetUserName', 'targetUserEmail', 'action', 'details']
      },
      fields: [
        {
          key: 'type',
          label: 'Type',
          options: [
            { value: 'registration', label: 'Registration' },
            { value: 'pickup', label: 'Pickup' }
          ]
        },
        {
          key: 'status',
          label: 'Status',
          options: () => distinctFrom(allTransactions.filter(isUserRequestTransaction), getUserRequestStatusLabel)
        },
        { key: 'dateRange', label: 'Date', presets: true, getDate: getTransactionDate }
      ],
      getRows: () => allTransactions.filter(isUserRequestTransaction),
      filter: (rows, state) => {
        const type = String(state.values.type || '').toLowerCase();
        const status = String(state.values.status || '').toLowerCase();
        return rows.filter(tx => {
          const action = String(tx?.action || '').toLowerCase();
          if (type && !action.startsWith(type)) return false;
          if (status && String(getUserRequestStatusLabel(tx) || '').toLowerCase() !== status) return false;
          return true;
        });
      },
      onRender: rows => displayTransactions(rows),
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
        { key: 'user', label: 'Student (A-Z)', getValue: getTransactionUserLabel }
      ],
      export: {
        fileName: 'transactions',
        columns: [
          { key: 'createdAt', label: 'Date' },
          { key: 'student', label: 'Student', getValue: getTransactionUserLabel },
          { key: 'status', label: 'Status', getValue: getUserRequestStatusLabel },
          { key: 'details', label: 'Details', getValue: tx => getUserRequestDetailText(tx) }
        ]
      }
    });
  }

  const pickupContainer = document.getElementById('pickupConfirmationsFilterContainer');
  if (pickupContainer) {
    pickupFilter = SmartFilter.create(pickupContainer, {
      moduleId: 'pickupconfirmations',
      search: {
        placeholder: 'Search pickup confirmations by student name or email...',
        keys: ['studentName', 'studentEmail', 'module']
      },
      fields: [
        { key: 'status', label: 'Status', options: () => distinctFrom(allPickupConfirmations, pickupStatusOf) },
        { key: 'dateRange', label: 'Date', presets: true, getDate: getPickupConfirmationDate }
      ],
      getRows: () => allPickupConfirmations,
      filter: (rows, state) => {
        const status = String(state.values.status || '').toLowerCase();
        return status ? rows.filter(item => String(pickupStatusOf(item) || '').toLowerCase() === status) : rows;
      },
      onRender: rows => renderPickupConfirmationsTable(rows),
      sorts: [
        {
          key: 'dateDesc',
          label: 'Date (newest first)',
          compare: (a, b) => (getFirstValidDate(b?.pickupDate, b?.createdAt)?.getTime() || 0) - (getFirstValidDate(a?.pickupDate, a?.createdAt)?.getTime() || 0)
        },
        { key: 'student', label: 'Student (A-Z)', getValue: item => item?.studentName }
      ],
      export: {
        fileName: 'pickup-confirmations',
        columns: [
          { key: 'pickupDate', label: 'Date' },
          { key: 'student', label: 'Student', getValue: item => item?.studentName },
          { key: 'module', label: 'Modules' },
          { key: 'status', label: 'Status', getValue: pickupStatusOf },
          { key: 'confirmation', label: 'Confirmation', getValue: item => resolvePickupDisplayConfirmation({ status: item?.status, date: item?.pickupDate, rescheduleConfirmationStatus: item?.confirmationStatus }) }
        ]
      }
    });
  }

  const adminAccountsContainer = document.getElementById('adminAccountsFilterContainer');
  if (adminAccountsContainer) {
    adminAccountsFilter = SmartFilter.create(adminAccountsContainer, {
      moduleId: 'admin-accounts',
      search: {
        placeholder: 'Search admin accounts by name or email...',
        keys: ['name', 'email']
      },
      fields: [
        {
          key: 'role',
          label: 'Role',
          options: () => distinctFrom(allAdminAccounts, account => (account?.isSuperAdmin ? 'Super Admin' : 'Admin'))
        },
        { key: 'dateRange', label: 'Date', presets: true, getDate: getAdminAccountActivityDate }
      ],
      getRows: () => allAdminAccounts,
      filter: (rows, state) => {
        const role = String(state.values.role || '').toLowerCase();
        return role
          ? rows.filter(account => String(account?.isSuperAdmin ? 'Super Admin' : 'Admin').toLowerCase() === role)
          : rows;
      },
      onRender: rows => renderAdminAccounts(rows),
      sorts: [
        { key: 'name', label: 'Name (A-Z)', getValue: account => account?.name },
        {
          key: 'lastLogin',
          label: 'Last login (newest first)',
          compare: (a, b) => (getFirstValidDate(b?.lastLoginAt, b?.createdAt)?.getTime() || 0) - (getFirstValidDate(a?.lastLoginAt, a?.createdAt)?.getTime() || 0)
        }
      ],
      export: {
        fileName: 'admin-accounts',
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', getValue: account => (account?.isSuperAdmin ? 'Super Admin' : 'Admin') },
          { key: 'createdAt', label: 'Date Created', getValue: account => account?.createdAt }
        ]
      }
    });
  }

  const announcementsContainer = document.getElementById('announcementsFilterContainer');
  if (announcementsContainer) {
    announcementsFilter = SmartFilter.create(announcementsContainer, {
      moduleId: 'announcements',
      search: {
        placeholder: 'Search announcements by title, category, content, author, or priority...',
        keys: ['title', 'category', 'content', 'createdByName', 'updatedByName', 'priority']
      },
      fields: [
        { key: 'category', label: 'Category', options: () => distinctFrom(allAnnouncements, item => item?.category, ['General', 'Enrollment', 'Events']) },
        { key: 'priority', label: 'Priority', options: ['Medium', 'Low', 'High', 'Critical'] },
        { key: 'dateRange', label: 'Date', presets: true, getDate: getAnnouncementActivityDate }
      ],
      getRows: () => allAnnouncements,
      filter: (rows, state) => {
        const category = String(state.values.category || '').toLowerCase();
        const priority = String(state.values.priority || '').toLowerCase();
        return rows.filter(item => {
          if (category && String(item?.category || '').toLowerCase() !== category) return false;
          if (priority && String(item?.priority || 'medium').toLowerCase() !== priority) return false;
          return true;
        });
      },
      onRender: rows => renderFilteredAnnouncements(rows),
      sorts: [
        { key: 'title', label: 'Title (A-Z)', getValue: item => item?.title },
        {
          key: 'date',
          label: 'Published (newest first)',
          compare: (a, b) => (getFirstValidDate(b?.publishedAt, b?.createdAt)?.getTime() || 0) - (getFirstValidDate(a?.publishedAt, a?.createdAt)?.getTime() || 0)
        }
      ],
      export: {
        fileName: 'announcements',
        columns: [
          { key: 'title', label: 'Title' },
          { key: 'category', label: 'Category' },
          { key: 'priority', label: 'Priority' },
          { key: 'createdByName', label: 'Created By' },
          { key: 'publishedAt', label: 'Date' }
        ]
      }
    });
  }
  const analyticsContainer = document.getElementById('analyticsFilterContainer');
  if (analyticsContainer) {
    analyticsFilter = SmartFilter.create(analyticsContainer, {
      moduleId: 'analytics',
      fields: [
        { key: 'itemCategory', label: 'Item Category', options: () => distinctFrom(allInventory, item => item?.category) },
        { key: 'course', label: 'Course', options: () => distinctFrom(allRegistrations, reg => reg?.course) },
        { key: 'yearLevel', label: 'Year Level', options: () => distinctFrom(allRegistrations, reg => reg?.yearLevel) },
        { key: 'inventoryStatus', label: 'Inventory Status', options: ['In Stock', 'Low Stock', 'Out of Stock'] },
        { key: 'dateRange', label: 'Date Range', presets: true, getDate: () => new Date() }
      ],
      initialPreset: 'last30',
      getRows: () => [],
      onRender: () => {
        applyAnalyticsCriteriaFromFilter();
        loadAnalytics();
      }
    });
  }
}

function renderRegistrationsWithFilter(rows) {
  const status = registrationsFilter ? (registrationsFilter.getState().values.status || 'all') : 'all';
  renderFilteredRegistrations(rows, status);
}

// Client-side navigation between sections of the admin shell. Applies the active
// sidebar state synchronously, before any request, then renders the target
// section and loads only that section's data.
async function navigateToView(viewKey) {
  // Only the shell document has sibling sections to switch between. On a
  // single-module document there is nothing to switch, so this returns before
  // touching history, sections, or data and leaves the module the user opened
  // exactly as it was; the real navigation is handled by the browser.
  if (!isSpaAdminShell()) return;
  const roleViewKey = normalizeViewForRole(viewKey);
  if (!roleViewKey) {
    renderAdminNotAuthorized(viewKey);
    return;
  }
  const nextPath = getAdminViewPath(roleViewKey);
  if (normalizeAdminPath(window.location.pathname) !== normalizeAdminPath(nextPath)) {
    window.history.pushState({}, '', nextPath);
  }
  // Active state first, so the highlight is correct in the same event turn as the
  // click rather than after the data request settles.
  applyActiveNavView(roleViewKey);
  setAdminView(roleViewKey);
  updateHeaderForView(roleViewKey);
  try {
    await refreshData();
  } catch (error) {
    console.error('Failed to load data for the selected section:', error);
  }
}

function setupEventListeners() {
  document.getElementById('logoutBtn')?.addEventListener('click', performLogout);
  document.getElementById('announcementForm')?.addEventListener('submit', submitAnnouncementForm);
  document.getElementById('cancelAnnouncementEditBtn')?.addEventListener('click', resetAnnouncementForm);
  document.getElementById('createAdminForm')?.addEventListener('submit', createAdminAccount);
  document.getElementById('changeAdminPasswordForm')?.addEventListener('submit', changeAdminPassword);
  document.getElementById('adminAccountsAccessGateForm')?.addEventListener('submit', submitAdminAccountsGate);
  initAdminAccountsGateToggle();

  // Delegated so it also covers sidebar links rendered by admin-nav.js after
  // this handler is installed.
  document.addEventListener('click', e => {
    const link = e.target.closest('.sidebar-shell a[data-view], .sidebar a[data-view]');
    if (!link) return;
    const view = link.getAttribute('data-view');
    if (!view) return;
    // Claim the click only when this document renders the target view as one of
    // its own sections. A single-module document has nothing to switch to, so
    // cancelling the link there would strand the current module on screen under
    // the target module's address and force a refresh to recover. Leaving the
    // default untouched lets the browser perform the real navigation, so this
    // check fails safe: any early return navigates rather than freezing a page.
    if (!documentRendersAdminView(view)) return;
    e.preventDefault();
    navigateToView(view);
  });

  document.getElementById('sidebarLogout')?.addEventListener('click', e => {
    e.preventDefault();
    performLogout();
  });

  document.getElementById('deleteUserBtn')?.addEventListener('click', deleteUser);

  const modal = document.getElementById('userDetailModal');
  document.querySelector('.close')?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });
}







