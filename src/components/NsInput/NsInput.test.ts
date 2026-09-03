import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import NsInput from './NsInput.vue'

describe('NsInput', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsInput)
    expect(wrapper.find('.ns-input').exists()).toBe(true)
  })

  it('renders a label', () => {
    const wrapper = mount(NsInput, { props: { label: 'Email' } })
    expect(wrapper.text()).toContain('Email')
  })

  it('defaults to outlined style', () => {
    const wrapper = mount(NsInput)
    expect(wrapper.find('.q-field--outlined').exists()).toBe(true)
  })

  it('supports dense mode', () => {
    const wrapper = mount(NsInput, { props: { dense: true } })
    expect(wrapper.find('.q-field--dense').exists()).toBe(true)
  })

  it('applies ns-input class to the field', () => {
    // Asserted on the FIELD, not the wrapper root. componentLibrary-eag made
    // the template a fragment (an optional external label sits beside the
    // QInput), so wrapper.classes() is empty by construction. The class still
    // lands where it always did, which is what consumers style against.
    const wrapper = mount(NsInput)
    expect(wrapper.find('.q-input').classes()).toContain('ns-input')
  })

  it('passes through attrs to q-input', () => {
    const wrapper = mount(NsInput, {
      attrs: { placeholder: 'Type here...' },
    })
    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('Type here...')
  })

  it('binds modelValue to q-input', () => {
    const wrapper = mount(NsInput, {
      props: { modelValue: 'hello' },
    })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(NsInput, {
      props: { modelValue: '' },
    })
    const input = wrapper.find('input')
    await input.setValue('new value')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('forwards slots to q-input', () => {
    const wrapper = mount(NsInput, {
      slots: { prepend: '<span class="test-prepend">$</span>' },
    })
    expect(wrapper.find('.test-prepend').exists()).toBe(true)
  })

  it('declares a disable prop rather than relying on attrs fallthrough', () => {
    const wrapper = mount(NsInput, { props: { disable: true } })
    // If `disable` were not a declared prop, it would land in $attrs
    // instead of $props, and wrapper.props('disable') would be undefined.
    expect(wrapper.props('disable')).toBe(true)
  })
})

describe('external label (componentLibrary-eag)', () => {
  it('defaults to the floating label, so no existing call site moves', () => {
    // butiq has 369 NsInput call sites. This prop must not restyle one of them.
    const wrapper = mount(NsInput, { props: { label: 'Email' } })
    expect(wrapper.find('label.ns-input__label').exists()).toBe(false)
    expect(wrapper.find('.q-field__label').exists()).toBe(true)
  })

  it('renders the label OUTSIDE the control when above', () => {
    const wrapper = mount(NsInput, { props: { label: 'Email', labelPlacement: 'above' } })
    const label = wrapper.find('label.ns-input__label')
    const control = wrapper.find('.q-field__control')

    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Email')
    // The whole point: Quasar's own label is absolute INSIDE the control, which
    // is why stack-label could not produce this layout.
    expect(control.element.contains(label.element), 'label is still inside the box').toBe(false)
    expect(wrapper.find('.q-field__label').exists(), 'Quasar still renders its own').toBe(false)
  })

  it('associates the label with the input, or the field has no accessible name', () => {
    // for/id, not proximity. Without this the external label is decorative and
    // the field announces as an unnamed textbox — worse than what it replaced.
    const wrapper = mount(NsInput, { props: { label: 'Email', labelPlacement: 'above' } })
    const forAttr = wrapper.find('label.ns-input__label').attributes('for')
    const input = wrapper.find('input')

    expect(forAttr, 'label has no for').toBeTruthy()
    expect(input.attributes('id'), 'for/id do not match — association is broken').toBe(forAttr)
  })

  it('lets a consumer supply their own id', () => {
    const wrapper = mount(NsInput, {
      props: { label: 'Email', labelPlacement: 'above' },
      attrs: { for: 'my-own-id' },
    })
    expect(wrapper.find('label.ns-input__label').attributes('for')).toBe('my-own-id')
    expect(wrapper.find('input').attributes('id')).toBe('my-own-id')
  })

  it('gives two fields in the SAME app different ids', () => {
    // A shared id would associate both labels with the first input — a
    // duplicate-id bug that renders correctly and misnames one field.
    //
    // Both mounted in ONE app on purpose. Vue's useId counts per APP instance,
    // and test-utils creates a fresh app per mount() — so two separate mounts
    // legitimately produce the same id and would fail this for a reason no
    // real consumer can hit. A form is one app; that is the case to test.
    const Host = defineComponent({
      setup: () => () => [
        h(NsInput, { label: 'A', labelPlacement: 'above' }),
        h(NsInput, { label: 'B', labelPlacement: 'above' }),
      ],
    })
    const wrapper = mount(Host)
    const ids = wrapper.findAll('input').map((i) => i.attributes('id'))

    expect(ids.length).toBe(2)
    expect(ids[0]).toBeTruthy()
    expect(ids[0], 'two fields in one form share an id').not.toBe(ids[1])
  })
})
