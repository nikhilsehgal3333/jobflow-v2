# JobFlow v2 — Rules

26 rules. Every one survived the test: **would I measurably get this wrong without being
told?** Anything I would already do, anything fixing a tic I no longer have, and anything
contradicted elsewhere was cut. See `audit/removed.md` for what went and why.

Facts are not here. They are in `PROFILE.md`, on purpose — v1 mixed rules and facts in the
same files, and the facts rotted inside the rulebook.

---

## Integrity

**1. Never fabricate.** No invented tools, metrics, tenure, employers or titles. A keyword
with no truthful basis stays missing. This is the load-bearing rule; keyword pressure is
exactly when it bends.

**2. Report the gap.** The terms he does not hold go to the user explicitly and into
`run_summary.md`. A CV that hits every keyword is either a perfect fit or a dishonest
document.

**3. Read the NOT-HELD ledger in `PROFILE.md` before scoring or writing.** It lists what he
has been asked about directly and does not have. Most overclaiming starts as a reasonable
guess about something already settled.

## Before writing

**4. Score fit 1-10 against the JD's own requirements, and say it plainly.**
8-10 core requirements directly met · 5-7 solid transferable match with gaps · 3-4 meaningful
stretch, a core requirement is a gap · 1-2 wrong field. One rubric, no second scale.

**5. When a requirement is uncertain, ask — do not guess.** 1-3 tappable multi-select
questions with concrete options, never "tell me more". Undocumented experience has moved fit
by 1-3 points over and over; guessing costs those points permanently. Re-score on the answer
and flag that `PROFILE.md` needs updating.

**6. Check eligibility gates before building anything.** EU institutions require EU
nationality. A Kanzlei Associate seat requires a Volljurist — open the firm's team page and
count non-lawyer fee-earners. Construction and site roles require a driving licence, which he
does not hold. No CV craft fixes a gate; say so and redirect.

**7. Out of lane, or below 6? Re-anchor before writing.** Lead with the transferable cluster
he can evidence, not the job title. Name the gap type out loud: **framing** (re-order and
re-language real experience), **targeting** (no CV fixes it — name a better-fitting seat), or
**genuine stretch** (one honest gap, route it to the cover letter).

**8. India-based roles use the India contact block** — New Delhi, +91 7042509790. Override it
in the CV and cover JSON; German defaults are for European roles.

## ATS and files

**9. Workday and Taleo take the title-first format. Everything else takes `preferred`.**
Confirm from the live apply URL or the requisition prefix — never infer from the employer's
size or brand. DHL is Avature, not Workday; assuming otherwise put four DHL CVs in the wrong
format. `PROFILE.md` holds the confirmed per-employer table.

**10. `jd.txt` holds the posting text only.** ATS notes, format decisions and strategy go in
`run_summary.md`. Anything else in `jd.txt` pollutes the extracted term list.

**11. One run, one file. Iterate in place.** Rules 20-23 guarantee two or three passes — keyword
misses, then page count, then wording. Those are drafts of one document, not variants:
regenerate over the **same `.docx` and the same source JSON** each pass. A finished run leaves
exactly one `.docx` (plus its PDF export where the ATS wants one) and one
`cv_<company>_<role>.json`. Four near-identical files and a note about which one is current is
the failure this rule exists to prevent, not the behaviour it asks for.

The source JSON follows the same rule: **one `cv_<company>_<role>.json`**, edited in place across
passes. Never `_v2`/`_v3` copies of it. A changed JD means the old draft is now wrong — overwrite
it, do not keep it alongside.

There are exactly three reasons to write a `_v2`:

- **He asks for one.** This is the trigger. A second angle he wants kept beside the first.
- The folder already holds a package from an **earlier run** — a previous session, or a build
  from v1 in `../jobflow/`. That file may already have been sent, so it is not yours to replace.
- **`EBUSY`** — Word has the file open. A workaround, not a variant: say so, and fold back to the
  single filename once the lock clears.

Nothing else qualifies. Failing an audit, missing a keyword, running three pages, rewording a
bullet — all of those are the same document, not the next one. When a `_v2` is genuinely right,
say which file is current.

**12. One folder per application.** Never write into another company's folder.

## Writing

**13. Map requirements before writing bullets.** Extract every JD requirement, explicit and
implicit; find the truthful evidence for each; write so a reader can tick one off per bullet.
Cover every important requirement at least once. Bullet count follows coverage — inside the
page limit in rule 22.

**14. No em dashes.** Spaced hyphens. Absolute.

**15. PROFILE is an impersonal summary, 3-4 lines.** Wonsulting shape: hook (title + years) →
2-3 core competencies lifted from the JD → one achievement as X measured by Y achieved by Z.
No education, no languages, no location — they have their own sections and repeating them
reads junior. No pitchy phrasing ("ready to own X end to end", "drives outsized impact") and
no name-dropping run of org names.

**16. Bullets:** strong varied action verb, past tense (present for current role), no first
person, achievement + scope + quantified outcome. No opener word used more than twice across
the CV. Never "helped", "worked on", "was responsible for", "assisted with".

**17. German is verb-driven, not Nominalstil.** If a bullet opens on a `-ung` / `-tion` noun,
rewrite it onto a concrete verb, number or context. Keep the register plain B2 — his German is
B2 and not publication-grade, so never write above it.

**18. Strip the mechanical AI tells:** significance inflation ("marking a significant
milestone", "reflecting a deep commitment"), trailing `-ing` clauses that explain why
something mattered ("...demonstrating strong skills in..."), hedging and filler, and the
vocabulary that still creeps in — leverage, seamless, robust, delve, underscore, showcase,
pivotal, testament.

**19. Never casualise.** Formality is a feature of an application document, not an AI tell.
No conversational asides, no deliberate roughness, no chatty first person. Address a gap with
poise, not confession: not "I'll be straight with you, I haven't sat in UNFCCC sessions" but
"while my experience has centred on research and reporting rather than direct negotiation, it
built the analytical foundation that underpins it".

## Verify — all five before you say a CV is done

**19a. Read the rendered bullets back before running any script, and run the WRITING AUDIT.**
The keyword audit and the page gate score what a parser reads. Nothing else scored what a
human reads, so the writing drifted to fill the only gates that existed: uniform 20-30 word
duty descriptions at exactly two pages, keyword-dense and inert. That is how the Tanso
Founder's Associate CV of 1 Sep 2026 passed every check and was still flat.

`audit-cv.mjs` now prints a WRITING AUDIT (`--show-bullets` lists what it counted). Three
numbers matter:

- **Bullets carrying a number: target 40%+.** Under that, the CV lists duties. A JD saying
  "you'll be judged on whether the thing you owned actually worked" wants results.
- **Bunched at 18-28 words: keep under 60%.** Uniform length is what makes a page read as
  machine-written. Mix in 10-14 word lines; they are the ones that land.
- **Nothing over 28 words.** A bullet that long is two keywords welded together. Split it or
  cut one.

Also: no bullet opens on a responsibility verb (own, manage, support, advise, coordinate,
handle) without a result attached, and keyword lists live in **Skills**, never inside a bullet.
"Advise clients on EUDR and PPWR through ESPR and DPP readiness to the CBAM interface" is a
Skills line wearing a bullet costume.

**When the number does not exist, do not invent one (rule 1) and do not pad around the gap —
shorten the bullet instead.** A short honest line beats a long evasive one. If the quantified
rate is stuck under 40% across a run, the fault is the evidence bank, not the writing: the
metrics bank in `PROFILE.md` holds six figures total. **Ask him for numbers** — client counts,
portfolio size, supplier and entity counts, cycle times, deal sizes, headcount reached. That
question is worth more than any rewrite.

## Verify — the machine checks

**20. Run `audit-cv.mjs`, and derive the keywords FROM the JD.** Never from a list you wrote
yourself. Measured twice on real applications: a hand-written list reported "full coverage"
where a JD-derived list found **24 and 26 misses on the same files**. Your impression of a JD
systematically overstates coverage.

```
node audit-cv.mjs --cv "<...>.docx" --jd "<...>/jd.txt" --company "<brand words to ignore>"
```

**21. Triage every miss into exactly one bin.** **True and missing** → add it, re-run to
confirm it landed. **Not held** → leave it out; this list *is* the honest fit gap, so report
it and route it to the cover letter. **Noise** (the employer's own brand and product names,
inflections of terms already present, JD-side phrasing about the employer) → ignore.

**22. Two pages, maximum — a gate, not a target.** A run at three pages is not finished. Trim and
regenerate **over the same file** until it renders two (rule 11); never deliver the long one with
a note about it. `audit-cv.mjs` does not check this — its "lines" figure counts source
paragraphs, not rendered pages. Measure the rendered file:

```powershell
$w = New-Object -ComObject Word.Application; $w.Visible = $false
$d = $w.Documents.Open("<abs path>", $false, $true)
"PAGES: " + $d.ComputeStatistics(2); "WORDS: " + $d.ComputeStatistics(0)
$d.Close($false); $w.Quit()
```

For `preferred` format the ceiling is roughly **1,000 words**; 956 rendered 2 pages, 1,011
rendered 3. Aim for 900-960 words and about 23 bullets.

**German runs shorter.** Measured 22 Sep 2026 on the camel active CV: **831 words rendered 3
pages, 768 rendered 2.** German compounds are longer per word, so the 1,000-word English figure
overshoots by roughly a quarter. On a German `preferred` CV aim for **740-780 words** and about
24 bullets, and measure rather than trusting the English number. Cut by dropping skills already
evidenced inside bullets, trimming certifications to the 3 most relevant, and cutting the
bullet that maps to fewest requirements — never by shrinking fonts or spacing.

**23. On German JDs the keyword percentage is meaningless.** Transliterated umlauts in
`jd.txt` false-miss against real umlauts in the CV, and the extractor returns hundreds of
German function-word trigrams. One run reported 2% coverage on a CV that had the terms. Keep
the parse test and field extraction, which stay reliable; take the substantive terms from
"Deine Tätigkeiten" and "Dein Profil" by hand. Never quote the percentage to the user.

## Outreach and cover letters

**24. Write value contribution, not petition.** "How my background could add value to what
you're building", never "I would appreciate the opportunity". 4-5 sentences, in the JD's
language, addressed to a real person, claiming only what he actually does now — outreach is
not an expanded CV bullet.

**25. Cover letters follow the Wonsulting structure, in a formal business register.** Only when
asked. Intro hook (passion + qualities) → experiences paragraph → **two SKILL blocks**, each
the skill the JD emphasises as a one-sentence intro plus one project example written as roughly
2 sentences of context, 2 of action, 2 of impact → closing → `Sincerely,`.

Look up the company's **legal entity name and postal address** and pass them as
`recipientAddress` in `cover.json` — omit only if genuinely unknown. Salutation defaults to
`Dear Hiring Manager,`; use a named contact only when the posting requires it and you have
verified the surname (compound surnames are ambiguous — do not guess). The generator renders
the rest: centred ALL-CAPS 18pt name, contact line, address block.

First person is expected here, but measured. Gaps get poise, not confession (rule 19).

---

## The pipeline

```
node fetch-jd.mjs   --url "<URL>" --out "<outputRoot>/<Company>_<Role>"   # or --text
node detect-ats.mjs --url "<URL>" --html-file "<...>/page.html"
   -> fit score + clarifying questions (rules 4-7)   BEFORE writing
   -> write CV content from PROFILE.md (rules 13-19)
node generate-cv.mjs --data cv.json --company "<C>" --role "<R>" --format <fmt> --lang <l>
   -> verify (rules 19a, 20-23). Read the bullets back first. On any miss: edit the SAME cv.json, re-run the SAME command.
      Same filename every pass, no _v2 (rule 11). Loop until it passes at 2 pages.
   -> contacts.md (find-contact skill, or search the company email pattern and derive)
   -> email_draft.txt (rule 24)
node generate-cover-letter.mjs --data cover.json --company "<C>" --role "<R>"   # on request
   -> run_summary.md: source, ATS, format, language, angle, fit score, the not-held gaps
```

Side jobs (Ausbildung / bakery / gastronomy / food) run from **`SIDE-JOBS.md`** instead of
`PROFILE.md`, in German, into `<outputRoot>/Side jobs/<Company>_<Role>/`.
