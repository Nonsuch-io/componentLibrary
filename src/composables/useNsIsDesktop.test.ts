import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { NS_DESKTOP_QUERY, useNsIsDesktop } from './useNsIsDesktop'

/**
 * happy-dom has no real media queries, so `window.matchMedia` is replaced
 * with a fake list whose `matches` and listeners the test controls. That is
 * the point: the composable's contract is what it does with a MediaQueryList
 * — read it on mount, follow its changes, and let go of it on unmount — not
 * what the viewport is.
 */
type Listener = (e: { matches: boolean }) => void

function fakeMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>()
  const list = {
    matches,
    media: NS_DESKTOP_QUERY,
    addEventListener: vi.fn((_: 'change', fn: Listener) => listeners.add(fn)),
    removeEventListener: vi.fn((_: 'change', fn: Listener) => listeners.delete(fn)),
    fire(next: boolean) {
      list.matches = next
      for (const fn of listeners) fn({ matches: next })
    },
    listeners,
  }
  const matchMedia = vi.fn((query: string) => {
    expect(query).toBe(NS_DESKTOP_QUERY)
    return list
  })
  vi.stubGlobal('matchMedia', matchMedia)
  return list
}

const Probe = defineComponent({
  setup() {
    const isDesktop = useNsIsDesktop()
    return () => h('div', { 'data-desktop': String(isDesktop.value) })
  },
})

afterEach(() => vi.unstubAllGlobals())

describe('useNsIsDesktop', () => {
  it('reads the query on mount and follows its changes', async () => {
    const list = fakeMatchMedia(false)
    const w = mount(Probe)
    // The first render says desktop (the pre-mount default); onMounted then
    // reads the query and the next tick renders what it found.
    expect(w.attributes('data-desktop')).toBe('true')
    await w.vm.$nextTick()
    expect(w.attributes('data-desktop')).toBe('false')
    expect(list.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

    list.fire(true)
    await w.vm.$nextTick()
    expect(w.attributes('data-desktop')).toBe('true')
    w.unmount()
  })

  it('removes its listener on unmount — the SAME function it added', () => {
    // Review deleted the removal and every test stayed green: a long-lived
    // SPA that mounts and unmounts consumers would keep every closure alive.
    const list = fakeMatchMedia(true)
    const w = mount(Probe)
    const added = list.addEventListener.mock.calls[0][1]
    expect(list.listeners.size).toBe(1)
    w.unmount()
    expect(list.removeEventListener).toHaveBeenCalledWith('change', added)
    expect(list.listeners.size).toBe(0)
  })

  it('is desktop when there is no matchMedia at all (a server, an old runtime)', () => {
    vi.stubGlobal('matchMedia', undefined)
    const w = mount(Probe)
    expect(w.attributes('data-desktop')).toBe('true')
    w.unmount()
  })
})
