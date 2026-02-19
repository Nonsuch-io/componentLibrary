import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import NsDialog from './NsDialog.vue'

describe('NsDialog', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('mounts without errors', () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: false },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('accepts title prop', () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: false, title: 'Confirm' },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('accepts persistent prop', () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: false, persistent: true },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('accepts noBackdropDismiss prop', () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: false, noBackdropDismiss: true },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('emits update:modelValue when QDialog emits', async () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: true },
      attachTo: document.body,
    })
    await nextTick()
    // Find inner QDialog and trigger its update event
    const qDialog = wrapper.findComponent({ name: 'QDialog' })
    qDialog.vm.$emit('update:model-value', false)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('accepts default and actions slots', () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: false },
      slots: {
        default: 'Body content',
        actions: '<button>OK</button>',
      },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('renders card with title when modelValue is true', async () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: true, title: 'Delete item?' },
      slots: { default: 'Are you sure?' },
      attachTo: document.body,
    })
    await nextTick()
    // QDialog teleports - query from document
    const card = document.querySelector('.ns-dialog__card')
    const header = document.querySelector('.ns-dialog__header')
    const body = document.querySelector('.ns-dialog__body')
    expect(card).not.toBeNull()
    expect(header?.textContent).toContain('Delete item?')
    expect(body?.textContent).toContain('Are you sure?')
  })

  it('renders actions slot when open', async () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: true },
      slots: {
        default: 'Body',
        actions: '<button class="test-btn">Confirm</button>',
      },
      attachTo: document.body,
    })
    await nextTick()
    expect(document.querySelector('.test-btn')).not.toBeNull()
    expect(document.querySelector('.ns-dialog__actions')).not.toBeNull()
  })

  it('renders custom header slot when open', async () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: true },
      slots: {
        header: '<div class="custom-hdr">Custom Title</div>',
        default: 'Content',
      },
      attachTo: document.body,
    })
    await nextTick()
    expect(document.querySelector('.custom-hdr')?.textContent).toBe('Custom Title')
  })

  it('does not render header when no title or header slot', async () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: true },
      slots: { default: 'Only body' },
      attachTo: document.body,
    })
    await nextTick()
    expect(document.querySelector('.ns-dialog__header')).toBeNull()
  })

  it('does not render actions when no actions slot', async () => {
    wrapper = mount(NsDialog, {
      props: { modelValue: true },
      slots: { default: 'Only body' },
      attachTo: document.body,
    })
    await nextTick()
    expect(document.querySelector('.ns-dialog__actions')).toBeNull()
  })

  describe('accessibility', () => {
    it('renders role="dialog" and aria-modal on the card', async () => {
      wrapper = mount(NsDialog, {
        props: { modelValue: true, title: 'A11y' },
        slots: { default: 'Content' },
        attachTo: document.body,
      })
      await nextTick()
      const card = document.querySelector('.ns-dialog__card')
      expect(card?.getAttribute('role')).toBe('dialog')
      expect(card?.getAttribute('aria-modal')).toBe('true')
    })

    it('links title via aria-labelledby', async () => {
      wrapper = mount(NsDialog, {
        props: { modelValue: true, title: 'Confirm Delete' },
        slots: { default: 'Are you sure?' },
        attachTo: document.body,
      })
      await nextTick()
      const header = document.querySelector('.ns-dialog__header')
      const headerId = header?.getAttribute('id')
      expect(headerId).toBeTruthy()
      // q-dialog should have aria-labelledby matching the header id
      const dialog = document.querySelector('.q-dialog')
      expect(dialog?.getAttribute('aria-labelledby')).toBe(headerId)
    })

    it('links body via aria-describedby', async () => {
      wrapper = mount(NsDialog, {
        props: { modelValue: true, title: 'Title' },
        slots: { default: 'Description here' },
        attachTo: document.body,
      })
      await nextTick()
      const body = document.querySelector('.ns-dialog__body')
      const bodyId = body?.getAttribute('id')
      expect(bodyId).toBeTruthy()
      const dialog = document.querySelector('.q-dialog')
      expect(dialog?.getAttribute('aria-describedby')).toBe(bodyId)
    })

    it('omits aria-labelledby when no title or header slot', async () => {
      wrapper = mount(NsDialog, {
        props: { modelValue: true },
        slots: { default: 'Body only' },
        attachTo: document.body,
      })
      await nextTick()
      const dialog = document.querySelector('.q-dialog')
      expect(dialog?.hasAttribute('aria-labelledby')).toBe(false)
    })
  })
})
