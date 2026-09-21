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

  it('names it from a consumer aria-label when there is no label', async () => {
    const { w, listbox } = await open({ 'aria-label': 'Choose one', options: ['A'] })
    expect(listbox!.getAttribute('aria-label')).toBe('Choose one')
    w.unmount()
  })

  // Quasar lets a consumer's aria-label beat `label` on the combobox; the
  // listbox takes the COMBOBOX's name, so they cannot disagree (review
  // measured a first draft naming them differently).
  it("takes the combobox's own name, so label and aria-label never disagree", async () => {
    const { w, combobox, listbox } = await open({
      label: 'Shop Category',
      'aria-label': 'Pick a category',
      options: ['A'],
    })
    expect(combobox.attributes('aria-label')).toBe('Pick a category')
    expect(listbox!.getAttribute('aria-label')).toBe('Pick a category')
    w.unmount()
  })

  // On a phone or tablet QSelect opens a DIALOG, not a menu, and moves the
  // combobox into it: nothing under the root has the role any more. Review
  // measured a first draft returning silently there — the original gap
  // intact for every mobile user, invisible to every desktop-mode test.
  it("names it in dialog mode too (Quasar's default on mobile)", async () => {
    const w = mount(NsSelect, {
      props: { label: 'Shop Category', options: ['A', 'B'], behavior: 'dialog' },
      attachTo: document.body,
    })
    await w.find('.q-field__control').trigger('click')
    await nextTick()
    await nextTick()
    const dialog = document.querySelector('.q-select__dialog')
    expect(dialog, 'the dialog opened').not.toBeNull()
    expect(w.element.querySelector('[role="combobox"]'), 'nothing under the root').toBeNull()
    const combobox = dialog!.querySelector('[role="combobox"]')!
    const listbox = document.querySelector('[role="listbox"]')!
    expect(combobox.getAttribute('aria-controls')).toBe(listbox.id)
    expect(listbox.getAttribute('aria-label')).toBe('Shop Category')
    // …and the dialog, which Quasar also leaves unnamed (axe aria-dialog-name).
    expect(combobox.closest('[role="dialog"]')!.getAttribute('aria-label')).toBe('Shop Category')
    w.unmount()
  })

  it('does nothing when there is no name to give', async () => {
    const { w, listbox } = await open({ options: ['A'] })
    expect(listbox).not.toBeNull()
    expect(listbox!.hasAttribute('aria-label')).toBe(false)
    w.unmount()
  })
})

// componentLibrary-grj.3: NsInput's labelPlacement contract, mirrored.
describe('NsSelect labelPlacement="above"', () => {
  const mountAbove = (props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) =>
    mount(NsSelect, {
      props: {
        label: 'Province / Territory',
        options: ['AB', 'BC'],
        labelPlacement: 'above',
        ...props,
      },
      attrs,
      attachTo: document.body,
    })

  it('renders a real <label> above the box, associated to the combobox by for/id and aria-labelledby', () => {
    const w = mountAbove()
    const label = w.find('label.ns-select__label')
    const combobox = w.find('[role="combobox"]')
    expect(label.text()).toBe('Province / Territory')
    expect(label.attributes('for')).toBeTruthy()
    expect(combobox.attributes('id')).toBe(label.attributes('for'))
    // QField's root is a <label> too; aria-labelledby names the combobox by
    // OUR label alone, whatever the two-label computation does.
    expect(combobox.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(label.attributes('id')).toBeTruthy()
    // Quasar is given no label: no floating label inside the box.
    expect(w.find('.q-field__label').exists()).toBe(false)
    w.unmount()
  })

  // componentLibrary-0og: butiq measured combobox "Language English (Canada)"
  // and combobox "Shop Category We'll use this to help you…" on quasar 2.18.6 —
  // QField's root <label> wraps the hint and the selected value, and 2.18.6
  // routes a bound aria-labelledby to the .q-field__native DIV, not the input.
  // The attributes are written onto the combobox element itself, so this test
  // passes on 2.18.6 and 2.32.2 alike (run on both, 2026-09-21).
  it('names the combobox by the label ALONE and describes it by the hint, on the element itself', async () => {
    const w = mountAbove(
      { options: [{ label: 'English (Canada)', value: 'en' }], modelValue: 'en' },
      { hint: 'Pick the language your customers see.' },
    )
    await nextTick()
    const label = w.find('label.ns-select__label')
    const combobox = w.find('[role="combobox"]')
    expect(combobox.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(combobox.attributes('aria-label')).toBeUndefined()
    const hint = w.find('.q-field__messages')
    expect(hint.text()).toBe('Pick the language your customers see.')
    expect(hint.attributes('id')).toBeTruthy()
    expect(combobox.attributes('aria-describedby')).toBe(hint.attributes('id'))
    // No other element claims the label id (2.18.6 put it on the native div).
    expect(w.findAll('[aria-labelledby]')).toHaveLength(1)
    w.unmount()
  })

  it('has no aria-describedby without a hint', () => {
    const w = mountAbove()
    expect(w.find('[role="combobox"]').attributes('aria-describedby')).toBeUndefined()
    w.unmount()
  })

  it('is a single root (no fragment): the wrapper carries the consumer class, the field keeps ns-select', () => {
    const w = mountAbove({}, { class: 'mine', 'data-x': '1' })
    expect(w.element.tagName).toBe('DIV')
    expect(w.classes()).toContain('ns-select__field')
    expect(w.classes()).toContain('mine')
    expect(w.find('.ns-select').exists()).toBe(true)
    expect(w.find('.ns-select').classes()).not.toContain('mine')
    // Other attrs still reach the field (Quasar puts them on the combobox input).
    expect(w.find('.ns-select [data-x="1"]').exists()).toBe(true)
    expect(w.attributes('data-x')).toBeUndefined()
    w.unmount()
  })

  it('honours a consumer-supplied `for` as the id, and never an empty one', () => {
    const w = mountAbove({}, { for: 'province' })
    expect(w.find('label').attributes('for')).toBe('province')
    expect(w.find('[role="combobox"]').attributes('id')).toBe('province')
    w.unmount()
    const empty = mountAbove({}, { for: '' })
    expect(empty.find('label').attributes('for')).toBeTruthy()
    expect(empty.find('[role="combobox"]').attributes('id')).toBe(
      empty.find('label').attributes('for'),
    )
    empty.unmount()
  })

  it('still names the popup listbox — from the label text, since QSelect has no aria-label here', async () => {
    const w = mountAbove()
    await w.find('.q-field__control').trigger('click')
    await nextTick()
    await nextTick()
    const listbox = document.querySelector('[role="listbox"]')
    expect(listbox, 'the popup is open').not.toBeNull()
    expect(w.find('[role="combobox"]').attributes('aria-label')).toBeUndefined()
    expect(listbox!.getAttribute('aria-label')).toBe('Province / Territory')
    w.unmount()
  })

  it('a consumer aria-label still wins for the listbox name', async () => {
    const w = mountAbove({}, { 'aria-label': 'Pick a province' })
    await w.find('.q-field__control').trigger('click')
    await nextTick()
    await nextTick()
    expect(document.querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe(
      'Pick a province',
    )
    w.unmount()
  })

  // NsInput's own test for the same trap: `:for` after v-bind bound to
  // undefined would DELETE a consumer's for. Verified for the default here too.
  it('passes a consumer `for` through in the default placement', () => {
    const w = mount(NsSelect, { props: { label: 'Role', options: ['A'] }, attrs: { for: 'role' } })
    expect(w.find('[role="combobox"]').attributes('id')).toBe('role')
    w.unmount()
  })

  it('inside (the default) is unchanged: the floating label, no wrapper', () => {
    const w = mount(NsSelect, { props: { label: 'Role', options: ['A'] } })
    expect(w.element.classList.contains('ns-select')).toBe(true)
    expect(w.find('.ns-select__field').exists()).toBe(false)
    expect(w.find('.q-field__label').exists()).toBe(true)
    w.unmount()
  })
})
