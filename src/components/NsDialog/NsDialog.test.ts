import { describe, it, expect, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick, defineComponent, h } from 'vue'
import NsDialog from './NsDialog.vue'

// Stubs for template branch coverage
const QDialogStub = defineComponent({
  name: 'QDialog',
  inheritAttrs: true,
  props: { modelValue: Boolean },
  emits: ['update:model-value'],
  setup(props, { slots, attrs }) {
    return () =>
      props.modelValue
        ? h('div', { class: 'q-dialog', ...attrs }, slots.default?.())
        : h('div', { class: 'q-dialog q-dialog--hidden', ...attrs })
  },
})
const QCardStub = defineComponent({
  name: 'QCard',
  inheritAttrs: true,
  setup(_, { slots, attrs }) {
    return () => h('div', { class: 'ns-dialog__card', ...attrs }, slots.default?.())
  },
})
const QCardSectionStub = defineComponent({
  name: 'QCardSection',
  inheritAttrs: true,
  setup(_, { slots, attrs }) {
    return () => h('div', { ...attrs }, slots.default?.())
  },
})
const QCardActionsStub = defineComponent({
  name: 'QCardActions',
  inheritAttrs: true,
  setup(_, { slots, attrs }) {
    return () => h('div', { class: 'ns-dialog__actions', ...attrs }, slots.default?.())
  },
})

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

  describe('with stubs (template branch coverage)', () => {
    const stubs = {
      QDialog: QDialogStub,
      QCard: QCardStub,
      QCardSection: QCardSectionStub,
      QCardActions: QCardActionsStub,
    }

    it('renders header with title through template', () => {
      wrapper = mount(NsDialog, {
        props: { modelValue: true, title: 'Stub Title' },
        slots: { default: 'Body' },
        global: { stubs },
      })
      expect(wrapper.find('.ns-dialog__header').exists()).toBe(true)
      expect(wrapper.text()).toContain('Stub Title')
    })

    it('renders without header when no title or header slot', () => {
      wrapper = mount(NsDialog, {
        props: { modelValue: true },
        slots: { default: 'Body only' },
        global: { stubs },
      })
      expect(wrapper.find('.ns-dialog__header').exists()).toBe(false)
    })

    it('renders actions slot through template', () => {
      wrapper = mount(NsDialog, {
        props: { modelValue: true },
        slots: { default: 'Body', actions: '<button class="stub-action">OK</button>' },
        global: { stubs },
      })
      expect(wrapper.find('.stub-action').exists()).toBe(true)
    })

    it('omits actions when no actions slot', () => {
      wrapper = mount(NsDialog, {
        props: { modelValue: true },
        slots: { default: 'Body' },
        global: { stubs },
      })
      expect(wrapper.find('.ns-dialog__actions').exists()).toBe(false)
    })

    it('renders custom header slot through template', () => {
      wrapper = mount(NsDialog, {
        props: { modelValue: true },
        slots: { default: 'Body', header: '<h3 class="stub-hdr">Custom</h3>' },
        global: { stubs },
      })
      expect(wrapper.find('.stub-hdr').exists()).toBe(true)
    })
  })

  describe('size', () => {
    // Same stubs the template-coverage block uses; the module-level stub
    // components are shared, only this object literal is local to each block.
    const stubs = {
      QDialog: QDialogStub,
      QCard: QCardStub,
      QCardSection: QCardSectionStub,
      QCardActions: QCardActionsStub,
    }

    // These assert the RESOLVED WIDTH, not just that a modifier class exists.
    // A class-only assertion passes whether or not the CSS behind it does
    // anything — and this whole prop exists because five consumers were each
    // setting their own max-width. Parsing the component's own style block ties
    // the class to the number the design system names.
    const sfc = readFileSync(
      resolve(process.cwd(), 'src/components/NsDialog/NsDialog.vue'),
      'utf-8',
    )
    const styleBlock = sfc.slice(sfc.indexOf('<style'))

    const tokens = readFileSync(resolve(process.cwd(), 'src/tokens/tokens.css'), 'utf-8')

    it.each([
      ['small', '400px'],
      ['default', '650px'],
      ['large', '820px'],
    ])('size="%s" resolves to a max-width of %s', (size, expected) => {
      wrapper = mount(NsDialog, {
        props: { modelValue: true, size: size as 'small' | 'default' | 'large' },
        slots: { default: 'Body' },
        global: { stubs },
      })
      expect(wrapper.find(`.ns-dialog__card--${size}`).exists()).toBe(true)

      // the class must set max-width from a token...
      const rule = new RegExp(
        `&--${size}\\s*\\n\\s*max-width:\\s*var\\((--ns-dialog-width-[a-z]+)\\)`,
      )
      const match = rule.exec(styleBlock)
      expect(match, `no max-width token under &--${size}`).not.toBeNull()

      // ...and that token must resolve to the value Figma specifies.
      const tokenValue = new RegExp(`${match![1]}:\\s*([^;]+);`).exec(tokens)
      expect(tokenValue?.[1].trim(), `${match![1]} in tokens.css`).toBe(expected)
    })

    it('applies NO width constraint when size is omitted', () => {
      // THE BLOCKER FROM REVIEW, pinned. `size` first defaulted to 'default'
      // (650px), which looked like an opt-in prop and was a BREAKING change:
      // consumers nest their own sized card inside this one, so a max-width on
      // the parent caps the child by CONTAINMENT — nothing they write can
      // override it. Review measured butiq's 780px dialogs silently rendering
      // at 618px with no change on their side. Omitting `size` must leave the
      // card exactly as it was before this prop existed.
      wrapper = mount(NsDialog, {
        props: { modelValue: true },
        slots: { default: 'Body' },
        global: { stubs },
      })
      const card = wrapper.find('.ns-dialog__card')
      expect(card.exists()).toBe(true)
      const classes = card.classes().filter((c) => c.startsWith('ns-dialog__card--'))
      expect(classes, `unexpected size modifier(s): ${classes.join(', ')}`).toEqual([])
    })

    it('sizes with width:100% and a max-width, never a fixed width', () => {
      // NAMED FOR WHAT IT ASSERTS. This was called "shrinks rather than
      // overflowing a narrow viewport", which promised behaviour it cannot
      // reach: happy-dom has no layout engine, so nothing here can observe an
      // overflow. It checks the CSS SHAPE that makes shrinking possible.
      // Actual rendered width is asserted in a real browser by the
      // LargeMeasuresEightTwenty story — and review showed source-text checks
      // alone stay green against commented-out CSS.
      expect(styleBlock).toMatch(/width:\s*100%/)
      expect(styleBlock).not.toMatch(/^\s+width:\s*\d+px/m)
    })
  })
})
