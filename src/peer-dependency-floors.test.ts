import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * ADVERTISING SUPPORT FOR A MAJOR VERSION WE NEVER BUILD AGAINST IS A LIE.
 *
 * componentLibrary-3kx: `@quasar/vite-plugin` sat in peerDependencies at
 * `^1.8.0` while devDependencies — what we actually build and test against —
 * moved to `^2.0.0` in PR #295. Nobody's tests broke, because nothing checked
 * that the two agree; the drift was found by a human re-reading package.json.
 *
 * This does not (and cannot) prove a given peer floor is *correct* — that
 * needs an install matrix. It only catches the cheap, mechanical half of that
 * mistake: a peer's floor claiming an older MAJOR than the same package's
 * devDependency floor, for every package declared in both. If a future
 * dependency bump moves one and not the other, this fails instead of sitting
 * quiet until someone reads the diff by hand.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8')) as {
  peerDependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

/** Pull the major version out of a caret/plain range like `^2.17.0` or `2.17.0`. */
function majorOf(range: string): number {
  const match = /(\d+)\.\d+\.\d+/.exec(range)
  if (!match) throw new Error(`cannot parse a major version out of range "${range}"`)
  return Number(match[1])
}

describe('peerDependencies float on the same major as devDependencies (componentLibrary-3kx)', () => {
  const peers = pkg.peerDependencies ?? {}
  const devDeps = pkg.devDependencies ?? {}
  const sharedNames = Object.keys(peers).filter((name) => name in devDeps)

  it('at least one peer is also a devDependency, so the comparison below is exercising something', () => {
    // Without this, an empty `sharedNames` makes every `it.each` below vacuous —
    // it would report green having compared nothing, exactly the "skip reads as
    // pass" failure mode this repo keeps re-finding.
    expect(sharedNames.length).toBeGreaterThan(0)
  })

  it.each(sharedNames)('%s: peer floor major matches the devDependency major', (name) => {
    const peerMajor = majorOf(peers[name])
    const devMajor = majorOf(devDeps[name])
    expect(
      peerMajor,
      `peerDependencies.${name} is "${peers[name]}" (major ${peerMajor}) but ` +
        `devDependencies.${name} is "${devDeps[name]}" (major ${devMajor}) — we only ` +
        `ever build and test against major ${devMajor}, so the advertised peer range is a lie.`,
    ).toBe(devMajor)
  })
})
