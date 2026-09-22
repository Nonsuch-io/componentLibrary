import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * NO `instanceof <DOM GLOBAL>` IN THE SHIPPED BUNDLE WITHOUT A `typeof` GUARD
 * IN THE SAME STATEMENT.
 *
 * A server has no `window`, `document`, `Element` or `MutationObserver`, and a
 * BARE reference to one is a ReferenceError — it does not evaluate to
 * undefined, so it cannot be guarded by truthiness. Code that runs during
 * SETUP (a plugin body, a module top level, an `immediate` watch, a DEFAULT
 * PARAMETER) therefore takes the whole page down, not just its own component.
 *
 * 0.53.1 shipped `host instanceof Element` inside an `immediate` watch and
 * 500'd butiq's Nuxt homepage on EVERY route — including routes with no
 * select on them — while 1554 unit tests and 297 Chromium stories stayed
 * green, because happy-dom and Chromium both define Element
 * (componentLibrary-2cp).
 *
 * WHAT THIS DOES NOT COVER, stated plainly because the first draft's headline
 * claimed "every DOM global" and review (sonnet) showed it did not:
 *   - Bare PROPERTY ACCESS: `document.body`, `window.foo`, and the
 *     `el = document.documentElement` default parameter that the same review
 *     found still live in `getToken()`. Statically it is indistinguishable
 *     from the same access inside an onMounted, which is legitimate and
 *     common, so this file does not try. `src/ssr.ssr-test.ts` covers that by
 *     actually rendering on a server; component-level coverage is
 *     componentLibrary-zfw.
 *   - Anything a dependency evaluates at import time.
 *
 * A LEGITIMATE client-only `instanceof` goes behind `typeof X === 'undefined'`
 * in the same statement. If a new pattern is genuinely safe and this fails,
 * widen it deliberately and say why — do not delete the global from the list.
 */
const BUNDLE = resolve(process.cwd(), 'dist/nonsuch-components.js')
const built = existsSync(resolve(process.cwd(), 'dist/index.d.ts'))

/**
 * Skipping is fine locally (no build, nothing to read) but NOT in CI, where a
 * silent skip is a gate that cannot fail — review (sonnet) measured this file
 * reporting "1 skipped", exit 0, after a partial build. CI builds first, so if
 * dist is missing there, something is wrong and this should say so.
 */
const inCI = typeof process !== 'undefined' && process.env.CI === 'true'

/** Globals a Nitro/Node server does not define. */
const DOM_GLOBALS = [
  'window',
  'document',
  'Element',
  'HTMLElement',
  'Node',
  'MutationObserver',
  'ResizeObserver',
  'IntersectionObserver',
  'navigator',
  'localStorage',
]

describe.skipIf(!built && !inCI)('the bundle is safe to import on a server', () => {
  it('has a build to check (CI must never skip this file silently)', () => {
    expect(built, 'dist/index.d.ts is missing — run `pnpm build` before this suite').toBe(true)
  })

  const js = built && existsSync(BUNDLE) ? readFileSync(BUNDLE, 'utf-8') : ''

  it('emits the bundle at all', () => {
    expect(existsSync(BUNDLE), 'dist/index.d.ts exists but the bundle does not').toBe(true)
  })

  // `x instanceof Element` is the shape that bit us: it LOOKS like a guard.
  // A property access (`document.body`) inside a mounted hook is fine and very
  // common, so this checks the instanceof form and the bare typeof-less
  // comparisons only — the narrow rule that has a real failure behind it.
  it.each(DOM_GLOBALS)('never uses `instanceof %s` without a typeof guard', (global) => {
    const uses = [...js.matchAll(new RegExp(String.raw`instanceof\s+${global}\b`, 'g'))]
    for (const use of uses) {
      // THE SAME STATEMENT, not "somewhere in the previous 160 characters":
      // review (sonnet) built a minified case where a guarded helper masked a
      // genuinely bare `instanceof` in a DIFFERENT function ~20 chars later,
      // and the window-based check called both guarded. Cutting at the last
      // statement or block boundary kills that: a guard in another function is
      // always separated by at least one of these.
      const window160 = js.slice(Math.max(0, use.index - 160), use.index)
      const boundary = Math.max(
        window160.lastIndexOf(';'),
        window160.lastIndexOf('{'),
        window160.lastIndexOf('}'),
      )
      const statement = window160.slice(boundary + 1)
      expect(
        statement.includes(`typeof ${global}`),
        `\`instanceof ${global}\` with no \`typeof ${global}\` guard in the same ` +
          `statement — this throws on a server. Context: ...${window160.slice(-90)}${use[0]}`,
      ).toBe(true)
    }
  })
})
