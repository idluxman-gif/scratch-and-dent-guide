/**
 * Normalization utilities for raw store data.
 */

const { DAYS } = require('./schema');

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ');
}

function dedupKey(name, city, state) {
  return `${normalizeName(name)}|${(city || '').toLowerCase().trim()}|${(state || '').toUpperCase().trim()}`;
}

function normalizePhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1 ${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 ${digits.slice(1,4)}-${digits.slice(4,7)}-${digits.slice(7)}`;
  }
  return phone.trim();
}

function phoneDigits(phone) {
  return (phone || '').replace(/\D/g, '');
}

function normalizeRating(raw) {
  if (raw === null || raw === undefined || raw === '' || raw === 'None') return 0;
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : Math.round(n * 10) / 10;
}

function normalizeReviews(raw) {
  if (raw === null || raw === undefined || raw === '' || raw === 'None') return 0;
  const n = parseInt(raw, 10);
  return isNaN(n) ? 0 : n;
}

const BUDGET_KEYWORDS = [
  'discount','budget','bargain','liquidat','outlet','warehouse','clearance',
  'scratch','dent','4 less','4less','for less','surplus','salvage','overstock',
];
const PREMIUM_KEYWORDS = ['premium','luxury','designer','high end','high-end'];

function priceTier(name) {
  const nl = (name || '').toLowerCase();
  if (PREMIUM_KEYWORDS.some(k => nl.includes(k))) return '$$$';
  if (BUDGET_KEYWORDS.some(k => nl.includes(k))) return '$';
  return '$$';
}

/**
 * Parse Outscraper working_hours into a 7-element array [Mon…Sun].
 * Returns null if hours are unavailable or unparseable.
 */
function normalizeHours(raw) {
  if (!raw || raw === 'None' || raw === '') return null;

  let hoursObj = null;

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    hoursObj = raw;
  } else if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{')) {
      try { hoursObj = JSON.parse(trimmed); } catch (e) { return null; }
    } else if (trimmed.includes(':')) {
      hoursObj = {};
      for (const part of trimmed.split('|')) {
        const colonIdx = part.indexOf(':');
        if (colonIdx === -1) continue;
        const day = part.slice(0, colonIdx).trim();
        const hours = part.slice(colonIdx + 1).trim();
        hoursObj[day] = hours;
      }
    }
  }

  if (!hoursObj) return null;

  return DAYS.map(day => {
    const val = hoursObj[day] || hoursObj[day.slice(0,3)] || '';
    return formatHoursEntry(val);
  });
}

function formatHoursEntry(raw) {
  if (!raw || raw === 'None') return 'Closed';
  const s = raw.toString().trim();
  if (!s || s.toLowerCase() === 'closed') return 'Closed';
  return s.replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ');
}

function escapeJs(str) {
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

module.exports = {
  normalizeName, dedupKey, normalizePhone, phoneDigits,
  normalizeRating, normalizeReviews, priceTier, normalizeHours, escapeJs,
};
