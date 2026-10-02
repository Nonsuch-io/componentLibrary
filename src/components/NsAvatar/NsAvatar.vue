<template>
  <div
    v-bind="$attrs"
    :class="['ns-avatar', `ns-avatar--${size}`]"
    :role="ariaLabel ? 'img' : undefined"
    :aria-label="ariaLabel"
    :aria-hidden="ariaLabel ? undefined : 'true'"
  >
    <img v-if="src" :src="src" :alt="alt ?? ariaLabel ?? ''" class="ns-avatar__image" />
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

export type NsAvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface NsAvatarProps {
  /** Image URL — when provided shows the photo; omit for initials state */
  src?: string
  /** Alt text for the image */
  alt?: string
  /** Size preset */
  size?: NsAvatarSize
  /** Accessible label — omit for decorative avatars */
  ariaLabel?: string
}

withDefaults(defineProps<NsAvatarProps>(), {
  src: undefined,
  alt: undefined,
  size: 'md',
  ariaLabel: undefined,
})
</script>

<style lang="scss" scoped>
// ---- Base ----
.ns-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ns-radius-full);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--ns-color-bg-surface-alt);
  color: var(--ns-color-text-secondary);
  font-family: var(--ns-font-family-display);
  font-weight: var(--ns-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  user-select: none;
}

// ---- Sizes ----
.ns-avatar--sm {
  width: 32px;
  height: 32px;
  font-size: 12px;
}

.ns-avatar--md {
  width: 48px;
  height: 48px;
  font-size: 16px;
}

.ns-avatar--lg {
  width: 64px;
  height: 64px;
  font-size: 20px;
}

.ns-avatar--xl {
  width: 96px;
  height: 96px;
  font-size: 32px;
}

// ---- Image ----
.ns-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
