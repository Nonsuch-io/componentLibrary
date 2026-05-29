<template>
  <div class="ns-section-eyebrow">
    <div :class="['ns-section-eyebrow__label', `ns-section-eyebrow__label--${labelColor}`]">
      <slot name="label" />
    </div>
    <div class="ns-section-eyebrow__heading">
      <slot name="heading" />
    </div>
    <div v-if="$slots.icon" class="ns-section-eyebrow__icon">
      <slot name="icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface NsSectionEyebrowProps {
  labelColor?: 'brand' | 'primary'
}

withDefaults(defineProps<NsSectionEyebrowProps>(), {
  labelColor: 'brand',
})
</script>

<style lang="scss" scoped>
.ns-section-eyebrow {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &__label {
    padding: 10px;
    font-family: var(--ns-font-family-text);
    font-size: 1.75rem;
    font-weight: 400;
    line-height: 1.1;
    text-transform: uppercase;

    &--brand {
      color: var(--ns-color-text-brand);
    }

    &--primary {
      color: var(--ns-color-text-primary);
    }
  }

  &__heading {
    padding: 10px;
    font-family: var(--ns-font-family-display);
    font-size: 5rem;
    font-weight: 600;
    line-height: 1.1;
    color: var(--ns-color-text-inverse);
  }

  &__icon {
    display: flex;
    align-items: center;
    height: 163px;
  }
}
</style>
