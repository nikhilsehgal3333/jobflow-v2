#!/usr/bin/env node
/**
 * generate-cv.mjs — Render an editable .docx CV into a per-company folder.
 *
 * Thin wrapper over ../cv-generator.cjs (generateCV). The CV *content* (profile,
 * experience bullets, skills, footer) is produced by the agent following
 * Nikkhil_Sehgal_Master_Prompt_v4.md + Anti_AI_Detection_Rules.md and handed in
 * as a JSON file. Name + contact default from jobflow/config.json so the agent
 * only supplies the JD-specific parts.
 *
 * Usage:
 *   node generate-cv.mjs --data cv.json --company "Acme GmbH" --role "ESG Manager" \
 *        --format preferred --lang en
 *
 * Output: <outputRoot>/<Company>_<Role>/Nikhil_Sehgal_<Company>_<Role>.docx
 * Prints JSON: { "outputFile":"...", "format":"...", "language":"...", "subdir":"..." }
 *
 * The CV data JSON shape (see cv-generator.cjs):
 *   { profile, experience:[{company,dates,title,bullets[]}],
 *     education:[{degree,dates,institution,details[]}],
 *     skills:[{category,items}], certifications:[], languages:[], footer,
 *     extras?:[{label,bullets[]}], format?, language?, name?, contact? }
 */

import { readFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(path.join(HERE, 'config.json'), 'utf8'));
const { generateCV } = require(path.join(HERE, config.paths.cvGenerator));

// cv-generator.cjs writes to <its dir>/Agent Response. Mirror that path here so
// we can pre-create the per-company subfolder it does not create itself.
const OUTPUT_ROOT = path.resolve(path.dirname(path.join(HERE, config.paths.cvGenerator)), 'Agent Response');

function arg(name, dflt = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1] : dflt;
}
function sanitize(s) {
  return String(s || '').trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Unknown';
}

async function main() {
  const dataFile = arg('data');
  if (!dataFile) { console.error('generate-cv: --data <json file> is required'); process.exit(2); }

  const data = JSON.parse(readFileSync(dataFile, 'utf8'));
  const company = arg('company') || data.company || 'Company';
  const role = arg('role') || data.role || 'Role';
  const format = arg('format') || data.format || config.defaults.format;
  const language = arg('lang') || data.language || config.defaults.language;

  // Merge stable identity from config unless the data overrides it.
  const merged = {
    name: data.name || config.candidate.name,
    contact: data.contact || config.candidate.contact,
    ...data,
    format,
    language,
    // Carried through so the .docx document properties can name the target role
    // (cv-generator.cjs docProps) rather than defaulting to "Un-named".
    company,
    role,
  };

  const subdir = arg('out-subdir') || `${sanitize(company)}_${sanitize(role)}`;
  const filename = arg('filename') || `Nikhil_Sehgal_${sanitize(company)}_${sanitize(role)}.docx`;

  // Pre-create the subfolder; cv-generator.cjs only creates the Agent Response root.
  const subdirAbs = path.join(OUTPUT_ROOT, subdir);
  if (!existsSync(subdirAbs)) mkdirSync(subdirAbs, { recursive: true });

  // cv-generator joins OUTPUT_DIR + outputFilename; forward slash is fine on path.join.
  merged.outputFilename = `${subdir}/${filename}`;

  const outputFile = await generateCV(merged);
  process.stdout.write(JSON.stringify({ outputFile, format, language, subdir, company, role }) + '\n');
}

main().catch(e => { console.error('generate-cv:', e.message); process.exit(1); });
