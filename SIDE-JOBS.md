# Side Jobs — Ausbildung / Bäckerei / Gastronomie / Lebensmittel

Source of truth for side-job applications: Ausbildung as a baker, food production, gastronomy,
kitchen help, service, food retail. **This replaces `PROFILE.md`** for these roles — no
ESG/consulting positioning, no matter how well it would score.

Canonical source document: `../Agent Response/Side jobs/Lebenslauf.docx` (German).
**Never overwrite it.** Tailored CVs go to `../Agent Response/Side jobs/<Company>_<Role>/`.

`RULES.md` still applies in full — no fabrication, honest fit score, no em dashes, never
overwrite, mechanical AI-tell pass, never casualise.

---

## Identität

- Nikhil Sehgal · Berlin, Deutschland · +49 172 6568115 · nikkhilsehgal@gmail.com
- Geburtsdatum: 03.08.1998 (German CVs may include it; omit on English CVs)
- **Gültige deutsche Arbeits- und Aufenthaltserlaubnis** — er darf bereits arbeiten.
  Für eine Ausbildung ist das der entscheidende Punkt, also nach vorne stellen.
  *(Corrected 23 Jul 2026 — the old "Job Seeker Visum" record was wrong.)*
- Sprachen: Hindi Muttersprache · Englisch fließend · **Deutsch B2.1**

## Profil (Basis — pro JD anpassen)

Motivierter und zuverlässiger Bewerber mit Erfahrung in Gastronomie, Catering und
Kundenservice. Praxiserfahrung in einem asiatischen Restaurant in Neu-Delhi sowie Interesse an
handwerklicher Arbeit, Lebensmitteln, Hygiene und strukturierten Arbeitsabläufen. Ziel ist eine
Ausbildung im Bäckerhandwerk, um praktische Kenntnisse in Herstellung, Vorbereitung und Verkauf
weiter auszubauen.

Für Nicht-Bäckerei-Stellen den Zielsatz austauschen (Gastronomie, Lebensmittelproduktion,
Verkauf). Ein Bäckerei-Ziel darf nie auf einem Nicht-Bäckerei-Lebenslauf stehen.

## Berufserfahrung

**Mitarbeiter Gastronomie / Catering — Oriental Garden, Neu-Delhi, Indien**
Asiatisches Restaurant, Connaught Place / Marina Arcade.
**Daten bestätigt am 20.08.2026: 2016 - 2020**, parallel zum B.Arch-Studium, also Teilzeit.
Damit entfällt die frühere Rückfrage. Auch auf englischsprachigen Fach-Lebensläufen einsetzbar,
wenn eine Stelle Gastronomie- oder Hotelerfahrung verlangt — dort als
"Restaurant and Catering Team Member (Part-time), 2016 - 2020".

- Unterstützung im täglichen Restaurant- und Cateringbetrieb in einem lebhaften
  gastronomischen Umfeld
- Mithilfe bei der Vorbereitung von Speisen, beim Anrichten sowie bei allgemeinen Küchenarbeiten
- Sicherer und sauberer Umgang mit Zutaten, Arbeitsflächen und Küchenutensilien nach
  Hygienestandards
- Unterstützung im Service und freundlicher Umgang mit Gästen
- Teamarbeit unter Zeitdruck sowie zuverlässiges Arbeiten in Stoßzeiten
- Erfahrung mit Ordnung, Sauberkeit und strukturierten Abläufen im Lebensmittelbereich

Auswählen und umsortieren nach JD. Keine neuen Tätigkeiten, Kennzahlen, Zertifikate
(Gesundheitszeugnis, Infektionsschutzbelehrung) oder Arbeitgeber erfinden — nachfragen.

## Ausbildung

- MBA, TU Berlin, Deutschland — Masterabschluss, Unterrichtssprache Englisch.
  **Eine kurze Zeile.** Der MBA ist Kontext, nicht die Bewerbung. Keine Beratungs- oder
  ESG-Details, sonst wirkt die Bewerbung überqualifiziert.

## Kenntnisse

Erfahrung in Gastronomie und Catering · Grundkenntnisse in Lebensmittelvorbereitung ·
Hygienebewusstsein und sorgfältige Arbeitsweise · Teamfähigkeit und Belastbarkeit ·
Kundenservice und freundliches Auftreten · Zuverlässigkeit und Lernbereitschaft ·
Interesse an Backwaren, Produktion und Verkauf *(nur bei Bäckerei-Stellen)*

## Stärken

Sorgfältige und saubere Arbeitsweise · hohe Motivation für eine handwerkliche Ausbildung ·
freundliches und respektvolles Auftreten · Flexibilität und Einsatzbereitschaft · Belastbarkeit
auch bei frühem Arbeitsbeginn oder Schichtarbeit

---

## Mode rules (5)

**S1. German by default**, formal Sie-Form, unless the JD is clearly English.

**S2. Keep the German plain.** B2.1 — clear, simple, correct. No C2 constructions, no
consulting register. An Ausbildung application should read like a motivated candidate, not a
Beratungsdeck.

**S3. Score fit against this file, not `PROFILE.md`.** Ask before generating if the JD needs
anything absent here: work dates, Gesundheitszeugnis, Führerschein, Startdatum,
Arbeitszeitverfügbarkeit.

**S4. Lead with shift and early-morning readiness plus hygiene awareness** when the JD asks —
they are the strongest selling points for bakery and food roles.

**S5. Never reproduce the citation artifacts** (`[web:1]` etc.) that appear in the source
Lebenslauf.

Contacts are optional here — small Betriebe usually list a direct application address in the
posting. Use it before deriving anything. On request, write a classic Anschreiben (Motivation →
Erfahrung → warum dieser Betrieb → Verfügbarkeit).

```
node generate-cv.mjs --data cv_side_<company>.json --company "<C>" --role "<R>" \
     --format preferred --lang de \
     --out-subdir "Side jobs/<Company>_<Role>" \
     --filename "Lebenslauf_Nikhil_Sehgal_<Company>.docx"
```
