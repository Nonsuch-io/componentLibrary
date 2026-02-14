<template>
  <q-avatar
    v-bind="$attrs"
    :size="size"
    :color="color"
    :text-color="textColor"
    :rounded="rounded"
    :square="square"
    class="ns-avatar"
  >
    <slot />
  </q-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * NsAvatar — A styled avatar wrapping Quasar's QAvatar.
 *
 * Provides Nonsuch size presets and token-based colours.
 */

export type NsAvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeMap: Record<NsAvatarSize, string> = {
  sm: '32px',
  md: '48px',
  lg: '64px',
  xl: '96px',
}

export interface NsAvatarProps {
  /** Avatar size preset */
  size?: NsAvatarSize
  /** Background colour */
  color?: string
  /** Text/icon colour */
  textColor?: string
  /** Apply rounded (circle) shape */
  rounded?: boolean
  /** Apply square shape */
  square?: boolean
}

const props = withDefaults(defineProps<NsAvatarProps>(), {
  size: 'md',
  color: 'primary',
  textColor: 'white',
  rounded: false,
  square: false,
})

const size = computed(() => sizeMap[props.size] ?? props.size)
</script>

<style lang="sass" scoped>
.ns-avatar
  font-family: var(--ns-font-family-text)
  font-weight: var(--ns-font-weight-medium)
</style>
