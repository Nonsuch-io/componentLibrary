import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import NsRadioButtons from './NsRadioButtons.vue'

const baseOptions = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'C', value: 'c' },
]

/**
 * Keydown is handled per-radio (each already carries tabindex, satisfying
 * vuejs-accessibility/interactive-supports-focus), not delegated from the
 * radiogroup container — so tests dispatch keydown on the roving tab stop,
 * the element that would actually hold DOM focus in real keyboard use.
 */
function rovingRadio(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('[role="radio"][tabindex="0"]')
}

describe('NsRadioButtons', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with default props', () => {
    const wrapper = mount(NsRadioButtons, { props: { options: baseOptions, label: 'Size' } })
    expect(wrapper.find('.ns-radio-buttons').exists()).toBe(true)
  })

  it('renders one radio per option', () => {
    const wrapper = mount(NsRadioButtons, { props: { options: baseOptions, label: 'Size' } })
    expect(wrapper.findAll('[role="radio"]')).toHaveLength(3)
  })

  it('forwards extra attributes to the root element', () => {
    const wrapper = mount(NsRadioButtons, {
      props: { options: baseOptions, label: 'Size' },
      attrs: { 'data-testid': 'radio-group-root' },
    })
    expect(wrapper.find('[data-testid="radio-group-root"]').exists()).toBe(true)
  })

  it('applies the horizontal orientation class when requested', () => {
    const wrapper = mount(NsRadioButtons, {
      props: { options: baseOptions, label: 'Size', orientation: 'horizontal' },
    })
    expect(wrapper.find('.ns-radio-buttons__group--horizontal').exists()).toBe(true)
  })

  it('does not apply the horizontal class for the default vertical orientation', () => {
    const wrapper = mount(NsRadioButtons, { props: { options: baseOptions, label: 'Size' } })
    expect(wrapper.find('.ns-radio-buttons__group--horizontal').exists()).toBe(false)
  })

  it('disables every option when the whole group is disabled', () => {
    const wrapper = mount(NsRadioButtons, {
      props: { options: baseOptions, label: 'Size', disable: true },
    })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios).toHaveLength(3)
    for (const radio of radios) {
      expect(radio.attributes('aria-disabled')).toBe('true')
    }
  })

  it('emits update:modelValue when an option is clicked', async () => {
    const wrapper = mount(NsRadioButtons, {
      props: { options: baseOptions, label: 'Size', modelValue: 'a' },
    })
    await wrapper.findAll('[role="radio"]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
  })

  describe('accessibility', () => {
    it('renders role="radiogroup"', () => {
      const wrapper = mount(NsRadioButtons, { props: { options: baseOptions, label: 'Size' } })
      expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true)
    })

    it('points aria-labelledby at the rendered visible label', () => {
      const wrapper = mount(NsRadioButtons, { props: { options: baseOptions, label: 'Size' } })
      const group = wrapper.find('[role="radiogroup"]')
      const labelledby = group.attributes('aria-labelledby')
      expect(labelledby).toBeTruthy()
      const labelEl = wrapper.find(`#${labelledby}`)
      expect(labelEl.exists()).toBe(true)
      expect(labelEl.text().trim()).toBe('Size')
    })

    it('has a non-empty accessible name when a visible label is given', () => {
      const wrapper = mount(NsRadioButtons, { props: { options: baseOptions, label: 'Size' } })
      const group = wrapper.find('[role="radiogroup"]')
      const labelledby = group.attributes('aria-labelledby')
      const labelEl = wrapper.find(`#${labelledby}`)
      expect(labelEl.text().trim().length).toBeGreaterThan(0)
    })

    it('falls back to aria-label when there is no visible label', () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, ariaLabel: 'Choose a size' },
      })
      const group = wrapper.find('[role="radiogroup"]')
      expect(group.attributes('aria-label')).toBe('Choose a size')
      expect(group.attributes('aria-labelledby')).toBeUndefined()
    })

    it('warns in dev when the group has neither a visible label nor an aria-label', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsRadioButtons, { props: { options: baseOptions } })
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[NsRadioButtons]'))
    })

    it('does not warn when a visible label is given', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsRadioButtons, { props: { options: baseOptions, label: 'Size' } })
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('has exactly one element with tabindex=0 when an option is selected', () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: 'b' },
      })
      const rovingTab = wrapper.findAll('[role="radio"][tabindex="0"]')
      expect(rovingTab).toHaveLength(1)
      expect(rovingTab[0].attributes('aria-label')).toBe('B')
    })

    it('has exactly one element with tabindex=0, defaulting to the first option, when nothing is selected', () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: null },
      })
      const rovingTab = wrapper.findAll('[role="radio"][tabindex="0"]')
      expect(rovingTab).toHaveLength(1)
      expect(rovingTab[0].attributes('aria-label')).toBe('A')
    })

    it('gives the native radio inputs a single shared name', () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: 'a', name: 'size-choice' },
      })
      const inputs = wrapper.findAll('input[type="radio"]')
      expect(inputs.length).toBeGreaterThan(0)
      const names = new Set(inputs.map((input) => input.attributes('name')))
      expect(names.size).toBe(1)
      expect([...names][0]).toBe('size-choice')
    })

    it('auto-generates a shared name, distinct per instance, when none is supplied', () => {
      // Two groups in the SAME app instance (the real-world case: two
      // NsRadioButtons on one page). Mounting each with a separate `mount()`
      // call would give each its own Vue app, and useId() resets per-app —
      // that would pass even if generated names collided within one app.
      const TwoGroups = defineComponent({
        render: () =>
          h('div', [
            h(NsRadioButtons, { options: baseOptions, label: 'First', modelValue: 'a' }),
            h(NsRadioButtons, { options: baseOptions, label: 'Second', modelValue: 'a' }),
          ]),
      })
      const wrapper = mount(TwoGroups)
      const inputs = wrapper.findAll('input[type="radio"]')
      const names = inputs.map((input) => input.attributes('name'))
      const uniqueNames = new Set(names)

      // 3 options each, 2 groups -> 2 distinct names, 3 inputs apiece
      expect(uniqueNames.size).toBe(2)
      for (const name of uniqueNames) expect(name).toBeTruthy()
    })

    it('ArrowDown moves selection to the next option and wraps at the end', async () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: 'a' },
      })
      await rovingRadio(wrapper).trigger('keydown', { key: 'ArrowDown' })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
      await wrapper.setProps({ modelValue: 'b' })

      await rovingRadio(wrapper).trigger('keydown', { key: 'ArrowDown' })
      expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['c'])
      await wrapper.setProps({ modelValue: 'c' })

      // wraps from the last option back to the first
      await rovingRadio(wrapper).trigger('keydown', { key: 'ArrowDown' })
      expect(wrapper.emitted('update:modelValue')?.[2]).toEqual(['a'])
    })

    it('ArrowRight behaves the same as ArrowDown', async () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: 'a' },
      })
      await rovingRadio(wrapper).trigger('keydown', { key: 'ArrowRight' })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
    })

    it('ArrowUp wraps backwards from the first option', async () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: 'a' },
      })
      await rovingRadio(wrapper).trigger('keydown', { key: 'ArrowUp' })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['c'])
    })

    it('ArrowLeft behaves the same as ArrowUp', async () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: 'a' },
      })
      await rovingRadio(wrapper).trigger('keydown', { key: 'ArrowLeft' })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['c'])
    })

    it('skips disabled options when moving with arrow keys', async () => {
      const options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b', disable: true },
        { label: 'C', value: 'c' },
      ]
      const wrapper = mount(NsRadioButtons, {
        props: { options, label: 'Size', modelValue: 'a' },
      })
      await rovingRadio(wrapper).trigger('keydown', { key: 'ArrowDown' })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['c'])
    })

    it('skips disabled options when moving backwards too', async () => {
      const options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b', disable: true },
        { label: 'C', value: 'c' },
      ]
      const wrapper = mount(NsRadioButtons, {
        props: { options, label: 'Size', modelValue: 'c' },
      })
      await rovingRadio(wrapper).trigger('keydown', { key: 'ArrowUp' })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['a'])
    })

    it('Home jumps to the first enabled option', async () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: 'c' },
      })
      await rovingRadio(wrapper).trigger('keydown', { key: 'Home' })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['a'])
    })

    it('End jumps to the last enabled option', async () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: 'a' },
      })
      await rovingRadio(wrapper).trigger('keydown', { key: 'End' })
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['c'])
    })

    it('ignores keys that are not part of the radiogroup pattern', async () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: 'a' },
      })
      await rovingRadio(wrapper).trigger('keydown', { key: 'Tab' })
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('does not move when the whole group is disabled', async () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: baseOptions, label: 'Size', modelValue: 'a', disable: true },
      })
      // Every option is tabindex=-1 when the whole group is disabled — there is
      // no roving tab stop to find focus on, matching a real disabled control.
      await wrapper.findAll('[role="radio"]')[0].trigger('keydown', { key: 'ArrowDown' })
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('moves DOM focus to the newly active option after an arrow key', async () => {
      const wrapper = mount(NsRadioButtons, {
        attachTo: document.body,
        props: { options: baseOptions, label: 'Size', modelValue: 'a' },
      })
      const radios = () => wrapper.findAll('[role="radio"]')
      ;(radios()[0].element as HTMLElement).focus()

      await rovingRadio(wrapper).trigger('keydown', { key: 'ArrowDown' })
      await wrapper.setProps({ modelValue: 'b' })
      await nextTick()

      expect(document.activeElement).toBe(radios()[1].element)
      wrapper.unmount()
    })
  })
})
