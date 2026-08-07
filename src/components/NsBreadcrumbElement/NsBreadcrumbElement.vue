<template>
  <q-breadcrumbs-el v-bind="$attrs" :disable="resolvedDisable" class="ns-breadcrumb-element">
    <slot />
  </q-breadcrumbs-el>
</template>

<script setup lang="ts">
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsBreadcrumbElement — A styled wrapper around Quasar's QBreadcrumbsEl.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QBreadcrumbsEl props and events are forwarded via $attrs.
 */
export interface NsBreadcrumbElementProps {
  /** Disable the breadcrumb element */
  disable?: boolean
}

const props = withDefaults(defineProps<NsBreadcrumbElementProps>(), {
  disable: false,
})

// Accepts the `disabled` spelling too — see useNsDisabled.
const resolvedDisable = useNsDisabled('NsBreadcrumbElement', () => props.disable)
</script>

<style lang="sass" scoped>
.ns-breadcrumb-element
  font-family: var(--ns-font-family-text)
</style>
