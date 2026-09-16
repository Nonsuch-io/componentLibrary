<template>
  <div class="ns-order-summary-totals">
    <dl class="ns-order-summary-totals__lines">
      <div
        v-for="line in lines"
        :key="line.id"
        class="ns-order-summary-totals__line"
        :class="{ 'ns-order-summary-totals__line--detailed': line.detail }"
      >
        <dt class="ns-order-summary-totals__label ns-label-md">{{ line.label }}</dt>
        <dd class="ns-order-summary-totals__value">
          <span v-if="line.detail" class="ns-order-summary-totals__detail ns-body-sm">
            {{ line.detail }}
          </span>
          <span class="ns-order-summary-totals__amount ns-body-md">{{ line.value }}</span>
        </dd>
      </div>

      <div
        v-for="discount in discounts"
        :key="discount.id"
        class="ns-order-summary-totals__line ns-order-summary-totals__discount"
      >
        <dt class="ns-order-summary-totals__label ns-label-md">{{ locale.order.discountCode }}</dt>
        <dd class="ns-order-summary-totals__value">
          <NsChip
            dense
            removable
            class="ns-order-summary-totals__chip"
            :remove-aria-label="fill(locale.order.removeDiscount, { code: discount.code })"
            @remove="$emit('remove', discount)"
          >
            {{ discount.code }}
          </NsChip>
          <span class="ns-order-summary-totals__amount ns-body-md">{{ discount.amount }}</span>
        </dd>
      </div>
    </dl>

    <form
      v-if="allowDiscountCode"
      class="ns-order-summary-totals__code"
      :class="{ 'ns-order-summary-totals__code--applied': discounts.length > 0 }"
      novalidate
      @submit.prevent="submit"
    >
      <!--
        Once a code is applied the row above already says "Discount Code",
        so this label goes invisible but keeps its width: the design indents
        the field by exactly label + gap (97 = 77 + 20). It still names the
        field — aria-labelledby reads hidden text, which is the spec's
        guarantee; a hidden <label for> alone is not.
      -->
      <label :id="labelId" :for="inputId" class="ns-order-summary-totals__code-label ns-label-md">
        {{ locale.order.discountCode }}
      </label>
      <NsInput
        :for="inputId"
        size="dense"
        class="ns-order-summary-totals__code-input"
        :model-value="code"
        :placeholder="locale.order.codePlaceholder"
        :aria-labelledby="labelId"
        :error="Boolean(discountCodeError)"
        :error-message="discountCodeError"
        hide-bottom-space
        :disable="disable"
        autocomplete="off"
        autocapitalize="characters"
        @update:model-value="setCode"
      />
      <NsButton
        type="submit"
        variant="secondary"
        size="md"
        class="ns-order-summary-totals__apply"
        :disable="disable"
      >
        {{ locale.order.apply }}
      </NsButton>
    </form>

    <dl class="ns-order-summary-totals__lines">
      <div class="ns-order-summary-totals__line ns-order-summary-totals__total">
        <dt class="ns-order-summary-totals__label ns-label-md">
          {{ totalLabel ?? locale.order.total }}
        </dt>
        <dd class="ns-order-summary-totals__total-value">
          <span class="ns-order-summary-totals__total-amount ns-heading-md">{{ total.value }}</span>
          <span v-if="total.note" class="ns-order-summary-totals__total-note ns-body-md">
            {{ total.note }}
          </span>
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
/**
 * NsOrderSummaryTotals — the money lines under a selected plan on the order
 * summary (design `NsOrderSummaryTotals` 2470:232413, inside NsOrderSummary
 * 185:10182; componentLibrary-rbe.2). Read 2026-09-16 via Kale's selection
 * at 345 wide, states Empty and Filled, one applied discount at most in any
 * frame.
 *
 * CHROME, NOT ARITHMETIC (componentLibrary-jas): the lines, the applied
 * discounts and the total are DISPLAY strings the consumer formatted, and
 * nothing here adds up. Applying a code is an emit with the code; removing
 * one is an emit with the discount; whether the code is real, what it
 * takes off and what the total becomes are butiq's, and come back as props.
 *
 * MEASURED, top to bottom, 8px between rows: Subtotal (14/600 label, 14/400
 * amount at the right); Taxes (label in a 100px column, then 12/400 detail
 * "GST" "+ 0%" 20px on, the amount taking the rest, right-aligned) — the
 * design's NsTaxes; a NsShipping component exists with placeholder copy only
 * (`onlineShop`), so a shipping line is the same shape as taxes, INFERRED;
 * Discount Code: the 14/600 label, 20px, then a 38px NsInput (dense) with
 * "YOURCODE" placeholder taking the width and a secondary md "Apply" 8 on;
 * once applied (2470:232356), a row with the label, a primary NsChip of the
 * code with a 16px remove, and "-$2.00" at the right, then the field row 4
 * beneath, indented by the label's width plus the gap (97 at "Discount
 * Code"); Total: 14/600 label at the top, the 20/600 amount and a 14/400
 * note ("due today") stacked at the right, 4 apart, 49 tall.
 *
 * ACCESSIBILITY — the bead asked whether this is a table. It is a list of
 * NAME/VALUE PAIRS with a sum, which is what <dl> is for: a screen reader
 * reads "Subtotal, $10.00" without a grid to navigate, and a two-column
 * table with no column headers would say less. Two lists, because the form
 * cannot sit inside one (a <dl> takes only dt/dd groups) and DOM order must
 * stay the visual order for focus. The code field is a real <form>: Enter
 * applies, as it does everywhere else on the web. The chip's remove is
 * named with the code, so two applied codes are told apart.
 *
 * `discountCode` is a v-model with an uncontrolled fallback (as NsPlanBuilder's
 * `category`); `discountCodeError` is INFERRED — no frame shows an invalid
 * code, but no code field is usable without one, and NsInput's own error
 * rendering carries it. The field's 20px bottom slot is hidden
 * (`hide-bottom-space`) so the row is the design's 38, not 58; an error
 * message opens it when there is one.
 */
import { computed, ref, useId, watch } from 'vue'
import NsButton from '../NsButton/NsButton.vue'
import NsChip from '../NsChip/NsChip.vue'
import NsInput from '../NsInput/NsInput.vue'
import { useNsLocale } from '../../composables/useNsLocale'
import { fill } from '../../locale/fill'
import type { NsOrderSummaryDiscount, NsOrderSummaryLine, NsOrderSummaryTotal } from './types'

export interface NsOrderSummaryTotalsProps {
  /** Subtotal, taxes, shipping… in order. */
  lines: readonly NsOrderSummaryLine[]
  total: NsOrderSummaryTotal
  /** Applied codes, each a row with a removable chip. */
  discounts?: readonly NsOrderSummaryDiscount[]
  /** v-model:discountCode — the field's text. Omitted → kept here. */
  discountCode?: string
  /** Shown under the field; INFERRED, no frame shows it. */
  discountCodeError?: string
  /** `false` hides the code form — a receipt, or a shop without codes. */
  allowDiscountCode?: boolean
  /** "Total"; from the locale by default. */
  totalLabel?: string
  disable?: boolean
}

const props = withDefaults(defineProps<NsOrderSummaryTotalsProps>(), {
  discounts: () => [],
  discountCode: undefined,
  discountCodeError: undefined,
  allowDiscountCode: true,
  totalLabel: undefined,
  disable: false,
})

const emit = defineEmits<{
  'update:discountCode': [code: string]
  /** The trimmed code, on Apply or Enter. Never emitted empty. */
  apply: [code: string]
  remove: [discount: NsOrderSummaryDiscount]
}>()

const locale = useNsLocale()
const labelId = useId()
const inputId = useId()

const fallbackCode = ref('')
watch(
  () => props.discountCode,
  (next, previous) => {
    if (next == null && previous != null) fallbackCode.value = previous
  },
)
const code = computed(() => props.discountCode ?? fallbackCode.value)

function setCode(value: string | number | null) {
  const next = value == null ? '' : String(value)
  fallbackCode.value = next
  emit('update:discountCode', next)
}

function submit() {
  const trimmed = code.value.trim()
  if (trimmed) emit('apply', trimmed)
}
</script>

<style lang="scss" scoped>
.ns-order-summary-totals {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-2);
  color: var(--ns-color-text-primary);

  &__lines {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
    margin: 0;
  }

  &__line {
    display: flex;
    align-items: center;
    gap: var(--ns-space-5);
  }

  &__label {
    flex: 0 0 auto;
  }

  // The label column is 100 wide where a detail follows it (2470:232420's
  // Taxes header); a plain line needs no column, its amount is at the right.
  &__line--detailed &__label {
    min-width: 100px;
  }

  &__value {
    display: flex;
    flex: 1 1 0;
    align-items: center;
    gap: var(--ns-space-5);
    min-width: 0;
    margin: 0;
  }

  &__detail {
    flex: 0 0 auto;
  }

  &__amount {
    flex: 0 0 auto;
    margin-left: auto;
    text-align: right;
  }

  // The code form: label | field (the width) | Apply, 20 then 8 between.
  &__code {
    display: flex;
    align-items: center;
    gap: var(--ns-space-5);
  }

  &__code-label {
    flex: 0 0 auto;
  }

  // Applied (2470:232373): the label keeps its width, invisible — the
  // field row sits 4 under the discount row, indented to the same column.
  &__code--applied {
    margin-top: calc(var(--ns-space-1) - var(--ns-space-2)); // 4 between, not 8
  }

  &__code--applied &__code-label {
    visibility: hidden;
  }

  &__code-input {
    flex: 1 1 0;
    min-width: 0;
    // Apply is 8 from the field, not the row's 20 (2470:232361).
    margin-right: calc(var(--ns-space-2) - var(--ns-space-5));
  }

  &__apply {
    flex: 0 0 auto;
  }

  // QChip's own 4px margin would push the chip off the label column.
  &__chip {
    margin: 0;
  }

  // The total (2353:28026): label at the top, the amount and its note
  // stacked at the right.
  &__total {
    align-items: flex-start;
  }

  &__total-value {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--ns-space-1);
    min-width: 0;
    margin: 0;
    text-align: right;
  }
}
</style>
