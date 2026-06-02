---
name: pre-close-audit
description: 'Run the mandatory pre-close audit before closing a bead or opening a PR in @nonsuch/component-library. Use when: closing a bead, opening a PR, verifying acceptance criteria, checking quality gates, scanning for token-discipline / accessibility / Storybook / export gaps.'
---

# Pre-Close Audit

**Before closing any bead or opening a PR in @nonsuch/component-library**, execute every step below **in order**. Do NOT close the bead until all steps pass. Do NOT paraphrase or skip steps — run the exact commands and produce the exact output tables.

## Step 1 — Acceptance Criteria Verification

Read the bead's description (`bd show <id>`). For **every** acceptance criterion (AC), grep or read the implementation and record evidence.

**Required output — print this table:**

```
| AC # | Criterion (short)         | Evidence (file:line or command output) | Result |
|------|---------------------------|----------------------------------------|--------|
| 1    | <criterion summary>       | src/components/NsFoo/NsFoo.vue:42      | PASS   |
| 2    | <criterion summary>       | src/components/NsFoo/NsFoo.test.ts:18  | PASS   |
```

Result must be one of: **PASS**, **PARTIAL**, **FAIL**. Any PARTIAL or FAIL is a finding (see Step 8).

## Step 2 — Tests

```bash
pnpm test --run
```

All tests must pass. Any failure is a **HIGH** finding. If new tests were added, confirm the test count went up (`Tests  <N> passed`).

## Step 3 — Type Check

```bash
pnpm typecheck
```

Must exit 0 with no errors. Any failure is a **HIGH** finding.

## Step 4 — Lint

```bash
pnpm lint
```

Must exit 0. Any failure is a **MEDIUM** finding. Pay attention to `generateQuasarBanRules` violations — raw Quasar usage where an `Ns*` wrapper exists.

## Step 5 — Storybook Build (when stories touched)

If the change adds or modifies a `*.stories.ts` file:

```bash
pnpm build:storybook
```

Must exit 0. Any failure is a **MEDIUM** finding.

## Step 6 — Component-Library Discipline Scan

For every changed component, check:

1. **Co-located test file exists** — `*.vue` ↔ `*.test.ts` in the same directory. New components without tests are a **HIGH** finding (per AGENTS.md "Testing conventions"). Render + slot + accessibility describe blocks are the minimum bar.

   ```bash
   for f in $(git diff --name-only main -- 'src/components/**/*.vue'); do
     dir=$(dirname "$f"); base=$(basename "$f" .vue)
     test -f "$dir/$base.test.ts" || echo "MISSING TEST: $f"
   done
   ```

2. **Storybook story exists** — every public component needs at least one story. New components without stories are a **HIGH** finding.

   ```bash
   for f in $(git diff --name-only main -- 'src/components/**/*.vue'); do
     dir=$(dirname "$f"); base=$(basename "$f" .vue)
     test -f "$dir/$base.stories.ts" || echo "MISSING STORY: $f"
   done
   ```

3. **`index.ts` barrel export exists** — new component directories need one.

   ```bash
   for dir in $(git diff --name-only main -- 'src/components/**/*.vue' | xargs -n1 dirname | sort -u); do
     test -f "$dir/index.ts" || echo "MISSING BARREL: $dir"
   done
   ```

4. **Top-level export in `src/index.ts`** — new public components must be exported (under the right section: `// Components` / `// Marketing` / `// Templates`). Exported types (`NsFooProps`, related types) must accompany the component.

   ```bash
   git diff --name-only main src/index.ts
   # If absent and you added a new component, that's a finding.
   ```

5. **`manifest.ts` updated** — if the component is a new Quasar wrapper or a wrapper's Quasar mapping changed, `nsComponentManifest` (and/or `nsTemplateTagManifest`) needs to reflect it.

Any item above missing is a **HIGH** finding when introducing a new public component, or **MEDIUM** when touching an existing one.

## Step 7 — Token & Accessibility Discipline Scan

For every changed `.vue` file:

1. **Hardcoded values where a token exists.** Common offenders:

   ```bash
   git diff main -- 'src/components/**/*.vue' | grep -E '^\+' | \
     grep -E '#[0-9a-fA-F]{3,6}|: [0-9]+px|9999px|rgba?\(' | \
     grep -v 'var\(--ns-'
   ```

   Hex colours, raw `Npx` paddings/gaps/margins, `9999px`, `rgba()` — flag each. **MEDIUM** finding unless deliberately scoped (e.g., one-off layout dimensions documented with a comment).

2. **`prefers-reduced-motion` respect** — any component with animation (`@keyframes`, `transition`, `setInterval`-driven rotation) must guard:

   ```bash
   git diff main -- 'src/components/**/*.vue' | grep -E '^\+' | grep -E 'keyframes|transition:|setInterval'
   # Cross-check each hit has a corresponding @media (prefers-reduced-motion: reduce) guard.
   ```

   Missing guard is a **MEDIUM** finding.

3. **Hardcoded user-facing English** — any `aria-label="..."`, default `placeholder: '...'`, or visible text literal that isn't routed through `useNsLocale()` or exposed as a prop is a **MEDIUM** finding.

4. **Mobile-first responsive design** — new components without `@media` or breakpoint composables suggest desktop-only design. **MEDIUM** finding unless the component is intrinsically size-agnostic (an icon, a primitive). No `lt-*` Quasar visibility classes or `max-width` media queries — mobile-first only.

5. **Scoped style pitfalls** — `:deep()` inside an `@media` block inside a scoped style is known to drop declarations (see prior NsHero bug). If the change introduces that pattern, **HIGH** finding — hoist the `@media` outside the `:deep()` block or move styles to an unscoped block.

## Step 8 — Findings Table

Collect all findings from Steps 1–7 into this table:

```
| # | Step | Severity | Description                                  | Action            |
|---|------|----------|----------------------------------------------|-------------------|
| 1 | 6    | HIGH     | NsFoo.vue added without NsFoo.test.ts        | Fix before close  |
| 2 | 7    | MEDIUM   | NsBar.vue uses #ef7c20 instead of bg-brand   | Fix before close  |
```

**Severity classification:**

| Severity   | Criteria                                                                                                                     | Action                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **HIGH**   | Build/test/typecheck failure, missing test/story/export for new public component, accessibility regression, scoped-style bug | Must fix before close  |
| **MEDIUM** | Lint failure, token-discipline regression, missing reduced-motion guard, hardcoded English, missing mobile responsiveness    | Must fix before close  |
| **LOW**    | Comment wording, micro-refactors, non-critical polish                                                                        | File as follow-up bead |

## Step 9 — Resolve Findings

- Fix all **HIGH** and **MEDIUM** findings. Re-run the affected steps to confirm resolution.
- File separate beads for **LOW** findings: `bd create "<title>" --description="<details>" -p 3 --deps discovered-from:<current-bead-id>`
- After all fixes, print the findings table again with updated results. Every row must show PASS or be filed as a follow-up bead.
