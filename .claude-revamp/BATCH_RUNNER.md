# Batch Runner — Phase 5 Implementation

You are implementing a batch of screens for the design revamp. Read this
entire file before starting.

## What you're doing

For each screen in the batch list (provided at runtime), run the full
Phase 5 workflow, gate the result, and either commit or stop.

## Inputs (read these FIRST, before any screen work)

- `CLAUDE.md` (root)
- `.claude-revamp/01-codebase-map.md`
- `.claude-revamp/04-design-system-implementation-log.md`
- `.claude-revamp/06-scope-cut.md` (binding scope decisions)

For EACH screen, when you start it, also read:

- `.claude-revamp/screens/<slug>/gap-analysis.md` (or feature-spec.md
  for new screens) — TREAT THE ANSWERS AS BINDING SPEC.
- The Pencil source frame (use `pencil` MCP).

## Per-screen workflow

For each screen, in order:

### Step A — Plan

Write `.claude-revamp/screens/<slug>/implementation-log.md` with:

- Files you will create.
- Files you will edit.
- Schema/type changes (only those approved in gap-analysis answers).
- API/server-action changes.
- New molecules introduced (screen-local only — no new shared
  components without a STOP).
- For new screens: navigation entry points to wire (only those approved
  in feature-spec answers).

### Step B — Implement (in this order)

1. Schema/type changes.
2. API / server-action changes.
3. Lower-level component changes (new molecules).
4. The screen file itself.
5. For new screens: nav entry points in approved files.

After each substep, run `pnpm typecheck`. Do not proceed if it fails —
fix or stop.

### Step C — Quality gate

Run all of these. ALL must pass before declaring done:

1. `pnpm typecheck` exits 0.
2. `pnpm lint` exits 0.
3. `pnpm build` exits 0.
4. Playwright smoke (use `playwright` MCP):
   - Navigate to the route at desktop viewport (1440x900).
   - Assert page mounts without thrown errors.
   - Capture console; fail if any console.error.
   - Network tab: fail if any 4xx/5xx for same-origin requests.
   - Screenshot full page → `.claude-revamp/screens/<slug>/screenshots/desktop.png`.
   - Repeat at mobile viewport (420x900) → `screenshots/mobile.png`.
5. Existing Playwright e2e tests that touch this route:
   - Run them. If any fail because the revamp legitimately changed
     behavior covered by a spec answer in gap-analysis, update the
     test to match the new spec, in the same commit, and note it in
     the implementation log under "Test updates."
   - If a test fails for any other reason: STOP.
6. Spec adherence self-check. Re-read every numbered question's Answer
   in the gap-analysis. For each, name the file:line in your
   implementation that satisfies it. Write this list under
   "Spec adherence" in the implementation log.
   - If any Answer is not satisfied: STOP.

### Step D — Commit

If all gates passed:

- Append "Completed" section to implementation log: files changed
  (file by file), test updates, deviations from plan with reasons.
- `git add` your changes.
- Commit message: `revamp(<slug>): implement per gap-analysis`
- Move to the next screen.

### Step E — Stop conditions

Stop the entire batch (do not continue to next screen) if ANY of these
trigger at any point:

- A question arose that isn't answered in gap-analysis.
- A primitive in `04-design-system-implementation-log.md` needs
  extension beyond what's documented there.
- A schema migration is needed that isn't approved in gap-analysis.
- A NEW shared component (not screen-local molecule) would need to
  be created.
- A field, copy string, or behavior is implied by Pencil but not
  covered by an Answer.
- Existing test fails for reason not isolated to an approved spec
  change.
- Build/typecheck/lint can't be green after ONE fix attempt.
- Playwright smoke fails (rendering, console errors, broken network)
  after ONE fix attempt.

When stopping:

- Write `.claude-revamp/screens/<slug>/STATUS.md` describing:
  the stop reason, what you tried, what you need from me to unblock,
  and the gap-analysis question number that should have covered this
  (if any).
- Commit the WIP to branch `revamp/<slug>-WIP-blocked` so I can
  review.
- Switch back to the main revamp branch.
- DO NOT proceed to the next screen.
- DO NOT try to "work around" the block.
- Write a final summary message and exit.

## Hard rules (apply to every screen, every step)

- Gap-analysis Answers are SPEC. Do not deviate.
- Do not modify any screen other than the current one (except approved
  nav entry points for new screens).
- Do not modify primitives or design tokens. They are locked.
- Do not introduce new shared components. Screen-local molecules only.
- Match Pencil pixel-precisely. Use `pencil:batch_get` for measurements,
  copy, and spacing — do not eyeball.
- For schema additions: update Zod (or whatever validates), the form,
  the API handler, and the type definitions in the same commit.
- One commit per screen. Never combine screens.
- Never skip the gate. Never declare done with a failing gate.

## Self-iteration policy

You may iterate up to 3 times to fix gate failures (typecheck, lint,
build, smoke). After 3 attempts, STOP and surface the error. Do not
keep trying.

## Output format

After EACH screen (whether shipped or stopped), write a one-line summary
to `.claude-revamp/05-batch-progress.md` in the form:

`<timestamp> | <slug> | SHIPPED | <commit-sha>` — or
`<timestamp> | <slug> | STOPPED | <one-line reason>`

This is your batch ledger. Append-only.

The STATUS.md file you write must include a placeholder line:

## Resolution

(none yet — operator will fill this in once unblocked)

The runner will pick up the screen for retry only after this section
contains real content.
