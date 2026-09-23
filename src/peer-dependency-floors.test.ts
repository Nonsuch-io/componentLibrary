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

/**
 * THE QUASAR FLOOR IS A MEASURED NUMBER, NOT A GUESS — and it was a lie for
 * months. `^2.17.0` was declared while the suite had not been run below the
 * newest release in as long as anyone could remember. Bisected 2026-09-22 in
 * isolated installs (`pnpm install --ignore-workspace`, quasar pinned, no
 * shared node_modules, `CI=1` so the dist tests cannot skip):
 *
 *     2.17.0 – 2.24.0   9 assertions fail across 5 files
 *     2.25.1            5 fail: NsBrandLogo ratio x2, NsTooltip tap x3
 *     2.26.0 – 2.31.0   2 fail: NsBrandLogo's two ratio assertions ONLY
 *     2.32.0            passes, dist tests included
 *
 * READ THE MIDDLE ROW HONESTLY: from 2.26 the only failures are two
 * NsBrandLogo assertions that check Quasar's MECHANISM, not the contract.
 * `use-ratio.js` returns `{ paddingBottom }` through 2.31 and `{ aspectRatio }`
 * from 2.32; the box is reserved either way, and the test asserts the 2.32
 * shape. So 2.26–2.31 are very likely fine in practice, and an earlier draft
 * of this comment claiming 2.32.0 is "the oldest version this library is known
 * to work on" was false — review (fable) bisected it.
 *
 * `^2.32.0` IS STILL THE DECLARED FLOOR, for a reason that is about testing
 * rather than behaviour: 2.32 is what we build against, what CI resolves, and
 * what the only consumer is moving to (Kale's decision, 2026-09-22). Declaring
 * a range we do not exercise is exactly how `^2.17.0` came to be wrong, and
 * widening back to 2.26 would mean committing to test it — which is
 * componentLibrary-q5r's job, not this bead's. If that job lands and someone
 * wants the wider range, teach the two NsBrandLogo assertions to accept either
 * mechanism and re-bisect.
 *
 * The pin below is deliberately tautological: it compares package.json to a
 * number written here, so LOWERING the floor is an act with a re-measurement
 * attached rather than a one-character edit. The dev-floor comparison further
 * down is the check with teeth — it caught devDependencies sitting BELOW the
 * peer floor on this very branch.
 */
const MEASURED_QUASAR_FLOOR = '^2.32.0'

describe('the quasar peer floor is the version we measured (componentLibrary-u5v)', () => {
  it('matches the measured floor', () => {
    expect(
      pkg.peerDependencies?.quasar,
      'peerDependencies.quasar changed without updating the measurement above it',
    ).toBe(MEASURED_QUASAR_FLOOR)
  })
})

/** [major, minor, patch] from a caret/plain range, for ordered comparison. */
function versionOf(range: string): [number, number, number] {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(range)
  if (!match) throw new Error(`cannot parse a version out of range "${range}"`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

describe('we build against something we actually support (componentLibrary-u5v)', () => {
  const peers = pkg.peerDependencies ?? {}
  const devDeps = pkg.devDependencies ?? {}
  const shared = Object.keys(peers).filter((name) => name in devDeps)

  it.each(shared)('%s: the devDependency floor is not BELOW the peer floor', (name) => {
    // Found by review on the branch that raised the peer floor: the peer said
    // ^2.32.0 while devDependencies still said ^2.18.6 — we were telling
    // consumers a version was unsupported while declaring ourselves happy to
    // build on it. Only the lockfile kept the suite honest, and the majors-only
    // check below cannot see it.
    const peer = versionOf(peers[name])
    const dev = versionOf(devDeps[name])
    expect(
      dev >= peer,
      `devDependencies.${name} is "${devDeps[name]}" but peerDependencies.${name} ` +
        `is "${peers[name]}" — we would be building against a version we tell ` +
        `consumers not to use.`,
    ).toBe(true)
  })
})

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
