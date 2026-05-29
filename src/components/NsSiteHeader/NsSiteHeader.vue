<template>
  <header class="ns-site-header">
    <div class="ns-site-header__logo">
      <slot name="logo" />
    </div>
    <nav class="ns-site-header__nav">
      <slot name="nav" />
    </nav>
    <div v-if="$slots.actions" class="ns-site-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.ns-site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 66px;
  padding: 16px var(--ns-space-4);
  background: var(--ns-color-bg-brand);

  @media (min-width: 1024px) {
    padding: 16px var(--ns-space-6);
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 0;
    flex-shrink: 0;
  }

  &__nav {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: var(--ns-space-10);
    font-family: var(--ns-font-family-text);
    text-transform: uppercase;
    color: var(--ns-color-text-inverse);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--ns-space-4);
    flex-shrink: 0;
  }
}
</style>
