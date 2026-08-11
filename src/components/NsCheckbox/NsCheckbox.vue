<template>
  <q-checkbox
    v-bind="forwardedAttrs"
    :model-value="resolvedModelValue"
    :label="label"
    :color="color"
    :dense="dense"
    :disable="resolvedDisable"
    class="ns-checkbox"
    @update:model-value="$emit('update:modelValue', $event ?? false)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNsDisabled } from '../../composables/useNsDisabled'
import { useNsAttrConflictWarning } from '../../composables/useNsAttrConflictWarning'
/**
 * NsCheckbox — A styled checkbox wrapping Quasar's QCheckbox.
 *
 * Provides opinionated defaults: token-based colours and font styling.
 */

export interface NsCheckboxProps {
  /** Checkbox label text */
  label?: string
  /** v-model value */
  modelValue?: boolean
  /**
   * Render the PARTIAL state Figma specifies (Checked = false | true | partial).
   *
   * A separate prop rather than widening `modelValue` to `boolean | null`, which
   * was the obvious move and is the wrong one. Widening it also widens the emit,
   * and every consumer with a typed handler or a `Ref<boolean>` behind `v-model`
   * would stop type-checking — 12 call sites in butiq today, all `v-model`. The
   * partial state is a DISPLAY concern owned by the parent ("some of my children
   * are selected"), not a third value the checkbox itself can hold, so a boolean
   * `modelValue` was never the thing that needed to change.
   *
   * Clicking a partial checkbox emits `true`, which is the select-all behaviour
   * this exists for: partial -> click -> all.
   */
  indeterminate?: boolean
  /** Quasar colour name */
  color?: string
  /** Use dense (compact) size */
  dense?: boolean
  /** Disable the checkbox */
  disable?: boolean
}

const props = withDefaults(defineProps<NsCheckboxProps>(), {
  label: undefined,
  modelValue: false,
  indeterminate: false,
  color: 'primary',
  dense: false,
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

/**
 * Quasar renders the indeterminate state when the model value is neither `true`
 * nor `false` — `indeterminateValue` defaults to `null` (use-checkbox.js:32), and
 * `isIndeterminate` is `!isTrue && !isFalse` (:96). It then sets
 * `aria-checked="mixed"` itself (:142), which is the part that actually matters:
 * a screen reader announcing "checked" or "unchecked" for a partial selection is
 * being told something FALSE, and there is no visual cue to contradict it.
 *
 * So this maps our boolean-plus-flag API onto Quasar's tri-state model value
 * rather than reimplementing the state or the ARIA.
 */
const resolvedModelValue = computed(() => (props.indeterminate ? null : props.modelValue))

// Accepts the `disabled` spelling too — on a QCheckbox it would otherwise
// land on the wrapper div and leave the control fully live. See useNsDisabled.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsCheckbox', () => props.disable)

/**
 * ATTRS THAT WOULD MAKE THE MODEL NON-BOOLEAN ARE STRIPPED, NOT COERCED.
 *
 * QCheckbox is tri-state and value-configurable: `toggle-indeterminate` cycles
 * the model through `null`, and `true-value` / `false-value` /
 * `indeterminate-value` replace the emitted values outright. All four are
 * undeclared here, so they used to fall straight through `$attrs` while
 * `defineEmits` promised `[value: boolean]` — a type TypeScript guaranteed and
 * the runtime broke.
 *
 * COERCING WAS MY FIRST FIX AND IT WAS WORSE THAN THE BUG. Emitting
 * `$event ?? false` kept the declared type true and BRICKED THE CONTROL: with
 * `toggle-indeterminate`, Quasar computes `null` as the next value from false,
 * the coercion turns it back into false, the model never changes and the
 * checkbox stops responding to clicks entirely. Measured over four clicks:
 * [false, false, false, false]. In production the warning below is compiled out,
 * so the consumer would have got a silently dead checkbox — strictly worse than
 * the type lie it replaced, and invisible to every test I had written.
 *
 * Stripping keeps the control WORKING as the two-state toggle this component
 * declares itself to be, and the warning says what was ignored. The `?? false`
 * on the emit stays as belt-and-braces for any path this list has not
 * anticipated — the list is a deny-list, and this repo has been defeated by
 * deny-lists twice.
 */
const TRI_STATE_ATTRS = [
  'toggle-indeterminate',
  'toggleIndeterminate',
  'true-value',
  'trueValue',
  'false-value',
  'falseValue',
  'indeterminate-value',
  'indeterminateValue',
] as const

const forwardedAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrsWithoutDisabled.value).filter(
      ([key]) => !TRI_STATE_ATTRS.includes(key as (typeof TRI_STATE_ATTRS)[number]),
    ),
  ),
)

useNsAttrConflictWarning('NsCheckbox', [
  {
    attrs: ['toggle-indeterminate', 'toggleIndeterminate'],
    kind: 'behaviour',
    because:
      'It has been IGNORED: it makes Quasar cycle the model through null, and this ' +
      'component emits a boolean. The partial state is set by the parent via the ' +
      '"indeterminate" prop, which is a display state rather than a value the ' +
      'checkbox cycles into on click.',
  },
  {
    attrs: ['true-value', 'trueValue', 'false-value', 'falseValue'],
    kind: 'behaviour',
    because:
      'It has been IGNORED: it replaces the emitted values, and this component ' +
      'declares it emits a boolean. Map the boolean to your own values in the ' +
      'handler instead.',
  },
  {
    attrs: ['indeterminate-value', 'indeterminateValue'],
    kind: 'behaviour',
    because:
      'It has been IGNORED: this component reaches the partial state through the ' +
      '"indeterminate" prop and never emits an indeterminate value.',
  },
])
</script>

<style lang="sass" scoped>
.ns-checkbox
  font-family: var(--ns-font-family-text)
</style>
