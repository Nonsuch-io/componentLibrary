import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

/**
 * A GREEN LOCAL RUN IS NOT EVIDENCE ABOUT CI IF THE TREES DIFFER.
 *
 * Measured 2026-08-21: node_modules held quasar 2.23.1 while pnpm-lock.yaml
 * pinned 2.24.0. CI installs --frozen-lockfile, so an entire day of local runs
 * tested a different Quasar — including four design decisions settled by reading
 * node_modules source and quoting line numbers as evidence (QDialog.js:432,
 * QItem.js:146-150, use-checkbox.js:178, QTable.js:704). One of those decided
 * whether an ARIA role was safe to remove. componentLibrary-yka.
 *
 * Nothing warned. `pnpm install` had run before a dependabot bump landed and the
 * tree simply stayed stale.
 */
const ROOT = resolve(__dirname, '..')
const LOCKFILE = resolve(ROOT, 'pnpm-lock.yaml')
const req = createRequire(import.meta.url)

/** Direct deps of the root importer, mapped to the version the lockfile resolves.
 *  Peer suffixes (`3.5.41(typescript@6.0.3)`) are stripped — only the package's
 *  own version is comparable to what its package.json reports. */
function lockedDirectDependencies(): Map<string, string> {
  const lines = readFileSync(LOCKFILE, 'utf-8').split('\n')
  const start = lines.findIndex((l) => l.startsWith('importers:'))
  const rootAt = lines.findIndex((l, i) => i > start && /^ {2}\.:$/.test(l))
  const end = lines.findIndex((l, i) => i > rootAt && /^ {2}\S/.test(l) && !/^ {2}\.:$/.test(l))
  const out = new Map<string, string>()
  let name: string | null = null
  for (const line of lines.slice(rootAt, end === -1 ? undefined : end)) {
    const dep = line.match(/^ {6}'?([@\w./-]+)'?:$/)
    if (dep) {
      name = dep[1]
      continue
    }
    const ver = line.match(/^ {8}version: (.+)$/)
    if (ver && name) {
      out.set(name, ver[1].replace(/\(.*$/, '').trim())
      name = null
    }
  }
  return out
}

describe('installed packages match the lockfile (componentLibrary-yka)', () => {
  const locked = lockedDirectDependencies()

  it('parses direct dependencies out of the lockfile at all', () => {
    // Without this, a lockfile format change yields an empty map, every
    // comparison is skipped, and the drift check passes while checking nothing —
    // the empty-reads-as-valid failure this repo keeps finding.
    expect(locked.size, 'no direct dependencies parsed from pnpm-lock.yaml').toBeGreaterThan(20)
    expect(locked.get('quasar'), 'quasar not found among direct deps').toMatch(/^\d+\.\d+\.\d+/)
  })

  it('every installed direct dependency is the version the lockfile pins', () => {
    const drift: string[] = []
    let compared = 0
    for (const [name, expected] of locked) {
      let installed: string
      try {
        installed = req(`${name}/package.json`).version as string
      } catch {
        continue // not resolvable from here (bin-only, optional, or exports-restricted)
      }
      compared++
      if (installed !== expected)
        drift.push(`${name}: installed ${installed}, lockfile ${expected}`)
    }
    process.stderr.write(`COMPARED ${compared} of ${locked.size} locked direct deps\n`)
    expect(compared, 'no packages were actually compared').toBeGreaterThan(10)
    expect(
      drift,
      'node_modules has drifted from pnpm-lock.yaml. CI installs --frozen-lockfile, ' +
        'so your local results are NOT evidence about CI — and reading source from ' +
        'node_modules is reading the wrong version. Run:\n' +
        '    pnpm install --frozen-lockfile\n' +
        drift.join('\n'),
    ).toEqual([])
  })

  it('the lockfile exists where CI expects it', () => {
    expect(existsSync(LOCKFILE)).toBe(true)
  })
})
