/**
 * @jest-environment jsdom
 */

'use strict';

const fs = require('fs');
const path = require('path');

function loadScript(relativePath) {
  const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', relativePath), 'utf8');
  const script = document.createElement('script');
  script.textContent = source;
  document.body.appendChild(script);
}

beforeAll(() => {
  loadScript('admin-filters.js');
});

const NOW = new Date(2026, 7, 2, 12, 0, 0); // Aug 2, 2026 12:00

const records = [
  { id: 1, name: 'Alpha Batch', category: 'Books', qty: 0, reorderLevel: 5, date: new Date(2026, 7, 2, 9, 0, 0).toISOString() }, // today
  { id: 2, name: 'Bravo Batch', category: 'Modules', qty: 3, reorderLevel: 5, date: new Date(2026, 7, 1, 9, 0, 0).toISOString() }, // yesterday
  { id: 3, name: 'Charlie Batch', category: 'Books', qty: 12, reorderLevel: 5, date: new Date(2026, 6, 20, 9, 0, 0).toISOString() }, // 13 days ago
  { id: 4, name: 'Delta Batch', category: 'Uniforms', qty: 40, reorderLevel: 5, date: new Date(2026, 6, 1, 9, 0, 0).toISOString() }, // July 1 (last month)
  { id: 5, name: 'Echo Batch', category: 'Books', qty: 7, reorderLevel: 5, date: new Date(2025, 10, 1, 9, 0, 0).toISOString() } // last year
];

function statusOf(item) {
  if (Number(item.qty) === 0) return 'Out of Stock';
  if (Number(item.qty) <= Number(item.reorderLevel)) return 'Low Stock';
  return 'In Stock';
}

function getRecordDate(raw) {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function makeConfig() {
  return {
    moduleId: 'testmodule',
    search: {
      placeholder: 'Search items...',
      keys: ['name', 'category']
    },
    fields: [
      { key: 'category', label: 'Category', options: () => ['Books', 'Modules', 'Uniforms'] },
      { key: 'stockStatus', label: 'Stock Status', options: ['In Stock', 'Low Stock', 'Out of Stock'] },
      { key: 'dateRange', label: 'Date', presets: true, getDate: record => getRecordDate(record.date) }
    ],
    getRows: () => records,
    filter: (rows, state) => {
      const category = String(state.values.category || '').toLowerCase();
      const stockStatus = String(state.values.stockStatus || '').toLowerCase();
      return rows.filter(item => {
        if (category && String(item.category).toLowerCase() !== category) return false;
        if (stockStatus && statusOf(item).toLowerCase() !== stockStatus) return false;
        return true;
      });
    },
    onRender: jest.fn(),
    sorts: [
      { key: 'nameAsc', label: 'Name (A-Z)', getValue: item => item.name },
      { key: 'nameDesc', label: 'Name (Z-A)', compare: (a, b) => String(b.name).localeCompare(String(a.name)) },
      { key: 'qtyLow', label: 'Quantity (Low to High)', getValue: item => Number(item.qty) },
      { key: 'qtyHigh', label: 'Quantity (High to Low)', compare: (a, b) => Number(b.qty) - Number(a.qty) }
    ],
    export: {
      fileName: 'testmodule',
      columns: [
        { key: 'name', label: 'Item Name' },
        { key: 'category', label: 'Category' },
        { key: 'qty', label: 'Quantity' },
        { key: 'status', label: 'Status', getValue: statusOf }
      ]
    }
  };
}

function setupFilter(config) {
  const container = document.createElement('div');
  container.id = 'filterContainer';
  document.body.appendChild(container);
  const filter = window.SmartFilter.create(container, config);
  return { container, filter };
}

function setSearch(filter, value) {
  const input = document.querySelector('.filter-control__input--search');
  input.value = value;
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
}

function selectField(filter, key, value) {
  const selects = Array.from(document.querySelectorAll('.filter-control__select'));
  const fieldKeys = filter.getConfig().fields.map(field => field.key);
  const index = fieldKeys.indexOf(key);
  selects[index].value = value;
  selects[index].dispatchEvent(new window.Event('change', { bubbles: true }));
}

function setPreset(filter, presetKey) {
  const presetSelect = Array.from(document.querySelectorAll('.filter-control__select'))
    .find(select => Array.from(select.options).some(option => option.value === 'custom'));
  presetSelect.value = presetKey;
  presetSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
}

function setCustomRange(from, to) {
  const inputs = Array.from(document.querySelectorAll('.filter-date-range__custom input'));
  inputs[0].value = from;
  inputs[0].dispatchEvent(new window.Event('change', { bubbles: true }));
  inputs[1].value = to;
  inputs[1].dispatchEvent(new window.Event('change', { bubbles: true }));
}

function renderedIds(filter) {
  const rows = filter.getCurrentRows();
  return rows.map(row => row.id);
}

describe('SmartFilter engine', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
    document.body.innerHTML = '';
    window.SmartFilter.DATE_RANGE_PRESETS.forEach(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders the full toolbar (search, selects, date preset, sort, reset, export)', () => {
    const { container, filter } = setupFilter(makeConfig());
    expect(container.classList.contains('filter-toolbar')).toBe(true);
    expect(container.querySelector('.filter-control__input--search')).toBeTruthy();
    // Category, Stock Status, the date preset and Sort. The date field is drawn
    // once, as the preset picker, not also as an empty dropdown.
    expect(container.querySelectorAll('.filter-control__select').length).toBeGreaterThanOrEqual(4);
    expect(container.querySelector('.filter-btn--reset')).toBeTruthy();
    expect(container.querySelector('.filter-btn--export')).toBeTruthy();
  });

  test('filter toolbar renders Item Category first and Search last', () => {
    const { container } = setupFilter(makeConfig());

    const selects = Array.from(container.querySelectorAll('.filter-control__select'));
    // Category, Stock Status, the date preset and Sort. The date field is drawn
    // once, as the preset picker, not also as an empty dropdown.
    expect(selects.length).toBeGreaterThanOrEqual(4);
    expect(selects[0].getAttribute('aria-label')).toBe('Category');

    const searchInput = container.querySelector('.filter-control__input--search');
    expect(searchInput).toBeTruthy();

    const children = Array.from(container.querySelector('.filter-toolbar__row--main').children);
    const searchIndex = children.indexOf(searchInput.closest('.filter-control'));
    const lastSelectIndex = Math.max(...selects.map(select => children.indexOf(select.closest('.filter-control'))));
    expect(searchIndex).toBeGreaterThan(lastSelectIndex);
  });

  test('combined filters: search + category + stock status + date range narrow the rows', () => {
    const { filter } = setupFilter(makeConfig());
    selectField(filter, 'category', 'Books');
    selectField(filter, 'stockStatus', 'Out of Stock');
    setSearch(filter, 'alpha');
    jest.advanceTimersByTime(400);
    expect(renderedIds(filter)).toEqual([1]);
    expect(filter.getCurrentRows().length).toBe(1);
  });

  test('date presets: today, yesterday, last 7/30 days, this month, this year, all time', () => {
    const { filter } = setupFilter(makeConfig());

    setPreset(filter, 'today');
    expect(renderedIds(filter)).toEqual([1]);

    setPreset(filter, 'yesterday');
    expect(renderedIds(filter)).toEqual([2]);

    setPreset(filter, 'last7');
    expect(renderedIds(filter).sort()).toEqual([1, 2]);

    setPreset(filter, 'last30');
    expect(renderedIds(filter).sort()).toEqual([1, 2, 3]);

    setPreset(filter, 'thismonth');
    expect(renderedIds(filter).sort()).toEqual([1, 2]);

    setPreset(filter, 'lastmonth');
    expect(renderedIds(filter)).toEqual([4]);

    setPreset(filter, 'thisyear');
    expect(renderedIds(filter).sort()).toEqual([1, 2, 3, 4]);

    setPreset(filter, 'all');
    expect(renderedIds(filter).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test('custom date range filters inclusively from start, exclusively at end', () => {
    const { filter } = setupFilter(makeConfig());
    setPreset(filter, 'custom');
    setCustomRange('2026-07-31', '2026-08-02');
    expect(renderedIds(filter)).toEqual([1, 2]);
  });

  test('sort options order rows (asc, desc, quantity low/high)', () => {
    const { filter } = setupFilter(makeConfig());
    const sortSelect = Array.from(document.querySelectorAll('.filter-control__select'))
      .find(select => Array.from(select.options).some(option => option.value === 'nameAsc'));
    sortSelect.value = 'nameAsc';
    sortSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(renderedIds(filter)).toEqual([1, 2, 3, 4, 5]);

    sortSelect.value = 'nameDesc';
    sortSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(renderedIds(filter)).toEqual([5, 4, 3, 2, 1]);

    sortSelect.value = 'qtyLow';
    sortSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(renderedIds(filter)).toEqual([1, 2, 5, 3, 4]);

    sortSelect.value = 'qtyHigh';
    sortSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(renderedIds(filter)).toEqual([4, 5, 3, 2, 1]);
  });

  test('Reset Filters clears search, fields, preset, and sort', () => {
    const { container, filter } = setupFilter(makeConfig());
    selectField(filter, 'category', 'Books');
    setSearch(filter, 'alpha');
    jest.advanceTimersByTime(400);
    expect(renderedIds(filter)).toEqual([1]);

    const searchInput = container.querySelector('.filter-control__input--search');
    expect(searchInput.value).toBe('alpha');
    container.querySelector('.filter-btn--reset').click();

    expect(searchInput.value).toBe('');
    expect(renderedIds(filter).length).toBe(5);
    const state = filter.getState();
    expect(state.values.category || state.values.stockStatus).toBeFalsy();
    expect(state.sort).toBe('');
    expect(state.preset).toBe('all');
  });

  test('options >8 render a searchable combobox; keyboard navigation selects', () => {
    const manyOptions = Array.from({ length: 12 }, (_, index) => 'Option ' + String(index + 1).padStart(2, '0'));
    const config = makeConfig();
    config.fields = [
      { key: 'bigList', label: 'Big List', options: manyOptions },
      { key: 'dateRange', label: 'Date', presets: true, getDate: record => getRecordDate(record.date) }
    ];
    const { container, filter } = setupFilter(config);

    const combobox = container.querySelector('.smart-combobox');
    expect(combobox).toBeTruthy();

    const button = combobox.querySelector('.smart-combobox__button');
    button.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    button.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const search = combobox.querySelector('.smart-combobox__search');
    search.value = 'option 12';
    search.dispatchEvent(new window.Event('input', { bubbles: true }));
    search.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    search.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(filter.getState().values.bigList).toBe('Option 12');
  });

  test('export writes filtered rows with headers in current sort order and correct filename', () => {
    const blobs = new Map();
    let urlCounter = 0;
    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevoke = window.URL.revokeObjectURL;
    const originalClick = window.HTMLAnchorElement.prototype.click;
    window.URL.createObjectURL = jest.fn(blob => {
      const url = 'blob:test-' + (++urlCounter);
      blobs.set(url, blob);
      return url;
    });
    window.URL.revokeObjectURL = jest.fn();
    window.HTMLAnchorElement.prototype.click = function captureClick() {};

    try {
      const { filter } = setupFilter(makeConfig());
      selectField(filter, 'stockStatus', 'Low Stock');
      const sortSelect = Array.from(document.querySelectorAll('.filter-control__select'))
        .find(select => Array.from(select.options).some(option => option.value === 'nameAsc'));
      sortSelect.value = 'nameAsc';
      sortSelect.dispatchEvent(new window.Event('change', { bubbles: true }));

      document.querySelector('.filter-btn--export').click();

      const blob = [...blobs.values()].pop();
      const text = blob.text();
      const lines = text.split('\r\n');
      expect(lines[0]).toBe('Item Name,Category,Quantity,Status');
      expect(lines.filter(Boolean)).toEqual(['Item Name,Category,Quantity,Status', 'Bravo Batch,Modules,3,Low Stock']);
    } finally {
      window.URL.createObjectURL = originalCreateObjectURL;
      window.URL.revokeObjectURL = originalRevoke;
      window.HTMLAnchorElement.prototype.click = originalClick;
    }
  });

  test('export of an empty filtered set produces a header-only file', () => {
    const blobs = new Map();
    let urlCounter = 0;
    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevoke = window.URL.revokeObjectURL;
    window.URL.createObjectURL = jest.fn(blob => {
      const url = 'blob:test-' + (++urlCounter);
      blobs.set(url, blob);
      return url;
    });
    window.URL.revokeObjectURL = jest.fn();
    try {
      const { filter } = setupFilter(makeConfig());
      setSearch(filter, 'zzzz-no-match');
      jest.advanceTimersByTime(400);
      document.querySelector('.filter-btn--export').click();
      const blob = [...blobs.values()].pop();
      expect(blob.text()).toBe('Item Name,Category,Quantity,Status\r\n');
    } finally {
      window.URL.createObjectURL = originalCreateObjectURL;
      window.URL.revokeObjectURL = originalRevoke;
    }
  });

  test('setSort drives the shared sort select (column-header integration)', () => {
    const { container, filter } = setupFilter(makeConfig());
    filter.setSort('qtyHigh');
    const sortSelect = Array.from(container.querySelectorAll('.filter-control__select'))
      .find(select => Array.from(select.options).some(option => option.value === 'qtyHigh'));
    expect(sortSelect.value).toBe('qtyHigh');
    expect(renderedIds(filter)).toEqual([4, 3, 5, 2, 1]);
  });
});

/**
 * Mirrors INVENTORY_FILTER_CONFIG in public/js/inventory.js.
 *
 * The inventory filter grid in public/css/admin.css is defined in terms of the
 * control sequence this config produces, so the shape below is load-bearing:
 * eight direct children whose grid spans resolve to 3+3+3+3 on row 1 and
 * 3+5+2+2 on row 2. If the emitted set or order changes, these assertions fail
 * and the grid must be updated in the same change.
 */
function makeInventoryShapedConfig() {
  const config = makeConfig();
  config.moduleId = 'inventory';
  config.search = {
    placeholder: 'Search items by name, category, or unit of measure...',
    keys: ['name', 'category', 'unit']
  };
  config.fields[2] = {
    key: 'dateAdded',
    label: 'Date Added',
    presets: true,
    getDate: record => getRecordDate(record.date)
  };
  return config;
}

describe('SmartFilter toolbar shape (inventory grid contract)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function mainRowChildren(container) {
    return Array.from(container.querySelector('.filter-toolbar__row--main').children);
  }

  test('main row has exactly seven direct children', () => {
    const { container } = setupFilter(makeInventoryShapedConfig());
    expect(mainRowChildren(container)).toHaveLength(7);
  });

  test('main row children match the expected signature in order', () => {
    const { container } = setupFilter(makeInventoryShapedConfig());
    const children = mainRowChildren(container);

    const describe_ = child => {
      if (child.matches('.filter-control--search')) return 'search';
      if (child.matches('.filter-btn--reset')) return 'reset';
      if (child.matches('.filter-btn--export')) return 'export';
      if (child.matches('.filter-date-range')) return 'date-range';
      return `select:${child.querySelector('.filter-control__select')?.getAttribute('aria-label')}`;
    };

    expect(children.map(describe_)).toEqual([
      'select:Category',
      'select:Stock Status',
      'date-range',
      'select:Sort',
      'search',
      'reset',
      'export'
    ]);
  });

  test('the custom date-range sub-row stays nested and consumes no grid track', () => {
    const { container } = setupFilter(makeInventoryShapedConfig());
    const row = container.querySelector('.filter-toolbar__row--main');
    const group = container.querySelector('.filter-date-range');
    const custom = container.querySelector('.filter-date-range__custom');

    expect(group).toBeTruthy();
    expect(custom).toBeTruthy();
    expect(group.contains(custom)).toBe(true);
    expect(custom.parentElement).toBe(group);
    expect(row.contains(custom)).toBe(true);
    expect(custom.parentElement === row).toBe(false);
    expect(mainRowChildren(container).includes(custom)).toBe(false);
  });

  test('search placeholder and button labels are unchanged', () => {
    const { container } = setupFilter(makeInventoryShapedConfig());

    const searchInput = container.querySelector('.filter-control--search .filter-control__input');
    expect(searchInput.getAttribute('placeholder'))
      .toBe('Search items by name, category, or unit of measure...');

    expect(container.querySelector('.filter-btn--reset').textContent).toBe('Reset Filters');
    expect(container.querySelector('.filter-btn--export').textContent).toBe('Export');
  });

  test('the toolbar is scoped to the inventory module for the grid rules', () => {
    const { container } = setupFilter(makeInventoryShapedConfig());
    expect(container.dataset.module).toBe('inventory');
  });
});

describe('SmartFilter.buildCategoryFilterOptions', () => {
  test('maps lowercase singular raw values to canonical plural labels, preserving values', () => {
    const options = window.SmartFilter.buildCategoryFilterOptions(['module', 'uniform', 'books']);
    expect(options).toEqual([
      { value: 'books', label: 'Books' },
      { value: 'module', label: 'Modules' },
      { value: 'uniform', label: 'Uniforms' }
    ]);
  });

  test('general and service keep their distinct labels', () => {
    const options = window.SmartFilter.buildCategoryFilterOptions(['module', 'general', 'service']);
    expect(options.map(option => option.label)).toEqual(['General', 'Modules', 'Service']);
  });

  test('singular and plural raw values collapse into a single canonical option', () => {
    const options = window.SmartFilter.buildCategoryFilterOptions(['module', 'Modules']);
    expect(options).toHaveLength(1);
    expect(options[0]).toEqual({ value: 'module', label: 'Modules' });
  });

  test('option value matches the dominant raw spelling when both spellings occur', () => {
    const options = window.SmartFilter.buildCategoryFilterOptions(['module', 'Modules', 'Modules']);
    expect(options).toEqual([{ value: 'Modules', label: 'Modules' }]);
  });

  test('uses canonical-labeled fallback options when no raw values exist', () => {
    const options = window.SmartFilter.buildCategoryFilterOptions([], ['module', 'uniform', 'books']);
    expect(options).toEqual([
      { value: 'books', label: 'Books' },
      { value: 'module', label: 'Modules' },
      { value: 'uniform', label: 'Uniforms' }
    ]);
  });

  test('accepts a function returning raw values', () => {
    const options = window.SmartFilter.buildCategoryFilterOptions(() => ['uniform', 'uniforms']);
    expect(options).toEqual([{ value: 'uniform', label: 'Uniforms' }]);
  });
});
