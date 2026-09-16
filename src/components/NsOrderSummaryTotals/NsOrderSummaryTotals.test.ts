import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import NsOrderSummaryTotals from './NsOrderSummaryTotals.vue'
import NsChip from '../NsChip/NsChip.vue'
import NsInput from '../NsInput/NsInput.vue'
import NsButton from '../NsButton/NsButton.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'

/**
 * NOTHING HERE MEASURES A PIXEL — the design's rows (20/20/38/49, the
 * 100px label column, the indented field) are in the stories under
 * Chromium. These are the contract: what is rendered from what, what a
 * screen reader is told, what is emitted, and that nothing here adds up.
 */

const filled = {
  lines: [
    { id: 'subtotal', label: 'Subtotal', value: '$10.00' },
    { id: 'taxes', label: 'Taxes', detail: 'GST + 5%', value: '$0.40' },
  ],
  discounts: [{ id: 'summer20', code: 'SUMMER20', amount: '-$2.00' }],
  total: { value: '$8.40', note: 'due today' },
}

const mountWith = (props: Record<string, unknown> = {}, provide: Record<symbol, unknown> = {}) =>
  mount(NsOrderSummaryTotals, {
    props: { ...filled, ...props },
    global: { provide },
    attachTo: document.body,
  })

// dt text, then the dd's parts (a chip counts by its content, not its icon).
const pairs = (w: ReturnType<typeof mountWith>) =>
  w
    .findAll('dl > div')
    .map((row) => [
      row.find('dt').text(),
      [...row.find('dd').element.children]
        .map((el) => (el.querySelector('.q-chip__content') ?? el).textContent?.trim())
        .join(' '),
    ])

describe('NsOrderSummaryTotals — name/value pairs', () => {
  it('renders every line, the applied discounts and the total as dt/dd pairs, in order', () => {
    const w = mountWith()
    expect(pairs(w)).toEqual([
      ['Subtotal', '$10.00'],
      ['Taxes', 'GST + 5% $0.40'],
      ['Discount Code', 'SUMMER20 -$2.00'],
      ['Total', '$8.40 due today'],
    ])
    w.unmount()
  })

  it('shows every amount exactly as handed and sums nothing', () => {
    const w = mountWith({
      lines: [{ id: 'a', label: 'Sous-total', value: '10,00 $' }],
      discounts: [],
      total: { value: '999' },
    })
    expect(pairs(w)).toEqual([
      ['Sous-total', '10,00 $'],
      ['Total', '999'],
    ])
    expect(w.find('.ns-order-summary-totals__total-note').exists()).toBe(false)
    w.unmount()
  })

  it('marks a line with a detail so the label takes the column', () => {
    const w = mountWith()
    const [subtotal, taxes] = w.findAll('.ns-order-summary-totals__line')
    expect(subtotal.classes()).not.toContain('ns-order-summary-totals__line--detailed')
    expect(taxes.classes()).toContain('ns-order-summary-totals__line--detailed')
    expect(subtotal.find('.ns-order-summary-totals__detail').exists()).toBe(false)
    w.unmount()
  })

  it('takes the total label from the locale, or from the consumer', () => {
    const fr = mountWith({}, { [NsLocaleKey as symbol]: nsLocaleFrCA })
    expect(fr.find('.ns-order-summary-totals__total dt').text()).toBe(nsLocaleFrCA.order.total)
    expect(fr.find('.ns-order-summary-totals__discount dt').text()).toBe(
      nsLocaleFrCA.order.discountCode,
    )
    fr.unmount()
    const own = mountWith({ totalLabel: 'Amount due' })
    expect(own.find('.ns-order-summary-totals__total dt').text()).toBe('Amount due')
    own.unmount()
  })
})

describe('NsOrderSummaryTotals — the discount code form', () => {
  it('is a form whose field is named "Discount Code" by the visible label', () => {
    const w = mountWith({ discounts: [] })
    const form = w.find('form')
    expect(form.exists()).toBe(true)
    const label = form.find('label')
    const input = form.find('input')
    expect(label.text()).toBe('Discount Code')
    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(input.attributes('placeholder')).toBe('YOURCODE')
    w.unmount()
  })

  it('keeps the label in the DOM, marked applied, once a code is applied — it still names the field', () => {
    const w = mountWith()
    expect(w.find('form').classes()).toContain('ns-order-summary-totals__code--applied')
    expect(w.find('form label').text()).toBe('Discount Code')
    w.unmount()
  })

  it('emits apply with the TRIMMED code on submit, and nothing for an empty field', async () => {
    const w = mountWith({ discounts: [] })
    await w.find('form').trigger('submit')
    expect(w.emitted('apply')).toBeUndefined()

    await w.findComponent(NsInput).vm.$emit('update:modelValue', '  summer20 ')
    expect(w.emitted('update:discountCode')).toEqual([['  summer20 ']])
    await w.find('form').trigger('submit')
    expect(w.emitted('apply')).toEqual([['summer20']])
    w.unmount()
  })

  it('the Apply button submits the form (type=submit, secondary, from the locale)', () => {
    const w = mountWith()
    const apply = w.findComponent(NsButton)
    expect(apply.attributes('type')).toBe('submit')
    expect(apply.props('variant')).toBe('secondary')
    expect(apply.text()).toBe('Apply')
    w.unmount()
  })

  it('is a v-model with an uncontrolled fallback', async () => {
    const controlled = mountWith({ discountCode: 'ABC' })
    expect(controlled.findComponent(NsInput).props('modelValue')).toBe('ABC')
    await controlled.findComponent(NsInput).vm.$emit('update:modelValue', 'ABCD')
    // Controlled: the prop still says ABC until the parent writes it back.
    expect(controlled.findComponent(NsInput).props('modelValue')).toBe('ABC')
    await controlled.setProps({ discountCode: undefined })
    // Released: the last controlled value carries over.
    expect(controlled.findComponent(NsInput).props('modelValue')).toBe('ABC')
    await controlled.findComponent(NsInput).vm.$emit('update:modelValue', 'XYZ')
    expect(controlled.findComponent(NsInput).props('modelValue')).toBe('XYZ')
    controlled.unmount()
  })

  it('hands an error to the field (INFERRED) and hides the bottom space otherwise', async () => {
    const w = mountWith({ discountCodeError: 'That code is not valid.' })
    await nextTick()
    expect(w.find('.q-field--error').exists()).toBe(true)
    expect(w.text()).toContain('That code is not valid.')
    w.unmount()
  })

  it('has no form at all when codes are not allowed', () => {
    const w = mountWith({ allowDiscountCode: false })
    expect(w.find('form').exists()).toBe(false)
    expect(pairs(w).length).toBe(4)
    w.unmount()
  })

  it('disables the field and the button together', () => {
    const w = mountWith({ disable: true })
    expect(w.findComponent(NsInput).props('disable')).toBe(true)
    expect(w.findComponent(NsButton).props('disable')).toBe(true)
    w.unmount()
  })
})

describe('NsOrderSummaryTotals — applied discounts', () => {
  it('shows each code on a removable chip whose remove is named with the code, and emits the discount', async () => {
    const w = mountWith()
    const chip = w.findComponent(NsChip)
    expect(chip.find('.q-chip__content').text()).toBe('SUMMER20')
    expect(chip.props('removable')).toBe(true)
    const remove = chip.find('[role="button"]')
    expect(remove.attributes('aria-label')).toBe('Remove discount code SUMMER20')
    await chip.vm.$emit('remove')
    expect(w.emitted('remove')).toEqual([[filled.discounts[0]]])
    w.unmount()
  })

  it('names the remove in French under fr-CA', () => {
    const w = mountWith({}, { [NsLocaleKey as symbol]: nsLocaleFrCA })
    expect(w.findComponent(NsChip).find('[role="button"]').attributes('aria-label')).toBe(
      'Retirer le code promo SUMMER20',
    )
    w.unmount()
  })
})
