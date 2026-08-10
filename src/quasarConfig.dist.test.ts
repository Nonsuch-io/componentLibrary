import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * `@nonsuch/component-library/quasar-config` exists so a consumer can read the
 * brand palette WITHOUT importing the barrel.
 *
 * That matters at Nuxt config-resolution time: importing `.` drags in Vue SFCs
 * and throws an SSR globals error, so butiq inlined a hand-copy of the palette
 * instead — and both their Nuxt apps then drifted to Tailwind defaults under a
 * comment claiming they mirrored this file. Brand orange never reached them.
 *
 * THE INVARIANT IS THAT THIS ENTRY IMPORTS NOTHING. Add one import to
 * quasarConfig.ts and the subpath silently regains the failure it was created to
 * avoid — the consumer's build breaks, or worse, they go back to copying.
 */
const ENTRY = resolve(process.cwd(), 'dist/quasar-config.js')
const built = existsSync(resolve(process.cwd(), 'dist/index.d.ts'))

describe.skipIf(!built)('the quasar-config subpath stays standalone', () => {
  it('is emitted as its own entry', () => {
    expect(existsSync(ENTRY), 'dist/quasar-config.js missing — check vite lib.entry').toBe(true)
  })

  const js = built && existsSync(ENTRY) ? readFileSync(ENTRY, 'utf-8') : ''

  it('imports nothing at all', () => {
    const imports = js.match(/^\s*import[\s{*'"]/gm) ?? []
    expect(
      imports,
      'the standalone entry gained an import. A consumer resolving this at Nuxt ' +
        'config time cannot pull in Vue — that is the whole reason this subpath exists.',
    ).toEqual([])
  })

  it('carries the real brand palette, not a placeholder', () => {
    expect(js, 'brand primary missing from the built entry').toContain('#d56307')
  })

  it('exports both the factory and the palette', () => {
    expect(js).toMatch(/export\s*\{[^}]*createQuasarConfig/)
    expect(js).toMatch(/NS_BRAND/)
  })
})

describe.skipIf(built)('bundle not built', () => {
  it('fails in CI, skips locally — a skip must never read as a pass in the gate', () => {
    expect(process.env.CI, 'dist/ absent in CI: build must run before tests').toBeFalsy()
  })
})
