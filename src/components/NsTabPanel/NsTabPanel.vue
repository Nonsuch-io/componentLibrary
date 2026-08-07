<template>
  <q-tab-panel
    v-bind="attrsWithoutDisabled"
    :name="name"
    :disable="resolvedDisable"
    class="ns-tab-panel"
  >
    <slot />
  </q-tab-panel>
</template>

<script setup lang="ts">
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsTabPanel — A styled wrapper around Quasar's QTabPanel.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QTabPanel props and events are forwarded via $attrs.
 */
export interface NsTabPanelProps {
  /** Unique panel name (must match the tab's name) */
  name: string | number
  /** Disable the panel */
  disable?: boolean
}

const props = withDefaults(defineProps<NsTabPanelProps>(), {
  disable: false,
})

// Accepts the `disabled` spelling too — see useNsDisabled.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsTabPanel', () => props.disable)
</script>

<style lang="sass" scoped>
.ns-tab-panel
  font-family: var(--ns-font-family-text)
</style>
