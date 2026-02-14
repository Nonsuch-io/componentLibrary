import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsDialog from './NsDialog.vue'

describe('NsDialog', () => {
  it('mounts without errors', () => {
    const wrapper = mount(NsDialog, {
      props: { modelValue: false },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('accepts title prop', () => {
    const wrapper = mount(NsDialog, {
      props: { modelValue: false, title: 'Confirm' },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('accepts persistent prop', () => {
    const wrapper = mount(NsDialog, {
      props: { modelValue: false, persistent: true },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('accepts noBackdropDismiss prop', () => {
    const wrapper = mount(NsDialog, {
      props: { modelValue: false, noBackdropDismiss: true },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('emits update:modelValue', async () => {
    const wrapper = mount(NsDialog, {
      props: { modelValue: false },
    })
    await wrapper.vm.$emit('update:modelValue', true)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
  })

  it('accepts default and actions slots', () => {
    const wrapper = mount(NsDialog, {
      props: { modelValue: false },
      slots: {
        default: 'Body content',
        actions: '<button>OK</button>',
      },
    })
    expect(wrapper.vm).toBeTruthy()
  })
})
