/**
 * PROOF (c) for componentLibrary-wer: the GlobalComponents augmentation
 * actually reaches the published package, not just local type-checking.
 *
 * `src/global-components.ts` is a `.ts` file (not `.d.ts`) precisely
 * because hand-written `.d.ts` SOURCE files are treated by
 * `vue-tsc --emitDeclarationOnly` as already-compiled output and are NOT
 * copied into `declarationDir` — a `.d.ts` source here would type-check
 * from `src/` (where every other test in this repo runs from) while
 * silently vanishing from `dist/`. That is the nk3 lesson repeating: a
 * guard that never reaches the artefact consumers actually install. So,
 * like `useNsAttrConflictWarning.dist.test.ts`, this asserts against the
 * BUILT `dist/` output.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const GLOBAL_TYPES = resolve(__dirname, '../dist/global-components.d.ts')

/**
 * THE BUILT-MARKER MUST NOT BE THE SUBJECT.
 *
 * This was originally `existsSync(GLOBAL_TYPES)`, which made the skip sentinel
 * the very file whose emission is under test. If `vue-tsc --emitDeclarationOnly`
 * silently dropped it — the exact regression this file exists to catch — the
 * real suite SKIPPED and a fallback asserting `expect(built).toBe(false)` went
 * green. Verified: deleting dist/global-components.d.ts produced "1 passed,
 * 4 skipped". A missing file and an absent build were the same reading.
 *
 * index.d.ts proves a declaration build ran; the augmentation's presence is
 * then a hard assertion below, so a build that drops it fails loudly.
 */
const built = existsSync(resolve(__dirname, '../dist/index.d.ts'))

describe.skipIf(!built)('the GlobalComponents augmentation survives the library build', () => {
  it('emits dist/global-components.d.ts — a declaration build ran, so it must exist', () => {
    expect(
      existsSync(GLOBAL_TYPES),
      'dist/index.d.ts exists but dist/global-components.d.ts does not — the ' +
        'augmentation was dropped from the build. package.json exports["./global"] ' +
        'now points at a file that will not ship.',
    ).toBe(true)
  })

  const dts = built && existsSync(GLOBAL_TYPES) ? readFileSync(GLOBAL_TYPES, 'utf8') : ''

  it('emits dist/global-components.d.ts at all — not silently dropped by emitDeclarationOnly', () => {
    expect(dts.length).toBeGreaterThan(0)
  })

  it('augments the real `vue` module, not a local/renamed one', () => {
    expect(dts).toContain("declare module 'vue'")
  })

  it('declares GlobalComponents with the PascalCase component names', () => {
    expect(dts).toContain('interface GlobalComponents')
    expect(dts).toContain('NsButton: typeof NsButton')
    expect(dts).toContain('NsBanner: typeof NsBanner')
  })

  it('package.json exposes it at the opt-in ./global subpath, pointing at this file', () => {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8')) as {
      exports?: Record<string, unknown>
    }
    const globalExport = pkg.exports?.['./global'] as { types?: string } | undefined
    expect(globalExport?.types).toBe('./dist/global-components.d.ts')
  })
})

describe.skipIf(built)('declaration build not present', () => {
  it('fails in CI, skips locally — a skip must never read as a pass in the gate', () => {
    // ci.yml runs Test BEFORE Build and dist/ is gitignored, so on a PR this
    // whole file used to be skipped — its assertions never executed in the gate
    // that protects main, while its own comment claimed "CI builds before
    // testing". The workflow is reordered to build first; this guard makes the
    // remaining failure mode loud rather than trusting that ordering forever.
    expect(
      process.env.CI,
      'dist/ is absent in CI: the build must run before tests, or these ' +
        'assertions silently do not execute. Run `pnpm build` first.',
    ).toBeFalsy()
  })
})
