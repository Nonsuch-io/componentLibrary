import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsDialog from './NsDialog.vue'
import NsButton from '../NsButton/NsButton.vue'

const meta: Meta<typeof NsDialog> = {
  title: 'Components/NsDialog',
  component: NsDialog,
  args: {
    modelValue: true,
    title: 'Confirm action',
    persistent: false,
    noBackdropDismiss: false,
  },
  argTypes: {
    title: { control: 'text' },
    persistent: { control: 'boolean' },
    noBackdropDismiss: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsDialog>

export const Default: Story = {
  render: (args) => ({
    components: { NsDialog },
    setup: () => ({ args }),
    template: `
      <NsDialog v-bind="args">
        <p>Are you sure you want to proceed?</p>
        <template #actions>
          <button>Cancel</button>
          <button>Confirm</button>
        </template>
      </NsDialog>
    `,
  }),
}

export const Persistent: Story = {
  args: {
    persistent: true,
    title: 'Unsaved changes',
  },
  render: (args) => ({
    components: { NsDialog },
    setup: () => ({ args }),
    template: `
      <NsDialog v-bind="args">
        <p>You have unsaved changes. Discard them?</p>
        <template #actions>
          <button>Keep editing</button>
          <button>Discard</button>
        </template>
      </NsDialog>
    `,
  }),
}

/**
 * The design system's named widths — 400 / 650 / 820. Storybook is the only
 * place the difference is actually visible, since happy-dom computes no layout.
 */
/**
 * MEASURES THE RENDERED WIDTH IN A REAL BROWSER, and that is the whole point.
 *
 * The unit tests parse the component's style block, because happy-dom has no
 * layout engine. Review proved that blind spot is real: commenting out the
 * `&--large` rule left all 25 unit tests green while the browser fell back to
 * Quasar's own 560px cap. Source text cannot tell you whether the CSS is live.
 *
 * This story runs in Chromium via @storybook/addon-vitest, so it can. It asserts
 * at a viewport wide enough to clear the shrink threshold (~868px for large),
 * since below that the card legitimately resolves against viewport - 48px.
 */
export const LargeMeasuresEightTwenty: Story = {
  render: () => ({
    components: { NsDialog },
    template: `
      <NsDialog :model-value="true" size="large" title="Large">Body</NsDialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    void canvasElement
    // The dialog portals to body, so query the document rather than the canvas.
    // Poll for a MEASURABLE width, not merely for the element, and measure with
    // offsetWidth rather than getBoundingClientRect().
    //
    // Two wrong readings on the way here, both worth recording: measuring on
    // presence alone gave 0px, because Quasar has the card in the DOM with no
    // box for the first few frames. Then getBoundingClientRect() gave 128px —
    // exactly 320 x 0.4, because Quasar's enter animation starts at scale(0.4)
    // and getBoundingClientRect INCLUDES transforms. offsetWidth is layout
    // width and ignores them, which is what this assertion is actually about.
    const width = await new Promise<number>((resolve, reject) => {
      const started = performance.now()
      const tick = () => {
        const el = document.querySelector<HTMLElement>('.ns-dialog__card--large')
        const w = el?.offsetWidth ?? 0
        if (w > 0) return resolve(w)
        if (performance.now() - started > 5000) {
          return reject(new Error(el ? 'dialog never gained a width' : 'dialog never rendered'))
        }
        requestAnimationFrame(tick)
      }
      tick()
    })
    const viewport = window.innerWidth
    // Above the threshold the card must hit 820; at or below it, it must be
    // capped by the viewport rather than by Quasar's 560px default.
    if (viewport >= 868) {
      if (Math.round(width) !== 820) {
        throw new Error(`size="large" rendered ${Math.round(width)}px, expected 820px`)
      }
    } else if (width > viewport - 48 + 1 || width <= 560) {
      throw new Error(
        `size="large" rendered ${Math.round(width)}px at a ${viewport}px viewport — ` +
          `expected it to track viewport-48 (${viewport - 48}px), not fall back to Quasar's 560px`,
      )
    }
  },
}

export const Sizes: Story = {
  render: () => ({
    components: { NsDialog, NsButton },
    setup() {
      const open = ref<'small' | 'default' | 'large' | null>(null)
      return { open }
    },
    template: `
      <div style="display:flex; gap:12px">
        <NsButton label="Small" @click="open = 'small'" />
        <NsButton label="Default" @click="open = 'default'" />
        <NsButton label="Large" @click="open = 'large'" />
      </div>
      <NsDialog
        :model-value="open !== null"
        :size="open ?? 'default'"
        :title="(open ?? '') + ' dialog'"
        @update:model-value="open = null"
      >
        This dialog is the "{{ open }}" size from the design system's scale.
      </NsDialog>
    `,
  }),
}

/**
 * A dialog with no visible heading, named by `aria-label`.
 *
 * Without one it announces as "dialog" and nothing else while trapping focus.
 * This story exists so the axe gate covers the prop's real DOM output once
 * componentLibrary-057 flips `a11y.test` to `'error'` — a unit assertion alone
 * would not.
 */
export const NamedByAriaLabel: Story = {
  args: {
    modelValue: true,
    title: undefined,
    ariaLabel: 'Filter panel',
  },
}
