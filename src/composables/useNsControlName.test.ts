import { describe, it, expect } from 'vitest'
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
const mountWith = (opts: {
  ariaLabel?: Ref<string | undefined>
  labelAbove?: Ref<boolean>
  label?: string
}) => {
  const host = document.createElement('div')
  const control = document.createElement('input')
  control.setAttribute('role', 'combobox')
  host.appendChild(control)
  document.body.appendChild(host)

  const labelAbove = opts.labelAbove ?? ref(false)
  const ariaLabel = opts.ariaLabel ?? ref<string | undefined>(undefined)
  const Host = defineComponent({
    setup() {
      useNsControlName({
        root: ref({ $el: host }),
        labelAbove: () => labelAbove.value,
        label: () => opts.label,
        ariaLabel: () => ariaLabel.value,
      })
      // Re-render when either input changes, so onUpdated fires.
      return () => h('div', `${labelAbove.value}:${ariaLabel.value ?? ''}`)
    },
  })
  const wrapper = mount(Host)
  return { wrapper, control, host, labelAbove, ariaLabel }
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
