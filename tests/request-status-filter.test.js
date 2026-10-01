/**
 * @jest-environment jsdom
 */

'use strict';

const fs = require('fs');
const path = require('path');

// HARNESS TRAP 1 (design D6): these must be injected as classic <script> elements,
// never as w.eval(...). A single eval of a concatenated bundle goes strict-mode,
// which stops function declarations from reaching the global object, and an
// individual eval puts each file in its own declarative scope so top-level
// let/const (distinctFrom, allRegistrations) become invisible to the other file.
// Real classic script tags share one global lexical environment, which is what
// this reproduces.
function loadScript(relativePath) {
  const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', relativePath), 'utf8');
  const script = document.createElement('script');
  script.textContent = source;
  document.body.appendChild(script);
}

// HARNESS TRAP 2 (design D6): the page's auth guard calls Location.replace when no
// token is present, which jsdom reports as a navigation error. Seeding the token
// before load keeps the guard satisfied.
const TOKEN = 'test-token';

const AUG = '2026-08-01T09:00:00.000Z';
const JUN = '2026-06-01T09:00:00.000Z';

function reg(id, fullname, course, yearLevel, studentType, rawStatus, updatedAt) {
  return {
    _id: id,
    fullname,
    course,
    yearLevel,
    studentType,
    module: { books: [], uniform: null },
    createdAt: updatedAt,
    updatedAt,
    userId: {
      _id: 'u-' + id,
      name: fullname,
      fullname,
      studentNumber: id,
      email: id.toLowerCase() + '@example.edu',
      status: rawStatus
    }
  };
}

// userId.status drives both the row badge and the filter, so these raw values are
// the whole test surface. 'active' is permitted by models/User.js but is not a
// filterable option; the case and whitespace variants cover the normalization rules.
const RECORDS = [
  reg('R1', 'Ana Reyes', 'BSIT', '4th Year', 'Regular', 'pending', AUG),
  reg('R2', 'Ben Cruz', 'BSIT', '4th Year', 'Regular', 'approved', AUG),
  reg('R3', 'Cara Dela Cruz', 'BSED', '3rd Year', 'Irregular', 'rejected', AUG),
  reg('R4', 'Dan Lim', 'BSIT', '3rd Year', 'Irregular', 'active', AUG),
  reg('R5', 'Elsa Gomez', 'BSIT', '4th Year', 'Regular', 'Approved', JUN),
  reg('R6', 'Frank Bautista', 'BSED', '4th Year', 'Regular', ' approved ', AUG),
  reg('R7', 'Grace Ito', 'BSIT', '4th Year', 'Regular', 'APPROVED', AUG)
];

const PENDING_IDS = ['R1', 'R4', 'R6'];
const APPROVED_IDS = ['R2', 'R5', 'R7'];
const REJECTED_IDS = ['R3'];

const TABLES = {
  pending: 'registrationsTable',
  approved: 'approvedRegistrationsTable',
  rejected: 'rejectedRegistrationsTable'
};

const EMPTY_STATES = {
  pending: 'No pending registrations match the current filters.',
  approved: 'No approved registrations match the current filters.',
  rejected: 'No rejected registrations match the current filters.'
};

let fetchCalls = 0;

function setUpDom() {
  document.body.innerHTML = `
    <div id="registrationsFilterWrap"><div id="registrationsFilterContainer"></div></div>
    <section id="registrationsPending">
      <table id="registrationsTable"><thead></thead><tbody></tbody></table>
    </section>
    <section id="registrationsApproved">
      <table id="approvedRegistrationsTable"><thead></thead><tbody></tbody></table>
    </section>
    <section id="registrationsRejected">
      <table id="rejectedRegistrationsTable"><thead></thead><tbody></tbody></table>
    </section>
  `;
}

function seedFetch(records) {
  fetchCalls = 0;
  window.fetch = jest.fn(async () => {
    fetchCalls += 1;
    return { ok: true, json: async () => records };
  });
}

function statusSelect() {
  return document.querySelector('#registrationsFilterContainer select[aria-label="Status"]');
}

function otherSelect(label) {
  return document.querySelector('#registrationsFilterContainer select[aria-label="' + label + '"]');
}

function setSelect(label, value) {
  const select = label === 'Status' ? statusSelect() : otherSelect(label);
  select.value = value;
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
}

// The Date preset select shares its aria-label with the plain field select that the
// duplicate dateField render leaves in the toolbar, so the real one is picked by the
// preset option values it carries rather than by label alone.
function datePresetSelect() {
  return Array.from(document.querySelectorAll('#registrationsFilterContainer select[aria-label="Date"]'))
    .find(select => Array.from(select.options).some(o => o.value === 'last30'));
}

function setDatePreset(value) {
  const select = datePresetSelect();
  select.value = value;
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
}

function setDateInput(label, value) {
  const input = document.querySelector('#registrationsFilterContainer input[aria-label="' + label + '"]');
  input.value = value;
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
}

function searchInput() {
  return document.querySelector('#registrationsFilterContainer input[aria-label="Search registrations"]');
}

// The shared component only commits state.search on Enter (admin-filters.js:741-746);
// the input handler re-applies with the previous term. Typing without Enter is a
// pre-existing quirk of the shared component, out of scope here, so the test drives
// search the way the page does: set the value, then press Enter.
function setSearch(term) {
  searchInput().value = term;
  searchInput().dispatchEvent(new window.Event('input', { bubbles: true }));
  searchInput().dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

// A rendered record row has 7 cells; the empty-state row has a single colSpan cell.
function isRecordRow(row) {
  return row.cells.length > 1;
}

function rowsIn(tableId) {
  return Array.from(document.querySelectorAll('#' + tableId + ' tbody tr')).filter(isRecordRow);
}

function idsIn(status) {
  return rowsIn(TABLES[status]).map(row => row.cells[0].textContent);
}

function badgeIn(status) {
  return rowsIn(TABLES[status]).map(row => row.cells[5].textContent);
}

function allRenderedIds() {
  return Object.keys(TABLES).flatMap(status => idsIn(status));
}

function allBadges() {
  return Object.keys(TABLES).flatMap(status => badgeIn(status));
}

function emptyStateText(status) {
  const rows = Array.from(document.querySelectorAll('#' + TABLES[status] + ' tbody tr'));
  const empty = rows.find(row => !isRecordRow(row));
  return empty ? empty.textContent : null;
}

function sectionId(status) {
  return 'registrations' + status.charAt(0).toUpperCase() + status.slice(1);
}

function isSectionHidden(status) {
  return document.getElementById(sectionId(status)).style.display === 'none';
}

function resetButton() {
  return Array.from(document.querySelectorAll('#registrationsFilterContainer button'))
    .find(btn => /reset/i.test(btn.textContent));
}

function buttonLabelled(text) {
  return Array.from(document.querySelectorAll('#registrationsFilterContainer button'))
    .find(btn => btn.textContent.trim() === text);
}

function cap(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function allIds() {
  return RECORDS.map(r => r.userId.studentNumber).sort();
}

function expectedFor(status) {
  const bucket = { pending: PENDING_IDS, approved: APPROVED_IDS, rejected: REJECTED_IDS }[status];
  return bucket.slice().sort();
}

// The Export button hands `currentRows` to exportRowsCsv, which wraps it in a Blob.
// Capturing the Blob and reading it back asserts the exported CSV itself rather
// than the filter's internals. Blob.text is absent in this jsdom build, so the
// FileReader is used instead.
function captureExportCsv() {
  const original = window.URL.createObjectURL;
  const originalRevoke = window.URL.revokeObjectURL;
  let captured = null;
  window.URL.createObjectURL = (blob) => {
    captured = blob;
    return 'blob:captured';
  };
  window.URL.revokeObjectURL = () => {};
  try {
    buttonLabelled('Export').click();
  } finally {
    window.URL.createObjectURL = original;
    window.URL.revokeObjectURL = originalRevoke;
  }
  expect(captured).not.toBeNull();
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^\uFEFF/, ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(captured);
  });
}

beforeAll(() => {
  setUpDom();
  // syncRegistrationSectionVisibility only acts when the resolved view is the
  // registrations view, so the location has to say so.
  window.history.replaceState({}, '', '/admin/registrations');
  window.localStorage.setItem('token', TOKEN);
  loadScript('admin-filters.js');
  loadScript('admin.js');
  window.initAdminFilters();
});

beforeEach(() => {
  resetButton().click();
  seedFetch(RECORDS);
});

async function render() {
  await window.loadRegistrations();
}

describe('Request Management status filter', () => {
  test('the Status control offers All Status, Pending, Approved and Rejected', () => {
    const select = statusSelect();
    expect(select).not.toBeNull();
    expect(document.getElementById('registrationsFilterContainer').dataset.module).toBe('registrations');
    expect(Array.from(select.options).map(o => o.value)).toEqual(['', 'pending', 'approved', 'rejected']);
    expect(Array.from(select.options).map(o => o.textContent)).toEqual(['All Status', 'Pending', 'Approved', 'Rejected']);
  });

  test('each status option renders only its own records', async () => {
    await render();
    setSelect('Status', '');
    expect(allRenderedIds().slice().sort()).toEqual(['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7']);

    setSelect('Status', 'pending');
    expect(allRenderedIds().slice().sort()).toEqual(PENDING_IDS);

    setSelect('Status', 'approved');
    expect(allRenderedIds().slice().sort()).toEqual(APPROVED_IDS);

    setSelect('Status', 'rejected');
    expect(allRenderedIds().slice().sort()).toEqual(REJECTED_IDS);
  });

  test('records land in the table matching their own status', async () => {
    await render();
    setSelect('Status', '');
    expect(idsIn('pending').slice().sort()).toEqual(PENDING_IDS);
    expect(idsIn('approved').slice().sort()).toEqual(APPROVED_IDS);
    expect(idsIn('rejected').slice().sort()).toEqual(REJECTED_IDS);
  });

  test('All Status renders each record exactly once', async () => {
    await render();
    setSelect('Status', '');
    const ids = allRenderedIds();
    expect(ids).toHaveLength(RECORDS.length);
    expect(new Set(ids).size).toBe(RECORDS.length);
    Object.keys(TABLES).forEach(status => {
      expect(new Set(idsIn(status)).size).toBe(idsIn(status).length);
    });
  });

  test('every rendered badge matches the table it sits in', async () => {
    await render();
    ['pending', 'approved', 'rejected'].forEach(status => {
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      badgeIn(status).forEach(badge => expect(badge).toBe(label));
    });
  });

  test('switching repeatedly leaves no stale record', async () => {
    await render();
    ['', 'pending', 'approved', 'rejected', '', 'pending'].forEach(value => {
      setSelect('Status', value);
      const expected = value === '' ? allIds() : expectedFor(value);
      expect(allRenderedIds().slice().sort()).toEqual(expected);
      if (value) allBadges().forEach(badge => expect(badge).toBe(cap(value)));
    });
  });

  test('the active-status value is bucketed and badged as Pending', async () => {
    await render();
    setSelect('Status', 'pending');
    expect(idsIn('pending')).toContain('R4');
    const row = rowsIn(TABLES.pending).find(r => r.cells[0].textContent === 'R4');
    expect(row.cells[5].textContent).toBe('Pending');

    setSelect('Status', 'approved');
    expect(allRenderedIds()).not.toContain('R4');
  });

  test('stored status is matched case-insensitively, as the badge matches it', async () => {
    await render();
    setSelect('Status', 'approved');
    // R5 stores 'Approved' and R7 stores 'APPROVED'.
    expect(idsIn('approved').slice().sort()).toEqual(APPROVED_IDS);
    badgeIn('approved').forEach(badge => expect(badge).toBe('Approved'));
  });

  test('a whitespace-padded status is treated exactly as the badge treats it', async () => {
    await render();
    // R6 stores ' approved '. normalizeRegistrationStatusForDisplay lowercases but
    // does not trim, so it falls through to pending, and the badge says Pending.
    // The filter must agree with the badge rather than second-guess it.
    setSelect('Status', 'approved');
    expect(allRenderedIds()).not.toContain('R6');
    setSelect('Status', 'pending');
    expect(idsIn('pending')).toContain('R6');
    const row = rowsIn(TABLES.pending).find(r => r.cells[0].textContent === 'R6');
    expect(row.cells[5].textContent).toBe('Pending');
  });

  test('status composes with course, year level and student type', async () => {
    await render();
    setSelect('Status', 'approved');
    setSelect('Course', 'BSIT');
    expect(allRenderedIds().slice().sort()).toEqual(['R2', 'R5', 'R7']);

    resetButton().click();
    setSelect('Status', 'rejected');
    setSelect('Year Level', '4th Year');
    expect(allRenderedIds()).toEqual([]);

    resetButton().click();
    setSelect('Status', 'pending');
    setSelect('Student Type', 'Irregular');
    expect(allRenderedIds().slice().sort()).toEqual(['R4']);
  });

  test('status composes with a custom date range', async () => {
    await render();
    setSelect('Status', 'approved');
    setDatePreset('custom');
    setDateInput('Date from', '2026-08-01');
    setDateInput('Date to', '2026-08-02');
    // R5 is dated June and is correctly excluded by the range.
    expect(allRenderedIds().slice().sort()).toEqual(['R2', 'R7']);
  });

  test('status composes with search', async () => {
    await render();
    setSelect('Status', 'pending');
    setSearch('Reyes');
    expect(allRenderedIds()).toEqual(['R1']);
  });

  test('a search match never pulls in another status', async () => {
    await render();
    setSelect('Status', 'pending');
    setSearch('Ito'); // R7 is APPROVED
    expect(allRenderedIds()).toEqual([]);
  });

  test('sorting does not change status membership', async () => {
    await render();
    setSelect('Status', 'approved');
    const before = allRenderedIds().slice().sort();
    setSelect('Sort', 'name');
    expect(allRenderedIds().slice().sort()).toEqual(before);
  });

  test('the CSV produced by Export contains only the selected status', async () => {
    await render();
    setSelect('Status', 'approved');
    const csv = await captureExportCsv();
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Student ID,Student Name,Course,Year Level,Status,Date');
    expect(lines.slice(1).map(line => line.split(',')[0]).sort()).toEqual(APPROVED_IDS);
    // The export column reads the raw stored status, so it keeps the source casing.
    lines.slice(1).forEach(line => expect(line.split(',')[4]).toMatch(/^approved$/i));
  });

  test('Reset Filters returns the status to All Status with each record once', async () => {
    await render();
    setSelect('Status', 'rejected');
    setSelect('Course', 'BSED');
    setSearch('Cara');
    resetButton().click();
    expect(statusSelect().value).toBe('');
    expect(otherSelect('Course').value).toBe('');
    expect(searchInput().value).toBe('');
    const ids = allRenderedIds();
    expect(ids).toHaveLength(RECORDS.length);
    expect(new Set(ids).size).toBe(RECORDS.length);
  });

  test('an empty result shows the existing empty state, not another status', async () => {
    await render();
    setSelect('Status', 'rejected');
    setSelect('Year Level', '4th Year'); // the only rejected record is 3rd Year
    expect(allRenderedIds()).toEqual([]);
    expect(emptyStateText('rejected')).toBe(EMPTY_STATES.rejected);
    // Status narrows in the pipeline, so the other two tables are legitimately empty
    // too. What must never happen is the rejected table borrowing their records.
    expect(emptyStateText('pending')).toBe(EMPTY_STATES.pending);
    expect(emptyStateText('approved')).toBe(EMPTY_STATES.approved);
  });

  test('a populated table beside an empty one keeps only its own records', async () => {
    await render();
    setSelect('Status', '');
    setSelect('Year Level', '3rd Year');
    expect(idsIn('pending').slice().sort()).toEqual(['R4']);
    expect(idsIn('approved')).toEqual([]);
    expect(idsIn('rejected').slice().sort()).toEqual(['R3']);
    expect(emptyStateText('approved')).toBe(EMPTY_STATES.approved);
  });

  test('changing the status issues no further request', async () => {
    await render();
    const afterLoad = fetchCalls;
    setSelect('Status', 'pending');
    setSelect('Status', 'approved');
    setSelect('Status', '');
    expect(fetchCalls).toBe(afterLoad);
  });

  test('the toolbar and status sections are structurally unchanged', async () => {
    await render();
    setSelect('Status', 'pending');
    const toolbar = document.querySelector('#registrationsFilterContainer .filter-toolbar__row--main');
    // 9 direct children: four selects, the date-range group, Sort, Search and the
    // two buttons. The date field used to be rendered a second time as an empty
    // plain select; SmartFilter now leaves preset fields out of `mainFields`.
    expect(toolbar.children.length).toBe(9);
    expect(Array.from(toolbar.children).filter(el => el.tagName === 'BUTTON').map(b => b.textContent))
      .toEqual(['Reset Filters', 'Export']);
    expect(document.querySelector('#registrationsFilterContainer select[aria-label="Sort"]')).not.toBeNull();

    ['registrationsPending', 'registrationsApproved', 'registrationsRejected'].forEach(id => {
      expect(document.getElementById(id)).not.toBeNull();
    });
    // 7 columns: student number, name, course, module, date, status, actions.
    setSelect('Status', 'pending');
    rowsIn(TABLES.pending).forEach(row => expect(row.cells).toHaveLength(7));
    setSelect('Status', 'rejected');
    rowsIn(TABLES.rejected).forEach(row => expect(row.cells).toHaveLength(7));
    expect(EMPTY_STATES.rejected).toBe('No rejected registrations match the current filters.');
  });

  test('section visibility still follows the selected status', async () => {
    await render();
    setSelect('Status', 'approved');
    expect(isSectionHidden('approved')).toBe(false);
    expect(isSectionHidden('pending')).toBe(true);
    expect(isSectionHidden('rejected')).toBe(true);

    setSelect('Status', '');
    ['pending', 'approved', 'rejected'].forEach(status => {
      expect(isSectionHidden(status)).toBe(false);
    });
  });
});
