<template>
  <q-menu v-bind="$attrs" class="ns-menu">
    <slot />
  </q-menu>
</template>

<script setup lang="ts">
/**
 * NsMenu — A styled wrapper around Quasar's QMenu.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QMenu props and events are forwarded via $attrs.
 *
 * NsMenu IS DELIBERATELY ROLELESS: the rendered popup carries no ARIA role
 * of its own, so a screen reader announces it as plain content, not a menu.
 * MEASURED on quasar@2.25.0 (QMenu.js:516): Quasar itself stopped setting
 * role="menu" here, because a popup hosts arbitrary content while
 * role="menu" only permits menuitem* children — the same argument as
 * componentLibrary-cfo makes about our own NsNavSidebar. A consumer that
 * needs real menu semantics must pass `role` through fall-through attrs
 * AND own roving focus / arrow-key navigation themselves; NsMenu does
 * neither. See componentLibrary-nb7.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsMenuProps {}

defineProps<NsMenuProps>()
</script>

<style lang="sass" scoped>
.ns-menu
  font-family: var(--ns-font-family-text)
</style>
