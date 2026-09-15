import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { PhPackage, PhUsersThree } from '@phosphor-icons/vue'
import NsPlanBuilder from './NsPlanBuilder.vue'
import type { NsPlanAddOnCategory } from './types'

/** The design's instance (170:6802) — tabs Inventory / Team, "$5 /mo" options. The copy inside the card is ours; the design's is placeholder. */
const categories: NsPlanAddOnCategory[] = [
  {
    id: 'inventory',
    label: 'Inventory',
    icon: PhPackage,
    name: 'Inventory Items Top Up',
    description: 'More unique items than your base plan allows.',
    options: [
      { id: 'inv-250', name: '+250 items', price: '$5', period: '/mo' },
      { id: 'inv-1000', name: '+1,000 items', price: '$15', period: '/mo', added: true },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    icon: PhUsersThree,
    name: 'Growing Team',
    description: 'Seats beyond the five your base plan includes.',
    options: [
      { id: 'team-5', name: '+5 team members', price: '$10', period: '/mo' },
      { id: 'team-15', name: '+15 team members', price: '$25', period: '/mo' },
    ],
  },
]

const meta: Meta<typeof NsPlanBuilder> = {
  title: 'Components/NsPlanBuilder',
  component: NsPlanBuilder,
  tags: ['autodocs'],
  args: {
    title: 'Option 1: Build Your Plan',
    base: { name: 'butiq Base', price: '$99', period: '/mo', note: '+ Add-Ons' },
    categories,
    total: { price: '$114', period: '/mo', note: 'butiq Base $99 + 1 add-on' },
    actionLabel: 'Continue With This Plan',
    onAdd: fn(),
    onRemove: fn(),
    onSelect: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

const fontsReady = () => document.fonts.ready

export const Default: Story = {}

/** One category: no tabs, just the card. */
export const SingleCategory: Story = {
  args: { categories: [categories[0]] },
}

/**
 * The consumer owns the total: a wrapper that adds prices on add/remove
 * and hands the result back — the arithmetic lives HERE, in the story, not
 * in the component.
 */
export const ConsumerOwnedTotal: Story = {
  render: (args) => ({
    components: { NsPlanBuilder },
    setup: () => {
      const cats = ref(categories.map((c) => ({ ...c, options: c.options.map((o) => ({ ...o })) })))
      const price = (s?: string) => Number((s ?? '0').replace(/[^0-9.]/g, ''))
      const total = () => {
        const added = cats.value.flatMap((c) => c.options.filter((o) => o.added))
        const sum = 99 + added.reduce((n, o) => n + price(o.price), 0)
        return {
          price: `$${sum}`,
          period: '/mo',
          note: `butiq Base $99 + ${added.length} add-on${added.length === 1 ? '' : 's'}`,
        }
      }
      const toggle = (id: string, added: boolean) => {
        for (const c of cats.value) for (const o of c.options) if (o.id === id) o.added = added
      }
      return { args, cats, total, toggle }
    },
    template: `
      <NsPlanBuilder
        v-bind="args"
        :categories="cats"
        :total="total()"
        @add="(o) => toggle(o.id, true)"
        @remove="(o) => toggle(o.id, false)"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const amount = () => canvasElement.querySelector('.ns-plan-builder__total-amount')!.textContent
    await expect(amount()).toBe('$114')
    await userEvent.click(canvasElement.querySelector('.ns-plan-add-on__add') as HTMLElement)
    await waitFor(() => expect(amount()).toBe('$119'))
    // Both options are added now; remove the $15 one (the second row).
    const removes = canvasElement.querySelectorAll<HTMLElement>('.ns-plan-add-on__remove')
    await expect(removes.length).toBe(2)
    await userEvent.click(removes[1])
    await waitFor(() => expect(amount()).toBe('$104'))
  },
}

/**
 * DESKTOP GEOMETRY IS REAL — 170:6802 at 910, the builder's own root being
 * the selection card with 870 inside: the base banner 61 tall on a brand
 * surface, the total 91 on accent, both surfaces with NO role, the tabs 36,
 * the action md right-aligned.
 */
export const LayoutIsRealOnDesktop: Story = {
  render: (args) => ({
    components: { NsPlanBuilder },
    setup: () => ({ args }),
    template: `<div style="width: 910px"><NsPlanBuilder v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeGreaterThanOrEqual(1024)
    const card = canvasElement.querySelector('.ns-plan-builder') as HTMLElement
    await expect(card.getBoundingClientRect().width).toBe(910)
    await expect(card.classList.contains('ns-plan-selection-card')).toBe(true)
    // Everything below measures the 870 inside the card's 20px inset.
    const root = card
    const base = root.querySelector('.ns-plan-builder__base') as HTMLElement
    const total = root.querySelector('.ns-plan-builder__total') as HTMLElement

    // Surfaces, not messages: no role, no aria-live, the design's fills.
    for (const banner of [base, total]) {
      await expect(banner.getAttribute('role')).toBeNull()
      await expect(banner.getAttribute('aria-live')).toBeNull()
      await expect(banner.getBoundingClientRect().width).toBe(870)
    }
    await expect(getComputedStyle(base).backgroundColor).toBe('rgb(253, 244, 231)')
    await expect(getComputedStyle(base).borderTopWidth).toBe('1px')
    await expect(getComputedStyle(total).backgroundColor).toBe('rgb(184, 228, 250)')

    // MEASURED against 2361:191348 (61) and 2361:191733 (91). The base is
    // 16 + 28.8 + 16 = 60.8 in CSS; Figma lays the 24px line out as 29.
    await expect(base.getBoundingClientRect().height).toBeCloseTo(60.8, 0)
    await expect(total.getBoundingClientRect().height).toBeCloseTo(91, 0)
    // Base: name left, price right on one row, 24px.
    const name = base.querySelector('.ns-plan-builder__base-name') as HTMLElement
    const price = base.querySelector('.ns-plan-builder__base-price') as HTMLElement
    await expect(getComputedStyle(name).fontSize).toBe('24px')
    await expect(price.getBoundingClientRect().left).toBeGreaterThan(
      name.getBoundingClientRect().right,
    )
    // Total: the note sits to the RIGHT of the heading on desktop.
    const heading = total.querySelector('.ns-plan-builder__total-heading')!.getBoundingClientRect()
    const note = total.querySelector('.ns-plan-builder__total-note')!.getBoundingClientRect()
    await expect(note.left).toBeGreaterThan(heading.right)
    await expect(
      getComputedStyle(total.querySelector('.ns-plan-builder__total-amount')!).fontSize,
    ).toBe('32px')

    const tabs = root.querySelector('.ns-plan-builder__tabs') as HTMLElement
    await expect(tabs.getBoundingClientRect().height).toBe(36)

    const action = root.querySelector('.ns-plan-builder__action') as HTMLElement
    await expect(action.getBoundingClientRect().height).toBe(36)
    await expect(action.getBoundingClientRect().right).toBe(root.getBoundingClientRect().right - 20)
    await expect(action.getBoundingClientRect().width).toBeLessThan(300)

    // An option row: details | price | button on one line, 42 tall inside.
    const option = root.querySelector('.ns-plan-add-on__option') as HTMLElement
    await expect(getComputedStyle(option).flexDirection).toBe('row')
    const add = option.querySelector('.ns-plan-add-on__add') as HTMLElement
    await expect(add.getBoundingClientRect().height).toBe(36)
  },
}

/**
 * MOBILE GEOMETRY IS REAL — 177:7123 at 350: the base banner shrinks to 53
 * (16px type), the total stays 91 with the note stacked under, every button
 * is lg and full width, and an option stacks its button under its details.
 */
export const LayoutIsRealOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => ({
    components: { NsPlanBuilder },
    setup: () => ({ args }),
    template: `<div style="width: 350px"><NsPlanBuilder v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeLessThan(1024)
    const root = canvasElement.querySelector('.ns-plan-builder') as HTMLElement
    const base = root.querySelector('.ns-plan-builder__base') as HTMLElement
    await expect(base.getBoundingClientRect().height).toBeCloseTo(52.8, 0) // 16 + 20.8 + 16; Figma 53
    await expect(
      getComputedStyle(base.querySelector('.ns-plan-builder__base-name')!).fontSize,
    ).toBe('16px')

    const total = root.querySelector('.ns-plan-builder__total') as HTMLElement
    const heading = total.querySelector('.ns-plan-builder__total-heading')!.getBoundingClientRect()
    const note = total.querySelector('.ns-plan-builder__total-note')!.getBoundingClientRect()
    await expect(note.top).toBeGreaterThanOrEqual(heading.bottom)

    const action = root.querySelector('.ns-plan-builder__action') as HTMLElement
    await expect(action.getBoundingClientRect().height).toBe(45)
    await expect(action.getBoundingClientRect().width).toBe(310)

    const option = root.querySelector('.ns-plan-add-on__option') as HTMLElement
    await expect(getComputedStyle(option).flexDirection).toBe('column')
    const add = option.querySelector('.ns-plan-add-on__add') as HTMLElement
    await expect(add.getBoundingClientRect().height).toBe(45)
    await expect(add.getBoundingClientRect().width).toBe(option.getBoundingClientRect().width)
  },
}

/** Tabs switch the card; the switch is a v-model the consumer may own. */
export const TabsSwitchTheCategory: Story = {
  play: async ({ canvasElement }) => {
    const name = () => canvasElement.querySelector('.ns-plan-add-on__name')!.textContent?.trim()
    await expect(name()).toBe('Inventory Items Top Up')
    const teamTab = [...canvasElement.querySelectorAll<HTMLElement>('.ns-tab')].find((t) =>
      t.textContent?.includes('Team'),
    )!
    await userEvent.click(teamTab)
    await waitFor(() => expect(name()).toBe('Growing Team'))
    await expect(teamTab.getAttribute('aria-selected')).toBe('true')
  },
}
