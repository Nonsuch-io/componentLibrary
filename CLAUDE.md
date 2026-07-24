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

## Independent review — before opening a PR

**Before opening a PR that touches non-test source, dispatch an `independent-reviewer` against the branch, run as a DIFFERENT model from the author.** A requirement, not a judgement call (background is fine). "Low risk / small / just a prop rename / my tests pass" are **not** skip reasons — they are the author's assessment of the author's own work, which is exactly what the review checks. To skip, get the operator's agreement; never skip silently.

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
