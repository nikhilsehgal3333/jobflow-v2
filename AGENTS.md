# JobFlow v2

Turn one job posting into a tailored application package for Nikhil Sehgal.
Portable — any capable CLI agent (Claude Code, Gemini, Codex, OpenCode, Cursor) runs this the
same way. Deterministic work is done by the node scripts here; the writing is done by you.

**Read both of these before writing anything:**

- **`RULES.md`** — 25 rules and the pipeline. How to work.
- **`PROFILE.md`** — his experience, the confirmed facts, and the **NOT-HELD ledger**. What is
  true. Check the ledger before scoring a role or writing a bullet.

Side jobs (Ausbildung, Bäckerei, Gastronomie, Lebensmittel) run from **`SIDE-JOBS.md`** instead
of `PROFILE.md`, in German, into `<outputRoot>/Side jobs/<Company>_<Role>/`.

Everything else lands in `<outputRoot>/<Company>_<Role>/` — CV `.docx`, `contacts.md`,
`email_draft.txt`, `run_summary.md`, and a cover letter only when asked.

Requirements: Node 18+ (tested on 24), the `docx` package (already in the parent project),
optionally `cloakbrowser` for JS-heavy or blocked postings. Paste always works.

Rules and facts are kept in separate files on purpose. v1 mixed them and the facts went stale
inside the rulebook — see `audit/` for what that cost.

**One run leaves one `.docx` and one source JSON** (rule 11). The verify loop in rules 20-23 is
two or three passes over the *same* file, not `_v2`, `_v3`, `_v4`. A `_v2` is written when he
asks for one, or when the folder already holds a package from an earlier run.

**v1 in `../jobflow/` is untouched and still works.** This is a parallel version, not a
replacement. Both write to the same `Agent Response` root, so a v1 package sitting in that folder
counts as an earlier run under rule 11 — give the new file its own name rather than overwriting
something that may already have been sent.
