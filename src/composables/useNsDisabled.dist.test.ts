import { describe, it, expect, vi, afterEach } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { createApp, type Plugin } from 'vue'

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
    const mod = (await import('../../dist/nonsuch-components.js')) as Record<string, unknown>

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsInput as never, { attrs: { disabled: true } })
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
    const mod = (await import('../../dist/nonsuch-components.js')) as Record<string, unknown>

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsRadioButtons as never, {
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
    ).toBe(8) // 5->6 componentLibrary-07u (stylesheet), 6->7 componentLibrary-whr (invalid banner type), 7->8 componentLibrary-b5e (dense+size conflict)
  })

  it("warns for NsInput's dense+size conflict too, from the built bundle", async () => {
    // Added with the warning itself (componentLibrary-b5e) rather than after the
    // fact. The pinned count above would have caught a guard VANISHING, but not a
    // guard that ships fail-CLOSED — and this file exists because two already
    // merged PRs did exactly that, silently, while every unit test passed.
    const mod = (await import('../../dist/nonsuch-components.js')) as Record<string, unknown>

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsInput as never, { props: { dense: true, size: 'large' } })
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
    const mod = (await import('../../dist/nonsuch-components.js')) as Record<string, unknown>

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsInput as never, { props: { size: 'huge' } })
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
    const mod = (await import('../../dist/nonsuch-components.js')) as Record<string, unknown>

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    mount(mod.NsCheckbox as never, { attrs: { 'toggle-indeterminate': true } })
    vi.unstubAllGlobals()
    const text = warn.mock.calls.flat().join(' ')
    warn.mockRestore()

    expect(
      text,
      'the ignored-attr warning did not fire with `process` undefined — it is dead ' +
        'in every consumer browser, whatever the unit tests say',
    ).toContain('toggle-indeterminate')
  })

  it('warns from the built bundle when the stylesheet sentinel is missing and `process` is absent', async () => {
    // Same rationale as the other two tests in this file: the guard's polarity
    // decides whether this can ever fire in a real browser, and only mounting
    // from dist with `process` removed can tell. jsdom/happy-dom never load a
    // real stylesheet, so `--ns-styles-loaded` legitimately resolves empty
    // here — the same condition a consumer who forgot `style.css` would hit.
    const mod = (await import('../../dist/nonsuch-components.js')) as {
      createNonsuch: () => Plugin
    }

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('process', undefined)
    const app = createApp({ render: () => null })
    app.use(mod.createNonsuch())
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
