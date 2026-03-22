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

---

## Project Architecture

`@nonsuch/component-library` is a **single-package Vue 3 component library** built on Quasar with opinionated defaults and custom components.

| Area              | Technology                                |
| ----------------- | ----------------------------------------- |
| **Framework**     | Vue 3 (Composition API, `<script setup>`) |
| **UI Foundation** | Quasar                                    |
| **Language**      | TypeScript (strict)                       |
| **Build**         | Vite                                      |
| **Testing**       | Vitest + Vue Test Utils                   |
| **Docs**          | Storybook                                 |
| **Package Mgr**   | pnpm                                      |
| **Fonts**         | Fixel (brand font)                        |

**Key directories:**

```text
src/
  index.ts              # Library entry — exports all components
  manifest.ts           # Quasar → Ns component mapping for lint enforcement
  plugin.ts             # Vue plugin for installing the library
  breakpoints/          # Breakpoint values (design authority)
  components/           # All Ns-prefixed component wrappers
  composables/          # Shared composables (dark mode, locale, defaults)
  locale/               # i18n locale messages (en-CA, fr-CA)
  tokens/               # Design tokens (CSS custom properties)
fonts/                  # @font-face declarations + .woff2 files
test/                   # Test setup (registers Quasar globally)
```

---

## Worker Subagent Pattern

For larger beads with independent subtasks, dispatch **Worker** subagents to implement in parallel while the parent agent orchestrates.

### When to use:

- A bead has 2+ independent subtasks that don't share modified files
- A task is well-scoped enough that a fresh agent can execute it without extensive back-and-forth

### When NOT to use:

- Tasks that require iterative design discussion with the user
- Work where subtasks depend on each other's output (do them sequentially)
- Simple single-file changes — just do them directly

### Dispatch workflow:

1. **Parent claims the bead** and creates the feature branch
2. **Parent breaks work into subtasks** with clear scope, acceptance criteria, and reference code
3. **Parent dispatches Worker subagents** — one per independent subtask. Include in each prompt:
   - Exact task description and acceptance criteria
   - Which files are in scope
   - Specific components, types, or patterns to reuse (with file paths)
   - The branch name (already checked out)
4. **Workers implement using TDD** — write tests, implement, run quality gates, return a structured report
5. **Parent reviews each Worker report** — inspects modified files, verifies quality, resolves any conflicts
6. **Parent commits, pushes, and creates PR** — workers never touch git or beads

### Parallel safety:

Workers can run in parallel **only** when their file scopes don't overlap. If two subtasks modify the same file, dispatch them sequentially.

---

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

## Code Conventions

### TypeScript:

- **Strict mode.** `strict: true` in all tsconfig files.
- **No `any`.** Use proper types or `unknown` with narrowing.
- **Use `type` imports.** `import type { Foo } from './foo'` for type-only imports.

### Vue Components:

- **Composition API exclusively.** All components use `<script setup lang="ts">`. No Options API.
- **`Ns` prefix.** Every component is named `NsXxx` — matching the Quasar component it wraps (e.g., `QBtn` → `NsButton`).
- **`v-bind="$attrs"` passthrough.** Wrapper components forward all unrecognized attributes to the underlying Quasar component.
- **TypeScript interfaces for props.** Export the props interface and use `withDefaults()` for defaults.
- **Slots pass through.** Always include `<slot />` (and named slots as needed) so consumers can pass content.
- **Scoped styles with `ns-` prefix.** Use `<style lang="sass" scoped>` with `.ns-` class prefix to avoid conflicts.
- **Design tokens over hardcoded values.** Use `var(--ns-*)` CSS custom properties for all shared design values.

### i18n:

- **No vue-i18n dependency.** The library ships its own locale system (like Quasar/Vuetify).
- **Strings flow:** optional prop → injected Ns locale → built-in English default.
- **New strings** must be added to `NsLocaleMessages` interface, `en-CA.ts`, and `fr-CA.ts`.

### Accessibility:

- Every component must have an `accessibility` test block.
- Follow ARIA patterns documented in CONTRIBUTING.md.
- Check the Storybook a11y panel for violations.

---

## Testing Requirements

### What MUST be tested:

| Test type     | Tool                        | Scope                                                  |
| ------------- | --------------------------- | ------------------------------------------------------ |
| **Unit**      | Vitest + Vue Test Utils     | All components, composables, utilities, pure functions |
| **Storybook** | Storybook interaction tests | Visual rendering and interactive states                |

### Testing conventions:

- Test files are co-located: `NsButton.vue` → `NsButton.test.ts`
- Every component test file must include:
  - **Rendering** — slot content renders, default props applied
  - **Passthrough** — extra attributes reach the Quasar component
  - **Accessibility** — correct ARIA attributes rendered
  - **Custom behavior** — anything unique to the Ns wrapper
- Use factories/fixtures for test data, never hardcode IDs or timestamps
- Use `mount()` from `@vue/test-utils` with the Quasar plugin registered (see `test/setup.ts`)

### Red-Green-Refactor (TDD)

All new code — features, bug fixes, and refactors — MUST follow a red-green-refactor cycle. Tests are written **before** production code, not after.

#### The cycle:

1. **Red** — Write the test(s) first. Run them. Confirm they fail for the _expected_ reason — not a wiring or setup error. If the failure is unexpected, fix the test before proceeding.
2. **Green** — Write the minimum production code to make the tests pass. Run the tests again and confirm green.
3. **Refactor** — Clean up production code and tests with confidence that the suite catches regressions. Re-run tests after any refactor.

#### Rules:

- **Never skip the red step.** If a test passes immediately, it is not testing new behavior — delete or re-examine it.
- **Commit at green.** Each green state is a safe commit point. Prefer small, frequent commits over large batches.
- **Refactor does not change behavior.** If a refactor requires new tests, restart the cycle.

### Naming conventions:

- `should <expected behavior> when <condition>` — e.g., `should render slot content when default slot is provided`
- Group by component behavior in `describe()` blocks

### What to test:

- **Happy path** — The expected successful rendering/interaction
- **Prop variations** — Different prop combinations and defaults
- **Slot content** — Default and named slots render correctly
- **Attribute passthrough** — `$attrs` forwarded to Quasar component
- **Edge cases** — Empty slots, missing optional props, boundary values
- **Accessibility** — ARIA attributes, roles, labels

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

5. **Create PR** - After pushing a feature/fix branch, create a pull request. The PR template (`.github/pull_request_template.md`) includes the quality gates checklist — fill it out completely.
6. **Clean up** - Clear stashes, prune remote branches
7. **Verify** - All changes committed AND pushed
8. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

---

## Pre-Close Audit

**Before closing any bead**, execute every step below **in order**. Do NOT close the bead until all steps pass. Do NOT paraphrase or skip steps — run the exact commands and produce the exact output tables.

### Step 1 — Acceptance Criteria Verification

Read the bead's description (`bd show <id>`). For **every** acceptance criterion (AC), grep or read the implementation and record evidence.

**Required output — print this table:**

```
| AC # | Criterion (short)         | Evidence (file:line or command output) | Result |
|------|---------------------------|----------------------------------------|--------|
| 1    | <criterion summary>       | src/components/NsFoo/NsFoo.vue:42      | PASS   |
| 2    | <criterion summary>       | src/components/NsFoo/NsFoo.test.ts:18  | PASS   |
```

Result must be one of: **PASS**, **PARTIAL**, **FAIL**. Any PARTIAL or FAIL is a finding (see Step 6).

### Step 2 — Build & Type Check

```bash
pnpm typecheck
pnpm build
```

Both must exit 0 with no errors. Any failure is a **HIGH** finding.

### Step 3 — Lint & Format

```bash
pnpm lint
pnpm format:check
```

Must exit 0. Any failure is a **MEDIUM** finding.

### Step 4 — Tests

```bash
pnpm test
```

All tests must pass. Any failure is a **HIGH** finding.

### Step 5 — Export & Manifest Check

For every new component or public API added:

```bash
# Verify src/index.ts exports
grep 'NsNewComponent' src/index.ts

# Verify manifest entry (if wrapping a Quasar component)
grep 'NsNewComponent' src/manifest.ts

# Verify Storybook story exists
ls src/components/NsNewComponent/NsNewComponent.stories.ts
```

Any missing export, manifest entry, or story is a **MEDIUM** finding.

### Step 6 — Findings Table

Collect all findings from Steps 1–5 into this table:

```
| # | Step | Severity | Description                          | Action         |
|---|------|----------|--------------------------------------|----------------|
| 1 | 5    | MEDIUM   | Missing manifest entry for NsFoo     | Fix before close |
| 2 | 2    | HIGH     | Build fails: type error in composable| Fix before close |
```

**Severity classification:**

| Severity   | Criteria                                               | Action                 |
| ---------- | ------------------------------------------------------ | ---------------------- |
| **HIGH**   | Build failure, test failure, missing exports           | Must fix before close  |
| **MEDIUM** | Missing story, lint error, missing manifest entry      | Must fix before close  |
| **LOW**    | Code style, minor refactors, non-critical improvements | File as follow-up bead |

### Step 7 — Resolve Findings

- Fix all **HIGH** and **MEDIUM** findings. Re-run the affected steps to confirm resolution.
- File separate beads for **LOW** findings: `bd create "<title>" --description="<details>" -p 3 --deps discovered-from:<current-bead-id>`
- After all fixes, print the findings table again with updated results. Every row must show PASS or be filed as a follow-up bead.

---

## Git Conventions

- **Branch naming:** `feat/<bead-id>-short-description`, `fix/<bead-id>-short-description`
- **Commit messages:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`)
- **Reference bead IDs** in commit messages: `feat: add NsFoo component (cl-8)`
- **PR titles** should match the bead title

<!-- BEGIN BEADS INTEGRATION -->

## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Auto-syncs to JSONL for version control
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" --description="Detailed context" -t bug|feature|task -p 0-4 --json
bd create "Issue title" --description="What this issue is about" -p 1 --deps discovered-from:cl-123 --json
```

**Claim and update:**

```bash
bd update cl-42 --status in_progress --json
bd update cl-42 --priority 1 --json
```

**Complete work:**

```bash
bd close cl-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Auto-Sync

bd automatically syncs with git:

- Exports to `.beads/issues.jsonl` after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed!

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md and docs/QUICKSTART.md.

<!-- END BEADS INTEGRATION -->
