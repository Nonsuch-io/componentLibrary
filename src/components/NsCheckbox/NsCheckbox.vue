<template>
  <q-checkbox
    v-bind="attrsWithoutDisabled"
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
 * `toggle-indeterminate` MAKES QUASAR EMIT null, WHICH THIS COMPONENT'S EMIT TYPE
 * SAYS IT NEVER DOES.
 *
 * Found in review of PR #262, and it predates that PR: the attr is undeclared, so
 * it falls through $attrs untouched, and clicking then cycles false -> true ->
 * null. `defineEmits` promises `[value: boolean]`, so a consumer's typed handler
 * receives a value TypeScript told them was impossible — a type lie reachable
 * from a supported Quasar prop.
 *
 * Two halves, because either alone is insufficient:
 *   - the template coerces `$event ?? false`, so the DECLARED TYPE IS TRUE no
 *     matter what reaches it. A promise the code keeps rather than one the docs
 *     assert.
 *   - this warns, because silently coercing would turn their three-state cycle
 *     into a two-state one with no explanation — a quiet wrong answer, which is
 *     the failure class this repo keeps finding.
 *
 * NO `useInstead`. `indeterminate` is NOT an equivalent: theirs cycles the value
 * through a third state on CLICK, ours renders a partial state the PARENT owns
 * and never enters by itself. Naming it as a replacement would be the `round` ->
 * `iconOnly` mistake again, where a warning turned "something is off" into a
 * specific wrong instruction that people then followed.
 */
useNsAttrConflictWarning('NsCheckbox', [
  {
    attrs: ['toggle-indeterminate', 'toggleIndeterminate'],
    because:
      'This component emits a boolean, and "toggle-indeterminate" makes Quasar emit ' +
      'null on the third click — which is coerced to false here so the declared ' +
      'type holds. The partial state is set by the parent via the "indeterminate" ' +
      'prop, which is a display state rather than a value the checkbox cycles into.',
  },
])
</script>

<style lang="sass" scoped>
.ns-checkbox
  font-family: var(--ns-font-family-text)
</style>
