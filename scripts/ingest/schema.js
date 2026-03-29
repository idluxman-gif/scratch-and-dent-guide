/**
 * Data quality standards for store listings ingestion.
 *
 * Canonical store object shape (what gets written to stores.js):
 *   { n, c, s, a, p, w, r, v, pr, i, h? }
 *
 * n  - name         (string, required)
 * c  - city         (string, required)
 * s  - state        (string, 2-char US state code, required)
 * a  - address      (string, required - full street address)
 * p  - phone        (string, E.164 format preferred, optional)
 * w  - website      (string, URL, optional)
 * r  - rating       (number 0-5, 1 decimal, optional)
 * v  - reviewCount  (integer >= 0, optional)
 * pr - priceTier    ('$' | '$$' | '$$$', optional)
 * i  - index        (integer, auto-assigned during merge, do not set)
 * h  - hours        (array[7] of strings Mon-Sun, e.g. "9AM-6PM" | "Closed", optional)
 */

// ── Required fields for a record to be accepted ──────────────────────────────
const REQUIRED_FIELDS = ['name', 'city', 'state', 'address'];

// ── Quality thresholds ────────────────────────────────────────────────────────
const QUALITY = {
  minReviews: 1,
  minRating: 0,
  minNameLength: 3,
  usStatesOnly: true,
};

// ── Valid US state codes ───────────────────────────────────────────────────────
const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
]);

// ── Hours format ──────────────────────────────────────────────────────────────
// Array of 7 strings, index 0=Monday … 6=Sunday
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

module.exports = { REQUIRED_FIELDS, QUALITY, US_STATES, DAYS };
