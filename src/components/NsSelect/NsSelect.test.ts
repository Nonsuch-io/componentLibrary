import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import NsSelect from './NsSelect.vue'

// Stub QSelect to render slots without dropdown portal
const QSelectStub = defineComponent({
  name: 'QSelect',
  inheritAttrs: false,
  setup(_, { slots }) {
    return () =>
      h('div', { class: 'q-select-stub ns-select q-field--outlined' }, [
        slots.prepend?.(),
        slots.append?.(),
        slots.default?.(),
      ])
  },
})

describe('NsSelect', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsSelect)
    expect(wrapper.find('.ns-select').exists()).toBe(true)
  })

  it('renders a label', () => {
    const wrapper = mount(NsSelect, { props: { label: 'Country' } })
    expect(wrapper.text()).toContain('Country')
  })

  it('defaults to outlined style', () => {
    const wrapper = mount(NsSelect)
    expect(wrapper.find('.q-field--outlined').exists()).toBe(true)
  })

  it('supports dense mode', () => {
    const wrapper = mount(NsSelect, { props: { dense: true } })
    expect(wrapper.find('.q-field--dense').exists()).toBe(true)
  })

  it('applies ns-select class', () => {
    const wrapper = mount(NsSelect)
    expect(wrapper.classes()).toContain('ns-select')
  })

  it('renders with options provided', () => {
    const wrapper = mount(NsSelect, {
      props: { options: ['A', 'B', 'C'] },
    })
    expect(wrapper.find('.ns-select').exists()).toBe(true)
  })

  it('forwards slots through dynamic slot template', () => {
    const wrapper = mount(NsSelect, {
      slots: {
        prepend: '<span class="test-prepend">Icon</span>',
      },
      global: { stubs: { QSelect: QSelectStub } },
    })
    expect(wrapper.find('.test-prepend').text()).toBe('Icon')
  })

  it('forwards multiple slots through dynamic slot template', () => {
    const wrapper = mount(NsSelect, {
      slots: {
        prepend: '<span class="slot-pre">Pre</span>',
        append: '<span class="slot-app">App</span>',
      },
      global: { stubs: { QSelect: QSelectStub } },
    })
    expect(wrapper.find('.slot-pre').exists()).toBe(true)
    expect(wrapper.find('.slot-app').exists()).toBe(true)
  })

  it('emits update:modelValue when QSelect emits', () => {
    const wrapper = mount(NsSelect, {
      props: { options: ['A', 'B', 'C'] },
    })
    const qSelect = wrapper.findComponent({ name: 'QSelect' })
    qSelect.vm.$emit('update:model-value', 'B')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['B'])
  })

  it('declares a disable prop rather than relying on attrs fallthrough', () => {
    const wrapper = mount(NsSelect, { props: { disable: true } })
    // If `disable` were not a declared prop, it would land in $attrs
    // instead of $props, and wrapper.props('disable') would be undefined.
    expect(wrapper.props('disable')).toBe(true)
  })
})

// QSelect's popup teleports to document.body, so these mount attached and
// read the live DOM.
describe('NsSelect — the listbox is named (componentLibrary-2e7)', () => {
  const open = async (props: Record<string, unknown>) => {
    const w = mount(NsSelect, { props, attachTo: document.body })
    const combobox = w.find('[role="combobox"]')
    // QSelect opens on the combobox's click (a control click toggles the menu).
    await w.find('.q-field__control').trigger('click')
    await nextTick()
    await nextTick()
    const listbox = document.querySelector('[role="listbox"]')
    return { w, combobox, listbox }
  }

  it('names the popup listbox as the combobox is named, from `label`', async () => {
    const { w, combobox, listbox } = await open({ label: 'Shop Category', options: ['A', 'B'] })
    expect(listbox, 'the popup is open').not.toBeNull()
    expect(combobox.attributes('aria-controls')).toBe(listbox!.id)
    expect(listbox!.getAttribute('aria-label')).toBe('Shop Category')
    w.unmount()
  })

  it('falls back to a consumer aria-label, and leaves an already-named listbox alone', async () => {
    const { w, listbox } = await open({ 'aria-label': 'Choose one', options: ['A'] })
    expect(listbox!.getAttribute('aria-label')).toBe('Choose one')
    w.unmount()
  })

  it('does nothing when there is no name to give', async () => {
    const { w, listbox } = await open({ options: ['A'] })
    expect(listbox).not.toBeNull()
    expect(listbox!.hasAttribute('aria-label')).toBe(false)
    w.unmount()
  })
})
