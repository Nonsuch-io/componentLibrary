import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LOCKFILE = resolve(ROOT, 'pnpm-lock.yaml')

/** Direct deps of the root importer, mapped to the version the lockfile resolves.
 *  Peer suffixes (`3.5.41(typescript@6.0.3)`) are stripped — only the package's
 *  own version is comparable to what its package.json reports. */
// A `link:` or npm-aliased dep would record `version: link:../foo` or
// `real-pkg@1.2.3` and read as drift that `pnpm install` cannot fix. None exist
// here today; if one is added, the remedy in the failure message will be wrong
// for it.
//
// (A "does the lockfile exist" test used to sit below. It could never fail: this
// function runs at collection time, so a missing lockfile throws before any test
// executes. Removed rather than repaired.)
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
    // READ package.json DIRECTLY, never require.resolve. Resolution obeys the
    // dependency's own exports map, and four packages here forbid
    // `./package.json` — including @phosphor-icons/vue, this library's ONLY
    // runtime dependency. They were silently skipped, so the guard reported
    // "your tree matches CI" while blind to the dep that ships to consumers.
    // pnpm symlinks every direct dep at the top level, so fs sees all 35.
    //
    // A MISSING package is drift, not an exemption. The old `catch { continue }`
    // also swallowed packages not installed at all — the most realistic stale-tree
    // state there is. Both proven by mutation in review of PR #283.
    const drift: string[] = []
    let compared = 0
    for (const [name, expected] of locked) {
      let installed: string
      try {
        const raw = readFileSync(resolve(ROOT, 'node_modules', name, 'package.json'), 'utf-8')
        installed = (JSON.parse(raw) as { version: string }).version
      } catch {
        compared++
        drift.push(`${name}: NOT INSTALLED, lockfile ${expected}`)
        continue
      }
      compared++
      if (installed !== expected)
        drift.push(`${name}: installed ${installed}, lockfile ${expected}`)
    }
    // EVERY locked dep, not "more than ten". A floor BOUNDS a blind spot; this
    // closes it, because there is no exempt set for a package to quietly join.
    expect(compared, 'not every locked dependency was compared').toBe(locked.size)
    expect(
      drift,
      'node_modules has drifted from pnpm-lock.yaml. CI installs --frozen-lockfile, ' +
        'so your local results are NOT evidence about CI — and reading source from ' +
        'node_modules is reading the wrong version. Run:\n' +
        '    pnpm install --frozen-lockfile\n' +
        drift.join('\n'),
    ).toEqual([])
  })
})
