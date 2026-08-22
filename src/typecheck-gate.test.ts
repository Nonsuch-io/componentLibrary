import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

/**
 * THE TYPECHECK GATE MUST BE ABLE TO FAIL.
 *
 * Until componentLibrary-9ka, both tsconfigs excluded `src/**\/*.test.ts`, so
 * vue-tsc never opened a test file. `const x: number = "nope"` in a test passed
 * `pnpm typecheck` clean. Two consequences, both silent:
 *
 *   - every `@ts-expect-error` in a test was inert, suppressing nothing;
 *   - `expectTypeOf` assertions were checked by NOTHING. Vitest erases them at
 *     runtime without `--typecheck`, and vue-tsc never read the file. One in
 *     NsTable.test.ts had been FALSE since it was written, with 23 tests green.
 *
 * Asserting "tsconfig.test.json exists" or "it lists *.test.ts" would restate
 * the config rather than test it — a glob can be right and the compiler still
 * never run. So this compiles a file that MUST fail and fails if it passes.
 */
const ROOT = resolve(__dirname, '..')
const CANARY = resolve(ROOT, 'test/fixtures/typecheck-canary')

describe('the typecheck gate can fail (componentLibrary-9ka)', () => {
  it('reports the error in a deliberately broken file', () => {
    const result = spawnSync(
      'npx',
      ['vue-tsc', '-p', resolve(CANARY, 'tsconfig.json'), '--noEmit'],
      { cwd: ROOT, encoding: 'utf-8', timeout: 120_000 },
    )
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`

    // Both halves matter. A non-zero exit alone would also be satisfied by
    // vue-tsc failing to start, a bad path, or a missing binary — all of which
    // look like a working gate while checking nothing.
    expect(result.status, `vue-tsc exited 0 over a broken file.\n${output}`).not.toBe(0)
    expect(output, 'vue-tsc failed, but not with the type error we planted').toContain('TS2322')
  }, 120_000)

  it('still has something broken to find', () => {
    // The canary is a normal-looking .ts file. A tidy-up that "fixes" it would
    // leave the test above passing on a green compile of nothing — so assert the
    // defect is still present rather than trusting the file to stay wrong.
    const source = readFileSync(resolve(CANARY, 'broken.ts'), 'utf-8')
    expect(source, 'the canary fixture was repaired — the gate test now proves nothing').toContain(
      "const wrong: number = 'this is a string'",
    )
  })

  it('excludes the canary from the real typecheck, or CI could never be green', () => {
    const config = readFileSync(resolve(ROOT, 'tsconfig.test.json'), 'utf-8')
    expect(config).toContain('test/fixtures/**')
  })
})
