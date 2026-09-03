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

describe('single root (componentLibrary-eag)', () => {
  // THE REGRESSION THIS BEAD ALMOST SHIPPED. An earlier version rendered the
  // label as a SIBLING, making the root a fragment. Vue only stamps a parent's
  // scope id onto a child's root when that element IS the subTree, so every
  // consumer `<style scoped>` rule targeting a class on <ns-input> silently
  // stopped matching — including in the DEFAULT placement, which no consumer
  // opted into. Review measured 8 such sites in butiq plus NsAppShell here.
  //
  // Attrs were fine throughout; scope ids are not attrs, which is exactly why
  // checking class/style was not enough.
  it.each<[string, 'inside' | 'above']>([
    ['inside', 'inside'],
    ['above', 'above'],
  ])(
    'puts the consumer class and the scope id on the SAME element when %s',
    (_l, labelPlacement) => {
      // That co-location IS the property scoped styles depend on. Asserting the
      // scope id alone would pass with the class on a different element, which
      // matches nothing — so this checks both on one node.
      const Parent = defineComponent({
        __scopeId: 'data-v-parent',
        setup: () => () => h(NsInput, { label: 'Email', labelPlacement, class: 'consumer-class' }),
      })
      const wrapper = mount(Parent)
      const styled = wrapper.find('.consumer-class')

      expect(styled.exists(), 'the consumer class is nowhere').toBe(true)
      expect(
        styled.attributes('data-v-parent'),
        'consumer class and scope id are on different elements — scoped styles match nothing',
      ).toBeDefined()
    },
  )
})

describe('for handling (componentLibrary-eag)', () => {
  it('passes a consumer for THROUGH in the default placement', () => {
    // `:for` sits after v-bind, so binding undefined DELETES the consumer's
    // value rather than leaving it alone — the same trap this file documents
    // for `type`. `for` was the only pre-existing way to attach an external
    // label, so deleting it would break exactly the people this feature is for.
    const wrapper = mount(NsInput, { props: { label: 'E' }, attrs: { for: 'my-id' } })
    expect(wrapper.find('input').attributes('id')).toBe('my-id')
  })

  it.each<[string, string]>([
    ['empty string', ''],
    ['whitespace', '  '],
  ])('falls back to a generated id when for is %s', (_l, value) => {
    // ?? treated '' as a supplied id and Quasar passed it through, giving
    // for=""/id="" and NO accessible name. Axe does not flag it.
    const wrapper = mount(NsInput, {
      props: { label: 'E', labelPlacement: 'above' },
      attrs: { for: value },
    })
    const forAttr = wrapper.find('label.ns-input__label').attributes('for')
    expect(forAttr, 'for is empty — the label names nothing').toBeTruthy()
    expect(wrapper.find('input').attributes('id')).toBe(forAttr)
  })

  it('renders no label element when there is no label text', () => {
    // An empty associated <label> plus its margin is a phantom element; the
    // aria-label-only pattern must stay clean.
    const wrapper = mount(NsInput, { props: { labelPlacement: 'above' } })
    expect(wrapper.find('label.ns-input__label').exists()).toBe(false)
  })
})
