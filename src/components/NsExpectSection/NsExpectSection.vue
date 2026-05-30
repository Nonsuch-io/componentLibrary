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
  flex-direction: column;
  gap: var(--ns-space-6);
  width: 100%;
  padding: var(--ns-space-6) var(--ns-space-4);
  background: var(--ns-color-bg-dark);
  overflow: hidden;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: center;
    gap: var(--ns-space-16);
    padding: var(--ns-space-10) var(--ns-space-12);
  }

  &__eyebrow {
    @media (min-width: 1024px) {
      flex: 0 0 410px;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }
}
</style>
