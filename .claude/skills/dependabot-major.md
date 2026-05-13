---
description: Review a Dependabot major-version PR using a structured rubric (blast radius, coupling with adjacent PRs, engine floors, supply-chain, quick wins, follow-ups). Use when the user asks to review a Dependabot major-version bump or asks to evaluate a batch of pending dependency PRs.
---

You are an expert reviewer for Dependabot major-version bumps in the @nonsuch/component-library repo. Walk through the rubric below in order. Be direct and concise — bullet points beat paragraphs.

## Step 1 — Locate the PR

If a PR number is provided in args, fetch:

```bash
gh pr view <number> --json title,body,author,baseRefName,headRefName,additions,deletions,files,createdAt
gh pr diff <number>
gh pr checks <number>
```

If no PR number is provided, list open Dependabot PRs and ask which to review:

```bash
gh pr list --author dependabot --json number,title,createdAt --limit 20
```

## Step 2 — Detect coupling with adjacent PRs

Always run:

```bash
gh pr list --author dependabot --json number,title --limit 30
```

Look for siblings in the same dependency family — they often need to merge together:

- **commitlint family** — `@commitlint/cli`, `@commitlint/config-conventional`, related parsers
- **eslint family** — `eslint`, `@eslint/*`, `typescript-eslint`, plugins
- **storybook family** — `storybook`, `@storybook/*`, addons
- **vue/quasar family** — `vue`, `@vue/*`, `quasar`, `@quasar/*`, `@vitejs/plugin-vue`
- **vite/vitest family** — `vite`, `vitest`, `@vitest/*`, `@vitejs/*`
- **typescript family** — `typescript`, `vue-tsc`, `@types/node`, related types

Flag siblings explicitly and recommend merge ordering.

## Step 3 — Output the review

Use these sections in order. Skip a section only if it's genuinely n/a; never invent content to fill it.

### Blast radius

Classify the dependency by where it runs:

| Class                           | Examples                                       | Why it matters                                                    |
| ------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| **Runtime** (in `dependencies`) | quasar, vue                                    | Affects consumers of the published package — highest blast radius |
| **Build tool**                  | vite, vue-tsc, sass-embedded                   | Breaks `pnpm build` if regressed                                  |
| **Pre-commit hook**             | lint-staged, husky, commitlint, prettier       | Breaks every developer's local commits — highest local urgency    |
| **Test tool**                   | vitest, @vue/test-utils, happy-dom, playwright | Breaks CI test step                                               |
| **Linting**                     | eslint, eslint-plugin-\*                       | Breaks CI lint step, possibly auto-fixes that touch many files    |
| **CI action**                   | `actions/*`, `googleapis/*` in workflows       | Only fires on workflow trigger — failure visible but not local    |
| **Storybook**                   | storybook, @storybook/\*                       | Affects docs site only                                            |
| **Type-only**                   | @types/\*, vue-component-type-helpers          | Build-time only, no runtime impact                                |

### Coupling

List sibling Dependabot PRs from the same release wave (from Step 2). Recommend whether to merge alone, bundle, or hold for one.

### Engine floor vs repo reality

Cross-reference three things:

1. **New minimum** (Node/pnpm/Git) from the release notes — search the PR body for `engines`, `min`, `Node`, `requires`.
2. **Repo `engines` field** in [package.json](package.json). If absent, flag it as a quick win.
3. **CI Node version**: `grep node-version .github/workflows/*.yml`.

Flag any mismatch. The most common silent breakage is a dep raising its Node floor above what the repo declares.

### CI exercise depth

Identify which workflows exercise the bumped dep. Read `.github/workflows/*.yml` and ask:

- Does the **PR-time** CI (`Lint, Type-check, Test, Build`) actually run the bumped tool?
- Or does it only run on `push: main` (e.g., release-please, storybook deploy, npm publish)?

If only on main pushes, note that the PR's green check **does not** validate the bump — first real test is post-merge.

### Cooldown bypass check

Check the PR `createdAt` against the cooldown in [.github/dependabot.yml](.github/dependabot.yml):

```bash
gh pr view <number> --json createdAt
```

Current cooldown (after PR #80): patch 3 days, minor 7 days, major 14 days.

- If the PR pre-dates the cooldown config being merged, note it bypassed the wait window.
- If the underlying release is fresher than the cooldown floor (rare for Dependabot once cooldown is active), note that.

### Supply chain quick check

- Is the publisher org official / well-known? (`actions/*`, `googleapis/*`, vue-team, etc.)
- Does the package use npm provenance? (visible on npmjs.com under the version)
- Any recent advisories? Check the GitHub Security tab and recent PR/issue chatter on the upstream repo.

This is a quick glance, not a deep audit — flag anything unusual.

### Functional / behavioral changes

Pull from the release notes (linked in the Dependabot PR body):

- **Breaking changes** — list with their actual repo impact, not just the upstream's framing
- **New APIs / flags / inputs** — note them but don't recommend adoption yet (that's "Quick wins" / "Follow-ups")
- **Removed APIs / flags** — grep the repo to confirm none are in use

### Quick wins (bundle with this PR)

Cheap-to-adopt items that pair naturally with the bump:

- New flags worth setting in the repo's existing config
- Hygiene fixes the bump exposes (missing `engines`, dead deprecation flags)
- Bundled commits the reviewer can push to the Dependabot branch

Skip the section if nothing qualifies — don't pad.

### Bead-worthy follow-ups (defer)

Bigger items that should NOT go in this PR:

- New functionality requiring wider component changes
- Migrations away from deprecated escape hatches (`--legacy-output` etc.)
- Test plan upgrades

Skip the section if nothing qualifies.

### Merge recommendation

One line plus named follow-ups. Pick one:

- "Merge as-is."
- "Merge with bundled quick wins: <list>."
- "Hold for PR #N to merge first."
- "Bundle with #N, #M as a group merge."

### Rollback plan

One line. Usually: "Revert the version pin in `package.json` + `pnpm install` to regenerate the lockfile." Escalate if the bump affects published artifacts or `dist/`.

## Style notes

- Keep the review under 500 words for simple bumps; expand only where there's real complexity
- Use tables when comparing multiple coupled PRs or multiple version floors
- Cite line numbers when referencing config files (e.g., `[package.json:5](package.json#L5)`)
- Mark "concerns I can't verify locally" explicitly — don't pretend certainty
- Match the existing `/review` skill's tone: direct, concise, action-oriented
- Always state the merge recommendation as a single line at the end so the reviewer can decide fast
