#!/usr/bin/env node
/**
 * detect-ats.mjs — Identify which ATS a job posting is hosted on, and map it
 * to the CV format Nikhil's cv-generator.cjs should use.
 *
 * Format rule (from Nikkhil_Sehgal_Master_Prompt_v4.md, Section 6):
 *   Workday + Taleo  -> "workday" format (Job Title first, no tab stops)
 *   everything else  -> "preferred" format
 *
 * Detection uses two signals:
 *   1. URL host / path / query signatures (strong, cheap)
 *   2. HTML fingerprints (fallback, when the URL is a vanity/redirect domain)
 *
 * Usage:
 *   node detect-ats.mjs --url "https://company.wd3.myworkdayjobs.com/..."
 *   node detect-ats.mjs --url "<url>" --html-file page.html
 *   echo "<html...>" | node detect-ats.mjs --url "<url>" --stdin
 *
 * Output: a JSON object on stdout, e.g.
 *   { "ats": "workday", "format": "workday", "language": "en", "confidence": "high", "signal": "url-host" }
 */

import { readFileSync } from 'fs';

// ── ATS signature table ─────────────────────────────────────────────
// Each entry: id, the CV format it maps to, URL regexes, and HTML fingerprints.
// Ordered by specificity; first match wins.
const ATS_TABLE = [
  {
    id: 'workday', format: 'workday',
    url: [/myworkdayjobs\.com/i, /\.workday\.com/i, /wday\/cxs/i],
    html: [/myworkdayjobs/i, /workday/i, /data-automation-id/i],
  },
  {
    id: 'taleo', format: 'workday',
    url: [/\.taleo\.net/i, /tal\.net/i, /taleo/i],
    html: [/taleo/i],
  },
  {
    id: 'greenhouse', format: 'preferred',
    url: [/greenhouse\.io/i, /[?&]gh_jid=/i, /[?&]gh_src=/i],
    html: [/greenhouse\.io/i, /grnhse/i, /boards-api\.greenhouse/i],
  },
  {
    id: 'lever', format: 'preferred',
    url: [/lever\.co/i],
    html: [/lever\.co/i, /lever-jobs/i],
  },
  {
    id: 'ashby', format: 'preferred',
    url: [/ashbyhq\.com/i],
    html: [/ashbyhq/i],
  },
  {
    id: 'smartrecruiters', format: 'preferred',
    url: [/smartrecruiters/i],
    html: [/smartrecruiters/i],
  },
  {
    id: 'successfactors', format: 'preferred',
    url: [/successfactors/i, /sapsf\.eu/i, /sapsf\.com/i, /career4\./i, /career5\./i, /jobs\.sap\.com/i],
    html: [/successfactors/i, /sapsf/i],
  },
  {
    id: 'avature', format: 'preferred',
    url: [/avature\.net/i],
    html: [/avature/i],
  },
  {
    id: 'personio', format: 'preferred',
    url: [/personio\.(de|com)/i, /jobs\.personio/i],
    html: [/personio/i],
  },
  {
    id: 'teamtailor', format: 'preferred',
    url: [/teamtailor\.com/i],
    html: [/teamtailor/i],
  },
  {
    id: 'pinpoint', format: 'preferred',
    url: [/pinpointhq\.com/i],
    html: [/pinpointhq/i, /pinpoint-ats/i],
  },
  {
    id: 'recruitee', format: 'preferred',
    url: [/recruitee\.com/i],
    html: [/recruitee/i],
  },
  {
    id: 'workable', format: 'preferred',
    url: [/workable\.com/i, /apply\.workable/i],
    html: [/workable/i],
  },
  {
    id: 'bamboohr', format: 'preferred',
    url: [/bamboohr\.com/i],
    html: [/bamboohr/i],
  },
  {
    id: 'oracle-hcm', format: 'preferred',
    url: [/oraclecloud\.com/i, /\.oracle\.com\/.*recruit/i, /fa\.oraclecloud/i],
    html: [/oracle.*recruiting/i],
  },
  {
    id: 'cornerstone', format: 'preferred',
    url: [/cornerstone(ondemand)?\.com/i, /csod\.com/i],
    html: [/cornerstone/i, /csod/i],
  },
  {
    id: 'softgarden', format: 'preferred',
    url: [/softgarden\.(de|io|com)/i],
    html: [/softgarden/i],
  },
  {
    id: 'linkedin', format: 'preferred',
    url: [/linkedin\.com\/jobs/i],
    html: [/linkedin\.com\/jobs/i],
  },
];

// Quick German-language heuristic for downstream EN/DE choice.
const DE_HINTS = [
  /\bstellenangebot\b/i, /\bbewerbung\b/i, /\baufgaben\b/i, /\bdein profil\b/i,
  /\bwir bieten\b/i, /\bunbefristet\b/i, /\bvollzeit\b/i, /\bm\/w\/d\b/i,
  /\bberufserfahrung\b/i, /\bkenntnisse\b/i, /\bgehalt\b/i, /\bmitarbeiter\b/i,
];

function detectLanguage(text = '', url = '') {
  if (!text && !url) return 'en';
  const hay = `${text}`.slice(0, 20000);
  let de = 0;
  for (const re of DE_HINTS) if (re.test(hay)) de++;
  if (/\.de(\/|$|\?)/i.test(url)) de++;
  return de >= 2 ? 'de' : 'en';
}

function detect(url = '', html = '') {
  // 1) URL signatures (high confidence)
  for (const ats of ATS_TABLE) {
    if (ats.url.some(re => re.test(url))) {
      return { ats: ats.id, format: ats.format, confidence: 'high', signal: 'url' };
    }
  }
  // 2) HTML fingerprints (medium confidence — vanity domains, redirects)
  if (html) {
    const head = html.slice(0, 60000);
    for (const ats of ATS_TABLE) {
      if (ats.html.some(re => re.test(head))) {
        return { ats: ats.id, format: ats.format, confidence: 'medium', signal: 'html' };
      }
    }
  }
  // 3) Unknown -> safe default per Master Prompt ("All others -> Preferred")
  return { ats: 'unknown', format: 'preferred', confidence: 'low', signal: 'default' };
}

// ── CLI ──────────────────────────────────────────────────────────────
function arg(name, dflt = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
function flag(name) { return process.argv.includes(`--${name}`); }

function readStdin() {
  try { return readFileSync(0, 'utf8'); } catch { return ''; }
}

function main() {
  const url = arg('url');
  const htmlFile = arg('html-file');
  let html = '';
  if (htmlFile) { try { html = readFileSync(htmlFile, 'utf8'); } catch { /* ignore */ } }
  else if (flag('stdin')) { html = readStdin(); }

  if (!url && !html) {
    console.error('detect-ats: provide --url and/or --html-file/--stdin');
    process.exit(2);
  }

  const result = detect(url, html);
  result.language = detectLanguage(html, url);
  process.stdout.write(JSON.stringify(result) + '\n');
}

// Run when invoked directly; export for programmatic use.
import { fileURLToPath } from 'url';
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}

export { detect, detectLanguage, ATS_TABLE };
