import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsFollowUpQuestion from './NsFollowUpQuestion.vue'
import NsCheckbox from '../NsCheckbox/NsCheckbox.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'

const options = [
  { id: 'mens', label: 'Men’s' },
  { id: 'womens', label: 'Women’s' },
  { id: 'kids', label: 'Kids’' },
]

const mountWith = (props: Record<string, unknown> = {}) =>
  mount(NsFollowUpQuestion, {
    props: { question: 'Do you group your items by gender?', options, ...props },
    attachTo: document.body,
  })

describe('NsFollowUpQuestion — contract', () => {
  it('checks the options named in modelValue and emits the new list on toggle, never mutating', async () => {
    const value = ['mens']
    const w = mountWith({ modelValue: value })
    const boxes = w.findAllComponents(NsCheckbox)
    expect(boxes.map((b) => b.props('modelValue'))).toEqual([true, false, false])

    await boxes[1].vm.$emit('update:modelValue', true)
    expect(w.emitted('update:modelValue')![0][0]).toEqual(['mens', 'womens'])
    await boxes[0].vm.$emit('update:modelValue', false)
    expect(w.emitted('update:modelValue')![1][0]).toEqual([])
    expect(value).toEqual(['mens']) // the prop is not touched
    w.unmount()
  })

  it('defaults to nothing checked', () => {
    const w = mountWith()
    expect(w.findAllComponents(NsCheckbox).every((b) => b.props('modelValue') === false)).toBe(true)
    w.unmount()
  })

  it('disables every checkbox and marks the group, accepting the `disabled` spelling', () => {
    const w = mountWith({ disable: true })
    expect(w.attributes('aria-disabled')).toBe('true')
    for (const b of w.findAllComponents(NsCheckbox)) expect(b.props('disable')).toBe(true)
    w.unmount()
    const w2 = mount(NsFollowUpQuestion, {
      props: { question: 'Q', options },
      attrs: { disabled: true },
    })
    expect(w2.attributes('aria-disabled')).toBe('true')
    expect(w2.attributes('disabled')).toBeUndefined()
    w2.unmount()
  })
})

describe('NsFollowUpQuestion — what a screen reader is told', () => {
  it('is a group named by the question, with the badge from the locale', () => {
    const w = mountWith()
    expect(w.attributes('role')).toBe('group')
    const question = w.find('.ns-follow-up-question__question')
    expect(question.text()).toBe('Do you group your items by gender?')
    expect(w.attributes('aria-labelledby')).toBe(question.attributes('id'))
    expect(w.find('.ns-follow-up-question__tag').text()).toBe('Additional Options')
    w.unmount()
  })

  it('takes a custom tag, and none for a blank one', () => {
    expect(mountWith({ tag: 'Optional' }).find('.ns-follow-up-question__tag').text()).toBe(
      'Optional',
    )
    expect(mountWith({ tag: '  ' }).find('.ns-follow-up-question__tag').exists()).toBe(false)
  })

  it('can be focused by the consumer after a reveal, so the question is read first', () => {
    const w = mountWith()
    expect(w.attributes('tabindex')).toBe('-1')
    ;(w.vm as unknown as { focus: () => void }).focus()
    expect(document.activeElement).toBe(w.element)
    w.unmount()
  })

  it('speaks the injected locale', () => {
    const fr = mount(NsFollowUpQuestion, {
      props: { question: 'Q', options },
      global: { provide: { [NsLocaleKey as symbol]: nsLocaleFrCA } },
    })
    expect(fr.find('.ns-follow-up-question__tag').text()).toBe('Options supplémentaires')
    fr.unmount()
  })
})
