<template>
  <q-tab v-bind="qTabAttrs" :disable="resolvedDisable" class="ns-tab">
    <!-- When icon is a slot, render it inside a q-tab__icon wrapper -->
    <div v-if="$slots.icon" class="q-tab__icon">
      <slot name="icon" />
    </div>
    <!-- When icon is a Vue Component, render it inside a q-tab__icon wrapper -->
    <div v-else-if="icon !== undefined && typeof icon !== 'string'" class="q-tab__icon">
      <component :is="icon" :size="ICON_SIZE" weight="regular" />
    </div>
    <slot />
  </q-tab>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component } from 'vue'
import { useNsDisabled } from '../../composables/useNsDisabled'

/**
 * NsTab — A styled wrapper around Quasar's QTab.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QTab props and events are forwarded via $attrs, with the exception of
 * `icon` which is intercepted to support Vue components (e.g. Phosphor icons)
 * in addition to Quasar/Material icon name strings.
 *
 * Icon resolution order:
 *   1. `#icon` slot — caller-provided slot content (rendered in a q-tab__icon wrapper)
 *   2. `icon` prop as Component — rendered with <component :is> at 24px
 *   3. `icon` prop as string — forwarded to q-tab's native :icon prop
 *
 * Note: Quasar's QTab does not expose an icon slot; it only renders icons via
 * its `icon` prop (string → QIcon). For Component icons NsTab renders the icon
 * in the default slot with the correct `q-tab__icon` wrapper class so that
 * Quasar's CSS positions and sizes it identically to a native string icon.
 */
// 24px: standalone tab icon (matches ICON_SIZE_BUTTON from NsAppShell)
const ICON_SIZE = 24

export interface NsTabProps {
  /** Vue component (e.g. a Phosphor icon) or a Quasar/Material icon name string */
  icon?: string | Component
  /** Disable the tab */
  disable?: boolean
}

const props = withDefaults(defineProps<NsTabProps>(), {
  icon: undefined,
  disable: false,
})
const attrs = useAttrs()

/**
 * Merge attrs with a string icon only — when icon is a Component (or handled
 * via slot) we render it ourselves in the default slot, so we must NOT pass it
 * to q-tab (which calls `.match()` on the value and would throw at runtime).
 */
const qTabAttrs = computed(() => {
  const { icon: _icon, ...rest } = attrs as Record<string, unknown>
  if (typeof props.icon === 'string') {
    return { ...rest, icon: props.icon }
  }
  // Component or undefined — don't forward icon to q-tab
  return rest
})

// Accepts the `disabled` spelling too — see useNsDisabled.
const resolvedDisable = useNsDisabled('NsTab', () => props.disable)
</script>

<style lang="sass" scoped>
.ns-tab
  font-family: var(--ns-font-family-text)
</style>
