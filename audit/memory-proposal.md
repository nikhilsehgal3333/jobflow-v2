# Memory — proposal only, nothing applied

**Live memory is untouched.** Every file below is exactly as it was. This is what I would
change and why, for you to approve or reject.

**There are two memory scopes for this tree**, keyed to which directory Claude Code starts in.
Both are audited here.

| Scope | Path | Fires when you start in | Files | Words |
|---|---|---|---|---|
| **A** | `D--Resume-Agent-Skill-jobflow/memory/` | `jobflow\` | 34 | 33,236 |
| **B** | `D--Resume-Agent-Skill/memory/` | `Agent Skill\` (the parent) | 7 | 1,592 |

**Proposed:** Scope A 34 → 7 (~1,900 words) plus one relocated project file. Scope B 7 → 2.

---

---

# Scope A — `D--Resume-Agent-Skill-jobflow/memory/` (34 files)

## Why memory got this big

Memory's contract is one file, one fact, small enough to load every session. What actually
happened is that **memory became the patch layer for a content bank nobody updated.** The
phrase *"Master Prompt update owed"* appears in **eight separate memories**. Every one of them
records a fact Nikkhil confirmed, notes that the Master Prompt should be corrected, and then
carries the correction itself — forever.

Once `PROFILE.md` holds the corrected facts, those memories have no job left.

---

## Group A — fold into `PROFILE.md`, then delete (19 files, ~24,000 words)

Every one is a confirmed fact about his experience. All of it is now in `PROFILE.md` at the
role it belongs to.

`project-cdp-customer-success-skills` · `project-climate-policy-research-credentials` ·
`project-communications-portfolio-confirmed` · `project-epd-dpp-product-compliance` ·
`project-eu-taxonomy-sap-group-accounting` · `project-holistics-leasing-site-acquisition` ·
`project-leadership-level-presentation` · `project-network-coordination-heavy-industry` ·
`project-product-owner-scope-boundary` · `project-product-safety-regs-confirmed` ·
`project-real-estate-esg-technical-stack` · `project-real-estate-pm-applications` ·
`project-social-impact-scope-boundary` · `project-sql-dashboards-fee-ops` ·
`project-training-delivery-sap-lms` · `project-tui-double-materiality-depth` ·
`project-tui-llm-assistant-boundary` · `project-work-permit-status-changed` ·
`reference-holistics-environmental-permitting` · `reference-construction-site-credentials-gap`

Their **NOT-HELD** content — the most valuable thing in the whole system — is consolidated into
one ledger in `PROFILE.md` rather than scattered across twenty files where a scope boundary can
be missed. That scattering has already cost: `project-holistics-leasing-site-acquisition`
records that **retail was reported to him as a gap when it was already in a different memory**.

## Group B — fold into `RULES.md`, then delete (4 files, ~2,700 words)

| File | Now |
|---|---|
| `feedback-cv-writing-standards` | rules 1, 2, 14, 15, 22 |
| `reference-cv-page-count-check` | rule 22, with the Word COM snippet and the 956/1,011-word calibration |
| `reference-audit-cv-german-jds` | rule 23 |
| `feedback-india-jobs-contact-details` | rule 8, plus `contactIndia` in `config.json` |

## Group C — fold into `PROFILE.md`, then delete (1 file)

`reference-ats-platforms-per-employer` → the ATS table in `PROFILE.md`, including the DHL =
Avature correction and the three `detect-ats.mjs` gaps.

## Group D — relocate out of memory (1 file, 21,394 words)

**`project-active-job-applications.md` is not a memory.** It is an append-only application log
that has grown to 21,394 words in a single file — 64% of all memory by volume, loaded as
context every session. It has no headings and no structure; entries are one paragraph per
application, appended.

Proposed: move to `Agent Response/APPLICATIONS.md` (or `jobflow-v2/APPLICATIONS.md`) as a
project file, and leave a one-line memory pointer. Nothing is lost; it stops being loaded every
session, and it becomes something you can actually scan.

## Group E — keep (6 existing + 1 new)

| File | Why it stays |
|---|---|
| `user-nikkhil-sehgal` | Who he is. **Rewrite:** trim the career detail now in `PROFILE.md`; keep identity, the two-email ambiguity, and a pointer to `PROFILE.md`. |
| `feedback-separate-files-for-edits` | Cross-cutting. Applies to vision papers, proposals and PhD documents, not only JobFlow, so `RULES.md` rule 11 does not fully cover it. |
| `project-saas-sales-pivot` | **Targeting** strategy, not CV facts: the deliberate move into sales, AE roles structurally closed, cold email and LinkedIn yes, cold calls and sales tools no, no formal BD targets. Nothing in `PROFILE.md` decides which jobs to pursue. |
| `project-side-jobs-ausbildung` | The mode exists at all. **Rewrite:** point at `SIDE-JOBS.md`. |
| `reference-law-firm-roles-gated` | A reusable gate-check procedure with four ordered tells and the team-page test. Rule 6 compresses it to one line; the detail earns its own file. |
| `reference-research-skill-systems` | External systems (PhD system, academic-paper-reviewer, `md2docx.cjs`). Unrelated to JobFlow; a genuine reference. |
| **`project-jobflow-v2`** *(new)* | That v2 exists, that `PROFILE.md` is the fact bank, and that v1 still works. Without this, a fresh session has no idea v2 is there. |

---

# Scope B — `D--Resume-Agent-Skill/memory/` (7 files, 1,592 words)

This scope was missed in the first pass. It is keyed to the **parent** folder, so it loads when
a session starts in `D:\Resume\Agent Skill\` rather than in `jobflow\`. Two of its files have a
live cost.

| File | Verdict | Reason |
|---|---|---|
| **`project_jobflow_workflow.md`** | **Rewrite — live cost** | Describes v1 in detail and instructs *"follow `jobflow/AGENTS.md`"*. A session starting in the parent folder is routed to v1 and never learns v2 exists. It also carries three retired claims: that the Excel cash-flow models need attribution confirmed before use (now confirmed), that the `humanizer` skill must scrub cover letters (dependency dropped), and that the Master Prompt was deliberately left untouched (superseded by `PROFILE.md`). |
| **`project_active_files.md`** | **Rewrite — live cost** | Says *"For all CV creation sessions, use only these two files: Master Prompt v4 and Anti-AI Detection Rules."* That is now the wrong instruction — it points a fresh session straight at the stale content bank, including the wrong visa. |
| `feedback_profile_section.md` | Fold, then delete | Fully carried by rule 15, which was written from it. |
| `feedback_resume_register.md` | Fold, then delete | Register and humanizer boundary → rules 16, 18, 19. Note its bullet-count guidance (*"never leave a relevant role thin"*) is exactly the line that fought the 2-page limit — see `conflicts.md` #3. |
| `feedback_cover_letter_format.md` | Fold, then delete | → **rule 25**. Auditing this scope is what surfaced the gap: v2 had no cover-letter writing rule at all until this file was read. |
| `feedback_output_path.md` | Delete | Enforced by `config.json` and the scripts. Nothing to remember. |
| `MEMORY.md` | Rebuild | Index. |

**Proposed Scope B: 2 files.** One rewritten `project_jobflow_workflow` naming v2 as current
and v1 as the parallel legacy version, one rewritten `project_active_files` pointing at
`PROFILE.md` and `RULES.md`, plus a 2-line index.

**Worth doing before Scope A**, and it is much lower risk: six of the seven are either
duplicated in `RULES.md` or actively wrong, and the two rewrites are what make v2 discoverable
from the parent folder at all.

---

## The risk, stated plainly

Memory auto-loads every session. `PROFILE.md` does not — it has to be read. Deleting 24 memory
files moves ~26,000 words of hard-won confirmed facts from *always present* to *present when
read*. If a future session writes a CV without opening `PROFILE.md`, the NOT-HELD ledger is not
in context and overclaiming becomes possible again.

Two things make it safe, and both are required:

1. The new `project-jobflow-v2` memory must say, in its first line, that `PROFILE.md` is the
   fact bank and must be read before any CV work. That single pointer is what the other 24
   files collapse into.
2. `CLAUDE.md` in `jobflow-v2/` already says the same — and unlike the Master Prompt, it is
   short enough to actually be read.

**Recommendation: do this in two steps.** Run three or four real applications through v2 first.
If `PROFILE.md` holds up — nothing missing, nothing overclaimed — then delete Groups A-D. Until
then the memories are duplication, which is wasteful but harmless. Deleting first and finding a
gap later is the only version of this that loses information.

This caveat applies to **Scope A only**. Scope B carries almost no unique information — six of
its seven files are duplicated in `RULES.md` or wrong — so there is nothing to lose there.

## If you want it applied

**Scope B (recommended first):** rewrite `project_jobflow_workflow` and `project_active_files`
to name v2, delete the other four, rebuild the index. Low risk, and it is what makes v2
discoverable from the parent folder.

**Scope A (after a few real runs):** fold and delete Groups A-D, relocate the application log,
rewrite the three Group E files, write `project-jobflow-v2`, rebuild `MEMORY.md`.

Nothing happens to `jobflow/` either way.
