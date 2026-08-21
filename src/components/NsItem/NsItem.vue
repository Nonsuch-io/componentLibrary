<template>
  <!--
    NO role HERE. QItem sets it correctly and CONDITIONALLY (QItem.js:146-150):
    plain -> listitem, clickable -> button, link -> none so the native <a> role
    stands. Hardcoding listitem demoted every clickable item to a static one —
    focusable, Enter-activatable, announced as "list item" — and axe does NOT
    flag a focusable listitem, so the gate could not see it. Caught in review of
    componentLibrary-057; the axe win came entirely from the story fixes.
  -->
  <q-item v-bind="attrsWithoutDisabled" :disable="resolvedDisable" class="ns-item">
    <slot />
  </q-item>
</template>

<script setup lang="ts">
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsItem — A styled wrapper around Quasar's QItem.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QItem props and events are forwarded via $attrs.
 */
export interface NsItemProps {
  /** Put the item in disabled mode (Quasar spells it `disable`, not `disabled`) */
  disable?: boolean
}

const props = withDefaults(defineProps<NsItemProps>(), {
  disable: false,
})

// Accepts the `disabled` spelling too — see useNsDisabled.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsItem', () => props.disable)
</script>

<style lang="sass" scoped>
.ns-item
  font-family: var(--ns-font-family-text)
</style>
