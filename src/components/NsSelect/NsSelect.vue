<template>
  <q-select
    ref="root"
    v-bind="attrsWithoutDisabled"
    :model-value="modelValue"
    :label="label"
    :options="options"
    :outlined="outlined"
    :dense="dense"
    :rules="rules"
    :multiple="multiple"
    :emit-value="emitValue"
    :map-options="mapOptions"
    :disable="resolvedDisable"
    class="ns-select"
    @update:model-value="$emit('update:modelValue', $event)"
    @popup-show="nameListbox"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsSelect — A styled select/dropdown wrapping Quasar's QSelect.
 *
 * Provides opinionated defaults: outlined style, rounded corners,
 * and Fixel font via design tokens.
 */

import type { ValidationRule } from 'quasar'

export type NsSelectOption = string | { label: string; value: unknown; [key: string]: unknown }

export interface NsSelectProps {
  /** Select label text */
  label?: string
  /** v-model value */
  modelValue?: unknown
  /** Dropdown options */
  options?: NsSelectOption[]
  /** Use outlined style */
  outlined?: boolean
  /** Use dense (compact) size */
  dense?: boolean
  /** Allow multiple selections */
  multiple?: boolean
  /** Emit only the value instead of the full option object */
  emitValue?: boolean
  /** Map values to labels when using emit-value */
  mapOptions?: boolean
  /** Validation rules — array of Quasar validation rules */
  rules?: ValidationRule[]
  /** Disable the select */
  disable?: boolean
}

const props = withDefaults(defineProps<NsSelectProps>(), {
  label: undefined,
  modelValue: undefined,
  options: () => [],
  outlined: true,
  dense: false,
  multiple: false,
  emitValue: false,
  mapOptions: false,
  rules: undefined,
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: unknown]
}>()

// Accepts the `disabled` spelling too — on a QSelect it would otherwise land
// on the wrapper div and leave the field fully editable. See useNsDisabled.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsSelect', () => props.disable)

const root = ref<{ $el?: HTMLElement } | null>(null)

/**
 * NAME THE LISTBOX (componentLibrary-2e7). QSelect names its combobox with
 * `label` but renders the popup's listbox with a role and an id and no name
 * — axe's aria-input-field-name, on every NsSelect on every page, found by
 * the gate while a story had a menu open. The combobox's `aria-controls`
 * is that listbox's id (QSelect.js: `${targetUid}_lb`, set only while the
 * popup shows), so on popup-show the listbox is looked up through it and
 * named as the combobox is. Set on the element rather than through a prop
 * because QSelect exposes none for it; the element persists while the
 * popup is open, so a virtual-scroll re-render keeps the attribute.
 */
async function nameListbox() {
  const name =
    props.label?.trim() || (attrsWithoutDisabled.value['aria-label'] as string | undefined)
  if (!name) return
  // popup-show fires as the menu opens; the listbox and the combobox's
  // aria-controls land on the next render.
  await nextTick()
  const combobox = root.value?.$el?.querySelector<HTMLElement>('[role="combobox"]')
  const listboxId = combobox?.getAttribute('aria-controls')
  if (!listboxId) return
  const listbox = document.getElementById(listboxId)
  if (listbox && !listbox.hasAttribute('aria-label') && !listbox.hasAttribute('aria-labelledby')) {
    listbox.setAttribute('aria-label', name)
  }
}
</script>

<style lang="sass" scoped>
.ns-select
  font-family: var(--ns-font-family-text)

  :deep(.q-field__label)
    font-family: var(--ns-font-family-text)

  :deep(.q-field__control)
    border-radius: var(--ns-radius-sm)
</style>
