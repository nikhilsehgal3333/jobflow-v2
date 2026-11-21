# Conflict register

Every place where two live instructions told me different things. Ordered by what each one
actually costs. All of these still exist in `jobflow/` — v1 is untouched — so this doubles as
the fix list if you ever want to repair v1 rather than move to v2.

---

## 1. Work authorisation — wrong in four files, and it disqualifies him

| Says | Where |
|---|---|
| "German Job Seeker Visa (Section 20 Residence Act)" | `jobflow/config.json` line 10 |
| Visa Status: German Job Seeker Visa (Section 20) | Master Prompt §1 |
| "I currently hold a German Job Seeker Visa (Section 20)…" — every pre-built visa answer | Master Prompt §16 |
| "Visa: German Job Seeker Visa (Section 20 Residence Act)" | `side-jobs-profile.md` line 19 |
| "Indian nationality + Section 20 visa is **screened out at step one**" | `pivot-playbook.md` §5 |
| **He holds a valid German work and residence permit** | memory, 23 Jul 2026 |

**Cost:** a job seeker visa is explicitly *not* work authorisation. Any JD phrased like Scope
Ratings' — *"a valid work and residence permit is a prerequisite"* — screens him out on the
false record and not on the true one. Several already-delivered CVs and cover letters state the
outdated status, and `pivot-playbook.md` will actively recommend skipping roles he is eligible
for.

**Resolved:** `PROFILE.md` and `SIDE-JOBS.md` state the permit; `config.json` carries
`workAuthorisation` with the correction note. Open question flagged, not invented: the exact
designation and expiry are still unknown.

## 2. The keyword audit contradicts itself — and one side is measurably wrong

| Says | Where |
|---|---|
| "**Mentally** extract the CV text… list every technical term from the JD" — titled **MANDATORY** | Master Prompt §9 |
| "Derive the terms **FROM the JD, never from memory**. Writing your own list *systematically overstates coverage*" | `AGENTS.md` §4b |
| A third variant | Addendum v5 §5 |

**Cost:** measured twice on real applications — a hand-written list reported "full coverage"
where a JD-derived list found **24 and 26 misses on the same files**. §9 is not redundant with
§4b; it is the exact failure §4b was written to stop, and it is the one labelled mandatory.

**Resolved:** rules 20-21, one method, measurement kept.

## 3. Page limit versus bullet coverage — no file knew about the other

| Says | Where |
|---|---|
| Bullet count "follows coverage, not a rule"; most relevant roles carry 4-6 bullets; "never leave a relevant role thin (2 bullets) just to look concise — that was a past mistake" | `writing-standards.md` |
| **Two pages max**, ~1,000 words is the ceiling, measure with Word COM | memory, 10 Aug 2026 |

**Cost:** a 3-page CV delivered and pushed back on 10 August (TSL). The page limit appears in
**no** instruction file — not `AGENTS.md`, not `writing-standards.md`, not the Master Prompt —
while the file that *is* read before writing pushes bullet counts up. `audit-cv.mjs` gives no
warning: its "lines" figure counts source paragraphs, not rendered pages.

**Resolved:** rule 22 makes the limit a hard gate with the Word COM measurement and the
calibration (956 words → 2 pages, 1,011 → 3). Rule 13 lets coverage set bullet count *inside*
that ceiling.

## 4. §14 blocks claims that are now true

| Says | Where |
|---|---|
| "Assuming CBAM/ESPR/DPP experience — these are **awareness-level only**; don't put in bullets" | Master Prompt §14 |
| EPD, DPP, EUDR, PPWR, EmpCo confirmed **hands-on**; CBAM confirmed at the importer/customs interface | memory, 29 Jul - 6 Aug 2026 |

**Cost:** under-scoring on product-compliance roles, which are a growth area precisely as CSRD
contracts. The memory entry says it outright: "the blanket rule causes under-scoring".

**Resolved:** `PROFILE.md` states the boundary precisely — interface yes, embedded-emissions
calculation and filing no.

## 5. Job titles — an "absolute rule" that was overridden

| Says | Where |
|---|---|
| "**NO changing original job titles**" (listed under Absolute Rules, repeated in Common Mistakes) | Master Prompt §5 and §14 |
| Use `<Role> (Work Study)` / `(Werkstudium)`, never "Working Student - " | memory, 31 Jul 2026 |

**Cost:** low but recurring — the memory itself has to carry the override, and roughly 150
older `cv_*.json` files still use the old prefix.

**Resolved:** v2 has no title rule. The titles are written correctly in `PROFILE.md`, which is
the audit's own principle: encode it where it cannot go stale.

## 6. Two fit rubrics with different bands

| Says | Where |
|---|---|
| 9-10 excellent / 7-8 good / 5-6 moderate / 3-4 weak / <3 no match | Master Prompt §8 |
| 8-10 core met / 5-7 transferable with gaps / 3-4 stretch / 1-2 wrong field | `AGENTS.md` §2b |

A 7 is "good match, build it" in one and "solid transferable with gaps" in the other.
**Resolved:** rule 4, one scale.

## 7. SQL and the Excel models — understated in two places

| Says | Where |
|---|---|
| SQL = MBA coursework; Power BI a bare skill | Master Prompt §3D |
| "note SQL is coursework-level"; "confirm the Excel cash-flow models before leaning on them" | `pivot-playbook.md` §2 |
| SQL and dashboards confirmed across **all four** ESG roles; EPR fee modelling in Excel is his strongest quantitative evidence | memory, 28 Jul / 6 Aug 2026 |

**Cost:** ops-flavoured roles (product ops, compliance ops, billing ops) scored low because the
record read as pure ESG advisory. Confirming these moved one fit from 6 to 7.
**Resolved:** in `PROFILE.md` under Skills and KarbonWise Current.

## 8. ATS table — stale, and it caused four wrong builds

Master Prompt §6 lists 12 platforms and is not wrong, but memory carries 14 employer-specific
confirmations it lacks, including the correction that **DHL is Avature, not Workday**. Four DHL
packages were built title-first on that wrong assumption. `detect-ats.mjs` also does not know
HRlab, Eightfold or Pinpoint.

**Resolved:** the confirmed table and the three tooling gaps are in `PROFILE.md`; rule 9 says
confirm from the live apply URL, never infer from brand.

## 9. Duplicate file

`jobflow/__anti_ai_rules.md` is **byte-identical** to `../Anti_AI_Detection_Rules.md` (verified
by diff). Two copies, one of which would be edited and the other silently left behind.

## 10. Dead references

- Master Prompt §15: `python /mnt/skills/public/docx/scripts/office/validate.py` and output to
  `/mnt/user-data/outputs/` — Linux paths that do not exist on this machine.
- Master Prompt §0: "Use the `ask_user_input_v0` tool" — not a tool in Claude Code.
- Master Prompt §0: "No companion file needed — everything is here" — eight companion files
  exist, several of which contradict it.

---

## The pattern underneath all ten

Nine of the ten are the same failure: **a fact was written inside an instruction file, the fact
changed, and the instruction stayed.** Memory then accumulated ~20 entries whose job is to
contradict the rulebook — the phrase *"Master Prompt update owed"* appears in eight separate
memories and was never once acted on.

That is why v2 splits `RULES.md` from `PROFILE.md`. Rules are stable and few. Facts change
weekly and belong in one place where a correction lands once and is visible.
