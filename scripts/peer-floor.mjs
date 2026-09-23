/**
 * Resolve the EXACT version a peerDependency range floors at, so CI can test
 * the oldest version we claim to support rather than whatever the registry
 * hands us today (componentLibrary-q5r).
 *
 * The declared floor is the promise; `pnpm install` resolves the NEWEST match,
 * so the promise has never been exercised. That is how `^2.17.0` stayed
 * declared for months while nine assertions failed on it
 * (componentLibrary-u5v), and how a fix that only worked on the newest quasar
 * could pass review (componentLibrary-5ng).
 *
 * Deliberately refuses anything it cannot reason about, rather than guessing —
 * same rule as src/peer-dependency-floors.test.ts. A `catalog:` range after the
 * monorepo move must be resolved from pnpm-workspace.yaml, not skipped.
 */
export function floorOf(range) {
  if (typeof range !== 'string' || range.trim() === '') {
    throw new Error(`no range given (got ${JSON.stringify(range)})`)
  }
  const match = /^[~^]?(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?$/.exec(range.trim())
  if (!match) {
    throw new Error(
      `cannot resolve a floor from range "${range}" — if this is a pnpm catalog ` +
        `entry, resolve it from pnpm-workspace.yaml rather than skipping`,
    )
  }
  if (match[4]) {
    throw new Error(`range "${range}" is a PRERELEASE; this gate will not reason about it`)
  }
  return `${match[1]}.${match[2]}.${match[3]}`
}

/** The peer range for `name`, read from a package manifest object. */
export function peerFloor(pkg, name) {
  const range = pkg?.peerDependencies?.[name]
  if (range === undefined) throw new Error(`"${name}" is not a peerDependency`)
  return floorOf(range)
}

// CLI: node scripts/peer-floor.mjs quasar  ->  2.32.0
if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs')
  const { resolve, dirname } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
  const name = process.argv[2]
  if (!name) {
    console.error('usage: node scripts/peer-floor.mjs <peer-dependency-name>')
    process.exit(2)
  }
  process.stdout.write(peerFloor(pkg, name))
}
