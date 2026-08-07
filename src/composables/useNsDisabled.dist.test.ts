import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * The library's dev warnings must survive the build AND fire in a consumer's
 * browser. Those are two different failures and this repo has now shipped both.
 *
 * `import.meta.env` is inlined when THIS library builds, so the branch is
 * tree-shaken out of dist/ entirely (componentLibrary-nk3, PR #211).
 *
 * `process.env.NODE_ENV` survives — but the GUARD POLARITY decides whether the
 * warning can ever fire. A consumer's bundler replaces `process.env.NODE_ENV`
 * with a literal and leaves `typeof process` to evaluate at runtime, where in a
 * browser it IS 'undefined'. So a fail-CLOSED guard
 * (`typeof process === 'undefined' || …` returning early) is permanently silent
 * for every real consumer, while every unit test passes because vitest runs in
 * Node. Measured in review; three guards shipped that way before this test.
 */
const BUNDLE = resolve(process.cwd(), 'dist/nonsuch-components.js')
const built = existsSync(resolve(process.cwd(), 'dist/index.d.ts'))

describe.skipIf(!built)('dev warnings survive the build and fail open', () => {
  it('emits the bundle at all', () => {
    expect(existsSync(BUNDLE), 'dist/index.d.ts exists but the bundle does not').toBe(true)
  })

  const js = built && existsSync(BUNDLE) ? readFileSync(BUNDLE, 'utf-8') : ''

  it('ships the disabled-alias warning text', () => {
    expect(js).toContain('is not a Quasar prop and does nothing on its own')
  })

  it('uses no import.meta.env, which would have been inlined away', () => {
    expect(js).not.toContain('import.meta.env')
  })

  it('every process guard in the bundle matches a known-good, fail-open shape', () => {
    // ALLOW-LIST, NOT DENY-LIST. The first version denied ONE wrong shape — the
    // OR-chain early return, which was my own mistake — and review proved it
    // blind to the OTHER wrong shape, the AND-chain inline guard that actually
    // shipped twice (NsTooltip #213, NsBreadcrumbs #228). Reverting NsTooltip to
    // its historical form left this test GREEN. A deny-list of the bugs you
    // happen to have made cannot cover the ones you have not.
    //
    // The two correct shapes, as the minifier writes them:
    //   early return:  typeof process < "u" && ...NODE_ENV === "production"
    //                  -> returns ONLY when process exists AND is production
    //   inline guard:  typeof process > "u" || ...NODE_ENV !== "production"
    //                  -> proceeds when process is absent
    // Both warn when `typeof process` is 'undefined', which is what a consumer's
    // browser gives after their bundler has inlined NODE_ENV.
    const GOOD = [
      /^typeof process\s*<\s*"u"\s*&&\s*process\.env\.NODE_ENV\s*===\s*"production"$/,
      /^typeof process\s*>\s*"u"\s*\|\|\s*process\.env\.NODE_ENV\s*!==\s*"production"$/,
    ]

    const guards =
      js.match(
        /typeof process\s*[<>]\s*"u"\s*(?:&&|\|\|)\s*process\.env\.NODE_ENV\s*[!=]==\s*"production"/g,
      ) ?? []
    expect(guards.length, 'no process guards found at all — extraction is broken').toBeGreaterThan(
      0,
    )

    const bad = guards.filter((g) => !GOOD.some((re) => re.test(g)))
    expect(bad, `fail-closed guard shape(s): ${bad.join(' | ')}`).toEqual([])
  })
})

describe.skipIf(built)('bundle not built', () => {
  it('fails in CI, skips locally — a skip must never read as a pass in the gate', () => {
    expect(process.env.CI, 'dist/ absent in CI: build must run before tests').toBeFalsy()
  })
})
