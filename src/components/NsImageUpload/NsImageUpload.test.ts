import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import NsImageUpload from './NsImageUpload.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleEnCA } from '../../locale/en-CA'

const png = (name = 'photo.png') => new File(['x'], name, { type: 'image/png' })
const pdf = () => new File(['x'], 'doc.pdf', { type: 'application/pdf' })

beforeEach(() => {
  // jsdom has no createObjectURL. Stub it so previews render and revocation
  // is observable, which is the memory-leak half of the contract.
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:preview'),
    revokeObjectURL: vi.fn(),
  })
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const mountEmpty = (extra: Record<string, unknown> = {}) =>
  mount(NsImageUpload, { props: { modelValue: null, label: 'Shop photo', ...extra } })

describe('NsImageUpload', () => {
  describe('it is a real file input', () => {
    it('renders an input[type=file]', () => {
      expect(mountEmpty().find('input[type="file"]').exists()).toBe(true)
    })

    it('names the input from the label prop in BOTH states', () => {
      // The label ELEMENT disappears once a file is selected; the input does
      // not, because Tab-Enter-pick is how a user replaces an image. axe failed
      // the selected state until the name moved to the input itself.
      expect(mountEmpty().find('input').attributes('aria-label')).toBe('Shop photo')
      const filled = mount(NsImageUpload, { props: { modelValue: png(), label: 'Shop photo' } })
      expect(filled.find('label').exists()).toBe(false)
      expect(filled.find('input').attributes('aria-label')).toBe('Shop photo')
    })

    it('names the input from the visible label via for/id', () => {
      const wrapper = mountEmpty()
      const input = wrapper.find('input[type="file"]')
      const label = wrapper.find('label')
      expect(input.attributes('id')).toBeTruthy()
      expect(label.attributes('for')).toBe(input.attributes('id'))
      expect(label.text()).toContain('Shop photo')
    })

    it('forwards accept to the input', () => {
      expect(mountEmpty({ accept: '.png,.jpg' }).find('input').attributes('accept')).toBe(
        '.png,.jpg',
      )
    })

    it('defaults accept to image/*', () => {
      expect(mountEmpty().find('input').attributes('accept')).toBe('image/*')
    })
  })

  describe('selecting', () => {
    it('emits the picked file', async () => {
      const wrapper = mountEmpty()
      const input = wrapper.find('input').element as HTMLInputElement
      const file = png()
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      await wrapper.find('input').trigger('change')
      expect(wrapper.emitted('update:modelValue')).toEqual([[file]])
    })

    // NO jsdom TEST FOR "the same file can be picked twice". One was written
    // and it could not fail: jsdom never populates a file input's value, so
    // asserting it is '' after the reset passed with the reset deleted —
    // measured. The real assertion lives in NsImageUpload.stories.ts
    // (SameFileTwice), where userEvent.upload populates the input in Chromium.
    // Likewise "the input is not display:none": the clip pattern is in a
    // scoped stylesheet jsdom does not apply, so KeyboardReachesTheInput proves
    // that Tab actually lands on the control.

    it('emits a dropped file through the same path', async () => {
      const wrapper = mountEmpty()
      const file = png()
      await wrapper.trigger('drop', { dataTransfer: { files: [file] } })
      expect(wrapper.emitted('update:modelValue')).toEqual([[file]])
    })
  })

  describe('type acceptance is checked, not just declared', () => {
    // `accept` filters the picker dialog and does NOTHING for a drop.
    it('rejects a dropped file that does not match accept', async () => {
      const wrapper = mountEmpty()
      const file = pdf()
      await wrapper.trigger('drop', { dataTransfer: { files: [file] } })
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(wrapper.emitted('rejected')).toEqual([[file]])
    })

    it('shows the rejection warning tied to the input', async () => {
      const wrapper = mountEmpty()
      await wrapper.trigger('drop', { dataTransfer: { files: [pdf()] } })
      const warning = wrapper.find('.ns-image-upload__warning')
      expect(warning.text()).toBe('That file type is not accepted')
      expect(wrapper.find('input').attributes('aria-describedby')).toBe(warning.attributes('id'))
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    })

    it('clears the rejection warning when an accepted file follows', async () => {
      const wrapper = mountEmpty()
      await wrapper.trigger('drop', { dataTransfer: { files: [pdf()] } })
      expect(wrapper.find('.ns-image-upload__warning').exists()).toBe(true)
      await wrapper.trigger('drop', { dataTransfer: { files: [png()] } })
      expect(wrapper.find('.ns-image-upload__warning').exists()).toBe(false)
    })

    it.each([
      ['image/*', 'image/png', true],
      ['image/*', 'application/pdf', false],
      ['image/png', 'image/png', true],
      ['image/png', 'image/jpeg', false],
      ['.png,.jpg', 'x.PNG', true],
      ['.png,.jpg', 'x.gif', false],
      ['', 'anything/at-all', true],
    ])('accept=%j against %j -> %s', async (accept, typeOrName, ok) => {
      const wrapper = mountEmpty({ accept })
      const file = typeOrName.includes('/')
        ? new File(['x'], 'f', { type: typeOrName })
        : new File(['x'], typeOrName, { type: '' })
      await wrapper.trigger('drop', { dataTransfer: { files: [file] } })
      expect(wrapper.emitted('update:modelValue') !== undefined).toBe(ok)
    })
  })

  describe('with a file selected', () => {
    it('shows a preview, the filename, and a remove button instead of the drop zone', () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' } })
      expect(wrapper.find('label').exists()).toBe(false)
      expect(wrapper.find('img').attributes('src')).toBe('blob:preview')
      expect(wrapper.find('.ns-image-upload__filename').text()).toBe('photo.png')
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('names the remove button with the filename', () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' } })
      expect(wrapper.find('button').attributes('aria-label')).toBe('Remove image: photo.png')
    })

    it('emits null on remove and returns focus to the input', async () => {
      const wrapper = mount(NsImageUpload, {
        props: { modelValue: png(), label: 'L' },
        attachTo: document.body,
      })
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('update:modelValue')).toEqual([[null]])
      expect(document.activeElement).toBe(wrapper.find('input').element)
      wrapper.unmount()
    })

    it('marks the preview image decorative — the filename is the text', () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' } })
      expect(wrapper.find('img').attributes('alt')).toBe('')
    })
  })

  describe('preview URLs are revoked', () => {
    // createObjectURL holds the file in memory until revoked; a form that
    // swaps images leaks one per swap otherwise.
    it('revokes the old URL when the file changes', async () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png('a'), label: 'L' } })
      await wrapper.setProps({ modelValue: png('b') })
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
    })

    it('revokes on clear', async () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' } })
      await wrapper.setProps({ modelValue: null })
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
    })

    it('revokes on unmount', () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' } })
      wrapper.unmount()
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
    })
  })

  describe('announces changes to screen readers', () => {
    // Replacing the drop zone with a preview is a DOM change a screen reader
    // would not narrate on its own.
    it('announces the selected filename', async () => {
      const wrapper = mountEmpty()
      await wrapper.setProps({ modelValue: png('receipt.png') })
      const live = wrapper.find('[aria-live="polite"]')
      expect(live.text()).toBe('Selected image: receipt.png')
    })

    it('announces removal', async () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' } })
      await wrapper.setProps({ modelValue: null })
      expect(wrapper.find('[aria-live="polite"]').text()).toBe('Image removed')
    })

    it('announces a rejection', async () => {
      const wrapper = mountEmpty()
      await wrapper.trigger('drop', { dataTransfer: { files: [pdf()] } })
      expect(wrapper.find('[aria-live="polite"]').text()).toBe('That file type is not accepted')
    })
  })

  describe('the warning prop', () => {
    it('renders and ties to the input', () => {
      const wrapper = mountEmpty({ warning: 'Max 5 MB' })
      const w = wrapper.find('.ns-image-upload__warning')
      expect(w.text()).toBe('Max 5 MB')
      expect(wrapper.find('input').attributes('aria-describedby')).toBe(w.attributes('id'))
    })

    it.each(['', '   '])('treats %j as no warning', (warning) => {
      const wrapper = mountEmpty({ warning })
      expect(wrapper.find('.ns-image-upload__warning').exists()).toBe(false)
      expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
    })

    it('does not render a warning slot that renders nothing', () => {
      const wrapper = mount(
        defineComponent({
          components: { NsImageUpload },
          template: `<NsImageUpload :model-value="null" label="L"><template #warning><span v-if="false">n</span></template></NsImageUpload>`,
        }),
      )
      expect(wrapper.find('.ns-image-upload__warning').exists()).toBe(false)
    })
  })

  describe('i18n', () => {
    it('takes every visible string from the injected locale', async () => {
      const fr = {
        ...nsLocaleEnCA,
        media: {
          ...nsLocaleEnCA.media,
          uploadPrompt: 'PROMPT',
          uploadBrowse: 'BROWSE',
          uploadRemove: 'REMOVE',
          uploadSelected: 'SELECTED',
          uploadRejected: 'REJECTED',
        },
      }
      const global = { provide: { [NsLocaleKey as symbol]: fr } }
      const empty = mount(NsImageUpload, { props: { modelValue: null, label: 'L' }, global })
      expect(empty.text()).toContain('PROMPT')
      expect(empty.text()).toContain('BROWSE')
      await empty.trigger('drop', { dataTransfer: { files: [pdf()] } })
      expect(empty.find('.ns-image-upload__warning').text()).toBe('REJECTED')

      const filled = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' }, global })
      expect(filled.find('button').text()).toBe('REMOVE')
      expect(filled.find('[aria-live="polite"]').text()).toContain('SELECTED')
    })
  })
})
