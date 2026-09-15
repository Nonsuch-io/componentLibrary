import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn } from 'storybook/test'
import NsPlanSelectionCard from './NsPlanSelectionCard.vue'
import NsCombo from '../NsCombo/NsCombo.vue'

const meta: Meta<typeof NsPlanSelectionCard> = {
  title: 'Components/NsPlanSelectionCard',
  component: NsPlanSelectionCard,
  tags: ['autodocs'],
  args: { title: 'Option 2: Choose a Combo' },
}

export default meta
type Story = StoryObj<typeof meta>

const fontsReady = () => document.fonts.ready

const brickAndMortar = {
  bestFor: 'Best For: Sellers with one physical location',
  name: 'Independent Brick & Mortar',
  price: '$133',
  period: '/mo',
  highlights: ['butiq Basic', 'Inventory Management', 'NFC Payments', 'Multiple Team Members'],
  features: [
    'Take tap payments from your phone',
    'Up to 5 team members',
    '750 unique inventory items',
  ],
  actionLabel: 'Continue With This Plan',
}

/**
 * THE DESIGN'S NsChooseACombo (170:7387, 910x352): this card with an NsCombo
 * inside. It is a composition, not a component — the card is the only
 * chrome, and NsCombo is the contents (componentLibrary-lrw.6.3). Pinned
 * here so the composition is measured: 910 wide, 870 inside, the heading
 * 25 tall, the combo at y=57 (20 + 25 + 12).
 */
export const ChooseACombo: Story = {
  render: (args) => ({
    components: { NsPlanSelectionCard, NsCombo },
    setup: () => ({ args, combo: brickAndMortar, onSelect: fn() }),
    template: `
      <div style="width: 910px">
        <NsPlanSelectionCard v-bind="args">
          <NsCombo v-bind="combo" :level="3" @select="onSelect" />
        </NsPlanSelectionCard>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    if (window.innerWidth < 1024) return
    const card = canvasElement.querySelector('.ns-plan-selection-card') as HTMLElement
    const rect = card.getBoundingClientRect()
    await expect(rect.width).toBe(910)
    await expect(getComputedStyle(card).borderRadius).toBe('12px')
    await expect(getComputedStyle(card).borderTopWidth).toBe('1px')
    await expect(getComputedStyle(card).backgroundColor).toBe('rgb(255, 255, 255)')

    const heading = card.querySelector('h2')!.getBoundingClientRect()
    await expect(heading.top - rect.top).toBe(20)
    await expect(heading.height).toBe(25)
    const combo = card.querySelector('.ns-combo')!.getBoundingClientRect()
    await expect(combo.left - rect.left).toBe(20)
    await expect(combo.width).toBe(870)
    await expect(combo.top - rect.top).toBe(57)
    // 20 + 25 + 12 + the combo (273.17 measured in NsCombo's own story) + 20:
    // Figma's 352 is the same with its per-row rounding.
    await expect(rect.height).toBeCloseTo(350.17, 0)
    // The combo's heading sits under the card's.
    await expect(card.querySelector('h3')!.textContent?.trim()).toBe('Independent Brick & Mortar')
  },
}

/** Several combos stack at the card's 12px gap. */
export const SeveralCombos: Story = {
  render: (args) => ({
    components: { NsPlanSelectionCard, NsCombo },
    setup: () => ({
      args,
      combos: [
        brickAndMortar,
        {
          ...brickAndMortar,
          name: 'Online Only',
          price: '$89',
          bestFor: 'Best For: Sellers without a storefront',
        },
      ],
    }),
    template: `
      <div style="max-width: 910px">
        <NsPlanSelectionCard v-bind="args">
          <NsCombo v-for="c in combos" :key="c.name" v-bind="c" :level="3" />
        </NsPlanSelectionCard>
      </div>
    `,
  }),
}
