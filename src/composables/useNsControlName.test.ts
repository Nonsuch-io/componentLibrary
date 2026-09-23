import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref, type Ref } from 'vue'
import { useNsControlName } from './useNsControlName'

/**
 * THE COMPOSABLE DIRECTLY, ON A SYNTHETIC HOST — and that is the point, not a
 * shortcut. Review (sonnet) mutation-tested the component-level tests by
 * deleting this composable's entire aria-label write block: all 30 NsSelect
 * tests stayed GREEN, because CI resolves quasar 2.32.2, where Quasar routes
 * the attribute to the right element without any help from us. The fix exists
 * for 2.18.6, where it does not — so a component test on the newest Quasar
 * structurally cannot fail for the regression it names, and the only evidence
 * the fix worked was an isolated install no reviewer or CI could reproduce
 * (componentLibrary-5ng, -u5v).
 *
 * Driving the composable against a plain element removes Quasar from the
 * question entirely: these fail on every version if the write, the precedence
 * or the cleanup regress.
 */
/** Hosts are appended to the body; take them back so the file is self-contained. */
const hosts: HTMLElement[] = []
afterEach(() => {
  hosts.splice(0).forEach((h) => h.remove())
  vi.restoreAllMocks()
})

const mountWith = (opts: {
  ariaLabel?: Ref<string | undefined>
  labelAbove?: Ref<boolean>
  label?: string
  /** A name already on the control, as Quasar puts one there from `label`. */
  seedAriaLabel?: string
}) => {
  const host = document.createElement('div')
  const control = document.createElement('input')
  control.setAttribute('role', 'combobox')
  host.appendChild(control)
  if (opts.seedAriaLabel) control.setAttribute('aria-label', opts.seedAriaLabel)
  document.body.appendChild(host)
  hosts.push(host)

  const labelAbove = opts.labelAbove ?? ref(false)
  const ariaLabel = opts.ariaLabel ?? ref<string | undefined>(undefined)
  const root = ref<{ $el: Element }>({ $el: host })
  const Host = defineComponent({
    setup() {
      useNsControlName({
        root,
        labelAbove: () => labelAbove.value,
        label: () => opts.label,
        ariaLabel: () => ariaLabel.value,
      })
      // Re-render when either input changes, so onUpdated fires.
      return () => h('div', `${labelAbove.value}:${ariaLabel.value ?? ''}`)
    },
  })
  const wrapper = mount(Host)
  return { wrapper, control, host, labelAbove, ariaLabel, root }
}

describe('useNsControlName (componentLibrary-5ng)', () => {
  it('writes a consumer aria-label onto the control element', () => {
    const { control } = mountWith({ ariaLabel: ref('Choose one') })
    expect(control.getAttribute('aria-label')).toBe('Choose one')
  })

  it('TAKES IT BACK when the consumer clears it', async () => {
    // The blocker: `:aria-label="err ? 'Fix this' : undefined"`. Without the
    // cleanup, active() goes false and nothing revisits the element, so a
    // screen reader announces "Fix this" forever.
    const { wrapper, control, ariaLabel } = mountWith({
      ariaLabel: ref<string | undefined>('Fix this'),
    })
    expect(control.getAttribute('aria-label')).toBe('Fix this')
    ariaLabel.value = undefined
    await wrapper.vm.$nextTick()
    expect(control.getAttribute('aria-label')).toBeNull()
  })

  it('follows a changed value rather than stacking', async () => {
    const { wrapper, control, ariaLabel } = mountWith({
      ariaLabel: ref<string | undefined>('First'),
    })
    ariaLabel.value = 'Second'
    await wrapper.vm.$nextTick()
    expect(control.getAttribute('aria-label')).toBe('Second')
  })

  it('PUTS BACK the name the control would have had, rather than deleting', async () => {
    // Quasar writes `aria-label = label` onto the focus-target input itself on
    // 2.18.6, so the value the consumer's label displaced is QUASAR'S. Review
    // (fable) measured a plain removal leaving the combobox unnamed and the
    // listbox unnamed with it — the axe failure componentLibrary-2e7 fixed.
    const ariaLabel = ref<string | undefined>('Pick one')
    const { wrapper, control } = mountWith({
      label: 'Shop Category',
      seedAriaLabel: 'Shop Category',
      ariaLabel,
    })
    expect(control.getAttribute('aria-label')).toBe('Pick one')
    ariaLabel.value = undefined
    await wrapper.vm.$nextTick()
    expect(control.getAttribute('aria-label')).toBe('Shop Category')
  })

  it('restores from `label` even when the attribute was already cleared for us', async () => {
    // On 2.32 Vue's patch removes the consumer's attribute before this runs,
    // so a guard that only accepted our own value would skip and leave the
    // newer version unnamed where the older one is named.
    const ariaLabel = ref<string | undefined>('Pick one')
    const { wrapper, control } = mountWith({ label: 'Shop Category', ariaLabel })
    ariaLabel.value = undefined
    control.removeAttribute('aria-label')
    await wrapper.vm.$nextTick()
    expect(control.getAttribute('aria-label')).toBe('Shop Category')
  })

  it('OBSERVES AGAIN when the consumer re-adds their label', async () => {
    // The asymmetry review (sonnet) measured: the disconnect side was patched
    // in onUpdated while the connect side lived in a watch that cannot see a
    // plain `let`, so the observer went away on the first idle edge and never
    // came back. Toggle twice; both edges must be honoured.
    const observe = vi.spyOn(MutationObserver.prototype, 'observe')
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    const ariaLabel = ref<string | undefined>('X')
    const { wrapper, control } = mountWith({ ariaLabel })
    expect(observe).toHaveBeenCalledTimes(1)

    ariaLabel.value = undefined
    await wrapper.vm.$nextTick()
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(observe).toHaveBeenCalledTimes(1)

    ariaLabel.value = 'Y'
    await wrapper.vm.$nextTick()
    expect(observe, 'observer never came back').toHaveBeenCalledTimes(2)
    expect(control.getAttribute('aria-label')).toBe('Y')

    ariaLabel.value = undefined
    await wrapper.vm.$nextTick()
    expect(disconnect).toHaveBeenCalledTimes(2)
  })

  it('does not re-observe the same host on every render', async () => {
    const observe = vi.spyOn(MutationObserver.prototype, 'observe')
    const ariaLabel = ref<string | undefined>('X')
    const { wrapper } = mountWith({ ariaLabel })
    ariaLabel.value = 'Y'
    await wrapper.vm.$nextTick()
    ariaLabel.value = 'Z'
    await wrapper.vm.$nextTick()
    expect(observe).toHaveBeenCalledTimes(1)
  })

  it('moves the observer to a NEW host, disconnecting the old one', async () => {
    // The branch the watch exists for: NsSelect's v-if/v-else swaps the field
    // when labelPlacement flips at runtime, with `active()` true throughout.
    // Review (fable) showed TWO mutants of it passing the whole suite green —
    // `if (observer) return` (the old host keeps the observer, the new one is
    // never watched) and dropping the disconnect (the old observer leaks).
    // Both are invisible to the idle-edge tests above, which is why my own
    // "equivalent mutant" reading was wrong.
    const observe = vi.spyOn(MutationObserver.prototype, 'observe')
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    const { wrapper, root } = mountWith({ labelAbove: ref(true), label: 'L' })
    expect(observe).toHaveBeenCalledTimes(1)

    const next = document.createElement('div')
    const nextControl = document.createElement('input')
    nextControl.setAttribute('role', 'combobox')
    next.appendChild(nextControl)
    document.body.appendChild(next)
    hosts.push(next)

    root.value = { $el: next }
    await wrapper.vm.$nextTick()
    expect(disconnect, 'old observer not disconnected').toHaveBeenCalledTimes(1)
    expect(observe).toHaveBeenCalledTimes(2)
    expect(observe.mock.calls[1][0], 'the new host is not the one observed').toBe(next)

    // And no churn on a further render of the same host.
    await wrapper.vm.$nextTick()
    expect(observe).toHaveBeenCalledTimes(2)
  })

  it('disconnects the observer once there is nothing left to do', async () => {
    // active() keeps a pending cleanup reachable, but it reads a plain `let`,
    // so the watch cannot see it go idle — review measured the observer
    // outliving the cleanup, against the "inside placement creates no
    // observer" invariant.
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    const ariaLabel = ref<string | undefined>('X')
    const { wrapper } = mountWith({ ariaLabel })
    expect(disconnect).not.toHaveBeenCalled()
    ariaLabel.value = undefined
    await wrapper.vm.$nextTick()
    expect(disconnect).toHaveBeenCalled()
  })

  it('does not remove an aria-label it did not write', async () => {
    const { wrapper, control, ariaLabel } = mountWith({
      ariaLabel: ref<string | undefined>('Ours'),
    })
    control.setAttribute('aria-label', 'Someone else')
    ariaLabel.value = undefined
    await wrapper.vm.$nextTick()
    expect(control.getAttribute('aria-label')).toBe('Someone else')
  })

  it('writes nothing at all when there is nothing to say', () => {
    const { control } = mountWith({})
    expect(control.getAttribute('aria-label')).toBeNull()
    expect(control.getAttribute('aria-labelledby')).toBeNull()
  })

  it('a consumer aria-label beats the above-label association', async () => {
    const { control } = mountWith({
      labelAbove: ref(true),
      label: 'Province',
      ariaLabel: ref<string | undefined>('Pick a province'),
    })
    expect(control.getAttribute('aria-label')).toBe('Pick a province')
    expect(control.getAttribute('aria-labelledby')).toBeNull()
  })

  it('restores the above-label association when the consumer clears theirs', async () => {
    const ariaLabel = ref<string | undefined>('Pick a province')
    const { wrapper, control } = mountWith({ labelAbove: ref(true), label: 'Province', ariaLabel })
    ariaLabel.value = undefined
    await wrapper.vm.$nextTick()
    expect(control.getAttribute('aria-label')).toBeNull()
    expect(control.getAttribute('aria-labelledby')).toBeTruthy()
  })
})
