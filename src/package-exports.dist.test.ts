import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * EVERY PATH package.json PROMISES MUST EXIST AFTER A BUILD.
 *
 * This exists because adding a second vite lib entry silently renamed the
 * stylesheet: with one entry vite derives the CSS name from `lib.fileName`, and
 * with several it falls back to the PACKAGE NAME. The build succeeded, every
 * test passed, and `"./style.css": "./dist/nonsuch-components.css"` pointed at a
 * file that no longer existed — so every consumer's `import
 * '@nonsuch/component-library/style.css'` would have failed to resolve.
 *
 * It was caught only because the `styles` size budget happens to point at the
 * same path and said "can't find files". A budget written to measure size
 * caught a missing file. That is luck, not a check.
 *
 * The consequence is not hypothetical: butiq reported the same class from the
 * other direction — two Nuxt apps that never imported style.css at all, which
 * stayed invisible for months because most components borrow quasar.css until
 * one stops wrapping Quasar.
 */
type ExportEntry = string | Record<string, string>

const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')) as {
  exports: Record<string, ExportEntry>
  files: string[]
  main?: string
  module?: string
  types?: string
}

/** Every filesystem path the package promises, flattened from `exports`. */
function promisedPaths(): { key: string; path: string }[] {
  const out: { key: string; path: string }[] = []
  for (const [key, value] of Object.entries(pkg.exports)) {
    if (typeof value === 'string') out.push({ key, path: value })
    else
      for (const [cond, p] of Object.entries(value)) out.push({ key: `${key} (${cond})`, path: p })
  }
  for (const field of ['main', 'module', 'types'] as const) {
    const v = pkg[field]
    if (v) out.push({ key: field, path: v })
  }
  return out
}

const built = existsSync(resolve(process.cwd(), 'dist/index.d.ts'))

describe.skipIf(!built)('package.json exports resolve to real files', () => {
  const promised = promisedPaths()

  it('promises a non-trivial number of paths — extraction is not vacuous', () => {
    expect(promised.length, 'no export paths found; the parser is broken').toBeGreaterThan(5)
  })

  it.each(promised)('$key -> $path exists', ({ path }) => {
    const abs = resolve(process.cwd(), path.replace(/^\.\//, ''))
    expect(
      existsSync(abs),
      `package.json promises ${path} and it does not exist after a build. ` +
        'A consumer importing it gets an unresolvable module.',
    ).toBe(true)
  })
})

describe.skipIf(built)('bundle not built', () => {
  it('fails in CI, skips locally — a skip must never read as a pass in the gate', () => {
    expect(process.env.CI, 'dist/ absent in CI: build must run before tests').toBeFalsy()
  })
})
