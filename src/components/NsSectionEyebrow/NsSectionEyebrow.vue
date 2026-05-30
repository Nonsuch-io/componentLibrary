<template>
  <div class="ns-section-eyebrow">
    <div :class="['ns-section-eyebrow__label', `ns-section-eyebrow__label--${labelColor}`]">
      <slot name="label" />
    </div>
    <div class="ns-section-eyebrow__heading-row">
      <div class="ns-section-eyebrow__heading">
        <slot name="heading" />
      </div>
      <div v-if="$slots.icon" class="ns-section-eyebrow__icon">
        <slot name="icon" />
      </div>
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
    font-size: var(--ns-font-size-xl);
    font-weight: 400;
    line-height: 1.1;
    text-transform: uppercase;

    @media (min-width: 1024px) {
      font-size: 1.75rem;
    }

    &--brand {
      color: var(--ns-color-text-brand);
    }

    &--primary {
      color: var(--ns-color-text-primary);
    }
  }

  &__heading-row {
    display: flex;
    align-items: center;
    gap: var(--ns-space-3);

    @media (min-width: 1024px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
    }
  }

  &__heading {
    padding: 10px;
    font-family: var(--ns-font-family-text);
    font-size: 2rem;
    font-weight: var(--ns-font-weight-semibold);
    line-height: 1.15;
    color: var(--ns-color-text-inverse);

    @media (min-width: 1024px) {
      font-family: var(--ns-font-family-display);
      font-size: 5rem;
      font-weight: 600;
      line-height: 1.1;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;

    :deep(img) {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    @media (min-width: 1024px) {
      width: auto;
      height: 163px;

      :deep(img) {
        width: auto;
        height: 100%;
      }
    }
  }
}
</style>
