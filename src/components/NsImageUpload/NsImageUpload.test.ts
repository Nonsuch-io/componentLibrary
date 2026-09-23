import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { __resetNsDisabledWarnings } from '../../composables/useNsDisabled'
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
  __resetNsDisabledWarnings()
})

/**
 * announce() is a serialised chain: each entry clears, ticks, sets, ticks. Two
 * queued announcements (mount + change) therefore need four ticks to land.
 * Eight is generous and deterministic — these are microtasks, not timers.
 */
const settled = async () => {
  for (let i = 0; i < 8; i++) await nextTick()
}

const mountEmpty = (extra: Record<string, unknown> = {}) =>
  mount(NsImageUpload, { props: { modelValue: null, label: 'Shop photo', ...extra } })

describe('NsImageUpload', () => {
  describe('it is a real file input', () => {
    it('renders an input[type=file]', () => {
      expect(mountEmpty().find('input[type="file"]').exists()).toBe(true)
    })

    it('names the input from the label prop in BOTH states', () => {
      // The name lives on the INPUT, not on the label element: axe failed the
      // selected state until it moved there, and Tab-Enter-pick is how a user
      // replaces an image.
      expect(mountEmpty().find('input').attributes('aria-label')).toBe('Shop photo')
      const filled = mount(NsImageUpload, { props: { modelValue: png(), label: 'Shop photo' } })
      expect(filled.find('input').attributes('aria-label')).toBe('Shop photo')
    })

    it('keeps the tile a <label for> the input in BOTH states (the replace path)', () => {
      // The card structure (componentLibrary-af2) renders the tile in both
      // states, so a click REPLACES the image rather than the target vanishing.
      for (const wrapper of [
        mountEmpty(),
        mount(NsImageUpload, { props: { modelValue: png(), label: 'Shop photo' } }),
      ]) {
        const input = wrapper.find('input[type="file"]')
        const tile = wrapper.find('label.ns-image-upload__tile')
        expect(tile.exists()).toBe(true)
        expect(input.attributes('id')).toBeTruthy()
        expect(tile.attributes('for')).toBe(input.attributes('id'))
      }
    })

    it('renders the label prop as the visible heading', () => {
      const wrapper = mountEmpty()
      expect(wrapper.find('.ns-image-upload__label').text()).toContain('Shop photo')
      // The tile is an icon target, not a second copy of the words (WCAG 2.5.3
      // is satisfied by one string serving both roles).
      expect(wrapper.find('label.ns-image-upload__tile').text()).toBe('')
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

  // The card as drawn (componentLibrary-af2), measured from the frame's own
  // NsImageUpload instance on 2026-09-22.
  // Review (fable) measured a DISABLED control clearing its own v-model on a
  // click: the old markup blocked the mouse path with `pointer-events: none`
  // on the preview, the card dropped that element, and the keyboard path was
  // never covered by CSS at all.
  describe('disable stops removal, not just picking', () => {
    it('does not emit on a Remove click, and the button says it is disabled', async () => {
      const wrapper = mount(NsImageUpload, {
        props: { modelValue: png(), label: 'L', disable: true },
      })
      // The `disabled` attribute IS the defence — QBtn blocks the click on it
      // and on its own handler, which is why no guard inside clear() can be
      // reached or tested. Assert the binding, not a branch that cannot run.
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
      await button.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('still emits null on Remove when enabled', async () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' } })
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('update:modelValue')).toEqual([[null]])
    })
  })

  describe('the card: heading row, badge, tips', () => {
    it('puts the badge slot in the heading row beside the label, and nothing when unused', () => {
      const withBadge = mount(NsImageUpload, {
        props: { modelValue: null, label: 'Business Logo (Optional)' },
        slots: { badge: '<span class="mine">Logo Not Added</span>' },
      })
      const header = withBadge.find('.ns-image-upload__header')
      expect(header.find('.mine').exists()).toBe(true)
      expect(header.find('.ns-image-upload__label').text()).toBe('Business Logo (Optional)')
      // Order matters: the badge trails the title in the frame.
      const kids = Array.from(header.element.children)
      expect(kids[0].className).toContain('ns-image-upload__label')
      expect(kids[kids.length - 1].className).toContain('ns-image-upload__badge')
      // No empty box when the slot is unused — the row would keep its gap.
      expect(mountEmpty().find('.ns-image-upload__badge').exists()).toBe(false)
    })

    it('renders a comment-only badge slot as no badge (content, not presence)', () => {
      const wrapper = mount(NsImageUpload, {
        props: { modelValue: null, label: 'L' },
        slots: { badge: '<!-- v-if was false -->' },
      })
      expect(wrapper.find('.ns-image-upload__badge').exists()).toBe(false)
    })

    it('renders each tip as its own paragraph, and no tips block without them', () => {
      const wrapper = mountEmpty({
        tips: ['File types allowed: PNG, JPEG', 'For best results, at least 512 x 512.'],
      })
      const tips = wrapper.findAll('.ns-image-upload__tip')
      expect(tips).toHaveLength(2)
      expect(tips[0].element.tagName).toBe('P')
      expect(tips[1].text()).toBe('For best results, at least 512 x 512.')
      expect(mountEmpty().find('.ns-image-upload__tips').exists()).toBe(false)
      expect(mountEmpty({ tips: [] }).find('.ns-image-upload__tips').exists()).toBe(false)
    })

    it('describes the input by the tips, and by the warning when there is one', async () => {
      const wrapper = mountEmpty({ tips: ['File types allowed: PNG, JPEG'] })
      const input = wrapper.find('input')
      const tipsId = wrapper.find('.ns-image-upload__tips').attributes('id')
      expect(tipsId).toBeTruthy()
      expect(input.attributes('aria-describedby')).toBe(tipsId)

      // A rejected drop adds the warning; the tips stay described.
      await wrapper
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [pdf()] } })
      const tokens = wrapper.find('input').attributes('aria-describedby')?.split(' ')
      expect(tokens).toContain(tipsId)
      expect(tokens).toContain(wrapper.find('.ns-image-upload__warning').attributes('id'))
      expect(tokens).toHaveLength(2)
    })

    it('has no aria-describedby with neither tips nor warning', () => {
      expect(mountEmpty().find('input').attributes('aria-describedby')).toBeUndefined()
    })

    it('renders duplicate tip strings without a duplicate-key warning, on REORDER', async () => {
      // The transition matters. Review (sonnet) proved the first version of
      // this test could never fail: mount-then-APPEND stays in Vue's prefix
      // matching, which consumes both duplicates positionally and never builds
      // the keyToNewIndexMap the warning comes from. A REORDER forces the
      // keyed diff branch, and there `:key="tip"` warns and mis-patches.
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mountEmpty({ tips: ['x', 'same', 'same', 'y'] })
      await wrapper.setProps({ tips: ['y', 'same', 'same', 'x'] })
      await nextTick()
      // ORDER FIRST, then the warning: with the assertions the other way
      // round a bad key fails on the warning and the order is never checked,
      // so "mis-patches" would be a claim no test makes (review, fable).
      expect(wrapper.findAll('.ns-image-upload__tip').map((t) => t.text())).toEqual([
        'y',
        'same',
        'same',
        'x',
      ])
      const duplicates = warn.mock.calls.filter((c) => String(c[0]).includes('Duplicate keys'))
      expect(duplicates, `Vue warned: ${JSON.stringify(duplicates[0] ?? '')}`).toHaveLength(0)
      warn.mockRestore()
    })

    it('falls back to the tips prop when the slot renders only whitespace', async () => {
      // `renders()` treats whitespace as nothing; Vue's own <slot><fallback/>>
      // logic treats it as something. With both predicates in play the block
      // rendered EMPTY and skipped the prop. One predicate, so the prop wins.
      // Reachable only from a render-function slot — the SFC compiler drops
      // whitespace-only slot templates, which is why this hid.
      const wrapper = mount(NsImageUpload, {
        props: { modelValue: null, label: 'L', tips: ['from the prop'] },
        slots: { tips: () => [' '] },
      })
      await nextTick()
      const tips = wrapper.findAll('.ns-image-upload__tip')
      expect(tips).toHaveLength(1)
      expect(tips[0].text()).toBe('from the prop')
    })

    it('renders no tips block at all when the slot is whitespace and there is no prop', async () => {
      const wrapper = mount(NsImageUpload, {
        props: { modelValue: null, label: 'L' },
        slots: { tips: () => [' '] },
      })
      await nextTick()
      expect(wrapper.find('.ns-image-upload__tips').exists()).toBe(false)
      expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
    })

    it('lets the tips slot replace the prop', () => {
      const wrapper = mount(NsImageUpload, {
        props: { modelValue: null, label: 'L', tips: ['from the prop'] },
        slots: { tips: '<p class="mine">from the slot</p>' },
      })
      expect(wrapper.find('.mine').exists()).toBe(true)
      expect(wrapper.text()).not.toContain('from the prop')
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
      await wrapper
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [file] } })
      expect(wrapper.emitted('update:modelValue')).toEqual([[file]])
    })
  })

  describe('drag state', () => {
    it('sets the dragging class on dragenter and clears it on a real leave', async () => {
      const wrapper = mountEmpty()
      const surface = wrapper.find('.ns-image-upload__surface')
      await surface.trigger('dragenter')
      expect(wrapper.classes()).toContain('ns-image-upload--dragging')
      await surface.trigger('dragleave', { relatedTarget: document.body })
      expect(wrapper.classes()).not.toContain('ns-image-upload--dragging')
    })

    it('does NOT clear on a dragleave whose relatedTarget is a child', async () => {
      // Moving the pointer between children of the surface fires dragleave on
      // the surface with the child as relatedTarget — the classic flicker. The
      // state must survive it, or the border blinks on every element boundary.
      const wrapper = mountEmpty()
      const surface = wrapper.find('.ns-image-upload__surface')
      const child = wrapper.find('.ns-image-upload__label').element
      await surface.trigger('dragenter')
      await surface.trigger('dragleave', { relatedTarget: child })
      expect(wrapper.classes()).toContain('ns-image-upload--dragging')
    })
  })

  describe('type acceptance is checked, not just declared', () => {
    // `accept` filters the picker dialog and does NOTHING for a drop.
    it('rejects a dropped file that does not match accept', async () => {
      const wrapper = mountEmpty()
      const file = pdf()
      await wrapper
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [file] } })
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(wrapper.emitted('rejected')).toEqual([[file]])
    })

    it('shows the rejection warning tied to the input', async () => {
      const wrapper = mountEmpty()
      await wrapper
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [pdf()] } })
      const warning = wrapper.find('.ns-image-upload__warning')
      expect(warning.text()).toBe('That file type is not accepted')
      expect(wrapper.find('input').attributes('aria-describedby')).toBe(warning.attributes('id'))
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    })

    it('clears the rejection warning when an accepted file follows', async () => {
      const wrapper = mountEmpty()
      await wrapper
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [pdf()] } })
      expect(wrapper.find('.ns-image-upload__warning').exists()).toBe(true)
      await wrapper
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [png()] } })
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
      // Fable's cases: an empty-type file passes only an extension rule, and
      // a malformed rule matches nothing (and warns — see dev warnings).
      ['image/*', 'photo.png', false],
      ['image/*,.png', 'photo.png', true],
      ['image/', 'image/png', false],
      ['IMAGE/PNG', 'image/png', true],
    ])('accept=%j against %j -> %s', async (accept, typeOrName, ok) => {
      const wrapper = mountEmpty({ accept })
      const file = typeOrName.includes('/')
        ? new File(['x'], 'f', { type: typeOrName })
        : new File(['x'], typeOrName, { type: '' })
      await wrapper
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [file] } })
      expect(wrapper.emitted('update:modelValue') !== undefined).toBe(ok)
    })
  })

  describe('with a file selected', () => {
    it('shows the preview inside the tile, with the filename and a remove button', () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' } })
      const img = wrapper.find('label.ns-image-upload__tile img')
      expect(img.exists(), 'the preview belongs in the tile, not beside it').toBe(true)
      expect(wrapper.find('.ns-image-upload__plus').exists(), 'no plus once filled').toBe(false)
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
      await settled()
      expect(wrapper.find('[aria-live="polite"]').text()).toBe('Selected image: receipt.png')
    })

    it('announces removal', async () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' } })
      await wrapper.setProps({ modelValue: null })
      await settled()
      expect(wrapper.find('[aria-live="polite"]').text()).toBe('Image removed')
    })

    it('announces a rejection', async () => {
      const wrapper = mountEmpty()
      await wrapper
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [pdf()] } })
      await settled()
      expect(wrapper.find('[aria-live="polite"]').text()).toBe('That file type is not accepted')
    })

    it('announces a REPEATED rejection, which a live region otherwise swallows', async () => {
      // aria-live fires on DOM mutation. Two identical strings do not mutate the
      // text node, so the second never announced — measured in review with a
      // MutationObserver: one mutation for two rejections. The fix clears the
      // region across a tick. This test watches the text node change TWICE.
      const wrapper = mountEmpty()
      const live = () => wrapper.find('[aria-live="polite"]').element
      const observed: string[] = []
      const observer = new MutationObserver(() => observed.push(live().textContent ?? ''))
      observer.observe(live(), { childList: true, characterData: true, subtree: true })

      const surface = wrapper.find('.ns-image-upload__surface')
      await surface.trigger('drop', { dataTransfer: { files: [pdf()] } })
      await settled()
      await surface.trigger('drop', { dataTransfer: { files: [pdf()] } })
      await settled()
      observer.disconnect()

      const announced = observed.filter((t) => t === 'That file type is not accepted')
      expect(announced.length, 'the second identical rejection did not re-announce').toBe(2)
    })

    it('announces BOTH of two events that race in the same flush', async () => {
      // A rejected drop followed at once by an accepted one, with no await
      // between. The first clear-then-set implementation lost the rejection
      // entirely — measured in review: one MutationObserver record, the
      // acceptance only. Serialising through a promise chain makes each wait.
      const Host = defineComponent({
        components: { NsImageUpload },
        data: () => ({ file: null as File | null }),
        template: `<NsImageUpload v-model="file" label="L" />`,
      })
      const wrapper = mount(Host)
      const live = () => wrapper.find('[aria-live="polite"]').element
      const seen: string[] = []
      const observer = new MutationObserver(() => {
        const t = live().textContent?.trim() ?? ''
        if (t) seen.push(t)
      })
      observer.observe(live(), { childList: true, characterData: true, subtree: true })

      const surface = wrapper.find('.ns-image-upload__surface')
      // No await between the two: they land in the same flush.
      void surface.trigger('drop', { dataTransfer: { files: [pdf()] } })
      void surface.trigger('drop', { dataTransfer: { files: [png('good.png')] } })
      await settled()
      await settled()
      observer.disconnect()

      expect(seen, 'the rejection was lost to the race').toContain('That file type is not accepted')
      expect(seen).toContain('Selected image: good.png')
      // IN ORDER. Presence alone would pass if a later change let the
      // modelValue watcher bypass the chain; "selected" then "not accepted"
      // is misleading to hear.
      expect(seen.indexOf('That file type is not accepted')).toBeLessThan(
        seen.indexOf('Selected image: good.png'),
      )
    })

    // NO TEST FOR "the chain survives a rejected announcement", and here is why
    // rather than a test that cannot fail. The fix is `.then(run, run)` so one
    // rejection does not poison every later announcement. The trigger a
    // reviewer measured is a dev-mode error in an UNRELATED component, landing
    // one microtask into the announce window, which makes Vue's flush promise
    // reject. Reproducing that in vitest means an unhandled component error —
    // which vitest itself catches and fails the test on, for the mutant AND the
    // fix alike. Swallowing it with app.config.errorHandler swallows it before
    // Vue's logError, so the flush never rejects and the test passes against
    // the mutant too. Measured both ways. The reviewer's probe ran with
    // --dangerouslyIgnoreUnhandledErrors; that is not a flag to bake into the
    // suite for one case. The property is pinned by the code comment and by
    // this note.
  })

  describe('the warning prop', () => {
    it('renders and ties to the input, WITHOUT marking it invalid', () => {
      // The warning prop is advice ("images over 5 MB will be resized"), not
      // an error. The first version set aria-invalid for it, so an untouched
      // empty input announced as "invalid entry" before the user did anything —
      // which trains people to ignore the flag. Only a real rejection sets it.
      const wrapper = mountEmpty({ warning: 'Max 5 MB' })
      const w = wrapper.find('.ns-image-upload__warning')
      expect(w.text()).toBe('Max 5 MB')
      expect(wrapper.find('input').attributes('aria-describedby')).toBe(w.attributes('id'))
      expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
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

  describe('rejecting while a file is selected keeps the file', () => {
    // A PDF dropped over a chosen image leaves the image and shows the warning
    // under the preview. Replacing the image with nothing because the
    // replacement was bad would be worse than either outcome. Asserted here
    // because a refactor that cleared modelValue on rejection would otherwise
    // regress with the suite green.
    it('does not emit update:modelValue and keeps the preview', async () => {
      const wrapper = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' } })
      await wrapper
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [pdf()] } })
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(wrapper.emitted('rejected')).toHaveLength(1)
      expect(wrapper.find('.ns-image-upload__filename').text()).toBe('photo.png')
      expect(wrapper.find('.ns-image-upload__warning').text()).toBe(
        'That file type is not accepted',
      )
    })
  })

  describe('attributes reach the input, not the wrapper', () => {
    // Measured on the built output before this: disabled, name and required
    // all landed on the wrapper div and did nothing — the ob8 shape this
    // library fixed in nineteen other components.
    it('sends name, required and data attributes to the input', () => {
      const wrapper = mount(NsImageUpload, {
        props: { modelValue: null, label: 'L' },
        attrs: { name: 'photo', required: true, 'data-testid': 'upload' },
      })
      const input = wrapper.find('input')
      expect(input.attributes('name')).toBe('photo')
      expect(input.attributes('required')).toBeDefined()
      expect(input.attributes('data-testid')).toBe('upload')
      expect(wrapper.attributes('name')).toBeUndefined()
    })

    it('keeps class and style on the root', () => {
      const wrapper = mount(NsImageUpload, {
        props: { modelValue: null, label: 'L' },
        attrs: { class: 'extra', style: 'margin: 1px' },
      })
      expect(wrapper.classes()).toContain('extra')
      expect(wrapper.attributes('style')).toContain('margin: 1px')
      expect(wrapper.find('input').classes()).not.toContain('extra')
    })

    it('has a single root, so fallthrough works at all', () => {
      // A comment before the root element once made this a multi-root
      // fragment; ten tests failed and were pushed anyway. Pinned.
      const wrapper = mount(NsImageUpload, {
        props: { modelValue: null, label: 'L' },
        attrs: { class: 'extra' },
      })
      expect(wrapper.element.tagName).toBe('DIV')
      expect(wrapper.element.classList.contains('extra')).toBe(true)
    })
  })

  describe('disable', () => {
    it('disables the input via the disable prop', () => {
      const wrapper = mountEmpty({ disable: true })
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
      expect(wrapper.classes()).toContain('ns-image-upload--disabled')
    })

    it('treats the disabled ATTRIBUTE as disable, with the house warning', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(NsImageUpload, {
        props: { modelValue: null, label: 'L' },
        attrs: { disabled: true },
      })
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[NsImageUpload] "disabled"'))
    })

    it('ignores a drop while disabled', async () => {
      const wrapper = mountEmpty({ disable: true })
      await wrapper
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [png()] } })
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
  })

  describe('dev warnings', () => {
    it('warns about an accept rule that can never match', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mountEmpty({ accept: 'image/, .png' })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('accept contains "image/"'))
    })

    // componentLibrary-3bm: the guard and isAccepted() must say the same thing.
    // A MIME token beginning with "." passed the guard but isAccepted() routes
    // it to endsWith, which no base name with a "/" satisfies — every drop
    // rejected and the guard silent, the exact case it exists for.
    it.each(['./x', '.a/b', '../x', 'image/.png'])(
      'warns about %j, which no picker-produced file can match',
      (rule) => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mountEmpty({ accept: rule })
        expect(warn).toHaveBeenCalledWith(expect.stringContaining(`accept contains "${rule}"`))
        // …and a drop IS refused by this rule: a picker's base name has no "/",
        // and no picker gives a file the type "image/.png" (a constructed File
        // could; review checked that the refusal below comes from the rule).
        return wrapper
          .find('.ns-image-upload__surface')
          .trigger('drop', {
            dataTransfer: { files: [new File(['x'], 'photo.png', { type: 'image/png' })] },
          })
          .then(() => expect(wrapper.emitted('update:modelValue')).toBeUndefined())
      },
    )

    // Conversely an extension with "-" or "_" DOES match (endsWith, as the
    // browser's own accept does), so the guard must not call it unmatchable.
    it.each(['.a-b', '.a_b', '.tar-gz', '.c++', '.ünï'])(
      'stays silent for %j, which endsWith matches',
      async (rule) => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const wrapper = mountEmpty({ accept: rule })
        expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('accept contains'))
        await wrapper.find('.ns-image-upload__surface').trigger('drop', {
          dataTransfer: { files: [new File(['x'], 'photo' + rule, { type: '' })] },
        })
        expect(wrapper.emitted('update:modelValue')).toBeDefined()
      },
    )

    it.each([
      'image/*',
      'image/png',
      '.png',
      '.png, image/*',
      'image/svg+xml',
      // Compound extensions are valid native tokens. The first regex flagged
      // `.tar.gz` as unmatchable — a false warning on a valid config.
      '.tar.gz',
      'application/vnd.ms-excel',
      '.jpeg,.JPG',
    ])('stays silent for a valid accept %j', (accept) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mountEmpty({ accept })
      expect(warn).not.toHaveBeenCalled()
    })

    it('warns when the label slot shows different words from the label prop', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsImageUpload, {
        props: { modelValue: null, label: 'Shop photo' },
        slots: { label: 'Upload your logo' },
      })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('WCAG 2.5.3'))
    })

    it('stays silent when the label slot formats the same words', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsImageUpload, {
        props: { modelValue: null, label: 'Shop photo' },
        slots: { label: 'Shop photo' },
      })
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe('i18n', () => {
    it('takes every visible string from the injected locale', async () => {
      const fr = {
        ...nsLocaleEnCA,
        media: {
          ...nsLocaleEnCA.media,
          uploadRemove: 'REMOVE',
          uploadSelected: 'SELECTED',
          uploadCleared: 'CLEARED',
          uploadRejected: 'REJECTED',
        },
      }
      const global = { provide: { [NsLocaleKey as symbol]: fr } }
      const empty = mount(NsImageUpload, { props: { modelValue: null, label: 'L' }, global })
      await empty
        .find('.ns-image-upload__surface')
        .trigger('drop', { dataTransfer: { files: [pdf()] } })
      expect(empty.find('.ns-image-upload__warning').text()).toBe('REJECTED')

      const filled = mount(NsImageUpload, { props: { modelValue: png(), label: 'L' }, global })
      await settled()
      expect(filled.find('button').text()).toBe('REMOVE')
      expect(filled.find('[aria-live="polite"]').text()).toContain('SELECTED')
      await filled.setProps({ modelValue: null })
      await settled()
      expect(filled.find('[aria-live="polite"]').text()).toBe('CLEARED')
    })
  })
})
