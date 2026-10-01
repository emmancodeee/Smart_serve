function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

function hasConflict(startTime, endTime, existingSchedules) {
  return existingSchedules.some(item => {
    const existingStart = new Date(item.startTime);
    const existingEnd = new Date(item.endTime);
    return overlaps(startTime, endTime, existingStart, existingEnd);
  });
}

function normalizePickupDate(pickupDate) {
  if (!pickupDate) return null;
  const parsed = new Date(pickupDate);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function toIsoDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function getMinimumPickupDate(pickupDate) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const explicit = normalizePickupDate(pickupDate);
  if (explicit) {
    explicit.setHours(0, 0, 0, 0);
    // Never schedule in the past.
    return explicit < tomorrow ? tomorrow : explicit;
  }

  return tomorrow;
}

const PICKUP_OPEN_HOUR = 7; // 07:00
const PICKUP_CLOSE_HOUR = 18; // 18:00 (latest 1-hour slot starts at 17:00)
const ALLOWED_PICKUP_HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const PICKUP_TIMEZONE = 'Asia/Manila';
const PICKUP_TIMEZONE_UTC_OFFSET_HOURS = 8;
const MAX_PICKUP_DAYS_AHEAD = 7;
const MAX_SLOT_SCAN_DAYS = 30;
const DEFAULT_MAX_PICKUPS_PER_DAY = 100;
const OPENAI_TIMEOUT_MS = 12000;
const OPENAI_RETRY_DELAY_MS = 1200;
const OPENAI_BACKOFF_MS = 30 * 60 * 1000;
const HOLIDAY_LOOKUP_TIMEOUT_MS = 6000;
const HOLIDAY_CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const PH_COUNTRY_CODE = 'PH';
let openAiBackoffUntil = 0;
const philippineHolidayCache = new Map();

function isOpenRouterModel(model) {
  return /^[^/\s]+\/[^/\s]+$/.test(String(model || '').trim());
}

function extractTextFromOpenRouterMessage(message) {
  if (!message) return '';
  if (typeof message.content === 'string') return message.content;
  if (!Array.isArray(message.content)) return '';

  return message.content
    .map(item => {
      if (typeof item === 'string') return item;
      if (item?.type === 'text') return item.text || '';
      return '';
    })
    .join('')
    .trim();
}

function parseHolidayOverrides() {
  const raw = String(process.env.PH_HOLIDAY_OVERRIDES || '').trim();
  if (!raw) return {};

  return raw
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const [datePart, ...nameParts] = entry.split(':');
      const date = String(datePart || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return acc;
      acc[date] = nameParts.join(':').trim() || 'Philippine holiday';
      return acc;
    }, {});
}

async function fetchPhilippineHolidaysForYear(year) {
  const numericYear = Number(year);
  if (!Number.isInteger(numericYear)) return {};

  const cached = philippineHolidayCache.get(numericYear);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const fallbackData = Object.entries(parseHolidayOverrides())
    .filter(([date]) => Number(date.slice(0, 4)) === numericYear)
    .reduce((acc, [date, name]) => {
      acc[date] = name;
      return acc;
    }, {});

  if (typeof fetch !== 'function') {
    return fallbackData;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HOLIDAY_LOOKUP_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://date.nager.at/api/v3/publicholidays/${numericYear}/${PH_COUNTRY_CODE}`,
      {
        method: 'GET',
        signal: controller.signal
      }
    );

    if (!response.ok) {
      return fallbackData;
    }

    const payload = await response.json();
    const data = Array.isArray(payload)
      ? payload.reduce((acc, item) => {
          const date = String(item?.date || '').trim();
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return acc;
          acc[date] = String(item?.localName || item?.name || 'Philippine holiday').trim();
          return acc;
        }, { ...fallbackData })
      : fallbackData;

    philippineHolidayCache.set(numericYear, {
      data,
      expiresAt: Date.now() + HOLIDAY_CACHE_TTL_MS
    });

    return data;
  } catch (_) {
    return fallbackData;
  } finally {
    clearTimeout(timeout);
  }
}

async function getPhilippineHolidayMapBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return {};

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  const holidayMaps = await Promise.all(
    Array.from({ length: (endYear - startYear) + 1 }, (_, index) => fetchPhilippineHolidaysForYear(startYear + index))
  );

  return holidayMaps.reduce((acc, map) => ({ ...acc, ...map }), {});
}

async function getPhilippineHolidayForDate(date) {
  const key = toLocalDateKey(date);
  if (!key) return '';

  const holidays = await fetchPhilippineHolidaysForYear(Number(key.slice(0, 4)));
  return String(holidays[key] || '').trim();
}

async function isPhilippineHoliday(date) {
  return Boolean(await getPhilippineHolidayForDate(date));
}

function formatBlockedHolidayLines(holidayMap, minDate, maxDate) {
  const startKey = toLocalDateKey(minDate);
  const endKey = toLocalDateKey(maxDate);
  if (!startKey || !endKey) return [];

  return Object.entries(holidayMap)
    .filter(([date]) => date >= startKey && date <= endKey)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, name]) => `${date} - ${name}`);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toLocalDateKey(value) {
  const parts = getDatePartsInPickupTimezone(value);
  if (!parts) return '';
  const y = String(parts.year);
  const m = String(parts.month).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDatePartsInPickupTimezone(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: PICKUP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = fmt.formatToParts(date);
  const year = Number(parts.find(p => p.type === 'year')?.value);
  const month = Number(parts.find(p => p.type === 'month')?.value);
  const day = Number(parts.find(p => p.type === 'day')?.value);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return { year, month, day };
}

function buildDateInPickupTimezone(dayDate, hour, minute = 0) {
  const parts = getDatePartsInPickupTimezone(dayDate);
  if (!parts) return null;
  const utcHour = hour - PICKUP_TIMEZONE_UTC_OFFSET_HOURS;
  const utcMs = Date.UTC(parts.year, parts.month - 1, parts.day, utcHour, minute, 0, 0);
  return new Date(utcMs);
}

function isWeekday(date) {
  const parts = getDatePartsInPickupTimezone(date);
  if (!parts) return false;
  const day = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return day >= 1 && day <= 5;
}

function buildSlotAt(date, hour) {
  const startTime = buildDateInPickupTimezone(date, hour, 0);
  if (!startTime) return null;
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  return { startTime, endTime };
}

async function findFirstAvailableSlot(minDate, existingSchedules) {
  const base = startOfDay(minDate);
  for (let dayOffset = 0; dayOffset < MAX_SLOT_SCAN_DAYS; dayOffset += 1) {
    const day = new Date(base);
    day.setDate(base.getDate() + dayOffset);
    if (!isWeekday(day)) continue;
    if (await isPhilippineHoliday(day)) continue;

    for (const hour of ALLOWED_PICKUP_HOURS) {
      const slot = buildSlotAt(day, hour);
      if (!slot) continue;
      if (!hasConflict(slot.startTime, slot.endTime, existingSchedules)) {
        return slot;
      }
    }
  }
  return null;
}

async function pickDeterministicBaselineSlot(pickupDate, existingSchedules) {
  const minDate = getMinimumPickupDate(pickupDate);
  return findFirstAvailableSlot(minDate, existingSchedules);
}

async function nextBusinessDay(date) {
  const d = startOfDay(date);
  while (!isWeekday(d) || await isPhilippineHoliday(d)) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

async function resolveCapacityDate(preferredDate, dailyLoadMap, maxPickupsPerDay) {
  const map = dailyLoadMap || {};
  const cap = Number.isFinite(Number(maxPickupsPerDay))
    ? Number(maxPickupsPerDay)
    : DEFAULT_MAX_PICKUPS_PER_DAY;

  let day = await nextBusinessDay(preferredDate);
  for (let i = 0; i < 366; i += 1) {
    const key = toLocalDateKey(day);
    const count = Number(map[key] || 0);
    if (count < cap) {
      return { date: new Date(day), key, count };
    }

    day.setDate(day.getDate() + 1);
    day = await nextBusinessDay(day);
  }

  return null;
}

function buildCapacityTimedSlot(dayDate, takenCount, maxPickupsPerDay) {
  const cap = Number.isFinite(Number(maxPickupsPerDay))
    ? Number(maxPickupsPerDay)
    : DEFAULT_MAX_PICKUPS_PER_DAY;
  const safeIndex = Math.max(0, Math.min(cap - 1, Number(takenCount) || 0));

  const openingMinutes = PICKUP_OPEN_HOUR * 60;
  const totalMinutes = (PICKUP_CLOSE_HOUR - PICKUP_OPEN_HOUR - 1) * 60; // start range 07:00-16:59
  const step = Math.max(1, Math.floor(totalMinutes / cap));
  const minuteOfDay = openingMinutes + (safeIndex * step);
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;

  const startTime = buildDateInPickupTimezone(dayDate, hour, minute);
  if (!startTime) return null;
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  return { startTime, endTime };
}

async function findConflictFreeCapacitySlot(preferredDate, dailyLoadMap, existingSchedules, maxPickupsPerDay) {
  const map = { ...(dailyLoadMap || {}) };
  const cap = Number.isFinite(Number(maxPickupsPerDay))
    ? Number(maxPickupsPerDay)
    : DEFAULT_MAX_PICKUPS_PER_DAY;

  let searchDate = new Date(preferredDate);
  for (let i = 0; i < 366; i += 1) {
    const capacityDate = await resolveCapacityDate(searchDate, map, cap);
    if (!capacityDate) return null;

    const candidateSlot = buildCapacityTimedSlot(
      capacityDate.date,
      capacityDate.count,
      cap
    );
    if (!candidateSlot) return null;

    const conflictFree = applyConflictAvoidance(
      candidateSlot.startTime,
      candidateSlot.endTime,
      [...existingSchedules]
    );

    if (conflictFree) {
      return conflictFree;
    }

    map[capacityDate.key] = Number(capacityDate.count || 0) + 1;
    searchDate = new Date(capacityDate.date);
    searchDate.setDate(searchDate.getDate() + 1);
  }

  return null;
}

function applyConflictAvoidance(startTime, endTime, existingSchedules) {
  let nextStart = new Date(startTime);
  let nextEnd = new Date(endTime);

  let tries = 0;
  while (hasConflict(nextStart, nextEnd, existingSchedules) && tries < 8) {
    nextStart = new Date(nextStart.getTime() + 60 * 60 * 1000);
    nextEnd = new Date(nextEnd.getTime() + 60 * 60 * 1000);
    tries += 1;
  }

  if (hasConflict(nextStart, nextEnd, existingSchedules)) {
    return null;
  }

  return { startTime: nextStart, endTime: nextEnd };
}

async function parseAiPickupSlot(content, fallbackDate) {
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    const datePart = String(parsed?.date || '').trim();
    const timePart = String(parsed?.time || '10:00').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
    if (!/^\d{2}:\d{2}$/.test(timePart)) return null;

    const [hourStr, minuteStr] = timePart.split(':');
    const parsedHour = Number(hourStr);
    const minute = Number(minuteStr);
    const candidateStart = buildDateInPickupTimezone(
      `${datePart}T00:00:00`,
      parsedHour,
      minute
    );
    if (!candidateStart) return null;
    if (Number.isNaN(candidateStart.getTime())) return null;

    const safeMinDate = getMinimumPickupDate(fallbackDate);
    safeMinDate.setHours(0, 0, 0, 0);
    candidateStart.setSeconds(0, 0);

    if (candidateStart < safeMinDate) {
      return null;
    }

    const latestAllowed = endOfDay(new Date(safeMinDate.getTime() + MAX_PICKUP_DAYS_AHEAD * 24 * 60 * 60 * 1000));
    if (candidateStart > latestAllowed) {
      return null;
    }

    if (!isWeekday(candidateStart)) {
      return null;
    }

    if (await isPhilippineHoliday(candidateStart)) {
      return null;
    }

    const hour = candidateStart.getHours();
    if (!ALLOWED_PICKUP_HOURS.includes(hour) || candidateStart.getMinutes() !== 0) {
      return null;
    }

    const reason = String(parsed?.reason || '').trim().replace(/\s+/g, ' ').slice(0, 280);

    return {
      startTime: candidateStart,
      endTime: new Date(candidateStart.getTime() + 60 * 60 * 1000),
      reason
    };
  } catch (_) {
    return null;
  }
}

async function suggestPickupSlotWithAI({
  moduleName,
  userName,
  pickupDate
}) {
  if (Date.now() < openAiBackoffUntil) {
    return null;
  }

  const model = String(process.env.OPENAI_SCHEDULER_MODEL || 'gpt-4o-mini').trim();
  const useOpenRouter = isOpenRouterModel(model);
  const apiKey = String(
    (useOpenRouter ? process.env.OPENROUTER_API_KEY : '') ||
    process.env.OPENAI_API_KEY ||
    ''
  ).trim();
  if (!apiKey || apiKey === 'supersecretkey123') {
    return null;
  }

  if (typeof fetch !== 'function') {
    return null;
  }

  const minPickupDate = getMinimumPickupDate(pickupDate);
  const minPickupDay = toIsoDate(minPickupDate);
  const latestPickupDate = new Date(minPickupDate.getTime() + MAX_PICKUP_DAYS_AHEAD * 24 * 60 * 60 * 1000);
  const cleanModule = String(moduleName || '').trim() || 'General Module';
  const cleanUser = String(userName || '').trim() || 'Student';
  const holidayMap = await getPhilippineHolidayMapBetween(minPickupDate, latestPickupDate);
  const blockedHolidayLines = formatBlockedHolidayLines(
    holidayMap,
    minPickupDate,
    latestPickupDate
  );

  const prompt = [
    'You are the PHINMA pickup scheduler AI.',
    'Your task is to auto-generate exactly one pickup schedule for a student.',
    'High-priority rules you must never break:',
    '1. Never schedule on Saturdays, Sundays, or Philippine public holidays.',
    '2. If the earliest possible day is a holiday, move forward to the next valid weekday that is not a holiday.',
    '3. Return only one exact 1-hour pickup slot.',
    '4. Prefer the earliest valid slot unless another nearby valid slot is clearly better.',
    `Student: ${cleanUser}`,
    `Module: ${cleanModule}`,
    `Earliest pickup day: ${minPickupDay}`,
    `Pickup must be within ${MAX_PICKUP_DAYS_AHEAD} days from earliest pickup day.`,
    `Pickup must be weekday only (Monday-Friday), exact 1-hour slot at one of: ${ALLOWED_PICKUP_HOURS.map(h => `${String(h).padStart(2, '0')}:00`).join(', ')}.`,
    blockedHolidayLines.length
      ? `Blocked Philippine holidays in the allowed window:\n${blockedHolidayLines.join('\n')}`
      : 'Blocked Philippine holidays in the allowed window: none found.',
    'Return JSON only with keys: date (YYYY-MM-DD), time (HH:mm), reason.'
  ].join('\n');

  const callOpenAI = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
    try {
      const requestUrl = useOpenRouter
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/responses';
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      };

      if (useOpenRouter) {
        const siteUrl = String(process.env.OPENROUTER_SITE_URL || process.env.APP_URL || '').trim();
        const siteName = String(process.env.OPENROUTER_SITE_NAME || 'PhinmaServe Scheduler').trim();
        if (siteUrl) headers['HTTP-Referer'] = siteUrl;
        if (siteName) headers['X-Title'] = siteName;
      }

      const body = useOpenRouter
        ? {
            model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0,
            reasoning: { enabled: true }
          }
        : {
            model,
            input: prompt,
            temperature: 0
          };

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    let response = await callOpenAI();
    if (response.status === 429) {
      // One short retry for transient throttling.
      await new Promise(resolve => setTimeout(resolve, OPENAI_RETRY_DELAY_MS));
      response = await callOpenAI();
    }

    if (response.status === 429) {
      openAiBackoffUntil = Date.now() + OPENAI_BACKOFF_MS;
      return null;
    }

    if (!response.ok) return null;
    const data = await response.json();
    const content = useOpenRouter
      ? extractTextFromOpenRouterMessage(data?.choices?.[0]?.message)
      : (
          data?.output_text ||
          data?.output?.[0]?.content?.[0]?.text ||
          ''
        );

    return parseAiPickupSlot(content, pickupDate);
  } catch (_) {
    return null;
  }
}

function buildPickupEvent({
  userId,
  moduleName,
  userName,
  startTime,
  endTime,
  source = 'approval_auto_plan',
  description = '',
  aiReason = '',
  rescheduleConfirmationStatus = null,
  originalMissedScheduleId = null
}) {
  const cleanModule = String(moduleName || '').trim() || 'General Module';
  const cleanUser = String(userName || '').trim() || 'Student';
  const normalizedAiReason = String(aiReason || '').trim().replace(/\s+/g, ' ').slice(0, 280);
  const defaultDescription = normalizedAiReason
    ? `Scheduled pickup window for ${cleanUser} to collect school necessities. AI recommendation: ${normalizedAiReason}`
    : `Scheduled pickup window for ${cleanUser} to collect school necessities.`;

  return {
    userId,
    title: `${cleanModule} - School Necessities Pickup`,
    type: 'AI Plan',
    description: description || defaultDescription,
    startTime,
    endTime,
    location: 'School Supplies Office',
    module: cleanModule,
    instructor: '',
    priority: 'High',
    status: 'Planned',
    reminders: [60, 15],
    color: '#8e44ad',
    isRecurring: false,
    recurrencePattern: null,
    recurrenceEnd: null,
    isAutoGenerated: true,
    source,
    rescheduleConfirmationStatus,
    originalMissedScheduleId
  };
}

async function buildAutoScheduleForApprovedRegistration({
  userId,
  moduleName,
  userName,
  pickupDate,
  existingSchedules = [],
  dailyLoadMap = {},
  maxPickupsPerDay = DEFAULT_MAX_PICKUPS_PER_DAY
}) {
  const baseline = await pickDeterministicBaselineSlot(pickupDate, [...existingSchedules]);
  const aiSuggestion = await suggestPickupSlotWithAI({
    moduleName,
    userName,
    pickupDate
  });

  const minDate = getMinimumPickupDate(pickupDate);
  const aiDate = aiSuggestion?.startTime || null;
  const aiMaxDate = new Date(minDate);
  aiMaxDate.setDate(aiMaxDate.getDate() + MAX_PICKUP_DAYS_AHEAD);
  const preferredDate =
    aiDate && aiDate >= minDate && aiDate <= aiMaxDate
      ? aiDate
      : (baseline?.startTime || minDate);

  const conflictFree = await findConflictFreeCapacitySlot(
    preferredDate,
    dailyLoadMap,
    existingSchedules,
    maxPickupsPerDay
  );
  if (!conflictFree) {
    return {
      events: [],
      engine: 'capacity',
      model: null
    };
  }

  const event = conflictFree
    ? buildPickupEvent({
        userId,
        moduleName,
        userName,
        startTime: conflictFree.startTime,
        endTime: conflictFree.endTime,
        aiReason: aiSuggestion?.reason || '',
        rescheduleConfirmationStatus: 'Pending'
      })
    : null;

  const decisionReason = String(
    aiSuggestion?.reason ||
    (event
      ? 'System assigned the earliest conflict-free pickup slot that met the schedule rules.'
      : '')
  ).trim();

  return {
    events: event ? [event] : [],
    engine: aiSuggestion ? 'openai-holiday-capacity' : 'holiday-capacity',
    model: aiSuggestion ? String(process.env.OPENAI_SCHEDULER_MODEL || 'gpt-4o-mini').trim() : null,
    decisionSource: aiSuggestion ? 'ai' : 'capacity',
    decisionReason,
    generatedSchedule: event
      ? {
          title: event.title,
          module: event.module,
          location: event.location,
          priority: event.priority,
          startTime: event.startTime,
          endTime: event.endTime,
          description: event.description,
          decisionSource: aiSuggestion ? 'ai' : 'capacity',
          decisionReason
        }
      : null
  };
}

function getNextDay(date) {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
}

function countDailyLoadsFromSchedules(schedules) {
  const map = {};
  (schedules || []).forEach(item => {
    const key = toLocalDateKey(item?.startTime);
    if (!key) return;
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}

async function buildNoShowReschedule({
  userId,
  moduleName,
  userName,
  missedStartTime,
  missedScheduleId = null,
  existingSchedules = [],
  dailyLoadMap = {},
  maxPickupsPerDay = DEFAULT_MAX_PICKUPS_PER_DAY
}) {
  const preferredDate = getMinimumPickupDate(getNextDay(missedStartTime || new Date()));
  const capacityDate = await resolveCapacityDate(preferredDate, dailyLoadMap, maxPickupsPerDay);
  if (!capacityDate) return null;

  const candidateSlot = buildCapacityTimedSlot(
    capacityDate.date,
    capacityDate.count,
    maxPickupsPerDay
  );
  if (!candidateSlot) return null;
  const conflictFree = applyConflictAvoidance(
    candidateSlot.startTime,
    candidateSlot.endTime,
    [...existingSchedules]
  );
  if (!conflictFree) return null;

  return buildPickupEvent({
    userId,
    moduleName,
    userName,
    startTime: conflictFree.startTime,
    endTime: conflictFree.endTime,
    source: 'no_show_reschedule',
    description: `Auto-rescheduled after no-show. New pickup window for ${String(userName || 'Student').trim() || 'Student'}.`,
    rescheduleConfirmationStatus: 'Pending',
    originalMissedScheduleId: missedScheduleId
  });
}

module.exports = {
  buildAutoScheduleForApprovedRegistration,
  buildNoShowReschedule,
  countDailyLoadsFromSchedules
};
