// One-off Anschreiben renderer. Layout per his letter rules: Arial 11pt, ~2.2 cm margins,
// CV-style header (16pt bold centred name, contact line, rule), right-aligned date,
// one-line bold subject, signature space, enclosures line.
// Usage: node render_anschreiben.cjs <cover.json> <out.docx>
const fs = require('fs');
const docxPath = require.resolve('docx', { paths: ['D:/Resume/Agent Skill'] });
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle,
        ExternalHyperlink, UnderlineType } = require(docxPath);

const [, , inFile, outFile] = process.argv;
const d = JSON.parse(fs.readFileSync(inFile, 'utf8'));
const FONT = 'Arial', BODY = 22, NAME = 32;
const r = (text, o = {}) => new TextRun({ text, font: FONT, size: BODY, ...o });
const p = (children, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.LEFT,
  spacing: { before: o.before || 0, after: o.after === undefined ? 0 : o.after, line: 264 },
  border: o.border,
  children: Array.isArray(children) ? children : [r(children, o.run || {})],
});

const c = d.contact;
const kids = [
  p(d.name, { align: AlignmentType.CENTER, after: 40, run: { bold: true, size: NAME } }),
  p([
    r(`${c.location} | ${c.phone} | ${c.email} | `),
    new ExternalHyperlink({ link: c.linkedin,
      children: [r('LinkedIn', { underline: { type: UnderlineType.SINGLE }, color: '0563C1' })] }),
  ], { align: AlignmentType.CENTER, after: 360,
       border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '000000', space: 4 } } }),
];
d.recipientAddress.forEach((line, i, a) => kids.push(p(line, { after: i === a.length - 1 ? 240 : 0 })));
kids.push(p(d.date, { align: AlignmentType.RIGHT, after: 240 }));
kids.push(p(d.subject, { after: 240, run: { bold: true } }));
kids.push(p(d.salutation, { after: 160 }));
d.paragraphs.forEach(t => kids.push(p(t, { after: 160, align: AlignmentType.LEFT })));
kids.push(p(d.signoff, { before: 80, after: 0 }));
kids.push(p('', { after: 0 }), p('', { after: 0 }), p('', { after: 0 }));
kids.push(p(d.name, { after: 240 }));
kids.push(p(d.enclosures, { after: 0 }));

const doc = new Document({
  creator: d.name, title: d.subject,
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 },
    margin: { top: 1134, bottom: 1134, left: 1247, right: 1247 } } }, children: kids }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(outFile, b); console.log('Generated:', outFile); });
