// @vitest-environment node
//
// SSR SMOKE TEST — runs with NO DOM GLOBALS, which is the whole point. Every
// other suite here runs in happy-dom or Chromium, where `Element`, `document`
// and `window` exist; a server has none of them, and a BARE reference to one
// is a ReferenceError, not a falsy check.
//
// 0.53.1 shipped `host instanceof Element` inside a watch registered with
// `{ immediate: true }` — which runs during setup, on the server too — and
// 500'd butiq's Nuxt homepage on EVERY route, including routes with no select
// on them. 1554 unit tests and 297 Chromium stories were green: neither
// environment can see it (componentLibrary-2cp).
//
// Quasar is NOT imported here. Its `import` condition is the client bundle,
// which touches `window` at module scope, and Vitest resolves it that way
// whatever conditions this project asks for — so component-level SSR coverage
// needs a real Nitro-like harness, filed as componentLibrary-zfw.
// What this file covers is the composable layer, which is where the class of
// bug lives: code that runs during setup and reaches for the DOM.
import { describe, it, expect } from 'vitest'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useNsAboveLabelName } from './composables/useNsAboveLabelName'

describe('server rendering (componentLibrary-2cp)', () => {
  it('has no DOM globals — the condition the regression needs', () => {
    expect(typeof Element).toBe('undefined')
    expect(typeof document).toBe('undefined')
    expect(typeof window).toBe('undefined')
    expect(typeof MutationObserver).toBe('undefined')
  })

  // `active: true` on purpose: the inactive path returns before touching
  // anything, so it would pass even with the bare `instanceof` back.
  it.each([
    ['a real host object', { $el: { nodeType: 1 } }],
    ['no host at all', null],
  ])('useNsAboveLabelName renders with %s', async (_name, root) => {
    const Host = defineComponent({
      setup() {
        useNsAboveLabelName({
          root: ref(root) as never,
          active: () => true,
          label: () => 'Province',
        })
        return () => h('div', 'ok')
      },
    })
    const html = await renderToString(createSSRApp(Host))
    expect(html).toContain('ok')
  })
})
