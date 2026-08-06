/**
 * THE TEST THAT WOULD HAVE CAUGHT THE BLOCKER, and the reason it exists.
 *
 * The first version of this guard used `import.meta.env.DEV`. Vite inlines that to `false`
 * when it builds THIS LIBRARY, so the whole branch — and every warning in it — was
 * tree-shaken out of `dist/` before any consumer's bundler saw it. Measured at the time:
 * zero `console.warn`, zero occurrences of the warning text in the published bundle.
 *
 * Every other test passed. They ran from SOURCE, where the guard is alive. I even mutated
 * the guard away deliberately and watched them go red — they could fail, they did fail, and
 * they still proved nothing, because the artefact under test was never the one that ships.
 *
 * So this asserts against `dist/` itself. It is the only test in the suite whose subject is
 * the BUILD OUTPUT rather than the source, and that is precisely the point.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const BUNDLE = resolve(__dirname, '../../dist/nonsuch-components.js')
const built = existsSync(BUNDLE)

describe.skipIf(!built)('the attr-conflict warning survives the library build', () => {
  const bundle = built ? readFileSync(BUNDLE, 'utf8') : ''

  it('ships the warning call — not tree-shaken out', () => {
    expect(bundle).toContain('console.warn')
  })

  it('ships the warning TEXT, so the guard is reachable and not a dead branch', () => {
    expect(bundle).toContain('competes with')
  })

  it('gates on NODE_ENV, which the CONSUMER resolves — not on import.meta.env.DEV, which we do', () => {
    expect(bundle).toContain('NODE_ENV')
    expect(bundle).not.toContain('import.meta.env.DEV')
  })
})

describe.skipIf(built)('bundle not built', () => {
  it('fails in CI, skips locally — a skip must never read as a pass in the gate', () => {
    // The comment this replaced said "CI builds before testing". That was FALSE:
    // ci.yml ran Test before Build and dist/ is gitignored, so on every PR this
    // whole file skipped and reported green, and the assertions guarding the
    // published bundle had never once executed in the gate protecting main.
    // The workflow is reordered; this makes the remaining failure mode loud
    // rather than trusting that ordering forever.
    expect(
      process.env.CI,
      'dist/ is absent in CI: the build must run before tests, or the assertions ' +
        'in this file silently do not execute. Run `pnpm build` first.',
    ).toBeFalsy()
  })
})
