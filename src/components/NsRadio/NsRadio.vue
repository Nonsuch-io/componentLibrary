<template>
  <q-radio
    v-bind="attrsWithoutDisabled"
    :model-value="modelValue"
    :val="val"
    :label="label"
    :disable="resolvedDisable"
    class="ns-radio"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsRadio — A single styled radio wrapping Quasar's QRadio.
 *
 * For a full, accessible radio GROUP (shared `name`, one tab stop, arrow-key
 * navigation, group label — see componentLibrary-zux), use NsRadioButtons.
 * NsRadio is for consumers composing their own custom layout around
 * individual radios; on its own it does not add group semantics — the same
 * gap Quasar's bare QRadio has.
 *
 * NOT IMPLEMENTED, DELIBERATELY: Figma's "Associated Fields" variant, where
 * a selected radio reveals dependent form fields beneath it. Modelling that
 * changes the API (does the radio or the group own the revealed content?)
 * and needs a design decision first — see componentLibrary-zux. Compose
 * revealed content around NsRadio yourself in the meantime.
 */

export interface NsRadioProps {
  /** v-model value, shared across a group of radios */
  modelValue?: unknown
  /** This radio's own value */
  val?: unknown
  /** Radio label text */
  label?: string
  /** Disable this radio */
  disable?: boolean
}

const props = withDefaults(defineProps<NsRadioProps>(), {
  modelValue: undefined,
  val: undefined,
  label: undefined,
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: unknown]
}>()

// Accepts the `disabled` spelling too — on a QRadio it would otherwise land
// on the wrapper div and leave the control fully live. See useNsDisabled.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsRadio', () => props.disable)
</script>

<style lang="sass" scoped>
.ns-radio
  font-family: var(--ns-font-family-text)
</style>
