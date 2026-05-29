<template>
  <section class="ns-expect-section">
    <div class="ns-expect-section__eyebrow">
      <slot name="eyebrow" />
    </div>
    <div class="ns-expect-section__content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.ns-expect-section {
  display: flex;
  align-items: center;
  gap: 150px;
  width: 100%;
  padding: var(--ns-space-10) var(--ns-space-12);
  background: var(--ns-color-text-primary);
  overflow: hidden;

  &__eyebrow {
    flex: 0 0 324px;
  }

  &__content {
    flex: 1;
    min-width: 0;
  }
}
</style>
