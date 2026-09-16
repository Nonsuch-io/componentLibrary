import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import NsOrderSummaryTotals from './NsOrderSummaryTotals.vue'
import NsPlanSelectionCard from '../NsPlanSelectionCard/NsPlanSelectionCard.vue'

/** The design's Empty state (2470:232413), word for word. */
const empty = {
  lines: [
    { id: 'subtotal', label: 'Subtotal', value: '$0.00' },
    { id: 'taxes', label: 'Taxes', detail: 'GST + 0%', value: '$0.00' },
  ],
  total: { value: '$0.00', note: 'due today' },
}

/** The Filled state with one applied code (2470:232356 / 2353:28031). */
const filled = {
  lines: [
    { id: 'subtotal', label: 'Subtotal', value: '$10.00' },
    { id: 'taxes', label: 'Taxes', detail: 'GST + 5%', value: '$0.40' },
  ],
  discounts: [{ id: 'summer20', code: 'SUMMER20', amount: '-$2.00' }],
  total: { value: '$8.40', note: 'due today' },
}

const meta: Meta<typeof NsOrderSummaryTotals> = {
  title: 'Components/NsOrderSummaryTotals',
  component: NsOrderSummaryTotals,
  tags: ['autodocs'],
  args: { ...empty, onApply: fn(), onRemove: fn() },
}

export default meta
type Story = StoryObj<typeof meta>

const fontsReady = () => document.fonts.ready

export const Empty: Story = {}

export const WithAnAppliedCode: Story = { args: filled }

/** A shipping line — the design's NsShipping, placeholder copy only (INFERRED shape). */
export const WithShipping: Story = {
  args: {
    lines: [
      { id: 'subtotal', label: 'Subtotal', value: '$10.00' },
      { id: 'shipping', label: 'Shipping', detail: 'Canada Post, 3–5 days', value: '$7.50' },
      { id: 'taxes', label: 'Taxes', detail: 'GST + 5%', value: '$0.88' },
    ],
    total: { value: '$18.38', note: 'due today' },
  },
}

/** No code form — a receipt. */
export const Receipt: Story = {
  args: { ...filled, allowDiscountCode: false, total: { value: '$8.40', note: 'paid' } },
}

/** Field error — INFERRED: no frame shows an invalid code; NsInput's own error rendering. */
export const InvalidCode: Story = {
  args: { discountCode: 'WINTER99', discountCodeError: 'That code is not valid.' },
}

/**
 * Placed as the design does: NsOrderSummary (185:10182) is NsPlanSelectionCard
 * titled "Order Summary" with NsBannerSelectedPlan (componentLibrary-rbe.1)
 * above this. A composition; the banner's story shows the top half.
 */
export const InsideOrderSummary: Story = {
  render: (args) => ({
    components: { NsOrderSummaryTotals, NsPlanSelectionCard },
    setup: () => ({ args }),
    template: `
      <NsPlanSelectionCard title="Order Summary" style="max-width: 382px">
        <NsOrderSummaryTotals v-bind="args" />
      </NsPlanSelectionCard>
    `,
  }),
}

/**
 * THE CONTRACT: Apply and Enter emit the trimmed code and nothing else
 * happens; an empty field emits nothing; the chip's remove emits the
 * discount. The consumer owns the field's text and the sums.
 */
export const ApplyAndRemoveAreEmits: Story = {
  render: (args) => ({
    components: { NsOrderSummaryTotals },
    setup: () => ({ args, code: ref('') }),
    template: `<NsOrderSummaryTotals v-bind="args" v-model:discount-code="code" />`,
  }),
  args: filled,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const field = canvas.getByRole('textbox', { name: 'Discount Code' })
    const apply = canvas.getByRole('button', { name: 'Apply' })

    await userEvent.click(apply)
    await expect(args.onApply).not.toHaveBeenCalled()

    await userEvent.type(field, '  summer20  {Enter}')
    await waitFor(() => expect(args.onApply).toHaveBeenCalledWith('summer20'))
    await userEvent.click(apply)
    await expect(args.onApply).toHaveBeenCalledTimes(2)

    // The remove is named with the code, so two applied codes read apart.
    const remove = canvas.getByRole('button', { name: 'Remove discount code SUMMER20' })
    await userEvent.click(remove)
    await expect(args.onRemove).toHaveBeenCalledWith(filled.discounts[0])
  },
}

/**
 * GEOMETRY IS REAL — 2470:232413 at 345: rows of 20 / 20 / 38 / 49 with 8
 * between, the taxes detail 20 past a 100px label column, the amounts at
 * the right edge, Apply 8 from the 38px field, the total's 20px amount
 * over its note. jsdom loads no stylesheet; only Chromium sees it.
 */
export const LayoutIsReal: Story = {
  render: (args) => ({
    components: { NsOrderSummaryTotals },
    setup: () => ({ args }),
    template: `<div style="width: 345px"><NsOrderSummaryTotals v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    const root = canvasElement.querySelector('.ns-order-summary-totals') as HTMLElement
    const rect = root.getBoundingClientRect()
    await expect(rect.width).toBe(345)
    // MEASURED 149.8 against Figma's 151: the two 19.6 rows laid out as 20
    // and the total's 48.6 as 49. Same rows, unrounded.
    await expect(rect.height).toBeCloseTo(149.8, 0)

    const lines = root.querySelectorAll('.ns-order-summary-totals__line')
    const [subtotal, taxes, total] = [...lines].map((el) => el.getBoundingClientRect())
    await expect(subtotal.height).toBeCloseTo(19.6, 0)
    await expect(taxes.top - subtotal.bottom).toBe(8)
    await expect(total.height).toBeCloseTo(48.6, 0)

    const amounts = root.querySelectorAll('.ns-order-summary-totals__amount')
    for (const amount of amounts)
      await expect(amount.getBoundingClientRect().right).toBe(rect.right)
    const detail = root.querySelector('.ns-order-summary-totals__detail') as HTMLElement
    await expect(detail.getBoundingClientRect().left - rect.left).toBe(120)
    await expect(getComputedStyle(detail).fontSize).toBe('12px')

    const form = root.querySelector('.ns-order-summary-totals__code') as HTMLElement
    await expect(form.getBoundingClientRect().top - taxes.bottom).toBe(8)
    const label = form.querySelector('.ns-order-summary-totals__code-label') as HTMLElement
    const field = form.querySelector('.q-field__control') as HTMLElement
    const apply = form.querySelector('.ns-order-summary-totals__apply') as HTMLElement
    await expect(field.getBoundingClientRect().height).toBe(38)
    await expect(field.getBoundingClientRect().left - label.getBoundingClientRect().right).toBe(20)
    await expect(apply.getBoundingClientRect().left - field.getBoundingClientRect().right).toBe(8)
    await expect(apply.getBoundingClientRect().right).toBe(rect.right)
    await expect(apply.getBoundingClientRect().height).toBe(36)

    const totalAmount = root.querySelector('.ns-order-summary-totals__total-amount') as HTMLElement
    await expect(getComputedStyle(totalAmount).fontSize).toBe('20px')
    await expect(getComputedStyle(totalAmount).fontWeight).toBe('600')
    await expect(totalAmount.getBoundingClientRect().right).toBe(rect.right)
    const note = root.querySelector('.ns-order-summary-totals__total-note') as HTMLElement
    await expect(
      note.getBoundingClientRect().top - totalAmount.getBoundingClientRect().bottom,
    ).toBe(4)
  },
}

/**
 * APPLIED GEOMETRY — 2470:232356: the discount row with the chip and the
 * amount at the right, then the field row 4 beneath, indented past the
 * label column (the label's width + 20 — the design's 97 is its label; the
 * browser's "Discount Code" at 14/600 is 96, so 116 here), Apply still at
 * the right edge. The invisible label still names the field.
 */
export const AppliedLayoutIsReal: Story = {
  render: (args) => ({
    components: { NsOrderSummaryTotals },
    setup: () => ({ args }),
    template: `<div style="width: 345px"><NsOrderSummaryTotals v-bind="args" /></div>`,
  }),
  args: filled,
  play: async ({ canvasElement }) => {
    await fontsReady()
    const root = canvasElement.querySelector('.ns-order-summary-totals') as HTMLElement
    const rect = root.getBoundingClientRect()
    const discount = root.querySelector('.ns-order-summary-totals__discount') as HTMLElement
    const chip = discount.querySelector('.q-chip') as HTMLElement
    const amount = discount.querySelector('.ns-order-summary-totals__amount') as HTMLElement
    await expect(amount.textContent?.trim()).toBe('-$2.00')
    await expect(amount.getBoundingClientRect().right).toBe(rect.right)
    await expect(chip.getBoundingClientRect().left - rect.left).toBe(
      discount.querySelector('dt')!.getBoundingClientRect().width + 20,
    )

    const form = root.querySelector('.ns-order-summary-totals__code') as HTMLElement
    const label = form.querySelector('.ns-order-summary-totals__code-label') as HTMLElement
    const field = form.querySelector('.q-field__control') as HTMLElement
    await expect(form.getBoundingClientRect().top - discount.getBoundingClientRect().bottom).toBe(4)
    await expect(getComputedStyle(label).visibility).toBe('hidden')
    await expect(field.getBoundingClientRect().left - rect.left).toBe(
      label.getBoundingClientRect().width + 20,
    )
    await expect(within(form).getByRole('textbox', { name: 'Discount Code' })).toBeTruthy()
  },
}
