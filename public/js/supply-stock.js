// Wrapped in an IIFE so this file's top-level `let` declarations do not enter
// the global lexical environment. admin.js declares the same bindings
// (`allInventory`, `currentAdminProfile`) and is loaded on this page first, so
// without this wrapper the duplicate declaration raises a SyntaxError at parse
// time and none of this script would ever run.
(function () {

let currentAdminProfile = null;
let allInventory = [];
let allHistoryRows = [];
let historyFilter = null;
let historyFilterInit = false;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '—';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const pad = n => String(n).padStart(2, '0');
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getToken() {
  return localStorage.getItem('token');
}

function isCurrentSuperAdmin() {
  return Boolean(currentAdminProfile?.isSuperAdmin);
}

function redirectToLogin() {
  window.location.replace('/');
}

// ============== Toast Notification System ==============

// This page loads Bootstrap's CSS, whose `.toast:not(.show) { display: none }`
// hides the toast markup built below, so every success and error message on
// this page was invisible. The shared UI kit's toasts use their own classes.
function showToast(message, type = 'success') {
  if (window.UIKit) {
    window.UIKit.toast(message, type);
    return;
  }
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
  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============== Tab Switching ==============

function switchTab(tabName) {
  document.querySelectorAll('.ss-tab-btn').forEach(btn => {
    const active = btn.getAttribute('data-tab') === tabName;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  document.querySelectorAll('.ss-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });
}

// ============== Auth + Profile ==============

async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      redirectToLogin();
      return;
    }

    const account = await response.json().catch(() => ({}));
    if (!account?.isAdmin && account?.accountType !== 'admin') {
      redirectToLogin();
      return;
    }

    currentAdminProfile = account && typeof account === 'object' ? account : null;
    updateProfileUI();
  } catch (_) {
    localStorage.removeItem('token');
    redirectToLogin();
  }
}

function updateProfileUI() {
  if (!currentAdminProfile) return;

  const nameEl = document.getElementById('profileName');
  const avatarEl = document.getElementById('profileAvatar');
  const welcomeEl = document.querySelector('.admin-welcome');
  const matchedTempAdmin = currentAdminProfile.isMatchedTempAdmin;

  if (nameEl) {
    nameEl.textContent = currentAdminProfile.name || 'Admin';
  }
  if (avatarEl) {
    const initials = (currentAdminProfile.name || 'A').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    avatarEl.textContent = initials || 'A';
  }
  if (welcomeEl) {
    welcomeEl.textContent = `Welcome ${matchedTempAdmin ? 'Temporary Admin' : (currentAdminProfile.name || 'Admin')}`;
  }
}

function logout() {
  localStorage.removeItem('token');
  redirectToLogin();
}

// ============== Supply In ==============

async function handleSupplySubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  const payload = {
    itemName: document.getElementById('supplyItemName').value.trim(),
    category: document.getElementById('supplyCategory').value,
    quantity: parseInt(document.getElementById('supplyQuantity').value, 10),
    notes: document.getElementById('supplyNotes').value.trim()
  };

  await withBusy(submitBtn, 'Adding...', async () => {
    try {
      const response = await fetch('/api/auth/inventory/supply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add supply');
      }

      showToast(data.message || 'Supply added successfully.', 'success');
      form.reset();
      await Promise.all([loadInventoryItems(), loadHistory()]);
    } catch (error) {
      console.error('Error adding supply:', error);
      showToast(error.message || 'Failed to add supply', 'error');
    }
  });
}

// UIKit.withBusy ignores repeat clicks and restores the button afterwards.
// The fallback keeps the page usable if the UI kit failed to load.
async function withBusy(button, busyText, task) {
  if (window.UIKit) return window.UIKit.withBusy(button, task, { busyText });
  if (!button || button.disabled) return undefined;
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = busyText;
  try {
    return await task();
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

// ============== Stock Out ==============

function handleStockOutItemChange() {
  const select = document.getElementById('stockOutItem');
  const availabilityEl = document.getElementById('stockOutAvailability');
  const qtyInput = document.getElementById('stockOutQuantity');
  const selectedOption = select?.options?.[select.selectedIndex];

  if (!selectedOption || !selectedOption.value) {
    if (qtyInput) qtyInput.removeAttribute('max');
    if (availabilityEl) {
      availabilityEl.textContent = 'Select an item to view its current stock.';
      availabilityEl.style.color = '';
    }
    return;
  }

  const available = Number(selectedOption.dataset.qty) || 0;
  if (qtyInput) qtyInput.setAttribute('max', String(available));
  if (availabilityEl) {
    availabilityEl.textContent = `${selectedOption.textContent.split(' — ')[0]}: ${available} available`;
    availabilityEl.style.color = available === 0 ? 'var(--danger, #dc2626)' : '';
  }
}

// Guards against a duplicate request while one is already in flight. This page is
// reached from three places (initial load, stock-out, stock-in), so without this a
// rapid sequence of actions re-requests the same inventory list.
let inventoryItemsInFlight = null;
let historyInFlight = null;

async function fetchInventoryItems() {
  const response = await fetch('/api/auth/inventory', {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  if (!response.ok) throw new Error('Failed to load inventory');

  const data = await response.json();
  return Array.isArray(data) ? data : (data.items || data.inventory || []);
}

function showStockOutLoading(message = 'Loading items...') {
  const select = document.getElementById('stockOutItem');
  if (!select) return;
  select.disabled = true;
  select.innerHTML = `<option value="">${message}</option>`;
}

async function loadInventoryItems() {
  // The data region here is the item select, not a table, so its loading state
  // is the select itself.
  showStockOutLoading();

  if (inventoryItemsInFlight) {
    try {
      await inventoryItemsInFlight;
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
    return;
  }

  inventoryItemsInFlight = fetchInventoryItems();
  try {
    const items = await inventoryItemsInFlight;
    allInventory = items;

    const select = document.getElementById('stockOutItem');
    // A fresh placeholder every time: the first option at this point is the
    // "Loading items..." one painted by showStockOutLoading(), and reusing it
    // left that text as the select's placeholder after the items had loaded.
    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    // defaultSelected (the selected attribute) is what form.reset() returns
    // to; without it Clear selected the first real item instead.
    placeholder.defaultSelected = true;
    placeholder.selected = true;
    placeholder.textContent = 'Select item...';
    select.appendChild(placeholder);

    allInventory.forEach(item => {
      const option = document.createElement('option');
      option.value = item._id;
      option.textContent = `${item.itemName} (${item.category}) — ${item.quantity} ${item.unitOfMeasure || 'pcs'} available`;
      option.dataset.qty = item.quantity;
      select.appendChild(option);
    });

    if (allInventory.length === 0) {
      const option = document.createElement('option');
      option.value = '';
      option.disabled = true;
      option.textContent = 'No inventory items available';
      select.appendChild(option);
    }
    select.disabled = false;
    // The list was rebuilt with nothing selected, so the availability hint and
    // the quantity cap must not describe the previously selected item.
    handleStockOutItemChange();
  } catch (error) {
    // A select is not a table or block region, so it gets an option rather than
    // showError()'s markup.
    const select = document.getElementById('stockOutItem');
    if (select) {
      select.innerHTML = '<option value="">Failed to load inventory items</option>';
      select.disabled = true;
    }
    console.error('Error loading inventory:', error);
    showToast('Failed to load inventory items', 'error');
  } finally {
    inventoryItemsInFlight = null;
  }
}

async function handleStockOutSubmit(e) {
  e.preventDefault();

  const payload = {
    inventoryId: document.getElementById('stockOutItem').value,
    quantity: parseInt(document.getElementById('stockOutQuantity').value, 10),
    reason: document.getElementById('stockOutReason').value,
    notes: document.getElementById('stockOutNotes').value.trim()
  };

  if (!payload.inventoryId) {
    showToast('Please select an inventory item', 'error');
    return;
  }

  const selectedItem = allInventory.find(item => item._id === payload.inventoryId);
  const available = Number(selectedItem?.quantity) || 0;
  if (!Number.isFinite(payload.quantity) || payload.quantity < 1) {
    showToast('Quantity must be at least 1', 'error');
    return;
  }
  if (payload.quantity > available) {
    showToast(`Insufficient stock: only ${available} available`, 'error');
    return;
  }

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  // Stock out permanently lowers the item's quantity, so it is confirmed first.
  if (window.UIKit) {
    const itemLabel = selectedItem?.itemName || 'this item';
    const unit = selectedItem?.unitOfMeasure || 'pcs';
    const confirmed = await window.UIKit.confirm({
      title: 'Remove stock?',
      message: `${payload.quantity} ${unit} of ${itemLabel} will be removed from inventory (${payload.reason || 'no reason given'}). This cannot be undone.`,
      confirmText: 'Remove stock',
      tone: 'danger'
    });
    if (!confirmed) return;
  }

  await withBusy(submitBtn, 'Removing...', async () => {
    try {
      const response = await fetch('/api/auth/inventory/stock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove stock');
      }

      showToast(data.message || 'Stock removed successfully.', 'success');
      resetForm('stockOutForm');
      await Promise.all([loadInventoryItems(), loadHistory()]);
    } catch (error) {
      console.error('Error removing stock:', error);
      showToast(error.message || 'Failed to remove stock', 'error');
    }
  });
}

// ============== History ==============

async function loadHistory() {
     const tableBody = document.getElementById('historyTableBody');
     if (!tableBody) return;

     // Painted before either request is awaited, into this module's own table body.
     showLoading('historyTableBody', 'Loading history...');

     if (historyInFlight) {
       try {
         await historyInFlight;
       } catch (error) {
         console.error('Error loading history:', error);
       }
       return;
     }

     try {
       historyInFlight = (async () => {
         const [suppliesRes, stockOutsRes] = await Promise.all([
           fetch('/api/auth/inventory/supply', { headers: { Authorization: `Bearer ${getToken()}` } }),
           fetch('/api/auth/inventory/stock-out', { headers: { Authorization: `Bearer ${getToken()}` } })
         ]);

         if (!suppliesRes.ok || !stockOutsRes.ok) throw new Error('Failed to load history');

         const supplies = await suppliesRes.json();
         const stockOuts = await stockOutsRes.json();

         const supplyRows = (Array.isArray(supplies) ? supplies : []).map(s => ({
           type: 'supply',
           typeLabel: 'Supply In',
           itemName: s.itemName,
           category: s.category,
           quantity: s.quantity,
           reason: 'Supply In',
           handledBy: s.suppliedBy?.name || 'Admin',
           createdAt: s.createdAt,
           raw: s
         }));

         const stockOutRows = (Array.isArray(stockOuts) ? stockOuts : []).map(s => ({
           type: 'stockout',
           typeLabel: 'Stock Out',
           itemName: s.itemName,
           category: s.category,
           quantity: s.quantity,
           reason: s.reason,
           handledBy: s.removedBy?.name || 'Admin',
           createdAt: s.createdAt,
           raw: s
         }));

         allHistoryRows = [...supplyRows, ...stockOutRows]
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

         initHistoryFilter();
         if (historyFilter) {
           historyFilter.refreshOptions();
           historyFilter.apply();
         } else {
           renderHistoryTable(allHistoryRows);
         }
       })();

       await historyInFlight;
     } catch (error) {
       showError('historyTableBody', 'Failed to load history.');
       console.error('Error loading history:', error);
     } finally {
       historyInFlight = null;
     }
}


function renderHistoryTable(records) {
  const tableBody = document.getElementById('historyTableBody');
  if (!tableBody) return;

  if (records.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center empty-table-state table-empty-state">No supply or stock-out records found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = records.map(record => `
    <tr>
      <td><span class="dir-badge ${record.type}">${record.typeLabel}</span></td>
      <td class="student-name">${escapeHtml(record.itemName)}</td>
      <td><span class="reason-badge">${escapeHtml(record.category)}</span></td>
      <td class="text-center fw-bold">${record.type === 'supply' ? '+' : '−'}${escapeHtml(record.quantity)}</td>
      <td>${escapeHtml(record.reason)}</td>
      <td>${escapeHtml(record.handledBy)}</td>
      <td class="date-cell">${formatDate(record.createdAt)}</td>
    </tr>
  `).join('');
}

function initHistoryFilter() {
  if (historyFilterInit || typeof SmartFilter === 'undefined') return;
  const container = document.getElementById('historyFilterContainer');
  if (!container) return;
  historyFilter = SmartFilter.create(container, HISTORY_FILTER_CONFIG);
  historyFilterInit = true;
}

const HISTORY_FILTER_CONFIG = {
  moduleId: 'supply-stock-history',
  search: {
    placeholder: 'Search history by item, category, reason, or admin...',
    keys: ['itemName', 'category', 'reason', 'handledBy']
  },
  fields: [
    {
      key: 'type',
      label: 'Type',
      options: () => ['Supply In', 'Stock Out']
    },
    {
      key: 'category',
      label: 'Category',
      options: () => distinctFrom(allHistoryRows, r => r?.category, ['Books', 'Uniforms', 'Modules', 'Electronics', 'Stationery', 'Other'])
    },
    { key: 'dateRange', label: 'Date', presets: true, getDate: r => getFirstValidDate(r?.createdAt) }
  ],
  getRows: () => allHistoryRows,
  filter: (rows, state) => {
    const type = String(state.values.type || '').toLowerCase();
    const category = String(state.values.category || '').toLowerCase();
    return rows.filter(record => {
      if (type === 'supply in' && record.type !== 'supply') return false;
      if (type === 'stock out' && record.type !== 'stockout') return false;
      if (category && String(record?.category || '').toLowerCase() !== category) return false;
      return true;
    });
  },
  onRender: rows => renderHistoryTable(rows),
  sorts: [
    {
      key: 'dateAsc',
      label: 'Date (oldest first)',
      compare: (a, b) => new Date(a?.createdAt) - new Date(b?.createdAt)
    },
    { key: 'itemName', label: 'Item (A-Z)', getValue: r => r?.itemName },
    { key: 'handledBy', label: 'Admin (A-Z)', getValue: r => r?.handledBy },
    // A numeric compare: getValue results are compared as strings, and "-12"
    // sorted before "-5", which put this list in low-to-high order.
    { key: 'quantity', label: 'Quantity (high to low)', compare: (a, b) => (Number(b?.quantity) || 0) - (Number(a?.quantity) || 0) }
  ],
  export: {
    fileName: 'supply-stock-history',
    columns: [
      { key: 'createdAt', label: 'Date' },
      { key: 'typeLabel', label: 'Type' },
      { key: 'itemName', label: 'Item Name' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'reason', label: 'Reason' },
      { key: 'handledBy', label: 'Admin' }
    ]
  }
};

// ============== Helpers ==============

function resetForm(formId) {
  document.getElementById(formId).reset();
  // form.reset() does not fire "change", so the stock-out hint and quantity
  // cap would keep describing the item that was selected before.
  if (formId === 'stockOutForm') handleStockOutItemChange();
}

// ============== Initialization ==============

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('.ss-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  document.getElementById('supplyForm')?.addEventListener('submit', handleSupplySubmit);
  document.getElementById('stockOutForm')?.addEventListener('submit', handleStockOutSubmit);
  document.getElementById('stockOutItem')?.addEventListener('change', handleStockOutItemChange);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  // Wired here rather than with onclick="": the CSP blocks inline handlers, and
  // resetForm lives inside this IIFE so it was never reachable from markup.
  document.querySelectorAll('[data-reset-form]').forEach(btn => {
    btn.addEventListener('click', () => resetForm(btn.getAttribute('data-reset-form')));
  });

  await checkAuth();
  if (!currentAdminProfile) return;

  await Promise.all([loadInventoryItems(), loadHistory()]);
});

})();