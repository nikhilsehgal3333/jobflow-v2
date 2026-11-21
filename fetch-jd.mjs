#!/usr/bin/env node
/**
 * fetch-jd.mjs — Get a job description as clean text (+ raw HTML when available).
 *
 * Three input modes:
 *   1. Pasted text:   node fetch-jd.mjs --text "<jd text>"        --out "<dir>"
 *                     node fetch-jd.mjs --text-file paste.txt     --out "<dir>"
 *   2. URL (http):    node fetch-jd.mjs --url "<url>"             --out "<dir>"
 *   3. URL (browser): adds CloakBrowser fallback automatically when the simple
 *                     fetch returns too little text or the host is known to be
 *                     client-side rendered (e.g. Workday). Force it with
 *                     --force-browser, or skip it with --no-browser.
 *
 * Writes (when --out given): <out>/jd.txt and (for URLs) <out>/page.html
 * Prints a JSON summary on stdout:
 *   { "source":"url", "method":"http|browser", "url":"...", "chars":1234,
 *     "textFile":"...", "htmlFile":"...", "thin":false }
 *
 * CloakBrowser (npm `cloakbrowser`) is loaded lazily; if it is not installed the
 * script falls back to the http result and notes it in the summary.
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

const THIN_TEXT_THRESHOLD = 600; // chars below which an http fetch is "thin"
const CLIENT_RENDERED = [/myworkdayjobs\.com/i, /\.workday\.com/i, /ashbyhq\.com/i];

function arg(name, dflt = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1] : (i !== -1 ? true : dflt);
}
function flag(name) { return process.argv.includes(`--${name}`); }

// ── HTML -> clean text ────────────────────────────────────────────────
function htmlToText(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|br|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n').map(l => l.trim()).filter(Boolean).join('\n')
    .trim();
}

async function httpFetch(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
    },
  });
  const html = await res.text();
  return { ok: res.ok, status: res.status, html };
}

async function browserFetch(url) {
  // Lazy-load CloakBrowser (Playwright stealth). Returns null if unavailable.
  let launch;
  try {
    ({ launch } = await import('cloakbrowser'));
  } catch {
    return { unavailable: true };
  }
  let browser;
  try {
    browser = await launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const html = await page.content();
    let text = '';
    try { text = await page.evaluate(() => document.body && document.body.innerText || ''); } catch { /* */ }
    return { html, text };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

function writeOut(outDir, name, content) {
  if (!outDir) return '';
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const p = path.join(outDir, name);
  writeFileSync(p, content, 'utf8');
  return p;
}

async function main() {
  const url = typeof arg('url') === 'string' ? arg('url') : '';
  const text = typeof arg('text') === 'string' ? arg('text') : '';
  const textFile = typeof arg('text-file') === 'string' ? arg('text-file') : '';
  const outDir = typeof arg('out') === 'string' ? arg('out') : '';
  const forceBrowser = flag('force-browser');
  const noBrowser = flag('no-browser');

  // ── Mode 1/2: pasted text ──
  if (text || textFile) {
    const jd = text || readFileSync(textFile, 'utf8');
    const textPath = writeOut(outDir, 'jd.txt', jd);
    process.stdout.write(JSON.stringify({
      source: 'paste', method: 'paste', chars: jd.length,
      textFile: textPath, htmlFile: '', thin: jd.length < THIN_TEXT_THRESHOLD,
    }) + '\n');
    return;
  }

  if (!url) {
    console.error('fetch-jd: provide --url, --text, or --text-file');
    process.exit(2);
  }

  // ── Mode 3: URL ──
  let html = '', cleanText = '', method = 'http', note = '';
  try {
    const r = await httpFetch(url);
    html = r.html || '';
    cleanText = htmlToText(html);
  } catch (e) {
    note = `http error: ${e.message}`;
  }

  const looksClientRendered = CLIENT_RENDERED.some(re => re.test(url));
  const thin = cleanText.length < THIN_TEXT_THRESHOLD;
  const wantBrowser = !noBrowser && (forceBrowser || thin || looksClientRendered);

  if (wantBrowser) {
    const b = await browserFetch(url);
    if (b && b.unavailable) {
      note = (note ? note + '; ' : '') + 'cloakbrowser not installed — used http result. Install: npm i cloakbrowser';
    } else if (b && (b.html || b.text)) {
      method = 'browser';
      if (b.html) html = b.html;
      const fromHtml = htmlToText(html);
      // Prefer rendered innerText when richer than tag-stripped html.
      cleanText = (b.text && b.text.length > fromHtml.length) ? b.text.trim() : fromHtml;
    }
  }

  const htmlPath = html ? writeOut(outDir, 'page.html', html) : '';
  const textPath = writeOut(outDir, 'jd.txt', cleanText);

  process.stdout.write(JSON.stringify({
    source: 'url', method, url, chars: cleanText.length,
    textFile: textPath, htmlFile: htmlPath,
    thin: cleanText.length < THIN_TEXT_THRESHOLD,
    note,
  }) + '\n');
}

import { fileURLToPath } from 'url';
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(e => { console.error('fetch-jd:', e.message); process.exit(1); });
}

export { htmlToText, httpFetch };
