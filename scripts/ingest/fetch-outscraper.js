/**
 * Outscraper API client for Google Maps business data.
 * Docs: https://outscraper.com/google-maps-scraper/
 *
 * Requires OUTSCRAPER_API_KEY in env or .env.local.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local if present
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const OUTSCRAPER_BASE = 'https://api.app.outscraper.com';
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 60;

const ALL_US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

/**
 * Fetch store listings from Outscraper.
 *
 * @param {object} options
 * @param {string} options.query   - Search query
 * @param {string} [options.state] - Single state code (omit = all states)
 * @param {number} [options.limit] - Max results per state query
 */
async function fetchOutscraper({ query, state, limit = 200 }) {
  const apiKey = process.env.OUTSCRAPER_API_KEY;
  if (!apiKey) {
    throw new Error('OUTSCRAPER_API_KEY not set. Add it to .env.local or environment.');
  }

  const states = state ? [state.toUpperCase()] : ALL_US_STATES;
  const allResults = [];

  for (const stateCode of states) {
    const fullQuery = `${query} ${stateCode}`;
    console.log(`  Fetching: ${fullQuery}`);

    try {
      const rows = await runSearch(apiKey, fullQuery, limit);
      console.log(`    → ${rows.length} results`);
      allResults.push(...rows);
      if (states.length > 1) await sleep(500);
    } catch (err) {
      console.error(`    [error] ${stateCode}: ${err.message}`);
    }
  }

  return allResults;
}

async function runSearch(apiKey, query, limit) {
  const qs = new URLSearchParams({
    query,
    limit: String(limit),
    language: 'en',
    region: 'us',
    dropDuplicates: 'true',
  });

  const data = await httpsGet(`${OUTSCRAPER_BASE}/maps/search-v3?${qs}`, {
    'X-API-KEY': apiKey,
  });

  if (data.data && Array.isArray(data.data)) {
    return data.data.flat();
  }

  const taskId = data.id;
  if (!taskId) throw new Error(`Unexpected Outscraper response: ${JSON.stringify(data).slice(0, 200)}`);

  return pollTask(apiKey, taskId);
}

async function pollTask(apiKey, taskId) {
  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_INTERVAL_MS);
    const data = await httpsGet(`${OUTSCRAPER_BASE}/requests/${taskId}`, { 'X-API-KEY': apiKey });

    if (data.status === 'Success' || data.status === 'Finished') {
      return data.data ? data.data.flat() : [];
    }
    if (data.status === 'Failed' || data.status === 'Rejected') {
      throw new Error(`Task ${taskId} failed: ${data.status}`);
    }
    process.stdout.write('.');
  }
  throw new Error(`Task ${taskId} timed out`);
}

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: { 'Accept': 'application/json', ...headers },
    };
    https.get(url, opts, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
          return;
        }
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`JSON parse error: ${body.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

module.exports = { fetchOutscraper };
