let allInventory = [];
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
let authProfilePromise = Promise.resolve(null);
let currentSort = { field: null, direction: 'asc' };
let currentPage = 1;
let perPage = 10;
let inventoryFilteredRows = [];
let inventoryFilter = null;
let inventoryFilterInit = false;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeCategoryClass(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '') || 'general';
}

function getStatusInfo(quantity, reorderLevel) {
  const qty = Math.max(0, Number(quantity) || 0);
  const rl = Math.max(0, Number(reorderLevel) || 0);
  if (qty === 0) return { dot: 'red', text: 'Out of Stock', label: 'out-of-stock' };
  if (qty <= rl) return { dot: 'orange', text: 'Low Stock', label: 'low-stock' };
  return { dot: 'green', text: 'In Stock', label: 'in-stock' };
}

function getCategoryClass(category) {
  const map = {
    'books': 'books',
    'modules': 'modules',
    'uniforms': 'uniforms',
    'electronics': 'electronics',
    'stationery': 'stationery'
  };
  return map[String(category || '').toLowerCase()] || 'other';
}

// ============== Toast Notification System ==============

function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-message">${escapeHtml(message)}</span>
    <button type="button" class="toast-close" aria-label="Dismiss">&times;</button>
  `;
  // Not onclick="": the CSP (script-src-attr 'none') blocks inline handlers.
  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function showToastNotification(message, type = 'success') {
  showToast(message, type);
}

function redirectToLogin() {
  window.location.replace('/');
}

function isCurrentSuperAdmin() {
  const profile = currentAdminProfile || readCachedAdminProfile();
  return Boolean(profile?.isSuperAdmin);
}

// This page intentionally does NOT load admin.js. Both files declare the same
// top-level bindings (allInventory, currentAdminProfile,
// ADMIN_PROFILE_CACHE_KEY), and a duplicate top-level let/const in classic
// scripts raises a SyntaxError that stops the second script from running at all.
//
// Per-role sidebar visibility is not duplicated here: admin-nav.js renders the
// list for the resolved role.

function applyHeaderGreeting() {
  const roleEl = document.getElementById('profileRole');
  if (roleEl && currentAdminProfile) roleEl.textContent = isCurrentSuperAdmin() ? 'Super Admin' : 'Administrator';
  const greetingEl = document.getElementById('headerGreeting');
  if (!greetingEl || !currentAdminProfile) return;
  greetingEl.textContent = isCurrentSuperAdmin() ? 'Welcome Super Admin' : 'Welcome Admin';
}

// Mirrors admin.js initAdminProfile(); without it this page kept the static
// "Admin" / "A" placeholder instead of the signed-in admin's name.
function applyHeaderProfile() {
  if (!currentAdminProfile) return;
  const name = currentAdminProfile.name || 'Admin';
  const avatarEl = document.getElementById('profileAvatar');
  const nameEl = document.getElementById('profileName');
  if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
  if (nameEl) nameEl.textContent = name;
}

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

function normalizePath(pathname) {
  const normalized = String(pathname || '').toLowerCase();
  if (!normalized || normalized === '/') return '/';
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

function normalizeHash(hash) {
  return String(hash || '').toLowerCase();
}

function updateSidebarActiveLink() {
  const links = document.querySelectorAll('.sidebar-shell a[href], .sidebar a[href]');
  if (!links.length) return;

  const currentPath = normalizePath(window.location.pathname);
  const currentHash = normalizeHash(window.location.hash);
  const currentKey = `${currentPath}${currentHash}`;

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href === '#') {
      link.classList.remove('active');
      return;
    }

    const url = new URL(href, window.location.origin);
    const linkKey = `${normalizePath(url.pathname)}${normalizeHash(url.hash)}`;
    link.classList.toggle('active', linkKey === currentKey);
  });
}

function startHeaderClock() {
  const clockNode = document.getElementById('headerClock');
  if (!clockNode) return;

  const renderClock = () => {
    const now = new Date();
    clockNode.textContent = now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  renderClock();
  setInterval(renderClock, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  startHeaderClock();
  authProfilePromise = checkAuth().then(account => {
    applyHeaderGreeting();
    applyHeaderProfile();
    return account;
  });
  updateSidebarActiveLink();
  window.addEventListener('hashchange', updateSidebarActiveLink);
  loadInventory();
  document.querySelectorAll('#paginationBar .pagination-limit').forEach(el => el.remove());
  setupEventListeners();
});

async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    redirectToLogin();
    return null;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      clearCachedAdminProfile();
      redirectToLogin();
      return null;
    }

    const account = await response.json().catch(() => ({}));
    if (!account?.isAdmin && account?.accountType !== 'admin') {
      redirectToLogin();
      return null;
    }

    currentAdminProfile = account && typeof account === 'object' ? account : null;
    if (currentAdminProfile) cacheAdminProfile(currentAdminProfile);
    return currentAdminProfile;
  } catch (_) {
    localStorage.removeItem('token');
    clearCachedAdminProfile();
    redirectToLogin();
    return null;
  }
}

function logout() {
  localStorage.removeItem('token');
  clearCachedAdminProfile();
  redirectToLogin();
}

// ============== Pagination State ==============

function getPaginatedItems() {
  const filtered = getFilteredItems();
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  
  if (currentPage > totalPages) currentPage = totalPages;
  
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageItems = filtered.slice(start, end);
  
  return { pageItems, totalItems, totalPages, start, end };
}

function renderPagination() {
  const { totalItems, totalPages } = getPaginatedItems();
  const paginationBar = document.getElementById('paginationBar');
  const paginationInfo = document.getElementById('paginationInfo');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const itemsShowing = document.getElementById('itemsShowing');

  if (totalItems <= perPage) {
    paginationBar.style.display = 'none';
  } else {
    paginationBar.style.display = 'flex';
  }

  paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);
  if (itemsShowing) {
    itemsShowing.textContent = `Showing ${totalItems > 0 ? start : 0}-${end} of ${totalItems} items`;
  }
}

function goToPage(page) {
  const { totalPages } = getPaginatedItems();
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  applyDisplay();
}

// ============== Sort State ==============

function sortBy(field) {
  if (currentSort.field === field) {
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.field = field;
    currentSort.direction = 'asc';
  }
  currentPage = 1;
  const key = sortKeyFor(field, currentSort.direction);
  if (inventoryFilter && key) {
    inventoryFilter.setSort(key);
  } else {
    updateSortArrows();
    applyDisplay();
  }
}

function updateSortArrows() {
  document.querySelectorAll('[data-sort]').forEach(th => {
    const arrow = th.querySelector('.sort-arrow');
    if (!arrow) return;
    const field = th.getAttribute('data-sort');
    if (field === currentSort.field) {
      arrow.className = `sort-arrow sort-${currentSort.direction}`;
    } else {
      arrow.className = 'sort-arrow';
    }
  });
}

// ============== Filter ==============

const SORT_KEY_FOR_FIELD = {
  itemName: { asc: 'nameAsc', desc: 'nameDesc' },
  category: { asc: 'categoryAsc', desc: 'categoryDesc' },
  quantity: { asc: 'qtyLow', desc: 'qtyHigh' },
  updatedAt: { asc: 'updatedAsc', desc: 'updatedDesc' }
};

const SORT_KEY_TO_FIELD = {
  nameAsc: 'itemName',
  nameDesc: 'itemName',
  categoryAsc: 'category',
  categoryDesc: 'category',
  qtyLow: 'quantity',
  qtyHigh: 'quantity',
  updatedAsc: 'updatedAt',
  updatedDesc: 'updatedAt'
};

const SORT_KEY_DIRECTION = {
  nameAsc: 'asc',
  nameDesc: 'desc',
  categoryAsc: 'asc',
  categoryDesc: 'desc',
  qtyLow: 'asc',
  qtyHigh: 'desc',
  updatedAsc: 'asc',
  updatedDesc: 'desc'
};

function sortKeyFor(field, direction) {
  return SORT_KEY_FOR_FIELD[field] ? SORT_KEY_FOR_FIELD[field][direction] : null;
}

function getItemDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function getFilteredItems() {
  return inventoryFilteredRows;
}

function initInventoryFilter() {
  if (inventoryFilterInit || typeof SmartFilter === 'undefined') return false;
  const container = document.getElementById('inventoryFilterContainer');
  if (!container) return false;
  inventoryFilter = SmartFilter.create(container, INVENTORY_FILTER_CONFIG);
  inventoryFilterInit = true;
  return true;
}

// Runs on every filter, search, sort or data change. The row set changed, so
// the table goes back to page 1; keeping the old page could show an empty page
// (or a page past the new last one) after narrowing the filters.
function renderInventoryRows(rows) {
  inventoryFilteredRows = rows;
  currentPage = 1;
  syncSortArrows();
  applyDisplay();
}

function syncSortArrows() {
  if (!inventoryFilter) return;
  const key = inventoryFilter.getState().sort;
  currentSort.field = SORT_KEY_TO_FIELD[key] || null;
  currentSort.direction = SORT_KEY_DIRECTION[key] || 'asc';
  updateSortArrows();
}

const INVENTORY_FILTER_CONFIG = {
  moduleId: 'inventory',
  search: {
    placeholder: 'Search items by name, category, or unit of measure...',
    keys: ['itemName', 'category', 'unitOfMeasure']
  },
  fields: [
    {
      key: 'category',
      label: 'Category',
      options: () => distinctFrom(allInventory, i => i?.category, ['Books', 'Uniforms', 'Modules', 'Electronics', 'Stationery', 'Other'])
    },
    { key: 'stockStatus', label: 'Stock Status', options: ['In Stock', 'Low Stock', 'Out of Stock'] },
    { key: 'dateAdded', label: 'Date Added', presets: true, getDate: i => getItemDate(i?.createdAt || i?.updatedAt) }
  ],
  getRows: () => allInventory,
  filter: (rows, state) => {
    const category = String(state.values.category || '').toLowerCase();
    const stockStatus = String(state.values.stockStatus || '').toLowerCase();
    return rows.filter(item => {
      if (category && String(item?.category || '').toLowerCase() !== category) return false;
      if (stockStatus) {
        const { label } = getStatusInfo(item.quantity, item.reorderLevel);
        if (label.replace(/-/g, ' ') !== stockStatus) return false;
      }
      return true;
    });
  },
  onRender: rows => renderInventoryRows(rows),
  sorts: [
    { key: 'nameAsc', label: 'Name (A–Z)', getValue: i => i?.itemName },
    { key: 'nameDesc', label: 'Name (Z–A)', compare: (a, b) => String(b?.itemName || '').localeCompare(String(a?.itemName || '')) },
    { key: 'qtyLow', label: 'Quantity (Low to High)', getValue: i => Number(i?.quantity) || 0 },
    { key: 'qtyHigh', label: 'Quantity (High to Low)', compare: (a, b) => (Number(b?.quantity) || 0) - (Number(a?.quantity) || 0) },
    { key: 'categoryAsc', label: 'Category (A–Z)', getValue: i => i?.category },
    { key: 'categoryDesc', label: 'Category (Z–A)', compare: (a, b) => String(b?.category || '').localeCompare(String(a?.category || '')) },
    {
      key: 'updatedAsc',
      label: 'Last Updated (oldest first)',
      compare: (a, b) => (getItemDate(a?.updatedAt)?.getTime() || 0) - (getItemDate(b?.updatedAt)?.getTime() || 0)
    },
    {
      key: 'updatedDesc',
      label: 'Last Updated (newest first)',
      compare: (a, b) => (getItemDate(b?.updatedAt)?.getTime() || 0) - (getItemDate(a?.updatedAt)?.getTime() || 0)
    }
  ],
  export: {
    fileName: 'inventory',
    columns: [
      { key: 'itemName', label: 'Item Name' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'unitOfMeasure', label: 'Unit of Measure', getValue: i => i?.unitOfMeasure || 'pcs' },
      { key: 'status', label: 'Status', getValue: i => getStatusInfo(i?.quantity, i?.reorderLevel).text },
      {
        key: 'updatedAt',
        label: 'Last Updated',
        getValue: i => (getItemDate(i?.updatedAt) ? getItemDate(i?.updatedAt).toLocaleDateString() : '—')
      }
    ]
  }
};

// ============== Load & Display ==============

// Guards against a duplicate request while one is already in flight. This page is
// its own module, so the guard lives here rather than in the shell's dataset
// registry.
let inventoryInFlight = null;

async function fetchInventory() {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/auth/inventory', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.status === 403) {
    showToast('You do not have admin access', 'error');
    redirectToLogin();
    return null;
  }

  if (!response.ok) throw new Error('Failed to load inventory');

  return response.json();
}

async function loadInventory() {
  if (inventoryInFlight) {
    try {
      await inventoryInFlight;
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
    return;
  }

  try {
    inventoryInFlight = fetchInventory();
    const items = await inventoryInFlight;
    if (items === null) return;

    allInventory = items;
    await authProfilePromise;
    const filterCreated = initInventoryFilter();
    currentPage = 1;
    if (inventoryFilter) {
      inventoryFilter.refreshOptions();
      if (!filterCreated) inventoryFilter.apply();
    } else {
      inventoryFilteredRows = allInventory;
      applyDisplay();
    }
  } catch (error) {
    console.error('Error loading inventory:', error);
    showToast('Failed to load inventory', 'error');
  } finally {
    inventoryInFlight = null;
  }
}

function applyDisplay() {
  const { pageItems, totalItems } = getPaginatedItems();
  displayInventory(pageItems);
  renderPagination();
}

function displayInventory(items) {
  const tbody = document.getElementById('inventoryBody');

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty-state">No inventory items yet</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => {
    // Same rule the Stock Status filter uses, so a quantity of 0 reads
    // "Out of Stock" here too instead of "Low Stock".
    const { label: statusClass, text: statusText } = getStatusInfo(item.quantity, item.reorderLevel);
    const isLowStock = statusClass !== 'in-stock';
    const safeItemName = escapeHtml(item.itemName);
    const safeCategory = escapeHtml(item.category);
    const catBadge = window.SmartFilter ? SmartFilter.categoryBadge(item.category) : null;
    const uom = escapeHtml(item.unitOfMeasure || 'pcs');

    return `
      <tr class="${isLowStock ? 'warning-row' : ''}">
        <td><strong>${safeItemName}</strong></td>
        <td>${catBadge ? `<span class="category-badge ${catBadge.className}">${escapeHtml(catBadge.label)}</span>` : `<span>${safeCategory}</span>`}</td>
        <td>${item.quantity} <span class="uom-label">${uom}</span></td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>${new Date(item.updatedAt).toLocaleDateString()}</td>
      </tr>
    `;
  }).join('');
}

// ============== Event Listeners ==============

function setupEventListeners() {
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  document.getElementById('prevPageBtn')?.addEventListener('click', () => goToPage(currentPage - 1));
  document.getElementById('nextPageBtn')?.addEventListener('click', () => goToPage(currentPage + 1));

  // Column sorting
  document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      sortBy(th.getAttribute('data-sort'));
    });
    th.style.cursor = 'pointer';
  });
}
