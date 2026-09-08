import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createApp, type Component, type Plugin } from 'vue'

/**
 * `mod` members are `unknown` because the dist bundle is deliberately untyped
 * (see src/types/dist-bundle.d.ts), so every mount needs a cast.
 *
 * WHAT THE CAST DOES NOT DO: check prop names. `as Component` resolves its props
 * generic to `any`, so `{ dense_TYPO: true }` typechecks clean — MEASURED, after
 * an earlier version of this comment claimed the opposite. `as never` was no
 * better: it forces the props object to `undefined`, which rejects every
 * non-empty props object, correct spelling or not. That is why this file did not
 * compile once tests were finally typechecked, and it is the only reason the
 * cast changed.
 *
 * So prop typos here are caught by the RUNTIME assertion below, not by the
 * compiler — a mistyped prop simply does not reach the component and the warning
 * these tests look for never fires. Acceptable, because typing these mounts from
 * source would defeat the file: it exists to observe the SHIPPED artefact, not
 * what we meant to ship. Story: componentLibrary-9ka.
 */
/**
 * The library's dev warnings must survive the build AND fire in a consumer's
 * browser. Those are different failures and this repo has shipped both.
 *
 * `import.meta.env` is inlined when THIS library builds, so the branch is
 * tree-shaken out of dist/ entirely (componentLibrary-nk3, PR #211).
 *
 * `process.env.NODE_ENV` survives — but the GUARD POLARITY decides whether the
 * warning can ever fire. A consumer's bundler replaces `process.env.NODE_ENV`
 * with a literal and leaves `typeof process` to evaluate at runtime, where a
 * browser gives 'undefined'. A fail-CLOSED guard is permanently silent for every
 * consumer while every unit test passes, because vitest runs in Node.
 *
 * THIS FILE ASSERTS BEHAVIOUR, NOT TEXT, AND THAT TOOK THREE TRIES.
 *   1. A deny-list of one bad shape — blind to the shape that actually shipped
 *      twice (NsTooltip #213, NsBreadcrumbs #228).
 *   2. An allow-list of two good shapes — defeated by review, concretely.
 *      Polarity is decided by operator precedence OUTSIDE the matched window:
 *      `if (typeof process === 'undefined') return; if (NODE_ENV === 'production') return`
 *      minifies to `typeof process > "u" || NODE_ENV !== "production" && warn()`,
 *      which parses as `A || (B && warn)` and never warns in a browser — while
 *      being character-identical to the allow-listed good shape. The only
 *      difference from the genuinely fail-open guard is parentheses, which the
 *      extraction discarded.
 *
 * So: load the BUILT bundle, remove `process`, and check the warning fires.
 * That is the shipped contract, and it is immune to minifier shapes.
 */
const BUNDLE = resolve(process.cwd(), 'dist/nonsuch-components.js')
const built = existsSync(resolve(process.cwd(), 'dist/index.d.ts'))

describe.skipIf(!built)('dev warnings survive the build and fire in a browser', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('emits the bundle at all', () => {
    expect(existsSync(BUNDLE), 'dist/index.d.ts exists but the bundle does not').toBe(true)
  })

  const js = built && existsSync(BUNDLE) ? readFileSync(BUNDLE, 'utf-8') : ''

  // IMPORTED ONCE, not per test. Nine tests each did their own
  // `await import(dist/...)`, and while the module is cached, each still paid the
  // resolve plus a full component mount inside the default 5s timeout. Measured
  // 5-12s per test under load; it has failed for two different machines on
  // unrelated branches, so it is fragility rather than one bad environment. This
  // was componentLibrary-5wn's original recommendation, dropped when the cause
  // looked like memory.
  let mod: Record<string, unknown> = {}
  beforeAll(async () => {
    if (!built || !existsSync(BUNDLE)) return
    mod = (await import('../../dist/nonsuch-components.js')) as Record<string, unknown>
  }, 30_000)

  it('uses no import.meta.env, which would have been inlined away', () => {
    // Weak by construction — it only fails if the string SURVIVES, whereas the
    // bug is that it gets inlined out. Kept as a cheap tripwire; the behavioural
    // test below is what actually covers the failure.
    expect(js).not.toContain('import.meta.env')
  })

  it('warns from the built bundle when `process` is absent, as in a browser', async () => {
    // Import FIRST, while process still exists: Vue captures process.nextTick at
    // module init. The guards read `typeof process` at WARN time, so removing it
    // afterwards reproduces a browser faithfully without breaking the runtime.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsInput as Component, { attrs: { disabled: true } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the disabled-alias warning did not fire with `process` undefined — it is ' +
        'dead in every consumer browser, whatever the unit tests say',
    ).toContain('is not a Quasar prop and does nothing on its own')
  })

  it("warns for NsRadioButtons' unlabelled group too, from the built bundle", async () => {
    // EVERY dev warning belongs in this test, not just the first one. The
    // shape-regex and pinned-count checks above cover the NsRadioButtons guard,
    // but review defeated a shape check once already — polarity lives in
    // parentheses a regex cannot see. A refactor into the early-return form
    // would keep those green while the warning went permanently silent in
    // browsers. Only mounting from dist with `process` removed can tell.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsRadioButtons as Component, {
      props: {
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the unlabelled-radiogroup warning did not fire with `process` undefined — ' +
        'it is dead in every consumer browser, whatever the unit tests say',
    ).toContain('NsRadioButtons')
  })

  it('accounts for every `typeof process` in the bundle', () => {
    // A tripwire for guards this file does not otherwise exercise. Review showed
    // the extraction regex implicitly ALLOWED any shape it failed to recognise —
    // a deny-list one level up. Requiring the counts to match means an
    // unrecognised guard fails loudly instead of passing silently.
    const all = js.match(/typeof process/g)?.length ?? 0
    const recognised =
      js.match(
        /typeof process\s*[<>]\s*"u"\s*(?:&&|\|\|)\s*process\.env\.NODE_ENV\s*[!=]==\s*"production"/g,
      )?.length ?? 0
    expect(all, 'no `typeof process` found at all — extraction is broken').toBeGreaterThan(0)
    expect(
      recognised,
      `${all} \`typeof process\` occurrence(s) but only ${recognised} recognised guard(s) — ` +
        'an unrecognised guard shape is in the bundle and this file cannot judge it',
    ).toBe(all)
  })

  it('ships exactly the dev warnings we expect, so none can vanish unnoticed', () => {
    // `toBeGreaterThan(0)` let three of four guards disappear unnoticed — the
    // partial-recurrence case of the tree-shaking bug in PR #211. Pin it, and
    // bump this deliberately when a warning is added or removed.
    const guards =
      js.match(
        /typeof process\s*[<>]\s*"u"\s*(?:&&|\|\|)\s*process\.env\.NODE_ENV\s*[!=]==\s*"production"/g,
      )?.length ?? 0
    expect(
      guards,
      'dev-warning guard count changed. If you added or removed a warning, update ' +
        'this number. If you did not, one has been tree-shaken out of dist/.',
    ).toBe(15) // 5->6 07u, 6->7 whr, 7->8 b5e, 8->9 057 (icon-only), 9->10 057 (dialog), 10->11 057 (image alt), 11->13 NsBrandLogo (sizing + link name), 13->14 NsBrandLogo (missing src), 14->15 NsText (unknown variant + unknown tone, one shared guard)
  })

  it("warns for NsText's unknown variant and tone from the built bundle", () => {
    // The pinned count above moved 14 -> 15 for this guard, and a count CANNOT
    // tell a working guard from a fail-CLOSED one: the regex matches either
    // polarity. Without this mount, refactoring isDev() to
    // `typeof process === 'undefined' ? false : ...` would keep the count at 15,
    // keep all 46 NsText unit tests green (vitest runs in Node, where `process`
    // exists), and silence NsText in every consumer browser — the exact
    // regression this file was created for. Both warnings share one guard, so
    // one mount covers both. Found by review; see componentLibrary-lrw.8.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsText as Component, {
      props: { variant: 'heading-huge', tone: 'chartreuse' },
    })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the NsText unknown-variant warning did not fire with `process` undefined — it ' +
        'is dead in every consumer browser, whatever the unit tests say',
    ).toContain('Unknown variant "heading-huge"')
    expect(
      text,
      'the NsText unknown-tone warning did not fire with `process` undefined — a tone ' +
        'that resolves to nothing then inherits its parent colour in silence',
    ).toContain('Unknown tone "chartreuse"')
  })

  it('stays silent from the built bundle for a valid variant and tone', () => {
    // Anti-vacuity for the mount above: if the guard warned unconditionally,
    // that test would pass just as well. This is the half that fails if it does.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsText as Component, { props: { variant: 'heading-xl', tone: 'brand' } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(text, 'NsText warned about a perfectly valid variant/tone pair').not.toContain(
      '[NsText]',
    )
  })

  it("warns for NsBrandLogo's missing box from the built bundle", async () => {
    // Without `ratio` or `height`, QImg reserves a 16:9 box no brand lockup has,
    // and the logo renders in dead space until the asset loads. Silent in a
    // browser is exactly the failure this file exists for.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsBrandLogo as Component, { props: { src: 'logo.svg', alt: 'Acme', width: 72 } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the NsBrandLogo sizing warning did not fire with `process` undefined — it is ' +
        'dead in every consumer browser, whatever the unit tests say',
    ).toContain('has neither `ratio` nor `height`')
  })

  it("warns for NsBrandLogo's unnamed link from the built bundle", async () => {
    // A separate guard from the sizing one, so the pinned count above moved by
    // two. Both need their own mount: the count cannot tell a fail-closed guard
    // from a working one.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsBrandLogo as Component, { props: { src: 'logo.svg', ratio: 2.6, href: '/' } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the NsBrandLogo link-name warning did not fire with `process` undefined — it ' +
        'is dead in every consumer browser, whatever the unit tests say',
    ).toContain('has `href` but no `alt`')
  })

  it("warns for NsBrandLogo's missing src from the built bundle", async () => {
    // The one NsBrandLogo failure a consumer cannot detect for themselves: QImg
    // creates no <img> for a blank src, so there is no `error` event and their own
    // onError never fires. If this guard ships fail-closed, nothing reports that
    // the logo is simply absent.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsBrandLogo as Component, { props: { src: '', alt: 'Acme', ratio: 2.6 } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the NsBrandLogo missing-src warning did not fire with `process` undefined — ' +
        'it is dead in every consumer browser, whatever the unit tests say',
    ).toContain('has no `src`')
  })

  it("warns for NsInput's dense+size conflict too, from the built bundle", async () => {
    // Added with the warning itself (componentLibrary-b5e) rather than after the
    // fact. The pinned count above would have caught a guard VANISHING, but not a
    // guard that ships fail-CLOSED — and this file exists because two already
    // merged PRs did exactly that, silently, while every unit test passed.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsInput as Component, { props: { dense: true, size: 'large' } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the dense+size conflict warning did not fire with `process` undefined — it is ' +
        'dead in every consumer browser, whatever the unit tests say',
    ).toContain('were both set')
  })

  it("warns for NsInput's INVALID size from the built bundle too", async () => {
    // The pinned count cannot protect this one: it shares the conflict warning's
    // `typeof process` guard, so the count stays 8 whether this branch exists,
    // is deleted, or is moved behind a fail-closed guard. Review flagged the gap
    // against this file's own stated policy that EVERY dev warning belongs here.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsInput as Component, { props: { size: 'huge' } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the invalid-size warning did not fire with `process` undefined — it is dead ' +
        'in every consumer browser, whatever the unit tests say',
    ).toContain('is not a valid size')
  })

  it("warns for NsCheckbox's stripped tri-state attrs from the built bundle", async () => {
    // The pinned count cannot protect this one — it shares useNsAttrConflictWarning's
    // single guard, so the count stays 8 whether this call exists or not. Review
    // flagged the gap against this file's own stated policy that EVERY dev warning
    // gets a from-dist test, and this warning is load-bearing: the attr is SILENTLY
    // IGNORED, so without it a consumer sees a prop do nothing and no explanation.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsCheckbox as Component, { attrs: { 'toggle-indeterminate': true } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the ignored-attr warning did not fire with `process` undefined — it is dead ' +
        'in every consumer browser, whatever the unit tests say',
    ).toContain('toggle-indeterminate')

    // ALSO THE WORDING, not just the attr name. Review noted the attr-name-only
    // check would pass on a regression that kept the name while dropping
    // "IGNORED" or reverting to the styling head — and the difference matters:
    // a consumer told the attr "conflicts" will look for a way to make it work,
    // where one told it was IGNORED knows to stop.
    expect(text, 'the warning no longer says the attr was ignored').toContain('IGNORED')
    expect(text, 'the styling wording came back for a behaviour conflict').not.toContain(
      'background colours',
    )
  })

  it("warns for NsButton's unnamed icon-only button from the built bundle", async () => {
    // Added with the warning rather than after it. This one is load-bearing in a
    // way the pinned count cannot express: an icon-only button with no name is
    // INVISIBLE to everything except axe, and axe runs at test:'todo'
    // (componentLibrary-057). If this guard ships fail-closed, nothing anywhere
    // reports the defect.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsButton as Component, { props: { iconOnly: true } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the unnamed icon-only warning did not fire with `process` undefined — it is ' +
        'dead in every consumer browser, whatever the unit tests say',
    ).toContain('no accessible name')
  })

  it('warns for an unnamed NsDialog from the built bundle', async () => {
    // A modal with no name announces as "dialog" while trapping focus. Nothing
    // else reports it: axe runs at test:'todo' (componentLibrary-057), so if this
    // guard ships fail-closed the defect is invisible everywhere.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsDialog as Component, { props: { modelValue: true } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the unnamed-dialog warning did not fire with `process` undefined — it is ' +
        'dead in every consumer browser, whatever the unit tests say',
    ).toContain('no accessible name')
  })

  it('warns for an NsImage with no alt from the built bundle', async () => {
    // QImg renders role="img" with aria-label={alt}; without alt that is an
    // unnamed image role. axe runs at test:'todo', so a fail-closed guard here
    // means nothing reports it (componentLibrary-057).

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsImage as Component, {})
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the missing-alt warning did not fire with `process` undefined — it is dead ' +
        'in every consumer browser, whatever the unit tests say',
    ).toContain('no `alt`')
  })

  it('warns from the built bundle when the stylesheet sentinel is missing and `process` is absent', async () => {
    // Same rationale as the other two tests in this file: the guard's polarity
    // decides whether this can ever fire in a real browser, and only mounting
    // from dist with `process` removed can tell. jsdom/happy-dom never load a
    // real stylesheet, so `--ns-styles-loaded` legitimately resolves empty
    // here — the same condition a consumer who forgot `style.css` would hit.

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    const app = createApp({ render: () => null })
    app.use((mod.createNonsuch as () => Plugin)())
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the missing-stylesheet warning did not fire with `process` undefined — it is ' +
        'dead in every consumer browser, whatever the unit tests say',
    ).toContain('style.css')
  })
})

describe.skipIf(built)('bundle not built', () => {
  it('fails in CI, skips locally — a skip must never read as a pass in the gate', () => {
    expect(process.env.CI, 'dist/ absent in CI: build must run before tests').toBeFalsy()
  })
})
