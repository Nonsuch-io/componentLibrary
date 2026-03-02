# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Mobile-First Design

> **Wireframes:** Figma. All page layouts and component sizing must match the wireframes. When wireframes and code diverge, the wireframe wins.
> See [`AGENTS.local.md`](AGENTS.local.md) for design links.

### MUST follow

1. **Mobile-first always.** All layout CSS starts at the smallest viewport and scales up. Use Quasar's ascending column classes (`col-12` → `col-sm-*` → `col-md-*` → `col-lg-*`), never desktop-down. This applies equally to admin, portal, and storefront.
2. **Breakpoints come from this component library.** `@nonsuch/component-library` is the design authority for breakpoint values. Initially these match Quasar's defaults (xs: 0, sm: 600, md: 1024, lg: 1440, xl: 1920) but may diverge — applications utilizing this library should always reference the library, not hardcoded values.
3. **No desktop-first overrides.** Do not use `lt-*` (less-than) visibility/sizing classes or `max-width` media queries. Responsive logic flows upward from mobile.
4. **Scoped CSS for exceptions only.** Quasar utility classes remain the primary styling mechanism. Scoped `<style>` blocks are allowed only for layout edge cases that cannot be expressed with utility classes (sticky positioning, custom hover states, etc.).
5. **Touch-friendly targets.** Interactive elements must meet minimum 44×44px touch targets on mobile viewports.

---

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed):
   - `pnpm test` - All tests must pass
   - `pnpm typecheck` - No type errors allowed
   - `pnpm lint` - No lint errors
   - `pnpm build` - Build must succeed
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:

   ```bash
   git pull --rebase
   bd sync
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

## Auditing Closed Work

**Before closing a beads issue**, verify the work actually landed. This prevents "closed but not done" drift.

**Per-issue checklist:**

1. **Code exists** — The files/exports/configs described in the issue are present in the repo
2. **Tests cover it** — New functionality has corresponding test assertions that pass
3. **No stale references** — grep for old names, removed files, or dead imports (this has bitten us before — e.g., renaming `en-US` to `en-CA` but missing `locale.test.ts`)
4. **Exports are wired** — If the feature is consumer-facing, verify `src/index.ts` exports and `package.json` `exports` map include it
5. **Docs updated** — CONTRIBUTING.md reflects the new patterns; Storybook stories exist if applicable
6. **Quality gates pass** — `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test && pnpm build` all green

**Batch audit (end of session or milestone):**

```bash
# 1. List recently closed issues
bd list -s closed --pretty

# 2. Run full quality gates
pnpm format:check && pnpm typecheck && pnpm lint && pnpm test && pnpm build

# 3. Verify no orphan references to removed code
grep -r 'TERM_THAT_SHOULD_NOT_EXIST' src/ --include='*.ts' --include='*.vue'

# 4. Confirm everything is pushed
git status  # "up to date with origin"
```

**If an issue fails audit:** reopen it with `bd reopen <id> --reason "..."`, fix the gap, then re-close.
