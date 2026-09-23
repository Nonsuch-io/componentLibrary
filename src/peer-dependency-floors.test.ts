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

/**
 * [major, minor, patch] from a caret/plain range.
 *
 * THROWS RATHER THAN SKIPS on anything else, and that is deliberate for the
 * monorepo move: the day `devDependencies.quasar` becomes `catalog:`, a
 * graceful skip would silently retire the only check here with teeth, which is
 * the "a skip reads as a pass" failure mode this file already names below. A
 * throw makes it a visible task — the real floor still exists, it just moves
 * to pnpm-workspace.yaml. Review (fable) recommended keeping the throw.
 *
 * A PRERELEASE also throws. `2.32.0-beta.1` sorts BELOW `2.32.0` in semver,
 * and dropping the tag would let a dev floor pinned to a beta pass a check
 * whose whole purpose is "dev is not below peer". Quasar ships betas, so this
 * is not theoretical.
 */
function versionOf(range: string): [number, number, number] {
  const match = /(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?/.exec(range)
  if (!match) {
    throw new Error(
      `cannot parse a version out of range "${range}" — if this is a pnpm ` +
        `catalog entry, resolve it from pnpm-workspace.yaml rather than skipping`,
    )
  }
  if (match[4]) {
    throw new Error(
      `range "${range}" is a PRERELEASE, which sorts below its release — ` +
        `this check will not reason about it`,
    )
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

/**
 * Compare NUMERICALLY, field by field. `a >= b` on two arrays coerces both to
 * STRINGS — `[2,32,0] >= [2,9,0]` is "2,32,0" >= "2,9,0", which is FALSE. The
 * first version of this check did exactly that and happened to give the right
 * answer for today's numbers, which is the worst kind of correct: it would
 * have started lying the moment a minor crossed a digit boundary (2.9 vs 2.32,
 * or 2.32.9 vs 2.32.10).
 */
function atLeast(a: [number, number, number], b: [number, number, number]): boolean {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i]
  }
  return true
}

/**
 * THE WHOLE CHECK, over two RANGES, so the synthetic cases below exercise the
 * same path as the real one. Testing `atLeast` alone was not enough: swapping
 * the call site back to `dev >= peer` left every test green, because the real
 * values (^2.32.0 vs ^2.32.0) agree under string coercion. A helper can be
 * correct and unused.
 */
function devFloorIsAtLeastPeer(devRange: string, peerRange: string): boolean {
  return atLeast(versionOf(devRange), versionOf(peerRange))
}

describe('we build against something we actually support (componentLibrary-u5v)', () => {
  const peers = pkg.peerDependencies ?? {}
  const devDeps = pkg.devDependencies ?? {}
  const shared = Object.keys(peers).filter((name) => name in devDeps)

  const cases: Array<[string, string, boolean, string]> = [
    ['^2.32.0', '^2.9.0', true, 'a minor that sorts wrong as a string'],
    ['^2.32.10', '^2.32.9', true, 'a patch that sorts wrong as a string'],
    ['^2.9.0', '^2.32.0', false, 'genuinely below, across the same boundary'],
    ['^2.32.0', '^2.32.0', true, 'equal'],
    ['^3.0.0', '^2.99.99', true, 'a higher major'],
  ]
  it('has shared peers to compare, so the cases below are not vacuous', () => {
    // The 3kx describe guards the identical list; guarded here too so the two
    // cannot drift apart silently (review, fable).
    expect(shared.length).toBeGreaterThan(0)
  })

  it.each([
    ['^2.32.0-beta.1', 'a prerelease dev floor'],
    ['catalog:', 'a pnpm catalog entry'],
    ['workspace:*', 'a workspace protocol range'],
    ['*', 'an unbounded range'],
  ])('refuses to reason about %s (%s)', (range) => {
    expect(() => versionOf(range)).toThrow()
  })

  it.each(cases)('dev %s vs peer %s is %s — %s', (dev, peer, want) => {
    // Through the SAME function the real check uses. The first two cases are
    // the ones string coercion gets wrong; today's actual ranges do not
    // distinguish the two implementations, so without these the comparison
    // could silently revert.
    expect(devFloorIsAtLeastPeer(dev, peer)).toBe(want)
  })

  it.each(shared)('%s: the devDependency floor is not BELOW the peer floor', (name) => {
    // Found by review on the branch that raised the peer floor: the peer said
    // ^2.32.0 while devDependencies still said ^2.18.6 — we were telling
    // consumers a version was unsupported while declaring ourselves happy to
    // build on it. Only the lockfile kept the suite honest, and the majors-only
    // check below cannot see it.
    expect(
      devFloorIsAtLeastPeer(devDeps[name], peers[name]),
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
