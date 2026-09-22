import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * EVERY DOM GLOBAL IN THE SHIPPED BUNDLE MUST BE REACHED THROUGH `typeof`.
 *
 * A server has no `window`, `document`, `Element` or `MutationObserver`, and a
 * BARE reference to one is a ReferenceError — it does not evaluate to
 * undefined, so it cannot be guarded by truthiness. Code that runs during
 * SETUP (a plugin body, a module top level, an `immediate` watch) therefore
 * takes the whole page down, not just its own component.
 *
 * 0.53.1 shipped `host instanceof Element` inside an `immediate` watch and
 * 500'd butiq's Nuxt homepage on EVERY route — including routes with no
 * select on them — while 1554 unit tests and 297 Chromium stories stayed
 * green, because happy-dom and Chromium both define Element
 * (componentLibrary-2cp).
 *
 * This reads the BUILT bundle rather than src: what ships is what matters, and
 * a guard over source would miss anything a dependency or the bundler inlines.
 * `src/ssr.ssr-test.ts` covers the composable layer by actually rendering on a
 * server; this covers the whole surface cheaply.
 *
 * A LEGITIMATE client-only reference goes inside a `typeof X === 'undefined'`
 * check, an `onMounted`, or an event handler. If a new pattern is genuinely
 * safe and this fails, widen SAFE_FORMS deliberately and say why — do not
 * delete the global from the list.
 */
const BUNDLE = resolve(process.cwd(), 'dist/nonsuch-components.js')
const built = existsSync(resolve(process.cwd(), 'dist/index.d.ts'))

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

describe.skipIf(!built)('the bundle is safe to import on a server', () => {
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
      const before = js.slice(Math.max(0, use.index - 160), use.index)
      expect(
        before.includes(`typeof ${global}`),
        `\`instanceof ${global}\` with no \`typeof ${global}\` guard within 160 chars — ` +
          `this throws on a server. Context: ...${before.slice(-90)}${use[0]}`,
      ).toBe(true)
    }
  })
})
