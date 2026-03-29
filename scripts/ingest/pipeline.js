#!/usr/bin/env node
/**
 * Store data ingestion pipeline.
 *
 * Usage:
 *   node scripts/ingest/pipeline.js --input <file.csv>
 *   node scripts/ingest/pipeline.js --fetch --state TX
 *   node scripts/ingest/pipeline.js --fetch --query "scratch and dent appliance"
 *   node scripts/ingest/pipeline.js --input file.csv --dry-run
 *
 * Environment variables:
 *   OUTSCRAPER_API_KEY   - required for --fetch mode
 *   STORES_PATH          - override path to stores.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const { applyFilters } = require('./filters');
const {
  dedupKey, normalizePhone, phoneDigits,
  normalizeRating, normalizeReviews, priceTier, normalizeHours, escapeJs,
} = require('./normalize');
const { QUALITY, US_STATES } = require('./schema');

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

function argValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const projectRoot = path.resolve(__dirname, '../..');
const flags = {
  input:      argValue('--input'),
  fetch:      args.includes('--fetch'),
  state:      argValue('--state'),
  query:      argValue('--query'),
  dryRun:     args.includes('--dry-run'),
  storesPath: argValue('--stores') || process.env.STORES_PATH || path.resolve(projectRoot, 'src/data/stores.js'),
  limit:      parseInt(argValue('--limit') || '0', 10),
};

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCsv(content) {
  const lines = content.split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── Map Outscraper CSV row → normalized record ─────────────────────────────────

function mapOutscraperRow(row) {
  return {
    name:           row.name || row.title || '',
    city:           row.city || '',
    state:          (row.state_code || row.state || '').toUpperCase().trim(),
    address:        row.full_address || row.address || '',
    phone:          row.phone || row.phone_number || '',
    website:        row.website || row.site || '',
    rating:         row.rating || '',
    reviewCount:    row.reviews || row.reviews_count || '',
    subtypes:       row.subtypes || row.categories || '',
    category:       row.category || row.main_category || '',
    businessStatus: row.business_status || '',
    workingHours:   row.working_hours || row.hours || '',
  };
}

// ── Parse existing stores.js ──────────────────────────────────────────────────

function parseStoresJs(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  [warn] stores.js not found at ${filePath}, starting fresh`);
    return { stores: [], tail: '' };
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const arrayMatch = content.match(/export const stores = \[([\s\S]*?)\];/);
  if (!arrayMatch) throw new Error('Could not parse stores array in ' + filePath);

  const arrayContent = arrayMatch[1];
  const stores = [];
  const storePattern = /\{([^}]+)\}/g;
  let m;
  while ((m = storePattern.exec(arrayContent)) !== null) {
    const block = m[1];
    const store = {};
    const kvStr = /(\w+):'((?:[^'\\]|\\.)*)'/g;
    const kvNum = /(\w+):([\d.]+)/g;
    let kv;
    while ((kv = kvStr.exec(block)) !== null) {
      store[kv[1]] = kv[2].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    }
    while ((kv = kvNum.exec(block)) !== null) {
      if (!store[kv[1]]) {
        store[kv[1]] = kv[2].includes('.') ? parseFloat(kv[2]) : parseInt(kv[2], 10);
      }
    }
    if (store.n) stores.push(store);
  }

  const markerPos = content.indexOf('];\n');
  const tail = markerPos !== -1 ? content.slice(markerPos + 3) : '';

  return { stores, tail };
}

// ── Serialize store to JS line ─────────────────────────────────────────────────

function serializeStore(s) {
  const fields = [
    `n:'${escapeJs(s.n)}'`,
    `c:'${escapeJs(s.c)}'`,
    `s:'${escapeJs(s.s)}'`,
    `a:'${escapeJs(s.a)}'`,
    `p:'${escapeJs(s.p || '')}'`,
    `w:'${escapeJs(s.w || '')}'`,
    `r:${Number(s.r || 0).toFixed(1)}`,
    `v:${s.v || 0}`,
    `pr:'${s.pr || '$$'}'`,
    `i:${s.i}`,
  ];
  if (s.h && Array.isArray(s.h) && s.h.length === 7) {
    const hStr = s.h.map(d => escapeJs(d)).join("','");
    fields.push(`h:['${hStr}']`);
  }
  return `{${fields.join(',')}}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Store Ingestion Pipeline ===\n');

  // 1. Load raw rows
  let rawRows = [];

  if (flags.input) {
    console.log(`Reading CSV: ${flags.input}`);
    const content = fs.readFileSync(path.resolve(flags.input), 'utf-8');
    rawRows = parseCsv(content);
    console.log(`  Raw rows: ${rawRows.length}`);
  } else if (flags.fetch) {
    console.log('Fetching from Outscraper API...');
    const { fetchOutscraper } = require('./fetch-outscraper');
    rawRows = await fetchOutscraper({
      query: flags.query || 'scratch and dent appliance store',
      state: flags.state,
      limit: flags.limit || 200,
    });
    console.log(`  Fetched rows: ${rawRows.length}`);
  } else {
    console.error('Error: provide --input <file.csv> or --fetch');
    process.exit(1);
  }

  if (flags.limit > 0) rawRows = rawRows.slice(0, flags.limit);

  // 2. Load existing stores
  console.log(`\nLoading existing stores: ${flags.storesPath}`);
  const { stores: existingCompact, tail } = parseStoresJs(flags.storesPath);
  console.log(`  Existing stores: ${existingCompact.length}`);

  const existingKeys = new Set();
  const existingPhones = new Set();
  for (const s of existingCompact) {
    existingKeys.add(dedupKey(s.n, s.c, s.s));
    const ph = phoneDigits(s.p);
    if (ph.length >= 10) existingPhones.add(ph);
  }

  // 3. Process incoming rows
  const rejected = {};
  const accepted = [];
  const newKeys = new Set();
  const newPhones = new Set();

  function reject(reason, label) {
    if (!rejected[reason]) rejected[reason] = [];
    rejected[reason].push(label);
  }

  for (const raw of rawRows) {
    const rec = mapOutscraperRow(raw);
    const label = `${rec.name} (${rec.city}, ${rec.state})`;

    if (QUALITY.usStatesOnly && rec.state && !US_STATES.has(rec.state)) {
      reject('invalid_state', label); continue;
    }

    rec.reviewCount = normalizeReviews(rec.reviewCount);
    rec.rating = normalizeRating(rec.rating);

    const filterResult = applyFilters(rec);
    if (!filterResult.pass) {
      reject(filterResult.reason, label); continue;
    }

    if (rec.reviewCount < QUALITY.minReviews) {
      reject('below_min_reviews', label); continue;
    }

    const key = dedupKey(rec.name, rec.city, rec.state);
    if (existingKeys.has(key) || newKeys.has(key)) {
      reject('duplicate', label); continue;
    }

    const ph = phoneDigits(rec.phone);
    if (ph.length >= 10 && (existingPhones.has(ph) || newPhones.has(ph))) {
      reject('duplicate_phone', label); continue;
    }

    newKeys.add(key);
    if (ph.length >= 10) newPhones.add(ph);

    const store = {
      n:  rec.name,
      c:  rec.city,
      s:  rec.state,
      a:  rec.address,
      p:  normalizePhone(rec.phone),
      w:  rec.website,
      r:  rec.rating,
      v:  rec.reviewCount,
      pr: priceTier(rec.name),
    };

    const hours = normalizeHours(rec.workingHours);
    if (hours) store.h = hours;

    accepted.push(store);
  }

  // 4. Report
  console.log('\n=== Rejection Report ===');
  let totalRejected = 0;
  for (const [reason, items] of Object.entries(rejected)) {
    console.log(`  ${reason.toUpperCase()}: ${items.length}`);
    items.slice(0, 5).forEach(i => console.log(`    - ${i}`));
    if (items.length > 5) console.log(`    ... and ${items.length - 5} more`);
    totalRejected += items.length;
  }
  console.log(`\n  Total rejected: ${totalRejected}`);
  console.log(`  Total accepted: ${accepted.length}`);

  if (accepted.length === 0) {
    console.log('\nNo new stores to add. Exiting.');
    return;
  }

  // 5. Merge and sort
  const validExisting = existingCompact.filter(s => s.n && (s.v || 0) > 0);
  const merged = [...validExisting, ...accepted];
  merged.sort((a, b) => (b.v || 0) - (a.v || 0));
  merged.forEach((s, idx) => { s.i = idx + 1; });

  console.log(`\n=== Merge ===`);
  console.log(`  ${validExisting.length} existing + ${accepted.length} new = ${merged.length} total`);

  const allStates = new Set(merged.map(s => s.s));
  const prevStates = new Set(validExisting.map(s => s.s));
  const newStates = [...allStates].filter(s => !prevStates.has(s));
  console.log(`  States: ${allStates.size}${newStates.length ? ` (new: ${newStates.join(', ')})` : ''}`);

  if (flags.dryRun) {
    console.log('\n[dry-run] No changes written. Would add:');
    accepted.slice(0, 20).forEach(s => console.log(`  + ${s.n} — ${s.c}, ${s.s} (${s.v} reviews)`));
    return;
  }

  // 6. Write
  const lines = ['export const stores = [\n'];
  for (const s of merged) lines.push(serializeStore(s) + ',\n');
  lines.push('];\n');
  if (tail) lines.push(tail);

  fs.writeFileSync(flags.storesPath, lines.join(''), 'utf-8');
  console.log(`\nWrote ${merged.length} stores → ${flags.storesPath}`);

  console.log('\n=== New Stores Added ===');
  accepted.slice(0, 20).forEach(s => {
    console.log(`  ${s.n} — ${s.c}, ${s.s} (${s.v} reviews, ${s.r}★)${s.h ? ' [hours]' : ''}`);
  });
  if (accepted.length > 20) console.log(`  ... and ${accepted.length - 20} more`);
}

main().catch(err => { console.error(err); process.exit(1); });
