/**
 * POST /api/seo-submit
 *
 * Triggered submission endpoint — call this after adding new store listings
 * to fast-index the affected pages without waiting for Googlebot to crawl.
 *
 * Request body (JSON):
 *   { "urls": ["https://..."] }          Submit explicit list of URLs
 *   { "storeSlug": "state/city/name" }   Submit a single store page + its city/state parents
 *
 * Authentication:
 *   Header: x-submit-secret: <SUBMIT_SECRET env var>
 *
 * Required env vars (same as scripts/seo-submit.js):
 *   SUBMIT_SECRET                Auth token to protect this endpoint
 *   GOOGLE_SERVICE_ACCOUNT_JSON  Service account key (path or JSON string)
 *   BING_API_KEY                 Bing Webmaster Tools API key
 */

import crypto from 'crypto';
import { siteConfig } from '@/config/site';

const BASE_URL = siteConfig.domain;
const GOOGLE_DELAY_MS = 200;

// ── JWT / Google auth ─────────────────────────────────────────────────────────

function base64url(buf) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getGoogleAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header  = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
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

  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return json.access_token;
}

// ── Submission helpers ────────────────────────────────────────────────────────

async function submitOneToGoogle(url, accessToken) {
  const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  });
  return res.status;
}

async function submitToBingBatch(urls) {
  const apiKey = process.env.BING_API_KEY;
  if (!apiKey) return { skipped: true };
  const res = await fetch('https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({ siteUrl: BASE_URL, urlList: urls }),
  });
  return { status: res.status };
}

// ── Request handler ───────────────────────────────────────────────────────────

export async function POST(request) {
  // Auth check
  const secret = process.env.SUBMIT_SECRET;
  if (!secret) {
    return Response.json({ error: 'SUBMIT_SECRET is not configured on the server' }, { status: 500 });
  }
  if (request.headers.get('x-submit-secret') !== secret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  // Resolve the list of URLs to submit
  let urls = [];
  if (Array.isArray(body.urls) && body.urls.length > 0) {
    urls = body.urls.filter(u => typeof u === 'string' && u.startsWith('http'));
  } else if (typeof body.storeSlug === 'string') {
    // storeSlug = "state-slug/city-slug/store-slug"
    // Also submit the parent city and state pages
    const parts = body.storeSlug.split('/').filter(Boolean);
    if (parts.length !== 3) {
      return Response.json({ error: 'storeSlug must be state/city/store' }, { status: 400 });
    }
    const [state, city, store] = parts;
    urls = [
      `${BASE_URL}/stores/${state}`,
      `${BASE_URL}/stores/${state}/${city}`,
      `${BASE_URL}/stores/${state}/${city}/${store}`,
    ];
  } else {
    return Response.json(
      { error: 'Provide either "urls" (array) or "storeSlug" (string)' },
      { status: 400 }
    );
  }

  if (urls.length === 0) {
    return Response.json({ error: 'No valid URLs to submit' }, { status: 400 });
  }

  const results = { google: { ok: 0, err: 0, skipped: false }, bing: { ok: 0, err: 0, skipped: false } };

  // Google
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!saJson) {
    results.google.skipped = true;
  } else {
    try {
      const sa = saJson.trim().startsWith('{') ? JSON.parse(saJson) : JSON.parse(
        (await import('fs')).readFileSync(saJson.trim(), 'utf8')
      );
      const token = await getGoogleAccessToken(sa);
      for (const url of urls) {
        const status = await submitOneToGoogle(url, token);
        if (status === 200) results.google.ok++;
        else results.google.err++;
        if (GOOGLE_DELAY_MS > 0) await new Promise(r => setTimeout(r, GOOGLE_DELAY_MS));
      }
    } catch (e) {
      results.google.err = urls.length;
      results.google.error = e.message;
    }
  }

  // Bing
  if (!process.env.BING_API_KEY) {
    results.bing.skipped = true;
  } else {
    const r = await submitToBingBatch(urls);
    if (r.skipped) {
      results.bing.skipped = true;
    } else if (r.status === 200) {
      results.bing.ok = urls.length;
    } else {
      results.bing.err = urls.length;
    }
  }

  return Response.json({ urls, results });
}
