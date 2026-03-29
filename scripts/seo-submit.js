#!/usr/bin/env node
/**
 * SEO URL Submission Pipeline
 *
 * Submits site URLs to Google Search Console Indexing API and/or Bing URL Submission API.
 *
 * Usage:
 *   node scripts/seo-submit.js --all           Submit all URLs to both services
 *   node scripts/seo-submit.js --google        Google Indexing API only
 *   node scripts/seo-submit.js --bing          Bing URL Submission API only
 *   node scripts/seo-submit.js --url <url>     Submit a single specific URL to both
 *   node scripts/seo-submit.js --url <url> --google  Single URL, Google only
 *
 * Required environment variables:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  Path to a Google service account key JSON file, or
 *                                the JSON content itself as a string
 *   BING_API_KEY                 Bing Webmaster Tools API key
 *
 * Optional:
 *   SITE_BASE_URL                Override the base URL (default: https://www.scratchanddentguide.com)
 *
 * Google quota: 200 URL updates/day by default (request increase in GCP if needed)
 * Bing quota:   10,000 URLs/day
 */

'use strict';

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Configuration ─────────────────────────────────────────────────────────────

const BASE_URL = process.env.SITE_BASE_URL || 'https://www.scratchanddentguide.com';

// Google Indexing API quota: stay under the daily limit with a conservative batch size
const GOOGLE_BATCH_SIZE = 100;
const GOOGLE_DELAY_MS = 500; // delay between Google requests to avoid rate-limit bursts

// Bing allows up to 500 URLs per request
const BING_BATCH_SIZE = 500;

// ── Slug helpers (mirrors src/data/stores.js) ─────────────────────────────────

const stateNames = {
  AK:'Alaska', AL:'Alabama', AR:'Arkansas', AZ:'Arizona', CA:'California',
  CO:'Colorado', CT:'Connecticut', DC:'District of Columbia', DE:'Delaware',
  FL:'Florida', GA:'Georgia', HI:'Hawaii', IA:'Iowa', ID:'Idaho',
  IL:'Illinois', IN:'Indiana', KS:'Kansas', KY:'Kentucky', LA:'Louisiana',
  MA:'Massachusetts', MD:'Maryland', ME:'Maine', MI:'Michigan', MN:'Minnesota',
  MO:'Missouri', MS:'Mississippi', MT:'Montana', NC:'North Carolina',
  ND:'North Dakota', NE:'Nebraska', NH:'New Hampshire', NJ:'New Jersey',
  NM:'New Mexico', NV:'Nevada', NY:'New York', OH:'Ohio', OK:'Oklahoma',
  OR:'Oregon', PA:'Pennsylvania', RI:'Rhode Island', SC:'South Carolina',
  SD:'South Dakota', TN:'Tennessee', TX:'Texas', UT:'Utah', VA:'Virginia',
  VT:'Vermont', WA:'Washington', WI:'Wisconsin', WV:'West Virginia', WY:'Wyoming',
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function getStateSlug(code) {
  const name = stateNames[code];
  return name ? slugify(name) : code.toLowerCase();
}
function getCitySlug(city) { return slugify(city); }
function getStoreSlug(store) { return slugify(store.n); }

// ── URL generation ────────────────────────────────────────────────────────────

function getAllUrls() {
  // Load store data at runtime to pick up the latest listings
  const dataPath = path.resolve(__dirname, '../src/data/stores.js');
  const raw = fs.readFileSync(dataPath, 'utf8');

  // Extract the stores array via a lightweight eval in a sandboxed context
  // We strip ESM export keywords so it can run in CommonJS.
  const cjsSrc = raw
    .replace(/^export const /gm, 'const ')
    .replace(/^export function /gm, 'function ')
    .replace(/^export default .*/gm, '');

  // eslint-disable-next-line no-new-func
  const mod = new Function('module', 'exports', `${cjsSrc}\nmodule.exports={stores,stateNames};`);
  const out = { exports: {} };
  mod(out, out.exports);
  const { stores } = out.exports;

  const urls = [];

  // Homepage
  urls.push(`${BASE_URL}/`);

  // Blog listing
  urls.push(`${BASE_URL}/blog`);

  // Static pages
  for (const page of ['about', 'contact', 'privacy-policy', 'terms']) {
    urls.push(`${BASE_URL}/${page}`);
  }

  // State pages
  const stateCodes = [...new Set(stores.map(s => s.s))];
  for (const code of stateCodes) {
    urls.push(`${BASE_URL}/stores/${getStateSlug(code)}`);
  }

  // City pages (de-duplicated)
  const cityKeys = new Set();
  for (const store of stores) {
    const key = `${store.s}|${store.c}`;
    if (!cityKeys.has(key)) {
      cityKeys.add(key);
      urls.push(`${BASE_URL}/stores/${getStateSlug(store.s)}/${getCitySlug(store.c)}`);
    }
  }

  // Individual store pages
  for (const store of stores) {
    urls.push(
      `${BASE_URL}/stores/${getStateSlug(store.s)}/${getCitySlug(store.c)}/${getStoreSlug(store)}`
    );
  }

  return urls;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

function httpPost(urlStr, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...headers,
        },
      },
      res => {
        let buf = '';
        res.on('data', c => (buf += c));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(buf) }); }
          catch { resolve({ status: res.statusCode, body: buf }); }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Google Indexing API ───────────────────────────────────────────────────────

function loadServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON env var is not set');
  // Support both a file path and an inline JSON string
  if (raw.trim().startsWith('{')) return JSON.parse(raw);
  return JSON.parse(fs.readFileSync(raw.trim(), 'utf8'));
}

function base64url(buf) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getGoogleAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })));
  const sigInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const sig = base64url(sign.sign(sa.private_key));
  const jwt = `${sigInput}.${sig}`;

  const res = await httpPost(
    'https://oauth2.googleapis.com/token',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  );
  if (res.status !== 200) {
    throw new Error(`Google token exchange failed (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return res.body.access_token;
}

async function submitToGoogle(urls) {
  console.log(`\n[Google] Submitting ${urls.length} URL(s)…`);
  let sa;
  try { sa = loadServiceAccount(); }
  catch (e) { console.error(`[Google] Skipped — ${e.message}`); return { ok: 0, err: urls.length }; }

  let accessToken;
  try { accessToken = await getGoogleAccessToken(sa); }
  catch (e) { console.error(`[Google] Auth failed — ${e.message}`); return { ok: 0, err: urls.length }; }

  let ok = 0, err = 0;
  for (let i = 0; i < urls.length; i += GOOGLE_BATCH_SIZE) {
    const batch = urls.slice(i, i + GOOGLE_BATCH_SIZE);
    for (const url of batch) {
      const res = await httpPost(
        'https://indexing.googleapis.com/v3/urlNotifications:publish',
        { Authorization: `Bearer ${accessToken}` },
        { url, type: 'URL_UPDATED' }
      );
      if (res.status === 200) {
        ok++;
        process.stdout.write('.');
      } else {
        err++;
        console.error(`\n[Google] Error ${res.status} for ${url}: ${JSON.stringify(res.body)}`);
        // Refresh token on 401
        if (res.status === 401) {
          try { accessToken = await getGoogleAccessToken(sa); } catch {}
        }
      }
      if (GOOGLE_DELAY_MS > 0) await sleep(GOOGLE_DELAY_MS);
    }
  }
  console.log(`\n[Google] Done — ${ok} submitted, ${err} errors`);
  return { ok, err };
}

// ── Bing URL Submission API ───────────────────────────────────────────────────

async function submitToBing(urls) {
  console.log(`\n[Bing] Submitting ${urls.length} URL(s)…`);
  const apiKey = process.env.BING_API_KEY;
  if (!apiKey) { console.error('[Bing] Skipped — BING_API_KEY env var is not set'); return { ok: 0, err: urls.length }; }

  let ok = 0, err = 0;
  for (let i = 0; i < urls.length; i += BING_BATCH_SIZE) {
    const batch = urls.slice(i, i + BING_BATCH_SIZE);
    const res = await httpPost(
      'https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch',
      { 'api-key': apiKey },
      { siteUrl: BASE_URL, urlList: batch }
    );
    if (res.status === 200) {
      ok += batch.length;
      console.log(`[Bing] Batch ${Math.floor(i / BING_BATCH_SIZE) + 1}: ${batch.length} URLs submitted`);
    } else {
      err += batch.length;
      console.error(`[Bing] Error ${res.status}: ${JSON.stringify(res.body)}`);
    }
  }
  console.log(`[Bing] Done — ${ok} submitted, ${err} errors`);
  return { ok, err };
}

// ── CLI entry point ───────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const useGoogle = args.includes('--google') || args.includes('--all') || args.length === 0;
  const useBing   = args.includes('--bing')   || args.includes('--all') || args.length === 0;
  const urlIdx = args.indexOf('--url');
  const singleUrl = urlIdx !== -1 ? args[urlIdx + 1] : null;

  if (singleUrl && !singleUrl.startsWith('http')) {
    console.error('--url must be a fully-qualified URL starting with http');
    process.exit(1);
  }

  const urls = singleUrl ? [singleUrl] : getAllUrls();
  console.log(`SEO Submission Pipeline — ${urls.length} URL(s), base: ${BASE_URL}`);
  console.log(`Targets: ${[useGoogle && 'Google', useBing && 'Bing'].filter(Boolean).join(', ')}`);

  const results = {};
  if (useGoogle) results.google = await submitToGoogle(urls);
  if (useBing)   results.bing   = await submitToBing(urls);

  console.log('\n── Summary ──');
  for (const [svc, r] of Object.entries(results)) {
    console.log(`  ${svc.padEnd(8)} ok=${r.ok}  err=${r.err}`);
  }

  const totalErrors = Object.values(results).reduce((s, r) => s + r.err, 0);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
