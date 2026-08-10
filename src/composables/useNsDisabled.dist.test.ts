import { describe, it, expect, vi, afterEach } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'

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
    ).toBe(5)
  })
})

describe.skipIf(built)('bundle not built', () => {
  it('fails in CI, skips locally — a skip must never read as a pass in the gate', () => {
    expect(process.env.CI, 'dist/ absent in CI: build must run before tests').toBeFalsy()
  })
})
