import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'
import NsChecklistBanner, { type NsChecklistTask } from './NsChecklistBanner.vue'

/** The design's instance (206:29274), word for word. */
const shopSetUp: NsChecklistTask[] = [
  {
    id: 'vendors',
    title: 'Add vendors',
    description: 'so you can easily order and track item restock.',
    actionLabel: 'Go to Vendors',
    dismissable: true,
  },
  {
    id: 'items',
    title: 'Add items',
    description: 'to your shop to sell.',
    actionLabel: 'Go to Items',
    dismissable: true,
  },
  {
    id: 'inventory',
    title: 'Count inventory',
    description: 'so you can track your stock.',
    actionLabel: 'Go to Inventory',
    dismissable: true,
  },
  {
    id: 'verification',
    title: 'Set up additional account verification',
    description: 'to add security to your shop.',
    actionLabel: 'Go to My Profile',
    dismissable: true,
  },
]

const meta: Meta<typeof NsChecklistBanner> = {
  title: 'Components/NsChecklistBanner',
  component: NsChecklistBanner,
  tags: ['autodocs'],
  args: {
    title: 'Shop Set Up Checklist',
    subtitle: 'To make your life easier, we recommend this order.',
    tasks: shopSetUp,
    onAction: fn(),
    onDismiss: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

const fontsReady = () => document.fonts.ready

/** The design's `NsShopSetUpChecklistBanner` with actions (2440:237171). */
export const Default: Story = {}

/** The `actions=false` variant (2440:237169): no toggle, no per-task buttons. */
export const ReadOnly: Story = {
  args: {
    collapsible: false,
    tasks: shopSetUp.map(({ actionLabel: _a, dismissable: _d, ...t }) => t),
  },
}

/** Two of four done. The step circles fill; the badge counts what is left. */
export const PartlyComplete: Story = {
  args: {
    tasks: shopSetUp.map((t, i) => ({ ...t, complete: i < 2 })),
  },
}

export const AllComplete: Story = {
  args: { tasks: shopSetUp.map((t) => ({ ...t, complete: true })) },
}

/** Collapsed (248:35337): title and tag row only; the subtitle goes with the tasks. */
export const Collapsed: Story = {
  args: { expanded: false },
}

/** A per-task slot, for a sentence whose emphasis is not at the start (the design's task 4). */
export const RichTaskText: Story = {
  render: (args) => ({
    components: { NsChecklistBanner },
    setup: () => ({ args }),
    template: `
      <NsChecklistBanner v-bind="args">
        <template #task-verification>
          Add additional security to your shop by setting up
          <strong>additional account verification.</strong>
        </template>
      </NsChecklistBanner>
    `,
  }),
}

/**
 * DESKTOP GEOMETRY IS REAL — 206:29274 at the design's 1218 (1178 inside
 * the 20px padding): 58px task rows at a 12px gap, a 20px step circle, and
 * the heading in one row with the tag on the right. jsdom loads no
 * stylesheet, so only Chromium can see any of it.
 */
export const LayoutIsRealOnDesktop: Story = {
  render: (args) => ({
    components: { NsChecklistBanner },
    setup: () => ({ args }),
    template: `<div style="width: 1218px"><NsChecklistBanner v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeGreaterThanOrEqual(1024)
    const root = canvasElement.querySelector('.ns-checklist-banner') as HTMLElement
    const rows = canvasElement.querySelectorAll<HTMLElement>('.ns-checklist-banner__task')
    await expect(rows.length).toBe(4)

    // 1178 wide inside the padding; 58 = 8 + the fixed 42 text block + 8.
    for (const row of rows) {
      await expect(row.getBoundingClientRect().width).toBe(1178)
      await expect(row.getBoundingClientRect().height).toBe(58)
    }
    await expect(rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().bottom).toBe(
      12,
    )

    const step = rows[0].querySelector('.ns-checklist-banner__step') as HTMLElement
    await expect(step.getBoundingClientRect().width).toBe(20)
    await expect(step.getBoundingClientRect().height).toBe(20)

    // Heading: titles left, tag right, on ONE row (2440:237175).
    const titles = root.querySelector('.ns-checklist-banner__titles')!.getBoundingClientRect()
    const tag = root.querySelector('.ns-checklist-banner__tag')!.getBoundingClientRect()
    await expect(tag.left).toBeGreaterThan(titles.left)
    await expect(
      Math.abs(tag.top + tag.height / 2 - (titles.top + titles.height / 2)),
    ).toBeLessThan(1)
    await expect(tag.right - root.getBoundingClientRect().right).toBe(-20)

    // Actions sit at content width on the right of the row, not stretched.
    const actions = rows[0].querySelector('.ns-checklist-banner__task-actions') as HTMLElement
    const action = actions.querySelector('.ns-checklist-banner__task-action') as HTMLElement
    await expect(
      actions.getBoundingClientRect().right - rows[0].getBoundingClientRect().right,
    ).toBe(-20)
    await expect(action.getBoundingClientRect().height).toBe(36)
    await expect(action.getBoundingClientRect().width).toBeLessThan(200)
  },
}

/**
 * MOBILE GEOMETRY IS REAL — 258:17085 at 350: the tag row is ABOVE the
 * title and right-aligned; each task is a column and its two buttons share
 * the row equally.
 */
export const LayoutIsRealOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => ({
    components: { NsChecklistBanner },
    setup: () => ({ args }),
    template: `<div style="width: 350px"><NsChecklistBanner v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeLessThan(1024)
    const root = canvasElement.querySelector('.ns-checklist-banner') as HTMLElement
    const titles = root.querySelector('.ns-checklist-banner__titles')!.getBoundingClientRect()
    const tag = root.querySelector('.ns-checklist-banner__tag')!.getBoundingClientRect()
    await expect(tag.bottom).toBeLessThanOrEqual(titles.top)
    await expect(tag.right - root.getBoundingClientRect().right).toBe(-20)
    // The toggle is the rightmost thing in the tag row (I258:17085;6354:17409 at x=247 of 310).
    const toggle = root.querySelector('.ns-checklist-banner__toggle') as HTMLElement
    await expect(toggle.getBoundingClientRect().right).toBe(tag.right)

    const row = canvasElement.querySelector('.ns-checklist-banner__task') as HTMLElement
    await expect(getComputedStyle(row).flexDirection).toBe('column')
    const [action, dismiss] = row.querySelectorAll<HTMLElement>(
      '.ns-checklist-banner__task-actions > *',
    )
    await expect(action.getBoundingClientRect().width).toBe(dismiss.getBoundingClientRect().width)
    await expect(action.getBoundingClientRect().left - row.getBoundingClientRect().left).toBe(20)
    await expect(row.getBoundingClientRect().right - dismiss.getBoundingClientRect().right).toBe(20)
  },
}

/**
 * THE TOGGLE, in a real browser: Hide collapses the list and drops the
 * subtitle, Show restores both, aria-expanded follows, and the button keeps
 * focus across the swap so a keyboard user is not dropped.
 */
export const HideAndShow: Story = {
  render: (args) => ({
    components: { NsChecklistBanner },
    setup: () => ({ args, expanded: ref(true) }),
    template: `<NsChecklistBanner v-bind="args" v-model:expanded="expanded" />`,
  }),
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector('.ns-checklist-banner__toggle') as HTMLElement
    const list = canvasElement.querySelector('.ns-checklist-banner__tasks') as HTMLElement
    await expect(toggle.getAttribute('aria-expanded')).toBe('true')
    await expect(toggle.getAttribute('aria-controls')).toBe(list.id)
    await expect(canvasElement.querySelector('.ns-checklist-banner__subtitle')).not.toBeNull()

    toggle.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(toggle.getAttribute('aria-expanded')).toBe('false'))
    await expect(getComputedStyle(list).display).toBe('none')
    await expect(canvasElement.querySelector('.ns-checklist-banner__subtitle')).toBeNull()
    await expect(toggle.textContent?.trim()).toBe('Show')
    await expect(document.activeElement).toBe(toggle)

    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(toggle.getAttribute('aria-expanded')).toBe('true'))
    await expect(getComputedStyle(list).display).not.toBe('none')
    await expect(toggle.textContent?.trim()).toBe('Hide')
  },
}
