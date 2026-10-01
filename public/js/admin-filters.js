/* ==========================================================================
   SmartFilter — shared admin filter engine (admin-filters.js)
   --------------------------------------------------------------------------
   One toolbar component + per-module config registry used by every admin
   surface: search, field selects (native or searchable combobox), universal
   date-range presets (incl. custom range), sort, Reset Filters, and CSV
   export. Pure client-side; no backend changes.

   Exposed globally:
     SmartFilter.create(container, config)       -> instance
     SmartFilter.getDateRangePresetBounds(preset, now?) -> {fromMs,toMs}|null
     SmartFilter.getCustomRangeBounds(from, to)  -> {fromMs|null,toMs|null}|null
     SmartFilter.legacyPresetKey(key)            -> preset key
     SmartFilter.exportRowsCsv(moduleId, rows, columns)
     SmartFilter.distinctFrom(records, getter, fallback?)
     SmartFilter.buildCategoryFilterOptions(rawValues, fallbackValues?) -> [{value,label}]
     SmartFilter.ITEM_CATEGORY_LABELS            -> raw lowercased -> canonical label
     SmartFilter.DATE_RANGE_PRESETS
     SmartFilter.SmartCombobox({...})            -> combobox control
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------------ */

function sfDebounce(func, wait) {
  if (typeof window.debounce === 'function') {
    return window.debounce(func, wait);
  }
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function sfEl(tag, attrs, children) {
  const node = document.createElement(tag);
  attrs = attrs || {};
  if (attrs.className) { node.className = attrs.className; delete attrs.className; }
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'html') { node.innerHTML = value; return; }
    if (key.slice(0, 2) === 'on' && typeof value === 'function') {
      node.addEventListener(key.slice(2), value);
      return;
    }
    node.setAttribute(key, value);
  });
  (children || []).forEach(child => {
    if (child === null || child === undefined) return;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return node;
}

function sfFirstValidDate(...candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate instanceof Date) {
      if (!Number.isNaN(candidate.getTime())) return candidate;
      continue;
    }
    if (typeof candidate === 'object') {
      if (typeof candidate.toDate === 'function') {
        const converted = candidate.toDate();
        if (!Number.isNaN(converted.getTime())) return converted;
        continue;
      }
    }
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function sfGetRecordDate(record, getDate) {
  if (typeof getDate === 'function') return sfFirstValidDate(getDate(record));
  return sfFirstValidDate(record);
}

/* --------------------------------------------------------------------------
 * Date-range preset engine (D3)
 * ------------------------------------------------------------------------ */

const DATE_RANGE_PRESETS = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'last30', label: 'Last 30 Days' },
  { key: 'thismonth', label: 'This Month' },
  { key: 'lastmonth', label: 'Last Month' },
  { key: 'thisyear', label: 'This Year' },
  { key: 'custom', label: 'Custom Range' }
];

const LEGACY_PRESET_MAP = {
  day: 'today',
  week: 'last7',
  month: 'last30',
  year: 'thisyear',
  all: 'all'
};

function legacyPresetKey(key) {
  const normalized = String(key || 'all').trim().toLowerCase();
  return LEGACY_PRESET_MAP[normalized] || normalized;
}

function sfStartOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sfAddDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getDateRangePresetBounds(preset, now = new Date()) {
  const ref = now instanceof Date ? now : new Date(now);
  switch (legacyPresetKey(preset)) {
    case 'all':
      return null;
    case 'today': {
      const start = sfStartOfDay(ref);
      return { fromMs: start.getTime(), toMs: sfAddDays(start, 1).getTime() };
    }
    case 'yesterday': {
      const start = sfAddDays(sfStartOfDay(ref), -1);
      return { fromMs: start.getTime(), toMs: sfAddDays(start, 1).getTime() };
    }
    case 'last7':
      return { fromMs: sfAddDays(ref, -7).getTime(), toMs: ref.getTime() };
    case 'last30':
      return { fromMs: sfAddDays(ref, -30).getTime(), toMs: ref.getTime() };
    case 'thismonth': {
      const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
      const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
      return { fromMs: start.getTime(), toMs: end.getTime() };
    }
    case 'lastmonth': {
      const start = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
      const end = new Date(ref.getFullYear(), ref.getMonth(), 1);
      return { fromMs: start.getTime(), toMs: end.getTime() };
    }
    case 'thisyear': {
      const start = new Date(ref.getFullYear(), 0, 1);
      const end = new Date(ref.getFullYear() + 1, 0, 1);
      return { fromMs: start.getTime(), toMs: end.getTime() };
    }
    default:
      return null;
  }
}

function getCustomRangeBounds(fromValue, toValue) {
  if (!fromValue && !toValue) return null;
  let fromMs = null;
  let toMs = null;
  if (fromValue) {
    const from = sfFirstValidDate(fromValue);
    if (from) fromMs = sfStartOfDay(from).getTime();
  }
  if (toValue) {
    const to = sfFirstValidDate(toValue);
    if (to) toMs = sfAddDays(sfStartOfDay(to), 1).getTime();
  }
  if (fromMs === null && toMs === null) return null;
  return { fromMs, toMs };
}

/* --------------------------------------------------------------------------
 * Live-data option helper (task 1.6)
 * ------------------------------------------------------------------------ */

function distinctFrom(records, getter, fallback = []) {
  const source = Array.isArray(records) && records.length ? records : null;
  if (!source) return fallback.slice();
  const seen = new Set();
  const values = [];
  for (const record of source) {
    const raw = typeof getter === 'function' ? getter(record) : record ? record[getter] : undefined;
    if (raw === undefined || raw === null || raw === '') continue;
    const label = String(raw).trim();
    if (!label || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    values.push(label);
  }
  return values.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

/* --------------------------------------------------------------------------
 * Canonical item-category option helper
 * --------------------------------------------------------------------------
 * Student request data stores item categories lowercase/singular
 * (module, uniform, books) while inventory uses title-case/plural
 * (Modules, Uniforms, Books). This helper canonicalizes the DISPLAYED
 * labels without changing the underlying option values, so filters keep
 * matching raw stored values while the UI shows one canonical spelling
 * per category.
 * ------------------------------------------------------------------------ */

const ITEM_CATEGORY_LABELS = {
  module: 'Modules',
  modules: 'Modules',
  uniform: 'Uniforms',
  uniforms: 'Uniforms',
  book: 'Books',
  books: 'Books',
  general: 'General',
  service: 'Service'
};

function buildCategoryFilterOptions(rawValues, fallbackValues = []) {
  const source = typeof rawValues === 'function' ? rawValues() : rawValues;
  const usable = (Array.isArray(source) && source.length) ? source : (fallbackValues || []);
  if (!usable.length) return [];
  const counts = new Map();
  for (const item of usable) {
    if (item === undefined || item === null) continue;
    const raw = String(item).trim();
    if (!raw) continue;
    counts.set(raw, (counts.get(raw) || 0) + 1);
  }
  const byLabel = new Map();
  for (const [raw, count] of counts) {
    const label = ITEM_CATEGORY_LABELS[raw.toLowerCase()] || raw;
    const entry = byLabel.get(label);
    if (!entry || count > entry.count) byLabel.set(label, { value: raw, label, count });
  }
  return Array.from(byLabel.values())
    .map(({ value, label }) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}

function categoryBadge(value) {
  const key = String(value === undefined || value === null ? '' : value).trim().toLowerCase();
  const label = ITEM_CATEGORY_LABELS[key] || '';
  if (label !== 'Uniforms' && label !== 'Modules' && label !== 'Books') return null;
  return { className: 'category-badge--' + label.toLowerCase(), label };
}

/* --------------------------------------------------------------------------
 * CSV export (D8, data-export spec)
 * ------------------------------------------------------------------------ */

function sfCsvCell(value) {
  const str = value === undefined || value === null ? '' : String(value);
  return /[",\n\r]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
}

function exportRowsCsv(moduleId, rows, columns) {
  const cols = (columns || []).map(col =>
    typeof col === 'string' ? { key: col, label: col } : col
  );
  const header = cols.map(col => sfCsvCell(col.label || col.key)).join(',');
  const lines = [header];
  for (const row of rows || []) {
    lines.push(
      cols.map(col => sfCsvCell(typeof col.getValue === 'function' ? col.getValue(row) : row && col.key !== undefined ? row[col.key] : '')).join(',')
    );
  }
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = moduleId + '-export-' + stamp + '.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* --------------------------------------------------------------------------
 * SmartCombobox — searchable dropdown (D4)
 * ------------------------------------------------------------------------ */

function sfNormalizeOptions(options) {
  const source = typeof options === 'function' ? options() : options;
  return (source || []).map(option => {
    if (typeof option === 'string') return { value: option, label: option };
    return { value: String(option.value), label: String(option.label) };
  });
}

function SmartCombobox({ label, placeholder, options, initialValue = '', onSelect, minWidth }) {
  let currentOptions = sfNormalizeOptions(options);
  let value = initialValue;
  let open = false;
  let highlightedIndex = -1;
  let filteredOptions = currentOptions;

  const listEl = sfEl('div', { className: 'smart-combobox__list', role: 'listbox' }, [
    sfEl('input', {
      className: 'smart-combobox__search',
      type: 'text',
      placeholder: 'Search...',
      'aria-label': 'Search ' + (label || 'options')
    }),
    sfEl('div', { className: 'smart-combobox__options' })
  ]);

  const button = sfEl('button', {
    type: 'button',
    className: 'smart-combobox__button',
    role: 'combobox',
    'aria-expanded': 'false',
    'aria-controls': undefined,
    'aria-haspopup': 'listbox',
    'aria-label': label
  }, [sfEl('span', { className: 'smart-combobox__value' })]);

  const wrapper = sfEl('div', { className: 'smart-combobox' }, [button, listEl]);

  const searchInput = listEl.querySelector('.smart-combobox__search');
  const optionsBox = listEl.querySelector('.smart-combobox__options');

  const selectedLabel = () => {
    const match = currentOptions.find(option => option.value === value);
    return match ? match.label : '';
  };

  const renderOptions = () => {
    const query = searchInput.value.trim().toLowerCase();
    filteredOptions = currentOptions.filter(option =>
      !query || option.label.toLowerCase().includes(query)
    );
    optionsBox.innerHTML = '';
    if (!filteredOptions.length) {
      optionsBox.appendChild(sfEl('div', { className: 'smart-combobox__option smart-combobox__empty' }, ['No matching options']));
      highlightedIndex = -1;
      return;
    }
    filteredOptions.forEach((option, index) => {
      const item = sfEl('div', {
        className: 'smart-combobox__option' + (option.value === value ? ' is-selected' : ''),
        role: 'option',
        'aria-selected': String(option.value === value)
      }, [option.label]);
      item.addEventListener('click', () => {
        selectOption(option);
      });
      item.addEventListener('mousemove', () => setHighlight(index));
      optionsBox.appendChild(item);
    });
    highlightedIndex = -1;
  };

  const setHighlight = index => {
    highlightedIndex = index;
    optionsBox.querySelectorAll('.smart-combobox__option').forEach((item, i) => {
      item.classList.toggle('is-highlighted', i === index);
    });
    const highlighted = optionsBox.children[index];
    if (highlighted && highlighted.scrollIntoView) highlighted.scrollIntoView({ block: 'nearest' });
  };

  const selectOption = option => {
    value = option.value;
    button.querySelector('.smart-combobox__value').textContent = option.label;
    close();
    if (typeof onSelect === 'function') onSelect(value, option.label);
  };

  const openList = () => {
    if (open) return;
    open = true;
    listEl.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    renderOptions();
    searchInput.value = '';
    setTimeout(() => searchInput.focus(), 0);
  };

  const close = () => {
    if (!open) return;
    open = false;
    listEl.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.focus();
  };

  const moveHighlight = direction => {
    if (!filteredOptions.length) return;
    const count = filteredOptions.length;
    highlightedIndex = highlightedIndex === -1
      ? (direction === 1 ? 0 : count - 1)
      : (highlightedIndex + direction + count) % count;
    setHighlight(highlightedIndex);
  };

  button.addEventListener('click', () => (open ? close() : openList()));
  button.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openList();
    } else if (event.key === 'Escape') {
      close();
    }
  });
  searchInput.addEventListener('input', renderOptions);
  searchInput.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); moveHighlight(1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); moveHighlight(-1); }
    else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) selectOption(option);
      else close();
    } else if (event.key === 'Escape') {
      close();
    }
  });
  document.addEventListener('mousedown', event => {
    if (open && !wrapper.contains(event.target)) close();
  });

  return {
    node: wrapper,
    getValue: () => value,
    setValue(nextValue) {
      value = nextValue;
      const match = currentOptions.find(option => option.value === value);
      button.querySelector('.smart-combobox__value').textContent = match ? match.label : '';
    },
    setOptions(nextOptions) {
      currentOptions = sfNormalizeOptions(nextOptions);
      const match = currentOptions.find(option => option.value === value);
      button.querySelector('.smart-combobox__value').textContent = match ? match.label : '';
      if (open) renderOptions();
    },
    reset() { value = ''; button.querySelector('.smart-combobox__value').textContent = ''; }
  };
}

/* --------------------------------------------------------------------------
 * SmartFilter component (D1)
 *
 * Single-render contract:
 *   - create(container, config) performs the initial apply() itself (after
 *     build()), so loaders MUST NOT call apply() immediately after create()
 *     — that double-renders the table. initXXXFilter helpers should return
 *     whether the filter was just created (true) vs. already existed (false)
 *     and only call apply() in the latter case.
 *   - refreshOptions() rebuilds the option lists WITHOUT re-rendering the
 *     table; use it after replacing the underlying dataset (getRows data) and
 *     then call apply() explicitly if the loaded data should re-render now.
 *     When a loader only needs to refresh selectable options (or the create()
 *     apply already rendered), call refreshOptions() alone.
 * ------------------------------------------------------------------------ */

const SmartFilter = {
  DATE_RANGE_PRESETS,
  legacyPresetKey,
  getDateRangePresetBounds,
  getCustomRangeBounds,
  exportRowsCsv,
  distinctFrom,
  buildCategoryFilterOptions,
  categoryBadge,
  ITEM_CATEGORY_LABELS,
  SmartCombobox,

  create(container, config) {
    const moduleId = config.moduleId || 'module';
    const fields = config.fields || [];
    const advancedKeys = config.advanced || [];
    const dateField = fields.find(field => field.presets);
    const sorts = config.sorts || [];

    const state = {
      search: '',
      values: {},
      preset: legacyPresetKey(config.initialPreset || 'all'),
      customFrom: '',
      customTo: '',
      sort: '',
      advancedOpen: false
    };

    let currentRows = [];
    const fieldControls = {};
    let presetSelect = null;
    let customRow = null;
    let advancedPanel = null;
    let sortSelect = null;
    let searchInput = null;
    let exportButton = null;
    let advancedButton = null;

    const isAdvancedField = field => advancedKeys.includes(field.key);
    // The preset field is drawn by buildDateRange() alone. Listing it with the
    // other fields as well added a second "All Date" dropdown that had no
    // options and filtered nothing.
    const isPresetField = field => Boolean(field.presets);
    const mainFields = fields.filter(field => !isAdvancedField(field) && !isPresetField(field));
    const advancedFields = fields.filter(field => isAdvancedField(field) && !isPresetField(field));

    // Reads the box when the timer fires, so a debounced run always applies
    // the latest text rather than the text at the first keystroke.
    function applySearchNow() {
      if (!searchInput) return;
      if (state.search === searchInput.value) return;
      state.search = searchInput.value;
      apply();
    }
    const debouncedSearch = sfDebounce(applySearchNow, 300);

    function buildFieldControl(field) {
      const options = sfNormalizeOptions(field.options);
      const useCombobox = options.length > 8 || field.combobox === true;
      const wrap = sfEl('div', { className: 'filter-control' });
      let control;

      if (useCombobox) {
        const combobox = SmartCombobox({
          label: field.label,
          placeholder: field.placeholder || field.label,
          options,
          initialValue: state.values[field.key] || '',
          onSelect: value => {
            state.values[field.key] = value;
            apply();
          }
        });
        control = combobox.node;
        fieldControls[field.key] = {
          type: 'combobox',
          setValue: value => combobox.setValue(value),
          setOptions: nextOptions => combobox.setOptions(nextOptions),
          getValue: () => combobox.getValue()
        };
      } else {
        const select = sfEl('select', { className: 'filter-control__select', 'aria-label': field.label }, [
          sfEl('option', { value: '' }, ['All ' + field.label])
        ].concat(options.map(option =>
          sfEl('option', { value: option.value }, [option.label])
        )));
        select.value = state.values[field.key] || '';
        select.addEventListener('change', () => {
          state.values[field.key] = select.value;
          apply();
        });
        control = select;
        fieldControls[field.key] = {
          type: 'select',
          setValue: value => { select.value = value; },
          setOptions: nextOptions => {
            select.innerHTML = '';
            select.appendChild(sfEl('option', { value: '' }, ['All ' + field.label]));
            sfNormalizeOptions(nextOptions).forEach(option =>
              select.appendChild(sfEl('option', { value: option.value }, [option.label]))
            );
            select.value = state.values[field.key] || '';
          },
          getValue: () => select.value
        };
      }
      wrap.appendChild(control);
      return wrap;
    }

    function buildDateRange() {
      const group = sfEl('div', { className: 'filter-control filter-date-range' });
      presetSelect = sfEl('select', {
        className: 'filter-control__select',
        'aria-label': dateField.label || 'Date range'
      });
      DATE_RANGE_PRESETS.forEach(preset =>
        presetSelect.appendChild(sfEl('option', { value: preset.key }, [preset.label]))
      );
      presetSelect.value = state.preset;
      presetSelect.addEventListener('change', () => {
        state.preset = legacyPresetKey(presetSelect.value);
        customRow.classList.toggle('is-visible', state.preset === 'custom');
        apply();
      });
      group.appendChild(presetSelect);

      const fromInput = sfEl('input', {
        type: 'date',
        className: 'filter-control__input',
        'aria-label': (dateField.label || 'Date') + ' from'
      });
      const toInput = sfEl('input', {
        type: 'date',
        className: 'filter-control__input',
        'aria-label': (dateField.label || 'Date') + ' to'
      });
      customRow = sfEl('div', { className: 'filter-date-range__custom' }, [
        fromInput,
        sfEl('span', { className: 'filter-date-range__separator' }, ['\u2013']),
        toInput
      ]);
      customRow.classList.toggle('is-visible', state.preset === 'custom');
      fromInput.addEventListener('change', () => {
        state.customFrom = fromInput.value;
        apply();
      });
      toInput.addEventListener('change', () => {
        state.customTo = toInput.value;
        apply();
      });
      group.appendChild(customRow);
      return group;
    }

    function applyDateRange(rows) {
      if (!dateField) return rows;
      let bounds = null;
      if (state.preset === 'custom') {
        bounds = getCustomRangeBounds(state.customFrom, state.customTo);
      } else {
        bounds = getDateRangePresetBounds(state.preset);
      }
      if (!bounds) return rows;
      return rows.filter(record => {
        const date = sfGetRecordDate(record, dateField.getDate);
        if (!date) return false;
        const timestamp = date.getTime();
        if (bounds.fromMs !== null && timestamp < bounds.fromMs) return false;
        if (bounds.toMs !== null && timestamp >= bounds.toMs) return false;
        return true;
      });
    }

    function applySearch(rows) {
      if (!config.search || !state.search.trim()) return rows;
      const query = state.search.trim();
      if (typeof config.search.match === 'function') {
        return rows.filter(record => config.search.match(record, query));
      }
      const keys = config.search.keys || [];
      const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
      return rows.filter(record => {
        const haystacks = keys.length
          ? keys.map(key => {
              const value = key.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), record);
              return value !== undefined && value !== null ? String(value) : '';
            })
          : [JSON.stringify(record)];
        const haystack = haystacks.join(' ').toLowerCase();
        return tokens.every(token => haystack.includes(token));
      });
    }

    function applySort(rows) {
      if (!state.sort) return rows;
      const sort = sorts.find(option => option.key === state.sort);
      if (!sort) return rows;
      return rows.slice().sort(sort.compare
        ? sort.compare
        : (a, b) => {
            const av = sort.getValue ? sort.getValue(a) : a[sort.key];
            const bv = sort.getValue ? sort.getValue(b) : b[sort.key];
            if (av === bv) return 0;
            if (av === undefined || av === null) return 1;
            if (bv === undefined || bv === null) return -1;
            return String(av).localeCompare(String(bv), undefined, { numeric: true });
          });
    }

    function apply() {
      let rows = (typeof config.getRows === 'function' ? config.getRows() : []).slice();
      if (typeof config.filter === 'function') {
        rows = config.filter(rows, getState());
      }
      rows = applyDateRange(rows);
      rows = applySearch(rows);
      rows = applySort(rows);
      currentRows = rows;
      if (typeof config.onRender === 'function') config.onRender(rows);
    }

    function syncControls() {
      Object.keys(fieldControls).forEach(key => {
        fieldControls[key].setValue(state.values[key] || '');
      });
      if (presetSelect) presetSelect.value = state.preset;
      if (sortSelect) sortSelect.value = state.sort;
      if (searchInput) searchInput.value = state.search;
      if (customRow) customRow.classList.toggle('is-visible', state.preset === 'custom');
    }

    function reset() {
      state.search = '';
      state.values = {};
      state.preset = legacyPresetKey(config.initialPreset || 'all');
      state.customFrom = '';
      state.customTo = '';
      state.sort = '';
      syncControls();
      apply();
    }

    function getState() {
      return {
        search: state.search,
        values: Object.assign({}, state.values),
        preset: state.preset,
        customFrom: state.customFrom,
        customTo: state.customTo,
        sort: state.sort
      };
    }

    function build() {
      const toolbar = sfEl('div', { className: 'filter-toolbar__row filter-toolbar__row--main' });
      container.classList.add('filter-toolbar');
      container.dataset.module = moduleId;

      mainFields.forEach(field => toolbar.appendChild(buildFieldControl(field)));

      if (dateField) toolbar.appendChild(buildDateRange());

      if (sorts.length) {
        const sortWrap = sfEl('div', { className: 'filter-control' });
        sortSelect = sfEl('select', { className: 'filter-control__select', 'aria-label': 'Sort' }, [
          sfEl('option', { value: '' }, ['Sort'])
        ].concat(sorts.map(sort =>
          sfEl('option', { value: sort.key }, [sort.label])
        )));
        sortSelect.addEventListener('change', () => {
          state.sort = sortSelect.value;
          apply();
        });
        sortWrap.appendChild(sortSelect);
        toolbar.appendChild(sortWrap);
      }

      if (config.search) {
        searchInput = sfEl('input', {
          type: 'search',
          className: 'filter-control__input filter-control__input--search',
          placeholder: config.search.placeholder || 'Search...',
          'aria-label': 'Search ' + moduleId,
          autocomplete: 'off',
          autocorrect: 'off',
          spellcheck: 'false'
        });
        const searchWrap = sfEl('div', { className: 'filter-control filter-control--search' }, [searchInput]);
        // The query has to reach state.search before apply() runs. The input
        // handler used to debounce apply() alone, so typing re-rendered with the
        // previous query and the search only took effect on Enter. Clearing the
        // box (including the native clear button on type="search") applies at
        // once so the full list comes straight back.
        searchInput.addEventListener('input', () => {
          if (!searchInput.value) {
            applySearchNow();
            return;
          }
          debouncedSearch();
        });
        searchInput.addEventListener('keydown', event => {
          if (event.key === 'Enter') applySearchNow();
        });
        toolbar.appendChild(searchWrap);
      }

      if (advancedFields.length) {
        advancedButton = sfEl('button', {
          type: 'button',
          className: 'filter-btn filter-btn--advanced',
          'aria-expanded': 'false'
        }, ['Advanced Filters']);
        advancedButton.addEventListener('click', () => {
          state.advancedOpen = !state.advancedOpen;
          advancedPanel.classList.toggle('is-open', state.advancedOpen);
          advancedButton.setAttribute('aria-expanded', String(state.advancedOpen));
        });
        toolbar.appendChild(advancedButton);
      }

      const resetButton = sfEl('button', {
        type: 'button',
        className: 'filter-btn filter-btn--reset'
      }, ['Reset Filters']);
      resetButton.addEventListener('click', reset);
      toolbar.appendChild(resetButton);

      if (config.export) {
        exportButton = sfEl('button', {
          type: 'button',
          className: 'filter-btn filter-btn--export'
        }, ['Export']);
        exportButton.addEventListener('click', () => {
          exportRowsCsv(config.export.fileName || moduleId, currentRows, config.export.columns);
        });
        toolbar.appendChild(exportButton);
      }

      container.appendChild(toolbar);

      if (advancedFields.length) {
        advancedPanel = sfEl('div', { className: 'advanced-filters' });
        const advancedRow = sfEl('div', { className: 'filter-toolbar__row' });
        advancedFields.forEach(field => advancedRow.appendChild(buildFieldControl(field)));
        advancedPanel.appendChild(advancedRow);
        container.appendChild(advancedPanel);
      }

      if (dateField) {
        customRow.classList.toggle('is-visible', state.preset === 'custom');
      }
    }

    build();
    apply();

    return {
      moduleId,
      apply,
      reset,
      getState,
      getCurrentRows: () => currentRows,
      refreshOptions() {
        fields.forEach(field => {
          const control = fieldControls[field.key];
          if (control) control.setOptions(field.options);
        });
      },
      setPreset(key) {
        state.preset = legacyPresetKey(key);
        if (presetSelect) presetSelect.value = state.preset;
        if (customRow) customRow.classList.toggle('is-visible', state.preset === 'custom');
        apply();
      },
      setSort(key) {
        state.sort = key;
        if (sortSelect) sortSelect.value = key;
        apply();
      },
      getConfig: () => config
    };
  }
};

window.SmartFilter = SmartFilter;
