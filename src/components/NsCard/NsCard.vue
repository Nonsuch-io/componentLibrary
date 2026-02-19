<template>
  <q-card
    v-bind="$attrs"
    class="ns-card"
    :class="{ 'ns-card--flat': flat }"
    :role="title || $slots.header ? 'region' : undefined"
    :aria-labelledby="title || $slots.header ? headerId : undefined"
  >
    <q-card-section v-if="title || $slots.header" :id="headerId" class="ns-card__header">
      <slot name="header">
        <div class="text-h6">{{ title }}</div>
        <div v-if="subtitle" class="text-subtitle2 text-grey">{{ subtitle }}</div>
      </slot>
    </q-card-section>

    <q-card-section>
      <slot />
    </q-card-section>

    <q-card-actions v-if="$slots.actions" align="right">
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { useId } from 'vue'
/**
 * NsCard — A styled card wrapping Quasar's QCard.
 *
 * Provides opinionated defaults: rounded corners via design tokens,
 * subtle shadow, and standard header/body/actions slot layout.
 */

export interface NsCardProps {
  /** Card title shown in the header section */
  title?: string
  /** Subtitle shown below the title */
  subtitle?: string
  /** Remove box-shadow for a flat appearance */
  flat?: boolean
}

withDefaults(defineProps<NsCardProps>(), {
  title: undefined,
  subtitle: undefined,
  flat: false,
})

const headerId = `ns-card-header-${useId()}`
</script>

<style lang="sass" scoped>
.ns-card
  border-radius: var(--ns-radius-lg)
  box-shadow: var(--ns-shadow-sm)
  font-family: var(--ns-font-family-text)
  transition: box-shadow var(--ns-duration-normal) var(--ns-easing-default)

  &:hover
    box-shadow: var(--ns-shadow-md)

  &--flat
    box-shadow: none

    &:hover
      box-shadow: none

.ns-card__header
  font-family: var(--ns-font-family-display)
</style>
