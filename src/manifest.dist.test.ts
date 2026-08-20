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
      'the Quasar->Ns manifest is back in the runtime bundle. RESTORE THE ' +
        '`manifest` ENTRY in vite.config.ts — do NOT remove the re-export from ' +
        'src/index.ts, which is intentional and harmless, and removing it would ' +
        'break root importers for no gain.',
    ).toBe(false)
  })

  it('the manifest entry pulls in NO component runtime', () => {
    // MARKERS ALONE ARE NOT ENOUGH, proven by review: making manifest.ts import a
    // component made rollup hoist the runtime into a SHARED CHUNK, leaving
    // dist/manifest.js a two-line re-export containing none of these strings.
    // This test passed while `node -e "import(...)"` threw. So the sibling-import
    // check below matters more than the markers do.
    for (const marker of ['createElementVNode', 'defineComponent', 'q-btn', 'ns-btn']) {
      expect(manifest.includes(marker), `dist/manifest.js pulled in runtime code (${marker})`).toBe(
        false,
      )
    }
  })

  it('does not re-export from a sibling chunk, which is how runtime sneaks in', () => {
    // The shape review produced: `export { x } from "./src-abc123.js"`. Anything
    // the manifest entry imports from a sibling is code rollup could not prove
    // belonged only here — which is precisely the runtime this entry exists to
    // exclude.
    const siblings = [...manifest.matchAll(/from\s*["'](\.[^"']*)["']/g)].map((m) => m[1])
    expect(
      siblings,
      'dist/manifest.js imports from sibling chunks — it is no longer standalone, ' +
        'and the markers above cannot see what those chunks contain',
    ).toEqual([])
  })

  it("IMPORTS from a real Node process, which is butiq's actual contract", async () => {
    // Spawned, not imported in-process: vitest supplies browser globals, so an
    // in-process import proves nothing about Node. butiq's eslint.config.mjs
    // carries a hand-maintained copy of all 52 ban rules because the root bundle
    // throws `__QUASAR_SSR_SERVER__ is not defined` here. This is the assertion
    // they would be deleting that copy on the strength of.
    const { execFileSync } = await import('node:child_process')
    const out = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import('${MANIFEST}').then((m) => console.log(m.generateQuasarBanRules().length))`,
      ],
      { encoding: 'utf-8', timeout: 30_000 },
    )
    expect(
      Number(out.trim()),
      'the manifest subpath did not import cleanly in Node',
    ).toBeGreaterThan(40)
  })

  it('keeps the barrel re-export, so root importers are NOT broken', () => {
    // The PR's other headline claim, which had no test behind it: review deleted
    // the re-export from src/index.ts and every check stayed green. A future
    // "cleanup" could silently break any consumer importing the manifest from the
    // package root — the breaking change this change went out of its way to avoid.
    expect(
      bundle.includes('nsComponentManifest'),
      'the barrel no longer re-exports the manifest — root imports are broken',
    ).toBe(true)
  })
})
