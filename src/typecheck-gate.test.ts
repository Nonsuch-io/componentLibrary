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

    // Checked FIRST, because the two below cannot tell these apart. On timeout
    // or ENOENT `status` is null, so `not.toBe(0)` passes vacuously and the
    // failure message would claim vue-tsc "reported something else" when it
    // never ran at all. The gate still fails — the TS2322 check catches it — but
    // it fails pointing at the wrong thing. Review finding.
    expect(
      result.error,
      `vue-tsc never ran or never finished; this is not a type-error result.\n${result.error}`,
    ).toBeUndefined()

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

  it('keeps the canary out of the real typecheck program', () => {
    // WAS a string check for "test/fixtures/**" in tsconfig.test.json — which
    // passes if the glob sits in a comment, and says nothing about whether the
    // compiler actually excluded anything. That is the pattern this file's own
    // header criticises, so it was replaced with the resolved FILE LIST.
    const result = spawnSync(
      'npx',
      ['tsc', '-p', resolve(ROOT, 'tsconfig.test.json'), '--listFilesOnly'],
      { cwd: ROOT, encoding: 'utf-8', timeout: 120_000 },
    )
    const files = (result.stdout ?? '').split('\n')
    expect(result.error, 'tsc never ran, so the file list proves nothing').toBeUndefined()
    expect(
      files.some((f) => f.includes('.test.ts')),
      'no test files in the program at all',
    ).toBe(true)
    expect(
      files.filter((f) => f.includes('typecheck-canary')),
      'the deliberately broken fixture is inside the real typecheck — CI can never be green',
    ).toEqual([])
  }, 120_000)
})
