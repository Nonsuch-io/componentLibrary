# Open backlog at archive time

> [!WARNING]
> **This is a stale snapshot, and it is the only surviving copy.** It was generated from
> `.beads/issues.jsonl`, whose newest entry is **2026-09-23**, on **2026-10-15**. The beads
> Dolt database this repository used (`componentLibrary` on `127.0.0.1:3307`) was not
> reachable when the repo was archived, and automatic export had been refused for weeks, so
> roughly three weeks of issue activity is **not reflected here**.
>
> Concretely, that means: items closed after 2026-09-23 still appear open below, and items
> created after that date are missing entirely. Treat every line as "was open on
> 2026-09-23", not as "is open". Two known examples — `componentLibrary-9fe` was
> deliberately dropped as not worth doing before the move but still appears below, and
> `componentLibrary-p8o` was filed and closed on 2026-09-29 and does not appear at all.
>
> It is written down anyway because the alternative was losing it. The authoritative record,
> if the database is recovered, is the Dolt database — not this file.

81 issues were open in that snapshot, out of 186 total.

The library's work continues in the [butiq](https://github.com/Nonsuch-io/butiq) monorepo at `packages/uniq`. Anything below that is still wanted needs re-filing there under butiq's own prefix; these ids no longer resolve.

## P1 — high (3)

- **`componentLibrary-7jc`** _(task)_ — Button contrast: ~25 combinations below WCAG AA, including the default variant
- **`componentLibrary-9fe`** _(task)_ — Branch protection requires only one CI job, so the peer-floor gate (and any future job) cannot block a merge
- **`componentLibrary-grj`** _(feature)_ — Sign-up shell asks from Kale's staging review vs frame 264:26835: heading align, card-less NsAuthLayout on the canvas, NsSelect labelPlacement

## P2 — medium (16)

- **`componentLibrary-1ko`** _(feature)_ — Value-display primitives: NsPrice and a date/time formatter, not the 13 Figma frames
- **`componentLibrary-2si`** _(bug)_ — NsAppShell does not expose NsNavSidebar's bottomItem, so consumers cannot pin a nav item
- **`componentLibrary-3ul`** _(bug)_ — Positive status tokens fail AA and swap roles between light and dark
- **`componentLibrary-49m`** _(feature)_ — Dual conditional exports so consumers can strip the dev warnings
- **`componentLibrary-5lj`** _(task)_ — Monorepo move: keep release-please, remove npm publishing only AFTER zfw and q5r land
- **`componentLibrary-84n`** _(bug)_ — NsTooltip inside NsButton never shows on keyboard focus — it anchors to QBtn's inner span, above which focusin never travels
- **`componentLibrary-8i5`** _(feature)_ — Generalise the fallback gate: catch values that are written down and never rendered
- **`componentLibrary-axw`** _(bug)_ — NS_BRAND secondary/accent use the focus-ring blue, not the accent token they name
- **`componentLibrary-dyk`** _(bug)_ — Token drift: the library's text-secondary (#757575) is the design's text-TERTIARY; the design's text-secondary is #535353
- **`componentLibrary-i9v`** _(feature)_ — Breakpoints are width-only and cannot express the design's Vertical Tablet form factor
- **`componentLibrary-lt2`** _(task)_ — Components adapt to the VIEWPORT, not their container — a narrow column on a wide screen gets desktop layouts it cannot fit
- **`componentLibrary-mcq`** _(feature)_ — No toast/notification component at all, and the design page for it is empty
- **`componentLibrary-nbr`** _(feature)_ — Make the NsButton styling collision a TYPE error, not just a dev warning
- **`componentLibrary-qny`** _(bug)_ — Screen.setDebounce(0) in test/setup.ts calls a no-op — the CI flake mitigation has never worked
- **`componentLibrary-vst`** _(feature)_ — NsSiteHeader has no mobile/expanded state, and its nav slot has nothing to put in it
- **`componentLibrary-vtj`** _(bug)_ — Story files are still excluded from typecheck — 11 errors waiting behind the door

## P3 — normal (49)

- **`componentLibrary-2s3`** _(bug)_ — plugin.ts's setup example omits style.css, so following it trips our own missing-stylesheet warning
- **`componentLibrary-2uw`** _(task)_ — Put the ADR rules into the independent-reviewer brief, so decisions get CHECKED not just read
- **`componentLibrary-4ry`** _(feature)_ — NsBanner has no responsive treatment, but every banner in Figma has a mobile layout
- **`componentLibrary-4xu`** _(bug)_ — NsTabPanel's disable prop does almost nothing, and its story implies otherwise
- **`componentLibrary-5l9`** _(bug)_ — No real-browser coverage of tap-to-show: prove it works on the declared quasar floor with touch emulation
- **`componentLibrary-610`** _(feature)_ — No variant for a button sitting on a coloured surface — butiq holds an exception for it
- **`componentLibrary-6dl`** _(bug)_ — NsBadge: the frame's warning badge tone (bg-warning #f9e3ad) is unreachable — color="warning" maps to Quasar's saturated #f7bc2b
- **`componentLibrary-6dr`** _(feature)_ — Missing overlay primitives: BottomSheet, Sidebar, Keypad, ValueSelector, Option, Tile
- **`componentLibrary-77a`** _(task)_ — NsInput Large: confirm 120px with the designer, and decide what autogrow means for the spec
- **`componentLibrary-7m9`** _(bug)_ — Two NsAppShell scoped rules target classes no element has
- **`componentLibrary-7pc`** _(bug)_ — Headings render in Fixel Display; the design's heading styles are Fixel Text — measure the drift across components
- **`componentLibrary-8ql`** _(task)_ — Fonts are 89% of the published package — 2.7 MB shipping, four weights used
- **`componentLibrary-98m`** _(bug)_ — Coverage thresholds (90%) are configured but the run exits 0 at 68% — the gate never fails
- **`componentLibrary-apo`** _(feature)_ — NsToggle: Figma's Badge variant has no expression in code at all
- **`componentLibrary-awc`** _(feature)_ — NsScrollbar: 12px cannot be done with standard CSS; decide stylesheet vs component
- **`componentLibrary-ayp`** _(task)_ — NsMenu stories show placeholder content, not the one shape it is actually used for
- **`componentLibrary-b5h`** _(epic)_ — EPIC: rename componentLibrary to uniq — repo, npm package, bead prefix, Dolt DB
- **`componentLibrary-b5h.1`** _(task)_ — Retitle open PRs carrying bead ids — AFTER the prefix rename, never before
- **`componentLibrary-b5h.2`** _(task)_ — Sweep the name out of source, docs and config (27 + 131 references)
- **`componentLibrary-b5h.5`** _(task)_ — Symbol.for trades module isolation for VERSION isolation — decide before majors can coexist
- **`componentLibrary-b5h.6`** _(task)_ — Dual-publish @nonsuch/uniq alongside the old name, and do not deprecate until butiq says so
- **`componentLibrary-bnw`** _(bug)_ — NsImage double-applies $attrs, duplicating every consumer class on the rendered element
- **`componentLibrary-bz9`** _(bug)_ — NsBanner falls back to Material Design colours when a token is missing
- **`componentLibrary-c1m`** _(feature)_ — NsList and NsItem: Figma specifies substantially different components
- **`componentLibrary-cjh`** _(bug)_ — NsPageTitle subtitle colour is an unverified guess — confirm against Figma
- **`componentLibrary-d63`** _(feature)_ — NsNumberBadge is missing: no count/notification badge exists
- **`componentLibrary-dyv`** _(feature)_ — Model NsDialog's Secondary style (the tablet/mobile presentation)
- **`componentLibrary-f2e`** _(task)_ — vitest 5 is blocked on Storybook 11 (addon-vitest has no vitest-5 support below 11.0.0-alpha.1) — take them together
- **`componentLibrary-f66`** _(bug)_ — butiq references two --ns tokens that tokens.css does not define
- **`componentLibrary-fhx`** _(bug)_ — dist tests ERROR instead of skipping when dist/ is absent, so their own skip contract is a lie
- **`componentLibrary-j3b`** _(task)_ — NsAppShell's bordered drawer: confirm against the design before removing
- **`componentLibrary-jw1`** _(bug)_ — NsTab does not declare name or label, so consumers get no types for QTab's identifying prop
- **`componentLibrary-jxr`** _(task)_ — Rename NsNavSidebar to NsMainMenu to match the design (breaking, public API)
- **`componentLibrary-kmd`** _(feature)_ — State an opinion about aligning a row of fields where only some carry helper text
- **`componentLibrary-m71`** _(epic)_ — EPIC: the Widget/dashboard subsystem — 16 components in Figma, none in code
- **`componentLibrary-njr`** _(bug)_ — NsImage's missing-alt warning overstates its case on quasar 2.25.0
- **`componentLibrary-pdm`** _(task)_ — Supply-chain: SHA-pin GitHub Actions instead of floating @vN tags
- **`componentLibrary-qmw`** _(feature)_ — Pick a charting library — the decision has not been made, and butiq is waiting on it
- **`componentLibrary-t30`** _(bug)_ — contrast.test.ts fails to load intermittently in the full parallel run
- **`componentLibrary-tuu`** _(task)_ — Figma's click-triggered 'tooltips' are popovers and belong on NsMenu, not NsTooltip
- **`componentLibrary-u3x`** _(task)_ — NsTooltip stories have no play functions, so Chromium proves only that it renders
- **`componentLibrary-uv6`** _(bug)_ — Three spellings of one identity live in the beads data, and the human view hides the worst one
- **`componentLibrary-w0c`** _(bug)_ — A disabled NsSelect has no control in the accessibility tree — QSelect renders plain text, no combobox
- **`componentLibrary-w1v`** _(task)_ — NsPage collides: a layout wrapper in code, a pagination button in Figma
- **`componentLibrary-x0n`** _(feature)_ — No progress stepper — and NsStepList looks like one without being one
- **`componentLibrary-xyo`** _(task)_ — Designer question: NsInput's outlined prop has no Figma variant
- **`componentLibrary-ydi`** _(bug)_ — NsAppShell trips the library's own NsButton styling-collision warnings (flat, dense, round)
- **`componentLibrary-yqk`** _(task)_ — CI runs Storybook after Test in one job, so a unit failure hides every browser check
- **`componentLibrary-zm0`** _(feature)_ — NsTable and NsTableCell declare zero props, and half the table structure is missing

## P4 — backlog (13)

- **`componentLibrary-0lg`** _(feature)_ — NsColour: deferred. If it is built, start as a thin QColor wrapper
- **`componentLibrary-3wt`** _(bug)_ — useId() can collide across app instances on Storybook docs pages
- **`componentLibrary-5ah`** _(bug)_ — Guard: every font-family named in src/ must resolve to an @font-face in fonts.css or a generic (the dead Fixel Italic reference is the first catch)
- **`componentLibrary-5pq`** _(bug)_ — Contrast checker drops non-disabled members of comma-grouped selectors
- **`componentLibrary-5w3`** _(task)_ — Revisit TypeScript 7 when typescript-eslint supports it
- **`componentLibrary-63k`** _(task)_ — Find a Figma node using overline-md-bold so its line-height can be measured
- **`componentLibrary-6zc`** _(task)_ — Migrate the hand-rolled close buttons (NsTooltipDetails, NsHoursRow) to NsButton variant=x — a design check, not a swap
- **`componentLibrary-a8e`** _(bug)_ — Dark mode: negative-hover (#e2222a, same in every theme) is 3.36:1 on the dark surface-alt — the plan builder's Remove hover
- **`componentLibrary-b5h.3`** _(feature)_ — Storybook has no branding at all — add it as part of the rename
- **`componentLibrary-i5e`** _(task)_ — useNsControlName: the MutationObserver callback is the one pass that does not re-derive observer state
- **`componentLibrary-mm0`** _(bug)_ — Contrast checker silently strips alpha from 8-digit hex colours
- **`componentLibrary-owt`** _(task)_ — Check bundle-chunk isolation from rollup's module graph, not by regexing emitted text
- **`componentLibrary-p2i`** _(task)_ — Measured: factoring duplicated JS/CSS does NOT reclaim bytes — gzip already did it
