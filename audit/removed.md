# What was removed, and why

Every instruction in JobFlow v1 was put to three questions:

1. **Would I already do this without being told?** → yes = remove
2. **Is it correcting a weakness I no longer have?** → yes = remove
3. **Does it conflict with anything else I've been told?** → yes = remove or reconcile

What survives is only what I would measurably get wrong without. Nothing here is deleted from
v1 — `jobflow/` is untouched. This is the record of what v2 chose not to carry.

*(Note on reading the brief: taken literally, "if the answer is no to any question, mark for
removal" inverts the goal, since a rule I would **not** follow unprompted is exactly one worth
keeping. I used the stated aim — keep only what I'd fail without.)*

---

## Failed Q1 — I would do this anyway

| Removed | From | Why |
|---|---|---|
| **The Foundational Principle** and its five implications — a CV is a targeted argument; different bullets per JD; reorder within a role; re-categorise skills; elevate roles out of order | MP §0 | This is what tailoring *means*. I do all five unprompted. ~250 words to say "tailor the CV". |
| **The Cognitive Methodology**, Levels 1-4 (surface matching → requirement analysis → gap analysis → hiring manager test) | MP §4 | "Read the JD carefully and check fit honestly." The one operational part — mapping requirements to evidence before writing — is kept as rule 13. |
| **Self-Critique Rule** — "silently ask: is this convincing? did I mirror the JD's language? would I interview this person?" | MP §0 | Default. Also unfalsifiable as an instruction. |
| **Delivery Ritual** steps 1, 3, 4, 5, 10, 11 — job-analysis header, gap table, key differentiators, positioning strategy, footer echo, "why this works" | MP §8 | Presentation ceremony. The parts that carry information — fit score and the honest gap list — are kept as rules 2 and 4. |
| **Two Harvard action-verb banks**, ~90 verbs across both | MP §12 + `writing-standards.md` | I don't need a list of English verbs. I need the constraint, which is rule 16: vary openers, no weak verbs. |
| **Anti-AI Rule 2** — three bullet types with a 30% / 40% / 30% target ratio and no two consecutive bullets alike | Anti-AI | Varying bullet length is default. The ratio is unmeasurable in practice and was never checked. |
| **Anti-AI Rule 3** — no phrase may repeat across roles | Anti-AI | I don't paste the same phrase into three roles. |
| **Anti-AI Rule 5** — every bullet needs a detail that could only come from that role | Anti-AI | "Be specific." Already forced by rule 13's requirement-mapping and by drawing from a real evidence bank. |
| **Anti-AI Rule 7** — the PROFILE should read human, not templated | Anti-AI | Subsumed by rule 15, which is far more specific about what the profile may and may not contain. |
| **The pipeline, restated three times** for three CLIs | `CLAUDE.md`, `GEMINI.md`, `SKILL.md` | Three files whose job was to point at a fourth. v2 has one entry point. |
| **`humanizer/SKILL.md` as a dependency** | AGENTS, writing-standards, CLAUDE, GEMINI, SKILL | JobFlow used one idea from it — strip mechanical tells, don't casualise — and then needed **five** files to warn me off its "Personality and Soul" section. The idea is now rules 18 and 19; the dependency and all five warnings are gone. |
| **`examples/cv.example.json` pointer, config path list, output-shape diagrams** | AGENTS §"What you produce" | The script headers document their own JSON shape. Reading a schema twice does not improve it. |

## Failed Q2 — correcting a weakness I no longer have

| Removed | From | Why |
|---|---|---|
| **The AI-detector premise** — "modern ATS platforms increasingly use AI detection; uniform structures trigger these filters and reduce callback rates" | Anti-AI, opening | Mainstream ATS platforms do keyword and semantic matching, not authorship detection. The three Anti-AI rules that survived (opener diversity, German Nominalstil, varied polish) survived because they make the writing *better*, not because they defeat a detector. Keeping the false premise attached to them made the good rules easy to dismiss. |
| **H1 banned-vocabulary list** — 20 words plus examples: testament, pivotal, tapestry, delve, garner, intricacies, vibrant, groundbreaking… | MP §17 | I do not write "tapestry" or "garner" in a CV. Four of the twenty still creep in, so those four are named inside rule 18; the other sixteen and the worked examples are gone. |
| **H2 no copula substitutes** — serves as, stands as, acts as, boasts, features | MP §17 | Largely gone from my formal-document writing. Folded into rule 18 without its own section. |
| **H6 drop routine hyphens** — write "cross functional", "data driven", "client facing" | MP §17 | Not an AI tell; a house style preference, and a contestable one ("cross-functional" is standard usage). No evidence it ever mattered. |
| **The 8-item self-audit checklist** | Anti-AI | Manual re-derivation of what `audit-cv.mjs` and rules 14-19 already enforce. Item 8's "two-pass final audit" is just "check your work twice". |
| **`writing-standards.md`'s 5-item pre-delivery checklist** | writing-standards | Same content as the rules immediately above it in the same file. |

## Failed Q3 — conflicts, or dead on arrival

| Removed | From | Why |
|---|---|---|
| **§9 MANDATORY POST-BUILD KEYWORD AUDIT** — "*mentally* extract the CV text", list every JD term yourself | MP §9 | Directly contradicted by `AGENTS.md` §4b, which cites the measurement: a hand-written list reported "full coverage" where a JD-derived list found **24 and 26 misses on the same files**. §9 is not merely redundant, it is the failure mode. Replaced by rules 20-21. |
| **§14 "Assuming CBAM/ESPR/DPP experience — awareness-level only, don't put in bullets"** | MP §14 | Now false. EPD, DPP, EUDR, PPWR and EmpCo are confirmed hands-on; CBAM is confirmed at the importer/customs interface. The blanket ban caused under-scoring on exactly the roles growing as CSRD contracts. Corrected in `PROFILE.md`. |
| **§5 / §14 "NO changing original job titles"** | MP §5, §14 | Overridden by Nikkhil's 31 July instruction to use `<Role> (Work Study)`. Two files still stated the old rule as absolute. v2 carries no title rule at all — the titles are simply written correctly in `PROFILE.md`. |
| **§15 Technical Implementation** — docx `require` block, `CONTENT_WIDTH = 10466`, `LevelFormat.BULLET`, tab-stop and hyperlink notes | MP §15 | Already implemented inside `cv-generator.cjs`. I call `generate-cv.mjs`; I never hand-write docx. |
| **§15 validation command and output path** — `python /mnt/skills/public/docx/scripts/office/validate.py`, output to `/mnt/user-data/outputs/` | MP §15 | Linux paths from a different environment. Neither exists on this Windows machine. Dead instructions that would fail if followed. |
| **"Use the `ask_user_input_v0` tool"** | MP §0 | That tool does not exist here. The tool is `AskUserQuestion`. The *behaviour* — 2-4 framed options, never open-ended — is kept in rule 5. |
| **§8's fit rubric** (9-10 excellent / 7-8 good / 5-6 moderate / 3-4 weak / <3 no match) | MP §8 | A second, differently-banded scale competing with `AGENTS.md` §2b (8-10 / 5-7 / 3-4 / 1-2). A 7 was "good match, build" in one and "transferable with gaps" in the other. v2 keeps one rubric (rule 4). |
| **`jobflow/__anti_ai_rules.md`** | jobflow/ | Byte-identical duplicate of `../Anti_AI_Detection_Rules.md`, verified by diff. Two copies to keep in sync, and only one would ever get edited. |
| **§0 "Paste it as a system prompt into any capable AI assistant. No companion file needed — everything is here."** | MP §0 | False. Eight companion files exist, and the Master Prompt is contradicted by several of them. |
| **`pivot-playbook.md` §5 "Indian nationality + Section 20 visa is screened out at step one"** | pivot-playbook | Built on the stale visa record. He holds a valid German work and residence permit. The EU-nationality gate itself is real and is kept as rule 6. |
| **`pivot-playbook.md` §2 "note SQL is coursework-level"** and the "confirm the Excel models before leaning on them" caveat | pivot-playbook | Both superseded. SQL and dashboards are confirmed across all four ESG roles; the Excel EPR fee modelling is confirmed and is now his strongest quantitative evidence. |
| **`side-jobs-profile.md` visa line** | side-jobs-profile | Same stale Job Seeker Visa record. Corrected in `SIDE-JOBS.md`, where for an Ausbildung application it is the single most important line. |
| **`writing-standards.md` "never leave a relevant role thin (2 bullets) just to look concise"** | writing-standards | Pushed directly against the 2-page limit and helped produce the 3-page CV rejected on 10 August. v2 states the limit as a hard gate (rule 22) and lets coverage set bullet count *inside* it. |

## Compressed rather than removed

`pivot-playbook.md` (1,528 words) → rule 7 plus the transferable-cluster mapping, which is
positioning *evidence* and moved into `PROFILE.md`'s angles table. The three-way gap diagnosis
(framing / targeting / stretch) is the part I would not produce unprompted, so it stayed.

`AGENTS.md` §4b (the keyword-audit doctrine) → rules 20-21, with the 24-and-26-misses
measurement kept verbatim. The number is what makes the rule stick; without it, "derive
keywords from the JD" reads like a preference.

Master Prompt §1-3, §7, §11 → `PROFILE.md`. These were never instructions. They are facts, and
keeping facts inside a rulebook is why they went stale.

## One correction to this audit

**Rule 25 (cover letters) was missing from the first cut of `RULES.md`.** `writing-standards.md`
noted the visual layout was "implemented in `generate-cover-letter.mjs`", which is true of the
rendering but not of the writing — the Wonsulting structure, the two SKILL blocks, and looking
up the recipient's legal entity and address are all agent work. It was dropped by accident, not
by judgement, and restored after auditing the second memory scope, where
`feedback_cover_letter_format.md` surfaced it. Worth recording: the failure mode was assuming a
rule was covered by tooling because a file said it was.
