# @nonsuch/component-library — archived

> [!IMPORTANT]
> **This repository is archived and read-only as of 2026-10-14. Do not open issues or pull requests here.**
>
> The library now lives in the [butiq](https://github.com/Nonsuch-io/butiq) monorepo at
> **`packages/uniq`**, published under the name **`@nonsuch/uniq`** and consumed by the
> apps with `workspace:*`. All development, issues and review happen there.

## Why this moved

The library was developed here as a standalone package and consumed by butiq as a pinned
npm release. That boundary cost real time: every defect found by a consumer became a
report → fix → publish → bump → verify round trip, 1–2 days apiece. Moving the source into
the monorepo collapses that loop, at the price of the version boundary that had caught
things — notably the 0.53.1 SSR regression, which butiq diagnosed in minutes by A/B-ing
0.53.0 against it on one tree.

The trade was made deliberately rather than by drift, and the gates that the boundary used
to provide were re-homed into butiq's CI as part of the move: SSR render, SSR component
smoke, unit + coverage, bundle size, and the Chromium story suite.

## What was here

94 `Ns*` components for Vue 3 on top of [Quasar](https://quasar.dev), with Storybook
stories, a token system, and an `en-CA`/`fr-CA` locale layer. The final version released
from this repo was **0.55.1**.

Publishing was removed before the move, so this package is not maintained and should not be
added as a dependency. Consumers inside the monorepo use `@nonsuch/uniq` by workspace link
instead.

Usage, setup, i18n, token and contribution documentation moved with the code — see
`packages/uniq/README.md` and `packages/uniq/CONTRIBUTING.md` in butiq. The versions that
used to live in this file remain in this repository's git history.

## Where the history went, and one wrinkle worth knowing

The move preserved this repository's commit history into butiq, but not on the first
attempt. butiq
[#540](https://github.com/Nonsuch-io/butiq/pull/540) landed as a **squash**, so the
ancestry was not on `main` at all;
[#543](https://github.com/Nonsuch-io/butiq/pull/543) restored it with an additive
`-s ours` merge, merged as a merge commit. The rename to `@nonsuch/uniq` followed in
[#539](https://github.com/Nonsuch-io/butiq/pull/539).

History is reachable in butiq today — `git log --follow packages/uniq/src/...` walks back
to this repo's scaffold commit of 2026-02-08 — **but the SHAs were rewritten by the
import**, because every path moved from `src/` to `packages/uniq/src/`. Commit messages,
authors and dates carry over; the hashes do not. So a SHA from this repository is _not_ an
ancestor of butiq's `main`, and `git merge-base --is-ancestor` against one will tell you
the history is missing when it is merely renumbered. Match on message and date instead.

One further caveat: anything concluded about butiq's `main` between the #540 and #543
merges was true of a tree that no longer exists.

## State at archive time

All 12 open pull requests were closed, none merged:

- Two dependabot bumps (a `testing` group carrying vitest 5, and a `quasar` group). Both
  are covered by butiq's dependabot, which watches `packages/uniq` with the same group
  rules, so neither was dropped — just handled where the code lives.
- Ten stacked feature PRs (#410–#419: a Figma alignment pass over NsButton, NsChip,
  NsBadge, NsNumberBadge, NsAvatar, NsTooltip, NsBanner, NsCheckbox, NsToggle and
  NsRadio), each superseded by its counterpart in butiq
  [#574–#583](https://github.com/Nonsuch-io/butiq/pulls). Verified rather than assumed
  before closing: the butiq versions are either byte-identical to these heads or further
  developed.

Their branches were deliberately left in place, so the commits stay readable after
archiving.

The issue backlog is in [ARCHIVE-BACKLOG.md](./ARCHIVE-BACKLOG.md) — 81 items that were
open as of **2026-09-23**, including three at P1. Read its warning before trusting it: the
beads database this repo used was unreachable when it was archived and automatic export had
been failing for weeks, so that file is a three-week-stale snapshot rather than a final
state. It is recorded because it was the only copy left, not because it is accurate.

## Credits

### Third-party assets & libraries

The library uses [Phosphor Icons](https://phosphoricons.com/) (via [`@phosphor-icons/vue`](https://github.com/phosphor-icons/vue)) as its default icon system. Phosphor Icons are © Phosphor Icons and contributors, licensed under [MIT](https://github.com/phosphor-icons/core/blob/main/LICENSE).

Some illustrative icons used in the **Marketing** component stories are derived from [Twemoji](https://github.com/twitter/twemoji) — specifically:

- `icon-flag-canada.svg`
- `icon-woman-technologist.svg`
- `icon-incoming-envelope.svg`

Twemoji graphics are © Twitter, Inc and other contributors, licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/). When redistributing these assets, please retain this attribution.

The remaining marketing icons (`icon-arrow-button`, `icon-checkmark`, `icon-doodle-arrows`, `icon-x`, `icon-bluesky`, `icon-instagram`) are original work by Nonsuch.

## License

MIT — see [LICENSE](./LICENSE)
