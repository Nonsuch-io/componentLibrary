# ADR 0002 — What a Quasar wrapper owes its consumers

- **Status:** Accepted
- **Date:** 2026-08-07
- **Bead:** `componentLibrary-1iz`
- **Related:** ADR 0001 (no global registration — the first application of this principle)

## Context

70 components. 50 wrap a Quasar component; 20 are already ours with no `q-*`
underneath. Of the 50 wrappers, **30 declare no props at all** — a `q-*` element,
`v-bind="$attrs"`, a class, and a slot.

Kale's direction (2026-08-05): the library is **mostly a styling layer**, and Quasar
will eventually be phased out in favour of our own components — _"but we need a solid
foundation to start."_

That settles the destination. It does not say what a wrapper owes consumers **today**,
and the Figma audit produced eight findings that are all the same unanswered question
wearing different clothes:

| finding | what a zero-prop wrapper cost                                                                                                                  |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `ob8`   | `disabled` vs Quasar's `disable` — the wrong spelling silently does nothing                                                                    |
| `mwe`   | `NsBadge` `color="ghost"`/`"neutral"` emit `.bg-ghost`, which matches no CSS                                                                   |
| `whr`   | `NsBanner` renames `positive`/`negative` to `success`/`error` at its own API boundary while reading `--ns-color-bg-positive` three lines later |
| `sj1`   | `NsTooltip` inherited QTooltip's missing focus listener and absent ARIA                                                                        |
| `zm0`   | `NsTable`/`NsTableCell` declare nothing; every prop a consumer relies on is an unrecorded migration liability                                  |
| `bz9`   | `NsBanner` falls back to Material Design colours when a token is missing                                                                       |
| `nbr`   | butiq measured **693** raw Quasar styling props on `ns-button`; 79 rendered invisible text                                                     |
| `wer`   | 163 unresolved `<ns-*>` tags — resolved in ADR 0001                                                                                            |

Every one was found by hand, in an audit, months after being written. None was caught
by a test, a type, or a review.

## Decision

**A wrapper is a styling layer by default and a contract where the design system has
an opinion.** Concretely, a wrapper owes its consumers four things and nothing more:

### 1. Accessibility is never inherited, always verified

If the wrapped component's accessibility is wrong or absent, **the wrapper fixes it**.
This is not optional and does not wait for the Quasar phase-out.

Three of this sweep's findings were a wrapper's author assuming Quasar did something
it does not. `QTooltip` binds no focus listener and sets no ARIA at all — verified in
its source, not inferred. A pure pass-through inherits its dependency's accessibility
bugs and hands every consumer the same broken default.

**Rule:** before wrapping, read what the Quasar component actually renders and binds.
Assert the accessibility tree in tests — not that the component rendered.

### 2. Declare the vocabulary the design system has an opinion about

If Figma names a set of values — variants, statuses, sizes — the wrapper **declares
them as a union** and maps them to tokens itself. It does not forward the name to
Quasar and hope the palettes agree.

Two failure modes, both observed. `NsBadge` forwards `color` to Quasar, so seven
values work by coincidence and two (`ghost`, `neutral`) silently render unstyled —
while `--ns-color-status-neutral` exists and the component cannot reach it. `NsButton`
declares `variant` **and** lets Quasar's `color` through, so both systems style the
same element and agreed each other into invisibility on 79 call sites.

**Rule:** one system wins, loudly. Where the design system has a vocabulary, ours wins
and Quasar's spelling is rejected — a type error where possible, a dev warning where not.

### 3. Do not rename at the API boundary

`NsBanner` takes `type="success"` and reads `--ns-color-bg-positive`. Figma, the
tokens, and `NsButton` all say `positive`. A consumer writing `type="positive"` from
the design gets no styling and no error.

**Rule:** the prop name is the design system's name. If Quasar spells it differently,
the wrapper translates internally and the translation is invisible to consumers.

### 4. Fail loudly, or not at all

No fallback that makes a missing token render plausibly. `NsBanner`'s
`var(--ns-color-bg-info, #e3f2fd)` renders Material Blue when a token is absent —
off-brand, deliberate-looking, and light-mode only, so a token missing from the dark
blocks renders light Material colours on a dark page.

**Rule:** a defaulted wrong answer is worse than a visible failure. This is the
principle ADR 0001 turned on: we declined a capability because it would have removed
a warning.

### What a wrapper does **not** owe

Everything else stays pass-through. A wrapper does **not** need to enumerate every
Quasar prop, re-document Quasar's API, or wrap props the design system has no opinion
about. `NsCardSection` declaring nothing is **correct** — Figma has no opinion about
card sections, so `$attrs` is the whole contract.

**30 zero-prop wrappers is not 30 bugs.** It is a question to ask 30 times, and the
answer is usually no.

## Consequences

- Zero-prop wrappers are fine until one of the four rules applies. `zm0` (`NsTable`)
  should be triaged against these rules rather than treated as a defect on sight.
- `whr`, `mwe` and `ob8` are confirmed defects under rules 2 and 3, not style
  preferences. `bz9` is confirmed under rule 4.
- The `nbr` type guard is the right shape under rule 2 — one system winning loudly —
  and its sequencing behind butiq's sweep stands.
- Accessibility work is never blocked on the Quasar phase-out. It is the one category
  where a wrapper must add rather than forward.
- **This does not mandate a rewrite.** Nothing here says to go declare props on 30
  components. It says what to do when a bead alleges a wrapper is too thin.

## Notes

The audit's real lesson is not about props. Every finding above was invisible to
tests, types and review, and surfaced only when someone compared the design to the
code by hand. Three durable checks came out of it and are worth more than any single
fix: the token contrast check (`gbb`), the CI ordering fix that made the
build-artifact guards actually run (#217), and — in the consumer — failing the test
run on Vue resolution warnings.

Prefer adding a check that makes a whole class visible over fixing one instance of it.
