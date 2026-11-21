#!/usr/bin/env node
/**
 * audit-cv.mjs — Verify a rendered CV before delivery.
 *
 * Two jobs, both mechanical, both mandatory before you tell the user a CV is done:
 *
 *   1. KEYWORD AUDIT — derives the term list FROM the job description, not from
 *      the agent's memory of it. This is the whole point. Hand-written term lists
 *      systematically overstate coverage: on two separate CVs an agent-written list
 *      reported "full coverage" where a JD-derived list found 24 and 26 misses.
 *
 *   2. PARSE TEST — the structural and field-extraction checks an ATS runs.
 *      Also catches a stale/locked output file, which silently produces a CV that
 *      does not match its own JSON source.
 *
 * Usage:
 *   node audit-cv.mjs --cv "<path to .docx>" --jd "<path to jd.txt>"
 *   node audit-cv.mjs --cv "<...>" --jd "<...>" --max 60     # cap reported misses
 *   node audit-cv.mjs --cv "<...>"                            # parse test only
 *
 * Exit code is 0 always — this is a report, not a gate. The agent triages.
 *
 * NOTE ON TRIAGE (the part that matters):
 *   A miss is NOT automatically a defect. Sort every miss into one of three bins:
 *     (a) TRUE AND MISSING  -> add it, then re-run this script to confirm it landed
 *     (b) NOT HELD          -> leave it out. Never invent experience to close a gap.
 *                              These are the honest fit gap; report them to the user
 *                              and route them to the cover letter.
 *     (c) NOISE             -> the employer's own brand/org names, inflection variants
 *                              of terms already present, and JD-side phrasing that
 *                              describes the employer rather than the candidate.
 *   Report the (b) list to the user explicitly. That list IS the fit gap.
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { inflateRawSync } from 'zlib';

function arg(name, dflt = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1] : dflt;
}

// ── minimal ZIP reader (docx is a zip; avoids adding a dependency) ───────────
function readZipEntry(buf, wanted) {
  // locate End of Central Directory
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 66000; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd === -1) throw new Error('not a zip archive (no EOCD)');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);

  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const method   = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen  = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const cmtLen   = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name     = buf.toString('utf8', p + 46, p + 46 + nameLen);

    if (name === wanted) {
      const lNameLen  = buf.readUInt16LE(localOff + 26);
      const lExtraLen = buf.readUInt16LE(localOff + 28);
      const start = localOff + 30 + lNameLen + lExtraLen;
      const raw = buf.subarray(start, start + compSize);
      return method === 0 ? raw : inflateRawSync(raw);
    }
    p += 46 + nameLen + extraLen + cmtLen;
  }
  throw new Error(`entry not found: ${wanted}`);
}

// ── docx -> text, preserving paragraph breaks and tabs ──────────────────────
function docxText(xml) {
  return xml
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

const STOP = new Set(`a an the and or but if then than that this these those of in on at to for
with from by as is are was were be been being will would can could should may might must have
has had do does did not no you your we our us they their it its he she his her i me my as so
such other others any all each every some more most much many few own same also just only very
new next per via across into over under about within without between during before after while
where when who whom which what how why here there them then out up down off again further once
both either neither nor yet still even ever never always often sometimes usually able best
across ensure ensuring including include includes e g eg ie etc us de en`.split(/\s+/));

// Single words carry almost no signal and flood the report with JD-side filler
// ("support", "provide", "looking"). Multi-word phrases and acronyms are where the
// real requirements live, so only those are reported.
const FILLER = new Set(`support supports provide provides looking need needs needed ensure
ensures ensuring excellent strong good great passionate dynamic exciting opportunity
opportunities role position candidate applicant apply application team company business
work working experience experienced years skills skill ability able knowledge join joining
help helps helping drive drives driving contribute contributing part make makes making
across within during timely manner high highest level levels well also additionally
furthermore related relevant various different several key main major overall
responsibilities requirements profile offer offers benefits
holiday holidays vacation insurance pension retirement discount discounts voucher vouchers
gym meditation wellbeing well-being health healthy medical care sabbatical commuting mobility
salary compensation bonus incentives perks budget educational courses coaching mentoring
relocation relocating campus office snacks fruits lunch meal events dinners competition
discrimination discriminate diversity inclusion inclusive belonging respect equality
accommodation accommodations disability disabled applicants applicant recruiters recruiting
interview interviews pronouns gender identity orientation religion nationality veteran
apply applying online attached attach passionate innovative culturally planet unmatched
personal professional development growth career journey mission vision culture people`
  .split(/\s+/));

function ngrams(text, maxN = 3, brandWords = []) {
  const brand = new Set(brandWords);
  // Segment on line breaks AND clause punctuation first. Without this, n-grams run
  // across sentence boundaries and produce garbage like "audits provide support".
  const segments = text
    .split(/[\n\r.;:()\[\]|]+|,\s|•/)
    .map(s => s.toLowerCase().replace(/[^a-z0-9äöüß&\-\/\s]/g, ' '));

  const out = new Map();
  for (const seg of segments) {
    const words = seg.split(/\s+/)
      .map(w => w.replace(/^[-\/]+|[-\/]+$/g, ''))
      .filter(Boolean);
    for (let n = 2; n <= maxN; n++) {         // phrases only, no single words
      for (let i = 0; i + n <= words.length; i++) {
        const slice = words.slice(i, i + n);
        if (slice.some(w => STOP.has(w))) continue;      // no stopwords anywhere
        if (slice.some(w => brand.has(w))) continue;     // employer's own brand/org names
        if (slice.every(w => FILLER.has(w))) continue;   // pure JD filler
        if (FILLER.has(slice[0]) && FILLER.has(slice[slice.length - 1])) continue;
        if (slice.some(w => /^\d+$/.test(w))) continue;  // req numbers, headcounts
        const g = slice.join(' ');
        if (g.length < 8) continue;
        out.set(g, (out.get(g) || 0) + 1);
      }
    }
  }
  return out;
}

// ── main ────────────────────────────────────────────────────────────────────
const cvPath = arg('cv');
const jdPath = arg('jd');
const maxMiss = parseInt(arg('max', '80'), 10);

if (!cvPath) { console.error('audit-cv: --cv <file.docx> is required'); process.exit(2); }
if (!existsSync(cvPath)) { console.error(`audit-cv: not found: ${cvPath}`); process.exit(2); }

const buf = readFileSync(cvPath);
const xml = readZipEntry(buf, 'word/document.xml').toString('utf8');
const text = docxText(xml);
const lower = text.toLowerCase().replace(/\s+/g, ' ');
const lines = text.split('\n').map(l => l.trimEnd()).filter(Boolean);

console.log('='.repeat(72));
console.log('CV AUDIT');
console.log('='.repeat(72));
console.log(`file      : ${cvPath}`);
console.log(`modified  : ${statSync(cvPath).mtime.toISOString()}`);
console.log(`lines     : ${lines.length}`);

// ── invisible characters ────────────────────────────────────────────────────
// Codepoint classes taken from the watermarks-remover skill
// (skills/remove-ai-marks/scripts/text_unicode.py). Invisible on screen, but
// they sit inside words and break ATS field extraction and keyword matching —
// a zero-width space inside "Sustainability" makes the term unmatchable.
//   FAIL : zero-width, bidi and format controls, variation selectors, tag chars
//   WARN : exotic spaces (a stray NBSP is common and rarely fatal)
const INVISIBLE = /[​-‏‪-‮⁠-⁤⁦-⁯﻿︀-️]|[\u{E0000}-\u{E007F}]/gu;
const EXOTIC_SPACE = /[  -   　]/gu;

function tally(re, s) {
  const found = new Map();
  for (const ch of s.match(re) || []) {
    const key = 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    found.set(key, (found.get(key) || 0) + 1);
  }
  return found;
}
const invisible = tally(INVISIBLE, text);
const exoticSpaces = tally(EXOTIC_SPACE, text);
const fmtTally = m => [...m].map(([k, n]) => `${k} x${n}`).join(', ');

// ── parse test ──────────────────────────────────────────────────────────────
const checks = [
  ['header/footer parts', /headerReference|footerReference/.test(xml), false],
  ['tables',              /<w:tbl>/.test(xml),                         false],
  ['text boxes',          /txbxContent/.test(xml),                     false],
  ['images/drawings',     /<w:drawing>|<w:pict>/.test(xml),            false],
  ['multi-column',        /<w:cols[^>]*w:num="[2-9]/.test(xml),        false],
  ['real bullet lists',   /<w:numPr>/.test(xml),                       true ],
  ['literal bullet glyph',/•/.test(text),                         false],
  ['em dash',             /—/.test(text),                         false],
  ['en dash',             /–/.test(text),                         false],
  ['curly quotes',        /[‘’“”]/.test(text),     false],
  ['invisible chars',     invisible.size > 0,                          false],
];
console.log('\n--- PARSE TEST ---');
let fails = 0;
for (const [label, actual, want] of checks) {
  const ok = actual === want;
  if (!ok) fails++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(22)} ${actual}`);
}
if (invisible.size) console.log(`        -> strip these: ${fmtTally(invisible)}`);
if (exoticSpaces.size) console.log(`  WARN  ${'exotic spaces'.padEnd(22)} ${fmtTally(exoticSpaces)} (replace with a plain space)`);

const email = (text.match(/[\w.\-]+@[\w.\-]+\.\w+/) || [''])[0];
const phone = (text.match(/\+\d[\d\s]{8,}/) || [''])[0].trim();
const headers = lines.filter(l => /^[A-Z][A-Z ]{3,}$/.test(l));
console.log('\n--- FIELD EXTRACTION ---');
console.log(`  name    : ${lines[0] || '(none)'}`);
console.log(`  email   : ${email || '(NOT FOUND)'}`);
console.log(`  phone   : ${phone || '(NOT FOUND)'}`);
console.log(`  headers : ${headers.join(', ') || '(NONE FOUND)'}`);
console.log(`  footer  : ${lines[lines.length - 1] || '(none)'}`);
if (!email || !phone || headers.length < 4) fails++;

// ── writing audit ───────────────────────────────────────────────────────────
// The keyword audit below scores what a machine reads. This block scores what a
// human reads, because the CV converges on whatever gets measured: with keyword
// coverage and page count as the only gates, bullets drift into uniform 20-30
// word duty descriptions with no outcome, which is exactly what got shipped on
// the Tanso Founder's Associate run of 1 Sep 2026 before it was caught by eye.
//
// Bullets are the indented body lines: not the section headers, not the
// company/date lines, not the contact or footer lines.
const RESP_OPENERS = new Set([
  'own','owned','manage','managed','support','supported','advise','advised',
  'coordinate','coordinated','handle','handled','oversee','oversaw','maintain',
  'maintained','responsible','contribute','contributed','assist','assisted',
]);
const HEADER_RE = /^[A-Z][A-Z &]+$/;

// Scope to the experience section only. The profile paragraph, education detail,
// skills lines and certifications are not bullets and must not skew the stats.
const expStart = lines.findIndex(l => /^(PROFESSIONAL EXPERIENCE|BERUFSERFAHRUNG|EXPERIENCE)$/i.test(l.trim()));
const expEndRel = lines.slice(expStart + 1).findIndex(l => /^(EDUCATION|AUSBILDUNG|SKILLS)$/i.test(l.trim()));
const expLines = expStart === -1 ? [] :
  lines.slice(expStart + 1, expEndRel === -1 ? lines.length : expStart + 1 + expEndRel);

const bullets = expLines.filter(l =>
  !HEADER_RE.test(l.trim()) &&
  l.split(/\s+/).length >= 6 &&
  !/\d{4}\s*-\s*(\d{4}|Present|Heute)/.test(l) &&  // company + date lines
  !/\((Contract|Work Study|Werkstudium|Vertrag)\)\s*$/.test(l.trim()) &&  // job title lines
  !/^[A-Z][A-Za-z&.,' -]+\t/.test(l)                // any residual tabbed header line
);
if (process.argv.includes('--show-bullets')) {
  console.log('\n  [--show-bullets] bullets the writing audit counted:');
  bullets.forEach((b, i) => console.log(`   ${String(i + 1).padStart(2)}. [${b.split(/\s+/).length}w] ${b}`));
}

const wc = b => b.split(/\s+/).filter(Boolean).length;
const counts = bullets.map(wc).sort((a, b) => a - b);
const withNumber = bullets.filter(b => /\b\d/.test(b) || /\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\b/i.test(b));
const longOnes = bullets.filter(b => wc(b) > 28);
const bunched = counts.filter(n => n >= 18 && n <= 28).length;
const openers = new Map();
for (const b of bullets) {
  const w = b.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
  openers.set(w, (openers.get(w) || 0) + 1);
}
const overusedOpeners = [...openers].filter(([, n]) => n > 2);
const dutyBullets = bullets.filter(b => {
  const w = b.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
  return RESP_OPENERS.has(w) && !/\b\d/.test(b);
});

const quantPct = bullets.length ? Math.round(100 * withNumber.length / bullets.length) : 0;
const bunchedPct = bullets.length ? Math.round(100 * bunched / bullets.length) : 0;
const median = counts.length ? counts[Math.floor(counts.length / 2)] : 0;

console.log('\n--- WRITING AUDIT (what a human reads, not what the parser reads) ---');
console.log(`  bullets counted    : ${bullets.length}`);
console.log(`  carrying a number  : ${withNumber.length} (${quantPct}%)   target >= 40%`);
console.log(`  words per bullet   : min ${counts[0] ?? 0} / median ${median} / max ${counts[counts.length - 1] ?? 0}`);
console.log(`  bunched at 18-28w  : ${bunched} (${bunchedPct}%)   target <= 60%, else every line reads the same`);
if (quantPct < 40)          console.log(`  WARN  under 40% of bullets state a result. Duties, not achievements (rule 16).`);
if (bunchedPct > 60)        console.log(`  WARN  bullet lengths are uniform. Add short 10-14 word lines for rhythm.`);
if ((counts[0] ?? 99) > 14) console.log(`  WARN  no bullet under 15 words. Nothing on the page lands hard.`);
if (longOnes.length) {
  console.log(`  WARN  ${longOnes.length} bullet(s) over 28 words - usually two keywords welded together:`);
  for (const b of longOnes.slice(0, 4)) console.log(`        [${wc(b)}w] ${b.slice(0, 96)}...`);
}
if (dutyBullets.length) {
  console.log(`  WARN  ${dutyBullets.length} bullet(s) open on a responsibility verb with no number:`);
  for (const b of dutyBullets.slice(0, 4)) console.log(`        ${b.slice(0, 96)}...`);
}
if (overusedOpeners.length) {
  console.log(`  WARN  opener used more than twice (rule 16): ${overusedOpeners.map(([w, n]) => `${w} x${n}`).join(', ')}`);
}
if (quantPct < 40 || bunchedPct > 60 || longOnes.length || dutyBullets.length || overusedOpeners.length) {
  console.log(`  These are WARNINGS, not failures. Fix what is true and fixable; a bullet with no`);
  console.log(`  verified number stays unquantified (rule 1) - shorten it instead of padding it.`);
}

// ── keyword audit ───────────────────────────────────────────────────────────
if (jdPath && existsSync(jdPath)) {
  const jd = readFileSync(jdPath, 'utf8');
  const brandWords = arg('company', '').toLowerCase().split(/[\s,]+/).filter(Boolean);
  const grams = ngrams(jd, 3, brandWords);
  const misses = [];
  for (const [g, freq] of grams) {
    if (!lower.includes(g)) misses.push([g, freq, g.split(' ').length]);
  }
  // longer phrases and repeated terms first — those carry the most signal
  misses.sort((a, b) => (b[1] - a[1]) || (b[2] - a[2]) || a[0].localeCompare(b[0]));

  const acronyms = [...new Set((jd.match(/\b[A-Z]{2,6}\b/g) || []))]
    .filter(a => !['THE','AND','FOR','YOU','ARE','WITH','OUR','ALL','NOT','WHAT','YOUR'].includes(a))
    .filter(a => !lower.includes(a.toLowerCase()));

  console.log('\n--- KEYWORD AUDIT (phrases derived from the JD, not hand-written) ---');
  console.log(`  JD phrases checked : ${grams.size}`);
  console.log(`  present in CV      : ${grams.size - misses.length}`);
  console.log(`  MISSING            : ${misses.length}  (${Math.round(100*(grams.size-misses.length)/Math.max(1,grams.size))}% coverage)`);
  if (acronyms.length) console.log(`\n  ACRONYMS IN JD, ABSENT FROM CV: ${acronyms.join(', ')}`);
  console.log(`\n  Missing terms (top ${Math.min(maxMiss, misses.length)}, most frequent first):`);
  for (const [g, freq] of misses.slice(0, maxMiss)) {
    console.log(`    [x${freq}] ${g}`);
  }
  console.log(`\n  TRIAGE each miss into: (a) true+missing -> add and re-run;`);
  console.log(`  (b) not held -> leave out, this is the honest fit gap, tell the user;`);
  console.log(`  (c) noise -> employer brand/org names, inflections, JD-side phrasing.`);
} else if (jdPath) {
  console.log(`\n--- KEYWORD AUDIT SKIPPED: jd file not found: ${jdPath}`);
} else {
  console.log('\n--- KEYWORD AUDIT SKIPPED: pass --jd <jd.txt> to run it ---');
}

console.log('\n' + '='.repeat(72));
console.log(fails === 0 ? 'PARSE TEST: PASS' : `PARSE TEST: ${fails} issue(s) — fix before delivering`);
console.log('='.repeat(72));
