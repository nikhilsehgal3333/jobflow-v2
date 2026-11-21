#!/usr/bin/env node
/**
 * generate-cover-letter.mjs — Render a cover letter .docx in the Wonsulting
 * template layout into the same per-company folder as the CV.
 *
 * Layout (from "Wonsulting Cover Letter Template.docx"):
 *   Name                                    (bold)
 *   City, State | Phone | Email | LinkedIn  (LinkedIn hyperlinked)
 *   <blank>
 *   Dear <salutation>,
 *   <intro paragraph — passion/qualities hook for the role>
 *   <experiences paragraph>
 *   As a prospective employee, I can immediately bring the following qualities to the team:
 *   <Skill 1>: <1-sentence intro + project example: 2 context / 2 action / 2 impact sentences>
 *   <Skill 2>: <same structure>
 *   While my resume provides a quick summary of my experiences, I hope to have the
 *   opportunity to share how I can bring value to your company's needs.
 *   Sincerely,
 *   Name
 *
 * The prose (intro, experiences, skill bodies) is written by the agent following
 * the template's instructions + Anti_AI_Detection_Rules.md, then run through the
 * humanizer skill BEFORE being passed here. This script only does layout.
 *
 * Usage:
 *   node generate-cover-letter.mjs --data cover.json --company "Acme GmbH" --role "ESG Manager"
 *
 * cover.json shape:
 *   { recipientAddress?: string[], salutation?, intro, experiences, qualitiesLead?,
 *     skills:[{name,body}], closing?, signoff?, name?, contact? }
 *   // name/contact default from config.json
 *   // recipientAddress: array of lines for the recipient block (formal letter style),
 *   //   e.g. ["Tribera Real Estate Management DE GmbH","Rosenthaler Strasse 52","10178","Berlin Germany"]
 *   // salutation default: "Dear Hiring Manager," (safe neutral; override per cover.json)
 *
 * Output: <outputRoot>/<Company>_<Role>/cover_letter.docx
 */

import { readFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(path.join(HERE, 'config.json'), 'utf8'));
const docxPath = require.resolve('docx', { paths: [path.dirname(path.join(HERE, config.paths.cvGenerator))] });
const { Document, Packer, Paragraph, TextRun, AlignmentType, ExternalHyperlink, UnderlineType } = require(docxPath);

const OUTPUT_ROOT = path.resolve(path.dirname(path.join(HERE, config.paths.cvGenerator)), 'Agent Response');

const FONT = 'Arial';
const BODY = 22;   // 11pt
const NAME = 36;   // 18pt, all-caps, bold (formal business-letter header)

const DEFAULT_QUALITIES_LEAD = 'As a prospective employee, I can immediately bring the following qualities to the team:';
const DEFAULT_CLOSING = "While my resume provides a quick summary of my experiences, I hope to have the opportunity to share how I can bring value to your company's needs.";
const DEFAULT_SIGNOFF = 'Sincerely,';
const DEFAULT_SALUTATION = 'Dear Hiring Manager,';

function arg(name, dflt = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1] : dflt;
}
function sanitize(s) {
  return String(s || '').trim().replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Unknown';
}
function run(text, opts = {}) { return new TextRun({ text, size: BODY, font: FONT, ...opts }); }
function para(children, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before || 0, after: opts.after !== undefined ? opts.after : 200 },
    alignment: opts.alignment || AlignmentType.LEFT,
    children: Array.isArray(children) ? children : [run(children, opts.run || {})],
  });
}

function contactLine(contact) {
  return new Paragraph({
    spacing: { after: 200 },
    children: [
      run(`${contact.location} | ${contact.phone} | ${contact.email} | `),
      new ExternalHyperlink({
        link: contact.linkedin,
        children: [run('LinkedIn', { underline: { type: UnderlineType.SINGLE }, color: '0563C1' })],
      }),
    ],
  });
}

async function main() {
  const dataFile = arg('data');
  if (!dataFile) { console.error('generate-cover-letter: --data <json file> is required'); process.exit(2); }
  const data = JSON.parse(readFileSync(dataFile, 'utf8'));

  const company = arg('company') || data.company || 'Company';
  const role = arg('role') || data.role || 'Role';
  const name = data.name || config.candidate.name;
  const contact = data.contact || config.candidate.contact;

  if (!data.intro || !Array.isArray(data.skills) || data.skills.length === 0) {
    console.error('generate-cover-letter: data must include intro and a non-empty skills[]');
    process.exit(2);
  }

  const children = [
    para(name.toUpperCase(), { run: { bold: true, size: NAME }, alignment: AlignmentType.CENTER, after: 40 }),
    contactLine(contact),
  ];

  // Optional recipient address block (formal business-letter style).
  // Supplied via data.recipientAddress: ["Company GmbH", "Street 12", "10178", "Berlin Germany"]
  if (Array.isArray(data.recipientAddress) && data.recipientAddress.length) {
    const lines = data.recipientAddress;
    lines.forEach((line, i) => {
      children.push(para(line, { after: i === lines.length - 1 ? 200 : 0 }));
    });
  }

  children.push(para(data.salutation || DEFAULT_SALUTATION, { after: 200 }));
  children.push(para(data.intro, { after: 200 }));
  if (data.experiences) children.push(para(data.experiences, { after: 200 }));
  children.push(para(data.qualitiesLead || DEFAULT_QUALITIES_LEAD, { after: 160 }));

  for (const s of data.skills) {
    children.push(para([run(`${s.name}: `, { bold: true }), run(s.body)], { after: 200 }));
  }

  if (Array.isArray(data.extraParagraphs)) {
    for (const p of data.extraParagraphs) children.push(para(p, { after: 200 }));
  }
  children.push(para(data.closing || DEFAULT_CLOSING, { after: 240 }));
  children.push(para(data.signoff || DEFAULT_SIGNOFF, { after: 200 }));
  children.push(para(name, { run: { bold: true }, after: 0 }));

  const doc = new Document({
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children,
    }],
  });

  const subdir = arg('out-subdir') || `${sanitize(company)}_${sanitize(role)}`;
  const filename = arg('filename') || 'cover_letter.docx';
  const subdirAbs = path.join(OUTPUT_ROOT, subdir);
  if (!existsSync(subdirAbs)) mkdirSync(subdirAbs, { recursive: true });
  const outputPath = path.join(subdirAbs, filename);

  const buffer = await Packer.toBuffer(doc);
  const { writeFileSync } = await import('fs');
  writeFileSync(outputPath, buffer);
  console.log('Generated:', outputPath);
  process.stdout.write(JSON.stringify({ outputFile: outputPath, subdir, company, role }) + '\n');
}

main().catch(e => { console.error('generate-cover-letter:', e.message); process.exit(1); });
