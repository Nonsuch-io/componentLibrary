# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:7510c1e2 -->

## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

<!-- END BEADS INTEGRATION -->

## PR titles: the bead id must be FULL and in PARENTHESES

```
feat(a11y): turn the axe gate on (componentLibrary-057)
```

Not `(057)`, not `[componentLibrary-057]`. The merge webhook auto-closes the bead by
matching `\(({ID})\)` in the title, where `ID = [a-z][a-z0-9]*-[a-z0-9]+` — so a short
id has no prefix and no hyphen and matches nothing, and brackets are not parens.

The failure is SILENT and looks like success: the PR merges, CI is green, and the bead
just stays open — where the author closes it by hand at session-close and erases the
evidence. Measured 2026-08-22: of five merged PRs only one auto-closed, and only via a
`Closes componentLibrary-057` body trailer. If a merged PR left its bead open, the title
was wrong. Full rules in [AGENTS.md](AGENTS.md#git-conventions).

## Independent review — before opening a PR, and after amending one

**Before opening a PR that touches non-test source, dispatch an `independent-reviewer` against the branch, run as a DIFFERENT model from the author.** A requirement, not a judgement call (background is fine). "Low risk / small / just a prop rename / my tests pass" are **not** skip reasons — they are the author's assessment of the author's own work, which is exactly what the review checks. To skip, get the operator's agreement; never skip silently.

**The requirement covers code added AFTER a review, not just at PR-open.** If you push
non-test source onto a branch that has already been reviewed — including fixes for the
reviewer's own findings — that commit needs its own pass. The rule used to say "before
opening a PR", and the PR was already open, so the gap read as compliance. butiq hit this
on their PR #414: a filter added after approval shipped unreviewed, and a second reviewer
found **four real defects** in that one commit, two of them provably untestable — an inert
dropdown whose v-model could be replaced with a dead local ref while all 235 tests stayed
green, and a flag whose only assertion was vacuous in the direction that mattered.
componentLibrary did the same thing on PRs #213, #228, #230 and #232; #232's post-review
commit changed guard polarity in four files, added `inheritAttrs: false` to 13 components,
and merged without a second look.

**Rotate the reviewing model; do not merely differ from the author.** Different-from-author
is the floor, not the ceiling. Sonnet reviewed ten consecutive butiq PRs and found something
real in every one, so there was no visible blind spot to correct — and yet switching to Fable
for one commit surfaced two mutations that Sonnet-style review had not produced. Of three
vacuous tests written that week, two were caught by mutation testing and one by a _different_
reviewer; none by the same reviewer looking harder. The claim is not that one model is better
— it is that the **variance between reviewers is doing real work**, and spending it on
alternation is worth more than concentrating it. Alternate `sonnet` and `fable` across
consecutive reviews of the same author's work, and prefer the one that did _not_ review the
previous PR on the same component.

The different-model gate is structural: the same model re-makes the same assumptions, so self-review is blind in a way more care can't fix. In a component library the blind spots have a shape — **accessibility that passes every unit test** (a lost focus trap, a dropped `aria-*`, a keyboard path that no longer reaches a control); **contract drift a consumer feels, not the library** (a renamed prop or changed slot/emit — types compile, the component's tests pass, a consuming app breaks); **wireframe/interaction regressions** with no assertion behind them; and **i18n** (a hardcoded string, a key in only one locale).

**Done** = findings surfaced with honest severity (BLOCKER / SHOULD-FIX / NIT), then applied or deferred with a follow-up bead — not quietly ignored. The reviewer is shared across the nonsuch repos, version-controlled at `switchboard/.claude/agents/independent-reviewer.md` and symlinked to `~/.claude/agents/`; **do not delete its `model:` line** (a model-less agent inherits the parent's — Opus reviewing Opus). Pick the model per invocation: **sonnet** for logic/systemic/contract (prop/slot contracts, cross-package drift), **fable** for boundary/data-loss/tool-output. Run both on substantial changes. Full section in [AGENTS.md](AGENTS.md#independent-review--before-opening-a-pr).

## Build & Test

_Add your build and test commands here_

```bash
# Example:
# npm install
# npm test
```

## Architecture Overview

_Add a brief overview of your project architecture_

## Conventions & Patterns

_Add your project-specific conventions here_
