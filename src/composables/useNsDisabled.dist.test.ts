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

  it('has NO fail-closed guard: none returns early merely because process is absent', () => {
    // MATCH ON THE OPERATOR, NOT THE SURROUNDING SYNTAX. My first version
    // required `) return` after the condition and could not fail: the minifier
    // chains the next guard in, producing `...||Qe.has(e))return`. Proved it
    // green against a deliberately reverted polarity before fixing it.
    //
    // The distinguishing signature is which comparison pairs with
    // `typeof process > "u"` (i.e. "process is undefined"):
    //     >"u" || ... === "production"   FAIL-CLOSED — silent in a browser
    //     >"u" || ... !== "production"   fail-open inline guard   (fine)
    //     <"u" && ... === "production"   fail-open early return   (fine)
    const failClosed =
      /typeof process\s*>\s*"u"\s*\|\|\s*process\.env\.NODE_ENV\s*===\s*"production"/g
    const hits = js.match(failClosed) ?? []
    expect(hits, `fail-closed guard(s) found: ${hits.join(' | ')}`).toEqual([])
  })
})

describe.skipIf(built)('bundle not built', () => {
  it('fails in CI, skips locally — a skip must never read as a pass in the gate', () => {
    expect(process.env.CI, 'dist/ absent in CI: build must run before tests').toBeFalsy()
  })
})
