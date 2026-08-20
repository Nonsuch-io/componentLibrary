import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * componentLibrary-19x — THE MANIFEST MUST NOT SHIP IN THE RUNTIME BUNDLE.
 *
 * It is build-tooling data: ESLint rules, CI drift checks, codemods. Nothing
 * renders it. While it was re-exported from the barrel, a consumer importing a
 * SINGLE component shipped the entire Quasar->Ns lookup table — measured at
 * 365 B gzipped, 12.3% of that bundle, paid by every consumer of every
 * component.
 *
 * A `/*#__PURE__*\/` annotation on the derived map did NOT fix it. Measured:
 * byte-identical output, because the dead derivation survived minification
 * anyway. Only a separate entry removes the dependency on a bundler heuristic
 * holding — the same reasoning as the quasar-config subpath (componentLibrary-0bw).
 *
 * These assert the SHIPPED ARTEFACTS, not the source, because the failure mode
 * is a re-export creeping back into the barrel and nothing noticing.
 */
const DIST = resolve(process.cwd(), 'dist')
const BUNDLE = resolve(DIST, 'nonsuch-components.js')
const MANIFEST = resolve(DIST, 'manifest.js')
const built = existsSync(resolve(DIST, 'index.d.ts'))

describe.skipIf(!built)('manifest is build tooling, not runtime (componentLibrary-19x)', () => {
  const bundle = built && existsSync(BUNDLE) ? readFileSync(BUNDLE, 'utf-8') : ''
  const manifest = built && existsSync(MANIFEST) ? readFileSync(MANIFEST, 'utf-8') : ''

  it('emits the manifest as its own entry', () => {
    expect(existsSync(MANIFEST), 'dist/manifest.js missing — the subpath export is broken').toBe(
      true,
    )
    expect(manifest.length, 'dist/manifest.js is empty').toBeGreaterThan(200)
  })

  it('keeps the lookup table OUT of the runtime bundle', () => {
    // The regression this exists for: someone re-adds
    // `export { nsComponentManifest } from './manifest'` to index.ts and every
    // consumer silently pays for it again.
    expect(
      bundle.includes('QOptionGroup'),
      'the Quasar->Ns manifest is back in the runtime bundle — check for a ' +
        're-export from src/index.ts',
    ).toBe(false)
  })

  it('the manifest entry pulls in NO component runtime', () => {
    // The other direction: the subpath must stay standalone. If it ever imports
    // from the barrel it drags Vue SFCs into an ESLint config's process.
    for (const marker of ['createElementVNode', 'defineComponent', 'q-btn', 'ns-btn']) {
      expect(manifest.includes(marker), `dist/manifest.js pulled in runtime code (${marker})`).toBe(
        false,
      )
    }
  })

  it('is importable from plain Node, which the barrel is NOT', () => {
    // butiq's actual blocker, quoted in their eslint.config.mjs: the root bundle
    // throws `__QUASAR_SSR_SERVER__ is not defined` outside a browser build, so
    // they inlined a hand-maintained copy of the ban rules. This subpath is the
    // thing that lets them delete it.
    expect(manifest).not.toContain('__QUASAR_SSR_SERVER__')
  })
})
