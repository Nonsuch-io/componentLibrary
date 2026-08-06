/**
 * Drift guard for componentLibrary-wer.
 *
 * Three things must agree on exactly the same set of Ns* component names:
 *   1. index.ts        — `export { default as Ns* } from '...'`  (the public API)
 *   2. plugin.ts        — `nsComponentRegistry` (what `createNonsuch()` actually
 *                          calls `app.component()` for at runtime)
 *   3. global-components.ts — the `GlobalComponents` type augmentation
 *                          (what TypeScript claims resolves as a global tag;
 *                          see that file's header for why it's a `.ts` file
 *                          rather than a `.d.ts` file)
 *
 * A hand-maintained list silently goes stale the first time someone adds or
 * removes a component. This test reads index.ts and global-components.ts as
 * TEXT (not by importing them, so it can't be fooled by the very runtime
 * mechanism it's checking) and fails if any of the three disagree, in either
 * direction: an export with no matching declaration/registration, or a
 * declaration/registration with no matching export.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { nsComponentRegistry } from './component-registry'

const INDEX_SOURCE = readFileSync(resolve(__dirname, './index.ts'), 'utf8')
const GLOBAL_TYPES_SOURCE = readFileSync(resolve(__dirname, './global-components.ts'), 'utf8')

/** Names index.ts actually exports as default-exported Ns* components. */
function namesExportedByIndex(source: string): Set<string> {
  const names = new Set<string>()
  // PATH-AGNOSTIC ON PURPOSE. This once required `from './components/….vue'`,
  // which made a component exported from a .ts wrapper INVISIBLE to the guard —
  // not caught and reported, but absent from the comparison set entirely, so
  // adding one without registering it passed every assertion here. Found by the
  // sonnet review. Match the export SHAPE, not where the file happens to live.
  const re = /export\s*\{\s*default as (Ns\w+)\s*\}\s*from/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source))) {
    names.add(match[1])
  }
  return names
}

/** Names declared inside the `GlobalComponents` interface augmentation. */
function namesDeclaredInGlobalTypes(source: string): Set<string> {
  const interfaceMatch = source.match(/interface GlobalComponents\s*\{([\s\S]*?)\n\s*\}/)
  if (!interfaceMatch) {
    throw new Error('Could not find `interface GlobalComponents { ... }` in global-components.ts')
  }
  const names = new Set<string>()
  const re = /(Ns\w+):\s*typeof \w+/g
  let match: RegExpExecArray | null
  while ((match = re.exec(interfaceMatch[1]))) {
    names.add(match[1])
  }
  return names
}

describe('component registry drift guard', () => {
  const indexExports = namesExportedByIndex(INDEX_SOURCE)
  const declaredGlobals = namesDeclaredInGlobalTypes(GLOBAL_TYPES_SOURCE)
  const registeredComponents = new Set(Object.keys(nsComponentRegistry))

  it('sanity: found a non-trivial number of component exports in index.ts', () => {
    // Guards against the regex silently matching zero and every other
    // assertion in this file passing vacuously.
    expect(indexExports.size).toBeGreaterThan(60)
  })

  it('every component index.ts exports has a matching GlobalComponents declaration', () => {
    const missingDeclarations = [...indexExports].filter((name) => !declaredGlobals.has(name))
    expect(missingDeclarations).toEqual([])
  })

  it('every GlobalComponents declaration has a matching component export in index.ts', () => {
    const orphanDeclarations = [...declaredGlobals].filter((name) => !indexExports.has(name))
    expect(orphanDeclarations).toEqual([])
  })

  it('every component index.ts exports is registered by createNonsuch()', () => {
    const missingRegistrations = [...indexExports].filter((name) => !registeredComponents.has(name))
    expect(missingRegistrations).toEqual([])
  })

  it('every component createNonsuch() registers is actually exported by index.ts', () => {
    const orphanRegistrations = [...registeredComponents].filter((name) => !indexExports.has(name))
    expect(orphanRegistrations).toEqual([])
  })

  it('every registry entry IS the component index.ts exports under that name', async () => {
    // NAMES ARE NOT IDENTITIES. Every other assertion here compares KEY NAMES,
    // so `import NsBanner from './components/NsButton/NsButton.vue'` in
    // component-registry.ts keeps the shorthand key `NsBanner`, passes all of
    // them, and typechecks — while <ns-banner> renders a button. Verified: the
    // equivalent swap in the augmentation passed 5/5 and vue-tsc reported no
    // error. This is the copy-paste error a hand-maintained 70-line block
    // invites, and it is the one shape the name checks structurally cannot see.
    const index = (await import('./index')) as unknown as Record<string, unknown>
    const mismatched = Object.entries(nsComponentRegistry)
      .filter(([name, component]) => index[name] !== component)
      .map(([name]) => name)
    expect(
      mismatched,
      `registry entries that are not the component index.ts exports under the ` +
        `same name (wrong import path, or a copy-paste swap): ${mismatched.join(', ')}`,
    ).toEqual([])
  })

  it('every GlobalComponents declaration maps a name to its OWN type', () => {
    // Types erase, so identity cannot be checked at runtime for the
    // augmentation — assert self-consistency in the source text instead:
    // `NsBanner: typeof NsBanner`, never `NsBanner: typeof NsButton`.
    const src = readFileSync(resolve(__dirname, 'global-components.ts'), 'utf8')
    const body = src.slice(src.indexOf('interface GlobalComponents'))
    const crossed = [...body.matchAll(/^\s*(Ns\w+):\s*typeof\s+(Ns\w+)/gm)]
      .filter(([, name, type]) => name !== type)
      .map(([, name, type]) => `${name}: typeof ${type}`)
    expect(
      crossed,
      `declarations pointing at another component's type: ${crossed.join(', ')}`,
    ).toEqual([])
  })

  it('plugin.ts imports no components, so createNonsuch costs nothing on its own', () => {
    // THE PROPERTY THIS WHOLE RESTRUCTURE EXISTS FOR. plugin.ts once held 70
    // static component imports, so `import { createNonsuch }` cost 17,510 bytes
    // gzipped and a `registerComponents` boolean could not change that — the
    // bytes were already in. Cost now follows the IMPORT of nsComponentRegistry,
    // which a consumer's bundler can see.
    //
    // ASSERTED IN SOURCE, NOT VIA size-limit. I added a size-limit budget for
    // `{ createNonsuch }` first and PROVED IT COULD NOT FAIL: with 8 component
    // imports wired into install(), it still read 1.79 kB and passed. A budget
    // that cannot detect its own regression is worse than none, so it was
    // removed rather than left as reassurance.
    const src = readFileSync(resolve(__dirname, 'plugin.ts'), 'utf8')
    const componentImports = [...src.matchAll(/^import\s+.*?from\s+'\.\/components\/.*$/gm)].map(
      (m) => m[0],
    )
    expect(
      componentImports,
      'plugin.ts must not import components directly — that puts every component ' +
        'into the bundle of anyone importing createNonsuch, whatever `components` ' +
        `is set to. Import them via nsComponentRegistry instead. Found:\n${componentImports.join('\n')}`,
    ).toEqual([])
  })
})
