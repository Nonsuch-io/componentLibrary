import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { floorOf, peerFloor } from '../scripts/peer-floor.mjs'

/**
 * The script CI uses to decide which quasar to install for the peer-floor job
 * (componentLibrary-q5r). It lives in scripts/ because CI runs it as a CLI;
 * it is tested from here because the unit project's glob is `src/**\/*.test.ts`.
 *
 * Worth testing rather than inlining a `node -e` in the workflow: if this
 * returns the wrong version the job still goes green, having tested the wrong
 * thing — the exact failure mode the gate exists to prevent.
 */
describe('floorOf', () => {
  it.each([
    ['^2.32.0', '2.32.0'],
    ['~2.32.0', '2.32.0'],
    ['2.32.0', '2.32.0'],
    ['^2.9.0', '2.9.0'],
    ['^10.0.1', '10.0.1'],
  ])('%s floors at %s', (range, want) => {
    expect(floorOf(range)).toBe(want)
  })

  it.each([
    ['^2.32.0-beta.1', 'a prerelease'],
    ['catalog:', 'a pnpm catalog entry'],
    ['workspace:*', 'a workspace protocol range'],
    ['*', 'an unbounded range'],
    ['>=2.32.0', 'a comparator range'],
    ['^2.32', 'an incomplete version'],
    ['', 'nothing at all'],
  ])('refuses %s (%s)', (range) => {
    expect(() => floorOf(range)).toThrow()
  })

  it('names pnpm-workspace.yaml when it sees a catalog range, so the throw is a task', () => {
    expect(() => floorOf('catalog:')).toThrow(/pnpm-workspace\.yaml/)
  })
})

describe('peerFloor', () => {
  it('reads the range out of a manifest', () => {
    expect(peerFloor({ peerDependencies: { quasar: '^2.32.0' } }, 'quasar')).toBe('2.32.0')
  })

  it('throws for a name that is not a peer, rather than returning undefined', () => {
    expect(() => peerFloor({ peerDependencies: {} }, 'quasar')).toThrow(/not a peerDependency/)
    expect(() => peerFloor({}, 'quasar')).toThrow(/not a peerDependency/)
  })

  it('resolves the floor of the NAMED peer from this package own manifest', () => {
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8'))
    const declared = pkg.peerDependencies.quasar as string
    const floor = peerFloor(pkg, 'quasar')
    // Tied to the DECLARED RANGE, not to a shape. Review (sonnet) mutated
    // peerFloor to ignore its `name` and always read `vue`, and the previous
    // version of this test passed — vue's floor is also three dot-separated
    // numbers. A wrong-key bug in the function CI actually invokes would have
    // been invisible here, which is the one place it most needed to be seen.
    expect(declared).toContain(floor)
    expect(floor).not.toBe(peerFloor(pkg, 'vue'))
  })
})
