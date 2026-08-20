<template>
  <div class="ns-radio-buttons" v-bind="attrsWithoutDisabled">
    <div v-if="label" :id="labelId" class="ns-radio-buttons__label">{{ label }}</div>
    <div
      ref="groupRef"
      class="ns-radio-buttons__group"
      :class="{ 'ns-radio-buttons__group--horizontal': orientation === 'horizontal' }"
      role="radiogroup"
      :aria-labelledby="label ? labelId : undefined"
      :aria-label="!label && ariaLabel ? ariaLabel : undefined"
    >
      <q-radio
        v-for="(option, index) in options"
        :key="String(option.value)"
        :model-value="modelValue"
        :val="option.value"
        :label="option.label"
        :name="resolvedName"
        :disable="resolvedDisable || optionDisabled(option)"
        :tabindex="index === rovingIndex ? 0 : -1"
        class="ns-radio-buttons__option"
        @update:model-value="handleSelect"
        @keydown="handleKeydown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue'
import { useNsDisabled } from '../../composables/useNsDisabled'

declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * NsRadioButtons — an accessible radio GROUP, rendering QRadio directly rather
 * than QOptionGroup.
 *
 * Measured in Chromium, QOptionGroup gives the group NO accessible name, NO
 * single tab stop (three options measured as three stops) and NO arrow-key
 * handling. This wrapper owns tabindex so it can add what WAI-ARIA's radiogroup
 * pattern requires:
 *
 *  1. an accessible name — the rendered label via aria-labelledby, or aria-label
 *  2. a shared `name`, auto-generated per instance so groups never collide
 *  3. roving tabindex + arrow keys, wrapping, where moving also SELECTS (unlike
 *     tabs). Disabled options skipped; Home/End jump to first/last.
 *
 * Figma's "Associated Fields" variant is deliberately absent — it needs a design
 * decision first (does the radio or the GROUP own the revealed content?) and
 * nothing here reserves an API for it. Story: componentLibrary-zux.
 */

export interface NsRadioOption {
  /** Visible label for this option */
  label: string
  /** Value emitted when this option is selected */
  value: unknown
  /** Disable this individual option, independent of the group's `disable` */
  disable?: boolean
  /**
   * Accepted as an alias for `disable`, with a dev warning.
   *
   * The group already accepts both spellings via useNsDisabled, but a per-option
   * `{ disabled: true }` was silently ignored — the option rendered fully live,
   * keyboard-reachable and selectable. That is componentLibrary-ob8 reintroduced
   * one level down, and it evades TypeScript entirely: excess-property checking
   * only fires on object literals, so `plans.map(p => ({ ..., disabled: !p.ok }))`
   * type-checks clean while every unavailable option stays selectable.
   */
  disabled?: boolean
}

/** True when an option is disabled by either spelling. */
function optionDisabled(option: NsRadioOption): boolean {
  return Boolean(option.disable ?? option.disabled)
}

export type NsRadioButtonsOrientation = 'vertical' | 'horizontal'

export interface NsRadioButtonsProps {
  /** v-model value — the selected option's `value` */
  modelValue?: unknown
  /** Radio options */
  options?: NsRadioOption[]
  /** Visible group label, rendered and linked via aria-labelledby */
  label?: string
  /**
   * Accessible-name-only fallback, applied as aria-label when no visible
   * `label` is given. A radiogroup with neither is the default accessibility
   * failure this component exists to close — supply one or the other.
   */
  ariaLabel?: string
  /** Layout direction */
  orientation?: NsRadioButtonsOrientation
  /** Disable every option in the group */
  disable?: boolean
  /** Shared `name` for the native radio inputs. Auto-generated when omitted. */
  name?: string
}

const props = withDefaults(defineProps<NsRadioButtonsProps>(), {
  modelValue: undefined,
  options: () => [],
  label: undefined,
  ariaLabel: undefined,
  orientation: 'vertical',
  disable: false,
  name: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

// Accepts the `disabled` spelling too — see useNsDisabled. inheritAttrs: false
// is REQUIRED: Vue applies $attrs to the root element automatically IN
// ADDITION to any explicit v-bind, so without this the raw `disabled`
// attribute reaches the DOM regardless of the filtering below.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled(
  'NsRadioButtons',
  () => props.disable,
)

const generatedLabelId = `ns-radio-buttons-label-${useId()}`
const generatedName = `ns-radio-buttons-${useId()}`

const labelId = computed(() => generatedLabelId)
const resolvedName = computed(() => props.name ?? generatedName)

if (
  (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') &&
  !props.label &&
  !props.ariaLabel
) {
  console.warn(
    '[NsRadioButtons] no accessible name: pass `label` (rendered, and linked via ' +
      'aria-labelledby) or `ariaLabel` (aria-label only). A radiogroup with neither ' +
      'announces as "radio group" with no indication of what is being chosen. ' +
      '(componentLibrary-zux)',
  )
}

/** Index of the option matching `modelValue`, or -1 when nothing matches. */
const selectedIndex = computed(() =>
  props.options.findIndex((option) => option.value === props.modelValue),
)

/** Index of the first option that is not disabled, individually or by the group. */
const firstEnabledIndex = computed(() =>
  props.options.findIndex((option) => !resolvedDisable.value && !optionDisabled(option)),
)

/**
 * The ONE roving tab stop. Prefers the selected option, but never lands on a
 * disabled one — falls back to the first enabled option instead, matching
 * the group's own `tabindex` if the selection is (or becomes) disabled.
 */
const rovingIndex = computed(() => {
  const selected = selectedIndex.value
  if (selected >= 0 && !resolvedDisable.value && !props.options[selected]?.disable) {
    return selected
  }
  return firstEnabledIndex.value
})

function handleSelect(value: unknown) {
  emit('update:modelValue', value)
}

/** Indices of every option that can currently receive focus/selection. */
function enabledIndices(): number[] {
  if (resolvedDisable.value) return []
  const indices: number[] = []
  props.options.forEach((option, index) => {
    if (!optionDisabled(option)) indices.push(index)
  })
  return indices
}

const NEXT_KEYS = new Set(['ArrowDown', 'ArrowRight'])
const PREV_KEYS = new Set(['ArrowUp', 'ArrowLeft'])

const groupRef = ref<HTMLElement | null>(null)

function handleKeydown(event: KeyboardEvent) {
  if (resolvedDisable.value) return

  const indices = enabledIndices()
  if (indices.length === 0) return

  // DERIVE POSITION FROM THE FOCUSED ELEMENT, NOT FROM SELECTION.
  //
  // rovingIndex is derived from modelValue, so using it here assumes the parent
  // APPLIES every emit. When it does not — validation rejects the change, or
  // state updates asynchronously — the two diverge and traversal stalls. Review
  // measured it: with a non-applying parent, three ArrowDown presses emitted
  // ["b","b","b"], DOM focus stuck on index 1, and option C was unreachable by
  // keyboard while focus sat on a tabindex="-1" element that was not the tab
  // stop. The event target is the only thing that knows where the user is.
  const focusedIndex = groupRef.value
    ? Array.prototype.indexOf.call(groupRef.value.children, event.currentTarget as Node)
    : -1
  const anchorIndex = focusedIndex !== -1 ? focusedIndex : rovingIndex.value
  const currentPos = indices.indexOf(anchorIndex)
  const safeCurrentPos = currentPos === -1 ? 0 : currentPos

  let targetIndex: number
  if (NEXT_KEYS.has(event.key)) {
    targetIndex = indices[(safeCurrentPos + 1) % indices.length]
  } else if (PREV_KEYS.has(event.key)) {
    targetIndex = indices[(safeCurrentPos - 1 + indices.length) % indices.length]
  } else if (event.key === 'Home') {
    targetIndex = indices[0]
  } else if (event.key === 'End') {
    targetIndex = indices[indices.length - 1]
  } else {
    return
  }

  event.preventDefault()

  const targetOption = props.options[targetIndex]
  emit('update:modelValue', targetOption.value)

  // The radiogroup pattern moves DOM focus along with selection — QRadio's
  // own root divs are the direct children of groupRef (verified: each QRadio
  // instance renders a single root div with no extra wrapper, unlike
  // QOptionGroup which wraps every option in its own div), so they line up
  // 1:1 with `options` by index once Vue has re-rendered the new tabindex.
  void nextTick(() => {
    const target = groupRef.value?.children[targetIndex] as HTMLElement | undefined
    target?.focus()
  })
}
</script>

<style lang="sass" scoped>
.ns-radio-buttons
  font-family: var(--ns-font-family-text)

  &__label
    font-weight: var(--ns-font-weight-medium)
    margin-bottom: var(--ns-space-2)

  &__group
    display: flex
    flex-direction: column
    gap: var(--ns-space-2)

    &--horizontal
      flex-direction: row
      flex-wrap: wrap
      gap: var(--ns-space-4)
</style>
