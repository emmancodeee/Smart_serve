// ---------------------------------------------------------------------------
// App shell: sidebar drawer, header profile menu and notifications.
//
// Shared by every signed-in page, admin and student. Loaded from <head>; the
// CSP (script-src 'self') blocks inline scripts, so this lives in a file.
//
// Markup contract:
//   #sidebar                   the sidebar (.app-sidebar)
//   #sidebarOverlay            dimmer behind the drawer below desktop
//   [data-sidebar-toggle]      the header menu button (shown below desktop)
//   .app-nav-link              sidebar links; the text sits in .app-nav-label
//   [data-profile-menu]        wraps [data-profile-trigger] + [data-profile-dropdown]
//
// Desktop (>= 1024px): the sidebar is an icon rail that expands while hovered;
// that is pure CSS (app-shell.css). Below 1024px there is no hover, so the
// menu button opens the full sidebar as an off-canvas drawer.
// ---------------------------------------------------------------------------
(function () {
  'use strict';

  const desktopQuery = window.matchMedia('(min-width: 1024px)');

  const getSidebar = () => document.getElementById('sidebar');
  const getOverlay = () => document.getElementById('sidebarOverlay');

  function isDrawerOpen() {
    return Boolean(getSidebar()?.classList.contains('is-open'));
  }

  function syncToggleState() {
    const open = isDrawerOpen();
    document.querySelectorAll('[data-sidebar-toggle]').forEach(btn => {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
  }

  function setDrawerOpen(open) {
    const sidebar = getSidebar();
    if (!sidebar) return;
    sidebar.classList.toggle('is-open', open);
    getOverlay()?.classList.toggle('is-visible', open);
    document.body.style.overflow = open ? 'hidden' : '';
    syncToggleState();
  }

  function toggleDrawer() {
    setDrawerOpen(!isDrawerOpen());
  }

  function initProfileMenus() {
    document.querySelectorAll('[data-profile-menu]').forEach(wrap => {
      const trigger = wrap.querySelector('[data-profile-trigger]');
      const menu = wrap.querySelector('[data-profile-dropdown]');
      if (!trigger || !menu) return;

      const setOpen = open => {
        menu.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
      };

      trigger.addEventListener('click', event => {
        event.stopPropagation();
        setOpen(menu.hidden);
        if (!menu.hidden) menu.querySelector('button, a')?.focus();
      });
      document.addEventListener('click', event => {
        if (!wrap.contains(event.target)) setOpen(false);
      });
      document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || menu.hidden) return;
        setOpen(false);
        trigger.focus();
      });
    });
  }

  // --- Notifications -------------------------------------------------------
  // The role scripts (admin-nav.js, student-nav.js) register a loader that
  // resolves to real items from existing endpoints:
  //   { key, title, meta, href, count?, tone?: 'warning'|'danger'|'info', date? }
  // Items with a count ("needs attention") are unread while the count differs
  // from the one last seen; dated items are unread when newer than the last
  // time the panel was opened. Seen state is kept per browser in localStorage.
  let notificationSource = null;
  let notificationItems = [];

  function readSeenState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(notificationSource.storageKey) || '{}');
      return {
        seenAt: Number(parsed.seenAt) || 0,
        counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {}
      };
    } catch (_) {
      return { seenAt: 0, counts: {} };
    }
  }

  function markAllSeen() {
    const counts = {};
    notificationItems.forEach(item => {
      if (typeof item.count === 'number') counts[item.key] = item.count;
    });
    try {
      localStorage.setItem(notificationSource.storageKey, JSON.stringify({ seenAt: Date.now(), counts }));
    } catch (_) {
      // Storage unavailable: the badge simply returns on the next page view.
    }
  }

  function isUnread(item, seen) {
    if (typeof item.count === 'number') return seen.counts[item.key] !== item.count;
    const time = item.date ? new Date(item.date).getTime() : 0;
    return time > seen.seenAt;
  }

  function updateBadge() {
    const seen = readSeenState();
    const unread = notificationItems.filter(item => isUnread(item, seen)).length;
    document.querySelectorAll('[data-notifications-badge]').forEach(badge => {
      badge.hidden = unread === 0;
    });
    document.querySelectorAll('[data-notifications-trigger]').forEach(trigger => {
      trigger.setAttribute('aria-label', unread ? `Notifications, ${unread} new` : 'Notifications');
    });
  }

  function formatWhen(date) {
    const time = new Date(date);
    if (Number.isNaN(time.getTime())) return '';
    return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderPanel(panel, state) {
    panel.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'app-notifications-head';
    head.textContent = notificationSource?.title || 'Notifications';
    panel.appendChild(head);

    if (state === 'loading' || state === 'error' || !notificationItems.length) {
      const note = document.createElement('p');
      note.className = 'app-notifications-empty';
      note.textContent = state === 'loading'
        ? 'Loading…'
        : state === 'error'
          ? 'Notifications could not be loaded. Please try again.'
          : (notificationSource?.emptyText || 'You are all caught up.');
      panel.appendChild(note);
      return;
    }

    const seen = readSeenState();
    const list = document.createElement('ul');
    list.className = 'app-notifications-list';
    notificationItems.forEach(item => {
      const li = document.createElement('li');
      const entry = document.createElement(item.href ? 'a' : 'div');
      entry.className = 'app-notification';
      if (item.href) entry.href = item.href;
      if (isUnread(item, seen)) entry.classList.add('is-unread');

      const chip = document.createElement('span');
      chip.className = `app-notification-count${item.tone === 'danger' ? ' is-danger' : item.tone === 'info' ? ' is-info' : ''}`;
      chip.textContent = typeof item.count === 'number' ? String(item.count) : '•';
      chip.setAttribute('aria-hidden', 'true');

      const text = document.createElement('span');
      text.className = 'app-notification-text';
      const title = document.createElement('span');
      title.className = 'app-notification-title';
      title.textContent = item.title;
      text.appendChild(title);
      const metaText = [item.meta, item.date ? formatWhen(item.date) : ''].filter(Boolean).join(' · ');
      if (metaText) {
        const meta = document.createElement('span');
        meta.className = 'app-notification-meta';
        meta.textContent = metaText;
        text.appendChild(meta);
      }

      entry.append(chip, text);
      li.appendChild(entry);
      list.appendChild(li);
    });
    panel.appendChild(list);
  }

  async function loadNotifications() {
    if (!notificationSource) return false;
    try {
      const items = await notificationSource.load();
      notificationItems = Array.isArray(items) ? items : [];
      updateBadge();
      return true;
    } catch (_) {
      return false;
    }
  }

  function initNotifications() {
    document.querySelectorAll('[data-notifications]').forEach(wrap => {
      const trigger = wrap.querySelector('[data-notifications-trigger]');
      const panel = wrap.querySelector('[data-notifications-panel]');
      if (!trigger || !panel) return;

      const setOpen = open => {
        panel.hidden = !open;
        trigger.setAttribute('aria-expanded', String(open));
      };

      trigger.addEventListener('click', async event => {
        event.stopPropagation();
        if (!panel.hidden) {
          setOpen(false);
          return;
        }
        setOpen(true);
        renderPanel(panel, notificationItems.length ? 'ready' : 'loading');
        const ok = await loadNotifications();
        if (panel.hidden) return;
        renderPanel(panel, ok ? 'ready' : 'error');
        // Opening the panel is what marks the current items as seen; the
        // unread highlight stays for this viewing.
        markAllSeen();
        updateBadge();
      });
      document.addEventListener('click', event => {
        if (!wrap.contains(event.target)) setOpen(false);
      });
      document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || panel.hidden) return;
        setOpen(false);
        trigger.focus();
      });
    });

    if (notificationSource) loadNotifications();
  }

  function registerNotifications(source) {
    if (!source || typeof source.load !== 'function') return;
    notificationSource = {
      title: source.title || 'Notifications',
      emptyText: source.emptyText,
      storageKey: `smartserve_notifications_seen:${source.scope || 'default'}`,
      load: source.load
    };
    if (initialized) loadNotifications();
  }

  let initialized = false;

  function init() {
    initialized = true;
    document.querySelectorAll('[data-sidebar-toggle]').forEach(btn => {
      btn.addEventListener('click', toggleDrawer);
    });
    getOverlay()?.addEventListener('click', () => setDrawerOpen(false));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && isDrawerOpen()) setDrawerOpen(false);
    });

    // In-page modules switch without a navigation, so the drawer has to close
    // itself when one of its links is chosen.
    document.addEventListener('click', event => {
      if (!desktopQuery.matches && event.target.closest('#sidebar a')) setDrawerOpen(false);
    });

    desktopQuery.addEventListener('change', () => setDrawerOpen(false));

    initProfileMenus();
    initNotifications();
    syncToggleState();
  }

  window.AppShell = { registerNotifications };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
